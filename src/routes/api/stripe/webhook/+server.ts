import { json, type RequestEvent } from '@sveltejs/kit';
import { stripe } from '$lib/server/stripe';
import { prisma } from '$lib/server/prisma';
import { env } from '$env/dynamic/private';
import type Stripe from 'stripe';

// Le webhook est optionnel - on peut aussi gérer le paiement depuis la page de succès
const STRIPE_WEBHOOK_SECRET = env.STRIPE_WEBHOOK_SECRET;

export async function POST({ request }: RequestEvent) {
	// Le webhook est optionnel - si pas configuré, on retourne simplement OK
	if (!STRIPE_WEBHOOK_SECRET) {
		return json({ message: 'Webhook non configuré - le paiement sera vérifié depuis la page de succès' });
	}

	const body = await request.text();
	const signature = request.headers.get('stripe-signature');

	if (!signature) {
		return json({ error: 'Signature manquante' }, { status: 400 });
	}

	let event;

	try {
		event = stripe.webhooks.constructEvent(body, signature, STRIPE_WEBHOOK_SECRET);
	} catch (err: any) {
		console.error('Erreur de vérification du webhook Stripe:', err.message);
		return json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
	}

	try {
		// Gérer les différents types d'événements
		switch (event.type) {
			case 'checkout.session.completed': {
				const session = event.data.object as Stripe.Checkout.Session;

				// Mettre à jour le statut du paiement
				await prisma.payment.update({
					where: { stripeSession: session.id },
					data: { status: 'paid' }
				});

				// Récupérer les métadonnées de la session
				const userId = parseInt(session.metadata?.userId || '0');
				const planId = parseInt(session.metadata?.planId || '0');

				if (userId && planId) {
					// Récupérer l'utilisateur pour obtenir son bucketName
					const user = await prisma.user.findUnique({
						where: { id: userId },
						select: { bucketName: true }
					});

					if (!user || !user.bucketName) {
						console.error(`Utilisateur ${userId} ou bucketName introuvable`);
						break;
					}

					// Calculer la date de fin (1 mois à partir de maintenant)
					const endDate = new Date();
					endDate.setMonth(endDate.getMonth() + 1);

					// Mettre à jour ou créer l'abonnement
					await prisma.subscription.upsert({
						where: { userId },
						update: {
							planId,
							isActive: true,
							startDate: new Date(),
							endDate
						},
						create: {
							userId,
							planId,
							bucketName: user.bucketName,
							isActive: true,
							startDate: new Date(),
							endDate
						}
					});
				}
				break;
			}

			case 'checkout.session.async_payment_failed':
			case 'checkout.session.async_payment_succeeded': {
				const session = event.data.object as Stripe.Checkout.Session;
				const status = event.type === 'checkout.session.async_payment_succeeded' ? 'paid' : 'failed';

				await prisma.payment.update({
					where: { stripeSession: session.id },
					data: { status }
				});
				break;
			}

			case 'customer.subscription.deleted': {
				const subscription = event.data.object as Stripe.Subscription;
				// Trouver le paiement associé et mettre à jour l'abonnement
				const payment = await prisma.payment.findFirst({
					where: {
						stripeSession: subscription.id
					}
				});

				if (payment) {
					await prisma.subscription.update({
						where: { userId: payment.userId },
						data: { isActive: false }
					});
				}
				break;
			}

			default:
				console.log(`Événement non géré: ${event.type}`);
		}

		return json({ received: true });
	} catch (error) {
		console.error('Erreur lors du traitement du webhook:', error);
		return json({ error: 'Erreur lors du traitement du webhook' }, { status: 500 });
	}
}


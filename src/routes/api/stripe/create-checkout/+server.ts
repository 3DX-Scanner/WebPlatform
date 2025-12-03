import { json, type RequestEvent } from '@sveltejs/kit';
import { stripe } from '$lib/server/stripe';
import { prisma } from '$lib/server/prisma';
import { verifyJwtFromCookies } from '$lib/server/jwtVerify';

export async function POST({ request, cookies }: RequestEvent) {
	try {
		// Vérifier que Stripe est bien configuré
		if (!stripe) {
			console.error('Stripe n\'est pas initialisé');
			return json({ error: 'Configuration Stripe manquante' }, { status: 500 });
		}

		// Vérifier l'authentification
		const user = verifyJwtFromCookies(cookies);
		if (!user || !user.id) {
			return json({ error: 'Non authentifié' }, { status: 401 });
		}

		const { planId } = await request.json();

		if (!planId) {
			return json({ error: 'Plan ID requis' }, { status: 400 });
		}

		// Récupérer le plan depuis la base de données
		const plan = await prisma.subscriptionPlan.findUnique({
			where: { id: parseInt(planId) }
		});

		if (!plan) {
			return json({ error: 'Plan introuvable' }, { status: 404 });
		}

		// Ne pas permettre l'achat du plan gratuit
		if (plan.name === 'Free') {
			return json({ error: 'Le plan gratuit ne peut pas être acheté' }, { status: 400 });
		}

		// Récupérer l'utilisateur pour obtenir son email
		const userId = typeof user.id === 'string' ? parseInt(user.id) : user.id;
		const dbUser = await prisma.user.findUnique({
			where: { id: userId }
		});

		if (!dbUser) {
			return json({ error: 'Utilisateur introuvable' }, { status: 404 });
		}

		// Convertir le prix en centimes (Stripe utilise les centimes)
		const priceInCents = Math.round(Number(plan.price) * 100);

		// Récupérer l'origine pour les URLs de redirection
		const origin = request.headers.get('origin') || request.headers.get('host') || 'http://localhost:5173';
		const baseUrl = origin.startsWith('http') ? origin : `https://${origin}`;

		console.log('Création de la session Stripe:', {
			planId: plan.id,
			planName: plan.name,
			priceInCents,
			userId,
			origin: baseUrl
		});

		// Créer la session de checkout Stripe
		const session = await stripe.checkout.sessions.create({
			payment_method_types: ['card'],
			line_items: [
				{
					price_data: {
						currency: 'eur',
						product_data: {
							name: `Abonnement ${plan.name}`,
							description: `Plan ${plan.name} - ${plan.storageLimit / 1024} Go de stockage`
						},
						recurring: {
							interval: 'month'
						},
						unit_amount: priceInCents
					},
					quantity: 1
				}
			],
			mode: 'subscription',
			success_url: `${baseUrl}/subscription?session_id={CHECKOUT_SESSION_ID}&success=true`,
			cancel_url: `${baseUrl}/subscription?canceled=true`,
			customer_email: dbUser.email,
			metadata: {
				userId: user.id.toString(),
				planId: plan.id.toString(),
				planName: plan.name
			}
		});

		console.log('Session Stripe créée:', {
			sessionId: session.id,
			url: session.url,
			paymentStatus: session.payment_status
		});

		// Créer un enregistrement Payment en base de données avec le statut "pending"
		await (prisma as any).payment.create({
			data: {
				userId: userId,
				stripeSession: session.id,
				amount: priceInCents,
				status: 'pending'
			}
		});

		if (!session.url) {
			console.error('Stripe n\'a pas retourné d\'URL pour la session:', session.id);
			return json(
				{ error: 'Erreur: URL de paiement non disponible' },
				{ status: 500 }
			);
		}

		return json({ sessionId: session.id, url: session.url });
	} catch (error) {
		console.error('Erreur lors de la création de la session Stripe:', error);
		return json(
			{ error: 'Erreur lors de la création de la session de paiement' },
			{ status: 500 }
		);
	}
}


import type { PageServerLoad } from './$types';
import { prisma } from '$lib/server/prisma';
import { stripe } from '$lib/server/stripe';

export const load: PageServerLoad = async ({ url, locals }) => {
	// Vérifier si l'utilisateur revient d'un paiement réussi
	const sessionId = url.searchParams.get('session_id');
	const success = url.searchParams.get('success');

	if (sessionId && success === 'true') {
		try {
			// Récupérer la session Stripe pour vérifier son statut
			const session = await stripe.checkout.sessions.retrieve(sessionId);

			if (session.payment_status === 'paid') {
				// Récupérer les métadonnées de la session
				const userId = parseInt(session.metadata?.userId || '0');
				const planId = parseInt(session.metadata?.planId || '0');

				if (userId && planId) {
					// Vérifier si le paiement a déjà été traité
					const existingPayment = await (prisma as any).payment.findUnique({
						where: { stripeSession: sessionId }
					});

					if (existingPayment && existingPayment.status === 'pending') {
						// Mettre à jour le statut du paiement
						await (prisma as any).payment.update({
							where: { stripeSession: sessionId },
							data: { status: 'paid' }
						});

						// Récupérer l'utilisateur pour obtenir son bucketName
						const user = await prisma.user.findUnique({
							where: { id: userId },
							select: { bucketName: true }
						});

						if (user && user.bucketName) {
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
					}
				}
			}
		} catch (error) {
			console.error('Erreur lors de la vérification de la session Stripe:', error);
		}
	}

	try {
		// Récupérer l'abonnement actuel de l'utilisateur (si connecté)
		let currentSubscription = null;
		if (locals.user) {
			currentSubscription = await prisma.subscription.findUnique({
				where: { userId: locals.user.id },
				include: {
					plan: true
				}
			});
		}

		// Récupérer tous les plans d'abonnement depuis la base de données
		const subscriptionPlans = await prisma.subscriptionPlan.findMany({
			orderBy: {
				id: 'asc'
			}
		});

		// Récupérer toutes les features uniques pour construire le tableau comparatif
		const allFeatures = new Set<string>();
		subscriptionPlans.forEach(plan => {
			plan.features.forEach(feature => allFeatures.add(feature));
		});

		// Construire le tableau comparatif des features
		const comparisonFeatures = Array.from(allFeatures).map(feature => {
			const featureData: {
				feature: string;
				free: boolean | string;
				pro: boolean | string;
				enterprise: boolean | string;
			} = {
				feature,
				free: false,
				pro: false,
				enterprise: false
			};

			subscriptionPlans.forEach(plan => {
				const hasFeature = plan.features.includes(feature);
				if (plan.name === 'Free') {
					featureData.free = hasFeature;
				} else if (plan.name === 'Pro') {
					featureData.pro = hasFeature;
				} else if (plan.name === 'Enterprise') {
					featureData.enterprise = hasFeature;
				}
			});

			return featureData;
		});

		// Ajouter la feature "Stockage cloud" avec les valeurs en Go
		const freePlan = subscriptionPlans.find(p => p.name === 'Free');
		const proPlan = subscriptionPlans.find(p => p.name === 'Pro');
		const enterprisePlan = subscriptionPlans.find(p => p.name === 'Enterprise');
		
		const storageFeature = {
			feature: 'Stockage cloud',
			free: `${(Number(freePlan?.storageLimit) || 0) / 1024} Go`,
			pro: `${(Number(proPlan?.storageLimit) || 0) / 1024} Go`,
			enterprise: `${(Number(enterprisePlan?.storageLimit) || 0) / 1024} Go`
		};

		// Insérer la feature stockage en premier
		comparisonFeatures.unshift(storageFeature);

		return {
			plans: subscriptionPlans.map(plan => ({
				id: plan.name.toLowerCase() as 'free' | 'pro' | 'enterprise',
				planId: plan.id.toString(),
				name: plan.name === 'Free' ? 'Gratuit' : plan.name,
				price: typeof plan.price === 'object' ? Number(plan.price) : Number(plan.price),
				storageLimit: Number(plan.storageLimit),
				features: plan.features,
				isCurrentPlan: currentSubscription?.isActive && currentSubscription.planId === plan.id
			})),
			comparisonFeatures,
			currentSubscription: currentSubscription ? {
				planId: currentSubscription.planId,
				planName: currentSubscription.plan.name,
				isActive: currentSubscription.isActive,
				startDate: currentSubscription.startDate.toISOString(),
				endDate: currentSubscription.endDate?.toISOString() || null
			} : null
		};
	} catch (error) {
		console.error('Erreur lors du chargement des plans:', error);
		return {
			plans: [],
			comparisonFeatures: []
		};
	}
};


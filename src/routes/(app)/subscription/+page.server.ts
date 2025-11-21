import type { PageServerLoad } from './$types';
import { prisma } from '$lib/server/prisma';

export const load: PageServerLoad = async () => {
	try {
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
				name: plan.name === 'Free' ? 'Gratuit' : plan.name,
				price: typeof plan.price === 'object' ? Number(plan.price) : Number(plan.price),
				storageLimit: Number(plan.storageLimit),
				features: plan.features
			})),
			comparisonFeatures
		};
	} catch (error) {
		console.error('Erreur lors du chargement des plans:', error);
		return {
			plans: [],
			comparisonFeatures: []
		};
	}
};


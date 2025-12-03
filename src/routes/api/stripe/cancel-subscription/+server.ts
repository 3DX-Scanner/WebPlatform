import { json, type RequestEvent } from '@sveltejs/kit';
import { prisma } from '$lib/server/prisma';
import { verifyJwtFromCookies } from '$lib/server/jwtVerify';

export async function POST({ cookies }: RequestEvent) {
	try {
		// Vérifier l'authentification
		const user = verifyJwtFromCookies(cookies);
		if (!user || !user.id) {
			return json({ error: 'Non authentifié' }, { status: 401 });
		}

		const userId = typeof user.id === 'string' ? parseInt(user.id) : user.id;

		// Récupérer l'abonnement actuel
		const subscription = await prisma.subscription.findUnique({
			where: { userId },
			include: {
				plan: true
			}
		});

		if (!subscription) {
			return json({ error: 'Aucun abonnement trouvé' }, { status: 404 });
		}

		if (!subscription.isActive) {
			return json({ error: 'L\'abonnement est déjà annulé' }, { status: 400 });
		}

		// Ne pas permettre l'annulation du plan gratuit
		if (subscription.plan.name === 'Free') {
			return json({ error: 'Le plan gratuit ne peut pas être annulé' }, { status: 400 });
		}

		// Désactiver l'abonnement (on garde les données pour l'historique)
		await prisma.subscription.update({
			where: { userId },
			data: {
				isActive: false,
				endDate: new Date() // Mettre la date de fin à maintenant
			}
		});

		// Optionnel : Si vous avez un subscription_id Stripe stocké, vous pouvez aussi annuler côté Stripe
		// Pour l'instant, on désactive juste en base de données
		// L'abonnement Stripe continuera jusqu'à la fin de la période payée

		return json({ 
			success: true, 
			message: 'Abonnement annulé avec succès. Vous conserverez l\'accès jusqu\'à la fin de la période payée.' 
		});
	} catch (error) {
		console.error('Erreur lors de l\'annulation de l\'abonnement:', error);
		return json(
			{ error: 'Erreur lors de l\'annulation de l\'abonnement' },
			{ status: 500 }
		);
	}
}


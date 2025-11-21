import type { PageServerLoad } from './$types';
import { redirect } from '@sveltejs/kit';
import { prisma } from '$lib/server/prisma';

export const load: PageServerLoad = async ({ locals }) => {
    if (!locals.user) {
        throw redirect(302, '/login');
    }
    
    const userFromDb = await prisma.user.findUnique({
        where: { id: locals.user.id },
        select: { id: true, email: true, username: true, password: true, createdAt: true }
    });
    
    if (!userFromDb) {
        throw redirect(302, '/login');
    }
    
    // Récupérer l'abonnement actuel de l'utilisateur
    const currentSubscription = await prisma.subscription.findUnique({
        where: { userId: locals.user.id },
        include: {
            plan: true
        }
    });
    
    // Récupérer tous les plans disponibles
    const subscriptionPlans = await prisma.subscriptionPlan.findMany({
        orderBy: { id: 'asc' }
    });
    
    return {
        user: {
            id: userFromDb.id,
            email: userFromDb.email,
            username: userFromDb.username,
            createdAt: userFromDb.createdAt.toISOString(),
            hasPassword: userFromDb.password !== '' 
        },
        currentSubscription: currentSubscription ? {
            planId: currentSubscription.planId,
            planName: currentSubscription.plan.name,
            isActive: currentSubscription.isActive,
            startDate: currentSubscription.startDate.toISOString(),
            endDate: currentSubscription.endDate?.toISOString() || null,
            storageLimit: Number(currentSubscription.plan.storageLimit)
        } : null,
        plans: subscriptionPlans.map(plan => ({
            id: plan.name.toLowerCase() as 'free' | 'pro' | 'enterprise',
            planId: plan.id.toString(),
            name: plan.name === 'Free' ? 'Gratuit' : plan.name,
            price: typeof plan.price === 'object' ? Number(plan.price) : Number(plan.price),
            storageLimit: Number(plan.storageLimit)
        }))
    };
};
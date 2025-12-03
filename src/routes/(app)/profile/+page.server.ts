import type { PageServerLoad } from './$types';
import { redirect } from '@sveltejs/kit';
import { prisma } from '$lib/server/prisma';
import { minioClient } from '$lib/server/minio';

async function calculateUserStats(userId: number, userBucketName: string, storageLimitMB: number) {
    try {
        const bucketExists = await minioClient.bucketExists(userBucketName);
        if (!bucketExists) {
            return {
                bucketName: userBucketName,
                totalModels: 0,
                storageUsedMB: 0,
                storageLimitMB: storageLimitMB,
                storageLimitGB: Math.round(storageLimitMB / 1024),
                storagePercentage: '0',
                likedModelsCount: 0
            };
        }

        const objectsStream = minioClient.listObjects(userBucketName, '', true);
        let totalSize = 0;
        let modelCount = 0;

        for await (const obj of objectsStream) {
            if (obj.size) {
                totalSize += obj.size;
                if (obj.name && /\.(glb|gltf|obj|fbx|dae|3ds|blend|max|maya|c4d|ply|stl)$/i.test(obj.name)) {
                    modelCount++;
                }
            }
        }

        const storageUsedMB = Math.round((totalSize / (1024 * 1024)) * 100) / 100;
        const storagePercentage = storageLimitMB > 0 ? Math.round((storageUsedMB / storageLimitMB) * 100 * 1000) / 1000 : 0;

        let likedModelsCount = 0;
        try {
            likedModelsCount = await prisma.model.count({
                where: { userId }
            });
        } catch (error) {
        }

        return {
            bucketName: userBucketName,
            totalModels: modelCount,
            storageUsedMB: storageUsedMB,
            storageLimitMB: storageLimitMB,
            storageLimitGB: Math.round(storageLimitMB / 1024),
            storagePercentage: storagePercentage.toString(),
            likedModelsCount: likedModelsCount
        };
    } catch (error) {
        return {
            bucketName: userBucketName,
            totalModels: 0,
            storageUsedMB: 0,
            storageLimitMB: storageLimitMB,
            storageLimitGB: Math.round(storageLimitMB / 1024),
            storagePercentage: '0',
            likedModelsCount: 0
        };
    }
}

export const load: PageServerLoad = async ({ locals, cookies }) => {
    if (!locals.user) {
        throw redirect(302, '/login');
    }

    const userFromDb = await prisma.user.findUnique({
        where: { id: locals.user.id },
        select: { id: true, email: true, username: true, password: true, createdAt: true }
    });

    if (!userFromDb) {
        cookies.delete('jwt', { path: '/' });
        throw redirect(302, '/login');
    }
    
    const currentSubscription = await prisma.subscription.findUnique({
        where: { userId: locals.user.id },
        include: {
            plan: true
        }
    });
    
    const subscriptionPlans = await prisma.subscriptionPlan.findMany({
        orderBy: { id: 'asc' }
    });
    
    const userBucketName = `${userFromDb.username.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${userFromDb.id}`;
    const storageLimitMB = (currentSubscription && currentSubscription.isActive) ? Number(currentSubscription.plan.storageLimit) : 1024;
    const stats = await calculateUserStats(userFromDb.id, userBucketName, storageLimitMB);
    
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
            name: plan.name === 'Free' ? 'Gratuit' : (plan.name === 'Enterprise' ? 'Entreprise' : plan.name),
            price: typeof plan.price === 'object' ? Number(plan.price) : Number(plan.price),
            storageLimit: Number(plan.storageLimit)
        })),
        userStats: stats
    };
};
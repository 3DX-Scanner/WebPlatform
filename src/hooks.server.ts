import type { Handle } from '@sveltejs/kit';
import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '$env/static/private';
import { initializeBuckets, syncStaticModelsToMinio } from '$lib/server/minio';

let minioInitialized = false;

if (!minioInitialized) {
	initializeBuckets()
		.then(async () => {
			console.log('MinIO initialisé avec succès');
			await syncStaticModelsToMinio();
			minioInitialized = true;
		})
		.catch((err) => {
			console.error('Erreur lors de l\'initialisation de MinIO:', err);
		});
}

export const handle: Handle = async ({ event, resolve }) => {
	const token = event.cookies.get('jwt');

	if (token) {
		try {
			const user = jwt.verify(token, JWT_SECRET) as { id: number; email: string; username: string; createdAt: Date };
			event.locals.user = user;
		} catch (err) {
			console.warn('JWT invalide:', err instanceof Error ? err.message : err);
			event.locals.user = undefined;
		}
	} else {
		event.locals.user = undefined;
	}

	return resolve(event);
};
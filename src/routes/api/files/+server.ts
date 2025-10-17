import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { listFiles, BUCKETS } from '$lib/server/minio';

export const GET: RequestHandler = async ({ url, locals }) => {
	// Vérifier l'authentification
	if (!locals.user) {
		return json({ error: 'Non authentifié' }, { status: 401 });
	}

	try {
		const bucket = url.searchParams.get('bucket') || BUCKETS.USER_UPLOADS;
		const prefix = `${locals.user.id}/`; // Liste uniquement les fichiers de l'utilisateur

		const files = await listFiles(bucket, prefix);

		// Formater les résultats
		const formattedFiles = files.map((file) => ({
			name: file.name,
			size: file.size,
			lastModified: file.lastModified,
			etag: file.etag
		}));

		return json({
			success: true,
			files: formattedFiles,
			count: formattedFiles.length
		});
	} catch (error) {
		console.error('❌ Erreur lors du listage des fichiers:', error);
		return json({ error: 'Erreur lors du listage des fichiers' }, { status: 500 });
	}
};

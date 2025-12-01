import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { listFiles, ensureUserBucket } from '$lib/server/minio';

export const GET: RequestHandler = async ({ url, locals }) => {
	// Vérifier l'authentification
	if (!locals.user) {
		return json({ error: 'Non authentifié' }, { status: 401 });
	}

	try {
		// Créer le bucket de l'utilisateur s'il n'existe pas
		const userBucket = await ensureUserBucket(locals.user.id, locals.user.username);
		const prefix = url.searchParams.get('prefix') || ''; // Préfixe optionnel

		const files = await listFiles(userBucket, prefix);

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

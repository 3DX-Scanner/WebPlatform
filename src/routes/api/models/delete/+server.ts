import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { minioClient, listFiles, getUserBucket } from '$lib/server/minio';

export const DELETE: RequestHandler = async ({ request, locals }) => {
	// Vérifier l'authentification
	if (!locals.user) {
		return json({ error: 'Non authentifié' }, { status: 401 });
	}

	try {
		const { bucketName, folderName } = await request.json();

		if (!bucketName || !folderName) {
			return json({ error: 'bucketName et folderName sont requis' }, { status: 400 });
		}

		// Vérifier que l'utilisateur ne peut supprimer que ses propres modèles (pas le bucket public)
		const userBucket = await getUserBucket(locals.user.id);
		if (bucketName !== userBucket) {
			return json({ error: 'Vous ne pouvez supprimer que vos propres modèles' }, { status: 403 });
		}

		// Lister tous les fichiers dans le dossier
		const prefix = `${folderName}/`;
		const files = await listFiles(bucketName, prefix);

		if (files.length === 0) {
			return json({ error: 'Aucun fichier trouvé pour ce modèle' }, { status: 404 });
		}

		// Supprimer tous les fichiers du dossier
		const deletePromises = files.map(file => 
			minioClient.removeObject(bucketName, file.name)
		);

		await Promise.all(deletePromises);

		console.log(`✅ Modèle supprimé: ${bucketName}/${folderName} (${files.length} fichiers)`);

		return json({ 
			success: true, 
			message: `Modèle supprimé avec succès (${files.length} fichiers)`,
			deletedFiles: files.length
		});
	} catch (error: any) {
		console.error('❌ Erreur lors de la suppression du modèle:', error);
		return json({ error: error.message || 'Erreur lors de la suppression du modèle' }, { status: 500 });
	}
};


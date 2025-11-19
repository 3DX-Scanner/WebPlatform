import * as Minio from 'minio';
import { env } from '$env/dynamic/private';
import { Readable } from 'stream';
import * as fs from 'fs';
import * as path from 'path';

// Configuration MinIO
const minioConfig = {
	endPoint: env.MINIO_ENDPOINT || 'localhost',
	port: parseInt(env.MINIO_PORT || '9000'),
	useSSL: env.MINIO_USE_SSL === 'true',
	accessKey: env.MINIO_ACCESS_KEY || 'admin',
	secretKey: env.MINIO_SECRET_KEY || 'admin12345'
};

// Client MinIO
export const minioClient = new Minio.Client(minioConfig);

// Nom du bucket public pour les modèles de démo
export const PUBLIC_BUCKET = 'public';

/**
 * Initialise le bucket public MinIO s'il n'existe pas
 */
export async function initializeBuckets() {
	try {
		const exists = await minioClient.bucketExists(PUBLIC_BUCKET);
		if (!exists) {
			await minioClient.makeBucket(PUBLIC_BUCKET, 'us-east-1');
			console.log(`✅ Bucket public créé: ${PUBLIC_BUCKET}`);

			// Définir la politique publique pour lecture seule
			const policy = {
				Version: '2012-10-17',
				Statement: [
					{
						Effect: 'Allow',
						Principal: { AWS: ['*'] },
						Action: ['s3:GetObject'],
						Resource: [`arn:aws:s3:::${PUBLIC_BUCKET}/*`]
					}
				]
			};
			await minioClient.setBucketPolicy(PUBLIC_BUCKET, JSON.stringify(policy));
			console.log(`✅ Politique publique appliquée au bucket: ${PUBLIC_BUCKET}`);
		} else {
			console.log(`✓ Bucket public existe déjà: ${PUBLIC_BUCKET}`);
		}
	} catch (error) {
		console.error('❌ Erreur lors de l\'initialisation du bucket public MinIO:', error);
		throw error;
	}
}

/**
 * Nettoie un nom pour qu'il soit conforme aux règles MinIO pour les noms de buckets
 * Règles MinIO : 3-63 caractères, lettres minuscules, chiffres, points (.), tirets (-)
 * Ne peut pas commencer ou finir par un point ou tiret
 */
function sanitizeBucketName(name: string): string {
	return name
		.toLowerCase()
		.replace(/[^a-z0-9.-]/g, '-') // Remplacer les caractères invalides par des tirets
		.replace(/^[-.]+|[-.]+$/g, '') // Supprimer les tirets/points au début et à la fin
		.replace(/[-.]+/g, '-') // Remplacer les séquences de tirets/points par un seul tiret
		.substring(0, 63); // Limiter à 63 caractères
}

/**
 * Crée un bucket pour un utilisateur s'il n'existe pas
 */
export async function ensureUserBucket(userId: number, username: string): Promise<string> {
	// Format: {sanitizedUsername}-{userId}
	// Exemple: test-3 devient test-3
	const sanitizedUsername = sanitizeBucketName(username);
	const bucketName = `${sanitizedUsername}-${userId}`;
	
	// S'assurer que le nom fait au moins 3 caractères
	if (bucketName.length < 3) {
		throw new Error(`Nom de bucket trop court: ${bucketName}`);
	}
	
	try {
		const exists = await minioClient.bucketExists(bucketName);
		if (!exists) {
			await minioClient.makeBucket(bucketName, 'us-east-1');
			console.log(`✅ Bucket utilisateur créé: ${bucketName}`);
			
			// Le bucket est privé par défaut (pas de politique publique)
			// Les fichiers seront accessibles uniquement via des URLs présignées
		}
		return bucketName;
	} catch (error) {
		console.error(`❌ Erreur lors de la création du bucket ${bucketName}:`, error);
		throw error;
	}
}

/**
 * Récupère le bucketName d'un utilisateur depuis la base de données
 * Nécessite que prisma soit importé dans le fichier appelant
 */
export async function getUserBucket(userId: number): Promise<string | null> {
	try {
		// Import dynamique pour éviter les dépendances circulaires
		const { prisma } = await import('./prisma');
		const user = await prisma.user.findUnique({
			where: { id: userId },
			select: { bucketName: true, username: true } as { bucketName: boolean; username: boolean }
		});
		
		if (!user) {
			return null;
		}
		
		// Si l'utilisateur n'a pas de bucket, en créer un
		if (!(user as any).bucketName && user.username) {
			const bucketName = await ensureUserBucket(userId, user.username);
			await prisma.user.update({
				where: { id: userId },
				data: { bucketName: bucketName } as { bucketName: string }
			});
			return bucketName;
		}
		
		return (user as any).bucketName;
	} catch (error) {
		console.error(`❌ Erreur lors de la récupération du bucket pour l'utilisateur ${userId}:`, error);
		return null;
	}
}
/**
 * Upload un fichier dans MinIO
 */
export async function uploadFile(
	bucketName: string,
	objectName: string,
	stream: Buffer | NodeJS.ReadableStream | ReadableStream,
	size?: number,
	metaData?: Record<string, string>
) {
	try {
		// Ensure we provide a Node.js Readable (or Buffer/string) to minioClient.putObject
		let nodeStream: Buffer | NodeJS.ReadableStream | string = stream as any;

		// Detect WHATWG ReadableStream (browser/fetch) and convert to Node Readable
		if (typeof (stream as any)?.getReader === 'function') {
			// If Node.js provides Readable.fromWeb (Node 17.0+ / 18+), use it
			if (typeof (Readable as any).fromWeb === 'function') {
				nodeStream = (Readable as any).fromWeb(stream as any);
			} else {
				// Fallback: create a Node Readable that pulls from the reader
				const reader = (stream as any).getReader();
				nodeStream = new Readable({
					read() {
						// noop: we'll push in an async loop below
					}
				});

				(async () => {
					try {
						while (true) {
							const { done, value } = await reader.read();
							if (done) {
								(nodeStream as Readable).push(null);
								break;
							}
							// value may be Uint8Array or similar
							(nodeStream as Readable).push(Buffer.from(value));
						}
					} catch (err) {
						(nodeStream as Readable).destroy(err as Error);
					}
				})();
			}
		}

		await minioClient.putObject(bucketName, objectName, nodeStream as any, size, metaData);
		return {
			success: true,
			bucket: bucketName,
			objectName,
			url: `http://${minioConfig.endPoint}:${minioConfig.port}/${bucketName}/${objectName}`
		};
	} catch (error) {
		console.error('❌ Erreur lors de l\'upload:', error);
		throw error;
	}
}

/**
 * Télécharge un fichier depuis MinIO
 */
export async function downloadFile(bucketName: string, objectName: string) {
	try {
		const dataStream = await minioClient.getObject(bucketName, objectName);
		return dataStream;
	} catch (error) {
		console.error('❌ Erreur lors du téléchargement:', error);
		throw error;
	}
}

/**
 * Supprime un fichier de MinIO
 */
export async function deleteFile(bucketName: string, objectName: string) {
	try {
		await minioClient.removeObject(bucketName, objectName);
		return { success: true };
	} catch (error) {
		console.error('❌ Erreur lors de la suppression:', error);
		throw error;
	}
}

/**
 * Copie un fichier dans MinIO (utilisé pour renommer/déplacer)
 */
export async function copyFile(
	sourceBucket: string,
	sourceObject: string,
	destBucket: string,
	destObject: string
) {
	try {
		// Pour MinIO, on utilise getObject puis putObject pour copier
		// car copyObject peut avoir des limitations selon la version
		const dataStream = await minioClient.getObject(sourceBucket, sourceObject);
		
		// Convertir le stream en buffer
		const chunks: Buffer[] = [];
		for await (const chunk of dataStream) {
			chunks.push(chunk);
		}
		const buffer = Buffer.concat(chunks);
		
		// Obtenir les métadonnées de l'objet source
		const stat = await minioClient.statObject(sourceBucket, sourceObject);
		
		// Copier vers la destination
		await minioClient.putObject(destBucket, destObject, buffer, buffer.length, stat.metaData);
		
		return { success: true };
	} catch (error) {
		console.error('❌ Erreur lors de la copie:', error);
		throw error;
	}
}

/**
 * Liste les fichiers dans un bucket
 */
export async function listFiles(bucketName: string, prefix?: string) {
	try {
		const stream = minioClient.listObjects(bucketName, prefix, true);
		const files: any[] = [];

		return new Promise<any[]>((resolve, reject) => {
			stream.on('data', (obj) => files.push(obj));
			stream.on('error', (err) => reject(err));
			stream.on('end', () => resolve(files));
		});
	} catch (error) {
		console.error('❌ Erreur lors du listage des fichiers:', error);
		throw error;
	}
}

/**
 * Génère une URL présignée pour accéder temporairement à un fichier privé
 */
export async function getPresignedUrl(
	bucketName: string,
	objectName: string,
	expirySeconds: number = 3600
) {
	try {
		const url = await minioClient.presignedGetObject(bucketName, objectName, expirySeconds);
		return url;
	} catch (error) {
		console.error('❌ Erreur lors de la génération de l\'URL présignée:', error);
		throw error;
	}
}

/**
 * Génère une URL présignée pour uploader un fichier
 */
export async function getPresignedUploadUrl(
	bucketName: string,
	objectName: string,
	expirySeconds: number = 3600
) {
	try {
		const url = await minioClient.presignedPutObject(bucketName, objectName, expirySeconds);
		return url;
	} catch (error) {
		console.error('❌ Erreur lors de la génération de l\'URL présignée d\'upload:', error);
		throw error;
	}
}

/**
 * Synchronise les modèles 3D du dossier static vers MinIO
 * Vérifie qu'il n'y a pas de doublons avant d'uploader
 */
export async function syncStaticModelsToMinio() {
	const staticModelsPath = path.join(process.cwd(), 'static', 'assets', 'model3D');
	
	// Vérifier si le dossier existe
	if (!fs.existsSync(staticModelsPath)) {
		console.log('📁 Aucun dossier static/assets/model3D/ trouvé, synchronisation ignorée');
		return;
	}

	try {
		console.log('🔄 Synchronisation des modèles 3D depuis static/assets/model3D/...');
		
		// Lister les fichiers déjà présents dans MinIO
		const existingFiles = await listFiles(PUBLIC_BUCKET);
		const existingPaths = new Set(existingFiles.map(f => f.name));
		
		let uploadedCount = 0;
		let skippedCount = 0;

		// Fonction helper pour uploader un fichier
		async function uploadFileToMinio(filePath: string, objectName: string) {
			// Vérifier si le fichier existe déjà
			if (existingPaths.has(objectName)) {
				skippedCount++;
				return;
			}

			// Déterminer le Content-Type
			const ext = path.extname(objectName).toLowerCase();
			let contentType = 'application/octet-stream';

			switch (ext) {
				case '.glb':
					contentType = 'model/gltf-binary';
					break;
				case '.gltf':
					contentType = 'model/gltf+json';
					break;
				case '.ply':
					contentType = 'application/octet-stream';
					break;
				case '.jpg':
				case '.jpeg':
					contentType = 'image/jpeg';
					break;
				case '.png':
					contentType = 'image/png';
					break;
				case '.webp':
					contentType = 'image/webp';
					break;
			}

			// Uploader le fichier
			await minioClient.fPutObject(
				PUBLIC_BUCKET,
				objectName,
				filePath,
				{
					'Content-Type': contentType
				}
			);

			uploadedCount++;
			console.log(`  ✅ ${objectName}`);
		}

		// Parcourir tous les fichiers et dossiers
		const items = fs.readdirSync(staticModelsPath);

		for (const item of items) {
			const itemPath = path.join(staticModelsPath, item);
			const stats = fs.statSync(itemPath);

			if (stats.isDirectory()) {
				// C'est un dossier, uploader tous les fichiers qu'il contient
				const files = fs.readdirSync(itemPath);
				for (const file of files) {
					const filePath = path.join(itemPath, file);
					const fileStats = fs.statSync(filePath);
					
					if (fileStats.isFile() && file !== '.gitkeep') {
						const objectName = `${item}/${file}`;
						await uploadFileToMinio(filePath, objectName);
					}
				}
			} else if (stats.isFile() && item !== '.gitkeep') {
				// C'est un fichier à la racine, créer un dossier basé sur le nom du fichier
				const baseName = path.basename(item, path.extname(item));
				const objectName = `${baseName}/${item}`;
				await uploadFileToMinio(itemPath, objectName);
			}
		}

		console.log(`✅ Synchronisation terminée: ${uploadedCount} fichiers uploadés, ${skippedCount} fichiers déjà présents`);
	} catch (error) {
		console.error('❌ Erreur lors de la synchronisation des modèles:', error);
		// Ne pas throw pour ne pas bloquer le démarrage de l'application
	}
}

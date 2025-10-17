import * as Minio from 'minio';
import { env } from '$env/dynamic/private';
import { Readable } from 'stream';

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

// Noms des buckets
export const BUCKETS = {
	MODELS_3D: '3d-models',
	IMAGES: 'images',
	TEXTURES: 'textures',
	USER_UPLOADS: 'user-uploads'
} as const;

/**
 * Initialise les buckets MinIO s'ils n'existent pas
 */
export async function initializeBuckets() {
	try {
		for (const bucketName of Object.values(BUCKETS)) {
			const exists = await minioClient.bucketExists(bucketName);
			if (!exists) {
				await minioClient.makeBucket(bucketName, 'us-east-1');
				console.log(`✅ Bucket créé: ${bucketName}`);

				// Définir la politique publique pour lecture seule sur certains buckets
				if (bucketName === BUCKETS.MODELS_3D || bucketName === BUCKETS.IMAGES) {
					const policy = {
						Version: '2012-10-17',
						Statement: [
							{
								Effect: 'Allow',
								Principal: { AWS: ['*'] },
								Action: ['s3:GetObject'],
								Resource: [`arn:aws:s3:::${bucketName}/*`]
							}
						]
					};
					await minioClient.setBucketPolicy(bucketName, JSON.stringify(policy));
					console.log(`✅ Politique publique appliquée au bucket: ${bucketName}`);
				}
			} else {
				console.log(`✓ Bucket existe déjà: ${bucketName}`);
			}
		}
	} catch (error) {
		console.error('❌ Erreur lors de l\'initialisation des buckets MinIO:', error);
		throw error;
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
 * Liste les fichiers dans un bucket
 */
export async function listFiles(bucketName: string, prefix?: string) {
	try {
		const stream = minioClient.listObjects(bucketName, prefix, true);
		const files: Minio.BucketItem[] = [];

		return new Promise<Minio.BucketItem[]>((resolve, reject) => {
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

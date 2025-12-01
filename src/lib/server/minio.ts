import * as Minio from 'minio';
import {env} from '$env/dynamic/private';
import {Readable} from 'stream';
import * as fs from 'fs';
import * as path from 'path';

const minioConfig = {
	endPoint: env.MINIO_ENDPOINT || 'localhost',
	port: parseInt(env.MINIO_PORT || '9000'),
	useSSL: env.MINIO_USE_SSL === 'true',
	accessKey: env.MINIO_ACCESS_KEY || 'admin',
	secretKey: env.MINIO_SECRET_KEY || 'admin12345'
};

export const minioClient = new Minio.Client(minioConfig);

export const PUBLIC_BUCKET = 'public';

export async function initializeBuckets() {
    try {
		const exists = await minioClient.bucketExists(PUBLIC_BUCKET);
		if (!exists) {
			await minioClient.makeBucket(PUBLIC_BUCKET, 'us-east-1');
			console.log(`Bucket public créé: ${PUBLIC_BUCKET}`);

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
			console.log(`Politique publique appliquée au bucket: ${PUBLIC_BUCKET}`);
		} else {
			console.log(`Bucket public existe déjà: ${PUBLIC_BUCKET}`);
		}
	} catch (error) {
		console.error('Erreur lors de l\'initialisation du bucket public MinIO:', error);
		throw error;
	}
}

function sanitizeBucketName(name: string): string {
	return name
		.toLowerCase()
		.replace(/[^a-z0-9.-]/g, '-')
		.replace(/^[-.]+|[-.]+$/g, '')
		.replace(/[-.]+/g, '-')
		.substring(0, 63);
}

export async function ensureUserBucket(userId: number, username: string): Promise<string> {
	const sanitizedUsername = sanitizeBucketName(username);
	const bucketName = `${sanitizedUsername}-${userId}`;
	
	if (bucketName.length < 3) {
		throw new Error(`Nom de bucket trop court: ${bucketName}`);
	}
	
	try {
		const exists = await minioClient.bucketExists(bucketName);
		if (!exists) {
			await minioClient.makeBucket(bucketName, 'us-east-1');
			console.log(`Bucket utilisateur créé: ${bucketName}`);
		}
		return bucketName;
	} catch (error) {
		console.error(`Erreur lors de la création du bucket ${bucketName}:`, error);
		throw error;
	}
}

export async function getUserBucket(userId: number): Promise<string | null> {
	try {
		const { prisma } = await import('./prisma');
		const user = await prisma.user.findUnique({
			where: { id: userId },
			select: { bucketName: true, username: true } as { bucketName: boolean; username: boolean }
		});
		
		if (!user) {
			return null;
		}
		
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
		console.error(`Erreur lors de la récupération du bucket pour l'utilisateur ${userId}:`, error);
		return null;
	}
}

export async function uploadFile(
	bucketName: string,
	objectName: string,
	stream: Buffer | NodeJS.ReadableStream | ReadableStream,
	size?: number,
	metaData?: Record<string, string>
) {
	try {
		let nodeStream: Buffer | NodeJS.ReadableStream | string = stream as any;

		if (typeof (stream as any)?.getReader === 'function') {
			if (typeof (Readable as any).fromWeb === 'function') {
				nodeStream = (Readable as any).fromWeb(stream as any);
			} else {
				const reader = (stream as any).getReader();
				nodeStream = new Readable({
					read() {}
				});

				await (async () => {
                    try {
                        while (true) {
                            const {done, value} = await reader.read();
                            if (done) {
                                (nodeStream as Readable).push(null);
                                break;
                            }
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
		console.error('Erreur lors de l\'upload:', error);
		throw error;
	}
}

export async function copyFile(
	sourceBucket: string,
	sourceObject: string,
	destBucket: string,
	destObject: string
) {
	try {
		const dataStream = await minioClient.getObject(sourceBucket, sourceObject);
		
		const chunks: Buffer[] = [];
		for await (const chunk of dataStream) {
			chunks.push(chunk);
		}
		const buffer = Buffer.concat(chunks);
		
		const stat = await minioClient.statObject(sourceBucket, sourceObject);
		
		await minioClient.putObject(destBucket, destObject, buffer, buffer.length, stat.metaData);
		
		return { success: true };
	} catch (error) {
		console.error('Erreur lors de la copie:', error);
		throw error;
	}
}

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
		console.error('Erreur lors du listage des fichiers:', error);
		throw error;
	}
}

export async function getPresignedUrl(
	bucketName: string,
	objectName: string,
	expirySeconds: number = 3600
) {
	try {
        return await minioClient.presignedGetObject(bucketName, objectName, expirySeconds);
	} catch (error) {
		console.error('Erreur lors de la génération de l\'URL présignée:', error);
		throw error;
	}
}

export async function syncStaticModelsToMinio() {
	const staticModelsPath = path.join(process.cwd(), 'static', 'assets', 'model3D');
	
	if (!fs.existsSync(staticModelsPath)) {
		console.log('Aucun dossier static/assets/model3D/ trouvé, synchronisation ignorée');
		return;
	}

	try {
		console.log('Synchronisation des modèles 3D depuis static/assets/model3D/...');
		
		const existingFiles = await listFiles(PUBLIC_BUCKET);
		const existingPaths = new Set(existingFiles.map(f => f.name));
		
		let uploadedCount = 0;
		let skippedCount = 0;

		async function uploadFileToMinio(filePath: string, objectName: string) {
			if (existingPaths.has(objectName)) {
				skippedCount++;
				return;
			}

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

			await minioClient.fPutObject(
				PUBLIC_BUCKET,
				objectName,
				filePath,
				{
					'Content-Type': contentType
				}
			);

			uploadedCount++;
			console.log(`  Uploaded ${objectName}`);
		}

		const items = fs.readdirSync(staticModelsPath);

		for (const item of items) {
			const itemPath = path.join(staticModelsPath, item);
			const stats = fs.statSync(itemPath);

			if (stats.isDirectory()) {
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
				const baseName = path.basename(item, path.extname(item));
				const objectName = `${baseName}/${item}`;
				await uploadFileToMinio(itemPath, objectName);
			}
		}

		console.log(`Synchronisation terminée: ${uploadedCount} fichiers uploadés, ${skippedCount} fichiers déjà présents`);
	} catch (error) {
		console.error('Erreur lors de la synchronisation des modèles:', error);
	}
}

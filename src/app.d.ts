declare global {
	namespace App {
		interface Locals {
			user?: {
				id: number;
				email: string;
				username: string;
                bucketName: string;
				createdAt: Date;
			};
		}
	}
}

export {};
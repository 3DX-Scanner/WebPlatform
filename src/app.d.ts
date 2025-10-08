declare global {
	namespace App {
		interface Locals {
			user?: {
				id: number;
				email: string;
				username: string;
				createdAt: Date;
			};
		}
	}
}

export {};
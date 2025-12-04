import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import {prisma} from '$lib/server/prisma';

export const POST: RequestHandler = async ({ locals }) => {
	if (!locals.user) {
		return json({ error: 'Unauthorized' }, { status: 401 });
	}

	try {
		const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

		const pairingSession = await prisma.pairingSession.create({
			data: {
				userId: locals.user.id,
				expiresAt
			}
		});

		return json({
			pairingId: pairingSession.id,
			expiresAt: pairingSession.expiresAt.toISOString()
		});
	} catch (error) {
        console.log(error);
		return json({ error: 'Failed to create pairing session' }, { status: 500 });
	}
};

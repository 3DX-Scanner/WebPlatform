import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import {prisma} from '$lib/server/prisma';

export const GET: RequestHandler = async ({ params, locals }) => {
	if (!locals.user) {
		return json({ error: 'Unauthorized' }, { status: 401 });
	}

	const { pairingId } = params;

	try {
		const pairingSession = await prisma.pairingSession.findUnique({
			where: { id: pairingId },
			include: {
				user: {
					select: {
						id: true
					}
				}
			}
		});

		if (!pairingSession) {
			return json({ error: 'Pairing session not found' }, { status: 404 });
		}

		if (pairingSession.userId !== locals.user.id) {
			return json({ error: 'Forbidden' }, { status: 403 });
		}

		if (pairingSession.status === 'PENDING' && new Date() > pairingSession.expiresAt) {
			await prisma.pairingSession.update({
				where: { id: pairingId },
				data: { status: 'EXPIRED' }
			});
			return json({ status: 'expired' });
		}

		if (pairingSession.status === 'COMPLETED' && pairingSession.deviceSerialNumber) {
			const device = await prisma.device.findUnique({
				where: { serialNumber: pairingSession.deviceSerialNumber },
				include: {
					model: true
				}
			});

			return json({
				status: 'completed',
				device: device
					? {
							id: device.id,
							serialNumber: device.serialNumber,
							modelName: device.model.name,
							createdAt: device.createdAt
					  }
					: null
			});
		}

		return json({
			status: pairingSession.status.toLowerCase()
		});
	} catch (error) {
		return json({ error: 'Failed to check pairing status' }, { status: 500 });
	}
};

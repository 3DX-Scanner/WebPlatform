import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import {prisma} from '$lib/server/prisma';

export const DELETE: RequestHandler = async ({ params, locals }) => {
	if (!locals.user) {
		return json({ error: 'Unauthorized' }, { status: 401 });
	}

	const deviceId = parseInt(params.deviceId);

	if (isNaN(deviceId)) {
		return json({ error: 'Invalid device ID' }, { status: 400 });
	}

	try {
		const userDevice = await prisma.userDevice.findUnique({
			where: {
				userId_deviceId: {
					userId: locals.user.id,
					deviceId: deviceId
				}
			}
		});

		if (!userDevice) {
			return json({ error: 'Device pairing not found' }, { status: 404 });
		}

		await prisma.userDevice.delete({
			where: {
				userId_deviceId: {
					userId: locals.user.id,
					deviceId: deviceId
				}
			}
		});

		return json({ success: true, message: 'Device unpaired successfully' });
	} catch (error) {
		return json({ error: 'Failed to unpair device' }, { status: 500 });
	}
};

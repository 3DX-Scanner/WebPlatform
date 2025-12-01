import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import {prisma} from '$lib/server/prisma';

export const GET: RequestHandler = async ({ locals }) => {
	if (!locals.user) {
		return json({ error: 'Unauthorized' }, { status: 401 });
	}

	try {
		const userDevices = await prisma.userDevice.findMany({
			where: {
				userId: locals.user.id
			},
			include: {
				device: {
					include: {
						model: true
					}
				}
			},
			orderBy: {
				pairedAt: 'desc'
			}
		});

		const devices = userDevices.map((ud) => ({
			id: ud.device.id,
			serialNumber: ud.device.serialNumber,
			modelName: ud.device.model.name,
			pairedAt: ud.pairedAt,
			createdAt: ud.device.createdAt
		}));

		return json({ devices });
	} catch (error) {
		return json({ error: 'Failed to fetch devices' }, { status: 500 });
	}
};

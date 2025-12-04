import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import {prisma} from '$lib/server/prisma';

export const POST: RequestHandler = async ({ request }) => {
	try {
		const body = await request.json();
		const { pairingId, deviceSerialNumber } = body;

		if (!pairingId || !deviceSerialNumber) {
			return json({ error: 'Missing required fields: pairingId and deviceSerialNumber' }, { status: 400 });
		}

		const pairingSession = await prisma.pairingSession.findUnique({
			where: { id: pairingId }
		});

		if (!pairingSession) {
			return json({ error: 'Pairing session not found' }, { status: 404 });
		}

		if (new Date() > pairingSession.expiresAt) {
			return json({ error: 'Pairing session has expired' }, { status: 400 });
		}

		if (pairingSession.deviceSerialNumber !== null) {
			return json({ error: 'Pairing session already completed' }, { status: 400 });
		}

		let device = await prisma.device.findUnique({
			where: { serialNumber: deviceSerialNumber }
		});

        if (!device) {
            return json({ error: 'Device with the provided serial number not found' }, { status: 404 });
        }

		await prisma.pairingSession.update({
			where: { id: pairingId },
			data: {
				deviceSerialNumber: deviceSerialNumber
			}
		});

        let existingUserDevice = await prisma.userDevice.findFirst({
            where: {
                userId: pairingSession.userId,
                deviceId: device.id
            }
        });

        if (existingUserDevice) {
            await prisma.userDevice.update({
                where: { id: existingUserDevice.id },
                data: {}
            });

            return json({ message: 'Pairing completed' }, { status: 200 });
        } else {
            await prisma.userDevice.create({
                data: {
                    userId: pairingSession.userId,
                    deviceId: device.id
                }
            });

            return json({ message: 'Pairing completed' }, { status: 201 });
        }
	} catch (error) {
        console.log(error);
		return json({ error: 'Failed to complete pairing' }, { status: 500 });
	}
};

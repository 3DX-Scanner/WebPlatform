import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import {prisma} from '$lib/server/prisma';

export const POST: RequestHandler = async ({ request }) => {
	try {
		const body = await request.json();
		const { pairingId, deviceSerialNumber, modelId } = body;

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
			await prisma.pairingSession.update({
				where: { id: pairingId },
				data: { status: 'EXPIRED' }
			});
			return json({ error: 'Pairing session has expired' }, { status: 400 });
		}

		if (pairingSession.status === 'COMPLETED') {
			return json({ error: 'Pairing session already completed' }, { status: 400 });
		}

		let device = await prisma.device.findUnique({
			where: { serialNumber: deviceSerialNumber }
		});

		if (!device) {
			if (!modelId) {
				return json({ error: 'Device not found and no modelId provided to create new device' }, { status: 400 });
			}

			const deviceModel = await prisma.deviceModel.findUnique({
				where: { id: modelId }
			});

			if (!deviceModel) {
				return json({ error: 'Device model not found' }, { status: 404 });
			}

			device = await prisma.device.create({
				data: {
					serialNumber: deviceSerialNumber,
					modelId: modelId
				}
			});
		}

		const existingPairing = await prisma.userDevice.findUnique({
			where: {
				userId_deviceId: {
					userId: pairingSession.userId,
					deviceId: device.id
				}
			}
		});

		if (!existingPairing) {
			await prisma.userDevice.create({
				data: {
					userId: pairingSession.userId,
					deviceId: device.id
				}
			});
		}

		await prisma.pairingSession.update({
			where: { id: pairingId },
			data: {
				status: 'COMPLETED',
				deviceSerialNumber: deviceSerialNumber
			}
		});

		const deviceWithModel = await prisma.device.findUnique({
			where: { id: device.id },
			include: {
				model: true
			}
		});

		return json({
			success: true,
			device: {
				id: deviceWithModel!.id,
				serialNumber: deviceWithModel!.serialNumber,
				modelName: deviceWithModel!.model.name,
				createdAt: deviceWithModel!.createdAt
			}
		});
	} catch (error) {
		return json({ error: 'Failed to complete pairing' }, { status: 500 });
	}
};

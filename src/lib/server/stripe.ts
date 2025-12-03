import Stripe from 'stripe';
import { env } from '$env/dynamic/private';

const STRIPE_SECRET_KEY = env.STRIPE_SECRET_KEY;

if (!STRIPE_SECRET_KEY) {
	throw new Error('STRIPE_SECRET_KEY is not set in environment variables');
}

export const stripe = new Stripe(STRIPE_SECRET_KEY, {
	apiVersion: '2025-11-17.clover',
	typescript: true
});


import { json } from '@sveltejs/kit';
import { prisma } from '$lib/server/prisma';
import { Resend } from 'resend';
import jwt from 'jsonwebtoken';
import { JWT_SECRET, RESEND_API_KEY } from '$env/static/private';

// Initialisation du client Resend
const resend = new Resend(RESEND_API_KEY);

export const POST = async ({ request }) => {
	try {
		const { email } = await request.json();
		if (!email) return json({ error: 'Adresse email requise.' }, { status: 400 });

		const user = await prisma.user.findFirst({ where: { email } });

		// Toujours répondre pareil (sécurité)
		if (!user) {
			return json({ message: 'Si un compte existe, un email a été envoyé.' });
		}

		// ✅ Génération d’un mot de passe aléatoire
		const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
		let newPassword = '';
		for (let i = 0; i < 12; i++) {
			newPassword += chars.charAt(Math.floor(Math.random() * chars.length));
		}

		// ✅ Création d’un token JWT temporaire (15 minutes)
		const token = jwt.sign({ id: user.id, newPassword }, JWT_SECRET, { expiresIn: '15m' });

		// Lien de réinitialisation
		const resetLink = `http://localhost:5173/resetPassword?token=${token}`;

		// ✉️ Envoi du mail
		await resend.emails.send({
			from: 'Support <onboarding@resend.dev>',
			to: email,
			subject: 'Réinitialisation de votre mot de passe',
			html: `
				<h2>Réinitialisation du mot de passe</h2>
				<p>Bonjour ${user.username || ''},</p>
				<p>Cliquez sur le lien ci-dessous pour générer votre nouveau mot de passe :</p>
				<p><a href="${resetLink}" style="color:#1a73e8;">Afficher mon nouveau mot de passe</a></p>
				<p>Ce lien expirera dans 15 minutes.</p>
				<p>Si vous n'êtes pas à l'origine de cette demande, ignorez simplement cet email.</p>
			`
		});

		return json({ message: 'Si un compte existe, un email a été envoyé.' });
	} catch (err) {
		console.error('Erreur forgot-password:', err);
		return json({ error: 'Erreur interne du serveur.' }, { status: 500 });
	}
};

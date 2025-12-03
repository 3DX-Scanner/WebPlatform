import { json } from '@sveltejs/kit';
import type { RequestHandler } from '@sveltejs/kit';

export const POST: RequestHandler = async ({ request }) => {
    try {
        const { name, email, subject, message } = await request.json();
        
        if (!name || !email || !subject || !message) {
            return json(
                { error: 'Tous les champs sont requis' },
                { status: 400 }
            );
        }
        
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return json(
                { error: 'Email invalide' },
                { status: 400 }
            );
        }
        
        const contactEmail = '3dxscanner@gmail.com';
        const mailtoLink = `mailto:${contactEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(
            `Nom: ${name}\nEmail: ${email}\n\nMessage:\n${message}`
        )}`;
        
        return json({
            success: true,
            message: 'Message reçu avec succès',
            mailtoLink
        });
        
    } catch (error) {
        console.error('Erreur lors du traitement du contact:', error);
        return json(
            { error: 'Erreur lors de l\'envoi du message' },
            { status: 500 }
        );
    }
};


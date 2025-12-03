import nodemailer from 'nodemailer';
import { env } from '$env/dynamic/private';

const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
        user: env.EMAIL_USER,
        pass: env.EMAIL_PASS 
    }
});

export interface ContactEmailData {
    name: string;
    email: string;
    subject: string;
    message: string;
}

export async function sendContactEmail(data: ContactEmailData) {
    try {
        const mailOptionsToTeam = {
            from: `"3DX Scanner - Formulaire Contact" <${env.EMAIL_USER}>`,
            to: `${env.EMAIL_USER}`,
            replyTo: `"${data.name}" <${data.email}>`,
            subject: `[Contact] ${data.subject}`,
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #333; border-bottom: 2px solid #007bff; padding-bottom: 10px;">
                        Nouveau message de contact
                    </h2>
                    
                    <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
                        <h3 style="color: #007bff; margin-top: 0;">Informations du contact :</h3>
                        <p><strong>Nom :</strong> ${data.name}</p>
                        <p><strong>Email :</strong> <a href="mailto:${data.email}" style="color: #007bff;">${data.email}</a></p>
                        <p><strong>Sujet :</strong> ${data.subject}</p>
                    </div>
                    
                    <div style="background: white; padding: 20px; border-left: 4px solid #007bff;">
                        <h3 style="color: #333; margin-top: 0;">Message :</h3>
                        <p style="line-height: 1.6; white-space: pre-wrap;">${data.message}</p>
                    </div>
                    
                    <div style="margin-top: 30px; padding: 15px; background: #e3f2fd; border-left: 4px solid #2196f3; border-radius: 4px;">
                        <p style="margin: 0; font-size: 14px; color: #1976d2;"><strong>💡 Pour répondre :</strong></p>
                        <p style="margin: 5px 0 0 0; font-size: 13px; color: #424242;">
                            Cliquez sur "Répondre" ou envoyez votre réponse à : <strong>${data.email}</strong>
                        </p>
                    </div>
                    
                    <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #eee; font-size: 12px; color: #666;">
                        <p>Ce message a été envoyé depuis le formulaire de contact du site 3DX Scanner.</p>
                    </div>
                </div>
            `
        };

        const mailOptionsToUser = {
            from: `"3DX Scanner" <${env.EMAIL_USER}>`,
            to: data.email,
            subject: 'Confirmation de réception - 3DX Scanner',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <div style="text-align: center; padding: 20px; background: linear-gradient(135deg, #007bff, #0056b3); color: white; border-radius: 8px 8px 0 0;">
                        <h1 style="margin: 0; font-size: 24px;">3DX Scanner</h1>
                        <p style="margin: 10px 0 0 0; opacity: 0.9;">Scanning the Future</p>
                    </div>
                    
                    <div style="padding: 30px; background: white; border-radius: 0 0 8px 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
                        <h2 style="color: #333; margin-top: 0;">Merci pour votre message !</h2>
                        
                        <p style="color: #666; line-height: 1.6;">
                            Bonjour <strong>${data.name}</strong>,
                        </p>
                        
                        <p style="color: #666; line-height: 1.6;">
                            Nous avons bien reçu votre message concernant "<strong>${data.subject}</strong>" 
                            et nous vous remercions de votre intérêt pour 3DX Scanner.
                        </p>
                        
                        <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
                            <p style="margin: 0; color: #007bff; font-weight: bold;">⏱️ Délai de réponse :</p>
                            <p style="margin: 5px 0 0 0; color: #666;">
                                Notre équipe vous répondra dans les <strong>24 à 48 heures</strong>.
                            </p>
                        </div>
                        
                        <p style="color: #666; line-height: 1.6;">
                            En attendant, n'hésitez pas à explorer notre plateforme et découvrir 
                            nos solutions de scanning 3D innovantes.
                        </p>
                        
                        <div style="text-align: center; margin: 30px 0;">
                            <a href="${env.ORIGIN || 'http://localhost:5173'}" 
                               style="display: inline-block; padding: 12px 25px; background: #007bff; color: white; text-decoration: none; border-radius: 6px; font-weight: bold;">
                                Retourner sur le site
                            </a>
                        </div>
                        
                        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; font-size: 12px; color: #999; text-align: center;">
                            <p style="margin: 0;">3DX Scanner - L'avenir du scanning 3D</p>
                            <p style="margin: 5px 0 0 0;">
                                Si vous avez des questions urgentes, contactez-nous directement à 3dxscanner@gmail.com
                            </p>
                        </div>
                    </div>
                </div>
            `
        };

        await Promise.all([
            transporter.sendMail(mailOptionsToTeam),
            transporter.sendMail(mailOptionsToUser)
        ]);

        return { success: true };
    } catch (error) {
        console.error('Erreur lors de l\'envoi de l\'email:', error);
        throw new Error('Erreur lors de l\'envoi de l\'email');
    }
}

import { Request, Response } from 'express';
import { brevoService } from '../services/brevo.service';
import { emailService } from '../services/email.service';
import { z } from 'zod';

const subscribeSchema = z.object({
    email: z.string().email('Invalid email address')
});

export const subscribe = async (req: Request, res: Response) => {
    try {
        const { email } = subscribeSchema.parse(req.body);

        // 1. Add to Brevo (Contact List)
        let brevoResult;
        try {
            console.log(`[Subscription] Adding ${email} to Brevo...`);
            brevoResult = await brevoService.createContact({ email });
            console.log('[Subscription] Successfully added to Brevo.');
        } catch (brevoError) {
            console.error('[Subscription] Failed to add to Brevo:', brevoError);
            // We continue even if Brevo fails, or should we stop? 
            // Usually if newsletter sub fails, we might want to tell user.
            // But request said "Update my subscription system... Keep existing process...". 
            // Let's assume critical failure if Brevo fails, OR we can try Resend anyway.
            // Let's soft-fail Brevo but log it, so user still gets email? 
            // Actually, if they subscribe, the main goal is the list. 
            // Let's stick to throwing if Brevo fails, as that was the original behavior.
            throw brevoError;
        }

        // 2. Send Welcome Email (Resend)
        try {
            console.log(`[Subscription] Sending welcome email via Resend to ${email}...`);
            await emailService.sendWelcomeEmail(email);
        } catch (emailError) {
            console.error('[Subscription] Failed to send welcome email:', emailError);
            // Non-blocking error for the response, but logged.
        }

        res.status(200).json({
            success: true,
            message: 'Successfully subscribed to newsletter',
            data: { brevo: brevoResult }
        });
    } catch (error: any) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: error.errors
            });
        }

        console.error('Subscription error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to subscribe'
        });
    }
};


import { Request, Response } from 'express';
import { brevoService } from '../services/brevo.service';
import { z } from 'zod';

const subscribeSchema = z.object({
    email: z.string().email('Invalid email address')
});

export const subscribe = async (req: Request, res: Response) => {
    try {
        const { email } = subscribeSchema.parse(req.body);

        const result = await brevoService.createContact({
            email,
            // You can add listIds here if needed, e.g., listIds: [2]
        });

        res.status(200).json({
            success: true,
            message: 'Successfully subscribed to newsletter',
            data: result
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

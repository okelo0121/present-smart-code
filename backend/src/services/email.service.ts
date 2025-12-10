import { Resend } from 'resend';

export class EmailService {
    private resend: Resend;
    private fromEmail: string;

    constructor() {
        const apiKey = process.env.RESEND_API_KEY;
        this.fromEmail = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev';

        if (!apiKey) {
            console.warn('RESEND_API_KEY is not set. Email sending will fail.');
        }

        this.resend = new Resend(apiKey);
    }

    async sendWelcomeEmail(email: string): Promise<any> {
        try {
            console.log(`[EmailService] Sending welcome email to ${email} from ${this.fromEmail}`);

            const data = await this.resend.emails.send({
                from: this.fromEmail,
                to: email,
                subject: 'Welcome to EduTrack!',
                html: `
                    <!DOCTYPE html>
                    <html>
                    <head>
                        <meta charset="utf-8">
                        <title>Welcome to EduTrack</title>
                        <style>
                            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f4f4f5; }
                            .container { max-width: 600px; margin: 40px auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06); }
                            .header { background: linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%); padding: 40px 20px; text-align: center; }
                            .logo { background: rgba(255, 255, 255, 0.2); padding: 12px; border-radius: 12px; display: inline-block; }
                            .content { padding: 40px 30px; }
                            .footer { background-color: #f9fafb; padding: 20px; text-align: center; font-size: 12px; color: #6b7280; border-top: 1px solid #e5e7eb; }
                            .button { display: inline-block; background-color: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 600; margin-top: 20px; }
                        </style>
                    </head>
                    <body>
                        <div class="container">
                            <div class="header">
                                <!-- Logo uses FRONTEND_URL or falls back to public website if env not set -->
                                <img src="${process.env.FRONTEND_URL ? `${process.env.FRONTEND_URL.replace(/\/$/, '')}/logo.png` : 'https://www.edutrack.store/logo.png'}" alt="EduTrack Logo" height="50" style="height: 50px; width: auto; border-radius: 4px;">
                            </div>
                            <div class="content">
                                <h1 style="color: #111827; margin-top: 0; font-size: 24px;">Welcome to the Community!</h1>
                                <p style="font-size: 16px; color: #4b5563;">Hi there,</p>
                                <p style="font-size: 16px; color: #4b5563;">Thank you for subscribing to the <strong>EduTrack</strong> newsletter. We're thrilled to have you join our community of educators and administrators committed to simplifying classroom management.</p>
                                <div style="background-color: #eff6ff; border-left: 4px solid #4F46E5; padding: 16px; margin: 24px 0; border-radius: 4px;">
                                    <p style="margin: 0; color: #1e3a8a; font-size: 14px;"><strong>What to expect:</strong> You'll be the first to know about new features, attendance tracking tips, and platform updates.</p>
                                </div>
                                <p style="font-size: 16px; color: #4b5563;">We're dedicated to making your teaching experience smoother and more efficient.</p>
                                <center>
                                    <a href="${process.env.FRONTEND_URL || 'http://www.edutrack.store'}" class="button" style="color: #ffffff;">Visit Dashboard</a>
                                </center>
                                <p style="margin-top: 30px; font-size: 14px;">Best regards,<br><strong style="color: #4F46E5;">The EduTrack Team</strong></p>
                            </div>
                            <div class="footer">
                                <p>&copy; ${new Date().getFullYear()} EduTrack. All rights reserved.</p>
                                <p>You received this email because you subscribed to our newsletter via our website.</p>
                            </div>
                        </div>
                    </body>
                    </html>
                `
            });

            console.log(`[EmailService] Welcome email sent successfully. ID: ${data.data?.id}`);
            return data;
        } catch (error) {
            console.error('[EmailService] Failed to send welcome email:', error);
            // We re-throw so the controller knows it failed, or we could handle it here.
            // For now, let's return null to indicate failure but not crash the flow if we want soft-fail.
            // But usually, throwing is better for the caller to decide. 
            // However, the requirement said "logging for both", so we logged error.
            throw error;
        }
    }
}

export const emailService = new EmailService();

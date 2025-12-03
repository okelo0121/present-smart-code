import dotenv from 'dotenv';
import twilio from 'twilio';

dotenv.config();

// Interface for SMS Provider
interface SMSProvider {
    send(to: string, message: string): Promise<boolean>;
}

// Mock Provider (logs to console)
class MockSMSProvider implements SMSProvider {
    async send(to: string, message: string): Promise<boolean> {
        console.log(`[MockSMS] Sending to ${to}: "${message}"`);
        return true;
    }
}

// Twilio Provider
class TwilioProvider implements SMSProvider {
    private client: twilio.Twilio;
    private fromNumber: string;

    constructor(sid: string, token: string, from: string) {
        this.client = twilio(sid, token);
        this.fromNumber = from;
    }

    async send(to: string, message: string): Promise<boolean> {
        try {
            await this.client.messages.create({
                body: message,
                from: this.fromNumber,
                to: to
            });
            console.log(`[Twilio] Sent SMS to ${to}`);
            return true;
        } catch (error) {
            console.error(`[Twilio] Failed to send SMS to ${to}:`, error);
            return false;
        }
    }
}

class NotificationService {
    private provider: SMSProvider;

    constructor() {
        const sid = process.env.TWILIO_ACCOUNT_SID;
        const token = process.env.TWILIO_AUTH_TOKEN;
        const from = process.env.TWILIO_PHONE_NUMBER;

        if (sid && token && from && sid !== 'your_sid_here') {
            console.log('[NotificationService] Using Twilio Provider');
            this.provider = new TwilioProvider(sid, token, from);
        } else {
            console.log('[NotificationService] Twilio credentials missing or default. Using Mock Provider.');
            this.provider = new MockSMSProvider();
        }
    }

    async sendSMS(to: string, message: string): Promise<boolean> {
        try {
            return await this.provider.send(to, message);
        } catch (error) {
            console.error('[NotificationService] Error sending SMS:', error);
            return false;
        }
    }
}

export const notificationService = new NotificationService();

import dotenv from 'dotenv';

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

class NotificationService {
    private provider: SMSProvider;

    constructor() {
        console.log('[NotificationService] Using Mock Provider (Twilio removed).');
        this.provider = new MockSMSProvider();
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

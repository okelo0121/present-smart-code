
interface BrevoContact {
    email: string;
    listIds?: number[];
    attributes?: Record<string, any>;
    updateEnabled?: boolean;
}

export class BrevoService {
    private apiKey: string;
    private baseUrl = 'https://api.sendinblue.com/v3';

    constructor() {
        this.apiKey = process.env.BREVO_API_KEY || '';
        if (!this.apiKey) {
            console.warn('BREVO_API_KEY is not set in environment variables');
        }
    }

    async createContact(contact: BrevoContact): Promise<any> {
        if (!this.apiKey) {
            throw new Error('Brevo API key is not configured');
        }

        try {
            // @ts-ignore: fetch is available in Node 18+
            const response = await fetch(`${this.baseUrl}/contacts`, {
                method: 'POST',
                headers: {
                    'api-key': this.apiKey,
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify(contact)
            });

            const data = await response.json();

            if (!response.ok) {
                // handle duplicate contact case
                if (response.status === 400 && (data as any).code === 'duplicate_parameter') {
                    return { message: 'Contact already exists', id: null };
                }
                throw new Error(`Brevo API Error: ${JSON.stringify(data)}`);
            }

            return data;
        } catch (error: any) {
            throw error;
        }
    }
}

export const brevoService = new BrevoService();

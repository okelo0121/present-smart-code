import { Request, Response, NextFunction } from 'express';

const TURNSTILE_VERIFY_ENDPOINT = 'https://challenges.cloudflare.com/api/v1/siteverify';

export async function verifyTurnstile(req: Request, res: Response, next: NextFunction) {
  const token = req.body['cf-turnstile-response'];
  const ip = req.ip;
  const secret = process.env.TURNSTILE_SECRET_KEY;

  if (!token) {
    return res.status(403).json({ error: 'Turnstile token is missing.' });
  }

  if (!secret) {
    console.error('TURNSTILE_SECRET_KEY is not set in environment variables.');
    return res.status(500).json({ error: 'Turnstile configuration error.' });
  }

  try {
    const response = await fetch(TURNSTILE_VERIFY_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        secret,
        response: token,
        remoteip: ip,
      }),
    });

    const data = await response.json();

    if (data.success) {
      next();
    } else {
      res.status(403).json({ error: 'Failed to verify Turnstile token.', details: data['error-codes'] });
    }
  } catch (error) {
    console.error('Error verifying Turnstile token:', error);
    res.status(500).json({ error: 'An error occurred while verifying the Turnstile token.' });
  }
}

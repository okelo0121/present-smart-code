import { Resend } from 'resend';

// Initialize Resend with API key
if (!process.env.RESEND_API_KEY) {
  console.warn('[WARNING] RESEND_API_KEY not found. Email sending will be disabled.');
  console.warn('Set RESEND_API_KEY in backend/.env to enable email features.');
}

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

export async function sendInviteEmail(
  studentEmail: string,
  studentName: string,
  teacherName: string,
  inviteToken: string,
  frontendUrl: string
): Promise<void> {
  if (!resend) {
    console.log('[EMAIL] Dev mode - Would send invite to:', studentEmail);
    return;
  }

  const inviteLink = `${frontendUrl}/auth?email=${encodeURIComponent(studentEmail)}&type=student&token=${inviteToken}`;

  const emailContent = `
    <html>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <div style="max-width: 600px; margin: 0 auto;">
          <h1 style="color: #4f46e5;">You're Invited to Present Smart!</h1>
          
          <p>Hi ${studentName},</p>
          
          <p><strong>${teacherName}</strong> has invited you to join Present Smart, an attendance tracking system.</p>
          
          <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 0 0 15px 0;"><strong>Getting Started:</strong></p>
            <ol>
              <li>Click the button below to accept your invitation</li>
              <li>Create your account with a secure password</li>
              <li>Start marking attendance in your classes</li>
            </ol>
          </div>
          
          <a href="${inviteLink}" style="display: inline-block; background-color: #4f46e5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0;">
            Accept Invitation
          </a>
          
          <p style="margin-top: 30px; color: #6b7280; font-size: 14px;">
            Or copy and paste this link in your browser: <br/>
            <code style="background-color: #f3f4f6; padding: 5px 10px; border-radius: 4px;">${inviteLink}</code>
          </p>
          
          <p style="margin-top: 30px; color: #6b7280; font-size: 14px;">
            This invitation expires in 7 days.
          </p>
          
          <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
            <p style="color: #6b7280; font-size: 12px; margin: 0;">
              Present Smart - Attendance Made Simple
            </p>
          </div>
        </div>
      </body>
    </html>
  `;

  try {
    if (!resend) {
      console.log('[EMAIL] Dev mode - Would send invite to:', studentEmail);
      return;
    }
    await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || 'noreply@present-smart.com',
      to: studentEmail,
      subject: `${teacherName} invited you to Present Smart`,
      html: emailContent,
    });
  } catch (error) {
    console.error('Error sending invite email:', error);
    throw new Error('Failed to send invitation email');
  }
}

export async function sendWelcomeEmail(email: string, name: string): Promise<void> {
  const emailContent = `
    <html>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <div style="max-width: 600px; margin: 0 auto;">
          <h1 style="color: #4f46e5;">Welcome to Present Smart! 🎓</h1>
          
          <p>Hi ${name},</p>
          
          <p>Your account has been successfully created. You're all set to start using Present Smart.</p>
          
          <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 0 0 15px 0;"><strong>What's Next:</strong></p>
            <ul>
              <li>Wait for your teacher to generate an attendance code</li>
              <li>Enter the code to mark yourself present</li>
              <li>Track your attendance over time</li>
            </ul>
          </div>
          
          <p style="margin-top: 30px; color: #6b7280; font-size: 14px;">
            If you have any questions, feel free to contact your teacher.
          </p>
          
          <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
            <p style="color: #6b7280; font-size: 12px; margin: 0;">
              Present Smart - Attendance Made Simple
            </p>
          </div>
        </div>
      </body>
    </html>
  `;

  try {
    if (!resend) {
      console.log('[EMAIL] Dev mode - Would send email to:', email);
      return;
    }
    await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || 'noreply@present-smart.com',
      to: email,
      subject: 'Welcome to Present Smart!',
      html: emailContent,
    });
  } catch (error) {
    console.error('Error sending welcome email:', error);
    throw new Error('Failed to send welcome email');
  }
}

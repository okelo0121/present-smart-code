import { Resend } from 'resend';



let resendInstance: Resend | null = null;

function getResend(): Resend | null {
  if (!resendInstance && process.env.RESEND_API_KEY) {
    resendInstance = new Resend(process.env.RESEND_API_KEY);
  }
  return resendInstance;
}

// Check configuration on first import (optional, but keep for logging)
if (!process.env.RESEND_API_KEY) {
  // This might fire early due to hoisting, but strict check is done in getResend()
}

export async function sendInviteEmail(
  studentEmail: string,
  studentName: string,
  teacherName: string,
  inviteToken: string,
  frontendUrl: string
): Promise<void> {
  const resend = getResend();
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
    const resend = getResend();
    if (!resend) {
      console.log('[EMAIL] Dev mode - Would send invite to:', studentEmail);
      return;
    }
    const fromEmail = process.env.RESEND_FROM_EMAIL || 'onboarding@edutrack.store';
    console.log('[EMAIL] Sending invite from:', fromEmail);
    await resend.emails.send({
      from: fromEmail,
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
    const resend = getResend();
    if (!resend) {
      console.log('[EMAIL] Dev mode - Would send email to:', email);
      return;
    }
    const fromEmail = process.env.RESEND_FROM_EMAIL || 'onboarding@edutrack.store';
    console.log('[EMAIL] Sending welcome from:', fromEmail);
    await resend.emails.send({
      from: fromEmail,
      to: email,
      subject: 'Welcome to Present Smart!',
      html: emailContent,
    });
  } catch (error) {
    console.error('Error sending welcome email:', error);
    throw new Error('Failed to send welcome email');
  }
}

export async function sendPasswordResetEmail(
  email: string,
  name: string,
  resetToken: string,
  frontendUrl: string
): Promise<void> {
  const resetLink = `${frontendUrl}/reset-password?token=${resetToken}`;

  const emailContent = `
    <html>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <div style="max-width: 600px; margin: 0 auto;">
          <h1 style="color: #4f46e5;">Reset Your Password</h1>

          <p>Hi ${name},</p>

          <p>We received a request to reset your password for your Present Smart account. If you made this request, click the button below to reset your password:</p>

          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetLink}" style="display: inline-block; background-color: #4f46e5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">
              Reset Password
            </a>
          </div>

          <div style="background-color: #fef3c7; border: 1px solid #f59e0b; border-radius: 8px; padding: 15px; margin: 20px 0;">
            <p style="margin: 0; color: #92400e; font-size: 14px;">
              <strong>Security Notice:</strong> This link will expire in 1 hour for your security. If you didn't request a password reset, please ignore this email.
            </p>
          </div>

          <p style="margin-top: 30px; color: #6b7280; font-size: 14px;">
            If you have any issues, contact support or try requesting a new password reset.
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
    const resend = getResend();
    if (!resend) {
      console.log('[EMAIL] Dev mode - Would send password reset email to:', email);
      console.log('[EMAIL] Reset link:', resetLink);
      return;
    }
    const fromEmail = process.env.RESEND_FROM_EMAIL || 'onboarding@edutrack.store';
    console.log('[EMAIL] Sending password reset from:', fromEmail);
    await resend.emails.send({
      from: fromEmail,
      to: email,
      subject: 'Reset Your Present Smart Password',
      html: emailContent,
    });
  } catch (error) {
    console.error('Error sending password reset email:', error);
    throw new Error('Failed to send password reset email');
  }
}

export async function sendLessonNotificationEmail(
  studentEmail: string,
  studentName: string,
  teacherName: string,
  className: string,
  topic: string,
  description: string
): Promise<void> {

  const emailContent = `
    <html>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <div style="max-width: 600px; margin: 0 auto;">
          <h1 style="color: #4f46e5;">New Lesson Posted 📚</h1>

          <p>Hi ${studentName},</p>

          <p><strong>${teacherName}</strong> has posted a new lesson for <strong>${className}</strong>.</p>

          <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 0 0 10px 0; font-size: 18px; color: #111;"><strong>${topic}</strong></p>
            <p style="margin: 0; color: #555;">${description}</p>
          </div>

          <p style="margin-top: 30px; color: #6b7280; font-size: 14px;">
            Log in to EduTrack to view full details and any attached materials.
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
    const resend = getResend();
    if (!resend) {
      console.log('[EMAIL] Dev mode - Would send lesson notification to:', studentEmail);
      return;
    }
    const fromEmail = process.env.RESEND_FROM_EMAIL || 'notifications@edutrack.store';
    await resend.emails.send({
      from: fromEmail,
      to: studentEmail,
      subject: `New Lesson: ${topic} (${className})`,
      html: emailContent,
    });
  } catch (error) {
    console.error('Error sending lesson notification email:', error);
    // Don't throw, just log error so other emails can still try to succeed
  }
}

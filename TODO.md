# Forgot Password Implementation Plan

## Frontend Changes
- [x] Add "Forgot Password?" link below password field in sign-in form
- [x] Create forgot password modal/form with email input
- [x] Add reset password form (accessed via email link)
- [x] Update Auth.tsx state management for forgot/reset password flows

## Backend Changes
- [x] Add `forgotPassword` controller function (generate token, send email)
- [x] Add `resetPassword` controller function (validate token, update password)
- [x] Update auth routes to include `/forgot-password` and `/reset-password`
- [x] Add password reset email template in email utils

## Database/Model Changes
- [x] Add reset token fields to User model (resetToken, resetTokenExpiry)

## Testing
- [ ] Test forgot password email sending
- [ ] Test password reset token validation
- [ ] Test complete password reset flow
- [ ] Test edge cases (expired tokens, invalid emails, etc.)

## Deployment Notes
- [ ] Redeploy backend to Render with latest code
- [ ] Set `VITE_API_URL=https://present-smart-code.onrender.com` in Vercel environment variables

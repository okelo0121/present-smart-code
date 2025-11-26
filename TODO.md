# Forgot Password Implementation Plan

## Frontend Changes
- [ ] Add "Forgot Password?" link below password field in sign-in form
- [ ] Create forgot password modal/form with email input
- [ ] Add reset password form (accessed via email link)
- [ ] Update Auth.tsx state management for forgot/reset password flows

## Backend Changes
- [ ] Add `forgotPassword` controller function (generate token, send email)
- [ ] Add `resetPassword` controller function (validate token, update password)
- [ ] Update auth routes to include `/forgot-password` and `/reset-password`
- [ ] Add password reset email template in email utils

## Database/Model Changes
- [ ] Add reset token fields to User model (resetToken, resetTokenExpiry)

## Testing
- [ ] Test forgot password email sending
- [ ] Test password reset token validation
- [ ] Test complete password reset flow
- [ ] Test edge cases (expired tokens, invalid emails, etc.)

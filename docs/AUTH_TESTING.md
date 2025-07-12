# Authentication Testing Guide

## Overview
This guide helps you test the complete authentication flow for MESSAi, including account creation, login, email verification, and password reset.

## Environment Setup

Create a `.env.local` file with these variables:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/messai"

# NextAuth Configuration
NEXTAUTH_URL="http://localhost:3003"
NEXTAUTH_SECRET="your-secret-key-here-at-least-32-chars"

# Email Configuration (optional for testing)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="your-email@gmail.com"
SMTP_PASSWORD="your-app-password"
SMTP_FROM="MESSAi <noreply@messai.com>"

# Email Verification
REQUIRE_EMAIL_VERIFICATION="true"

# Google OAuth (optional)
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""
```

## Testing Checklist

### 1. Account Creation
- [ ] Navigate to `/auth/signup`
- [ ] Fill in all required fields with valid data
- [ ] Verify password strength indicators work
- [ ] Submit form and check for success message
- [ ] Verify user is created in database
- [ ] Check email for verification link (if SMTP configured)

### 2. Email Verification
- [ ] Click verification link from email OR
- [ ] Manually navigate to `/auth/verify?token=[TOKEN]`
- [ ] Verify success message appears
- [ ] Check database for updated `emailVerified` timestamp
- [ ] Verify automatic redirect to dashboard

### 3. Login Flow
- [ ] Navigate to `/auth/login`
- [ ] Test with invalid credentials (should show error)
- [ ] Test with valid credentials
- [ ] Verify redirect to dashboard after login
- [ ] Check session is created

### 4. Protected Routes
- [ ] Try accessing `/dashboard` without login (should redirect to login)
- [ ] Try accessing `/experiment/new` without login (should redirect)
- [ ] Login and verify access to protected routes
- [ ] Verify callback URL works (original destination after login)

### 5. Email Verification Requirements
- [ ] Login with unverified email
- [ ] Navigate to dashboard - should see verification banner
- [ ] Try accessing `/experiment/new` - should redirect to dashboard
- [ ] Verify email and check banner disappears

### 6. Password Reset Flow
- [ ] Navigate to `/auth/forgot-password`
- [ ] Enter valid email address
- [ ] Check for success message
- [ ] Click reset link from email OR navigate to `/auth/reset-password?token=[TOKEN]`
- [ ] Enter new password with strength requirements
- [ ] Submit and verify success message
- [ ] Try logging in with new password
- [ ] Check email for password change notification

### 7. Error Handling
- [ ] Test `/auth/error` with different error codes
- [ ] Test expired verification token
- [ ] Test expired password reset token
- [ ] Test invalid/used tokens

### 8. Logout Flow
- [ ] Click logout or navigate to `/auth/logout`
- [ ] Verify session is cleared
- [ ] Try accessing protected route (should redirect to login)

### 9. Welcome Page
- [ ] Complete signup and verification
- [ ] Check if redirected to `/auth/welcome`
- [ ] Verify auto-redirect to dashboard after delay

### 10. Rate Limiting
- [ ] Try 5+ failed login attempts
- [ ] Verify rate limit message appears
- [ ] Wait 15 minutes and try again

## Manual Testing Commands

### Create Test User
```bash
# Using Prisma Studio
npm run db:studio

# Or using seed script (if available)
npm run db:seed
```

### Generate Tokens Manually
```bash
# In Node.js REPL or test script
const crypto = require('crypto');
const token = crypto.randomBytes(32).toString('hex');
console.log(token);
```

### Check Database
```sql
-- Check users
SELECT id, email, emailVerified, role FROM "User";

-- Check verification tokens
SELECT * FROM "VerificationToken";

-- Check password reset tokens
SELECT * FROM "PasswordReset";

-- Check login attempts
SELECT * FROM "LoginAttempt" ORDER BY createdAt DESC LIMIT 10;
```

## Common Issues

### Email Not Sending
- Check SMTP credentials
- Use Gmail App Password (not regular password)
- Check spam folder
- View console logs for token URLs

### Verification Link Not Working
- Check token expiry (24 hours)
- Ensure NEXTAUTH_URL is correct
- Check if token exists in database

### Login Not Working
- Verify password hash in database
- Check for account activation status
- Clear browser cookies/session
- Check NextAuth logs

### Middleware Not Protecting Routes
- Restart dev server after middleware changes
- Check middleware matcher configuration
- Verify NEXTAUTH_SECRET is set

## Testing Without Email Service

If SMTP is not configured, tokens will be logged to console:
1. Check server console for "Password reset token" or verification URLs
2. Copy the token from logs
3. Manually construct URL: `http://localhost:3003/auth/verify?token=[TOKEN]`
4. Navigate to URL in browser

## Security Testing

- [ ] Verify passwords are hashed (never stored plain text)
- [ ] Check rate limiting works
- [ ] Verify tokens expire correctly
- [ ] Test CSRF protection
- [ ] Check security headers in network tab

## Next Steps

After testing:
1. Configure production email service
2. Set strong NEXTAUTH_SECRET
3. Enable HTTPS in production
4. Configure OAuth providers if needed
5. Set up monitoring for failed logins
# Authentication Flow Review

This document provides a comprehensive review of all authentication flows in the MESSAi application.

## Overview

The application supports two main authentication methods:
1. **Email/Password Authentication** - Traditional signup and login
2. **Google OAuth** - Social authentication via Google

## Current Implementation Status

### ✅ Implemented Features

1. **Email Signup Flow**
   - User registration with email, password, name, institution, and research area
   - Password hashing with bcrypt (12 rounds)
   - Email verification token generation
   - Automatic creation of UserProfile and UserSettings (after recent fixes)
   - Login attempt tracking for security

2. **Google OAuth Integration**
   - Google provider configured in NextAuth
   - OAuth account linking in database
   - Automatic email verification for OAuth users
   - UserProfile and UserSettings creation in signIn event

3. **Login Process**
   - Credentials provider for email/password login
   - Rate limiting (5 failed attempts in 15 minutes)
   - Login attempt logging with IP and user agent
   - Last login timestamp updates
   - Active user status check

4. **Email Verification**
   - Token-based verification system
   - 24-hour token expiry
   - Verification status tracking
   - Optional requirement via environment variable

5. **Password Reset**
   - Secure token generation
   - 1-hour token expiry
   - Previous tokens invalidation
   - Used token tracking

6. **Security Features**
   - Session management with JWT
   - 30-day session duration
   - Security headers in middleware
   - CSRF protection via NextAuth
   - Role-based access control (USER, RESEARCHER, ADMIN, SUPER_ADMIN)

## Authentication Flow Diagrams

### Email Signup Flow
```
1. User fills signup form → POST /api/auth/signup
2. Server validates input (Zod schema)
3. Server checks for existing user
4. Server hashes password
5. Server creates User record
6. Server creates UserProfile and UserSettings
7. Server generates verification token
8. Server sends verification email (if configured)
9. User redirected to login with success message
```

### Google OAuth Flow
```
1. User clicks "Sign in with Google"
2. Redirected to Google OAuth consent
3. Google redirects back with authorization code
4. NextAuth exchanges code for tokens
5. NextAuth creates/updates User record
6. signIn event creates UserProfile and UserSettings
7. User redirected to dashboard/welcome page
```

### Login Flow
```
1. User enters credentials → signIn('credentials', ...)
2. NextAuth validates via authorize callback
3. Server checks rate limiting
4. Server verifies password
5. Server checks user active status
6. Server logs login attempt
7. Server updates last login timestamp
8. JWT session created
9. User redirected to dashboard
```

## Database Schema

### User-Related Tables
- **User** - Core user information
- **UserProfile** - Extended profile data and onboarding status
- **UserSettings** - User preferences and notifications
- **Account** - OAuth provider accounts
- **Session** - Active sessions (if using database sessions)
- **VerificationToken** - Email verification tokens
- **PasswordReset** - Password reset tokens
- **LoginAttempt** - Security audit trail

## Testing Checklist

### 1. Email Signup Testing
- [ ] Valid signup creates User, UserProfile, and UserSettings
- [ ] Duplicate email returns 409 error
- [ ] Invalid input returns 400 with validation errors
- [ ] Password requirements enforced
- [ ] Verification email sent (if SMTP configured)
- [ ] User redirected to login after signup

### 2. Google OAuth Testing
- [ ] New users get UserProfile and UserSettings created
- [ ] Existing users can link Google account
- [ ] Email automatically verified for OAuth users
- [ ] Proper redirect after OAuth login
- [ ] OAuth tokens stored securely

### 3. Login Testing
- [ ] Valid credentials allow login
- [ ] Invalid credentials return error
- [ ] Rate limiting blocks after 5 failed attempts
- [ ] Login attempts are logged
- [ ] Last login timestamp updated
- [ ] Inactive users cannot login
- [ ] Session created with correct user data

### 4. Email Verification Testing
- [ ] Verification link works correctly
- [ ] Expired tokens are rejected
- [ ] Used tokens cannot be reused
- [ ] User email verified status updated
- [ ] Proper redirect after verification

### 5. Password Reset Testing
- [ ] Reset token sent to valid email
- [ ] Invalid email handled gracefully
- [ ] Token expires after 1 hour
- [ ] Password successfully updated
- [ ] Old tokens invalidated
- [ ] User can login with new password

### 6. Onboarding Flow Testing
- [ ] New users redirected to welcome page
- [ ] Welcome page redirects to onboarding after 5 seconds
- [ ] Onboarding progress tracked in UserProfile
- [ ] Completed onboarding users go to dashboard
- [ ] Incomplete onboarding resumes at correct step

### 7. Security Testing
- [ ] Authenticated routes protected
- [ ] Unauthenticated users redirected to login
- [ ] Auth pages redirect authenticated users
- [ ] Security headers present on all responses
- [ ] CSRF protection active
- [ ] JWT secrets properly configured

## Environment Variables

Required for full functionality:
```env
# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key

# Google OAuth (optional)
GOOGLE_CLIENT_ID=your-client-id
GOOGLE_CLIENT_SECRET=your-client-secret

# Email Configuration (optional)
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=your-email
SMTP_PASSWORD=your-password
SMTP_FROM=noreply@messai.com

# Security Settings
REQUIRE_EMAIL_VERIFICATION=false
```

## Known Issues and Fixes Applied

1. **Issue**: UserProfile and UserSettings not automatically created
   - **Fix**: Added `createUserProfileAndSettings` function called after signup
   - **Fix**: Added `ensureUserRecords` in NextAuth signIn event

2. **Issue**: OAuth users missing profile/settings
   - **Fix**: Added createUser event handler in NextAuth
   - **Fix**: Using upsert in signIn event to ensure records exist

3. **Issue**: Onboarding flow not properly redirecting
   - **Fix**: Updated middleware to handle signup → welcome redirect
   - **Fix**: Welcome page auto-redirects to onboarding

## Recommendations

1. **Enable Email Verification** in production by setting `REQUIRE_EMAIL_VERIFICATION=true`
2. **Configure SMTP** for sending verification and reset emails
3. **Monitor Login Attempts** table for suspicious activity
4. **Regular Security Audits** of authentication flow
5. **Add 2FA Support** for enhanced security (twoFactorEnabled field exists)
6. **Implement Account Lockout** after multiple failed attempts
7. **Add Password Strength Meter** in UI for better UX

## Testing Scripts

Two scripts are available for testing:
1. `scripts/test-auth-flow.js` - Basic authentication flow testing
2. `scripts/verify-auth-flows.js` - Comprehensive verification (requires chalk)

Run with: `node scripts/test-auth-flow.js`
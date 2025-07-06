# Requirements Specification - Create Account and Login

## Problem Statement

The MESSAi platform has a partially implemented authentication system that needs to be completed. While the core authentication infrastructure exists using NextAuth.js, critical user flows like email verification and password reset are incomplete, potentially leaving users unable to verify their accounts or recover access.

## Solution Overview

Complete the existing authentication implementation by:
1. Implementing missing email verification flow
2. Adding password reset functionality  
3. Creating missing authentication pages
4. Adding route protection middleware
5. Ensuring all components work together seamlessly

## Functional Requirements

### 1. Email Verification Flow
- **Verification Email**: Send upon registration with 24-hour expiry link
- **Verification Page**: Handle email verification tokens at `/auth/verify`
- **Verification Request Page**: Show instructions at `/auth/verify-request`
- **Dashboard Restriction**: Unverified users see limited dashboard with verification prompt
- **Resend Option**: Allow users to request new verification email

### 2. Password Reset Flow
- **Forgot Password Page**: Form to request reset at `/auth/forgot-password`
- **Reset Email**: Send secure token link (24-hour expiry)
- **Reset Password Page**: Form to set new password at `/auth/reset-password`
- **Security Notification**: Email user when password is reset
- **Login Required**: User must login with new password (no auto-login)

### 3. Authentication Pages
- **Error Page** (`/auth/error`): Display auth errors gracefully
- **Logout Page** (`/auth/logout`): Confirm logout action
- **Welcome Page** (`/auth/welcome`): Greet new users after signup
- **All Pages**: Follow LCARS theme with orange/cyan accents

### 4. Route Protection
- **Protected Routes**: `/dashboard`, `/experiment/*`, `/designs`
- **Redirect Behavior**: Unauthenticated users redirected to `/auth/login`
- **Callback URL**: Preserve intended destination after login
- **API Protection**: Secure API endpoints requiring authentication

### 5. User Experience
- **Loading States**: Show spinners during async operations
- **Error Messages**: Clear, actionable error feedback
- **Success Feedback**: Confirmation with automatic redirects
- **Mobile Responsive**: All auth pages work on mobile devices

## Technical Requirements

### API Endpoints to Implement

1. **POST `/api/auth/forgot-password`**
   - Accept email address
   - Generate reset token
   - Send reset email
   - Rate limit requests

2. **POST `/api/auth/reset-password`**
   - Validate reset token
   - Update password
   - Invalidate token
   - Send notification email

3. **GET `/api/auth/verify`**
   - Validate verification token
   - Update emailVerified timestamp
   - Redirect to dashboard

### Pages to Create

All pages should follow existing patterns from login/signup pages:

1. `/app/auth/verify/page.tsx` - Process verification tokens
2. `/app/auth/verify-request/page.tsx` - Show verification instructions
3. `/app/auth/forgot-password/page.tsx` - Request password reset
4. `/app/auth/reset-password/page.tsx` - Set new password
5. `/app/auth/error/page.tsx` - Display auth errors
6. `/app/auth/logout/page.tsx` - Logout confirmation
7. `/app/auth/welcome/page.tsx` - New user welcome

### Middleware Updates

Update `/middleware.ts` to:
- Protect authenticated routes
- Redirect to login with callback URL
- Check email verification status
- Allow partial access for unverified users

### Validation Schemas

Add to `/lib/auth/validation.ts`:
- `forgotPasswordSchema` - email validation
- `resetPasswordSchema` - token + new password
- `verifyEmailSchema` - token validation

## Implementation Hints

### Follow Existing Patterns

1. **UI Components**:
   ```tsx
   // Use existing LCARS style from login page
   <div className="bg-gradient-to-r from-orange-500 to-orange-600 h-2 w-full rounded-t-lg"></div>
   ```

2. **Form Handling**:
   ```tsx
   // React Hook Form + Zod pattern
   const { register, handleSubmit, formState: { errors } } = useForm<InputType>({
     resolver: zodResolver(schema),
   });
   ```

3. **API Routes**:
   ```tsx
   // Standard NextResponse pattern
   return NextResponse.json({ message: "Success" }, { status: 200 });
   ```

4. **Email Sending**:
   ```tsx
   // Use existing email service
   import { sendPasswordResetEmail } from '@/lib/email';
   ```

### Security Considerations

- Validate all tokens before processing
- Use constant-time comparison for tokens
- Rate limit password reset requests
- Log security events (password changes)
- Clear sessions after password reset

## Acceptance Criteria

1. ✅ Users can create accounts with email/password
2. ✅ Users receive verification emails after signup
3. ✅ Email verification links work and expire after 24 hours
4. ✅ Users can request password reset via email
5. ✅ Password reset links work and expire after 24 hours
6. ✅ Unverified users see restricted dashboard
7. ✅ Protected routes redirect to login
8. ✅ All auth pages follow LCARS theme
9. ✅ Mobile responsive on all devices
10. ✅ Proper error handling throughout

## Assumptions

1. SMTP configuration will be provided for email sending
2. PostgreSQL database is properly configured
3. Environment variables are set correctly
4. Existing NextAuth configuration is retained
5. No changes to current user roles system
6. 2FA implementation deferred to future phase

## Out of Scope

- Two-factor authentication implementation
- Additional OAuth providers beyond Google
- Account linking between providers
- Admin user management interface
- Bulk user import/export
- SSO/SAML integration

## Success Metrics

- All authentication flows work end-to-end
- No users locked out without recovery option
- Email delivery success rate > 95%
- Page load times < 2 seconds
- Zero security vulnerabilities in auth flow
# Detail Answers - Create Account and Login

## Q6: Should the email verification link expire after 24 hours (standard practice)?
**Answer:** Yes

## Q7: When users reset their password, should we automatically log them in or require them to login with the new password?
**Answer:** No (require login with new password)

## Q8: Should unverified users be able to login but see a restricted dashboard prompting email verification?
**Answer:** Yes

## Q9: Should we send a notification email when a password is successfully reset for security awareness?
**Answer:** Yes

## Q10: Should the middleware automatically redirect unauthenticated users to /auth/login when accessing protected routes like /dashboard and /experiment?
**Answer:** Yes

## Implementation Details Confirmed
- Email verification links expire in 24 hours
- Password reset requires subsequent login (no auto-login)
- Unverified users can access limited dashboard with verification prompt
- Security notification sent on password reset
- Protected routes redirect to login when unauthenticated
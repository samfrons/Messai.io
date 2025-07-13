# Security Policy

## Reporting Security Vulnerabilities

We take the security of MESSAi seriously. If you discover a security vulnerability, please follow these steps:

### 1. Do NOT create a public GitHub issue
Security vulnerabilities should be reported privately to protect users.

### 2. Email us directly
Send details to: **security@messai.com**

Include:
- Description of the vulnerability
- Steps to reproduce
- Potential impact
- Suggested fix (if known)

### 3. Response Timeline
- **Acknowledgment**: Within 24 hours
- **Initial Assessment**: Within 72 hours  
- **Fix Timeline**: Varies by severity (1-30 days)
- **Public Disclosure**: After fix is deployed

## Security Best Practices

### For Developers

#### Environment Variables
- Never commit `.env` files
- Use strong, unique secrets for each environment
- Rotate secrets regularly
- Use environment-specific configurations

#### Authentication
- Enable email verification in production
- Use strong `NEXTAUTH_SECRET` (32+ characters)
- Implement proper session management
- Add rate limiting to auth endpoints

#### Database Security
- Use parameterized queries (Prisma handles this)
- Implement proper access controls
- Regular backup and recovery testing
- Monitor for suspicious activity

#### API Security
- Validate all inputs
- Implement rate limiting
- Use HTTPS only in production
- Sanitize data before storage

### For Self-Hosters

#### Server Security
- Keep OS and dependencies updated
- Use firewall to restrict access
- Enable fail2ban or similar
- Regular security audits

#### Database Security
- Use strong database passwords
- Restrict database network access
- Enable database encryption
- Regular backups to secure location

#### HTTPS Configuration
- Use valid SSL certificates
- Enable HSTS headers
- Implement proper CSP headers
- Regular SSL/TLS configuration checks

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 1.x.x   | ✅ Active support  |
| 0.x.x   | ❌ Not supported   |

## Security Features

### Built-in Security

#### Authentication
- NextAuth.js with secure session management
- Password hashing with bcrypt
- Email verification support
- OAuth integration (Google)

#### Data Protection
- SQL injection prevention (Prisma ORM)
- XSS protection
- CSRF protection
- Input validation and sanitization

#### Headers and Security
- Security headers configuration
- Content Security Policy (CSP)
- Rate limiting capabilities
- CORS configuration

### Recommended Production Setup

#### Environment Security
```bash
# Use strong secrets
NEXTAUTH_SECRET="very-long-random-string-minimum-32-characters"

# Enable email verification
REQUIRE_EMAIL_VERIFICATION="true"

# Use secure database connection
DATABASE_URL="postgresql://user:password@host:5432/db?sslmode=require"
```

#### Vercel Security Headers
```json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-Content-Type-Options", 
          "value": "nosniff"
        },
        {
          "key": "Referrer-Policy",
          "value": "strict-origin-when-cross-origin"
        },
        {
          "key": "Strict-Transport-Security",
          "value": "max-age=31536000; includeSubDomains"
        }
      ]
    }
  ]
}
```

## Known Security Considerations

### Development Environment
- SQLite database is stored in repository (development only)
- Debug logging may contain sensitive information
- Development secrets are included in `.env.local` (not committed)

### Production Recommendations
- Use PostgreSQL with SSL
- Enable all security headers
- Implement monitoring and alerting
- Regular security updates
- Backup and disaster recovery plan

## Contact

For security-related questions or concerns:
- **Email**: security@messai.com
- **GPG Key**: [Public key for encrypted communication]

## Acknowledgments

We appreciate responsible disclosure and will acknowledge security researchers who help improve MESSAi's security.
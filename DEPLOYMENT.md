# MESSAi Deployment Guide

## Overview

MESSAi uses a dual-deployment strategy:
- **messai.io** - Marketing site and landing pages (private content)
- **app.messai.io** - Research platform application (open source)

## Environment Modes

### Demo Mode (Default for Cloned Repos)
When users clone the repository, they get a fully functional demo:
```env
DEMO_MODE="true"
NEXT_PUBLIC_DEMO_MODE="true"
```

### Production Mode (messai.io)
For production deployment:
```env
DEMO_MODE="false"
NEXT_PUBLIC_DEMO_MODE="false"
PRODUCTION_URL="https://messai.io"
```

## Vercel Deployment (Recommended)

### 1. Prerequisites
- Vercel account
- PostgreSQL database (Vercel Postgres, Supabase, or PlanetScale)
- Email service (SendGrid, Resend, or similar)

### 2. Environment Variables Setup

In your Vercel dashboard, add these environment variables:

```bash
# Database
DATABASE_URL="postgresql://..."

# NextAuth
NEXTAUTH_URL="https://your-app.vercel.app"
NEXTAUTH_SECRET="your-secure-secret"

# OAuth (Optional)
GOOGLE_CLIENT_ID="..."
GOOGLE_CLIENT_SECRET="..."

# Email Service (Optional)
SMTP_HOST="smtp.sendgrid.net"
SMTP_PORT="587"
SMTP_USER="apikey"
SMTP_PASSWORD="your-sendgrid-key"
SMTP_FROM="MESSAi <noreply@yourdomain.com>"

# Features
REQUIRE_EMAIL_VERIFICATION="true"
NEXT_PUBLIC_REQUIRE_EMAIL_VERIFICATION="true"
```

### 3. Deploy Steps

1. **Connect GitHub Repository**
   ```bash
   # Fork the repository
   gh repo fork your-org/messai-mvp
   
   # Connect to Vercel
   vercel --prod
   ```

2. **Set Environment Variables**
   - Go to Vercel Dashboard > Settings > Environment Variables
   - Add all variables from `.env.production.example`

3. **Deploy**
   ```bash
   vercel --prod
   ```

## Self-Hosted Deployment

### Docker Setup

1. **Create docker-compose.yml**
   ```yaml
   version: '3.8'
   services:
     app:
       build: .
       ports:
         - "3000:3000"
       environment:
         - DATABASE_URL=postgresql://...
         - NEXTAUTH_URL=https://yourdomain.com
       depends_on:
         - postgres
     
     postgres:
       image: postgres:15
       environment:
         POSTGRES_DB: messai
         POSTGRES_USER: postgres
         POSTGRES_PASSWORD: password
       volumes:
         - postgres_data:/var/lib/postgresql/data
   
   volumes:
     postgres_data:
   ```

2. **Deploy**
   ```bash
   docker-compose up -d
   ```

### Traditional Server Deployment

1. **Install Dependencies**
   ```bash
   npm install
   npm run build
   ```

2. **Set Environment Variables**
   ```bash
   export DATABASE_URL="postgresql://..."
   export NEXTAUTH_URL="https://yourdomain.com"
   export NEXTAUTH_SECRET="your-secret"
   ```

3. **Start Application**
   ```bash
   npm start
   ```

## Database Setup

### 1. PostgreSQL Setup
```sql
-- Create database
CREATE DATABASE messai;

-- Create user
CREATE USER messai_user WITH PASSWORD 'secure_password';
GRANT ALL PRIVILEGES ON DATABASE messai TO messai_user;
```

### 2. Run Migrations
```bash
npx prisma migrate deploy
npx prisma generate
```

### 3. Seed Database (Optional)
```bash
npx prisma db seed
```

## Email Configuration

### SendGrid Setup
1. Create SendGrid account
2. Create API key
3. Add to environment variables:
   ```bash
   SMTP_HOST="smtp.sendgrid.net"
   SMTP_PORT="587"
   SMTP_USER="apikey"
   SMTP_PASSWORD="your-sendgrid-api-key"
   ```

### Resend Setup
```bash
SMTP_HOST="smtp.resend.com"
SMTP_PORT="587"
SMTP_USER="resend"
SMTP_PASSWORD="your-resend-api-key"
```

## Security Considerations

### Production Security Checklist
- [ ] Use strong `NEXTAUTH_SECRET` (32+ characters)
- [ ] Enable HTTPS only
- [ ] Configure proper CORS settings
- [ ] Use environment variables for all secrets
- [ ] Enable email verification
- [ ] Set up monitoring and logging
- [ ] Configure rate limiting
- [ ] Use secure database connections

### Environment Variables Security
- Never commit `.env.local` or `.env.production`
- Use Vercel's environment variables dashboard
- Rotate secrets regularly
- Use different secrets for different environments

## Monitoring and Analytics

### Error Tracking with Sentry
```bash
SENTRY_DSN="https://your-sentry-dsn@sentry.io/project"
```

### Analytics with Google Analytics
```bash
NEXT_PUBLIC_GOOGLE_ANALYTICS="G-XXXXXXXXXX"
```

## Troubleshooting

### Common Issues

1. **Database Connection Errors**
   - Check `DATABASE_URL` format
   - Verify database is accessible
   - Run `npx prisma db push` to sync schema

2. **Authentication Issues**
   - Verify `NEXTAUTH_URL` matches your domain
   - Check `NEXTAUTH_SECRET` is set
   - Ensure OAuth redirects are configured

3. **Email Not Sending**
   - Test SMTP credentials
   - Check firewall settings
   - Verify email service configuration

### Getting Help
- Check [GitHub Issues](https://github.com/your-org/messai-mvp/issues)
- Join our [Discord](https://discord.gg/messai)
- Email: support@messai.com
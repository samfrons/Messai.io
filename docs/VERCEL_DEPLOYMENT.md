# Deploying MESSAi Authentication to Vercel

## Prerequisites
- Vercel account (https://vercel.com)
- Cloud database (PostgreSQL recommended)

## Step 1: Set Up Cloud Database

### Option A: Vercel Postgres (Easiest)
1. Go to your Vercel dashboard
2. Select your project
3. Go to "Storage" tab
4. Click "Create Database"
5. Choose "Postgres"
6. Follow the setup wizard
7. Vercel will automatically add the DATABASE_URL to your project

### Option B: Supabase (Free Tier)
1. Create account at https://supabase.com
2. Create new project
3. Go to Settings → Database
4. Copy the connection string (use "Connection pooling" URL for serverless)
5. Format: `postgresql://[user]:[password]@[host]:6543/postgres?pgbouncer=true`

### Option C: Neon (Free Tier)
1. Create account at https://neon.tech
2. Create new project
3. Copy the connection string from dashboard
4. Format: `postgresql://[user]:[password]@[host]/[database]?sslmode=require`

### Option D: PlanetScale (MySQL)
1. Create account at https://planetscale.com
2. Create database
3. Get connection string
4. Update schema.prisma to use MySQL provider

## Step 2: Update Your Code for Production

### 1. Revert to PostgreSQL Schema
```bash
# Switch back to PostgreSQL schema
mv prisma/schema.prisma prisma/schema.sqlite.prisma
mv prisma/schema.postgresql.prisma prisma/schema.prisma
```

### 2. Update package.json
Add a postinstall script for Prisma:
```json
{
  "scripts": {
    "postinstall": "prisma generate",
    "build": "prisma generate && next build"
  }
}
```

### 3. Create Environment Variables File
Create `.env.production` for reference (DO NOT commit this):
```env
# Database (use your cloud database URL)
DATABASE_URL="postgresql://user:password@host:5432/database?sslmode=require"

# NextAuth (update with your domain)
NEXTAUTH_URL="https://your-app.vercel.app"
NEXTAUTH_SECRET="generate-a-new-32-character-secret"

# Email Service (optional but recommended)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="your-email@gmail.com"
SMTP_PASSWORD="your-app-specific-password"
SMTP_FROM="MESSAi <noreply@your-domain.com>"

# Enable email verification in production
REQUIRE_EMAIL_VERIFICATION="true"
NEXT_PUBLIC_REQUIRE_EMAIL_VERIFICATION="true"

# Google OAuth (optional)
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
```

## Step 3: Set Up Vercel Environment Variables

1. Go to your Vercel project dashboard
2. Click "Settings" → "Environment Variables"
3. Add each variable from above:
   - `DATABASE_URL` (your cloud database URL)
   - `NEXTAUTH_SECRET` (generate with: `openssl rand -base64 32`)
   - `NEXTAUTH_URL` (your Vercel app URL)
   - All other variables as needed

## Step 4: Initialize Production Database

### Option A: Using Vercel CLI
```bash
# Install Vercel CLI
npm i -g vercel

# Link to your project
vercel link

# Pull environment variables
vercel env pull .env.production

# Push database schema
npx prisma db push
```

### Option B: Using Local Setup
```bash
# Create .env with production DATABASE_URL
echo "DATABASE_URL=your-production-database-url" > .env

# Push schema to production
npx prisma db push

# Generate migrations (recommended for production)
npx prisma migrate dev --name init
```

## Step 5: Deploy to Vercel

### Option A: GitHub Integration (Recommended)
1. Push your code to GitHub
2. Import project in Vercel from GitHub
3. Vercel will auto-deploy on every push

### Option B: Vercel CLI
```bash
# Deploy
vercel --prod

# Or if you haven't linked yet
vercel
```

## Step 6: Post-Deployment Setup

### 1. Update NextAuth URL
After deployment, update NEXTAUTH_URL to your actual domain:
- `https://your-project.vercel.app` or
- `https://your-custom-domain.com`

### 2. Set Up Email Service
For production email sending:

**Gmail Setup:**
1. Enable 2-factor authentication
2. Generate app-specific password
3. Use as SMTP_PASSWORD

**SendGrid Setup (Better for Production):**
1. Create account at sendgrid.com
2. Verify sender domain
3. Get API key
4. Update SMTP settings:
   - SMTP_HOST: smtp.sendgrid.net
   - SMTP_PORT: 587
   - SMTP_USER: apikey
   - SMTP_PASSWORD: your-sendgrid-api-key

### 3. Configure OAuth (Optional)
For Google OAuth:
1. Go to https://console.cloud.google.com
2. Create new project or select existing
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URIs:
   - `https://your-app.vercel.app/api/auth/callback/google`
6. Copy Client ID and Secret to Vercel env vars

## Step 7: Test Production Deployment

1. **Create Account**: Go to `https://your-app.vercel.app/auth/signup`
2. **Check Email**: Verify email arrives (check spam)
3. **Verify Email**: Click verification link
4. **Login**: Test login flow
5. **Password Reset**: Test forgot password flow
6. **Protected Routes**: Verify /dashboard requires login

## Troubleshooting

### Database Connection Issues
- Ensure SSL is enabled: `?sslmode=require`
- For Supabase: Use pooling connection string
- Check IP allowlist if applicable

### Authentication Errors
- Verify NEXTAUTH_SECRET is set
- Ensure NEXTAUTH_URL matches your domain exactly
- Check browser console for specific errors

### Email Not Sending
- Verify SMTP credentials
- Check email service logs
- Test with console.log first
- Consider using email service API instead of SMTP

### Build Failures
```bash
# Clear cache and rebuild
rm -rf .next node_modules
npm install
npm run build
```

### Environment Variables Not Loading
- Ensure variables are added to Vercel dashboard
- Redeploy after adding variables
- Check for typos in variable names

## Security Checklist

- [ ] Strong NEXTAUTH_SECRET (32+ characters)
- [ ] Database connection uses SSL
- [ ] Email verification enabled
- [ ] HTTPS enforced (automatic on Vercel)
- [ ] Environment variables not in code
- [ ] Rate limiting configured
- [ ] CORS properly configured

## Monitoring

### Vercel Analytics
- Enable in project settings
- Monitor function execution
- Track error rates

### Database Monitoring
- Set up connection pooling
- Monitor query performance
- Set up alerts for failures

### Error Tracking (Optional)
Consider adding Sentry:
```bash
npm install @sentry/nextjs
npx @sentry/wizard -i nextjs
```

## Useful Commands

```bash
# View production logs
vercel logs

# Check environment variables
vercel env ls

# Redeploy
vercel --prod

# Run production build locally
npm run build && npm start
```

## Next Steps

1. Set up custom domain
2. Configure email templates
3. Add monitoring/analytics
4. Set up automated backups
5. Configure rate limiting
6. Add 2FA support
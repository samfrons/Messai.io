# MESSAi Deployment Guide

This guide covers various deployment options for the MESSAi platform, from simple cloud deployments to complex enterprise setups.

## Table of Contents
- [Prerequisites](#prerequisites)
- [Environment Variables](#environment-variables)
- [Deployment Options](#deployment-options)
  - [Vercel (Recommended)](#vercel-recommended)
  - [Docker](#docker)
  - [Traditional Node.js](#traditional-nodejs)
  - [Kubernetes](#kubernetes)
- [Database Setup](#database-setup)
- [Post-Deployment](#post-deployment)
- [Monitoring](#monitoring)
- [Troubleshooting](#troubleshooting)

## Prerequisites

Before deploying MESSAi, ensure you have:

- Node.js 18+ (for build process)
- A PostgreSQL database (production)
- Domain name (optional but recommended)
- SSL certificate (for HTTPS)

## Environment Variables

Create a `.env.production` file with the following variables:

```bash
# Database
DATABASE_URL="postgresql://user:password@host:5432/messai_db"

# Application
NEXTAUTH_URL="https://your-domain.com"
NEXTAUTH_SECRET="generate-a-secure-random-string"

# Optional: External Services
OPENAI_API_KEY="your-openai-key"
SENTRY_DSN="your-sentry-dsn"
ANALYTICS_ID="your-analytics-id"

# Performance
NODE_ENV="production"
```

### Generating Secrets

```bash
# Generate NEXTAUTH_SECRET
openssl rand -base64 32
```

## Deployment Options

### Vercel (Recommended)

The easiest way to deploy MESSAi:

1. **Push to GitHub**
   ```bash
   git push origin main
   ```

2. **Import to Vercel**
   - Go to [Vercel Dashboard](https://vercel.com/dashboard)
   - Click "New Project"
   - Import your GitHub repository
   - Configure environment variables

3. **Deploy**
   - Vercel automatically deploys on push
   - Preview deployments for PRs

**Vercel Configuration** (`vercel.json`):
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": ".next",
  "devCommand": "npm run dev",
  "installCommand": "npm install",
  "framework": "nextjs",
  "regions": ["iad1"],
  "env": {
    "NODE_ENV": "production"
  }
}
```

### Docker

For containerized deployments:

1. **Build the image**:
   ```bash
   docker build -t messai:latest .
   ```

2. **Run the container**:
   ```bash
   docker run -p 3000:3000 \
     -e DATABASE_URL="your-database-url" \
     -e NEXTAUTH_SECRET="your-secret" \
     messai:latest
   ```

3. **Docker Compose** (`docker-compose.yml`):
   ```yaml
   version: '3.8'
   services:
     app:
       build: .
       ports:
         - "3000:3000"
       environment:
         - DATABASE_URL=${DATABASE_URL}
         - NEXTAUTH_SECRET=${NEXTAUTH_SECRET}
       depends_on:
         - db
     
     db:
       image: postgres:15
       volumes:
         - postgres_data:/var/lib/postgresql/data
       environment:
         - POSTGRES_DB=messai
         - POSTGRES_USER=messai_user
         - POSTGRES_PASSWORD=${DB_PASSWORD}
   
   volumes:
     postgres_data:
   ```

### Traditional Node.js

For VPS or dedicated server deployment:

1. **Clone and build**:
   ```bash
   git clone https://github.com/your-org/messai.git
   cd messai
   npm install
   npm run build
   ```

2. **Set up PM2**:
   ```bash
   npm install -g pm2
   pm2 start npm --name "messai" -- start
   pm2 save
   pm2 startup
   ```

3. **Configure Nginx**:
   ```nginx
   server {
       listen 80;
       server_name your-domain.com;
       
       location / {
           proxy_pass http://localhost:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

4. **SSL with Certbot**:
   ```bash
   sudo certbot --nginx -d your-domain.com
   ```

### Kubernetes

For enterprise deployments:

1. **Deployment manifest** (`k8s/deployment.yaml`):
   ```yaml
   apiVersion: apps/v1
   kind: Deployment
   metadata:
     name: messai
   spec:
     replicas: 3
     selector:
       matchLabels:
         app: messai
     template:
       metadata:
         labels:
           app: messai
       spec:
         containers:
         - name: messai
           image: your-registry/messai:latest
           ports:
           - containerPort: 3000
           env:
           - name: DATABASE_URL
             valueFrom:
               secretKeyRef:
                 name: messai-secrets
                 key: database-url
   ```

2. **Service manifest** (`k8s/service.yaml`):
   ```yaml
   apiVersion: v1
   kind: Service
   metadata:
     name: messai-service
   spec:
     selector:
       app: messai
     ports:
       - protocol: TCP
         port: 80
         targetPort: 3000
     type: LoadBalancer
   ```

3. **Deploy**:
   ```bash
   kubectl apply -f k8s/
   ```

## Database Setup

### PostgreSQL Setup

1. **Create database**:
   ```sql
   CREATE DATABASE messai_production;
   CREATE USER messai_user WITH ENCRYPTED PASSWORD 'secure-password';
   GRANT ALL PRIVILEGES ON DATABASE messai_production TO messai_user;
   ```

2. **Run migrations**:
   ```bash
   npx prisma migrate deploy
   ```

3. **Seed initial data** (optional):
   ```bash
   npx prisma db seed
   ```

### Database Backups

Set up automated backups:

```bash
# Backup script (backup.sh)
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
pg_dump $DATABASE_URL > backup_$DATE.sql
# Upload to S3 or other storage
aws s3 cp backup_$DATE.sql s3://your-bucket/backups/
```

## Post-Deployment

### 1. Health Checks

Verify deployment:
```bash
curl https://your-domain.com/api/health
```

### 2. Configure Monitoring

Set up monitoring with services like:
- **Sentry** for error tracking
- **Google Analytics** for usage metrics
- **Datadog** for performance monitoring

### 3. Set Up CDN

Configure CDN for static assets:
- CloudFlare
- AWS CloudFront
- Vercel Edge Network (automatic)

### 4. Configure Backups

- Database backups (daily)
- Application state backups
- User data exports

## Monitoring

### Application Metrics

Monitor key metrics:
- Response times
- Error rates
- CPU/Memory usage
- Database query performance

### Logging

Configure structured logging:

```typescript
// lib/logger.ts
import winston from 'winston';

export const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});
```

### Alerts

Set up alerts for:
- High error rates
- Performance degradation
- Database connection issues
- Disk space warnings

## Troubleshooting

### Common Issues

#### Build Failures
```bash
# Clear cache and rebuild
rm -rf .next node_modules
npm install
npm run build
```

#### Database Connection
```bash
# Test database connection
npx prisma db pull
```

#### Memory Issues
```bash
# Increase Node.js memory
NODE_OPTIONS="--max-old-space-size=4096" npm run build
```

### Performance Optimization

1. **Enable caching**:
   ```typescript
   // next.config.js
   module.exports = {
     headers: async () => [
       {
         source: '/:all*(svg|jpg|png)',
         headers: [
           {
             key: 'Cache-Control',
             value: 'public, max-age=31536000, immutable',
           },
         ],
       },
     ],
   };
   ```

2. **Optimize images**:
   ```bash
   npm install --save-dev @next/bundle-analyzer
   ```

3. **Enable compression**:
   ```typescript
   // server.js
   const compression = require('compression');
   app.use(compression());
   ```

### Security Checklist

- [ ] HTTPS enabled
- [ ] Security headers configured
- [ ] Database credentials secured
- [ ] API rate limiting enabled
- [ ] CORS properly configured
- [ ] Input validation active
- [ ] SQL injection protection (via Prisma)
- [ ] XSS protection enabled

## Scaling Considerations

### Horizontal Scaling

1. **Load Balancer**: Distribute traffic across instances
2. **Session Management**: Use Redis for session storage
3. **Database Pooling**: Configure connection pooling
4. **Static Assets**: Serve from CDN

### Vertical Scaling

1. **Increase server resources**: CPU, RAM
2. **Optimize database queries**: Add indexes
3. **Enable caching**: Redis, Memcached
4. **Code optimization**: Profile and optimize hot paths

## Rollback Procedure

In case of issues:

1. **Vercel**: Use instant rollback feature
2. **Docker**: Deploy previous image tag
3. **Traditional**: Use PM2 or systemd to revert
4. **Database**: Restore from backup if needed

```bash
# Example rollback
pm2 stop messai
git checkout previous-version
npm install
npm run build
pm2 restart messai
```

## Support

For deployment support:
- Check [GitHub Discussions](https://github.com/your-org/messai/discussions)
- Review [deployment examples](https://github.com/your-org/messai/tree/main/examples/deployment)
- Contact support@messai.com for enterprise deployments
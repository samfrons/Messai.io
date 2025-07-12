# Fuel Cell System Deployment Configuration

## Environment Variables

Add these to your `.env.local` or production environment:

```bash
# Fuel Cell Feature Flags
NEXT_PUBLIC_ENABLE_FUEL_CELL=true
NEXT_PUBLIC_ENABLE_OPTIMIZATION=true
NEXT_PUBLIC_ENABLE_HIL_TESTING=true
NEXT_PUBLIC_ENABLE_COMPARISON=true

# Performance Settings
NEXT_PUBLIC_MAX_CELL_COUNT=1000
NEXT_PUBLIC_MAX_OPTIMIZATION_ITERATIONS=500
NEXT_PUBLIC_CACHE_DURATION=300000 # 5 minutes

# API Rate Limiting
FUEL_CELL_API_RATE_LIMIT=100
FUEL_CELL_API_RATE_WINDOW=60000 # 1 minute
```

## Database Migration

Run the following to update your database schema:

```bash
# Generate Prisma client
npx prisma generate

# Push schema to database
npx prisma db push

# Run migrations (production)
npx prisma migrate deploy
```

## Performance Optimizations

### 1. Enable Next.js Optimizations

In `next.config.js`:

```javascript
module.exports = {
  experimental: {
    optimizeCss: true,
    optimizePackageImports: ['three', '@react-three/fiber', '@react-three/drei'],
  },
  images: {
    domains: ['your-domain.com'],
    formats: ['image/avif', 'image/webp'],
  },
  webpack: (config, { isServer }) => {
    // Optimize Three.js bundle
    if (!isServer) {
      config.resolve.alias = {
        ...config.resolve.alias,
        'three': require.resolve('three'),
      }
    }
    return config
  },
}
```

### 2. CDN Configuration

For static assets and 3D models:

```nginx
# nginx.conf
location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot|glb|gltf)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}
```

### 3. API Caching

Add Redis for API response caching:

```javascript
// lib/cache.ts
import Redis from 'ioredis'

const redis = new Redis(process.env.REDIS_URL)

export async function getCachedOrFetch<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttl: number = 300
): Promise<T> {
  const cached = await redis.get(key)
  if (cached) {
    return JSON.parse(cached)
  }
  
  const data = await fetcher()
  await redis.setex(key, ttl, JSON.stringify(data))
  return data
}
```

## Monitoring and Analytics

### 1. Performance Monitoring

Add to your pages:

```javascript
// app/layout.tsx
import { monitorMemoryUsage } from '@/lib/performance-optimization'

export default function RootLayout({ children }) {
  useEffect(() => {
    // Monitor memory usage in production
    if (process.env.NODE_ENV === 'production') {
      monitorMemoryUsage(150 * 1024 * 1024) // 150MB threshold
    }
  }, [])
  
  return (
    <html>
      <body>{children}</body>
    </html>
  )
}
```

### 2. Error Tracking

Configure Sentry or similar:

```javascript
// sentry.client.config.js
Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  integrations: [
    new Sentry.BrowserTracing(),
    new Sentry.Replay(),
  ],
  tracesSampleRate: 0.1,
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
})
```

### 3. Analytics Events

Track fuel cell feature usage:

```javascript
// lib/analytics.ts
export const trackFuelCellEvent = (event: string, properties?: any) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', event, {
      event_category: 'fuel_cell',
      ...properties,
    })
  }
}
```

## Deployment Checklist

### Pre-deployment

- [ ] Run all tests: `npm test`
- [ ] Build successfully: `npm run build`
- [ ] Check bundle size: `npm run analyze`
- [ ] Test on mobile devices
- [ ] Verify all API endpoints
- [ ] Check memory usage with dev tools
- [ ] Test with slow network (3G)

### Production Configuration

- [ ] Set up environment variables
- [ ] Configure database connections
- [ ] Set up Redis cache
- [ ] Configure CDN
- [ ] Enable GZIP compression
- [ ] Set up SSL certificates
- [ ] Configure rate limiting
- [ ] Set up monitoring alerts

### Post-deployment

- [ ] Verify all features work
- [ ] Check performance metrics
- [ ] Monitor error rates
- [ ] Test API response times
- [ ] Verify 3D rendering on various devices
- [ ] Check memory usage patterns
- [ ] Monitor user engagement

## Rollback Plan

If issues arise:

1. Disable fuel cell features via environment variable
2. Revert to previous deployment
3. Clear Redis cache
4. Notify users of temporary unavailability

```bash
# Quick disable
NEXT_PUBLIC_ENABLE_FUEL_CELL=false npm run build && npm run start
```

## Security Considerations

1. **API Rate Limiting**: Implemented per-user limits
2. **Input Validation**: All API inputs validated with Zod
3. **CORS Configuration**: Restricted to allowed origins
4. **Authentication**: Ensure proper auth for sensitive operations
5. **Data Sanitization**: All user inputs sanitized before storage

## Browser Support

Minimum requirements:
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+
- WebGL 2.0 support required for 3D visualization

## Mobile Optimization

- Responsive design implemented
- Touch controls for 3D models
- Reduced particle count on mobile
- Simplified UI for small screens
- Progressive enhancement approach
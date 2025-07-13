// Feature and environment configuration
export const config = {
  // Environment detection
  isDevelopment: process.env.NODE_ENV === 'development',
  isProduction: process.env.NODE_ENV === 'production',
  
  // App configuration
  app: {
    name: 'MESSAi',
    url: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3003',
    description: 'Microbial Electrochemical Systems AI Platform',
  },
  
  // Feature flags
  features: {
    // Core features (always enabled)
    experiments: true,
    literature: true,
    dashboard: true,
    
    // Premium features (controlled by environment)
    grants: process.env.ENABLE_GRANTS_DATABASE !== 'false',
    aiInsights: process.env.ENABLE_AI_INSIGHTS !== 'false',
    premiumModels: process.env.ENABLE_PREMIUM_FEATURES === 'true',
    
    // Beta features (opt-in)
    collaborativeExperiments: process.env.ENABLE_BETA_FEATURES === 'true',
    realTimeSensors: process.env.ENABLE_BETA_FEATURES === 'true',
    advancedAnalytics: process.env.ENABLE_BETA_FEATURES === 'true',
  },
  
  // Authentication configuration
  auth: {
    requireEmailVerification: process.env.REQUIRE_EMAIL_VERIFICATION === 'true',
    allowGoogleOAuth: !!(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET),
    sessionTimeout: 30 * 24 * 60 * 60, // 30 days in seconds
  },
  
  // Database configuration
  database: {
    url: process.env.DATABASE_URL || 'file:./prisma/dev.db',
    logQueries: process.env.NODE_ENV === 'development',
  },
  
  // Email configuration
  email: {
    enabled: !!(process.env.SMTP_HOST && process.env.SMTP_USER),
    from: process.env.SMTP_FROM || 'MESSAi <noreply@messai.com>',
    requireVerification: process.env.REQUIRE_EMAIL_VERIFICATION === 'true',
  },
  
  // Analytics and monitoring
  analytics: {
    googleAnalytics: process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS,
    sentry: process.env.SENTRY_DSN,
    enabled: process.env.NODE_ENV === 'production',
  },
  
  // Rate limiting
  rateLimit: {
    enabled: process.env.NODE_ENV === 'production',
    requests: 100, // requests per window
    window: 15 * 60 * 1000, // 15 minutes
  },
  
  // File uploads
  uploads: {
    enabled: process.env.ENABLE_FILE_UPLOADS === 'true',
    maxSize: 10 * 1024 * 1024, // 10MB
    allowedTypes: ['image/jpeg', 'image/png', 'application/pdf'],
  },
}

// Helper functions
export const isFeatureEnabled = (feature: keyof typeof config.features): boolean => {
  return config.features[feature] === true
}

export const getAppUrl = (): string => {
  return config.app.url
}

export const isDevelopment = (): boolean => {
  return config.isDevelopment
}

export const isProduction = (): boolean => {
  return config.isProduction
}
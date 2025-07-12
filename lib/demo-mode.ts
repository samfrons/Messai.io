/**
 * Demo Mode Utilities
 * 
 * Handles demo mode configuration for cloned repositories
 */

export function isDemoMode(): boolean {
  // Check both server and client environment variables
  return process.env.DEMO_MODE === 'true' || 
         process.env.NEXT_PUBLIC_DEMO_MODE === 'true' ||
         (typeof window !== 'undefined' && localStorage.getItem('DEMO_MODE') === 'true')
}

export function getProductionUrl(): string {
  return process.env.PRODUCTION_URL || 'https://messai.io'
}

export function getDemoConfig() {
  return {
    isDemo: isDemoMode(),
    productionUrl: getProductionUrl(),
    showAuth: !isDemoMode(),
    showPersonalFeatures: !isDemoMode(),
    demoMessage: "You're viewing the MESSAi demo. Visit messai.io for the full platform with personal accounts and advanced features."
  }
}
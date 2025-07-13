import { test, expect } from '@playwright/test'

test.describe('API Health Checks', () => {
  test('should return healthy status from health endpoint', async ({ request }) => {
    const response = await request.get('/api/health')
    
    expect(response.status()).toBe(200)
    
    const data = await response.json()
    expect(data).toHaveProperty('status', 'healthy')
    expect(data).toHaveProperty('timestamp')
    expect(data).toHaveProperty('uptime')
  })

  test('should handle API requests with proper headers', async ({ request }) => {
    const response = await request.get('/api/health')
    
    // Check security headers are present
    expect(response.headers()['x-frame-options']).toBe('DENY')
    expect(response.headers()['x-content-type-options']).toBe('nosniff')
    expect(response.headers()['content-security-policy']).toBeTruthy()
  })

  test('should respond within acceptable time limits', async ({ request }) => {
    const startTime = Date.now()
    const response = await request.get('/api/health')
    const endTime = Date.now()
    
    expect(response.status()).toBe(200)
    expect(endTime - startTime).toBeLessThan(1000) // Should respond in under 1 second
  })
})
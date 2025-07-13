import { test, expect } from '@playwright/test'

test.describe('Homepage', () => {
  test('should load the homepage successfully', async ({ page }) => {
    await page.goto('/')
    
    // Check that the page loads
    await expect(page).toHaveTitle(/MESSAi/)
    
    // Check for main heading
    await expect(page.getByRole('heading', { name: /MESSAi Platform/i })).toBeVisible()
    
    // Check for navigation elements
    await expect(page.getByText('Clean architecture foundation')).toBeVisible()
  })

  test('should display system status cards', async ({ page }) => {
    await page.goto('/')
    
    // Check for status cards
    await expect(page.getByText('System Status')).toBeVisible()
    await expect(page.getByText('Scientific Constants')).toBeVisible()
    await expect(page.getByText('Supported Systems')).toBeVisible()
    
    // Check for status indicators
    await expect(page.getByText('✓ Loaded')).toBeVisible()
    await expect(page.getByText('✓ Ready')).toBeVisible()
    await expect(page.getByText('✓ Active')).toBeVisible()
  })

  test('should display scientific constants correctly', async ({ page }) => {
    await page.goto('/')
    
    // Check for scientific constants
    await expect(page.getByText('Faraday Constant:')).toBeVisible()
    await expect(page.getByText('Gas Constant:')).toBeVisible()
    await expect(page.getByText('Standard Temp:')).toBeVisible()
    
    // Check for constant values
    await expect(page.getByText('96,485')).toBeVisible() // Faraday constant
    await expect(page.getByText('8.314')).toBeVisible() // Gas constant
    await expect(page.getByText('298.15')).toBeVisible() // Standard temp
  })

  test('should display supported system types', async ({ page }) => {
    await page.goto('/')
    
    // Check for system type badges
    await expect(page.getByText('MFC')).toBeVisible()
    await expect(page.getByText('MEC')).toBeVisible()
    await expect(page.getByText('MDC')).toBeVisible()
    await expect(page.getByText('MES')).toBeVisible()
  })

  test('should have working action buttons', async ({ page }) => {
    await page.goto('/')
    
    // Check for action buttons
    const exploreButton = page.getByRole('button', { name: /explore features/i })
    const docsButton = page.getByRole('button', { name: /documentation/i })
    
    await expect(exploreButton).toBeVisible()
    await expect(docsButton).toBeVisible()
    
    // Buttons should be clickable
    await expect(exploreButton).toBeEnabled()
    await expect(docsButton).toBeEnabled()
  })
})
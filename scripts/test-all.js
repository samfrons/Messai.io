#!/usr/bin/env node

/**
 * Comprehensive test runner script
 * Runs all test categories in order and reports results
 */

const { execSync } = require('child_process')
const fs = require('fs')
const path = require('path')

const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  bold: '\x1b[1m'
}

function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`)
}

function runCommand(command, description) {
  log(`\n${colors.bold}${colors.blue}Running: ${description}${colors.reset}`)
  log(`${colors.cyan}Command: ${command}${colors.reset}`)
  
  try {
    const output = execSync(command, { 
      stdio: 'pipe',
      encoding: 'utf8',
      cwd: process.cwd()
    })
    
    log(`${colors.green}✅ ${description} - PASSED${colors.reset}`)
    return { success: true, output }
  } catch (error) {
    log(`${colors.red}❌ ${description} - FAILED${colors.reset}`)
    log(`${colors.red}Error: ${error.message}${colors.reset}`)
    return { success: false, error: error.message }
  }
}

function generateTestReport(results) {
  const timestamp = new Date().toISOString()
  const totalTests = results.length
  const passedTests = results.filter(r => r.success).length
  const failedTests = totalTests - passedTests
  
  const report = {
    timestamp,
    summary: {
      total: totalTests,
      passed: passedTests,
      failed: failedTests,
      passRate: ((passedTests / totalTests) * 100).toFixed(2)
    },
    results
  }
  
  // Write detailed report
  const reportPath = path.join(process.cwd(), 'test-report.json')
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2))
  
  return report
}

async function main() {
  log(`${colors.bold}${colors.magenta}🧪 MESSAi Comprehensive Test Suite${colors.reset}`)
  log(`${colors.cyan}Testing all functionality to prevent regressions...${colors.reset}`)
  
  const testSuites = [
    {
      name: 'Unit Tests - Components',
      command: 'npm run test tests/components/',
      critical: true
    },
    {
      name: 'Unit Tests - API',
      command: 'npm run test tests/api/',
      critical: true
    },
    {
      name: 'Integration Tests - Experiment Workflow',
      command: 'npm run test tests/integration/experiment-workflow.test.tsx',
      critical: true
    },
    {
      name: 'Integration Tests - Experiment Page',
      command: 'npm run test tests/integration/experiment-page.test.tsx',
      critical: true
    },
    {
      name: 'Regression Tests - Design Functionality',
      command: 'npm run test tests/regression/design-functionality.test.tsx',
      critical: true
    },
    {
      name: 'Regression Tests - AI Predictions',
      command: 'npm run test tests/regression/ai-predictions.test.ts',
      critical: true
    },
    {
      name: 'E2E Tests - Full Workflow',
      command: 'npm run test tests/e2e/',
      critical: false
    },
    {
      name: 'Performance Tests',
      command: 'npm run test tests/performance/',
      critical: false
    },
    {
      name: 'Accessibility Tests',
      command: 'npm run test tests/accessibility/',
      critical: false
    }
  ]
  
  const results = []
  let criticalFailures = 0
  
  for (const suite of testSuites) {
    const result = runCommand(suite.command, suite.name)
    result.name = suite.name
    result.critical = suite.critical
    results.push(result)
    
    if (!result.success && suite.critical) {
      criticalFailures++
    }
  }
  
  // Generate and display report
  const report = generateTestReport(results)
  
  log(`\n${colors.bold}${colors.magenta}📊 Test Results Summary${colors.reset}`)
  log(`${colors.cyan}Total Test Suites: ${report.summary.total}${colors.reset}`)
  log(`${colors.green}Passed: ${report.summary.passed}${colors.reset}`)
  log(`${colors.red}Failed: ${report.summary.failed}${colors.reset}`)
  log(`${colors.yellow}Pass Rate: ${report.summary.passRate}%${colors.reset}`)
  
  if (criticalFailures > 0) {
    log(`\n${colors.bold}${colors.red}🚨 CRITICAL FAILURES DETECTED: ${criticalFailures}${colors.reset}`)
    log(`${colors.red}These failures may break core functionality and should be fixed immediately.${colors.reset}`)
  }
  
  // Detailed results
  log(`\n${colors.bold}${colors.blue}📋 Detailed Results:${colors.reset}`)
  results.forEach((result, index) => {
    const status = result.success ? `${colors.green}✅ PASS` : `${colors.red}❌ FAIL`
    const critical = result.critical ? `${colors.yellow}[CRITICAL]` : `${colors.cyan}[OPTIONAL]`
    log(`${index + 1}. ${status} ${critical} ${result.name}${colors.reset}`)
  })
  
  // Recommendations
  log(`\n${colors.bold}${colors.magenta}💡 Recommendations:${colors.reset}`)
  
  if (criticalFailures === 0) {
    log(`${colors.green}✅ All critical tests passed! The application is stable for deployment.${colors.reset}`)
  } else {
    log(`${colors.red}❌ Fix critical test failures before deploying to prevent 404 errors and regressions.${colors.reset}`)
  }
  
  if (report.summary.failed > 0) {
    log(`${colors.yellow}⚠️  Consider fixing non-critical failures to improve overall quality.${colors.reset}`)
  }
  
  log(`${colors.cyan}📄 Detailed report saved to: test-report.json${colors.reset}`)
  
  // Exit with appropriate code
  process.exit(criticalFailures > 0 ? 1 : 0)
}

// Handle process termination
process.on('SIGINT', () => {
  log(`\n${colors.yellow}Test execution interrupted by user${colors.reset}`)
  process.exit(1)
})

process.on('uncaughtException', (error) => {
  log(`\n${colors.red}Uncaught exception: ${error.message}${colors.reset}`)
  process.exit(1)
})

main().catch((error) => {
  log(`\n${colors.red}Test runner failed: ${error.message}${colors.reset}`)
  process.exit(1)
})
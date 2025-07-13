// Health check endpoint with comprehensive system monitoring

import { NextRequest, NextResponse } from 'next/server'
import { apiMonitoring, alertSystem, apiAnalytics } from '@/lib/api/monitoring'
import { createApiResponse } from '@/lib/api/middleware'
import prisma from '@/lib/db'

export async function GET(request: NextRequest) {
  const url = request.nextUrl
  const detailed = url.searchParams.get('detailed') === 'true'
  const format = url.searchParams.get('format') || 'json'

  try {
    // Basic health status
    const healthStatus = apiMonitoring.getHealthStatus()
    
    // Database health check
    let databaseStatus = 'unknown'
    let databaseResponseTime = 0
    
    try {
      const start = performance.now()
      await prisma.$queryRaw`SELECT 1`
      databaseResponseTime = Math.round(performance.now() - start)
      databaseStatus = 'healthy'
    } catch (error) {
      databaseStatus = 'unhealthy'
      console.error('Database health check failed:', error)
    }

    // System metrics
    const metrics = apiMonitoring.getMetrics(3600000) // Last hour
    const alerts = alertSystem.checkAlerts()

    const healthData = {
      status: healthStatus.status,
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      uptime: process.uptime(),
      checks: [
        ...healthStatus.checks,
        {
          name: 'database',
          status: databaseStatus === 'healthy' ? 'pass' : 'fail',
          message: `Database ${databaseStatus}`,
          responseTime: databaseResponseTime,
        },
      ],
      metrics: {
        requests: {
          total: metrics.totalRequests,
          perMinute: metrics.requestsPerMinute,
          errorRate: metrics.errorRate,
        },
        performance: {
          averageResponseTime: metrics.averageResponseTime,
          p95ResponseTime: metrics.p95ResponseTime,
          p99ResponseTime: metrics.p99ResponseTime,
        },
      },
      alerts: alerts.length,
    }

    // Add detailed information if requested
    if (detailed) {
      const userAnalytics = apiAnalytics.getUserAnalytics()
      const endpointAnalytics = apiAnalytics.getEndpointAnalytics()

      Object.assign(healthData, {
        detailed: {
          alerts: alerts,
          topEndpoints: metrics.topEndpoints,
          errorsByCode: metrics.errorsByCode,
          userAnalytics: {
            totalUsers: userAnalytics.totalUsers,
            activeUsers: userAnalytics.activeUsers,
            roleDistribution: userAnalytics.userRoleDistribution,
          },
          systemInfo: {
            nodeVersion: process.version,
            platform: process.platform,
            arch: process.arch,
            memory: {
              used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
              total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
              external: Math.round(process.memoryUsage().external / 1024 / 1024),
            },
            cpu: process.cpuUsage(),
          },
          endpointAnalytics: endpointAnalytics.slice(0, 10), // Top 10 endpoints
        },
      })
    }

    // Return in different formats
    if (format === 'prometheus') {
      const prometheusMetrics = apiMonitoring.exportMetrics('prometheus')
      
      // Add health status metric
      const healthMetric = healthStatus.status === 'healthy' ? 1 : 0
      const prometheusOutput = `${prometheusMetrics}
# HELP messai_system_health System health status (1=healthy, 0=unhealthy)
# TYPE messai_system_health gauge
messai_system_health ${healthMetric}

# HELP messai_database_health Database health status (1=healthy, 0=unhealthy)
# TYPE messai_database_health gauge
messai_database_health ${databaseStatus === 'healthy' ? 1 : 0}

# HELP messai_database_response_time_ms Database response time in milliseconds
# TYPE messai_database_response_time_ms gauge
messai_database_response_time_ms ${databaseResponseTime}

# HELP messai_active_alerts Number of active alerts
# TYPE messai_active_alerts gauge
messai_active_alerts ${alerts.length}
`

      return new NextResponse(prometheusOutput, {
        headers: {
          'Content-Type': 'text/plain; version=0.0.4; charset=utf-8',
        },
      })
    }

    // Standard HTTP status based on health
    let httpStatus = 200
    if (healthStatus.status === 'degraded') {
      httpStatus = 200 // Still operational
    } else if (healthStatus.status === 'unhealthy') {
      httpStatus = 503 // Service unavailable
    }

    return createApiResponse(healthData, { status: httpStatus })

  } catch (error) {
    console.error('Health check error:', error)
    
    return createApiResponse(
      {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: 'Health check failed',
      },
      { status: 503 }
    )
  }
}

// Also support HEAD requests for simple health checks
export async function HEAD(request: NextRequest) {
  try {
    const healthStatus = apiMonitoring.getHealthStatus()
    
    if (healthStatus.status === 'healthy') {
      return new NextResponse(null, { status: 200 })
    } else if (healthStatus.status === 'degraded') {
      return new NextResponse(null, { status: 200 })
    } else {
      return new NextResponse(null, { status: 503 })
    }
  } catch (error) {
    return new NextResponse(null, { status: 503 })
  }
}
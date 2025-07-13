// API monitoring and observability system for MESSAI platform

import { NextRequest } from 'next/server'
import { ApiContext, ApiErrorCode } from './types'

// Metrics storage (in production, use a proper metrics database like InfluxDB or Prometheus)
interface MetricEntry {
  timestamp: number
  endpoint: string
  method: string
  statusCode: number
  responseTime: number
  userId?: string
  userRole?: string
  errorCode?: string
  requestSize?: number
  responseSize?: number
}

interface AggregatedMetrics {
  totalRequests: number
  averageResponseTime: number
  errorRate: number
  p95ResponseTime: number
  p99ResponseTime: number
  requestsPerMinute: number
  topEndpoints: Array<{ endpoint: string; count: number }>
  errorsByCode: Record<string, number>
  userActivity: Record<string, number>
}

class APIMonitoring {
  private metrics: MetricEntry[] = []
  private readonly maxMetricsSize = 10000 // Keep last 10k metrics in memory

  /**
   * Record a metric entry
   */
  recordMetric(entry: Omit<MetricEntry, 'timestamp'>) {
    const metric: MetricEntry = {
      ...entry,
      timestamp: Date.now(),
    }

    this.metrics.push(metric)

    // Prevent memory leak by limiting stored metrics
    if (this.metrics.length > this.maxMetricsSize) {
      this.metrics = this.metrics.slice(-this.maxMetricsSize)
    }

    // Log critical errors immediately
    if (entry.statusCode >= 500) {
      console.error('API Critical Error:', {
        endpoint: entry.endpoint,
        method: entry.method,
        statusCode: entry.statusCode,
        errorCode: entry.errorCode,
        userId: entry.userId,
        responseTime: entry.responseTime,
      })
    }

    // Log slow requests
    if (entry.responseTime > 5000) { // 5 seconds
      console.warn('API Slow Request:', {
        endpoint: entry.endpoint,
        method: entry.method,
        responseTime: entry.responseTime,
        userId: entry.userId,
      })
    }
  }

  /**
   * Get aggregated metrics for a time period
   */
  getMetrics(timeRangeMs: number = 3600000): AggregatedMetrics { // Default 1 hour
    const cutoff = Date.now() - timeRangeMs
    const recentMetrics = this.metrics.filter(m => m.timestamp > cutoff)

    if (recentMetrics.length === 0) {
      return {
        totalRequests: 0,
        averageResponseTime: 0,
        errorRate: 0,
        p95ResponseTime: 0,
        p99ResponseTime: 0,
        requestsPerMinute: 0,
        topEndpoints: [],
        errorsByCode: {},
        userActivity: {},
      }
    }

    // Calculate basic metrics
    const totalRequests = recentMetrics.length
    const totalResponseTime = recentMetrics.reduce((sum, m) => sum + m.responseTime, 0)
    const averageResponseTime = totalResponseTime / totalRequests

    // Calculate error rate
    const errorCount = recentMetrics.filter(m => m.statusCode >= 400).length
    const errorRate = errorCount / totalRequests

    // Calculate percentiles
    const responseTimes = recentMetrics.map(m => m.responseTime).sort((a, b) => a - b)
    const p95Index = Math.ceil(responseTimes.length * 0.95) - 1
    const p99Index = Math.ceil(responseTimes.length * 0.99) - 1
    const p95ResponseTime = responseTimes[p95Index] || 0
    const p99ResponseTime = responseTimes[p99Index] || 0

    // Calculate requests per minute
    const timeRangeMinutes = timeRangeMs / (1000 * 60)
    const requestsPerMinute = totalRequests / timeRangeMinutes

    // Top endpoints
    const endpointCounts = recentMetrics.reduce((acc, m) => {
      const key = `${m.method} ${m.endpoint}`
      acc[key] = (acc[key] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    const topEndpoints = Object.entries(endpointCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([endpoint, count]) => ({ endpoint, count }))

    // Errors by code
    const errorsByCode = recentMetrics
      .filter(m => m.errorCode)
      .reduce((acc, m) => {
        acc[m.errorCode!] = (acc[m.errorCode!] || 0) + 1
        return acc
      }, {} as Record<string, number>)

    // User activity
    const userActivity = recentMetrics
      .filter(m => m.userId)
      .reduce((acc, m) => {
        acc[m.userId!] = (acc[m.userId!] || 0) + 1
        return acc
      }, {} as Record<string, number>)

    return {
      totalRequests,
      averageResponseTime: Math.round(averageResponseTime),
      errorRate: Math.round(errorRate * 100) / 100,
      p95ResponseTime: Math.round(p95ResponseTime),
      p99ResponseTime: Math.round(p99ResponseTime),
      requestsPerMinute: Math.round(requestsPerMinute * 100) / 100,
      topEndpoints,
      errorsByCode,
      userActivity,
    }
  }

  /**
   * Get health status
   */
  getHealthStatus(): {
    status: 'healthy' | 'degraded' | 'unhealthy'
    checks: Array<{
      name: string
      status: 'pass' | 'fail' | 'warn'
      message: string
      responseTime?: number
    }>
  } {
    const metrics = this.getMetrics(300000) // Last 5 minutes
    const checks = []

    // Check error rate
    if (metrics.errorRate < 0.01) { // < 1%
      checks.push({
        name: 'error_rate',
        status: 'pass' as const,
        message: `Error rate: ${metrics.errorRate}%`,
      })
    } else if (metrics.errorRate < 0.05) { // < 5%
      checks.push({
        name: 'error_rate',
        status: 'warn' as const,
        message: `Elevated error rate: ${metrics.errorRate}%`,
      })
    } else {
      checks.push({
        name: 'error_rate',
        status: 'fail' as const,
        message: `High error rate: ${metrics.errorRate}%`,
      })
    }

    // Check response time
    if (metrics.p95ResponseTime < 1000) { // < 1s
      checks.push({
        name: 'response_time',
        status: 'pass' as const,
        message: `P95 response time: ${metrics.p95ResponseTime}ms`,
        responseTime: metrics.p95ResponseTime,
      })
    } else if (metrics.p95ResponseTime < 3000) { // < 3s
      checks.push({
        name: 'response_time',
        status: 'warn' as const,
        message: `Slow P95 response time: ${metrics.p95ResponseTime}ms`,
        responseTime: metrics.p95ResponseTime,
      })
    } else {
      checks.push({
        name: 'response_time',
        status: 'fail' as const,
        message: `Very slow P95 response time: ${metrics.p95ResponseTime}ms`,
        responseTime: metrics.p95ResponseTime,
      })
    }

    // Check request volume
    const expectedRPM = 10 // Expected minimum requests per minute
    if (metrics.requestsPerMinute >= expectedRPM) {
      checks.push({
        name: 'request_volume',
        status: 'pass' as const,
        message: `Request volume: ${metrics.requestsPerMinute} RPM`,
      })
    } else if (metrics.totalRequests > 0) {
      checks.push({
        name: 'request_volume',
        status: 'warn' as const,
        message: `Low request volume: ${metrics.requestsPerMinute} RPM`,
      })
    } else {
      checks.push({
        name: 'request_volume',
        status: 'fail' as const,
        message: 'No recent requests',
      })
    }

    // Overall status
    const failedChecks = checks.filter(c => c.status === 'fail').length
    const warnChecks = checks.filter(c => c.status === 'warn').length

    let status: 'healthy' | 'degraded' | 'unhealthy'
    if (failedChecks > 0) {
      status = 'unhealthy'
    } else if (warnChecks > 0) {
      status = 'degraded'
    } else {
      status = 'healthy'
    }

    return { status, checks }
  }

  /**
   * Export metrics for external monitoring systems
   */
  exportMetrics(format: 'prometheus' | 'json' = 'json') {
    const metrics = this.getMetrics()

    if (format === 'prometheus') {
      return this.toPrometheusFormat(metrics)
    }

    return metrics
  }

  /**
   * Convert metrics to Prometheus format
   */
  private toPrometheusFormat(metrics: AggregatedMetrics): string {
    const lines = [
      '# HELP messai_api_requests_total Total number of API requests',
      '# TYPE messai_api_requests_total counter',
      `messai_api_requests_total ${metrics.totalRequests}`,
      '',
      '# HELP messai_api_response_time_ms API response time in milliseconds',
      '# TYPE messai_api_response_time_ms histogram',
      `messai_api_response_time_ms_average ${metrics.averageResponseTime}`,
      `messai_api_response_time_ms_p95 ${metrics.p95ResponseTime}`,
      `messai_api_response_time_ms_p99 ${metrics.p99ResponseTime}`,
      '',
      '# HELP messai_api_error_rate API error rate',
      '# TYPE messai_api_error_rate gauge',
      `messai_api_error_rate ${metrics.errorRate}`,
      '',
      '# HELP messai_api_requests_per_minute Requests per minute',
      '# TYPE messai_api_requests_per_minute gauge',
      `messai_api_requests_per_minute ${metrics.requestsPerMinute}`,
      '',
    ]

    // Add error code metrics
    Object.entries(metrics.errorsByCode).forEach(([code, count]) => {
      lines.push(`messai_api_errors_total{code="${code}"} ${count}`)
    })

    return lines.join('\n')
  }

  /**
   * Clear old metrics (useful for testing)
   */
  clearMetrics() {
    this.metrics = []
  }
}

// Global monitoring instance
export const apiMonitoring = new APIMonitoring()

/**
 * Middleware function to track API metrics
 */
export function trackApiMetrics(
  request: NextRequest,
  response: { status: number },
  context: ApiContext,
  options?: {
    errorCode?: ApiErrorCode
    requestSize?: number
    responseSize?: number
  }
) {
  const url = new URL(request.url)
  const endpoint = url.pathname
  const method = request.method
  const responseTime = Date.now() - context.startTime

  apiMonitoring.recordMetric({
    endpoint,
    method,
    statusCode: response.status,
    responseTime,
    userId: context.user?.id,
    userRole: context.user?.role,
    errorCode: options?.errorCode,
    requestSize: options?.requestSize,
    responseSize: options?.responseSize,
  })
}

/**
 * Alert system for critical issues
 */
export class AlertSystem {
  private alertThresholds = {
    errorRateThreshold: 0.1, // 10%
    responseTimeThreshold: 5000, // 5 seconds
    consecutiveFailuresThreshold: 5,
  }

  private consecutiveFailures = new Map<string, number>()

  /**
   * Check for alerts based on current metrics
   */
  checkAlerts(): Array<{
    type: 'error_rate' | 'response_time' | 'consecutive_failures' | 'system_health'
    severity: 'warning' | 'critical'
    message: string
    timestamp: number
    data?: any
  }> {
    const alerts = []
    const metrics = apiMonitoring.getMetrics(600000) // Last 10 minutes
    const health = apiMonitoring.getHealthStatus()

    // Error rate alert
    if (metrics.errorRate > this.alertThresholds.errorRateThreshold) {
      alerts.push({
        type: 'error_rate' as const,
        severity: metrics.errorRate > 0.25 ? 'critical' as const : 'warning' as const,
        message: `High error rate detected: ${metrics.errorRate}%`,
        timestamp: Date.now(),
        data: { errorRate: metrics.errorRate, errorsByCode: metrics.errorsByCode },
      })
    }

    // Response time alert
    if (metrics.p95ResponseTime > this.alertThresholds.responseTimeThreshold) {
      alerts.push({
        type: 'response_time' as const,
        severity: metrics.p95ResponseTime > 10000 ? 'critical' as const : 'warning' as const,
        message: `Slow response times detected: P95 = ${metrics.p95ResponseTime}ms`,
        timestamp: Date.now(),
        data: { p95ResponseTime: metrics.p95ResponseTime, averageResponseTime: metrics.averageResponseTime },
      })
    }

    // System health alert
    if (health.status === 'unhealthy') {
      alerts.push({
        type: 'system_health' as const,
        severity: 'critical' as const,
        message: 'System health check failed',
        timestamp: Date.now(),
        data: { healthChecks: health.checks },
      })
    }

    return alerts
  }

  /**
   * Send alert (implement with your preferred alerting system)
   */
  async sendAlert(alert: ReturnType<AlertSystem['checkAlerts']>[0]) {
    // In production, integrate with:
    // - Slack/Discord webhooks
    // - Email notifications
    // - PagerDuty
    // - SMS alerts

    console.error('🚨 MESSAI API Alert:', {
      type: alert.type,
      severity: alert.severity,
      message: alert.message,
      timestamp: new Date(alert.timestamp).toISOString(),
      data: alert.data,
    })

    // Example webhook integration
    if (process.env.ALERT_WEBHOOK_URL) {
      try {
        await fetch(process.env.ALERT_WEBHOOK_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            text: `🚨 MESSAI API Alert: ${alert.message}`,
            severity: alert.severity,
            details: alert.data,
          }),
        })
      } catch (error) {
        console.error('Failed to send alert webhook:', error)
      }
    }
  }
}

export const alertSystem = new AlertSystem()

/**
 * Performance profiler for detailed request analysis
 */
export class PerformanceProfiler {
  private profiles = new Map<string, {
    requestId: string
    startTime: number
    checkpoints: Array<{ name: string; timestamp: number; duration: number }>
  }>()

  /**
   * Start profiling a request
   */
  startProfile(requestId: string): {
    checkpoint: (name: string) => void
    finish: () => PerformanceProfile
  } {
    const startTime = performance.now()
    const profile = {
      requestId,
      startTime,
      checkpoints: [],
    }

    this.profiles.set(requestId, profile)

    let lastCheckpoint = startTime

    return {
      checkpoint: (name: string) => {
        const now = performance.now()
        profile.checkpoints.push({
          name,
          timestamp: now,
          duration: now - lastCheckpoint,
        })
        lastCheckpoint = now
      },
      finish: () => {
        const endTime = performance.now()
        const totalDuration = endTime - startTime

        this.profiles.delete(requestId)

        return {
          requestId,
          totalDuration,
          checkpoints: profile.checkpoints,
        }
      },
    }
  }
}

export interface PerformanceProfile {
  requestId: string
  totalDuration: number
  checkpoints: Array<{
    name: string
    timestamp: number
    duration: number
  }>
}

export const performanceProfiler = new PerformanceProfiler()

/**
 * API usage analytics
 */
export class APIAnalytics {
  /**
   * Get user behavior analytics
   */
  getUserAnalytics(timeRangeMs: number = 86400000): { // Default 24 hours
    totalUsers: number
    activeUsers: number
    topUsers: Array<{ userId: string; requests: number }>
    userRoleDistribution: Record<string, number>
    apiUsageByRole: Record<string, { requests: number; averageResponseTime: number }>
  } {
    const cutoff = Date.now() - timeRangeMs
    const recentMetrics = apiMonitoring.metrics.filter(m => m.timestamp > cutoff)

    const userMetrics = recentMetrics
      .filter(m => m.userId)
      .reduce((acc, m) => {
        if (!acc[m.userId!]) {
          acc[m.userId!] = {
            requests: 0,
            totalResponseTime: 0,
            role: m.userRole,
          }
        }
        acc[m.userId!].requests++
        acc[m.userId!].totalResponseTime += m.responseTime
        return acc
      }, {} as Record<string, { requests: number; totalResponseTime: number; role?: string }>)

    const totalUsers = Object.keys(userMetrics).length
    const activeUsers = Object.values(userMetrics).filter(u => u.requests >= 5).length

    const topUsers = Object.entries(userMetrics)
      .sort(([, a], [, b]) => b.requests - a.requests)
      .slice(0, 10)
      .map(([userId, data]) => ({ userId, requests: data.requests }))

    const userRoleDistribution = Object.values(userMetrics)
      .reduce((acc, user) => {
        if (user.role) {
          acc[user.role] = (acc[user.role] || 0) + 1
        }
        return acc
      }, {} as Record<string, number>)

    const apiUsageByRole = Object.values(userMetrics)
      .reduce((acc, user) => {
        if (user.role) {
          if (!acc[user.role]) {
            acc[user.role] = { requests: 0, totalResponseTime: 0 }
          }
          acc[user.role].requests += user.requests
          acc[user.role].totalResponseTime += user.totalResponseTime
        }
        return acc
      }, {} as Record<string, { requests: number; totalResponseTime: number }>)

    // Calculate average response times
    Object.keys(apiUsageByRole).forEach(role => {
      const data = apiUsageByRole[role]
      apiUsageByRole[role] = {
        requests: data.requests,
        averageResponseTime: Math.round(data.totalResponseTime / data.requests),
      }
    })

    return {
      totalUsers,
      activeUsers,
      topUsers,
      userRoleDistribution,
      apiUsageByRole,
    }
  }

  /**
   * Get endpoint analytics
   */
  getEndpointAnalytics(timeRangeMs: number = 86400000) {
    const cutoff = Date.now() - timeRangeMs
    const recentMetrics = apiMonitoring.metrics.filter(m => m.timestamp > cutoff)

    const endpointMetrics = recentMetrics.reduce((acc, m) => {
      const key = `${m.method} ${m.endpoint}`
      if (!acc[key]) {
        acc[key] = {
          requests: 0,
          totalResponseTime: 0,
          errors: 0,
          statusCodes: {} as Record<number, number>,
        }
      }
      
      acc[key].requests++
      acc[key].totalResponseTime += m.responseTime
      
      if (m.statusCode >= 400) {
        acc[key].errors++
      }
      
      acc[key].statusCodes[m.statusCode] = (acc[key].statusCodes[m.statusCode] || 0) + 1
      
      return acc
    }, {} as Record<string, any>)

    return Object.entries(endpointMetrics).map(([endpoint, data]) => ({
      endpoint,
      requests: data.requests,
      averageResponseTime: Math.round(data.totalResponseTime / data.requests),
      errorRate: Math.round((data.errors / data.requests) * 100) / 100,
      statusCodes: data.statusCodes,
    }))
  }
}

export const apiAnalytics = new APIAnalytics()
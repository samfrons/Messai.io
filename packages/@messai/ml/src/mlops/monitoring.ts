import { ModelVersion, ModelMetrics } from '../types'
import { ModelEvaluator } from '../utils'

export interface ModelPerformanceMetrics {
  modelId: string
  timestamp: Date
  predictions: number
  accuracy: number
  latency: number
  throughput: number
  errorRate: number
  dataQuality: {
    completeness: number
    validity: number
    consistency: number
  }
}

export interface Alert {
  id: string
  modelId: string
  type: 'performance' | 'drift' | 'anomaly' | 'error'
  severity: 'low' | 'medium' | 'high' | 'critical'
  message: string
  timestamp: Date
  resolved: boolean
  metadata?: Record<string, any>
}

export class ModelMonitor {
  private metrics: Map<string, ModelPerformanceMetrics[]> = new Map()
  private alerts: Map<string, Alert[]> = new Map()
  private thresholds: Map<string, Record<string, number>> = new Map()

  constructor() {
    // Set default thresholds
    this.setDefaultThresholds()
  }

  async recordPrediction(
    modelId: string,
    input: any,
    prediction: any,
    actualValue?: any,
    latency?: number
  ): Promise<void> {
    const timestamp = new Date()
    
    // Update real-time metrics
    await this.updateMetrics(modelId, {
      prediction,
      actualValue,
      latency: latency || 0,
      timestamp
    })

    // Check for anomalies
    await this.checkAnomalies(modelId, input, prediction)
    
    // Check performance thresholds
    await this.checkThresholds(modelId)
  }

  async getModelMetrics(
    modelId: string,
    startTime?: Date,
    endTime?: Date
  ): Promise<ModelPerformanceMetrics[]> {
    const metrics = this.metrics.get(modelId) || []
    
    if (!startTime && !endTime) {
      return metrics
    }
    
    return metrics.filter(metric => {
      if (startTime && metric.timestamp < startTime) return false
      if (endTime && metric.timestamp > endTime) return false
      return true
    })
  }

  async getRealtimeMetrics(modelId: string): Promise<ModelPerformanceMetrics | null> {
    const metrics = this.metrics.get(modelId) || []
    
    if (metrics.length === 0) return null
    
    // Return the most recent metrics
    return metrics[metrics.length - 1]
  }

  async setThresholds(
    modelId: string,
    thresholds: {
      accuracyMin?: number
      latencyMax?: number
      errorRateMax?: number
      throughputMin?: number
    }
  ): Promise<void> {
    this.thresholds.set(modelId, {
      accuracyMin: 0.8,
      latencyMax: 1000,
      errorRateMax: 0.05,
      throughputMin: 10,
      ...thresholds
    })
  }

  async getAlerts(
    modelId?: string,
    severity?: string,
    resolved?: boolean
  ): Promise<Alert[]> {
    let allAlerts: Alert[] = []
    
    if (modelId) {
      allAlerts = this.alerts.get(modelId) || []
    } else {
      // Get alerts from all models
      for (const alerts of this.alerts.values()) {
        allAlerts.push(...alerts)
      }
    }
    
    return allAlerts.filter(alert => {
      if (severity && alert.severity !== severity) return false
      if (resolved !== undefined && alert.resolved !== resolved) return false
      return true
    }).sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
  }

  async resolveAlert(alertId: string): Promise<void> {
    for (const alerts of this.alerts.values()) {
      const alert = alerts.find(a => a.id === alertId)
      if (alert) {
        alert.resolved = true
        console.log(`Alert ${alertId} resolved`)
        return
      }
    }
    
    throw new Error(`Alert ${alertId} not found`)
  }

  async createCustomMetric(
    modelId: string,
    metricName: string,
    metricValue: number,
    timestamp?: Date
  ): Promise<void> {
    const metrics = this.metrics.get(modelId) || []
    
    // Find or create the latest metric entry
    let latestMetric = metrics[metrics.length - 1]
    if (!latestMetric || (timestamp && latestMetric.timestamp < timestamp)) {
      latestMetric = await this.createBaseMetric(modelId, timestamp || new Date())
      metrics.push(latestMetric)
      this.metrics.set(modelId, metrics)
    }
    
    // Add custom metric
    if (!latestMetric.metadata) {
      latestMetric.metadata = {}
    }
    latestMetric.metadata[metricName] = metricValue
  }

  async detectModelDrift(
    modelId: string,
    baselinePeriod: { start: Date, end: Date },
    comparisonPeriod: { start: Date, end: Date }
  ): Promise<{
    isDrift: boolean
    driftScore: number
    affectedMetrics: string[]
  }> {
    const baselineMetrics = await this.getModelMetrics(
      modelId,
      baselinePeriod.start,
      baselinePeriod.end
    )
    
    const comparisonMetrics = await this.getModelMetrics(
      modelId,
      comparisonPeriod.start,
      comparisonPeriod.end
    )
    
    if (baselineMetrics.length === 0 || comparisonMetrics.length === 0) {
      return {
        isDrift: false,
        driftScore: 0,
        affectedMetrics: []
      }
    }
    
    const baselineAvg = this.calculateAverageMetrics(baselineMetrics)
    const comparisonAvg = this.calculateAverageMetrics(comparisonMetrics)
    
    const affectedMetrics: string[] = []
    let totalDrift = 0
    let metricCount = 0
    
    // Check accuracy drift
    const accuracyDrift = Math.abs(baselineAvg.accuracy - comparisonAvg.accuracy)
    if (accuracyDrift > 0.05) { // 5% threshold
      affectedMetrics.push('accuracy')
      totalDrift += accuracyDrift
    }
    metricCount++
    
    // Check latency drift
    const latencyDrift = Math.abs(baselineAvg.latency - comparisonAvg.latency) / baselineAvg.latency
    if (latencyDrift > 0.20) { // 20% threshold
      affectedMetrics.push('latency')
      totalDrift += latencyDrift
    }
    metricCount++
    
    // Check error rate drift
    const errorRateDrift = Math.abs(baselineAvg.errorRate - comparisonAvg.errorRate)
    if (errorRateDrift > 0.02) { // 2% threshold
      affectedMetrics.push('errorRate')
      totalDrift += errorRateDrift
    }
    metricCount++
    
    const driftScore = totalDrift / metricCount
    const isDrift = affectedMetrics.length > 0
    
    if (isDrift) {
      await this.createAlert(modelId, {
        type: 'drift',
        severity: driftScore > 0.15 ? 'high' : 'medium',
        message: `Model drift detected. Affected metrics: ${affectedMetrics.join(', ')}`,
        metadata: {
          driftScore,
          affectedMetrics,
          baselinePeriod,
          comparisonPeriod
        }
      })
    }
    
    return {
      isDrift,
      driftScore,
      affectedMetrics
    }
  }

  async generatePerformanceReport(
    modelId: string,
    period: { start: Date, end: Date }
  ): Promise<{
    summary: {
      totalPredictions: number
      averageAccuracy: number
      averageLatency: number
      errorRate: number
      uptime: number
    }
    trends: {
      accuracy: number[]
      latency: number[]
      throughput: number[]
    }
    alerts: Alert[]
    recommendations: string[]
  }> {
    const metrics = await this.getModelMetrics(modelId, period.start, period.end)
    const alerts = await this.getAlerts(modelId)
    
    if (metrics.length === 0) {
      return {
        summary: {
          totalPredictions: 0,
          averageAccuracy: 0,
          averageLatency: 0,
          errorRate: 0,
          uptime: 0
        },
        trends: {
          accuracy: [],
          latency: [],
          throughput: []
        },
        alerts: [],
        recommendations: ['No data available for this period']
      }
    }
    
    const summary = this.calculateAverageMetrics(metrics)
    const trends = this.calculateTrends(metrics)
    const recommendations = this.generateRecommendations(summary, alerts)
    
    return {
      summary: {
        totalPredictions: metrics.reduce((sum, m) => sum + m.predictions, 0),
        averageAccuracy: summary.accuracy,
        averageLatency: summary.latency,
        errorRate: summary.errorRate,
        uptime: this.calculateUptime(metrics, period)
      },
      trends,
      alerts: alerts.filter(alert => 
        alert.timestamp >= period.start && alert.timestamp <= period.end
      ),
      recommendations
    }
  }

  private async updateMetrics(
    modelId: string,
    data: {
      prediction: any
      actualValue?: any
      latency: number
      timestamp: Date
    }
  ): Promise<void> {
    const metrics = this.metrics.get(modelId) || []
    
    // Create or update the current minute's metrics
    const currentMinute = new Date(data.timestamp)
    currentMinute.setSeconds(0, 0)
    
    let currentMetric = metrics.find(m => 
      m.timestamp.getTime() === currentMinute.getTime()
    )
    
    if (!currentMetric) {
      currentMetric = await this.createBaseMetric(modelId, currentMinute)
      metrics.push(currentMetric)
    }
    
    // Update metrics
    currentMetric.predictions++
    
    if (data.actualValue !== undefined) {
      // Update accuracy if we have ground truth
      const isCorrect = this.isCorrectPrediction(data.prediction, data.actualValue)
      const totalCorrect = (currentMetric.accuracy * (currentMetric.predictions - 1)) + (isCorrect ? 1 : 0)
      currentMetric.accuracy = totalCorrect / currentMetric.predictions
    }
    
    // Update latency (moving average)
    currentMetric.latency = (currentMetric.latency * (currentMetric.predictions - 1) + data.latency) / currentMetric.predictions
    
    // Update throughput
    currentMetric.throughput = currentMetric.predictions / 60 // predictions per second
    
    this.metrics.set(modelId, metrics)
  }

  private async createBaseMetric(modelId: string, timestamp: Date): Promise<ModelPerformanceMetrics> {
    return {
      modelId,
      timestamp,
      predictions: 0,
      accuracy: 0,
      latency: 0,
      throughput: 0,
      errorRate: 0,
      dataQuality: {
        completeness: 1.0,
        validity: 1.0,
        consistency: 1.0
      }
    }
  }

  private isCorrectPrediction(prediction: any, actual: any): boolean {
    if (typeof prediction === 'number' && typeof actual === 'number') {
      // For regression, consider correct if within 5% of actual
      return Math.abs(prediction - actual) / Math.abs(actual) <= 0.05
    }
    
    // For classification, exact match
    return prediction === actual
  }

  private async checkAnomalies(modelId: string, input: any, prediction: any): Promise<void> {
    // Simple anomaly detection based on prediction values
    if (typeof prediction === 'number') {
      const recentMetrics = await this.getModelMetrics(modelId)
      
      if (recentMetrics.length > 10) {
        // Check if prediction is an outlier
        const recentPredictions = recentMetrics.slice(-10).map(m => m.accuracy)
        const mean = recentPredictions.reduce((sum, val) => sum + val, 0) / recentPredictions.length
        const std = Math.sqrt(
          recentPredictions.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / recentPredictions.length
        )
        
        if (Math.abs(prediction - mean) > 3 * std) {
          await this.createAlert(modelId, {
            type: 'anomaly',
            severity: 'medium',
            message: `Anomalous prediction detected: ${prediction}`,
            metadata: { prediction, mean, std }
          })
        }
      }
    }
  }

  private async checkThresholds(modelId: string): Promise<void> {
    const thresholds = this.thresholds.get(modelId)
    if (!thresholds) return
    
    const recentMetrics = await this.getRealtimeMetrics(modelId)
    if (!recentMetrics) return
    
    // Check accuracy threshold
    if (thresholds.accuracyMin && recentMetrics.accuracy < thresholds.accuracyMin) {
      await this.createAlert(modelId, {
        type: 'performance',
        severity: 'high',
        message: `Accuracy below threshold: ${recentMetrics.accuracy.toFixed(3)} < ${thresholds.accuracyMin}`,
        metadata: { metric: 'accuracy', value: recentMetrics.accuracy, threshold: thresholds.accuracyMin }
      })
    }
    
    // Check latency threshold
    if (thresholds.latencyMax && recentMetrics.latency > thresholds.latencyMax) {
      await this.createAlert(modelId, {
        type: 'performance',
        severity: 'medium',
        message: `Latency above threshold: ${recentMetrics.latency.toFixed(0)}ms > ${thresholds.latencyMax}ms`,
        metadata: { metric: 'latency', value: recentMetrics.latency, threshold: thresholds.latencyMax }
      })
    }
    
    // Check error rate threshold
    if (thresholds.errorRateMax && recentMetrics.errorRate > thresholds.errorRateMax) {
      await this.createAlert(modelId, {
        type: 'error',
        severity: 'high',
        message: `Error rate above threshold: ${(recentMetrics.errorRate * 100).toFixed(1)}% > ${(thresholds.errorRateMax * 100).toFixed(1)}%`,
        metadata: { metric: 'errorRate', value: recentMetrics.errorRate, threshold: thresholds.errorRateMax }
      })
    }
  }

  private async createAlert(
    modelId: string,
    alertData: {
      type: 'performance' | 'drift' | 'anomaly' | 'error'
      severity: 'low' | 'medium' | 'high' | 'critical'
      message: string
      metadata?: Record<string, any>
    }
  ): Promise<void> {
    const alert: Alert = {
      id: `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      modelId,
      timestamp: new Date(),
      resolved: false,
      ...alertData
    }
    
    const modelAlerts = this.alerts.get(modelId) || []
    modelAlerts.push(alert)
    this.alerts.set(modelId, modelAlerts)
    
    console.log(`Alert created for model ${modelId}: ${alert.message}`)
  }

  private setDefaultThresholds(): void {
    // Set sensible defaults for all models
    const defaultThresholds = {
      accuracyMin: 0.8,
      latencyMax: 1000,
      errorRateMax: 0.05,
      throughputMin: 10
    }
    
    this.thresholds.set('default', defaultThresholds)
  }

  private calculateAverageMetrics(metrics: ModelPerformanceMetrics[]): ModelPerformanceMetrics {
    if (metrics.length === 0) {
      return {
        modelId: '',
        timestamp: new Date(),
        predictions: 0,
        accuracy: 0,
        latency: 0,
        throughput: 0,
        errorRate: 0,
        dataQuality: { completeness: 0, validity: 0, consistency: 0 }
      }
    }
    
    const sum = metrics.reduce((acc, metric) => ({
      predictions: acc.predictions + metric.predictions,
      accuracy: acc.accuracy + metric.accuracy,
      latency: acc.latency + metric.latency,
      throughput: acc.throughput + metric.throughput,
      errorRate: acc.errorRate + metric.errorRate,
      dataQuality: {
        completeness: acc.dataQuality.completeness + metric.dataQuality.completeness,
        validity: acc.dataQuality.validity + metric.dataQuality.validity,
        consistency: acc.dataQuality.consistency + metric.dataQuality.consistency
      }
    }), {
      predictions: 0,
      accuracy: 0,
      latency: 0,
      throughput: 0,
      errorRate: 0,
      dataQuality: { completeness: 0, validity: 0, consistency: 0 }
    })
    
    const count = metrics.length
    return {
      modelId: metrics[0].modelId,
      timestamp: metrics[metrics.length - 1].timestamp,
      predictions: sum.predictions,
      accuracy: sum.accuracy / count,
      latency: sum.latency / count,
      throughput: sum.throughput / count,
      errorRate: sum.errorRate / count,
      dataQuality: {
        completeness: sum.dataQuality.completeness / count,
        validity: sum.dataQuality.validity / count,
        consistency: sum.dataQuality.consistency / count
      }
    }
  }

  private calculateTrends(metrics: ModelPerformanceMetrics[]): {
    accuracy: number[]
    latency: number[]
    throughput: number[]
  } {
    return {
      accuracy: metrics.map(m => m.accuracy),
      latency: metrics.map(m => m.latency),
      throughput: metrics.map(m => m.throughput)
    }
  }

  private calculateUptime(metrics: ModelPerformanceMetrics[], period: { start: Date, end: Date }): number {
    if (metrics.length === 0) return 0
    
    const totalMinutes = (period.end.getTime() - period.start.getTime()) / (1000 * 60)
    const activeMinutes = metrics.length
    
    return Math.min(activeMinutes / totalMinutes, 1.0)
  }

  private generateRecommendations(summary: ModelPerformanceMetrics, alerts: Alert[]): string[] {
    const recommendations: string[] = []
    
    if (summary.accuracy < 0.8) {
      recommendations.push('Model accuracy is below 80%. Consider retraining with more recent data.')
    }
    
    if (summary.latency > 1000) {
      recommendations.push('High latency detected. Consider model optimization or infrastructure scaling.')
    }
    
    if (summary.errorRate > 0.05) {
      recommendations.push('Error rate is above 5%. Review input data quality and model robustness.')
    }
    
    const highSeverityAlerts = alerts.filter(a => a.severity === 'high' || a.severity === 'critical')
    if (highSeverityAlerts.length > 5) {
      recommendations.push('Multiple high-severity alerts detected. Immediate investigation recommended.')
    }
    
    if (summary.dataQuality.completeness < 0.9) {
      recommendations.push('Data completeness issues detected. Review data pipeline and input validation.')
    }
    
    return recommendations
  }
}
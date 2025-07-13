import { Feature, Dataset } from '../types'
import { v4 as uuidv4 } from 'uuid'

export interface FeatureGroup {
  id: string
  name: string
  description: string
  features: Feature[]
  owner: string
  createdAt: Date
  updatedAt: Date
  tags: string[]
}

export interface FeatureView {
  id: string
  name: string
  description: string
  featureGroups: string[]
  query: string
  createdAt: Date
  updatedAt: Date
}

export interface FeatureVector {
  entityId: string
  features: Record<string, any>
  timestamp: Date
}

export class FeatureStore {
  private featureGroups: Map<string, FeatureGroup> = new Map()
  private featureViews: Map<string, FeatureView> = new Map()
  private featureData: Map<string, FeatureVector[]> = new Map()

  async createFeatureGroup(
    name: string,
    description: string,
    features: Feature[],
    owner: string,
    tags: string[] = []
  ): Promise<FeatureGroup> {
    const featureGroup: FeatureGroup = {
      id: uuidv4(),
      name,
      description,
      features,
      owner,
      createdAt: new Date(),
      updatedAt: new Date(),
      tags
    }

    this.featureGroups.set(featureGroup.id, featureGroup)
    console.log(`Feature group created: ${name}`)
    
    return featureGroup
  }

  async getFeatureGroup(id: string): Promise<FeatureGroup | null> {
    return this.featureGroups.get(id) || null
  }

  async listFeatureGroups(tags?: string[]): Promise<FeatureGroup[]> {
    const groups = Array.from(this.featureGroups.values())
    
    if (tags && tags.length > 0) {
      return groups.filter(group => 
        tags.some(tag => group.tags.includes(tag))
      )
    }
    
    return groups
  }

  async updateFeatureGroup(id: string, updates: Partial<FeatureGroup>): Promise<FeatureGroup> {
    const featureGroup = this.featureGroups.get(id)
    if (!featureGroup) {
      throw new Error(`Feature group ${id} not found`)
    }

    const updated = {
      ...featureGroup,
      ...updates,
      updatedAt: new Date()
    }

    this.featureGroups.set(id, updated)
    return updated
  }

  async createFeatureView(
    name: string,
    description: string,
    featureGroups: string[],
    query: string
  ): Promise<FeatureView> {
    // Validate that all feature groups exist
    for (const groupId of featureGroups) {
      if (!this.featureGroups.has(groupId)) {
        throw new Error(`Feature group ${groupId} not found`)
      }
    }

    const featureView: FeatureView = {
      id: uuidv4(),
      name,
      description,
      featureGroups,
      query,
      createdAt: new Date(),
      updatedAt: new Date()
    }

    this.featureViews.set(featureView.id, featureView)
    console.log(`Feature view created: ${name}`)
    
    return featureView
  }

  async getFeatureView(id: string): Promise<FeatureView | null> {
    return this.featureViews.get(id) || null
  }

  async ingestFeatures(
    featureGroupId: string,
    features: FeatureVector[]
  ): Promise<void> {
    const featureGroup = this.featureGroups.get(featureGroupId)
    if (!featureGroup) {
      throw new Error(`Feature group ${featureGroupId} not found`)
    }

    // Validate feature schema
    for (const featureVector of features) {
      this.validateFeatureVector(featureVector, featureGroup.features)
    }

    const existingData = this.featureData.get(featureGroupId) || []
    this.featureData.set(featureGroupId, [...existingData, ...features])

    console.log(`Ingested ${features.length} feature vectors for group ${featureGroup.name}`)
  }

  async getFeatures(
    featureGroupId: string,
    entityIds?: string[],
    startTime?: Date,
    endTime?: Date
  ): Promise<FeatureVector[]> {
    const data = this.featureData.get(featureGroupId) || []
    
    let filtered = data
    
    if (entityIds && entityIds.length > 0) {
      filtered = filtered.filter(vector => entityIds.includes(vector.entityId))
    }
    
    if (startTime) {
      filtered = filtered.filter(vector => vector.timestamp >= startTime)
    }
    
    if (endTime) {
      filtered = filtered.filter(vector => vector.timestamp <= endTime)
    }
    
    return filtered.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
  }

  async getOnlineFeatures(
    featureViewId: string,
    entityIds: string[]
  ): Promise<FeatureVector[]> {
    const featureView = this.featureViews.get(featureViewId)
    if (!featureView) {
      throw new Error(`Feature view ${featureViewId} not found`)
    }

    // Get latest features for each entity from all feature groups in the view
    const results: FeatureVector[] = []
    
    for (const entityId of entityIds) {
      const combinedFeatures: Record<string, any> = {}
      let latestTimestamp = new Date(0)

      for (const groupId of featureView.featureGroups) {
        const groupFeatures = await this.getFeatures(groupId, [entityId])
        
        if (groupFeatures.length > 0) {
          const latest = groupFeatures[0] // Already sorted by timestamp desc
          Object.assign(combinedFeatures, latest.features)
          
          if (latest.timestamp > latestTimestamp) {
            latestTimestamp = latest.timestamp
          }
        }
      }

      if (Object.keys(combinedFeatures).length > 0) {
        results.push({
          entityId,
          features: combinedFeatures,
          timestamp: latestTimestamp
        })
      }
    }

    return results
  }

  async getHistoricalFeatures(
    featureViewId: string,
    entityIds: string[],
    startTime: Date,
    endTime: Date
  ): Promise<Dataset> {
    const featureView = this.featureViews.get(featureViewId)
    if (!featureView) {
      throw new Error(`Feature view ${featureViewId} not found`)
    }

    // Collect all features from the time range
    const allFeatures: FeatureVector[] = []
    const featureDefinitions: Feature[] = []

    for (const groupId of featureView.featureGroups) {
      const groupFeatures = await this.getFeatures(groupId, entityIds, startTime, endTime)
      allFeatures.push(...groupFeatures)

      const group = this.featureGroups.get(groupId)
      if (group) {
        featureDefinitions.push(...group.features)
      }
    }

    // Remove duplicate feature definitions
    const uniqueFeatures = featureDefinitions.filter((feature, index, array) =>
      array.findIndex(f => f.name === feature.name) === index
    )

    return {
      id: uuidv4(),
      name: `historical_${featureView.name}`,
      description: `Historical features for ${featureView.name}`,
      features: uniqueFeatures,
      samples: allFeatures.length,
      createdAt: new Date(),
      updatedAt: new Date(),
      version: '1.0.0'
    }
  }

  async computeFeatureStatistics(featureGroupId: string): Promise<Record<string, any>> {
    const featureGroup = this.featureGroups.get(featureGroupId)
    if (!featureGroup) {
      throw new Error(`Feature group ${featureGroupId} not found`)
    }

    const data = this.featureData.get(featureGroupId) || []
    const statistics: Record<string, any> = {}

    for (const feature of featureGroup.features) {
      const values = data.map(vector => vector.features[feature.name]).filter(v => v != null)
      
      if (values.length === 0) {
        statistics[feature.name] = {
          count: 0,
          nullCount: data.length
        }
        continue
      }

      if (feature.type === 'numerical') {
        const numValues = values.filter(v => typeof v === 'number')
        statistics[feature.name] = {
          count: values.length,
          nullCount: data.length - values.length,
          mean: numValues.reduce((sum, val) => sum + val, 0) / numValues.length,
          min: Math.min(...numValues),
          max: Math.max(...numValues),
          std: this.calculateStandardDeviation(numValues)
        }
      } else {
        const uniqueValues = new Set(values)
        statistics[feature.name] = {
          count: values.length,
          nullCount: data.length - values.length,
          uniqueCount: uniqueValues.size,
          mostCommon: this.getMostCommonValue(values)
        }
      }
    }

    return statistics
  }

  async detectFeatureDrift(
    featureGroupId: string,
    baselineStart: Date,
    baselineEnd: Date,
    comparisonStart: Date,
    comparisonEnd: Date
  ): Promise<Record<string, { 
    driftScore: number, 
    isDrift: boolean, 
    method: string 
  }>> {
    const baselineData = await this.getFeatures(featureGroupId, undefined, baselineStart, baselineEnd)
    const comparisonData = await this.getFeatures(featureGroupId, undefined, comparisonStart, comparisonEnd)
    
    const featureGroup = this.featureGroups.get(featureGroupId)
    if (!featureGroup) {
      throw new Error(`Feature group ${featureGroupId} not found`)
    }

    const driftResults: Record<string, any> = {}

    for (const feature of featureGroup.features) {
      const baselineValues = baselineData.map(v => v.features[feature.name]).filter(v => v != null)
      const comparisonValues = comparisonData.map(v => v.features[feature.name]).filter(v => v != null)
      
      if (baselineValues.length === 0 || comparisonValues.length === 0) {
        driftResults[feature.name] = {
          driftScore: 1.0,
          isDrift: true,
          method: 'insufficient_data'
        }
        continue
      }

      if (feature.type === 'numerical') {
        // Use Kolmogorov-Smirnov test approximation
        const driftScore = this.calculateKSStatistic(baselineValues, comparisonValues)
        driftResults[feature.name] = {
          driftScore,
          isDrift: driftScore > 0.1, // threshold
          method: 'kolmogorov_smirnov'
        }
      } else {
        // Use Population Stability Index for categorical features
        const driftScore = this.calculatePSI(baselineValues, comparisonValues)
        driftResults[feature.name] = {
          driftScore,
          isDrift: driftScore > 0.1, // threshold
          method: 'population_stability_index'
        }
      }
    }

    return driftResults
  }

  private validateFeatureVector(vector: FeatureVector, schema: Feature[]): void {
    for (const feature of schema) {
      const value = vector.features[feature.name]
      
      if (value == null) continue // Allow null values
      
      if (feature.type === 'numerical' && typeof value !== 'number') {
        throw new Error(`Feature ${feature.name} expected number, got ${typeof value}`)
      }
      
      if (feature.type === 'categorical' && typeof value !== 'string') {
        throw new Error(`Feature ${feature.name} expected string, got ${typeof value}`)
      }
    }
  }

  private calculateStandardDeviation(values: number[]): number {
    const mean = values.reduce((sum, val) => sum + val, 0) / values.length
    const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length
    return Math.sqrt(variance)
  }

  private getMostCommonValue(values: any[]): any {
    const counts = new Map()
    for (const value of values) {
      counts.set(value, (counts.get(value) || 0) + 1)
    }
    
    let maxCount = 0
    let mostCommon = null
    for (const [value, count] of counts) {
      if (count > maxCount) {
        maxCount = count
        mostCommon = value
      }
    }
    
    return mostCommon
  }

  private calculateKSStatistic(sample1: number[], sample2: number[]): number {
    // Simplified KS statistic calculation
    const combined = [...sample1, ...sample2].sort((a, b) => a - b)
    const unique = [...new Set(combined)]
    
    let maxDiff = 0
    
    for (const value of unique) {
      const cdf1 = sample1.filter(v => v <= value).length / sample1.length
      const cdf2 = sample2.filter(v => v <= value).length / sample2.length
      const diff = Math.abs(cdf1 - cdf2)
      
      if (diff > maxDiff) {
        maxDiff = diff
      }
    }
    
    return maxDiff
  }

  private calculatePSI(baseline: any[], comparison: any[]): number {
    const baselineDistribution = this.getDistribution(baseline)
    const comparisonDistribution = this.getDistribution(comparison)
    
    let psi = 0
    const allValues = new Set([...baseline, ...comparison])
    
    for (const value of allValues) {
      const baselinePerc = baselineDistribution.get(value) || 0.0001 // avoid log(0)
      const comparisonPerc = comparisonDistribution.get(value) || 0.0001
      
      psi += (comparisonPerc - baselinePerc) * Math.log(comparisonPerc / baselinePerc)
    }
    
    return psi
  }

  private getDistribution(values: any[]): Map<any, number> {
    const counts = new Map()
    for (const value of values) {
      counts.set(value, (counts.get(value) || 0) + 1)
    }
    
    const distribution = new Map()
    for (const [value, count] of counts) {
      distribution.set(value, count / values.length)
    }
    
    return distribution
  }
}
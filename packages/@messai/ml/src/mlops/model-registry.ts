import { ModelVersion, ModelMetrics } from '../types'
import { v4 as uuidv4 } from 'uuid'
import * as tf from '@tensorflow/tfjs'

export interface ModelArtifact {
  modelData: ArrayBuffer
  weightsData: ArrayBuffer
  metadata: Record<string, any>
}

export class ModelRegistry {
  private models: Map<string, ModelVersion> = new Map()
  private artifacts: Map<string, ModelArtifact> = new Map()

  async registerModel(
    name: string,
    modelType: 'classification' | 'regression' | 'clustering' | 'anomaly_detection',
    framework: 'tensorflow' | 'pytorch' | 'scikit-learn' | 'xgboost',
    model: tf.LayersModel,
    metrics: ModelMetrics,
    metadata?: Record<string, any>
  ): Promise<ModelVersion> {
    const modelVersion: ModelVersion = {
      id: uuidv4(),
      version: this.generateVersion(name),
      modelType,
      framework,
      status: 'validation',
      metrics,
      createdAt: new Date(),
      updatedAt: new Date(),
      metadata: {
        name,
        ...metadata
      }
    }

    // Save model artifacts
    const artifact = await this.serializeModel(model, metadata)
    this.artifacts.set(modelVersion.id, artifact)
    
    this.models.set(modelVersion.id, modelVersion)
    
    console.log(`Model registered: ${name} v${modelVersion.version}`)
    return modelVersion
  }

  async getModel(modelId: string): Promise<ModelVersion | null> {
    return this.models.get(modelId) || null
  }

  async getModelsByName(name: string): Promise<ModelVersion[]> {
    return Array.from(this.models.values()).filter(
      model => model.metadata?.name === name
    ).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
  }

  async getLatestModel(name: string): Promise<ModelVersion | null> {
    const models = await this.getModelsByName(name)
    return models.length > 0 ? models[0] : null
  }

  async getProductionModels(): Promise<ModelVersion[]> {
    return Array.from(this.models.values()).filter(
      model => model.status === 'production'
    )
  }

  async promoteToProduction(modelId: string): Promise<void> {
    const model = this.models.get(modelId)
    if (!model) {
      throw new Error(`Model ${modelId} not found`)
    }

    // Demote other production models of the same name
    if (model.metadata?.name) {
      const existingModels = await this.getModelsByName(model.metadata.name)
      for (const existingModel of existingModels) {
        if (existingModel.status === 'production') {
          existingModel.status = 'deprecated'
          existingModel.updatedAt = new Date()
        }
      }
    }

    model.status = 'production'
    model.updatedAt = new Date()
    
    console.log(`Model ${modelId} promoted to production`)
  }

  async deprecateModel(modelId: string): Promise<void> {
    const model = this.models.get(modelId)
    if (!model) {
      throw new Error(`Model ${modelId} not found`)
    }

    model.status = 'deprecated'
    model.updatedAt = new Date()
    
    console.log(`Model ${modelId} deprecated`)
  }

  async loadModel(modelId: string): Promise<tf.LayersModel> {
    const artifact = this.artifacts.get(modelId)
    if (!artifact) {
      throw new Error(`Model artifacts for ${modelId} not found`)
    }

    return await this.deserializeModel(artifact)
  }

  async compareModels(modelId1: string, modelId2: string): Promise<{
    model1: ModelVersion,
    model2: ModelVersion,
    comparison: {
      accuracy: { winner: string, difference: number },
      precision: { winner: string, difference: number },
      recall: { winner: string, difference: number },
      f1Score: { winner: string, difference: number }
    }
  }> {
    const model1 = this.models.get(modelId1)
    const model2 = this.models.get(modelId2)
    
    if (!model1 || !model2) {
      throw new Error('One or both models not found')
    }

    const comparison = {
      accuracy: this.compareMetric(model1.metrics.accuracy, model2.metrics.accuracy, modelId1, modelId2),
      precision: this.compareMetric(model1.metrics.precision, model2.metrics.precision, modelId1, modelId2),
      recall: this.compareMetric(model1.metrics.recall, model2.metrics.recall, modelId1, modelId2),
      f1Score: this.compareMetric(model1.metrics.f1Score, model2.metrics.f1Score, modelId1, modelId2)
    }

    return { model1, model2, comparison }
  }

  async getModelLineage(modelId: string): Promise<{
    ancestors: ModelVersion[],
    descendants: ModelVersion[]
  }> {
    const model = this.models.get(modelId)
    if (!model) {
      throw new Error(`Model ${modelId} not found`)
    }

    // For now, return empty lineage - in a real implementation,
    // this would track model derivation relationships
    return {
      ancestors: [],
      descendants: []
    }
  }

  async searchModels(query: {
    name?: string,
    modelType?: string,
    framework?: string,
    status?: string,
    minAccuracy?: number
  }): Promise<ModelVersion[]> {
    return Array.from(this.models.values()).filter(model => {
      if (query.name && !model.metadata?.name?.includes(query.name)) return false
      if (query.modelType && model.modelType !== query.modelType) return false
      if (query.framework && model.framework !== query.framework) return false
      if (query.status && model.status !== query.status) return false
      if (query.minAccuracy && model.metrics.accuracy < query.minAccuracy) return false
      return true
    })
  }

  async exportModel(modelId: string, format: 'tensorflow' | 'onnx' | 'tflite'): Promise<ArrayBuffer> {
    const artifact = this.artifacts.get(modelId)
    if (!artifact) {
      throw new Error(`Model artifacts for ${modelId} not found`)
    }

    // For now, return the raw model data
    // In a real implementation, this would convert between formats
    return artifact.modelData
  }

  async getModelMetrics(modelId: string): Promise<ModelMetrics> {
    const model = this.models.get(modelId)
    if (!model) {
      throw new Error(`Model ${modelId} not found`)
    }
    return model.metrics
  }

  async updateModelMetrics(modelId: string, metrics: Partial<ModelMetrics>): Promise<void> {
    const model = this.models.get(modelId)
    if (!model) {
      throw new Error(`Model ${modelId} not found`)
    }

    model.metrics = { ...model.metrics, ...metrics }
    model.updatedAt = new Date()
  }

  private generateVersion(name: string): string {
    const existingModels = Array.from(this.models.values()).filter(
      model => model.metadata?.name === name
    )
    
    const versionNumbers = existingModels
      .map(model => parseInt(model.version.split('.')[0]) || 0)
      .sort((a, b) => b - a)
    
    const nextVersion = versionNumbers.length > 0 ? versionNumbers[0] + 1 : 1
    return `${nextVersion}.0.0`
  }

  private async serializeModel(model: tf.LayersModel, metadata?: Record<string, any>): Promise<ModelArtifact> {
    // In a real implementation, this would properly serialize the TensorFlow model
    // For now, we'll create mock data
    const modelData = new ArrayBuffer(1024)
    const weightsData = new ArrayBuffer(4096)
    
    return {
      modelData,
      weightsData,
      metadata: metadata || {}
    }
  }

  private async deserializeModel(artifact: ModelArtifact): Promise<tf.LayersModel> {
    // In a real implementation, this would deserialize the model from artifacts
    // For now, we'll create a simple model
    const model = tf.sequential({
      layers: [
        tf.layers.dense({ inputShape: [10], units: 32, activation: 'relu' }),
        tf.layers.dense({ units: 1, activation: 'linear' })
      ]
    })
    
    model.compile({
      optimizer: 'adam',
      loss: 'meanSquaredError'
    })
    
    return model
  }

  private compareMetric(
    value1: number, 
    value2: number, 
    modelId1: string, 
    modelId2: string
  ): { winner: string, difference: number } {
    if (value1 > value2) {
      return { winner: modelId1, difference: value1 - value2 }
    } else if (value2 > value1) {
      return { winner: modelId2, difference: value2 - value1 }
    } else {
      return { winner: 'tie', difference: 0 }
    }
  }
}
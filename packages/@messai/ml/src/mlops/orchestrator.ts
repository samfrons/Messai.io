import { TrainingJob, ModelVersion, Dataset } from '../types'
import { TrainingPipeline, HyperparameterOptimizer } from './pipeline'
import { ModelRegistry } from './model-registry'
import { FeatureStore } from './feature-store'
import { ModelMonitor } from './monitoring'
import { v4 as uuidv4 } from 'uuid'

export interface MLWorkflow {
  id: string
  name: string
  description: string
  steps: WorkflowStep[]
  status: 'draft' | 'running' | 'completed' | 'failed' | 'paused'
  createdAt: Date
  updatedAt: Date
  metadata?: Record<string, any>
}

export interface WorkflowStep {
  id: string
  name: string
  type: 'data_preparation' | 'training' | 'evaluation' | 'deployment' | 'monitoring'
  config: Record<string, any>
  dependencies: string[]
  status: 'pending' | 'running' | 'completed' | 'failed'
  startTime?: Date
  endTime?: Date
  outputs?: Record<string, any>
}

export interface DeploymentConfig {
  modelId: string
  environment: 'staging' | 'production'
  scalingConfig: {
    minInstances: number
    maxInstances: number
    targetCPUUtilization: number
  }
  monitoringConfig: {
    enableDriftDetection: boolean
    alertThresholds: Record<string, number>
  }
}

export class MLOpsOrchestrator {
  private modelRegistry: ModelRegistry
  private featureStore: FeatureStore
  private modelMonitor: ModelMonitor
  private trainingPipeline: TrainingPipeline
  private workflows: Map<string, MLWorkflow> = new Map()
  private deployments: Map<string, DeploymentConfig> = new Map()

  constructor() {
    this.modelRegistry = new ModelRegistry()
    this.featureStore = new FeatureStore()
    this.modelMonitor = new ModelMonitor()
    this.trainingPipeline = new TrainingPipeline(this.modelRegistry, this.featureStore)
  }

  // Workflow Management
  async createWorkflow(
    name: string,
    description: string,
    steps: Omit<WorkflowStep, 'id' | 'status'>[]
  ): Promise<MLWorkflow> {
    const workflow: MLWorkflow = {
      id: uuidv4(),
      name,
      description,
      steps: steps.map(step => ({
        ...step,
        id: uuidv4(),
        status: 'pending'
      })),
      status: 'draft',
      createdAt: new Date(),
      updatedAt: new Date()
    }

    this.workflows.set(workflow.id, workflow)
    console.log(`Workflow created: ${name}`)
    
    return workflow
  }

  async executeWorkflow(workflowId: string): Promise<MLWorkflow> {
    const workflow = this.workflows.get(workflowId)
    if (!workflow) {
      throw new Error(`Workflow ${workflowId} not found`)
    }

    workflow.status = 'running'
    workflow.updatedAt = new Date()

    try {
      // Execute steps in dependency order
      const executionOrder = this.calculateExecutionOrder(workflow.steps)
      
      for (const stepId of executionOrder) {
        const step = workflow.steps.find(s => s.id === stepId)
        if (!step) continue

        await this.executeWorkflowStep(workflow, step)
      }

      workflow.status = 'completed'
      console.log(`Workflow ${workflow.name} completed successfully`)
    } catch (error) {
      workflow.status = 'failed'
      console.error(`Workflow ${workflow.name} failed:`, error)
      throw error
    } finally {
      workflow.updatedAt = new Date()
    }

    return workflow
  }

  async pauseWorkflow(workflowId: string): Promise<void> {
    const workflow = this.workflows.get(workflowId)
    if (!workflow) {
      throw new Error(`Workflow ${workflowId} not found`)
    }

    workflow.status = 'paused'
    workflow.updatedAt = new Date()
    console.log(`Workflow ${workflow.name} paused`)
  }

  async resumeWorkflow(workflowId: string): Promise<MLWorkflow> {
    const workflow = this.workflows.get(workflowId)
    if (!workflow) {
      throw new Error(`Workflow ${workflowId} not found`)
    }

    if (workflow.status !== 'paused') {
      throw new Error(`Cannot resume workflow in status: ${workflow.status}`)
    }

    return await this.executeWorkflow(workflowId)
  }

  // Model Lifecycle Management
  async trainModel(config: {
    name: string
    modelType: 'classification' | 'regression'
    datasetId: string
    hyperparameters?: Record<string, any>
    autoOptimize?: boolean
  }): Promise<{ job: TrainingJob, model: ModelVersion }> {
    console.log(`Starting training for model: ${config.name}`)

    let hyperparameters = config.hyperparameters || {}

    // Auto-optimize hyperparameters if requested
    if (config.autoOptimize) {
      const optimizer = new HyperparameterOptimizer()
      const searchSpace = this.getDefaultSearchSpace(config.modelType)
      
      // Mock dataset for optimization
      const dataset: Dataset = {
        id: config.datasetId,
        name: 'training_data',
        description: 'Training dataset',
        features: [
          { name: 'feature1', type: 'numerical' },
          { name: 'feature2', type: 'numerical' },
          { name: 'feature3', type: 'categorical' }
        ],
        samples: 1000,
        createdAt: new Date(),
        updatedAt: new Date(),
        version: '1.0.0'
      }

      const optimizationResult = await optimizer.optimizeHyperparameters(
        config.modelType,
        dataset,
        searchSpace,
        10 // trials
      )

      hyperparameters = optimizationResult.bestParams
      console.log(`Optimized hyperparameters: ${JSON.stringify(hyperparameters)}`)
    }

    // Create and execute training job
    const job = await this.trainingPipeline.createTrainingJob(
      config.modelType,
      config.datasetId,
      hyperparameters
    )

    // Mock dataset for training
    const dataset: Dataset = {
      id: config.datasetId,
      name: 'training_data',
      description: 'Training dataset',
      features: [
        { name: 'feature1', type: 'numerical' },
        { name: 'feature2', type: 'numerical' },
        { name: 'feature3', type: 'categorical' }
      ],
      samples: 1000,
      createdAt: new Date(),
      updatedAt: new Date(),
      version: '1.0.0'
    }

    const completedJob = await this.trainingPipeline.executeTrainingJob(job, dataset)

    // Register the trained model
    const mockModel = await this.createMockModel()
    const modelVersion = await this.modelRegistry.registerModel(
      config.name,
      config.modelType,
      'tensorflow',
      mockModel,
      completedJob.metrics!,
      {
        trainingJobId: completedJob.id,
        datasetId: config.datasetId
      }
    )

    return { job: completedJob, model: modelVersion }
  }

  async deployModel(modelId: string, config: Partial<DeploymentConfig>): Promise<string> {
    const model = await this.modelRegistry.getModel(modelId)
    if (!model) {
      throw new Error(`Model ${modelId} not found`)
    }

    const deploymentConfig: DeploymentConfig = {
      modelId,
      environment: config.environment || 'staging',
      scalingConfig: {
        minInstances: 1,
        maxInstances: 10,
        targetCPUUtilization: 70,
        ...config.scalingConfig
      },
      monitoringConfig: {
        enableDriftDetection: true,
        alertThresholds: {
          accuracyMin: 0.8,
          latencyMax: 1000,
          errorRateMax: 0.05
        },
        ...config.monitoringConfig
      }
    }

    const deploymentId = uuidv4()
    this.deployments.set(deploymentId, deploymentConfig)

    // Set up monitoring
    await this.modelMonitor.setThresholds(
      modelId,
      deploymentConfig.monitoringConfig.alertThresholds
    )

    // Promote to production if deploying to production
    if (deploymentConfig.environment === 'production') {
      await this.modelRegistry.promoteToProduction(modelId)
    }

    console.log(`Model ${modelId} deployed to ${deploymentConfig.environment}`)
    return deploymentId
  }

  async rollbackDeployment(deploymentId: string, targetModelId: string): Promise<void> {
    const deployment = this.deployments.get(deploymentId)
    if (!deployment) {
      throw new Error(`Deployment ${deploymentId} not found`)
    }

    const targetModel = await this.modelRegistry.getModel(targetModelId)
    if (!targetModel) {
      throw new Error(`Target model ${targetModelId} not found`)
    }

    // Update deployment config
    deployment.modelId = targetModelId

    // Promote target model if needed
    if (deployment.environment === 'production') {
      await this.modelRegistry.promoteToProduction(targetModelId)
    }

    console.log(`Deployment ${deploymentId} rolled back to model ${targetModelId}`)
  }

  // Automated Operations
  async scheduleAutomaticRetraining(
    modelName: string,
    config: {
      frequency: 'daily' | 'weekly' | 'monthly'
      datasetId: string
      performanceThreshold: number
    }
  ): Promise<string> {
    const scheduleId = uuidv4()
    
    console.log(`Scheduled automatic retraining for ${modelName} (${config.frequency})`)
    
    // In a real implementation, this would set up a cron job or similar
    // For now, we'll just log the schedule
    return scheduleId
  }

  async runDataQualityChecks(datasetId: string): Promise<{
    passed: boolean
    issues: string[]
    recommendations: string[]
  }> {
    console.log(`Running data quality checks for dataset ${datasetId}`)

    // Mock data quality checks
    const issues: string[] = []
    const recommendations: string[] = []

    // Simulate some quality checks
    const randomScore = Math.random()
    
    if (randomScore < 0.3) {
      issues.push('Missing values detected in critical features')
      recommendations.push('Implement data imputation or collect additional data')
    }
    
    if (randomScore < 0.2) {
      issues.push('Data drift detected compared to training distribution')
      recommendations.push('Consider retraining model with recent data')
    }

    return {
      passed: issues.length === 0,
      issues,
      recommendations
    }
  }

  async generateModelComparisonReport(modelIds: string[]): Promise<{
    models: ModelVersion[]
    comparison: any
    recommendation: string
  }> {
    const models: ModelVersion[] = []
    
    for (const modelId of modelIds) {
      const model = await this.modelRegistry.getModel(modelId)
      if (model) {
        models.push(model)
      }
    }

    if (models.length < 2) {
      throw new Error('At least 2 models required for comparison')
    }

    // Compare models pairwise
    const comparisons = []
    for (let i = 0; i < models.length - 1; i++) {
      for (let j = i + 1; j < models.length; j++) {
        const comparison = await this.modelRegistry.compareModels(models[i].id, models[j].id)
        comparisons.push(comparison)
      }
    }

    // Determine best model
    const bestModel = models.reduce((best, current) => 
      current.metrics.accuracy > best.metrics.accuracy ? current : best
    )

    return {
      models,
      comparison: comparisons,
      recommendation: `Model ${bestModel.id} (${bestModel.metadata?.name}) has the highest accuracy: ${bestModel.metrics.accuracy.toFixed(3)}`
    }
  }

  // Helper Methods
  private calculateExecutionOrder(steps: WorkflowStep[]): string[] {
    const order: string[] = []
    const visited = new Set<string>()
    const visiting = new Set<string>()

    const visit = (stepId: string) => {
      if (visiting.has(stepId)) {
        throw new Error('Circular dependency detected in workflow')
      }
      if (visited.has(stepId)) {
        return
      }

      visiting.add(stepId)
      
      const step = steps.find(s => s.id === stepId)
      if (step) {
        for (const depId of step.dependencies) {
          visit(depId)
        }
      }

      visiting.delete(stepId)
      visited.add(stepId)
      order.push(stepId)
    }

    for (const step of steps) {
      if (!visited.has(step.id)) {
        visit(step.id)
      }
    }

    return order
  }

  private async executeWorkflowStep(workflow: MLWorkflow, step: WorkflowStep): Promise<void> {
    console.log(`Executing step: ${step.name}`)
    
    step.status = 'running'
    step.startTime = new Date()

    try {
      switch (step.type) {
        case 'data_preparation':
          await this.executeDataPreparationStep(step)
          break
        case 'training':
          await this.executeTrainingStep(step)
          break
        case 'evaluation':
          await this.executeEvaluationStep(step)
          break
        case 'deployment':
          await this.executeDeploymentStep(step)
          break
        case 'monitoring':
          await this.executeMonitoringStep(step)
          break
        default:
          throw new Error(`Unknown step type: ${step.type}`)
      }

      step.status = 'completed'
    } catch (error) {
      step.status = 'failed'
      throw error
    } finally {
      step.endTime = new Date()
    }
  }

  private async executeDataPreparationStep(step: WorkflowStep): Promise<void> {
    // Mock data preparation
    await new Promise(resolve => setTimeout(resolve, 1000))
    step.outputs = { datasetId: uuidv4() }
  }

  private async executeTrainingStep(step: WorkflowStep): Promise<void> {
    // Mock training
    await new Promise(resolve => setTimeout(resolve, 2000))
    step.outputs = { modelId: uuidv4() }
  }

  private async executeEvaluationStep(step: WorkflowStep): Promise<void> {
    // Mock evaluation
    await new Promise(resolve => setTimeout(resolve, 500))
    step.outputs = { 
      metrics: {
        accuracy: 0.85 + Math.random() * 0.1,
        precision: 0.8 + Math.random() * 0.15,
        recall: 0.8 + Math.random() * 0.15
      }
    }
  }

  private async executeDeploymentStep(step: WorkflowStep): Promise<void> {
    // Mock deployment
    await new Promise(resolve => setTimeout(resolve, 1500))
    step.outputs = { deploymentId: uuidv4() }
  }

  private async executeMonitoringStep(step: WorkflowStep): Promise<void> {
    // Mock monitoring setup
    await new Promise(resolve => setTimeout(resolve, 300))
    step.outputs = { monitoringEnabled: true }
  }

  private getDefaultSearchSpace(modelType: string): Record<string, any[]> {
    if (modelType === 'classification') {
      return {
        learningRate: [0.001, 0.01, 0.1],
        batchSize: [32, 64, 128],
        epochs: [50, 100, 150],
        hiddenUnits: [32, 64, 128]
      }
    } else {
      return {
        learningRate: [0.001, 0.01, 0.1],
        batchSize: [32, 64, 128],
        epochs: [50, 100, 150],
        hiddenUnits: [32, 64, 128]
      }
    }
  }

  private async createMockModel(): Promise<any> {
    // Create a simple mock TensorFlow model
    const tf = await import('@tensorflow/tfjs')
    
    const model = tf.sequential({
      layers: [
        tf.layers.dense({ inputShape: [10], units: 32, activation: 'relu' }),
        tf.layers.dense({ units: 16, activation: 'relu' }),
        tf.layers.dense({ units: 1, activation: 'sigmoid' })
      ]
    })
    
    model.compile({
      optimizer: 'adam',
      loss: 'binaryCrossentropy',
      metrics: ['accuracy']
    })
    
    return model
  }

  // Public getters for components
  getModelRegistry(): ModelRegistry {
    return this.modelRegistry
  }

  getFeatureStore(): FeatureStore {
    return this.featureStore
  }

  getModelMonitor(): ModelMonitor {
    return this.modelMonitor
  }

  getWorkflow(workflowId: string): MLWorkflow | undefined {
    return this.workflows.get(workflowId)
  }

  getAllWorkflows(): MLWorkflow[] {
    return Array.from(this.workflows.values())
  }
}
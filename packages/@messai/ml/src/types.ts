import { z } from 'zod'

// Core ML Types
export const ModelMetricsSchema = z.object({
  accuracy: z.number().min(0).max(1),
  precision: z.number().min(0).max(1),
  recall: z.number().min(0).max(1),
  f1Score: z.number().min(0).max(1),
  mse: z.number().optional(),
  rmse: z.number().optional(),
  mae: z.number().optional(),
  r2Score: z.number().optional()
})

export const ModelVersionSchema = z.object({
  id: z.string(),
  version: z.string(),
  modelType: z.enum(['classification', 'regression', 'clustering', 'anomaly_detection']),
  framework: z.enum(['tensorflow', 'pytorch', 'scikit-learn', 'xgboost']),
  status: z.enum(['training', 'validation', 'production', 'deprecated']),
  metrics: ModelMetricsSchema,
  createdAt: z.date(),
  updatedAt: z.date(),
  metadata: z.record(z.any()).optional()
})

export const TrainingJobSchema = z.object({
  id: z.string(),
  modelId: z.string(),
  status: z.enum(['pending', 'running', 'completed', 'failed']),
  progress: z.number().min(0).max(1),
  startTime: z.date(),
  endTime: z.date().optional(),
  hyperparameters: z.record(z.any()),
  metrics: ModelMetricsSchema.optional(),
  logs: z.array(z.string()).default([])
})

export const FeatureSchema = z.object({
  name: z.string(),
  type: z.enum(['numerical', 'categorical', 'text', 'image', 'time_series']),
  importance: z.number().min(0).max(1).optional(),
  statistics: z.object({
    mean: z.number().optional(),
    std: z.number().optional(),
    min: z.number().optional(),
    max: z.number().optional(),
    nullCount: z.number().optional(),
    uniqueCount: z.number().optional()
  }).optional()
})

export const DatasetSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  features: z.array(FeatureSchema),
  samples: z.number(),
  createdAt: z.date(),
  updatedAt: z.date(),
  version: z.string(),
  splits: z.object({
    train: z.number(),
    validation: z.number(),
    test: z.number()
  }).optional()
})

// Research Assistant Types
export const ResearchPaperSchema = z.object({
  id: z.string(),
  title: z.string(),
  authors: z.array(z.string()),
  abstract: z.string(),
  content: z.string().optional(),
  doi: z.string().optional(),
  publishedDate: z.date(),
  journal: z.string().optional(),
  keywords: z.array(z.string()).default([]),
  citations: z.array(z.string()).default([]),
  embedding: z.array(z.number()).optional(),
  processingStatus: z.enum(['pending', 'processing', 'completed', 'failed']).default('pending')
})

export const HypothesisSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  confidence: z.number().min(0).max(1),
  evidencePapers: z.array(z.string()),
  researchGaps: z.array(z.string()),
  suggestedExperiments: z.array(z.string()),
  generatedAt: z.date(),
  status: z.enum(['generated', 'reviewed', 'validated', 'refuted'])
})

export const ResearchInsightSchema = z.object({
  id: z.string(),
  title: z.string(),
  insight: z.string(),
  category: z.enum(['trend', 'gap', 'opportunity', 'methodology', 'material']),
  confidence: z.number().min(0).max(1),
  supportingEvidence: z.array(z.string()),
  relatedPapers: z.array(z.string()),
  generatedAt: z.date()
})

// Predictive Maintenance Types
export const SystemHealthSchema = z.object({
  systemId: z.string(),
  timestamp: z.date(),
  overallHealth: z.number().min(0).max(1),
  componentHealthScores: z.record(z.number().min(0).max(1)),
  anomalyScore: z.number().min(0),
  predictionHorizon: z.number(), // days until predicted failure
  maintenanceRecommendations: z.array(z.string()),
  riskLevel: z.enum(['low', 'medium', 'high', 'critical'])
})

export const AnomalyDetectionSchema = z.object({
  id: z.string(),
  systemId: z.string(),
  timestamp: z.date(),
  anomalyType: z.enum(['performance', 'sensor', 'pattern', 'trend']),
  severity: z.enum(['low', 'medium', 'high', 'critical']),
  description: z.string(),
  affectedComponents: z.array(z.string()),
  detectionMethod: z.string(),
  confidence: z.number().min(0).max(1),
  resolved: z.boolean().default(false)
})

// Materials Discovery Types
export const MaterialPropertySchema = z.object({
  name: z.string(),
  value: z.number(),
  unit: z.string(),
  confidence: z.number().min(0).max(1).optional(),
  source: z.enum(['experimental', 'predicted', 'literature']),
  conditions: z.record(z.any()).optional()
})

export const MaterialSchema = z.object({
  id: z.string(),
  name: z.string(),
  formula: z.string().optional(),
  category: z.enum(['electrode', 'membrane', 'catalyst', 'electrolyte', 'substrate']),
  properties: z.array(MaterialPropertySchema),
  synthesisRoute: z.array(z.string()).optional(),
  cost: z.number().optional(),
  availability: z.enum(['commercial', 'lab_scale', 'research']).optional(),
  sustainability: z.number().min(0).max(1).optional(),
  discoveredAt: z.date().optional(),
  validated: z.boolean().default(false)
})

export const MaterialRecommendationSchema = z.object({
  id: z.string(),
  recommendedMaterial: MaterialSchema,
  targetApplication: z.string(),
  confidence: z.number().min(0).max(1),
  expectedPerformance: z.record(z.number()),
  synthesisComplexity: z.enum(['low', 'medium', 'high']),
  estimatedCost: z.number().optional(),
  alternativeOptions: z.array(z.string()),
  generatedAt: z.date()
})

// Analytics Types
export const TimeSeriesForecastSchema = z.object({
  id: z.string(),
  systemId: z.string(),
  metric: z.string(),
  forecastHorizon: z.number(), // days
  predictions: z.array(z.object({
    timestamp: z.date(),
    value: z.number(),
    confidence: z.number().min(0).max(1),
    upperBound: z.number(),
    lowerBound: z.number()
  })),
  accuracy: z.number().min(0).max(1).optional(),
  model: z.string(),
  generatedAt: z.date()
})

export const PatternRecognitionSchema = z.object({
  id: z.string(),
  datasetId: z.string(),
  patternType: z.enum(['seasonal', 'trend', 'cyclic', 'anomaly', 'correlation']),
  description: z.string(),
  strength: z.number().min(0).max(1),
  frequency: z.string().optional(),
  affectedMetrics: z.array(z.string()),
  discoveredAt: z.date(),
  actionableInsights: z.array(z.string())
})

export const AutoReportSchema = z.object({
  id: z.string(),
  title: z.string(),
  content: z.string(),
  reportType: z.enum(['performance', 'research', 'maintenance', 'discovery', 'experiment']),
  generatedAt: z.date(),
  dataRange: z.object({
    startDate: z.date(),
    endDate: z.date()
  }),
  keyFindings: z.array(z.string()),
  recommendations: z.array(z.string()),
  visualizations: z.array(z.object({
    type: z.string(),
    data: z.any(),
    caption: z.string()
  })).optional()
})

// Type exports
export type ModelMetrics = z.infer<typeof ModelMetricsSchema>
export type ModelVersion = z.infer<typeof ModelVersionSchema>
export type TrainingJob = z.infer<typeof TrainingJobSchema>
export type Feature = z.infer<typeof FeatureSchema>
export type Dataset = z.infer<typeof DatasetSchema>
export type ResearchPaper = z.infer<typeof ResearchPaperSchema>
export type Hypothesis = z.infer<typeof HypothesisSchema>
export type ResearchInsight = z.infer<typeof ResearchInsightSchema>
export type SystemHealth = z.infer<typeof SystemHealthSchema>
export type AnomalyDetection = z.infer<typeof AnomalyDetectionSchema>
export type Material = z.infer<typeof MaterialSchema>
export type MaterialProperty = z.infer<typeof MaterialPropertySchema>
export type MaterialRecommendation = z.infer<typeof MaterialRecommendationSchema>
export type TimeSeriesForecast = z.infer<typeof TimeSeriesForecastSchema>
export type PatternRecognition = z.infer<typeof PatternRecognitionSchema>
export type AutoReport = z.infer<typeof AutoReportSchema>
import { z } from 'zod'
import * as tf from '@tensorflow/tfjs'

// Data preprocessing utilities
export class DataPreprocessor {
  static normalizeNumericFeatures(data: number[][]): { normalized: number[][], stats: { mean: number[], std: number[] } } {
    const features = data[0].length
    const mean = new Array(features).fill(0)
    const std = new Array(features).fill(0)
    
    // Calculate mean
    for (let i = 0; i < data.length; i++) {
      for (let j = 0; j < features; j++) {
        mean[j] += data[i][j]
      }
    }
    mean.forEach((val, idx) => mean[idx] = val / data.length)
    
    // Calculate standard deviation
    for (let i = 0; i < data.length; i++) {
      for (let j = 0; j < features; j++) {
        std[j] += Math.pow(data[i][j] - mean[j], 2)
      }
    }
    std.forEach((val, idx) => std[idx] = Math.sqrt(val / data.length))
    
    // Normalize
    const normalized = data.map(row => 
      row.map((val, idx) => std[idx] === 0 ? 0 : (val - mean[idx]) / std[idx])
    )
    
    return { normalized, stats: { mean, std } }
  }

  static encodeCategoricalFeatures(data: string[]): { encoded: number[], mapping: Map<string, number> } {
    const unique = [...new Set(data)]
    const mapping = new Map(unique.map((val, idx) => [val, idx]))
    const encoded = data.map(val => mapping.get(val) || 0)
    return { encoded, mapping }
  }

  static createTimeSeriesFeatures(data: number[], windowSize: number): number[][] {
    const features: number[][] = []
    for (let i = windowSize; i < data.length; i++) {
      features.push(data.slice(i - windowSize, i))
    }
    return features
  }
}

// Model evaluation utilities
export class ModelEvaluator {
  static calculateMetrics(predictions: number[], targets: number[], type: 'classification' | 'regression') {
    if (type === 'classification') {
      return this.calculateClassificationMetrics(predictions, targets)
    } else {
      return this.calculateRegressionMetrics(predictions, targets)
    }
  }

  private static calculateClassificationMetrics(predictions: number[], targets: number[]) {
    const confusion = this.createConfusionMatrix(predictions, targets)
    const accuracy = this.calculateAccuracy(confusion)
    const precision = this.calculatePrecision(confusion)
    const recall = this.calculateRecall(confusion)
    const f1Score = 2 * (precision * recall) / (precision + recall)
    
    return { accuracy, precision, recall, f1Score }
  }

  private static calculateRegressionMetrics(predictions: number[], targets: number[]) {
    const n = predictions.length
    const mse = predictions.reduce((sum, pred, i) => sum + Math.pow(pred - targets[i], 2), 0) / n
    const rmse = Math.sqrt(mse)
    const mae = predictions.reduce((sum, pred, i) => sum + Math.abs(pred - targets[i]), 0) / n
    
    const targetMean = targets.reduce((sum, val) => sum + val, 0) / n
    const totalSumSquares = targets.reduce((sum, val) => sum + Math.pow(val - targetMean, 2), 0)
    const residualSumSquares = predictions.reduce((sum, pred, i) => sum + Math.pow(targets[i] - pred, 2), 0)
    const r2Score = 1 - (residualSumSquares / totalSumSquares)
    
    return { mse, rmse, mae, r2Score }
  }

  private static createConfusionMatrix(predictions: number[], targets: number[]): number[][] {
    const numClasses = Math.max(...predictions, ...targets) + 1
    const matrix = Array(numClasses).fill(0).map(() => Array(numClasses).fill(0))
    
    for (let i = 0; i < predictions.length; i++) {
      matrix[targets[i]][predictions[i]]++
    }
    
    return matrix
  }

  private static calculateAccuracy(confusion: number[][]): number {
    const total = confusion.flat().reduce((sum, val) => sum + val, 0)
    const correct = confusion.reduce((sum, row, i) => sum + row[i], 0)
    return correct / total
  }

  private static calculatePrecision(confusion: number[][]): number {
    const precisions = confusion.map((_, i) => {
      const tp = confusion[i][i]
      const fp = confusion.reduce((sum, row) => sum + row[i], 0) - tp
      return tp / (tp + fp) || 0
    })
    return precisions.reduce((sum, val) => sum + val, 0) / precisions.length
  }

  private static calculateRecall(confusion: number[][]): number {
    const recalls = confusion.map((row, i) => {
      const tp = row[i]
      const fn = row.reduce((sum, val) => sum + val, 0) - tp
      return tp / (tp + fn) || 0
    })
    return recalls.reduce((sum, val) => sum + val, 0) / recalls.length
  }
}

// Feature engineering utilities
export class FeatureEngineer {
  static createPolynomialFeatures(data: number[][], degree: number): number[][] {
    return data.map(row => {
      const features = [...row]
      
      // Add polynomial features
      for (let d = 2; d <= degree; d++) {
        for (let i = 0; i < row.length; i++) {
          features.push(Math.pow(row[i], d))
        }
      }
      
      // Add interaction features for degree 2
      if (degree >= 2) {
        for (let i = 0; i < row.length; i++) {
          for (let j = i + 1; j < row.length; j++) {
            features.push(row[i] * row[j])
          }
        }
      }
      
      return features
    })
  }

  static createMovingAverageFeatures(data: number[][], windows: number[]): number[][] {
    return data.map((row, rowIdx) => {
      const features = [...row]
      
      for (const window of windows) {
        for (let i = 0; i < row.length; i++) {
          const start = Math.max(0, rowIdx - window + 1)
          const values = data.slice(start, rowIdx + 1).map(r => r[i])
          const average = values.reduce((sum, val) => sum + val, 0) / values.length
          features.push(average)
        }
      }
      
      return features
    })
  }

  static detectAnomalies(data: number[], threshold: number = 2): boolean[] {
    const mean = data.reduce((sum, val) => sum + val, 0) / data.length
    const std = Math.sqrt(data.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / data.length)
    
    return data.map(val => Math.abs(val - mean) > threshold * std)
  }
}

// TensorFlow utilities
export class TensorFlowUtils {
  static async createModel(inputShape: number[], outputShape: number, modelType: 'classification' | 'regression'): Promise<tf.LayersModel> {
    const model = tf.sequential()
    
    // Input layer
    model.add(tf.layers.dense({
      inputShape: [inputShape[0]],
      units: Math.max(64, inputShape[0] * 2),
      activation: 'relu'
    }))
    
    // Hidden layers
    model.add(tf.layers.dropout({ rate: 0.2 }))
    model.add(tf.layers.dense({ units: 32, activation: 'relu' }))
    model.add(tf.layers.dropout({ rate: 0.2 }))
    
    // Output layer
    if (modelType === 'classification') {
      model.add(tf.layers.dense({ 
        units: outputShape, 
        activation: outputShape > 1 ? 'softmax' : 'sigmoid' 
      }))
      
      model.compile({
        optimizer: 'adam',
        loss: outputShape > 1 ? 'categoricalCrossentropy' : 'binaryCrossentropy',
        metrics: ['accuracy']
      })
    } else {
      model.add(tf.layers.dense({ units: outputShape, activation: 'linear' }))
      
      model.compile({
        optimizer: 'adam',
        loss: 'meanSquaredError',
        metrics: ['mae']
      })
    }
    
    return model
  }

  static async trainModel(
    model: tf.LayersModel,
    xTrain: number[][],
    yTrain: number[][],
    xVal: number[][],
    yVal: number[][],
    epochs: number = 100
  ): Promise<tf.History> {
    const xTrainTensor = tf.tensor2d(xTrain)
    const yTrainTensor = tf.tensor2d(yTrain)
    const xValTensor = tf.tensor2d(xVal)
    const yValTensor = tf.tensor2d(yVal)
    
    try {
      const history = await model.fit(xTrainTensor, yTrainTensor, {
        epochs,
        validationData: [xValTensor, yValTensor],
        callbacks: {
          onEpochEnd: (epoch, logs) => {
            console.log(`Epoch ${epoch + 1}/${epochs} - loss: ${logs?.loss?.toFixed(4)} - val_loss: ${logs?.val_loss?.toFixed(4)}`)
          }
        }
      })
      
      return history
    } finally {
      // Clean up tensors
      xTrainTensor.dispose()
      yTrainTensor.dispose()
      xValTensor.dispose()
      yValTensor.dispose()
    }
  }

  static async predict(model: tf.LayersModel, data: number[][]): Promise<number[][]> {
    const inputTensor = tf.tensor2d(data)
    
    try {
      const predictions = model.predict(inputTensor) as tf.Tensor
      return await predictions.array() as number[][]
    } finally {
      inputTensor.dispose()
    }
  }
}

// Validation utilities
export class ValidationUtils {
  static validateSchema<T>(data: unknown, schema: z.ZodSchema<T>): T {
    const result = schema.safeParse(data)
    if (!result.success) {
      throw new Error(`Validation failed: ${result.error.message}`)
    }
    return result.data
  }

  static validateModelOutput(output: number[], expectedShape: number[]): boolean {
    if (output.length !== expectedShape[0]) {
      return false
    }
    
    return output.every(val => !isNaN(val) && isFinite(val))
  }

  static validateTimeSeriesData(data: { timestamp: Date, value: number }[]): boolean {
    if (data.length < 2) return false
    
    // Check chronological order
    for (let i = 1; i < data.length; i++) {
      if (data[i].timestamp <= data[i - 1].timestamp) {
        return false
      }
    }
    
    // Check for valid values
    return data.every(point => !isNaN(point.value) && isFinite(point.value))
  }
}
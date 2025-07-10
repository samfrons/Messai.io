/**
 * Ollama Client Wrapper for MESSAi Research System
 * Provides a unified interface for interacting with local Ollama models
 */

import { exec } from 'child_process'
import { promisify } from 'util'

const execAsync = promisify(exec)

export interface OllamaModel {
  name: string
  id: string
  size: string
  modified: string
}

export interface OllamaResponse {
  model: string
  created_at: string
  response: string
  done: boolean
  context?: number[]
  total_duration?: number
  load_duration?: number
  prompt_eval_count?: number
  prompt_eval_duration?: number
  eval_count?: number
  eval_duration?: number
}

export interface OllamaGenerateOptions {
  model: string
  prompt: string
  system?: string
  template?: string
  context?: number[]
  options?: {
    temperature?: number
    top_k?: number
    top_p?: number
    num_predict?: number
    stop?: string[]
    seed?: number
    num_ctx?: number
  }
  stream?: boolean
  format?: 'json' | undefined
}

export class OllamaClient {
  private baseUrl: string
  private timeout: number

  constructor(baseUrl: string = 'http://localhost:11434', timeout: number = 60000) {
    this.baseUrl = baseUrl
    this.timeout = timeout
  }

  /**
   * Check if Ollama is running
   */
  async isRunning(): Promise<boolean> {
    try {
      const response = await fetch(this.baseUrl, {
        method: 'GET',
        signal: AbortSignal.timeout(5000)
      })
      return response.ok
    } catch {
      return false
    }
  }

  /**
   * List available models
   */
  async listModels(): Promise<OllamaModel[]> {
    try {
      const response = await fetch(`${this.baseUrl}/api/tags`, {
        method: 'GET',
        signal: AbortSignal.timeout(this.timeout)
      })
      
      if (!response.ok) {
        throw new Error(`Failed to list models: ${response.statusText}`)
      }

      const data = await response.json()
      return data.models || []
    } catch (error) {
      console.error('Error listing Ollama models:', error)
      return []
    }
  }

  /**
   * Check if a specific model is available
   */
  async hasModel(modelName: string): Promise<boolean> {
    const models = await this.listModels()
    return models.some(m => m.name === modelName || m.name.startsWith(`${modelName}:`))
  }

  /**
   * Generate a response from the model
   */
  async generate(options: OllamaGenerateOptions): Promise<OllamaResponse> {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), this.timeout)

    try {
      const response = await fetch(`${this.baseUrl}/api/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...options,
          stream: false // Force non-streaming for simplicity
        }),
        signal: controller.signal
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        throw new Error(`Ollama API error: ${response.statusText}`)
      }

      const data = await response.json()
      return data
    } catch (error: any) {
      clearTimeout(timeoutId)
      if (error.name === 'AbortError') {
        throw new Error(`Ollama request timed out after ${this.timeout}ms`)
      }
      throw error
    }
  }

  /**
   * Generate structured JSON output
   */
  async generateJSON<T = any>(
    model: string,
    prompt: string,
    system?: string,
    schema?: any
  ): Promise<T> {
    const systemPrompt = system || 'You are a helpful assistant that always responds with valid JSON.'
    
    const fullPrompt = schema 
      ? `${prompt}\n\nPlease respond with JSON matching this schema:\n${JSON.stringify(schema, null, 2)}`
      : prompt

    const response = await this.generate({
      model,
      prompt: fullPrompt,
      system: systemPrompt,
      format: 'json',
      options: {
        temperature: 0.1, // Lower temperature for more consistent JSON
        num_predict: 4096
      }
    })

    try {
      return JSON.parse(response.response)
    } catch (error) {
      console.error('Failed to parse JSON response:', response.response)
      throw new Error('Model did not return valid JSON')
    }
  }

  /**
   * Extract structured data using a template
   */
  async extractWithTemplate<T = any>(
    model: string,
    text: string,
    template: T,
    instructions?: string
  ): Promise<T> {
    const system = `You are a data extraction specialist. Extract information from the provided text and return it in the exact JSON structure provided. Only extract information that is explicitly stated in the text. For any fields where information is not found, use null.`

    const prompt = `${instructions || 'Extract the following information from the text:'}\n\nTemplate:\n${JSON.stringify(template, null, 2)}\n\nText to analyze:\n${text}`

    return this.generateJSON<T>(model, prompt, system, template)
  }

  /**
   * Process multiple texts in batch
   */
  async processBatch<T = any>(
    model: string,
    texts: string[],
    processFunc: (text: string) => Promise<T>,
    options: {
      concurrency?: number
      onProgress?: (completed: number, total: number) => void
    } = {}
  ): Promise<T[]> {
    const { concurrency = 3, onProgress } = options
    const results: T[] = []
    const queue = [...texts]
    let completed = 0

    const processNext = async (): Promise<void> => {
      const text = queue.shift()
      if (!text) return

      try {
        const result = await processFunc(text)
        results.push(result)
      } catch (error) {
        console.error('Error processing text:', error)
        results.push(null as any)
      }

      completed++
      if (onProgress) {
        onProgress(completed, texts.length)
      }

      if (queue.length > 0) {
        await processNext()
      }
    }

    // Start concurrent processing
    const workers = Array(Math.min(concurrency, texts.length))
      .fill(null)
      .map(() => processNext())

    await Promise.all(workers)
    return results
  }

  /**
   * Get model recommendations for specific tasks
   */
  getRecommendedModel(task: 'extraction' | 'summary' | 'analysis' | 'math'): string {
    const recommendations = {
      extraction: 'qwen2.5-coder:latest', // Good at structured data
      summary: 'qwen3:latest', // Good general purpose
      analysis: 'deepseek-r1:latest', // Good reasoning
      math: 'deepseek-r1:latest' // Excellent at math
    }

    return recommendations[task] || 'qwen3:latest'
  }

  /**
   * Validate if Ollama is properly configured
   */
  async validateSetup(): Promise<{
    isRunning: boolean
    availableModels: string[]
    recommendedModels: { [key: string]: boolean }
    issues: string[]
  }> {
    const issues: string[] = []
    const isRunning = await this.isRunning()

    if (!isRunning) {
      issues.push('Ollama is not running. Please start it with: ollama serve')
      return { isRunning, availableModels: [], recommendedModels: {}, issues }
    }

    const models = await this.listModels()
    const availableModels = models.map(m => m.name)

    const recommendedModels = {
      'qwen2.5-coder': await this.hasModel('qwen2.5-coder'),
      'qwen3': await this.hasModel('qwen3'),
      'deepseek-r1': await this.hasModel('deepseek-r1'),
      'nuextract': await this.hasModel('nuextract'),
      'phi3.5': await this.hasModel('phi3.5')
    }

    if (!recommendedModels['qwen2.5-coder'] && !recommendedModels['qwen3']) {
      issues.push('No Qwen models found. These are recommended for extraction tasks.')
    }

    if (!recommendedModels['deepseek-r1']) {
      issues.push('DeepSeek-R1 not found. This is recommended for mathematical analysis.')
    }

    return { isRunning, availableModels, recommendedModels, issues }
  }
}

// Export a default instance
export const ollamaClient = new OllamaClient()
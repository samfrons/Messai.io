// OpenAPI specification generator for MESSAI API

import { OpenAPIV3 } from 'openapi-types'
import { API_ERROR_CODES, UserRole, Permission } from './types'

export const openApiSpec: OpenAPIV3.Document = {
  openapi: '3.0.0',
  info: {
    title: 'MESSAI API',
    version: '1.0.0',
    description: `
# MESSAI Platform API

The MESSAI (Microbial Electrochemical Systems AI) API provides comprehensive access to research data, 
laboratory tools, AI predictions, and optimization capabilities for bioelectrochemical systems.

## Features

- **Research Papers**: Access to 3,721+ enhanced research papers with AI-extracted data
- **Laboratory Tools**: 3D modeling, bioreactor design, and electroanalytical tools
- **AI Predictions**: Machine learning-powered performance predictions
- **Optimization**: Multi-objective optimization algorithms
- **Parameters Database**: 1,500+ scientific parameters across 150 categories

## Authentication

The API uses session-based authentication with role-based access control (RBAC).
All protected endpoints require authentication and appropriate permissions.

## Rate Limiting

Rate limits vary by user role:
- **Admin**: 10,000 requests/hour
- **Researcher**: 1,000 requests/hour  
- **Industry**: 2,000 requests/hour
- **Student**: 500 requests/hour
- **Demo**: 100 requests/hour

## Error Handling

All endpoints return standardized error responses with detailed error codes and messages.
    `,
    contact: {
      name: 'MESSAI Support',
      email: 'support@messai.io',
      url: 'https://messai.io/support',
    },
    license: {
      name: 'MIT',
      url: 'https://opensource.org/licenses/MIT',
    },
  },
  servers: [
    {
      url: 'https://app.messai.io/api',
      description: 'Production server',
    },
    {
      url: 'http://localhost:3001/api',
      description: 'Development server',
    },
  ],
  paths: {
    // Research Papers endpoints
    '/papers': {
      get: {
        summary: 'List research papers',
        description: 'Retrieve research papers with advanced filtering, search, and pagination',
        tags: ['Research Papers'],
        parameters: [
          {
            name: 'page',
            in: 'query',
            description: 'Page number for pagination',
            schema: { type: 'integer', minimum: 1, default: 1 },
          },
          {
            name: 'limit',
            in: 'query',
            description: 'Number of papers per page',
            schema: { type: 'integer', minimum: 1, maximum: 100, default: 10 },
          },
          {
            name: 'search',
            in: 'query',
            description: 'Search term for title, abstract, keywords, and authors',
            schema: { type: 'string', maxLength: 500 },
          },
          {
            name: 'realOnly',
            in: 'query',
            description: 'Filter to show only real/published papers',
            schema: { type: 'boolean', default: false },
          },
          {
            name: 'requireMicrobial',
            in: 'query',
            description: 'Filter to show only microbial-relevant papers',
            schema: { type: 'boolean', default: true },
          },
          {
            name: 'algaeOnly',
            in: 'query',
            description: 'Filter to show only algae-related papers',
            schema: { type: 'boolean', default: false },
          },
          {
            name: 'microbes',
            in: 'query',
            description: 'Comma-separated list of microbe types to filter by',
            schema: { type: 'string' },
            example: 'Geobacter,Shewanella',
          },
          {
            name: 'systemTypes',
            in: 'query',
            description: 'Comma-separated list of system types (MFC, MEC, MDC, MES)',
            schema: { type: 'string' },
            example: 'MFC,MEC',
          },
          {
            name: 'minPower',
            in: 'query',
            description: 'Minimum power output in mW',
            schema: { type: 'number', minimum: 0 },
          },
          {
            name: 'minEfficiency',
            in: 'query',
            description: 'Minimum efficiency percentage',
            schema: { type: 'number', minimum: 0, maximum: 100 },
          },
          {
            name: 'hasFullData',
            in: 'query',
            description: 'Filter papers with complete performance data',
            schema: { type: 'boolean', default: false },
          },
          {
            name: 'sortBy',
            in: 'query',
            description: 'Sort criteria',
            schema: { 
              type: 'string', 
              enum: ['date', 'power', 'efficiency', 'relevance'],
              default: 'date',
            },
          },
        ],
        responses: {
          '200': {
            description: 'List of research papers',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/PapersListResponse',
                },
              },
            },
          },
          '400': { $ref: '#/components/responses/ValidationError' },
          '500': { $ref: '#/components/responses/InternalError' },
        },
      },
      post: {
        summary: 'Create research paper',
        description: 'Add a new research paper to the database',
        tags: ['Research Papers'],
        security: [{ sessionAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/PaperCreateRequest' },
            },
          },
        },
        responses: {
          '201': {
            description: 'Paper created successfully',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/PaperResponse' },
              },
            },
          },
          '400': { $ref: '#/components/responses/ValidationError' },
          '401': { $ref: '#/components/responses/Unauthorized' },
          '403': { $ref: '#/components/responses/Forbidden' },
          '409': { $ref: '#/components/responses/Conflict' },
          '500': { $ref: '#/components/responses/InternalError' },
        },
      },
    },
    '/papers/{id}': {
      get: {
        summary: 'Get research paper',
        description: 'Retrieve a specific research paper by ID',
        tags: ['Research Papers'],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            description: 'Paper ID',
            schema: { type: 'string' },
          },
        ],
        responses: {
          '200': {
            description: 'Research paper details',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/PaperResponse' },
              },
            },
          },
          '404': { $ref: '#/components/responses/NotFound' },
          '500': { $ref: '#/components/responses/InternalError' },
        },
      },
    },
    // Laboratory endpoints
    '/laboratory/bioreactor': {
      post: {
        summary: 'Create bioreactor model',
        description: 'Design and configure a new bioreactor model',
        tags: ['Laboratory'],
        security: [{ sessionAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/BioreactorCreateRequest' },
            },
          },
        },
        responses: {
          '201': {
            description: 'Bioreactor created successfully',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/BioreactorResponse' },
              },
            },
          },
          '400': { $ref: '#/components/responses/ValidationError' },
          '401': { $ref: '#/components/responses/Unauthorized' },
          '403': { $ref: '#/components/responses/Forbidden' },
          '500': { $ref: '#/components/responses/InternalError' },
        },
      },
    },
    // Prediction endpoints
    '/predictions': {
      post: {
        summary: 'Generate power predictions',
        description: 'Predict power output based on system parameters',
        tags: ['AI Predictions'],
        security: [{ sessionAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/PredictionRequest' },
            },
          },
        },
        responses: {
          '200': {
            description: 'Prediction results',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/PredictionResponse' },
              },
            },
          },
          '400': { $ref: '#/components/responses/ValidationError' },
          '401': { $ref: '#/components/responses/Unauthorized' },
          '403': { $ref: '#/components/responses/Forbidden' },
          '500': { $ref: '#/components/responses/InternalError' },
        },
      },
      get: {
        summary: 'Get prediction API info',
        description: 'Information about the prediction API and supported design types',
        tags: ['AI Predictions'],
        responses: {
          '200': {
            description: 'API information',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/PredictionInfoResponse' },
              },
            },
          },
        },
      },
    },
    // Optimization endpoints
    '/optimization/bioreactor': {
      post: {
        summary: 'Optimize bioreactor design',
        description: 'Multi-objective optimization for bioreactor parameters',
        tags: ['Optimization'],
        security: [{ sessionAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/OptimizationRequest' },
            },
          },
        },
        responses: {
          '201': {
            description: 'Optimization started',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/OptimizationResponse' },
              },
            },
          },
          '202': {
            description: 'Optimization accepted for processing',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/OptimizationResponse' },
              },
            },
          },
          '400': { $ref: '#/components/responses/ValidationError' },
          '401': { $ref: '#/components/responses/Unauthorized' },
          '403': { $ref: '#/components/responses/Forbidden' },
          '500': { $ref: '#/components/responses/InternalError' },
        },
      },
    },
    // Parameters endpoints
    '/parameters': {
      get: {
        summary: 'List parameters',
        description: 'Retrieve scientific parameters from the database',
        tags: ['Parameters'],
        parameters: [
          {
            name: 'category',
            in: 'query',
            description: 'Parameter category filter',
            schema: { type: 'string' },
          },
          {
            name: 'search',
            in: 'query',
            description: 'Search term for parameter names',
            schema: { type: 'string' },
          },
        ],
        responses: {
          '200': {
            description: 'List of parameters',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ParametersListResponse' },
              },
            },
          },
          '400': { $ref: '#/components/responses/ValidationError' },
          '500': { $ref: '#/components/responses/InternalError' },
        },
      },
    },
  },
  components: {
    securitySchemes: {
      sessionAuth: {
        type: 'apiKey',
        in: 'cookie',
        name: 'next-auth.session-token',
        description: 'Session-based authentication using NextAuth.js cookies',
      },
    },
    schemas: {
      // Standard API Response
      ApiResponse: {
        type: 'object',
        required: ['success', 'meta'],
        properties: {
          success: { type: 'boolean' },
          data: { type: 'object' },
          error: { $ref: '#/components/schemas/ApiError' },
          meta: { $ref: '#/components/schemas/ApiMeta' },
        },
      },
      ApiError: {
        type: 'object',
        required: ['code', 'message'],
        properties: {
          code: { 
            type: 'string',
            enum: Object.values(API_ERROR_CODES),
          },
          message: { type: 'string' },
          details: { type: 'object' },
          field: { type: 'string' },
        },
      },
      ApiMeta: {
        type: 'object',
        required: ['timestamp', 'requestId', 'version'],
        properties: {
          timestamp: { type: 'string', format: 'date-time' },
          requestId: { type: 'string', format: 'uuid' },
          version: { type: 'string', default: '1.0.0' },
          pagination: { $ref: '#/components/schemas/Pagination' },
          performance: { $ref: '#/components/schemas/Performance' },
        },
      },
      Pagination: {
        type: 'object',
        required: ['page', 'limit', 'total', 'totalPages'],
        properties: {
          page: { type: 'integer', minimum: 1 },
          limit: { type: 'integer', minimum: 1, maximum: 100 },
          total: { type: 'integer', minimum: 0 },
          totalPages: { type: 'integer', minimum: 0 },
        },
      },
      Performance: {
        type: 'object',
        properties: {
          executionTime: { type: 'number', description: 'Execution time in milliseconds' },
          queriesExecuted: { type: 'number', description: 'Number of database queries' },
        },
      },
      // Research Paper schemas
      ResearchPaper: {
        type: 'object',
        required: ['id', 'title', 'authors', 'externalUrl'],
        properties: {
          id: { type: 'string' },
          title: { type: 'string', maxLength: 500 },
          authors: { 
            type: 'array',
            items: { type: 'string' },
            minItems: 1,
          },
          abstract: { type: 'string' },
          doi: { type: 'string' },
          pubmedId: { type: 'string' },
          arxivId: { type: 'string' },
          externalUrl: { type: 'string', format: 'uri' },
          journal: { type: 'string' },
          publicationDate: { type: 'string', format: 'date' },
          systemType: { 
            type: 'string',
            enum: ['MFC', 'MEC', 'MDC', 'MES', 'PEM', 'SOFC'],
          },
          powerOutput: { type: 'number', minimum: 0 },
          efficiency: { type: 'number', minimum: 0, maximum: 100 },
          organismTypes: {
            type: 'array',
            items: { type: 'string' },
          },
          anodeMaterials: {
            type: 'array',
            items: { type: 'string' },
          },
          cathodeMaterials: {
            type: 'array',
            items: { type: 'string' },
          },
          keywords: {
            type: 'array',
            items: { type: 'string' },
          },
          isPublic: { type: 'boolean', default: true },
          uploadedBy: { type: 'string' },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
          // AI processing fields
          aiData: { type: 'object' },
          hasPerformanceData: { type: 'boolean' },
          isAiProcessed: { type: 'boolean' },
          confidenceScore: { type: 'number', minimum: 0, maximum: 1 },
        },
      },
      PaperCreateRequest: {
        type: 'object',
        required: ['title', 'authors', 'externalUrl'],
        properties: {
          title: { type: 'string', minLength: 1, maxLength: 500 },
          authors: {
            type: 'array',
            items: { type: 'string' },
            minItems: 1,
          },
          abstract: { type: 'string' },
          doi: { type: 'string' },
          pubmedId: { type: 'string' },
          arxivId: { type: 'string' },
          externalUrl: { type: 'string', format: 'uri' },
          journal: { type: 'string' },
          publicationDate: { type: 'string', format: 'date-time' },
          keywords: {
            type: 'array',
            items: { type: 'string' },
          },
          systemType: { type: 'string' },
          powerOutput: { type: 'number', minimum: 0 },
          efficiency: { type: 'number', minimum: 0, maximum: 100 },
          organismTypes: {
            type: 'array',
            items: { type: 'string' },
          },
          anodeMaterials: {
            type: 'array',
            items: { type: 'string' },
          },
          cathodeMaterials: {
            type: 'array',
            items: { type: 'string' },
          },
          isPublic: { type: 'boolean', default: true },
        },
      },
      PaperResponse: {
        allOf: [
          { $ref: '#/components/schemas/ApiResponse' },
          {
            type: 'object',
            properties: {
              data: { $ref: '#/components/schemas/ResearchPaper' },
            },
          },
        ],
      },
      PapersListResponse: {
        allOf: [
          { $ref: '#/components/schemas/ApiResponse' },
          {
            type: 'object',
            properties: {
              data: {
                type: 'object',
                properties: {
                  papers: {
                    type: 'array',
                    items: { $ref: '#/components/schemas/ResearchPaper' },
                  },
                },
              },
            },
          },
        ],
      },
      // Laboratory schemas
      BioreactorCreateRequest: {
        type: 'object',
        required: ['name', 'type'],
        properties: {
          name: { type: 'string', minLength: 1, maxLength: 100 },
          description: { type: 'string' },
          type: {
            type: 'string',
            enum: ['bioreactor', 'fuel-cell', 'electrolysis', 'desalination'],
          },
          parameters: {
            type: 'object',
            properties: {
              volume: { type: 'number', minimum: 0, maximum: 10000 },
              temperature: { type: 'number', minimum: 0, maximum: 100 },
              ph: { type: 'number', minimum: 0, maximum: 14 },
              agitationRate: { type: 'number', minimum: 0 },
              airFlowRate: { type: 'number', minimum: 0 },
              feedRate: { type: 'number', minimum: 0 },
            },
          },
          isPublic: { type: 'boolean', default: false },
        },
      },
      BioreactorResponse: {
        allOf: [
          { $ref: '#/components/schemas/ApiResponse' },
          {
            type: 'object',
            properties: {
              data: {
                type: 'object',
                properties: {
                  id: { type: 'string' },
                  name: { type: 'string' },
                  type: { type: 'string' },
                  parameters: { type: 'object' },
                  isPublic: { type: 'boolean' },
                  userId: { type: 'string' },
                  createdAt: { type: 'string', format: 'date-time' },
                },
              },
            },
          },
        ],
      },
      // Prediction schemas
      PredictionRequest: {
        type: 'object',
        required: ['temperature', 'ph', 'substrateConcentration'],
        properties: {
          temperature: { 
            type: 'number', 
            minimum: 20, 
            maximum: 40,
            description: 'Temperature in Celsius',
          },
          ph: { 
            type: 'number', 
            minimum: 6, 
            maximum: 8,
            description: 'pH level',
          },
          substrateConcentration: { 
            type: 'number', 
            minimum: 0.5, 
            maximum: 2,
            description: 'Substrate concentration in g/L',
          },
          designType: { 
            type: 'string',
            enum: [
              'earthen-pot', 'cardboard', 'mason-jar', '3d-printed', 'wetland',
              'micro-chip', 'isolinear-chip', 'benchtop-bioreactor', 
              'wastewater-treatment', 'brewery-processing', 'architectural-facade',
              'benthic-fuel-cell', 'kitchen-sink',
            ],
          },
        },
      },
      PredictionResponse: {
        allOf: [
          { $ref: '#/components/schemas/ApiResponse' },
          {
            type: 'object',
            properties: {
              data: {
                type: 'object',
                required: ['predictedPower', 'confidenceInterval', 'factors'],
                properties: {
                  predictedPower: { 
                    type: 'number',
                    description: 'Predicted power output in mW',
                  },
                  confidenceInterval: {
                    type: 'object',
                    properties: {
                      lower: { type: 'number' },
                      upper: { type: 'number' },
                    },
                  },
                  factors: {
                    type: 'object',
                    properties: {
                      temperature: { type: 'number' },
                      ph: { type: 'number' },
                      substrate: { type: 'number' },
                      designBonus: { type: 'number' },
                    },
                  },
                },
              },
            },
          },
        ],
      },
      PredictionInfoResponse: {
        allOf: [
          { $ref: '#/components/schemas/ApiResponse' },
          {
            type: 'object',
            properties: {
              data: {
                type: 'object',
                properties: {
                  message: { type: 'string' },
                  endpoints: { type: 'object' },
                  supportedDesigns: {
                    type: 'array',
                    items: { type: 'string' },
                  },
                },
              },
            },
          },
        ],
      },
      // Optimization schemas
      OptimizationRequest: {
        type: 'object',
        required: ['objectives'],
        properties: {
          objectives: {
            type: 'array',
            items: {
              type: 'string',
              enum: ['power', 'efficiency', 'cost', 'sustainability'],
            },
            minItems: 1,
          },
          constraints: {
            type: 'object',
            properties: {
              temperature: {
                type: 'object',
                properties: {
                  min: { type: 'number' },
                  max: { type: 'number' },
                },
              },
              ph: {
                type: 'object',
                properties: {
                  min: { type: 'number' },
                  max: { type: 'number' },
                },
              },
              budget: {
                type: 'object',
                properties: {
                  max: { type: 'number', minimum: 0 },
                },
              },
            },
          },
          algorithm: {
            type: 'string',
            enum: ['nsga2', 'genetic', 'particle_swarm', 'gradient_descent'],
            default: 'nsga2',
          },
          parameters: {
            type: 'object',
            properties: {
              populationSize: { type: 'integer', minimum: 10, maximum: 1000 },
              generations: { type: 'integer', minimum: 1, maximum: 500 },
              mutationRate: { type: 'number', minimum: 0, maximum: 1 },
            },
          },
        },
      },
      OptimizationResponse: {
        allOf: [
          { $ref: '#/components/schemas/ApiResponse' },
          {
            type: 'object',
            properties: {
              data: {
                type: 'object',
                properties: {
                  id: { type: 'string' },
                  status: {
                    type: 'string',
                    enum: ['running', 'completed', 'failed'],
                  },
                  progress: { type: 'number', minimum: 0, maximum: 1 },
                  objectives: {
                    type: 'array',
                    items: { type: 'string' },
                  },
                  results: {
                    type: 'object',
                    properties: {
                      optimalSolutions: {
                        type: 'array',
                        items: { type: 'object' },
                      },
                      convergenceData: { type: 'object' },
                      paretoFront: { type: 'boolean' },
                    },
                  },
                },
              },
            },
          },
        ],
      },
      // Parameters schemas
      ParametersListResponse: {
        allOf: [
          { $ref: '#/components/schemas/ApiResponse' },
          {
            type: 'object',
            properties: {
              data: {
                type: 'object',
                properties: {
                  parameters: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        id: { type: 'string' },
                        name: { type: 'string' },
                        category: { type: 'string' },
                        unit: { type: 'string' },
                        description: { type: 'string' },
                        defaultValue: { type: 'number' },
                        minValue: { type: 'number' },
                        maxValue: { type: 'number' },
                      },
                    },
                  },
                },
              },
            },
          },
        ],
      },
    },
    responses: {
      Unauthorized: {
        description: 'Authentication required',
        content: {
          'application/json': {
            schema: {
              allOf: [
                { $ref: '#/components/schemas/ApiResponse' },
                {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: false },
                    error: {
                      type: 'object',
                      properties: {
                        code: { type: 'string', example: 'UNAUTHORIZED' },
                        message: { type: 'string', example: 'Authentication required' },
                      },
                    },
                  },
                },
              ],
            },
          },
        },
      },
      Forbidden: {
        description: 'Insufficient permissions',
        content: {
          'application/json': {
            schema: {
              allOf: [
                { $ref: '#/components/schemas/ApiResponse' },
                {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: false },
                    error: {
                      type: 'object',
                      properties: {
                        code: { type: 'string', example: 'INSUFFICIENT_PERMISSIONS' },
                        message: { type: 'string', example: 'Missing required permission' },
                      },
                    },
                  },
                },
              ],
            },
          },
        },
      },
      ValidationError: {
        description: 'Validation error',
        content: {
          'application/json': {
            schema: {
              allOf: [
                { $ref: '#/components/schemas/ApiResponse' },
                {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: false },
                    error: {
                      type: 'object',
                      properties: {
                        code: { type: 'string', example: 'VALIDATION_ERROR' },
                        message: { type: 'string', example: 'Invalid input data' },
                        field: { type: 'string', example: 'email' },
                        details: { type: 'object' },
                      },
                    },
                  },
                },
              ],
            },
          },
        },
      },
      NotFound: {
        description: 'Resource not found',
        content: {
          'application/json': {
            schema: {
              allOf: [
                { $ref: '#/components/schemas/ApiResponse' },
                {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: false },
                    error: {
                      type: 'object',
                      properties: {
                        code: { type: 'string', example: 'NOT_FOUND' },
                        message: { type: 'string', example: 'Resource not found' },
                      },
                    },
                  },
                },
              ],
            },
          },
        },
      },
      Conflict: {
        description: 'Conflict with existing resource',
        content: {
          'application/json': {
            schema: {
              allOf: [
                { $ref: '#/components/schemas/ApiResponse' },
                {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: false },
                    error: {
                      type: 'object',
                      properties: {
                        code: { type: 'string', example: 'CONFLICT' },
                        message: { type: 'string', example: 'Resource already exists' },
                      },
                    },
                  },
                },
              ],
            },
          },
        },
      },
      InternalError: {
        description: 'Internal server error',
        content: {
          'application/json': {
            schema: {
              allOf: [
                { $ref: '#/components/schemas/ApiResponse' },
                {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: false },
                    error: {
                      type: 'object',
                      properties: {
                        code: { type: 'string', example: 'INTERNAL_ERROR' },
                        message: { type: 'string', example: 'Internal server error' },
                      },
                    },
                  },
                },
              ],
            },
          },
        },
      },
    },
  },
  tags: [
    {
      name: 'Research Papers',
      description: 'Operations for managing research papers and scientific literature',
    },
    {
      name: 'Laboratory',
      description: '3D modeling and laboratory tool operations',
    },
    {
      name: 'AI Predictions',
      description: 'Machine learning powered predictions for system performance',
    },
    {
      name: 'Optimization',
      description: 'Multi-objective optimization algorithms and tools',
    },
    {
      name: 'Parameters',
      description: 'Scientific parameters and materials database',
    },
  ],
}

export default openApiSpec
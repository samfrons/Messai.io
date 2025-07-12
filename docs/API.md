# MESSAi API Documentation

## Overview

The MESSAi API provides programmatic access to microbial fuel cell predictions, experiment management, and design configurations. All API endpoints follow RESTful conventions and return JSON responses.

## Base URL

```
Development: http://localhost:3003/api
Production: https://your-domain.com/api
```

## Authentication

Currently, the API is open for development. Production deployment will require API key authentication:

```http
Authorization: Bearer YOUR_API_KEY
```

## Endpoints

### Predictions API

#### Get Power Output Prediction

Calculates predicted power output based on experimental parameters and MFC design.

**Endpoint:** `POST /api/predictions`

**Request Body:**
```json
{
  "temperature": 28.5,
  "ph": 7.1,
  "substrateConcentration": 1.2,
  "designType": "benchtop-bioreactor"
}
```

**Parameters:**
| Parameter | Type | Required | Description | Valid Range |
|-----------|------|----------|-------------|-------------|
| temperature | number | Yes | Operating temperature in Celsius | 0-50 |
| ph | number | Yes | pH level of the medium | 4.0-10.0 |
| substrateConcentration | number | Yes | Substrate concentration in g/L | 0.1-10.0 |
| designType | string | Yes | MFC design identifier | See design types below |

**Response:**
```json
{
  "predictedPower": 245.6,
  "confidenceInterval": {
    "lower": 209.8,
    "upper": 281.4
  },
  "factors": {
    "temperature": 17.5,
    "ph": 12.0,
    "substrate": 6.0,
    "designBonus": 80.0
  },
  "recommendations": {
    "optimal": {
      "temperature": 30,
      "ph": 7.0,
      "substrate": 1.5
    },
    "improvements": [
      "Increase temperature by 1.5°C for 5% power gain",
      "Adjust pH to 7.0 for optimal performance"
    ]
  }
}
```

**Status Codes:**
- `200 OK` - Successful prediction
- `400 Bad Request` - Invalid parameters
- `500 Internal Server Error` - Server error

**Example cURL:**
```bash
curl -X POST http://localhost:3003/api/predictions \
  -H "Content-Type: application/json" \
  -d '{
    "temperature": 28.5,
    "ph": 7.1,
    "substrateConcentration": 1.2,
    "designType": "benchtop-bioreactor"
  }'
```

### Design Types

Valid design type identifiers for the prediction API:

| Design Type | Description | Scale | Power Range |
|-------------|-------------|-------|-------------|
| `earthen-pot` | Clay-based MFC | Laboratory | 10-30 mW/m² |
| `cardboard` | Low-cost cardboard design | Laboratory | 5-15 mW/m² |
| `mason-jar` | Classic benchtop setup | Laboratory | 20-50 mW/m² |
| `3d-printed` | Customizable hexagonal | Laboratory | 30-80 mW/m² |
| `wetland` | Constructed wetland MFC | Pilot | 40-100 mW/m² |
| `micro-chip` | Silicon microfluidic | Laboratory | 50-150 mW/m² |
| `isolinear-chip` | Microscope slide format | Laboratory | 60-180 mW/m² |
| `benchtop-bioreactor` | 5L stirred tank | Pilot | 200-500 mW/m² |
| `wastewater-treatment` | Municipal treatment | Industrial | 15-35 W/m² |
| `brewery-processing` | Brewery wastewater | Industrial | 20-40 W/m² |
| `architectural-facade` | Building-integrated | Industrial | 30-50 W/m² |
| `benthic-fuel-cell` | Marine deployment | Field | 10-25 W/m² |
| `kitchen-sink` | Household waste | Residential | 100-300 mW/m² |

## Error Handling

All API errors follow a consistent format:

```json
{
  "error": {
    "code": "INVALID_PARAMETERS",
    "message": "Temperature must be between 0 and 50 degrees Celsius",
    "field": "temperature",
    "timestamp": "2024-01-15T10:30:00Z"
  }
}
```

### Error Codes

| Code | Description |
|------|-------------|
| `INVALID_PARAMETERS` | One or more request parameters are invalid |
| `DESIGN_NOT_FOUND` | Specified design type does not exist |
| `PREDICTION_FAILED` | Unable to generate prediction |
| `RATE_LIMIT_EXCEEDED` | Too many requests |
| `INTERNAL_ERROR` | Unexpected server error |

## Rate Limiting

API requests are limited to:
- Development: Unlimited
- Production: 100 requests per minute per API key

Rate limit headers:
```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1642248000
```

## Webhooks (Coming Soon)

Subscribe to real-time updates for experiment changes:

```json
{
  "url": "https://your-domain.com/webhook",
  "events": ["experiment.created", "experiment.updated", "prediction.completed"],
  "secret": "your-webhook-secret"
}
```

## SDK Support

### JavaScript/TypeScript

```typescript
import { MESSAiClient } from '@messai/sdk';

const client = new MESSAiClient({
  apiKey: 'YOUR_API_KEY',
  environment: 'production'
});

const prediction = await client.predictions.create({
  temperature: 28.5,
  ph: 7.1,
  substrateConcentration: 1.2,
  designType: 'benchtop-bioreactor'
});

console.log(`Predicted power: ${prediction.predictedPower} mW/m²`);
```

### Python

```python
from messai import MESSAiClient

client = MESSAiClient(
    api_key="YOUR_API_KEY",
    environment="production"
)

prediction = client.predictions.create(
    temperature=28.5,
    ph=7.1,
    substrate_concentration=1.2,
    design_type="benchtop-bioreactor"
)

print(f"Predicted power: {prediction.predicted_power} mW/m²")
```

## Batch Operations

For processing multiple predictions efficiently:

```json
POST /api/predictions/batch

{
  "predictions": [
    {
      "id": "pred-1",
      "temperature": 28.5,
      "ph": 7.1,
      "substrateConcentration": 1.2,
      "designType": "benchtop-bioreactor"
    },
    {
      "id": "pred-2",
      "temperature": 30.0,
      "ph": 7.0,
      "substrateConcentration": 1.5,
      "designType": "mason-jar"
    }
  ]
}
```

## GraphQL API (Coming Soon)

```graphql
query GetPrediction($input: PredictionInput!) {
  prediction(input: $input) {
    predictedPower
    confidenceInterval {
      lower
      upper
    }
    factors {
      temperature
      ph
      substrate
      designBonus
    }
  }
}
```

## API Versioning

The API uses URL versioning. Current version: `v1`

Future versions will maintain backwards compatibility:
```
/api/v1/predictions (current)
/api/v2/predictions (future)
```

## Testing

Use our API playground to test endpoints:
```
Development: http://localhost:3003/api-playground
Production: https://your-domain.com/api-playground
```

## Support

For API support:
- GitHub Issues: [Report bugs](https://github.com/your-org/messai/issues)
- API Status: https://status.messai.com
- Email: api-support@messai.com
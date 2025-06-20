# MESSAi MVP - MFC Research Platform

A web application for microbial fuel cell (MFC) researchers to track experiments and get AI insights.

## Features

- **MFC Design Catalog** - Browse pre-validated MFC designs with cost and power output information
- **Experiment Dashboard** - Create and track experiments with real-time monitoring
- **AI Predictions** - Get power output predictions based on experimental parameters
- **Data Visualization** - Real-time charts showing power, voltage, current, temperature, and pH
- **CSV Data Upload** - Import historical experiment data

## Tech Stack

- Next.js 14 with App Router
- TypeScript
- Tailwind CSS
- Recharts for data visualization
- Prisma with PostgreSQL (schema ready)
- Server actions for API endpoints

## Getting Started

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Set up database** (Optional - app works with mock data)
   ```bash
   # Update DATABASE_URL in .env with your PostgreSQL connection
   npx prisma db push
   npx prisma db seed
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Open** http://localhost:3003

## Usage

1. **Select MFC Design** - Choose from 5 pre-configured designs on the homepage
2. **Configure Experiment** - Set temperature (20-40°C), pH (6-8), and substrate concentration (0.5-2 g/L)
3. **Monitor Results** - View real-time power output charts and AI predictions
4. **Upload Data** - Import CSV files with columns: timestamp, voltage, current, temperature, ph

## API Endpoints

### POST /api/predictions
Get AI power output predictions.

**Request:**
```json
{
  "temperature": 28.5,
  "ph": 7.1,
  "substrateConcentration": 1.2,
  "designType": "earthen-pot"
}
```

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
    "designBonus": -10.0
  }
}
```

## MFC Designs

1. **Earthen Pot MFC** ($1, 100-500 mW/m²)
2. **Cardboard MFC** ($0.50, 50-200 mW/m²)
3. **Mason Jar MFC** ($10, 200-400 mW/m²)
4. **3D Printed MFC** ($30, 300-750 mW/m²)
5. **Wetland MFC** ($100, 500-3000 mW/m²)

## Project Structure

```
messai-mvp/
├── app/
│   ├── page.tsx                 # MFC design catalog
│   ├── dashboard/page.tsx       # Experiment dashboard  
│   ├── experiment/[id]/page.tsx # Single experiment view
│   └── api/predictions/route.ts # AI predictions API
├── components/
│   ├── MFCDesignCard.tsx       # Design selection cards
│   ├── ExperimentChart.tsx     # Real-time data visualization
│   └── ParameterForm.tsx       # Experiment configuration
├── lib/
│   ├── db.ts                   # Prisma client
│   └── ai-predictions.ts       # AI prediction utilities
└── prisma/
    ├── schema.prisma           # Database schema
    └── seed.ts                 # Seed data
```

## Development Notes

- All data is currently mocked for MVP demonstration
- Real-time charts update every 5 seconds with simulated data
- AI predictions use simple linear regression model
- Mobile-responsive design with scientific aesthetic
- PostgreSQL schema ready for production deployment

## Build & Deploy

```bash
npm run build   # Build for production
npm run start   # Start production server
npm run lint    # Run ESLint
```
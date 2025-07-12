#!/bin/bash

# Script to test PostgreSQL setup locally

echo "🐘 Testing PostgreSQL setup for MESSAi..."
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if Docker is running
if ! docker info >/dev/null 2>&1; then
    echo -e "${RED}❌ Docker is not running. Please start Docker first.${NC}"
    exit 1
fi

echo "1️⃣  Starting PostgreSQL container..."
docker-compose -f docker-compose.postgres.yml up -d

# Wait for PostgreSQL to be ready
echo "2️⃣  Waiting for PostgreSQL to be ready..."
sleep 5

# Check if PostgreSQL is healthy
if docker-compose -f docker-compose.postgres.yml exec -T postgres pg_isready -U messai; then
    echo -e "${GREEN}✅ PostgreSQL is ready!${NC}"
else
    echo -e "${RED}❌ PostgreSQL failed to start${NC}"
    docker-compose -f docker-compose.postgres.yml logs
    exit 1
fi

echo ""
echo "3️⃣  Testing database connection..."

# Create a test script to verify connection
cat > /tmp/test-db-connection.js << 'EOF'
const { PrismaClient } = require('@prisma/client')

async function testConnection() {
  const prisma = new PrismaClient({
    datasources: {
      db: {
        url: process.env.DATABASE_URL
      }
    }
  })

  try {
    await prisma.$connect()
    console.log('✅ Successfully connected to PostgreSQL!')
    
    // Test a simple query
    const result = await prisma.$queryRaw`SELECT current_database(), current_user, version()`
    console.log('Database info:', result)
    
    await prisma.$disconnect()
    return true
  } catch (error) {
    console.error('❌ Connection failed:', error.message)
    return false
  }
}

testConnection().then(success => {
  process.exit(success ? 0 : 1)
})
EOF

# Test connection with local PostgreSQL
export DATABASE_URL="postgresql://messai:messai_dev_password@localhost:5432/messai_dev?schema=public"
node /tmp/test-db-connection.js

if [ $? -eq 0 ]; then
    echo ""
    echo "4️⃣  Pushing Prisma schema to PostgreSQL..."
    
    # Push the schema
    npx prisma db push --skip-generate
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ Schema pushed successfully!${NC}"
        
        echo ""
        echo "5️⃣  Running test migration..."
        
        # Test data migration
        npm run migrate:export
        
        if [ $? -eq 0 ]; then
            echo -e "${GREEN}✅ Data export successful!${NC}"
            
            # Import to PostgreSQL
            npm run migrate:import
            
            if [ $? -eq 0 ]; then
                echo -e "${GREEN}✅ Data import successful!${NC}"
            else
                echo -e "${YELLOW}⚠️  Data import failed (this is OK if no data exists yet)${NC}"
            fi
        else
            echo -e "${YELLOW}⚠️  Data export failed (this is OK if no data exists yet)${NC}"
        fi
        
        echo ""
        echo -e "${GREEN}🎉 PostgreSQL setup test completed successfully!${NC}"
        echo ""
        echo "📝 Next steps:"
        echo "   1. To use PostgreSQL locally: cp .env.postgres.local .env.local"
        echo "   2. To view the database: npm run db:studio"
        echo "   3. To stop PostgreSQL: docker-compose -f docker-compose.postgres.yml down"
        echo ""
        echo "🚀 Ready for production deployment!"
    else
        echo -e "${RED}❌ Schema push failed${NC}"
        exit 1
    fi
else
    echo -e "${RED}❌ Connection test failed${NC}"
    exit 1
fi

# Cleanup
rm -f /tmp/test-db-connection.js
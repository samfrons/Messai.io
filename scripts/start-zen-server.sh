#!/bin/bash

echo "🚀 Starting Zen MCP Server..."
echo ""
echo "📝 Instructions:"
echo "1. The Zen MCP Server will run on http://localhost:3001"
echo "2. Make sure Docker is running if using the Docker version"
echo "3. Press Ctrl+C to stop the server"
echo ""
echo "🔧 Configuration:"
echo "   - Endpoint: http://localhost:3001"
echo "   - API Key: (not required for local development)"
echo ""

# Start the Zen MCP Server
npx zen-mcp-server-199bio

# Alternative: If you have the Zen MCP Server installed globally
# zen-mcp-server

# Alternative: If you cloned the repository
# cd vendor/zen-mcp-server && npm start
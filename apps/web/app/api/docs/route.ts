// API documentation endpoint with Swagger UI

import { NextRequest, NextResponse } from 'next/server'
import { openApiSpec } from '@/lib/api/openapi'

export async function GET(request: NextRequest) {
  const url = request.nextUrl
  const format = url.searchParams.get('format')

  // Return OpenAPI spec in JSON format
  if (format === 'json') {
    return NextResponse.json(openApiSpec, {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    })
  }

  // Return Swagger UI HTML
  const swaggerHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>MESSAI API Documentation</title>
  <link rel="stylesheet" type="text/css" href="https://unpkg.com/swagger-ui-dist@5.9.0/swagger-ui.css" />
  <style>
    html {
      box-sizing: border-box;
      overflow: -moz-scrollbars-vertical;
      overflow-y: scroll;
    }
    *, *:before, *:after {
      box-sizing: inherit;
    }
    body {
      margin:0;
      background: #fafafa;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    }
    .swagger-ui .topbar {
      background-color: #1a365d;
    }
    .swagger-ui .topbar .download-url-wrapper .select-label {
      color: #fff;
    }
    .swagger-ui .topbar .download-url-wrapper input[type=text] {
      border: 2px solid #63b3ed;
    }
    .swagger-ui .info .title {
      color: #2d3748;
    }
    .swagger-ui .scheme-container {
      background: #fff;
      box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
    }
    .custom-header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 20px;
      text-align: center;
      margin-bottom: 20px;
    }
    .custom-header h1 {
      margin: 0;
      font-size: 2.5rem;
      font-weight: 300;
    }
    .custom-header p {
      margin: 10px 0 0 0;
      opacity: 0.9;
      font-size: 1.1rem;
    }
    .api-links {
      text-align: center;
      margin: 20px 0;
    }
    .api-links a {
      display: inline-block;
      margin: 0 10px;
      padding: 10px 20px;
      background: #4299e1;
      color: white;
      text-decoration: none;
      border-radius: 5px;
      font-weight: 500;
    }
    .api-links a:hover {
      background: #3182ce;
    }
  </style>
</head>
<body>
  <div class="custom-header">
    <h1>🧬 MESSAI API</h1>
    <p>Microbial Electrochemical Systems AI Platform</p>
  </div>
  
  <div class="api-links">
    <a href="/api/docs?format=json" target="_blank">Download OpenAPI Spec</a>
    <a href="https://messai.io" target="_blank">Platform Home</a>
    <a href="https://github.com/messai-io/messai" target="_blank">GitHub</a>
  </div>

  <div id="swagger-ui"></div>

  <script src="https://unpkg.com/swagger-ui-dist@5.9.0/swagger-ui-bundle.js"></script>
  <script src="https://unpkg.com/swagger-ui-dist@5.9.0/swagger-ui-standalone-preset.js"></script>
  <script>
    window.onload = function() {
      const ui = SwaggerUIBundle({
        url: '/api/docs?format=json',
        dom_id: '#swagger-ui',
        deepLinking: true,
        presets: [
          SwaggerUIBundle.presets.apis,
          SwaggerUIStandalonePreset
        ],
        plugins: [
          SwaggerUIBundle.plugins.DownloadUrl
        ],
        layout: "StandaloneLayout",
        tryItOutEnabled: true,
        requestInterceptor: function(request) {
          // Add any default headers or authentication
          return request;
        },
        responseInterceptor: function(response) {
          // Log API responses for debugging
          console.log('API Response:', response);
          return response;
        },
        onComplete: function() {
          console.log('MESSAI API Documentation loaded');
        },
        defaultModelRendering: 'example',
        defaultModelsExpandDepth: 2,
        defaultModelExpandDepth: 2,
        displayOperationId: false,
        showExtensions: true,
        showCommonExtensions: true,
        filter: true,
        syntaxHighlight: {
          activate: true,
          theme: "agate"
        }
      });

      // Custom CSS for better theming
      setTimeout(() => {
        const style = document.createElement('style');
        style.textContent = \`
          .swagger-ui .info .title {
            color: #2d3748 !important;
          }
          .swagger-ui .opblock.opblock-get {
            border-color: #38a169;
          }
          .swagger-ui .opblock.opblock-post {
            border-color: #3182ce;
          }
          .swagger-ui .opblock.opblock-put {
            border-color: #d69e2e;
          }
          .swagger-ui .opblock.opblock-delete {
            border-color: #e53e3e;
          }
          .swagger-ui .opblock .opblock-summary-method {
            font-weight: 600;
          }
          .swagger-ui .parameter__name {
            font-weight: 600;
          }
          .swagger-ui .response-col_status {
            font-weight: 600;
          }
        \`;
        document.head.appendChild(style);
      }, 1000);
    };
  </script>

  <footer style="text-align: center; padding: 40px 20px; background: #f7fafc; margin-top: 40px; border-top: 1px solid #e2e8f0;">
    <p style="color: #4a5568; margin: 0;">
      Built with ❤️ for sustainable energy research • 
      <a href="https://messai.io" style="color: #4299e1; text-decoration: none;">MESSAI Platform</a> • 
      Version 1.0.0
    </p>
  </footer>
</body>
</html>`

  return new NextResponse(swaggerHtml, {
    headers: {
      'Content-Type': 'text/html',
      'Cache-Control': 'public, max-age=300', // Cache for 5 minutes
    },
  })
}
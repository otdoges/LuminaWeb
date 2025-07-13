# LuminaWeb Enhancement Service

AI-powered website optimization and enhancement service using Gemini 2.5 Flash and ScrapingBee.

## Features

- **Website Analysis**: Comprehensive analysis of performance, accessibility, SEO, design, and mobile optimization
- **AI Enhancement**: Gemini 2.5 Flash powered code generation for website improvements
- **ScrapingBee Integration**: Reliable website scraping with screenshot capabilities
- **Subdomain Support**: Configured for app.{name}.luminaweb.app deployment
- **API Security**: Protected endpoints with API key authentication

## API Endpoints

### Health Check
```
GET /api/health
```

### Website Analysis
```
POST /api/analyze
Content-Type: application/json
Authorization: Bearer YOUR_API_KEY

{
  "url": "https://example.com",
  "options": {
    "improvePerformance": true,
    "enhanceAccessibility": true,
    "optimizeSeo": true,
    "modernizeDesign": true,
    "mobileOptimize": true
  },
  "clientName": "optional-client-name",
  "includeScreenshot": false
}
```

### Website Enhancement
```
POST /api/enhance
Content-Type: application/json
Authorization: Bearer YOUR_API_KEY

{
  "url": "https://example.com",
  "options": {
    "improvePerformance": true,
    "enhanceAccessibility": true,
    "optimizeSeo": true,
    "modernizeDesign": true,
    "mobileOptimize": true
  },
  "clientName": "optional-client-name",
  "includeScreenshot": false
}
```

### Quick Analysis
```
POST /api/quick-analysis
Content-Type: application/json
Authorization: Bearer YOUR_API_KEY

{
  "url": "https://example.com",
  "clientName": "optional-client-name"
}
```

## Environment Variables

Create a `.env.local` file with the following variables:

```bash
# Gemini AI Configuration
GOOGLE_GENERATIVE_AI_API_KEY=your_gemini_api_key_here

# Service Configuration
SERVICE_API_KEY=your_service_api_key_here
ALLOWED_ORIGINS=https://luminaweb.app,https://app.luminaweb.app

# ScrapingBee Configuration
SCRAPINGBEE_API_KEY=your_scrapingbee_api_key_here

# Environment
NODE_ENV=development
NEXT_PUBLIC_SERVICE_URL=http://localhost:3001
```

## Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Type checking
npm run type-check

# Linting
npm run lint
```

## Deployment

### Vercel Deployment

1. Connect your repository to Vercel
2. Configure environment variables in Vercel dashboard:
   - `GOOGLE_GENERATIVE_AI_API_KEY`
   - `SCRAPINGBEE_API_KEY`
   - `SERVICE_API_KEY`
   - `ALLOWED_ORIGINS`

3. Set up custom domain for subdomain routing:
   - Add domain: `luminaweb.app`
   - Configure wildcard subdomain: `*.luminaweb.app`
   - Point to your Vercel deployment

### Subdomain Configuration

The service supports subdomain-based client isolation:
- `app.{clientname}.luminaweb.app` for client-specific deployments
- Main service at `enhance.luminaweb.app`

## API Response Format

### Success Response
```json
{
  "success": true,
  "data": {
    // Response data
  },
  "message": "Operation completed successfully"
}
```

### Error Response
```json
{
  "success": false,
  "error": "Error message",
  "message": "Optional additional context"
}
```

## Rate Limiting

- Analysis endpoints: 10 requests per minute per API key
- Enhancement endpoints: 5 requests per minute per API key
- Quick analysis: 20 requests per minute per API key

## Security

- API key authentication required for all endpoints
- Origin validation for CORS
- Request validation using Zod schemas
- Security headers included in responses

## Monitoring

Health check endpoint provides service status and feature availability:
- Service health
- AI model availability
- ScrapingBee integration status
- Environment information

## Support

For issues or questions:
1. Check the health endpoint for service status
2. Verify your API keys and environment configuration
3. Review request format and validation requirements
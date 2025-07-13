# LuminaWeb Enhancement Service - Deployment Guide

## Quick Start

### 1. Deploy to Vercel

#### Option A: Deploy from GitHub
1. Push the `enhancement-service` folder to a GitHub repository
2. Connect to Vercel: https://vercel.com/new
3. Import your repository
4. Vercel will auto-detect Next.js and configure build settings

#### Option B: Deploy with Vercel CLI
```bash
cd enhancement-service
npm install -g vercel
vercel
```

### 2. Configure Environment Variables

In your Vercel dashboard, add these environment variables:

```bash
GOOGLE_GENERATIVE_AI_API_KEY=your_gemini_api_key_here
SCRAPINGBEE_API_KEY=your_scrapingbee_api_key_here
SERVICE_API_KEY=your_secure_api_key_here
ALLOWED_ORIGINS=https://luminaweb.app,https://app.luminaweb.app
```

### 3. Set Up Custom Domain

1. **Add Domain in Vercel:**
   - Go to Project Settings → Domains
   - Add `enhance.luminaweb.app`
   - Add wildcard subdomain: `*.luminaweb.app` (for client-specific deployments)

2. **Configure DNS:**
   ```
   Type: CNAME
   Name: enhance
   Value: your-vercel-deployment.vercel.app
   
   Type: CNAME  
   Name: *
   Value: your-vercel-deployment.vercel.app
   ```

### 4. Test Deployment

Visit your health endpoint:
```
https://enhance.luminaweb.app/api/health
```

Expected response:
```json
{
  "status": "healthy",
  "service": "LuminaWeb Enhancement Service",
  "version": "1.0.0",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "environment": "production",
  "features": {
    "geminiAI": true,
    "scrapingBee": true
  }
}
```

## Subdomain Configuration

### Client-Specific Subdomains

Configure subdomains for different clients:
- `app.client1.luminaweb.app` → Client 1's customized service
- `app.client2.luminaweb.app` → Client 2's customized service
- `enhance.luminaweb.app` → Main service

### Vercel Configuration

1. **Project Settings:**
   - Add each subdomain in the Domains section
   - Configure environment variables per domain if needed

2. **DNS Configuration:**
   ```
   Type: CNAME
   Name: app.client1
   Value: your-vercel-deployment.vercel.app
   
   Type: CNAME
   Name: app.client2  
   Value: your-vercel-deployment.vercel.app
   ```

### Client Detection

The service automatically detects client context from the subdomain:

```javascript
// Example: app.client1.luminaweb.app
const hostname = request.headers.get('host');
const subdomain = hostname?.split('.')[1]; // 'client1'
```

## API Keys & Security

### Generate API Keys

```bash
# Generate secure API key
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Security Best Practices

1. **API Key Rotation:**
   - Rotate keys monthly
   - Use different keys for different environments
   - Monitor key usage

2. **Rate Limiting:**
   - Configure in Vercel or use middleware
   - Set appropriate limits per client

3. **CORS Configuration:**
   - Restrict origins to your domains
   - Update `ALLOWED_ORIGINS` environment variable

## Monitoring & Logging

### Health Monitoring

Set up monitoring for:
- `/api/health` endpoint
- Response times
- Error rates
- API usage

### Vercel Analytics

Enable in Vercel dashboard:
- Real User Monitoring (RUM)
- Web Analytics
- Speed Insights

### Custom Logging

```javascript
// Add to your API routes
console.log({
  timestamp: new Date().toISOString(),
  endpoint: '/api/enhance',
  clientName: 'client1',
  url: requestUrl,
  processingTime: endTime - startTime
});
```

## Scaling Considerations

### Performance Optimization

1. **Function Configuration:**
   ```json
   {
     "functions": {
       "src/app/api/**/*.ts": {
         "maxDuration": 60,
         "memory": 1024
       }
     }
   }
   ```

2. **Caching Strategy:**
   - Cache analysis results
   - Use CDN for static assets
   - Implement response caching

### Load Testing

```bash
# Install artillery
npm install -g artillery

# Test the service
artillery quick --count 10 --num 5 https://enhance.luminaweb.app/api/health
```

## Troubleshooting

### Common Issues

1. **"API key required" errors:**
   - Check `SERVICE_API_KEY` environment variable
   - Verify Authorization header format

2. **CORS errors:**
   - Update `ALLOWED_ORIGINS`
   - Check request origin

3. **Gemini API errors:**
   - Verify `GOOGLE_GENERATIVE_AI_API_KEY`
   - Check API quota limits

4. **ScrapingBee errors:**
   - Verify `SCRAPINGBEE_API_KEY`
   - Check usage limits

### Debug Mode

Enable debug logging:
```bash
DEBUG=true vercel dev
```

### Error Monitoring

Consider integrating:
- Sentry for error tracking
- LogRocket for session replay
- DataDog for infrastructure monitoring

## Production Checklist

- [ ] Environment variables configured
- [ ] Custom domain connected
- [ ] SSL certificate active
- [ ] Health endpoint responding
- [ ] API keys secured and rotated
- [ ] CORS properly configured
- [ ] Monitoring/alerting set up
- [ ] Rate limiting configured
- [ ] Client subdomains tested
- [ ] Load testing completed

## Support

For deployment issues:
1. Check Vercel deployment logs
2. Test health endpoint
3. Verify environment variables
4. Review CORS configuration
5. Check API key permissions
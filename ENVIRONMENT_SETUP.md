# 🔧 Environment Setup Guide

## Required API Keys & Configuration

LuminaWeb requires these API keys and configuration to function properly:

### 1. Supabase Configuration (Required for Authentication)
- **Service**: User authentication and database
- **Get your credentials**: [Supabase Dashboard](https://app.supabase.com) → Your Project → Settings → API
- **Required for**: GitHub OAuth sign-in, user management

### 2. ScrapingBee API Key
- **Service**: Web scraping and screenshot capture
- **Get your key**: [ScrapingBee Dashboard](https://app.scrapingbee.com/account/api-key)
- **Free tier**: 1,000 requests/month

### 3. Groq API Key  
- **Service**: AI analysis and insights
- **Get your key**: [Groq Console](https://console.groq.com/keys)
- **Free tier**: High rate limits

## Setup Instructions

1. **Create `.env.local` file** in the project root:
```bash
touch .env.local
```

2. **Add your API keys** to the `.env.local` file:
```bash
# LuminaWeb Environment Configuration

# Supabase Configuration (REQUIRED for authentication)
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here

# ScrapingBee API Configuration
VITE_SCRAPINGBEE_API_KEY=your_scrapingbee_api_key_here

# Groq AI API Configuration  
VITE_GROQ_API_KEY=your_groq_api_key_here

# Analytics Provider Configuration (self-hosted)
VITE_ANALYTICS_PROVIDER_URL=https://your-vps-analytics.domain.com
VITE_ANALYTICS_PROVIDER_KEY=your_analytics_provider_api_key

# LuminaWeb Enhancement Service
VITE_ENHANCEMENT_SERVICE_URL=https://enhance.luminaweb.app
VITE_ENHANCEMENT_SERVICE_API_KEY=your_enhancement_service_api_key

# API Configuration
VITE_API_TIMEOUT=30000

# Development Configuration
VITE_ENVIRONMENT=development
```

3. **Replace the placeholder values** with your actual API keys

4. **Restart the development server**:
```bash
bun run dev
```

## Getting Your Supabase Credentials

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Select your project (or create a new one)
3. Navigate to **Settings → API**
4. Copy:
   - **Project URL** → Use as `VITE_SUPABASE_URL`
   - **anon/public key** → Use as `VITE_SUPABASE_ANON_KEY`

## Testing Your Setup

1. Navigate to the Authentication page (`/auth`)
2. Try the GitHub sign-in button
3. If configured correctly, you should be redirected to GitHub for authorization
4. Navigate to the Analysis page to test other API integrations

## Troubleshooting

- **"GitHub sign-in not working"**: Make sure Supabase environment variables are set correctly
- **"API key is required" error**: Make sure your `.env.local` file is created and contains the correct variable names
- **Network errors**: Check that your API keys are valid and have remaining quota
- **Mock data showing**: The app falls back to mock data when API keys are missing or invalid

## Security Notes

- Never commit your `.env.local` file to version control
- Keep your API keys private and secure
- The `.env.local` file is already added to `.gitignore`
- For production deployment, set environment variables in your hosting platform (e.g., Vercel) 
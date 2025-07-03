# 🔧 Environment Setup Guide

## Required API Keys

LuminaWeb requires two API keys to function properly:

### 1. ScrapingBee API Key
- **Service**: Web scraping and screenshot capture
- **Get your key**: [ScrapingBee Dashboard](https://app.scrapingbee.com/account/api-key)
- **Free tier**: 1,000 requests/month

### 2. Groq API Key  
- **Service**: AI analysis and insights
- **Get your key**: [Groq Console](https://console.groq.com/keys)
- **Free tier**: High rate limits

## Setup Instructions

1. **Create `.env` file** in the project root:
```bash
touch .env
```

2. **Add your API keys** to the `.env` file:
```bash
# LuminaWeb Environment Configuration

# ScrapingBee API Configuration
VITE_SCRAPINGBEE_API_KEY=your_scrapingbee_api_key_here

# Groq AI API Configuration  
VITE_GROQ_API_KEY=your_groq_api_key_here

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

## Testing Your Setup

1. Navigate to the Analysis page
2. Enter a website URL to analyze
3. If configured correctly, you should see real analysis data instead of mock data

## Troubleshooting

- **"API key is required" error**: Make sure your `.env` file is created and contains the correct variable names
- **Network errors**: Check that your API keys are valid and have remaining quota
- **Mock data showing**: The app falls back to mock data when API keys are missing or invalid

## Security Notes

- Never commit your `.env` file to version control
- Keep your API keys private and secure
- The `.env` file is already added to `.gitignore` 
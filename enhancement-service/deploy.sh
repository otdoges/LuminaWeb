#!/bin/bash

# LuminaWeb Enhancement Service Deployment Script

echo "🚀 Deploying LuminaWeb Enhancement Service..."

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "📦 Installing Vercel CLI..."
    npm install -g vercel
fi

# Environment check
if [ ! -f .env.local ]; then
    echo "⚠️  Warning: .env.local not found. Make sure to configure environment variables in Vercel dashboard."
fi

# Build check
echo "🔨 Running build check..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Build failed. Please fix build errors before deploying."
    exit 1
fi

# Deploy to Vercel
echo "🌐 Deploying to Vercel..."
vercel --prod

if [ $? -eq 0 ]; then
    echo "✅ Deployment successful!"
    echo ""
    echo "🔗 Next steps:"
    echo "1. Configure environment variables in Vercel dashboard"
    echo "2. Set up custom domain (enhance.luminaweb.app)"
    echo "3. Test the health endpoint: https://your-deployment.vercel.app/api/health"
    echo "4. Update VITE_ENHANCEMENT_SERVICE_URL in main React app"
else
    echo "❌ Deployment failed. Check the logs above for details."
    exit 1
fi
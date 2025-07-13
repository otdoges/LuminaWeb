import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  return NextResponse.json({
    status: 'healthy',
    service: 'LuminaWeb Enhancement Service',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    features: {
      geminiAI: !!process.env.GOOGLE_GENERATIVE_AI_API_KEY,
      scrapingBee: !!process.env.SCRAPINGBEE_API_KEY,
    }
  });
}
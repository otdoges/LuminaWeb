import { NextRequest } from 'next/server';

export function validateApiKey(request: NextRequest): boolean {
  const apiKey = request.headers.get('authorization')?.replace('Bearer ', '') || 
                request.headers.get('x-api-key');
  
  const validApiKey = process.env.SERVICE_API_KEY;
  
  if (!validApiKey) {
    console.warn('SERVICE_API_KEY not configured - API key validation disabled');
    return true; // Allow requests if no API key is configured (development)
  }
  
  return apiKey === validApiKey;
}

export function validateOrigin(request: NextRequest): boolean {
  const origin = request.headers.get('origin');
  const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'];
  
  if (!origin) {
    return true; // Allow requests without origin (e.g., server-to-server)
  }
  
  return allowedOrigins.includes(origin);
}

export function createErrorResponse(message: string, status: number = 400) {
  return Response.json({
    success: false,
    error: message
  }, { status });
}

export function createSuccessResponse(data: any, message?: string) {
  return Response.json({
    success: true,
    data,
    message
  });
}
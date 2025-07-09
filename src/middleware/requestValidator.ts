import { apiSecurityManager } from '../lib/apiSecurity';
import { deduplicatedFetch } from '../lib/requestDeduplication';

// Request validation types
interface ValidatedRequest {
  url: string;
  method: string;
  headers: Record<string, string>;
  body?: any;
  timestamp: number;
  fingerprint: string;
}

interface ValidationError {
  field?: string;
  message: string;
  code: string;
  severity: 'error' | 'warning';
}

interface RequestValidationResult {
  valid: boolean;
  errors: ValidationError[];
  sanitizedData?: any;
  metadata: {
    processingTime: number;
    securityScore: number;
    riskLevel: 'low' | 'medium' | 'high';
  };
}

// Input sanitization utilities
class InputSanitizer {
  private static readonly MAX_STRING_LENGTH = 10000;
  private static readonly MAX_ARRAY_LENGTH = 1000;
  private static readonly MAX_OBJECT_DEPTH = 10;

  static sanitizeString(input: string, options: {
    maxLength?: number;
    allowHTML?: boolean;
    allowURLs?: boolean;
    pattern?: RegExp;
  } = {}): string {
    const maxLength = options.maxLength || this.MAX_STRING_LENGTH;
    
    // Trim and limit length
    let sanitized = String(input).trim().substring(0, maxLength);
    
    // Remove null bytes
    sanitized = sanitized.replace(/\0/g, '');
    
    // HTML sanitization
    if (!options.allowHTML) {
      sanitized = sanitized
        .replace(/[<>]/g, '')
        .replace(/javascript:/gi, '')
        .replace(/data:/gi, '')
        .replace(/vbscript:/gi, '')
        .replace(/on\w+\s*=/gi, '');
    }
    
    // URL sanitization
    if (!options.allowURLs) {
      sanitized = sanitized
        .replace(/https?:\/\/[^\s]+/gi, '[URL_REMOVED]')
        .replace(/ftp:\/\/[^\s]+/gi, '[URL_REMOVED]');
    }
    
    // Pattern validation
    if (options.pattern && !options.pattern.test(sanitized)) {
      throw new Error('Input does not match required pattern');
    }
    
    return sanitized;
  }

  static sanitizeObject(input: any, depth = 0): any {
    if (depth > this.MAX_OBJECT_DEPTH) {
      throw new Error('Object depth exceeded maximum allowed level');
    }

    if (input === null || input === undefined) {
      return input;
    }

    if (Array.isArray(input)) {
      if (input.length > this.MAX_ARRAY_LENGTH) {
        throw new Error('Array length exceeds maximum allowed size');
      }
      return input.map(item => this.sanitizeObject(item, depth + 1));
    }

    if (typeof input === 'object') {
      const sanitized: any = {};
      const keys = Object.keys(input);
      
      if (keys.length > 100) { // Prevent object with too many keys
        throw new Error('Object has too many properties');
      }

      for (const key of keys) {
        const sanitizedKey = this.sanitizeString(key, { maxLength: 100 });
        sanitized[sanitizedKey] = this.sanitizeObject(input[key], depth + 1);
      }
      return sanitized;
    }

    if (typeof input === 'string') {
      return this.sanitizeString(input);
    }

    if (typeof input === 'number') {
      if (!Number.isFinite(input)) {
        throw new Error('Invalid number value');
      }
      return input;
    }

    return input;
  }

  static validateURL(url: string): boolean {
    try {
      const parsed = new URL(url);
      
      // Only allow HTTP and HTTPS
      if (!['http:', 'https:'].includes(parsed.protocol)) {
        return false;
      }
      
      // Prevent localhost in production
      if (import.meta.env.PROD && ['localhost', '127.0.0.1', '0.0.0.0'].includes(parsed.hostname)) {
        return false;
      }
      
      // Prevent private IP ranges in production
      if (import.meta.env.PROD) {
        const ip = parsed.hostname;
        if (
          ip.startsWith('192.168.') ||
          ip.startsWith('10.') ||
          /^172\.(1[6-9]|2[0-9]|3[0-1])\./.test(ip)
        ) {
          return false;
        }
      }
      
      return true;
    } catch {
      return false;
    }
  }

  static validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email) && email.length <= 254;
  }

  static validateDomain(domain: string): boolean {
    const domainRegex = /^[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
    return domainRegex.test(domain) && domain.length <= 253;
  }
}

// Request validator class
export class RequestValidator {
  private static instance: RequestValidator;
  private requestFingerprints = new Map<string, number>();
  
  public static getInstance(): RequestValidator {
    if (!RequestValidator.instance) {
      RequestValidator.instance = new RequestValidator();
    }
    return RequestValidator.instance;
  }

  // Generate request fingerprint for duplicate detection
  private generateFingerprint(request: ValidatedRequest): string {
    const content = JSON.stringify({
      url: request.url,
      method: request.method,
      body: request.body
    });
    
    // Simple hash function for fingerprinting
    let hash = 0;
    for (let i = 0; i < content.length; i++) {
      const char = content.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    
    return hash.toString(36);
  }

  // Comprehensive request validation
  async validateRequest(
    url: string,
    options: RequestInit = {},
    validationConfig: {
      requireAuth?: boolean;
      allowDuplicates?: boolean;
      maxSize?: number;
      timeout?: number;
      customValidators?: Array<(data: any) => ValidationError[]>;
    } = {}
  ): Promise<RequestValidationResult> {
    const startTime = Date.now();
    const errors: ValidationError[] = [];
    let sanitizedData: any;

    try {
      // Create validated request object
      const validatedRequest: ValidatedRequest = {
        url,
        method: options.method || 'GET',
        headers: options.headers as Record<string, string> || {},
        body: options.body,
        timestamp: Date.now(),
        fingerprint: ''
      };

      // Generate fingerprint
      validatedRequest.fingerprint = this.generateFingerprint(validatedRequest);

      // Check for duplicate requests
      if (!validationConfig.allowDuplicates) {
        const lastRequest = this.requestFingerprints.get(validatedRequest.fingerprint);
        if (lastRequest && Date.now() - lastRequest < 1000) { // 1 second cooldown
          errors.push({
            message: 'Duplicate request detected',
            code: 'DUPLICATE_REQUEST',
            severity: 'warning'
          });
        } else {
          this.requestFingerprints.set(validatedRequest.fingerprint, Date.now());
        }
      }

      // Validate URL
      if (!InputSanitizer.validateURL(url)) {
        errors.push({
          field: 'url',
          message: 'Invalid or unsafe URL',
          code: 'INVALID_URL',
          severity: 'error'
        });
      }

      // Validate method
      const allowedMethods = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'HEAD', 'OPTIONS'];
      if (!allowedMethods.includes(validatedRequest.method.toUpperCase())) {
        errors.push({
          field: 'method',
          message: 'Invalid HTTP method',
          code: 'INVALID_METHOD',
          severity: 'error'
        });
      }

      // Validate headers
      this.validateHeaders(validatedRequest.headers, errors);

      // Validate and sanitize body
      if (validatedRequest.body) {
        try {
          const bodySize = JSON.stringify(validatedRequest.body).length;
          const maxSize = validationConfig.maxSize || 1024 * 1024; // 1MB default
          
          if (bodySize > maxSize) {
            errors.push({
              field: 'body',
              message: `Request body too large (${bodySize} bytes, max ${maxSize})`,
              code: 'BODY_TOO_LARGE',
              severity: 'error'
            });
          } else {
            sanitizedData = InputSanitizer.sanitizeObject(validatedRequest.body);
          }
        } catch (error) {
          errors.push({
            field: 'body',
            message: `Body sanitization failed: ${error.message}`,
            code: 'SANITIZATION_ERROR',
            severity: 'error'
          });
        }
      }

      // Security check through API security manager
      const securityCheck = apiSecurityManager.checkRequestSecurity({
        url: validatedRequest.url,
        method: validatedRequest.method,
        headers: validatedRequest.headers,
        body: validatedRequest.body,
        ip: this.getClientIP()
      });

      if (!securityCheck.allowed) {
        errors.push(...securityCheck.errors.map(error => ({
          message: error,
          code: 'SECURITY_VIOLATION',
          severity: 'error' as const
        })));
      }

      // Add warnings from security check
      errors.push(...securityCheck.warnings.map(warning => ({
        message: warning,
        code: 'SECURITY_WARNING',
        severity: 'warning' as const
      })));

      // Run custom validators if provided
      if (validationConfig.customValidators && sanitizedData) {
        for (const validator of validationConfig.customValidators) {
          try {
            const customErrors = validator(sanitizedData);
            errors.push(...customErrors);
          } catch (error) {
            errors.push({
              message: `Custom validation failed: ${error.message}`,
              code: 'CUSTOM_VALIDATION_ERROR',
              severity: 'error'
            });
          }
        }
      }

      // Calculate risk level
      const riskLevel = this.calculateRiskLevel(errors, securityCheck.securityScore);

      const processingTime = Date.now() - startTime;

      return {
        valid: errors.filter(e => e.severity === 'error').length === 0,
        errors,
        sanitizedData,
        metadata: {
          processingTime,
          securityScore: securityCheck.securityScore,
          riskLevel
        }
      };

    } catch (error) {
      errors.push({
        message: `Validation failed: ${error.message}`,
        code: 'VALIDATION_ERROR',
        severity: 'error'
      });

      return {
        valid: false,
        errors,
        metadata: {
          processingTime: Date.now() - startTime,
          securityScore: 0,
          riskLevel: 'high'
        }
      };
    }
  }

  private validateHeaders(headers: Record<string, string>, errors: ValidationError[]): void {
    // Check for required headers
    const contentType = headers['content-type'] || headers['Content-Type'];
    if (contentType && !this.isValidContentType(contentType)) {
      errors.push({
        field: 'Content-Type',
        message: 'Invalid or unsafe content type',
        code: 'INVALID_CONTENT_TYPE',
        severity: 'error'
      });
    }

    // Validate Authorization header format
    const auth = headers['authorization'] || headers['Authorization'];
    if (auth && !this.isValidAuthHeader(auth)) {
      errors.push({
        field: 'Authorization',
        message: 'Invalid authorization header format',
        code: 'INVALID_AUTH_HEADER',
        severity: 'warning'
      });
    }

    // Check for suspicious headers
    const suspiciousHeaders = ['x-forwarded-for', 'x-real-ip', 'x-originating-ip'];
    for (const header of suspiciousHeaders) {
      if (headers[header]) {
        errors.push({
          field: header,
          message: 'Suspicious header detected',
          code: 'SUSPICIOUS_HEADER',
          severity: 'warning'
        });
      }
    }
  }

  private isValidContentType(contentType: string): boolean {
    const allowedTypes = [
      'application/json',
      'application/x-www-form-urlencoded',
      'text/plain',
      'multipart/form-data'
    ];
    
    return allowedTypes.some(type => contentType.toLowerCase().includes(type));
  }

  private isValidAuthHeader(auth: string): boolean {
    // Basic format validation for common auth schemes
    const authSchemes = /^(Bearer|Basic|Digest|OAuth)\s+.+/i;
    return authSchemes.test(auth);
  }

  private calculateRiskLevel(errors: ValidationError[], securityScore: number): 'low' | 'medium' | 'high' {
    const errorCount = errors.filter(e => e.severity === 'error').length;
    const warningCount = errors.filter(e => e.severity === 'warning').length;

    if (errorCount > 0 || securityScore < 50) return 'high';
    if (warningCount > 2 || securityScore < 75) return 'medium';
    return 'low';
  }

  private getClientIP(): string {
    // In a browser environment, we can't get the real client IP
    // This would be implemented on the server side
    return 'browser-client';
  }

  // Cleanup old fingerprints
  private cleanup(): void {
    const now = Date.now();
    const maxAge = 5 * 60 * 1000; // 5 minutes

    for (const [fingerprint, timestamp] of this.requestFingerprints.entries()) {
      if (now - timestamp > maxAge) {
        this.requestFingerprints.delete(fingerprint);
      }
    }
  }

  // Public cleanup method
  public performCleanup(): void {
    this.cleanup();
  }
}

// Enhanced fetch wrapper with validation
export async function validatedFetch(
  url: string,
  options: RequestInit = {},
  validationConfig: Parameters<RequestValidator['validateRequest']>[2] = {}
): Promise<Response> {
  const validator = RequestValidator.getInstance();
  
  // Validate the request
  const validation = await validator.validateRequest(url, options, validationConfig);
  
  if (!validation.valid) {
    const errorMessages = validation.errors
      .filter(e => e.severity === 'error')
      .map(e => e.message)
      .join(', ');
    
    throw new Error(`Request validation failed: ${errorMessages}`);
  }

  // Log warnings
  const warnings = validation.errors.filter(e => e.severity === 'warning');
  if (warnings.length > 0) {
    console.warn('Request validation warnings:', warnings);
  }

  // Use sanitized data if available
  if (validation.sanitizedData && options.body) {
    options.body = JSON.stringify(validation.sanitizedData);
  }

  // Add security headers
  const secureHeaders = apiSecurityManager.applySecurityHeaders(new Request(url, options));
  options.headers = Object.fromEntries(secureHeaders.entries());

  // Use deduplicated fetch with rate limiting
  return deduplicatedFetch(url, {
    ...options,
    signal: AbortSignal.timeout(validationConfig.timeout || 30000)
  });
}

// React hook for validated API calls
export function useValidatedAPI() {
  const validator = RequestValidator.getInstance();

  const makeRequest = async (
    url: string,
    options: RequestInit = {},
    validationConfig: Parameters<RequestValidator['validateRequest']>[2] = {}
  ) => {
    try {
      const response = await validatedFetch(url, options, validationConfig);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      return response;
    } catch (error) {
      console.error('Validated API request failed:', error);
      throw error;
    }
  };

  return {
    get: (url: string, config?: typeof validationConfig) => 
      makeRequest(url, { method: 'GET' }, config),
    
    post: (url: string, data?: any, config?: typeof validationConfig) =>
      makeRequest(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: data ? JSON.stringify(data) : undefined
      }, config),
    
    put: (url: string, data?: any, config?: typeof validationConfig) =>
      makeRequest(url, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: data ? JSON.stringify(data) : undefined
      }, config),
    
    delete: (url: string, config?: typeof validationConfig) =>
      makeRequest(url, { method: 'DELETE' }, config),
    
    validate: (url: string, options: RequestInit = {}, config?: typeof validationConfig) =>
      validator.validateRequest(url, options, config)
  };
}

// Export singleton instance
export const requestValidator = RequestValidator.getInstance();

// Set up periodic cleanup
setInterval(() => {
  requestValidator.performCleanup();
}, 5 * 60 * 1000); // Every 5 minutes

export default validatedFetch; 
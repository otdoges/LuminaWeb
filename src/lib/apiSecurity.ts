import * as CryptoJS from 'crypto-js';

// Enhanced API Key Configuration Interface
interface APIKeyConfig {
  key: string;
  encrypted: boolean;
  expiresAt?: number;
  permissions: string[];
  rateLimit: {
    requests: number;
    window: number; // in milliseconds
    burst?: number;
  };
  lastUsed?: number;
  usageCount?: number;
  environment: 'development' | 'staging' | 'production';
  metadata?: Record<string, any>;
}

// Rate Limiting Interface
interface RateLimitEntry {
  count: number;
  resetTime: number;
  burstCount?: number;
  burstResetTime?: number;
}

// Security Headers Configuration
interface SecurityHeaders {
  'Content-Security-Policy': string;
  'X-Frame-Options': string;
  'X-Content-Type-Options': string;
  'Referrer-Policy': string;
  'Permissions-Policy': string;
  'Strict-Transport-Security': string;
}

// Request Validation Schema
interface ValidationSchema {
  required: string[];
  optional?: string[];
  types: Record<string, 'string' | 'number' | 'boolean' | 'array' | 'object'>;
  patterns?: Record<string, RegExp>;
  maxLength?: Record<string, number>;
  minLength?: Record<string, number>;
  range?: Record<string, [number, number]>;
}

export class APISecurityManager {
  private apiKeys = new Map<string, APIKeyConfig>();
  private rateLimits = new Map<string, RateLimitEntry>();
  private encryptionKey: string;
  private securityHeaders: SecurityHeaders;
  private validationSchemas = new Map<string, ValidationSchema>();
  private blockedIPs = new Set<string>();
  private suspiciousPatterns: RegExp[];

  constructor() {
    this.encryptionKey = this.generateEncryptionKey();
    this.securityHeaders = this.getDefaultSecurityHeaders();
    this.suspiciousPatterns = this.getSuspiciousPatterns();
    this.loadAPIKeys();
    this.setupCleanupInterval();
    this.initializeValidationSchemas();
  }

  // Enhanced encryption methods
  private generateEncryptionKey(): string {
    const stored = localStorage.getItem('lumina_encryption_key');
    if (stored) return stored;
    
    const key = CryptoJS.lib.WordArray.random(256/8).toString();
    localStorage.setItem('lumina_encryption_key', key);
    return key;
  }

  private encryptData(data: string): string {
    try {
      return CryptoJS.AES.encrypt(data, this.encryptionKey).toString();
    } catch (error) {
      console.error('Encryption failed:', error);
      throw new Error('Failed to encrypt sensitive data');
    }
  }

  private decryptData(encryptedData: string): string {
    try {
      const bytes = CryptoJS.AES.decrypt(encryptedData, this.encryptionKey);
      return bytes.toString(CryptoJS.enc.Utf8);
    } catch (error) {
      console.error('Decryption failed:', error);
      throw new Error('Failed to decrypt sensitive data');
    }
  }

  // API Key Management
  storeAPIKey(service: string, key: string, config?: Partial<APIKeyConfig>): void {
    const apiKeyConfig: APIKeyConfig = {
      key: this.encryptData(key),
      encrypted: true,
      permissions: config?.permissions || ['read'],
      rateLimit: config?.rateLimit || {
        requests: 100,
        window: 60000, // 1 minute
        burst: 10
      },
      environment: (import.meta.env.MODE as any) || 'development',
      expiresAt: config?.expiresAt,
      usageCount: 0,
      metadata: config?.metadata || {},
      ...config
    };

    this.apiKeys.set(service, apiKeyConfig);
    this.persistAPIKeys();
  }

  getAPIKey(service: string): string | null {
    const config = this.apiKeys.get(service);
    if (!config) return null;

    // Check expiration
    if (config.expiresAt && Date.now() > config.expiresAt) {
      this.apiKeys.delete(service);
      this.persistAPIKeys();
      return null;
    }

    // Update usage statistics
    config.lastUsed = Date.now();
    config.usageCount = (config.usageCount || 0) + 1;

    try {
      return config.encrypted ? this.decryptData(config.key) : config.key;
    } catch (error) {
      console.error(`Failed to decrypt API key for ${service}:`, error);
      return null;
    }
  }

  // Execute request with security checks
  async executeSecureRequest<T>(
    service: string,
    operation: () => Promise<T>,
    identifier: string = 'default'
  ): Promise<T> {
    const config = this.apiKeys.get(service);
    if (!config) {
      throw new Error(`API key not configured for service: ${service}`);
    }

    // Check rate limit
    if (!this.checkRateLimit(identifier, config)) {
      throw new Error(`Rate limit exceeded for ${service}`);
    }

    // Execute the operation
    return await operation();
  }

  // Rate Limiting
  checkRateLimit(identifier: string, config: APIKeyConfig): boolean {
    const now = Date.now();
    const key = `${identifier}_${config.environment}`;
    const existing = this.rateLimits.get(key);

    if (!existing) {
      this.rateLimits.set(key, {
        count: 1,
        resetTime: now + config.rateLimit.window,
        burstCount: 1,
        burstResetTime: now + 1000 // 1 second for burst
      });
      return true;
    }

    // Check burst limit (short-term)
    if (config.rateLimit.burst) {
      if (now > existing.burstResetTime!) {
        existing.burstCount = 1;
        existing.burstResetTime = now + 1000;
      } else {
        existing.burstCount = (existing.burstCount || 0) + 1;
        if (existing.burstCount > config.rateLimit.burst) {
          return false;
        }
      }
    }

    // Check main rate limit
    if (now > existing.resetTime) {
      existing.count = 1;
      existing.resetTime = now + config.rateLimit.window;
      return true;
    }

    existing.count++;
    return existing.count <= config.rateLimit.requests;
  }

  // Request Validation
  validateRequest(endpoint: string, data: any, method: string = 'GET'): ValidationResult {
    const schema = this.validationSchemas.get(`${method}:${endpoint}`);
    if (!schema) {
      return { valid: true, errors: [] };
    }

    const errors: string[] = [];
    const sanitizedData: any = {};

    // Check required fields
    for (const field of schema.required) {
      if (!(field in data) || data[field] === null || data[field] === undefined) {
        errors.push(`Missing required field: ${field}`);
        continue;
      }
      sanitizedData[field] = this.sanitizeValue(data[field], schema.types[field], field, schema);
    }

    // Check optional fields
    if (schema.optional) {
      for (const field of schema.optional) {
        if (field in data && data[field] !== null && data[field] !== undefined) {
          sanitizedData[field] = this.sanitizeValue(data[field], schema.types[field], field, schema);
        }
      }
    }

    // Check for suspicious patterns
    const jsonString = JSON.stringify(data);
    for (const pattern of this.suspiciousPatterns) {
      if (pattern.test(jsonString)) {
        errors.push('Request contains suspicious content');
        break;
      }
    }

    return {
      valid: errors.length === 0,
      errors,
      sanitizedData: errors.length === 0 ? sanitizedData : undefined
    };
  }

  private sanitizeValue(value: any, type: string, field: string, schema: ValidationSchema): any {
    // Type validation and conversion
    switch (type) {
      case 'string':
        const str = String(value);
        
        // Check length constraints
        if (schema.maxLength?.[field] && str.length > schema.maxLength[field]) {
          throw new Error(`Field ${field} exceeds maximum length`);
        }
        if (schema.minLength?.[field] && str.length < schema.minLength[field]) {
          throw new Error(`Field ${field} below minimum length`);
        }
        
        // Check pattern constraints
        if (schema.patterns?.[field] && !schema.patterns[field].test(str)) {
          throw new Error(`Field ${field} doesn't match required pattern`);
        }
        
        // Sanitize HTML and dangerous characters
        return str
          .replace(/[<>]/g, '') // Remove potential HTML tags
          .replace(/javascript:/gi, '') // Remove javascript: protocols
          .replace(/on\w+=/gi, '') // Remove event handlers
          .trim();
      
      case 'number':
        const num = Number(value);
        if (isNaN(num)) {
          throw new Error(`Field ${field} must be a number`);
        }
        
        // Check range constraints
        if (schema.range?.[field]) {
          const [min, max] = schema.range[field];
          if (num < min || num > max) {
            throw new Error(`Field ${field} out of allowed range`);
          }
        }
        
        return num;
      
      case 'boolean':
        return Boolean(value);
      
      case 'array':
        if (!Array.isArray(value)) {
          throw new Error(`Field ${field} must be an array`);
        }
        return value.map(item => typeof item === 'string' ? this.sanitizeValue(item, 'string', field, schema) : item);
      
      case 'object':
        if (typeof value !== 'object' || value === null) {
          throw new Error(`Field ${field} must be an object`);
        }
        return value;
      
      default:
        return value;
    }
  }

  // Security Headers
  private getDefaultSecurityHeaders(): SecurityHeaders {
    return {
      'Content-Security-Policy': [
        "default-src 'self'",
        "script-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
        "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
        "font-src 'self' https://fonts.gstatic.com",
        "img-src 'self' data: https:",
        "connect-src 'self' https://api.groq.com https://*.supabase.co https://app.scrapingbee.com",
        "object-src 'none'",
        "base-uri 'self'",
        "form-action 'self'",
        "frame-ancestors 'none'"
      ].join('; '),
      'X-Frame-Options': 'DENY',
      'X-Content-Type-Options': 'nosniff',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
      'Strict-Transport-Security': 'max-age=31536000; includeSubDomains'
    };
  }

  applySecurityHeaders(request: Request): Headers {
    const headers = new Headers(request.headers);
    
    Object.entries(this.securityHeaders).forEach(([key, value]) => {
      headers.set(key, value);
    });

    return headers;
  }

  // Suspicious Pattern Detection
  private getSuspiciousPatterns(): RegExp[] {
    return [
      /script\s*:/i,                    // Script injection
      /<script/i,                       // HTML script tags
      /javascript\s*:/i,                // JavaScript protocols
      /data\s*:\s*text\/html/i,         // Data URLs with HTML
      /vbscript\s*:/i,                  // VBScript protocols
      /on\w+\s*=/i,                     // Event handlers
      /(union|select|insert|update|delete|drop|create|alter)\s+/i, // SQL injection
      /\.\.\//,                         // Path traversal
      /file\s*:\/{2,}/i,                // File protocols
      /%[0-9a-f]{2}/i,                  // URL encoding (potential bypass)
      /base64/i,                        // Base64 encoding (potential payload)
    ];
  }

  // IP Blocking
  blockIP(ip: string, reason?: string): void {
    this.blockedIPs.add(ip);
    console.warn(`IP ${ip} blocked${reason ? `: ${reason}` : ''}`);
  }

  isIPBlocked(ip: string): boolean {
    return this.blockedIPs.has(ip);
  }

  // Cleanup and Maintenance
  private setupCleanupInterval(): void {
    setInterval(() => {
      this.cleanupExpiredData();
    }, 60000); // Cleanup every minute
  }

  private cleanupExpiredData(): void {
    const now = Date.now();
    
    // Clean up rate limits
    for (const [key, entry] of this.rateLimits.entries()) {
      if (now > entry.resetTime) {
        this.rateLimits.delete(key);
      }
    }

    // Clean up expired API keys
    for (const [service, config] of this.apiKeys.entries()) {
      if (config.expiresAt && now > config.expiresAt) {
        this.apiKeys.delete(service);
      }
    }

    this.persistAPIKeys();
  }

  // Load API keys from environment or localStorage
  private loadAPIKeys(): void {
    try {
      // Load from environment variables
      const scrapingBeeKey = import.meta.env.VITE_SCRAPINGBEE_API_KEY;
      if (scrapingBeeKey) {
        this.storeAPIKey('scrapingbee', scrapingBeeKey, {
          permissions: ['read', 'screenshot'],
          rateLimit: { requests: 1000, window: 3600000 }, // 1000 per hour
          environment: import.meta.env.MODE as any
        });
      }

      const groqKey = import.meta.env.VITE_GROQ_API_KEY;
      if (groqKey) {
        this.storeAPIKey('groq', groqKey, {
          permissions: ['read', 'analyze'],
          rateLimit: { requests: 100, window: 60000 }, // 100 per minute
          environment: import.meta.env.MODE as any
        });
      }

      // Load from localStorage (for additional keys)
      const storedKeys = localStorage.getItem('lumina_api_keys_v2');
      if (storedKeys) {
        try {
          const keys = JSON.parse(this.decryptData(storedKeys));
          for (const [service, config] of Object.entries(keys)) {
            this.apiKeys.set(service, config as APIKeyConfig);
          }
        } catch (error) {
          console.warn('Failed to load stored API keys:', error);
          localStorage.removeItem('lumina_api_keys_v2');
        }
      }
    } catch (error) {
      console.error('Error loading API keys:', error);
    }
  }

  private persistAPIKeys(): void {
    try {
      const keysObject = Object.fromEntries(this.apiKeys.entries());
      const encrypted = this.encryptData(JSON.stringify(keysObject));
      localStorage.setItem('lumina_api_keys_v2', encrypted);
    } catch (error) {
      console.error('Failed to persist API keys:', error);
    }
  }

  private initializeValidationSchemas(): void {
    // Website analysis endpoint validation
    this.validationSchemas.set('POST:/api/analyze', {
      required: ['url'],
      optional: ['options', 'settings'],
      types: {
        url: 'string',
        options: 'object',
        settings: 'object'
      },
      patterns: {
        url: /^https?:\/\/.+/
      },
      maxLength: {
        url: 2048
      }
    });

    // Settings update validation
    this.validationSchemas.set('POST:/api/settings', {
      required: [],
      optional: ['theme', 'language', 'notifications'],
      types: {
        theme: 'string',
        language: 'string',
        notifications: 'boolean'
      },
      patterns: {
        theme: /^(light|dark|auto)$/,
        language: /^[a-z]{2}(-[A-Z]{2})?$/
      }
    });
  }

  // Public API for checking security
  checkRequestSecurity(request: {
    url: string;
    method: string;
    headers: Record<string, string>;
    body?: any;
    ip?: string;
  }): SecurityCheckResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Check IP blocking
    if (request.ip && this.isIPBlocked(request.ip)) {
      errors.push('IP address is blocked');
    }

    // Validate request
    if (request.body) {
      const validation = this.validateRequest(request.url, request.body, request.method);
      if (!validation.valid) {
        errors.push(...validation.errors);
      }
    }

    // Check headers for security
    const userAgent = request.headers['user-agent'] || '';
    if (!userAgent || userAgent.length < 10) {
      warnings.push('Suspicious or missing user agent');
    }

    // Check for common attack patterns in URL
    for (const pattern of this.suspiciousPatterns) {
      if (pattern.test(request.url)) {
        errors.push('URL contains suspicious patterns');
        break;
      }
    }

    return {
      allowed: errors.length === 0,
      errors,
      warnings,
      securityScore: Math.max(0, 100 - (errors.length * 25) - (warnings.length * 10))
    };
  }

  // Get security statistics
  getSecurityStats() {
    return {
      apiKeysCount: this.apiKeys.size,
      rateLimitEntriesCount: this.rateLimits.size,
      blockedIPsCount: this.blockedIPs.size,
      encryptionEnabled: true,
      securityHeadersEnabled: true,
      validationSchemasCount: this.validationSchemas.size
    };
  }
}

// Types for validation results
interface ValidationResult {
  valid: boolean;
  errors: string[];
  sanitizedData?: any;
}

interface SecurityCheckResult {
  allowed: boolean;
  errors: string[];
  warnings: string[];
  securityScore: number;
}

// Create and export singleton instance
export const apiSecurityManager = new APISecurityManager();

// Utility functions for easy access
export function validateApiRequest(endpoint: string, data: any, method: string = 'GET') {
  return apiSecurityManager.validateRequest(endpoint, data, method);
}

export function checkRateLimit(identifier: string, service: string): boolean {
  const config = apiSecurityManager['apiKeys'].get(service);
  if (!config) return false;
  return apiSecurityManager.checkRateLimit(identifier, config);
}

export function getSecureHeaders(request: Request): Headers {
  return apiSecurityManager.applySecurityHeaders(request);
}

// Export as apiSecurity for backward compatibility
export const apiSecurity = apiSecurityManager;

// Export validation rules for common use cases
export const ValidationRules = {
  URL: {
    field: 'url',
    type: 'string' as const,
    required: true,
    pattern: /^https?:\/\/.+/
  },
  EMAIL: {
    field: 'email',
    type: 'string' as const,
    required: true,
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  },
  PHONE: {
    field: 'phone',
    type: 'string' as const,
    required: false,
    pattern: /^\+?[\d\s\-\(\)]+$/
  },
  NUMERIC: {
    field: 'numeric',
    type: 'number' as const,
    required: false
  },
  BOOLEAN: {
    field: 'boolean',
    type: 'boolean' as const,
    required: false
  }
} as const;

export default apiSecurityManager; 
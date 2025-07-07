import { rateLimiter } from './rateLimiter';

interface APIKeyConfig {
  key: string;
  encrypted: boolean;
  expiresAt?: number;
  rotationInterval?: number; // days
  lastRotated?: number;
  usage: {
    requests: number;
    errors: number;
    lastUsed: number;
  };
}

interface SecurityConfig {
  enableEncryption: boolean;
  requireHTTPS: boolean;
  enableRequestLogging: boolean;
  enableAnomalyDetection: boolean;
  allowedOrigins: string[];
  rateLimitingEnabled: boolean;
  keyRotationEnabled: boolean;
}

interface ValidationRule {
  field: string;
  type: 'string' | 'number' | 'boolean' | 'url' | 'email';
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  allowedValues?: string[];
  sanitize?: boolean;
}

interface SecurityEvent {
  timestamp: number;
  type: 'key_validation' | 'request_blocked' | 'anomaly_detected' | 'key_rotation' | 'security_violation';
  service: string;
  details: any;
  severity: 'low' | 'medium' | 'high' | 'critical';
  blocked: boolean;
}

export class APISecurityManager {
  private static instance: APISecurityManager;
  private apiKeys: Map<string, APIKeyConfig> = new Map();
  private securityEvents: SecurityEvent[] = [];
  private encryptionKey: string = '';
  private config: SecurityConfig = {
    enableEncryption: true,
    requireHTTPS: true,
    enableRequestLogging: true,
    enableAnomalyDetection: true,
    allowedOrigins: ['localhost', '127.0.0.1'],
    rateLimitingEnabled: true,
    keyRotationEnabled: true
  };

  public static getInstance(): APISecurityManager {
    if (!APISecurityManager.instance) {
      APISecurityManager.instance = new APISecurityManager();
    }
    return APISecurityManager.instance;
  }

  constructor() {
    this.initializeEncryption();
    this.loadAPIKeys();
    this.startMonitoring();
  }

  private initializeEncryption(): void {
    // Generate or load encryption key
    this.encryptionKey = this.generateEncryptionKey();
  }

  private generateEncryptionKey(): string {
    // Simple encryption key generation (in production, use proper key management)
    return btoa(Date.now().toString() + Math.random().toString());
  }

  private encrypt(data: string): string {
    if (!this.config.enableEncryption) return data;
    
    try {
      // Simple XOR encryption (in production, use proper encryption)
      const key = this.encryptionKey;
      let encrypted = '';
      for (let i = 0; i < data.length; i++) {
        encrypted += String.fromCharCode(data.charCodeAt(i) ^ key.charCodeAt(i % key.length));
      }
      return btoa(encrypted);
    } catch (error) {
      console.error('Encryption failed:', error);
      return data;
    }
  }

  private decrypt(encryptedData: string): string {
    if (!this.config.enableEncryption) return encryptedData;
    
    try {
      const key = this.encryptionKey;
      const data = atob(encryptedData);
      let decrypted = '';
      for (let i = 0; i < data.length; i++) {
        decrypted += String.fromCharCode(data.charCodeAt(i) ^ key.charCodeAt(i % key.length));
      }
      return decrypted;
    } catch (error) {
      console.error('Decryption failed:', error);
      return encryptedData;
    }
  }

  // Validate and sanitize API requests
  validateRequest(service: string, requestData: any, validationRules: ValidationRule[]): {
    valid: boolean;
    errors: string[];
    sanitizedData: any;
  } {
    const errors: string[] = [];
    const sanitizedData: any = {};

    // Check HTTPS requirement
    if (this.config.requireHTTPS && !this.isHTTPS()) {
      errors.push('HTTPS is required for API requests');
    }

    // Check origin
    if (!this.isAllowedOrigin()) {
      errors.push('Request origin is not allowed');
    }

    // Validate each field
    for (const rule of validationRules) {
      const value = requestData[rule.field];
      
      // Check required fields
      if (rule.required && (value === undefined || value === null || value === '')) {
        errors.push(`${rule.field} is required`);
        continue;
      }

      if (value !== undefined && value !== null) {
        // Type validation
        if (!this.validateType(value, rule.type)) {
          errors.push(`${rule.field} must be of type ${rule.type}`);
          continue;
        }

        // Length validation
        if (rule.minLength && value.length < rule.minLength) {
          errors.push(`${rule.field} must be at least ${rule.minLength} characters`);
          continue;
        }

        if (rule.maxLength && value.length > rule.maxLength) {
          errors.push(`${rule.field} must not exceed ${rule.maxLength} characters`);
          continue;
        }

        // Pattern validation
        if (rule.pattern && !rule.pattern.test(value)) {
          errors.push(`${rule.field} format is invalid`);
          continue;
        }

        // Allowed values validation
        if (rule.allowedValues && !rule.allowedValues.includes(value)) {
          errors.push(`${rule.field} must be one of: ${rule.allowedValues.join(', ')}`);
          continue;
        }

        // Sanitize data
        sanitizedData[rule.field] = rule.sanitize ? this.sanitizeValue(value) : value;
      }
    }

    // Log validation attempt
    if (errors.length > 0) {
      this.logSecurityEvent({
        timestamp: Date.now(),
        type: 'request_blocked',
        service,
        details: { errors, originalData: requestData },
        severity: 'medium',
        blocked: true
      });
    }

    return {
      valid: errors.length === 0,
      errors,
      sanitizedData
    };
  }

  private validateType(value: any, type: string): boolean {
    switch (type) {
      case 'string':
        return typeof value === 'string';
      case 'number':
        return typeof value === 'number' && !isNaN(value);
      case 'boolean':
        return typeof value === 'boolean';
      case 'url':
        try {
          new URL(value);
          return true;
        } catch {
          return false;
        }
      case 'email':
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
      default:
        return true;
    }
  }

  private sanitizeValue(value: any): any {
    if (typeof value === 'string') {
      // Remove potentially dangerous characters
      return value
        .replace(/[<>\"']/g, '')
        .replace(/javascript:/gi, '')
        .replace(/on\w+=/gi, '')
        .trim();
    }
    return value;
  }

  private isHTTPS(): boolean {
    return window.location.protocol === 'https:' || window.location.hostname === 'localhost';
  }

  private isAllowedOrigin(): boolean {
    const hostname = window.location.hostname;
    return this.config.allowedOrigins.includes(hostname) || hostname === 'localhost';
  }

  // API Key Management
  validateAPIKey(service: string, apiKey: string): {
    valid: boolean;
    reason?: string;
    keyInfo?: APIKeyConfig;
  } {
    const keyConfig = this.apiKeys.get(service);
    
    if (!keyConfig) {
      return { valid: false, reason: 'API key not configured' };
    }

    const actualKey = keyConfig.encrypted ? this.decrypt(keyConfig.key) : keyConfig.key;
    
    if (actualKey !== apiKey) {
      this.logSecurityEvent({
        timestamp: Date.now(),
        type: 'key_validation',
        service,
        details: { reason: 'Invalid API key' },
        severity: 'high',
        blocked: true
      });
      return { valid: false, reason: 'Invalid API key' };
    }

    // Check expiration
    if (keyConfig.expiresAt && Date.now() > keyConfig.expiresAt) {
      return { valid: false, reason: 'API key expired' };
    }

    // Check rotation requirement
    if (this.isKeyRotationRequired(keyConfig)) {
      return { valid: false, reason: 'API key rotation required' };
    }

    // Update usage
    keyConfig.usage.requests++;
    keyConfig.usage.lastUsed = Date.now();

    return { valid: true, keyInfo: keyConfig };
  }

  private isKeyRotationRequired(keyConfig: APIKeyConfig): boolean {
    if (!this.config.keyRotationEnabled || !keyConfig.rotationInterval || !keyConfig.lastRotated) {
      return false;
    }

    const daysSinceRotation = (Date.now() - keyConfig.lastRotated) / (1000 * 60 * 60 * 24);
    return daysSinceRotation > keyConfig.rotationInterval;
  }

  // Store API keys securely
  storeAPIKey(service: string, apiKey: string, config: Partial<APIKeyConfig> = {}): void {
    const keyConfig: APIKeyConfig = {
      key: this.config.enableEncryption ? this.encrypt(apiKey) : apiKey,
      encrypted: this.config.enableEncryption,
      expiresAt: config.expiresAt,
      rotationInterval: config.rotationInterval || 30, // Default 30 days
      lastRotated: Date.now(),
      usage: {
        requests: 0,
        errors: 0,
        lastUsed: 0
      }
    };

    this.apiKeys.set(service, keyConfig);
    this.saveAPIKeys();
  }

  // Load API keys from environment or localStorage
  private loadAPIKeys(): void {
    try {
      // Load from environment variables
      const scrapingBeeKey = import.meta.env.VITE_SCRAPINGBEE_API_KEY;
      if (scrapingBeeKey) {
        this.storeAPIKey('scrapingbee', scrapingBeeKey);
      }

      const groqKey = import.meta.env.VITE_GROQ_API_KEY;
      if (groqKey) {
        this.storeAPIKey('groq', groqKey);
      }

      // Load from localStorage (for additional keys)
      const storedKeys = localStorage.getItem('lumina_api_keys');
      if (storedKeys) {
        const keys = JSON.parse(storedKeys);
        for (const [service, config] of Object.entries(keys)) {
          this.apiKeys.set(service, config as APIKeyConfig);
        }
      }
    } catch (error) {
      console.error('Error loading API keys:', error);
    }
  }

  private saveAPIKeys(): void {
    try {
      const keysToSave: { [key: string]: APIKeyConfig } = {};
      
      // Only save non-environment keys to localStorage
      for (const [service, config] of this.apiKeys.entries()) {
        if (!['scrapingbee', 'groq'].includes(service)) {
          keysToSave[service] = config;
        }
      }

      localStorage.setItem('lumina_api_keys', JSON.stringify(keysToSave));
    } catch (error) {
      console.error('Error saving API keys:', error);
    }
  }

  // Enhanced request execution with security
  async executeSecureRequest<T>(
    service: string,
    requestFn: () => Promise<T>,
    validationRules: ValidationRule[] = [],
    requestData: any = {}
  ): Promise<T> {
    try {
      // Validate request
      const validation = this.validateRequest(service, requestData, validationRules);
      if (!validation.valid) {
        throw new Error(`Request validation failed: ${validation.errors.join(', ')}`);
      }

      // Check rate limits
      const rateLimitCheck = await rateLimiter.canMakeRequest(service);
      if (!rateLimitCheck.allowed) {
        throw new Error(`Rate limit exceeded: ${rateLimitCheck.reason}`);
      }

      // Execute request with monitoring
      const startTime = Date.now();
      const result = await requestFn();
      const duration = Date.now() - startTime;

      // Log successful request
      this.logSecurityEvent({
        timestamp: Date.now(),
        type: 'request_blocked',
        service,
        details: { duration, success: true },
        severity: 'low',
        blocked: false
      });

      rateLimiter.recordRequest(service);
      return result;

    } catch (error) {
      // Log failed request
      this.logSecurityEvent({
        timestamp: Date.now(),
        type: 'request_blocked',
        service,
        details: { error: error.message, success: false },
        severity: 'medium',
        blocked: true
      });

      throw error;
    }
  }

  // Anomaly Detection
  detectAnomalies(service: string): {
    anomalies: Array<{
      type: string;
      severity: 'low' | 'medium' | 'high' | 'critical';
      description: string;
      timestamp: number;
    }>;
    recommendations: string[];
  } {
    const anomalies: Array<{
      type: string;
      severity: 'low' | 'medium' | 'high' | 'critical';
      description: string;
      timestamp: number;
    }> = [];
    const recommendations: string[] = [];

    const keyConfig = this.apiKeys.get(service);
    if (!keyConfig) return { anomalies, recommendations };

    const now = Date.now();
    const oneHour = 60 * 60 * 1000;
    const oneDay = 24 * oneHour;

    // Check for unusual request patterns
    const recentEvents = this.securityEvents.filter(e => 
      e.service === service && now - e.timestamp < oneHour
    );

    const blockedRequests = recentEvents.filter(e => e.blocked);
    const errorRate = blockedRequests.length / Math.max(recentEvents.length, 1);

    if (errorRate > 0.3) {
      anomalies.push({
        type: 'high_error_rate',
        severity: 'high',
        description: `High error rate detected: ${(errorRate * 100).toFixed(1)}%`,
        timestamp: now
      });
      recommendations.push('Check API key validity and request parameters');
    }

    // Check for key rotation needs
    if (this.isKeyRotationRequired(keyConfig)) {
      anomalies.push({
        type: 'key_rotation_needed',
        severity: 'medium',
        description: 'API key rotation is overdue',
        timestamp: now
      });
      recommendations.push('Rotate API key to maintain security');
    }

    // Check for unusual usage patterns
    const dailyEvents = this.securityEvents.filter(e => 
      e.service === service && now - e.timestamp < oneDay
    );

    if (dailyEvents.length > 1000) {
      anomalies.push({
        type: 'unusual_usage',
        severity: 'medium',
        description: 'Unusually high API usage detected',
        timestamp: now
      });
      recommendations.push('Monitor usage patterns and check for potential abuse');
    }

    return { anomalies, recommendations };
  }

  // Security Event Logging
  private logSecurityEvent(event: SecurityEvent): void {
    this.securityEvents.push(event);
    
    // Keep only last 1000 events
    if (this.securityEvents.length > 1000) {
      this.securityEvents = this.securityEvents.slice(-1000);
    }

    // Log to console in development
    if (import.meta.env.DEV && event.severity !== 'low') {
      console.warn('Security Event:', event);
    }
  }

  // Start monitoring
  private startMonitoring(): void {
    // Clean up old events every hour
    setInterval(() => {
      const oneWeek = 7 * 24 * 60 * 60 * 1000;
      this.securityEvents = this.securityEvents.filter(e => 
        Date.now() - e.timestamp < oneWeek
      );
    }, 60 * 60 * 1000);
  }

  // Public API for getting security status
  getSecurityStatus(): {
    overall: 'secure' | 'warning' | 'critical';
    apiKeys: Array<{
      service: string;
      status: 'valid' | 'expired' | 'rotation_needed' | 'missing';
      lastUsed: number;
      requests: number;
    }>;
    recentEvents: SecurityEvent[];
    anomalies: { [service: string]: any };
  } {
    const apiKeyStatus = Array.from(this.apiKeys.entries()).map(([service, config]) => ({
      service,
      status: this.getKeyStatus(config),
      lastUsed: config.usage.lastUsed,
      requests: config.usage.requests
    }));

    const recentEvents = this.securityEvents.slice(-10);
    const anomalies: { [service: string]: any } = {};

    for (const service of this.apiKeys.keys()) {
      anomalies[service] = this.detectAnomalies(service);
    }

    let overall: 'secure' | 'warning' | 'critical' = 'secure';
    
    // Determine overall status
    const hasExpiredKeys = apiKeyStatus.some(k => k.status === 'expired');
    const hasHighSeverityEvents = recentEvents.some(e => e.severity === 'critical');
    const hasAnomalies = Object.values(anomalies).some(a => a.anomalies.length > 0);

    if (hasExpiredKeys || hasHighSeverityEvents) {
      overall = 'critical';
    } else if (hasAnomalies) {
      overall = 'warning';
    }

    return {
      overall,
      apiKeys: apiKeyStatus,
      recentEvents,
      anomalies
    };
  }

  private getKeyStatus(config: APIKeyConfig): 'valid' | 'expired' | 'rotation_needed' | 'missing' {
    if (config.expiresAt && Date.now() > config.expiresAt) {
      return 'expired';
    }
    if (this.isKeyRotationRequired(config)) {
      return 'rotation_needed';
    }
    return 'valid';
  }
}

// Export singleton instance
export const apiSecurity = APISecurityManager.getInstance();

// Common validation rules
export const ValidationRules = {
  URL: {
    field: 'url',
    type: 'url' as const,
    required: true,
    sanitize: true
  },
  STRING_REQUIRED: (field: string) => ({
    field,
    type: 'string' as const,
    required: true,
    sanitize: true
  }),
  STRING_OPTIONAL: (field: string) => ({
    field,
    type: 'string' as const,
    required: false,
    sanitize: true
  }),
  NUMBER_RANGE: (field: string, min?: number, max?: number) => ({
    field,
    type: 'number' as const,
    required: false,
    minLength: min,
    maxLength: max
  })
}; 
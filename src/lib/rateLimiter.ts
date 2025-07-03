interface RateLimitConfig {
  requestsPerMinute: number;
  requestsPerHour: number;
  requestsPerDay: number;
  burstLimit: number;
  quotaLimit?: number; // Monthly quota if applicable
}

interface APIServiceConfig {
  [service: string]: RateLimitConfig;
}

interface RequestRecord {
  timestamp: number;
  service: string;
  endpoint?: string;
}

interface QuotaUsage {
  used: number;
  limit: number;
  resetTime: number; // Unix timestamp when quota resets
}

export class RateLimiter {
  private static instance: RateLimiter;
  private requestHistory: RequestRecord[] = [];
  private quotaUsage: Map<string, QuotaUsage> = new Map();
  private serviceConfigs: APIServiceConfig = {
    scrapingbee: {
      requestsPerMinute: 10,
      requestsPerHour: 100,
      requestsPerDay: 1000,
      burstLimit: 5,
      quotaLimit: 10000 // Monthly quota
    },
    groq: {
      requestsPerMinute: 30,
      requestsPerHour: 500,
      requestsPerDay: 2000,
      burstLimit: 10,
      quotaLimit: 50000 // Monthly quota (tokens)
    },
    openai: {
      requestsPerMinute: 20,
      requestsPerHour: 200,
      requestsPerDay: 1000,
      burstLimit: 8,
      quotaLimit: 25000 // Monthly quota
    }
  };

  public static getInstance(): RateLimiter {
    if (!RateLimiter.instance) {
      RateLimiter.instance = new RateLimiter();
    }
    return RateLimiter.instance;
  }

  constructor() {
    // Load quota usage from localStorage if available
    this.loadQuotaUsage();
    
    // Clean up old request records every minute
    setInterval(() => this.cleanupOldRecords(), 60000);
    
    // Save quota usage every 5 minutes
    setInterval(() => this.saveQuotaUsage(), 300000);
  }

  // Check if a request can be made
  async canMakeRequest(service: string, endpoint?: string): Promise<{
    allowed: boolean;
    reason?: string;
    retryAfter?: number; // Seconds to wait before retry
    quotaRemaining?: number;
  }> {
    const config = this.serviceConfigs[service];
    if (!config) {
      return { allowed: true }; // Allow if no config found
    }

    const now = Date.now();
    const serviceRequests = this.requestHistory.filter(r => r.service === service);

    // Check quota limits first
    const quotaCheck = this.checkQuotaLimit(service);
    if (!quotaCheck.allowed) {
      return quotaCheck;
    }

    // Check per-minute rate limit
    const minuteRequests = serviceRequests.filter(r => now - r.timestamp < 60000);
    if (minuteRequests.length >= config.requestsPerMinute) {
      const oldestRequest = Math.min(...minuteRequests.map(r => r.timestamp));
      const retryAfter = Math.ceil((oldestRequest + 60000 - now) / 1000);
      return {
        allowed: false,
        reason: `Rate limit exceeded: ${config.requestsPerMinute} requests per minute`,
        retryAfter,
        quotaRemaining: this.getQuotaRemaining(service)
      };
    }

    // Check per-hour rate limit
    const hourRequests = serviceRequests.filter(r => now - r.timestamp < 3600000);
    if (hourRequests.length >= config.requestsPerHour) {
      const oldestRequest = Math.min(...hourRequests.map(r => r.timestamp));
      const retryAfter = Math.ceil((oldestRequest + 3600000 - now) / 1000);
      return {
        allowed: false,
        reason: `Rate limit exceeded: ${config.requestsPerHour} requests per hour`,
        retryAfter,
        quotaRemaining: this.getQuotaRemaining(service)
      };
    }

    // Check per-day rate limit
    const dayRequests = serviceRequests.filter(r => now - r.timestamp < 86400000);
    if (dayRequests.length >= config.requestsPerDay) {
      const oldestRequest = Math.min(...dayRequests.map(r => r.timestamp));
      const retryAfter = Math.ceil((oldestRequest + 86400000 - now) / 1000);
      return {
        allowed: false,
        reason: `Rate limit exceeded: ${config.requestsPerDay} requests per day`,
        retryAfter,
        quotaRemaining: this.getQuotaRemaining(service)
      };
    }

    // Check burst limit (requests in last 10 seconds)
    const burstRequests = serviceRequests.filter(r => now - r.timestamp < 10000);
    if (burstRequests.length >= config.burstLimit) {
      return {
        allowed: false,
        reason: `Burst limit exceeded: ${config.burstLimit} requests in 10 seconds`,
        retryAfter: 10,
        quotaRemaining: this.getQuotaRemaining(service)
      };
    }

    return { 
      allowed: true, 
      quotaRemaining: this.getQuotaRemaining(service) 
    };
  }

  // Record a successful request
  recordRequest(service: string, endpoint?: string, tokensUsed?: number): void {
    const now = Date.now();
    
    // Add to request history
    this.requestHistory.push({
      timestamp: now,
      service,
      endpoint
    });

    // Update quota usage
    this.updateQuotaUsage(service, tokensUsed || 1);

    // Clean up old records to prevent memory leaks
    if (this.requestHistory.length > 10000) {
      this.cleanupOldRecords();
    }
  }

  // Get current rate limit status
  getRateLimitStatus(service: string): {
    minuteUsage: { used: number; limit: number; resetIn: number };
    hourUsage: { used: number; limit: number; resetIn: number };
    dayUsage: { used: number; limit: number; resetIn: number };
    quotaUsage: { used: number; limit: number; resetIn: number };
  } {
    const config = this.serviceConfigs[service];
    if (!config) {
      return {
        minuteUsage: { used: 0, limit: 0, resetIn: 0 },
        hourUsage: { used: 0, limit: 0, resetIn: 0 },
        dayUsage: { used: 0, limit: 0, resetIn: 0 },
        quotaUsage: { used: 0, limit: 0, resetIn: 0 }
      };
    }

    const now = Date.now();
    const serviceRequests = this.requestHistory.filter(r => r.service === service);

    const minuteRequests = serviceRequests.filter(r => now - r.timestamp < 60000);
    const hourRequests = serviceRequests.filter(r => now - r.timestamp < 3600000);
    const dayRequests = serviceRequests.filter(r => now - r.timestamp < 86400000);

    const quota = this.quotaUsage.get(service) || { used: 0, limit: config.quotaLimit || 0, resetTime: this.getMonthlyResetTime() };

    return {
      minuteUsage: {
        used: minuteRequests.length,
        limit: config.requestsPerMinute,
        resetIn: minuteRequests.length > 0 ? Math.ceil((Math.min(...minuteRequests.map(r => r.timestamp)) + 60000 - now) / 1000) : 60
      },
      hourUsage: {
        used: hourRequests.length,
        limit: config.requestsPerHour,
        resetIn: hourRequests.length > 0 ? Math.ceil((Math.min(...hourRequests.map(r => r.timestamp)) + 3600000 - now) / 1000) : 3600
      },
      dayUsage: {
        used: dayRequests.length,
        limit: config.requestsPerDay,
        resetIn: dayRequests.length > 0 ? Math.ceil((Math.min(...dayRequests.map(r => r.timestamp)) + 86400000 - now) / 1000) : 86400
      },
      quotaUsage: {
        used: quota.used,
        limit: quota.limit,
        resetIn: Math.ceil((quota.resetTime - now) / 1000)
      }
    };
  }

  // Wait for rate limit to reset
  async waitForRateLimit(service: string): Promise<void> {
    const check = await this.canMakeRequest(service);
    if (check.allowed) return;

    if (check.retryAfter) {
      console.log(`Rate limited for ${service}. Waiting ${check.retryAfter} seconds...`);
      await new Promise(resolve => setTimeout(resolve, check.retryAfter! * 1000));
    }
  }

  // Execute request with automatic rate limiting
  async executeWithRateLimit<T>(
    service: string,
    requestFn: () => Promise<T>,
    endpoint?: string,
    tokensUsed?: number
  ): Promise<T> {
    await this.waitForRateLimit(service);
    
    try {
      const result = await requestFn();
      this.recordRequest(service, endpoint, tokensUsed);
      return result;
    } catch (error) {
      // Don't record failed requests in quota
      throw error;
    }
  }

  // Check quota limit
  private checkQuotaLimit(service: string): {
    allowed: boolean;
    reason?: string;
    quotaRemaining?: number;
  } {
    const config = this.serviceConfigs[service];
    if (!config.quotaLimit) {
      return { allowed: true };
    }

    const quota = this.quotaUsage.get(service) || { 
      used: 0, 
      limit: config.quotaLimit, 
      resetTime: this.getMonthlyResetTime() 
    };

    // Check if quota has reset
    if (Date.now() > quota.resetTime) {
      quota.used = 0;
      quota.resetTime = this.getMonthlyResetTime();
      this.quotaUsage.set(service, quota);
    }

    if (quota.used >= quota.limit) {
      return {
        allowed: false,
        reason: `Monthly quota exceeded: ${quota.limit} requests`,
        quotaRemaining: 0
      };
    }

    return { 
      allowed: true, 
      quotaRemaining: quota.limit - quota.used 
    };
  }

  // Update quota usage
  private updateQuotaUsage(service: string, amount: number = 1): void {
    const config = this.serviceConfigs[service];
    if (!config.quotaLimit) return;

    const quota = this.quotaUsage.get(service) || { 
      used: 0, 
      limit: config.quotaLimit, 
      resetTime: this.getMonthlyResetTime() 
    };

    // Check if quota has reset
    if (Date.now() > quota.resetTime) {
      quota.used = 0;
      quota.resetTime = this.getMonthlyResetTime();
    }

    quota.used += amount;
    this.quotaUsage.set(service, quota);
  }

  // Get remaining quota
  private getQuotaRemaining(service: string): number {
    const config = this.serviceConfigs[service];
    if (!config.quotaLimit) return -1; // Unlimited

    const quota = this.quotaUsage.get(service) || { 
      used: 0, 
      limit: config.quotaLimit, 
      resetTime: this.getMonthlyResetTime() 
    };

    return Math.max(0, quota.limit - quota.used);
  }

  // Clean up old request records
  private cleanupOldRecords(): void {
    const cutoffTime = Date.now() - 86400000; // Keep 24 hours of history
    this.requestHistory = this.requestHistory.filter(r => r.timestamp > cutoffTime);
  }

  // Get monthly reset time (first day of next month)
  private getMonthlyResetTime(): number {
    const now = new Date();
    const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    return nextMonth.getTime();
  }

  // Load quota usage from localStorage
  private loadQuotaUsage(): void {
    try {
      const stored = localStorage.getItem('api-quota-usage');
      if (stored) {
        const data = JSON.parse(stored);
        this.quotaUsage = new Map(Object.entries(data));
      }
    } catch (error) {
      console.warn('Failed to load quota usage from localStorage:', error);
    }
  }

  // Save quota usage to localStorage
  private saveQuotaUsage(): void {
    try {
      const data = Object.fromEntries(this.quotaUsage);
      localStorage.setItem('api-quota-usage', JSON.stringify(data));
    } catch (error) {
      console.warn('Failed to save quota usage to localStorage:', error);
    }
  }

  // Update service configuration
  updateServiceConfig(service: string, config: Partial<RateLimitConfig>): void {
    this.serviceConfigs[service] = { ...this.serviceConfigs[service], ...config };
  }

  // Get service configuration
  getServiceConfig(service: string): RateLimitConfig | undefined {
    return this.serviceConfigs[service];
  }

  // Reset quota for a service (useful for testing or manual reset)
  resetQuota(service: string): void {
    const config = this.serviceConfigs[service];
    if (config?.quotaLimit) {
      this.quotaUsage.set(service, {
        used: 0,
        limit: config.quotaLimit,
        resetTime: this.getMonthlyResetTime()
      });
    }
  }

  // Get overall API health status
  getAPIHealthStatus(): {
    [service: string]: {
      status: 'healthy' | 'warning' | 'critical';
      usage: number; // Percentage of quota used
      message: string;
    };
  } {
    const health: any = {};

    Object.keys(this.serviceConfigs).forEach(service => {
      const status = this.getRateLimitStatus(service);
      const quotaUsagePercent = status.quotaUsage.limit > 0 
        ? (status.quotaUsage.used / status.quotaUsage.limit) * 100 
        : 0;

      let serviceStatus: 'healthy' | 'warning' | 'critical' = 'healthy';
      let message = 'API usage is within normal limits';

      if (quotaUsagePercent > 90) {
        serviceStatus = 'critical';
        message = 'Quota almost exhausted - critical usage level';
      } else if (quotaUsagePercent > 75) {
        serviceStatus = 'warning';
        message = 'High quota usage - monitor closely';
      } else if (status.hourUsage.used / status.hourUsage.limit > 0.8) {
        serviceStatus = 'warning';
        message = 'High hourly usage - rate limiting may occur';
      }

      health[service] = {
        status: serviceStatus,
        usage: quotaUsagePercent,
        message
      };
    });

    return health;
  }
}

export const rateLimiter = RateLimiter.getInstance();
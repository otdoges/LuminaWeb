interface PendingRequest {
  promise: Promise<any>;
  timestamp: number;
  controller: AbortController;
}

interface RequestConfig {
  timeout?: number;
  maxConcurrent?: number;
  ttl?: number; // Time to live for deduplication
  retries?: number;
  retryDelay?: number;
}

class RequestDeduplicator {
  private pendingRequests = new Map<string, PendingRequest>();
  private completedRequests = new Map<string, { result: any; timestamp: number }>();
  private requestQueue: Array<{ key: string; fn: () => Promise<any>; resolve: (value: any) => void; reject: (reason: any) => void }> = [];
  private activeRequestCount = 0;
  
  private config: Required<RequestConfig> = {
    timeout: 30000,
    maxConcurrent: 6,
    ttl: 5000,
    retries: 3,
    retryDelay: 1000,
  };

  constructor(config?: Partial<RequestConfig>) {
    if (config) {
      this.config = { ...this.config, ...config };
    }

    // Cleanup completed requests periodically
    setInterval(() => this.cleanup(), this.config.ttl);
  }

  // Main deduplication method
  async dedupe<T>(key: string, requestFn: () => Promise<T>): Promise<T> {
    // Check if we have a recent completed result
    const cached = this.completedRequests.get(key);
    if (cached && Date.now() - cached.timestamp < this.config.ttl) {
      return cached.result;
    }

    // Check if request is already pending
    const pending = this.pendingRequests.get(key);
    if (pending) {
      try {
        return await pending.promise;
      } catch (error) {
        // If the pending request failed, we'll try again
        this.pendingRequests.delete(key);
      }
    }

    // Check if we've hit the concurrent request limit
    if (this.activeRequestCount >= this.config.maxConcurrent) {
      return new Promise((resolve, reject) => {
        this.requestQueue.push({ key, fn: requestFn, resolve, reject });
      });
    }

    return this.executeRequest(key, requestFn);
  }

  private async executeRequest<T>(key: string, requestFn: () => Promise<T>): Promise<T> {
    const controller = new AbortController();
    
    // Create timeout
    const timeoutId = setTimeout(() => {
      controller.abort();
    }, this.config.timeout);

    const pendingRequest: PendingRequest = {
      promise: this.executeWithRetries(requestFn, controller.signal),
      timestamp: Date.now(),
      controller,
    };

    this.pendingRequests.set(key, pendingRequest);
    this.activeRequestCount++;

    try {
      const result = await pendingRequest.promise;
      
      // Cache the successful result
      this.completedRequests.set(key, {
        result,
        timestamp: Date.now(),
      });

      return result;
    } catch (error) {
      // Don't cache errors, allow retries
      throw error;
    } finally {
      clearTimeout(timeoutId);
      this.pendingRequests.delete(key);
      this.activeRequestCount--;
      this.processQueue();
    }
  }

  private async executeWithRetries<T>(
    requestFn: () => Promise<T>, 
    signal: AbortSignal,
    attempt = 1
  ): Promise<T> {
    try {
      return await requestFn();
    } catch (error) {
      if (signal.aborted) {
        throw new Error('Request was aborted');
      }

      if (attempt < this.config.retries && this.isRetryableError(error)) {
        await this.delay(this.config.retryDelay * attempt);
        return this.executeWithRetries(requestFn, signal, attempt + 1);
      }

      throw error;
    }
  }

  private isRetryableError(error: any): boolean {
    // Retry on network errors, timeouts, and 5xx status codes
    if (error.name === 'TypeError' && error.message.includes('fetch')) return true;
    if (error.name === 'AbortError') return false;
    if (error.status >= 500 && error.status < 600) return true;
    if (error.status === 429) return true; // Rate limited
    return false;
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private processQueue(): void {
    if (this.requestQueue.length === 0 || this.activeRequestCount >= this.config.maxConcurrent) {
      return;
    }

    const next = this.requestQueue.shift();
    if (next) {
      this.executeRequest(next.key, next.fn)
        .then(next.resolve)
        .catch(next.reject);
    }
  }

  private cleanup(): void {
    const now = Date.now();
    
    // Clean up old completed requests
    for (const [key, request] of this.completedRequests.entries()) {
      if (now - request.timestamp > this.config.ttl) {
        this.completedRequests.delete(key);
      }
    }

    // Clean up stale pending requests
    for (const [key, request] of this.pendingRequests.entries()) {
      if (now - request.timestamp > this.config.timeout * 2) {
        request.controller.abort();
        this.pendingRequests.delete(key);
      }
    }
  }

  // Cancel a specific request
  cancel(key: string): void {
    const pending = this.pendingRequests.get(key);
    if (pending) {
      pending.controller.abort();
      this.pendingRequests.delete(key);
    }
  }

  // Cancel all pending requests
  cancelAll(): void {
    for (const [key, request] of this.pendingRequests.entries()) {
      request.controller.abort();
    }
    this.pendingRequests.clear();
    this.requestQueue.length = 0;
  }

  // Get stats for monitoring
  getStats() {
    return {
      pendingCount: this.pendingRequests.size,
      queuedCount: this.requestQueue.length,
      cacheSize: this.completedRequests.size,
      activeRequests: this.activeRequestCount,
      maxConcurrent: this.config.maxConcurrent,
    };
  }

  // Clear all caches
  clear(): void {
    this.completedRequests.clear();
    this.pendingRequests.clear();
    this.requestQueue.length = 0;
  }
}

// Global instance for the application
export const requestDeduplicator = new RequestDeduplicator({
  timeout: 30000,
  maxConcurrent: 8,
  ttl: 5000,
  retries: 3,
  retryDelay: 1000,
});

// React hook for easy usage
export function useRequestDeduplication() {
  return {
    dedupe: requestDeduplicator.dedupe.bind(requestDeduplicator),
    cancel: requestDeduplicator.cancel.bind(requestDeduplicator),
    stats: requestDeduplicator.getStats.bind(requestDeduplicator),
  };
}

// Higher-order function to wrap fetch calls
export function deduplicatedFetch(url: string, options?: RequestInit): Promise<Response> {
  const key = `${options?.method || 'GET'}:${url}:${JSON.stringify(options?.body || '')}`;
  
  return requestDeduplicator.dedupe(key, () => fetch(url, options));
}

// Enhanced API client with deduplication
export class DeduplicatedAPIClient {
  private baseURL: string;
  private defaultHeaders: Record<string, string>;

  constructor(baseURL: string = '', defaultHeaders: Record<string, string> = {}) {
    this.baseURL = baseURL;
    this.defaultHeaders = {
      'Content-Type': 'application/json',
      ...defaultHeaders,
    };
  }

  private createKey(method: string, endpoint: string, data?: any): string {
    return `${method}:${this.baseURL}${endpoint}:${JSON.stringify(data || '')}`;
  }

  async get<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const key = this.createKey('GET', endpoint);
    
    return requestDeduplicator.dedupe(key, async () => {
      const response = await fetch(`${this.baseURL}${endpoint}`, {
        method: 'GET',
        headers: { ...this.defaultHeaders, ...options?.headers },
        ...options,
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return response.json();
    });
  }

  async post<T>(endpoint: string, data?: any, options?: RequestInit): Promise<T> {
    const key = this.createKey('POST', endpoint, data);
    
    return requestDeduplicator.dedupe(key, async () => {
      const response = await fetch(`${this.baseURL}${endpoint}`, {
        method: 'POST',
        headers: { ...this.defaultHeaders, ...options?.headers },
        body: data ? JSON.stringify(data) : undefined,
        ...options,
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return response.json();
    });
  }

  async put<T>(endpoint: string, data?: any, options?: RequestInit): Promise<T> {
    const key = this.createKey('PUT', endpoint, data);
    
    return requestDeduplicator.dedupe(key, async () => {
      const response = await fetch(`${this.baseURL}${endpoint}`, {
        method: 'PUT',
        headers: { ...this.defaultHeaders, ...options?.headers },
        body: data ? JSON.stringify(data) : undefined,
        ...options,
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return response.json();
    });
  }

  async delete<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const key = this.createKey('DELETE', endpoint);
    
    return requestDeduplicator.dedupe(key, async () => {
      const response = await fetch(`${this.baseURL}${endpoint}`, {
        method: 'DELETE',
        headers: { ...this.defaultHeaders, ...options?.headers },
        ...options,
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return response.json();
    });
  }
}

export default requestDeduplicator; 
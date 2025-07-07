interface CacheEntry<T = any> {
  key: string;
  data: T;
  timestamp: number;
  expiresAt: number;
  accessCount: number;
  lastAccessed: number;
  metadata: {
    version: string;
    size: number;
    compressed: boolean;
    tags: string[];
    priority: 'low' | 'medium' | 'high' | 'critical';
  };
}

interface CacheConfig {
  maxSize: number; // Max cache size in bytes
  maxAge: number; // Default max age in milliseconds
  cleanupInterval: number; // Cleanup interval in milliseconds
  compression: {
    enabled: boolean;
    threshold: number; // Compress if data size exceeds this
  };
  storage: {
    memory: boolean;
    localStorage: boolean;
    indexedDB: boolean;
  };
  evictionPolicy: 'lru' | 'lfu' | 'fifo' | 'ttl';
}

interface CacheStats {
  hits: number;
  misses: number;
  totalRequests: number;
  hitRate: number;
  memoryUsage: number;
  entryCount: number;
  averageSize: number;
  lastCleanup: number;
}

interface CacheStrategy {
  key: string;
  ttl: number; // Time to live in milliseconds
  refreshThreshold?: number; // Refresh when TTL is below this percentage
  staleWhileRevalidate?: boolean; // Return stale data while fetching fresh
  tags?: string[]; // Tags for invalidation
  priority?: 'low' | 'medium' | 'high' | 'critical';
  compression?: boolean; // Override global compression setting
}

type CacheProvider = 'memory' | 'localStorage' | 'indexedDB';

export class CachingLayer {
  private static instance: CachingLayer;
  private memoryCache: Map<string, CacheEntry> = new Map();
  private config: CacheConfig = {
    maxSize: 50 * 1024 * 1024, // 50MB
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    cleanupInterval: 5 * 60 * 1000, // 5 minutes
    compression: {
      enabled: true,
      threshold: 1024 // 1KB
    },
    storage: {
      memory: true,
      localStorage: true,
      indexedDB: true
    },
    evictionPolicy: 'lru'
  };
  private stats: CacheStats = {
    hits: 0,
    misses: 0,
    totalRequests: 0,
    hitRate: 0,
    memoryUsage: 0,
    entryCount: 0,
    averageSize: 0,
    lastCleanup: Date.now()
  };
  private db: IDBDatabase | null = null;
  private cleanupTimer: NodeJS.Timeout | null = null;
  private refreshQueue: Set<string> = new Set();

  public static getInstance(): CachingLayer {
    if (!CachingLayer.instance) {
      CachingLayer.instance = new CachingLayer();
    }
    return CachingLayer.instance;
  }

  constructor() {
    this.initializeDB();
    this.startCleanupTimer();
    this.loadStatsFromStorage();
  }

  private async initializeDB(): Promise<void> {
    if (!this.config.storage.indexedDB || !('indexedDB' in window)) {
      return;
    }

    try {
      this.db = await new Promise<IDBDatabase>((resolve, reject) => {
        const request = indexedDB.open('LuminaCache', 1);
        
        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve(request.result);
        
        request.onupgradeneeded = (event) => {
          const db = (event.target as IDBOpenDBRequest).result;
          
          if (!db.objectStoreNames.contains('cache')) {
            const store = db.createObjectStore('cache', { keyPath: 'key' });
            store.createIndex('expiresAt', 'expiresAt', { unique: false });
            store.createIndex('tags', 'metadata.tags', { unique: false, multiEntry: true });
            store.createIndex('priority', 'metadata.priority', { unique: false });
          }
        };
      });
    } catch (error) {
      console.error('Failed to initialize IndexedDB for caching:', error);
    }
  }

  // Main cache operations
  async get<T>(key: string, fallback?: () => Promise<T> | T): Promise<T | null> {
    this.stats.totalRequests++;

    try {
      // Try memory cache first
      if (this.config.storage.memory) {
        const memoryEntry = this.memoryCache.get(key);
        if (memoryEntry && this.isValid(memoryEntry)) {
          this.updateAccessStats(memoryEntry);
          this.stats.hits++;
          return this.deserializeData(memoryEntry.data);
        }
      }

      // Try localStorage
      if (this.config.storage.localStorage) {
        const localEntry = await this.getFromLocalStorage(key);
        if (localEntry && this.isValid(localEntry)) {
          // Copy to memory cache if enabled
          if (this.config.storage.memory) {
            this.memoryCache.set(key, localEntry);
          }
          this.updateAccessStats(localEntry);
          this.stats.hits++;
          return this.deserializeData(localEntry.data);
        }
      }

      // Try IndexedDB
      if (this.config.storage.indexedDB && this.db) {
        const dbEntry = await this.getFromIndexedDB(key);
        if (dbEntry && this.isValid(dbEntry)) {
          // Copy to higher priority caches
          if (this.config.storage.memory) {
            this.memoryCache.set(key, dbEntry);
          }
          if (this.config.storage.localStorage) {
            this.setInLocalStorage(key, dbEntry);
          }
          this.updateAccessStats(dbEntry);
          this.stats.hits++;
          return this.deserializeData(dbEntry.data);
        }
      }

      // Cache miss - try fallback
      this.stats.misses++;
      if (fallback) {
        const result = await fallback();
        // Don't cache null/undefined results
        if (result !== null && result !== undefined) {
          await this.set(key, result);
        }
        return result;
      }

      return null;
    } catch (error) {
      console.error('Cache get error:', error);
      this.stats.misses++;
      if (fallback) {
        return await fallback();
      }
      return null;
    } finally {
      this.updateStats();
    }
  }

  async set<T>(key: string, data: T, options: Partial<CacheStrategy> = {}): Promise<void> {
    const strategy: CacheStrategy = {
      key,
      ttl: options.ttl || this.config.maxAge,
      refreshThreshold: options.refreshThreshold || 0.1,
      staleWhileRevalidate: options.staleWhileRevalidate || false,
      tags: options.tags || [],
      priority: options.priority || 'medium',
      compression: options.compression !== undefined ? options.compression : this.config.compression.enabled
    };

    const entry: CacheEntry<T> = {
      key,
      data: await this.serializeData(data, strategy.compression),
      timestamp: Date.now(),
      expiresAt: Date.now() + strategy.ttl,
      accessCount: 0,
      lastAccessed: Date.now(),
      metadata: {
        version: '1.0',
        size: this.calculateSize(data),
        compressed: strategy.compression && this.shouldCompress(data),
        tags: strategy.tags,
        priority: strategy.priority
      }
    };

    try {
      // Store in memory cache
      if (this.config.storage.memory) {
        this.memoryCache.set(key, entry);
        this.enforceMemoryLimit();
      }

      // Store in localStorage
      if (this.config.storage.localStorage) {
        await this.setInLocalStorage(key, entry);
      }

      // Store in IndexedDB
      if (this.config.storage.indexedDB && this.db) {
        await this.setInIndexedDB(key, entry);
      }

      this.updateStats();
    } catch (error) {
      console.error('Cache set error:', error);
      throw error;
    }
  }

  async remove(key: string): Promise<void> {
    try {
      // Remove from memory
      if (this.config.storage.memory) {
        this.memoryCache.delete(key);
      }

      // Remove from localStorage
      if (this.config.storage.localStorage) {
        localStorage.removeItem(`lumina_cache_${key}`);
      }

      // Remove from IndexedDB
      if (this.config.storage.indexedDB && this.db) {
        const transaction = this.db.transaction(['cache'], 'readwrite');
        const store = transaction.objectStore('cache');
        await new Promise<void>((resolve, reject) => {
          const request = store.delete(key);
          request.onsuccess = () => resolve();
          request.onerror = () => reject(request.error);
        });
      }

      this.updateStats();
    } catch (error) {
      console.error('Cache remove error:', error);
      throw error;
    }
  }

  // Advanced cache operations
  async invalidateByTags(tags: string[]): Promise<void> {
    const keysToRemove: string[] = [];

    // Check memory cache
    if (this.config.storage.memory) {
      for (const [key, entry] of this.memoryCache.entries()) {
        if (entry.metadata.tags.some(tag => tags.includes(tag))) {
          keysToRemove.push(key);
        }
      }
    }

    // Check IndexedDB
    if (this.config.storage.indexedDB && this.db) {
      const transaction = this.db.transaction(['cache'], 'readonly');
      const store = transaction.objectStore('cache');
      const index = store.index('tags');
      
      for (const tag of tags) {
        const request = index.openCursor(IDBKeyRange.only(tag));
        await new Promise<void>((resolve) => {
          request.onsuccess = (event) => {
            const cursor = (event.target as IDBRequest).result;
            if (cursor) {
              keysToRemove.push(cursor.value.key);
              cursor.continue();
            } else {
              resolve();
            }
          };
        });
      }
    }

    // Remove all found keys
    for (const key of keysToRemove) {
      await this.remove(key);
    }
  }

  async clear(): Promise<void> {
    try {
      // Clear memory cache
      if (this.config.storage.memory) {
        this.memoryCache.clear();
      }

      // Clear localStorage
      if (this.config.storage.localStorage) {
        const keys = Object.keys(localStorage).filter(key => key.startsWith('lumina_cache_'));
        for (const key of keys) {
          localStorage.removeItem(key);
        }
      }

      // Clear IndexedDB
      if (this.config.storage.indexedDB && this.db) {
        const transaction = this.db.transaction(['cache'], 'readwrite');
        const store = transaction.objectStore('cache');
        await new Promise<void>((resolve, reject) => {
          const request = store.clear();
          request.onsuccess = () => resolve();
          request.onerror = () => reject(request.error);
        });
      }

      this.resetStats();
    } catch (error) {
      console.error('Cache clear error:', error);
      throw error;
    }
  }

  // Cache with refresh strategy
  async getWithRefresh<T>(
    key: string,
    fetchFunction: () => Promise<T>,
    strategy: CacheStrategy
  ): Promise<T> {
    const cached = await this.get<T>(key);
    
    if (cached !== null) {
      // Check if refresh is needed
      const entry = this.memoryCache.get(key) || await this.getFromIndexedDB(key);
      if (entry && this.shouldRefresh(entry, strategy)) {
        // Refresh in background if stale-while-revalidate
        if (strategy.staleWhileRevalidate && !this.refreshQueue.has(key)) {
          this.refreshQueue.add(key);
          this.backgroundRefresh(key, fetchFunction, strategy);
        }
      }
      return cached;
    }

    // Cache miss - fetch fresh data
    const fresh = await fetchFunction();
    await this.set(key, fresh, strategy);
    return fresh;
  }

  private async backgroundRefresh<T>(
    key: string,
    fetchFunction: () => Promise<T>,
    strategy: CacheStrategy
  ): Promise<void> {
    try {
      const fresh = await fetchFunction();
      await this.set(key, fresh, strategy);
    } catch (error) {
      console.error('Background refresh failed:', error);
    } finally {
      this.refreshQueue.delete(key);
    }
  }

  // Utility methods
  private isValid(entry: CacheEntry): boolean {
    return Date.now() < entry.expiresAt;
  }

  private shouldRefresh(entry: CacheEntry, strategy: CacheStrategy): boolean {
    if (!strategy.refreshThreshold) return false;
    
    const timeRemaining = entry.expiresAt - Date.now();
    const totalTtl = strategy.ttl;
    const remainingPercentage = timeRemaining / totalTtl;
    
    return remainingPercentage < strategy.refreshThreshold;
  }

  private shouldCompress(data: any): boolean {
    return this.calculateSize(data) > this.config.compression.threshold;
  }

  private calculateSize(data: any): number {
    return new Blob([JSON.stringify(data)]).size;
  }

  private async serializeData(data: any, compress: boolean): Promise<string> {
    const serialized = JSON.stringify(data);
    
    if (compress && this.shouldCompress(data) && 'CompressionStream' in window) {
      try {
        const stream = new CompressionStream('gzip');
        const writer = stream.writable.getWriter();
        const reader = stream.readable.getReader();
        
        writer.write(new TextEncoder().encode(serialized));
        writer.close();
        
        const chunks: Uint8Array[] = [];
        let done = false;
        
        while (!done) {
          const { value, done: readerDone } = await reader.read();
          done = readerDone;
          if (value) chunks.push(value);
        }
        
        const compressed = new Uint8Array(chunks.reduce((acc, chunk) => acc + chunk.length, 0));
        let offset = 0;
        for (const chunk of chunks) {
          compressed.set(chunk, offset);
          offset += chunk.length;
        }
        
        return btoa(String.fromCharCode(...compressed));
      } catch (error) {
        console.warn('Compression failed, storing uncompressed:', error);
        return serialized;
      }
    }
    
    return serialized;
  }

  private deserializeData(data: string): any {
    try {
      // Try to detect if data is compressed (base64 encoded)
      if (data.includes('=') && data.length % 4 === 0) {
        try {
          const compressed = Uint8Array.from(atob(data), c => c.charCodeAt(0));
          
          if ('DecompressionStream' in window) {
            const stream = new DecompressionStream('gzip');
            const writer = stream.writable.getWriter();
            const reader = stream.readable.getReader();
            
            writer.write(compressed);
            writer.close();
            
            const chunks: Uint8Array[] = [];
            let done = false;
            
            while (!done) {
              const { value, done: readerDone } = reader.read();
              done = readerDone;
              if (value) chunks.push(value);
            }
            
            const decompressed = new Uint8Array(chunks.reduce((acc, chunk) => acc + chunk.length, 0));
            let offset = 0;
            for (const chunk of chunks) {
              decompressed.set(chunk, offset);
              offset += chunk.length;
            }
            
            const decoded = new TextDecoder().decode(decompressed);
            return JSON.parse(decoded);
          }
        } catch (error) {
          // Not compressed or decompression failed, try regular JSON parse
        }
      }
      
      return JSON.parse(data);
    } catch (error) {
      console.error('Data deserialization failed:', error);
      return null;
    }
  }

  private updateAccessStats(entry: CacheEntry): void {
    entry.accessCount++;
    entry.lastAccessed = Date.now();
  }

  private updateStats(): void {
    this.stats.hitRate = this.stats.totalRequests > 0 ? 
      (this.stats.hits / this.stats.totalRequests) * 100 : 0;
    
    this.stats.entryCount = this.memoryCache.size;
    this.stats.memoryUsage = Array.from(this.memoryCache.values())
      .reduce((total, entry) => total + entry.metadata.size, 0);
    
    this.stats.averageSize = this.stats.entryCount > 0 ? 
      this.stats.memoryUsage / this.stats.entryCount : 0;
  }

  private resetStats(): void {
    this.stats = {
      hits: 0,
      misses: 0,
      totalRequests: 0,
      hitRate: 0,
      memoryUsage: 0,
      entryCount: 0,
      averageSize: 0,
      lastCleanup: Date.now()
    };
  }

  private async getFromLocalStorage(key: string): Promise<CacheEntry | null> {
    try {
      const stored = localStorage.getItem(`lumina_cache_${key}`);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (error) {
      console.error('localStorage get error:', error);
    }
    return null;
  }

  private async setInLocalStorage(key: string, entry: CacheEntry): Promise<void> {
    try {
      localStorage.setItem(`lumina_cache_${key}`, JSON.stringify(entry));
    } catch (error) {
      console.error('localStorage set error:', error);
      // localStorage might be full, try to clean up
      this.cleanupLocalStorage();
    }
  }

  private async getFromIndexedDB(key: string): Promise<CacheEntry | null> {
    if (!this.db) return null;

    try {
      const transaction = this.db.transaction(['cache'], 'readonly');
      const store = transaction.objectStore('cache');
      
      return new Promise<CacheEntry | null>((resolve, reject) => {
        const request = store.get(key);
        request.onsuccess = () => resolve(request.result || null);
        request.onerror = () => reject(request.error);
      });
    } catch (error) {
      console.error('IndexedDB get error:', error);
      return null;
    }
  }

  private async setInIndexedDB(key: string, entry: CacheEntry): Promise<void> {
    if (!this.db) return;

    try {
      const transaction = this.db.transaction(['cache'], 'readwrite');
      const store = transaction.objectStore('cache');
      
      await new Promise<void>((resolve, reject) => {
        const request = store.put(entry);
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });
    } catch (error) {
      console.error('IndexedDB set error:', error);
    }
  }

  private enforceMemoryLimit(): void {
    if (this.stats.memoryUsage <= this.config.maxSize) return;

    const entries = Array.from(this.memoryCache.entries());
    
    // Sort by eviction policy
    switch (this.config.evictionPolicy) {
      case 'lru':
        entries.sort(([,a], [,b]) => a.lastAccessed - b.lastAccessed);
        break;
      case 'lfu':
        entries.sort(([,a], [,b]) => a.accessCount - b.accessCount);
        break;
      case 'fifo':
        entries.sort(([,a], [,b]) => a.timestamp - b.timestamp);
        break;
      case 'ttl':
        entries.sort(([,a], [,b]) => a.expiresAt - b.expiresAt);
        break;
    }

    // Remove entries until under limit
    while (this.stats.memoryUsage > this.config.maxSize && entries.length > 0) {
      const [key] = entries.shift()!;
      this.memoryCache.delete(key);
      this.updateStats();
    }
  }

  private startCleanupTimer(): void {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
    }

    this.cleanupTimer = setInterval(() => {
      this.cleanup();
    }, this.config.cleanupInterval);
  }

  private async cleanup(): Promise<void> {
    const now = Date.now();
    
    // Clean memory cache
    if (this.config.storage.memory) {
      for (const [key, entry] of this.memoryCache.entries()) {
        if (now >= entry.expiresAt) {
          this.memoryCache.delete(key);
        }
      }
    }

    // Clean localStorage
    if (this.config.storage.localStorage) {
      this.cleanupLocalStorage();
    }

    // Clean IndexedDB
    if (this.config.storage.indexedDB && this.db) {
      await this.cleanupIndexedDB();
    }

    this.stats.lastCleanup = now;
    this.updateStats();
  }

  private cleanupLocalStorage(): void {
    const keys = Object.keys(localStorage).filter(key => key.startsWith('lumina_cache_'));
    
    for (const key of keys) {
      try {
        const entry = JSON.parse(localStorage.getItem(key)!);
        if (Date.now() >= entry.expiresAt) {
          localStorage.removeItem(key);
        }
      } catch (error) {
        // Invalid entry, remove it
        localStorage.removeItem(key);
      }
    }
  }

  private async cleanupIndexedDB(): Promise<void> {
    if (!this.db) return;

    try {
      const transaction = this.db.transaction(['cache'], 'readwrite');
      const store = transaction.objectStore('cache');
      const index = store.index('expiresAt');
      
      const now = Date.now();
      const range = IDBKeyRange.upperBound(now);
      
      await new Promise<void>((resolve, reject) => {
        const request = index.openCursor(range);
        request.onsuccess = (event) => {
          const cursor = (event.target as IDBRequest).result;
          if (cursor) {
            cursor.delete();
            cursor.continue();
          } else {
            resolve();
          }
        };
        request.onerror = () => reject(request.error);
      });
    } catch (error) {
      console.error('IndexedDB cleanup error:', error);
    }
  }

  private loadStatsFromStorage(): void {
    try {
      const stored = localStorage.getItem('lumina_cache_stats');
      if (stored) {
        const storedStats = JSON.parse(stored);
        this.stats = { ...this.stats, ...storedStats };
      }
    } catch (error) {
      console.error('Failed to load cache stats:', error);
    }
  }

  private saveStatsToStorage(): void {
    try {
      localStorage.setItem('lumina_cache_stats', JSON.stringify(this.stats));
    } catch (error) {
      console.error('Failed to save cache stats:', error);
    }
  }

  // Public API methods
  getStats(): CacheStats {
    return { ...this.stats };
  }

  getConfig(): CacheConfig {
    return { ...this.config };
  }

  updateConfig(newConfig: Partial<CacheConfig>): void {
    this.config = { ...this.config, ...newConfig };
    
    // Restart cleanup timer if interval changed
    if (newConfig.cleanupInterval) {
      this.startCleanupTimer();
    }
    
    // Enforce new memory limit
    if (newConfig.maxSize) {
      this.enforceMemoryLimit();
    }
  }

  // Specialized cache methods for common use cases
  async cacheApiCall<T>(
    key: string,
    apiCall: () => Promise<T>,
    ttl: number = 5 * 60 * 1000 // 5 minutes default
  ): Promise<T> {
    return this.getWithRefresh(key, apiCall, {
      key,
      ttl,
      refreshThreshold: 0.2,
      staleWhileRevalidate: true,
      tags: ['api'],
      priority: 'high'
    });
  }

  async cacheComputation<T>(
    key: string,
    computation: () => Promise<T> | T,
    ttl: number = 60 * 60 * 1000 // 1 hour default
  ): Promise<T> {
    return this.getWithRefresh(key, 
      async () => await computation(),
      {
        key,
        ttl,
        tags: ['computation'],
        priority: 'medium',
        compression: true
      }
    );
  }

  async cacheUserSession<T>(
    key: string,
    data: T,
    ttl: number = 24 * 60 * 60 * 1000 // 24 hours default
  ): Promise<void> {
    await this.set(key, data, {
      key,
      ttl,
      tags: ['session'],
      priority: 'critical'
    });
  }
}

// Export singleton instance
export const cache = CachingLayer.getInstance();

// Common cache strategies
export const CacheStrategies = {
  API_CALL: (ttl: number = 5 * 60 * 1000) => ({
    ttl,
    refreshThreshold: 0.2,
    staleWhileRevalidate: true,
    tags: ['api'],
    priority: 'high' as const
  }),
  
  COMPUTATION: (ttl: number = 60 * 60 * 1000) => ({
    ttl,
    tags: ['computation'],
    priority: 'medium' as const,
    compression: true
  }),
  
  USER_DATA: (ttl: number = 24 * 60 * 60 * 1000) => ({
    ttl,
    tags: ['user'],
    priority: 'critical' as const
  }),
  
  STATIC_CONTENT: (ttl: number = 7 * 24 * 60 * 60 * 1000) => ({
    ttl,
    tags: ['static'],
    priority: 'low' as const,
    compression: true
  })
}; 
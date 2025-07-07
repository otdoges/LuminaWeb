interface AnalysisSnapshot {
  id: string;
  url: string;
  timestamp: number;
  metrics: {
    performance: {
      score: number;
      loadTime: number;
      pageSize: number;
      firstContentfulPaint?: number;
      largestContentfulPaint?: number;
      totalBlockingTime?: number;
      cumulativeLayoutShift?: number;
    };
    seo: {
      score: number;
      title: string;
      description: string;
      keywords: string[];
      headings: { h1: number; h2: number; h3: number; h4: number; h5: number; h6: number };
      metaTags: number;
      imageAlt: number;
      internalLinks: number;
      externalLinks: number;
      canonicalUrl?: string;
      structuredData: number;
    };
    accessibility: {
      score: number;
      issues: string[];
      altTextMissing: number;
      contrastIssues: number;
      keyboardNavigable: boolean;
      ariaLabels: number;
    };
    security: {
      score: number;
      httpsEnabled: boolean;
      securityHeaders: string[];
      vulnerabilities: string[];
      sslGrade?: string;
    };
    mobile: {
      score: number;
      responsive: boolean;
      viewportConfigured: boolean;
      touchTargetsSize: number;
      mobileSpeed: number;
    };
    content: {
      score: number;
      wordCount: number;
      readabilityScore: number;
      language: string;
      duplicateContent: number;
      brokenLinks: number;
      images: { total: number; optimized: number; unoptimized: number };
    };
  };
  screenshot?: string;
  aiInsights?: {
    summary: string;
    recommendations: string[];
    sentiment: 'positive' | 'neutral' | 'negative';
    competitiveAdvantages: string[];
  };
  metadata: {
    analysisVersion: string;
    userAgent: string;
    deviceType: 'desktop' | 'mobile' | 'tablet';
    location?: string;
    tags?: string[];
  };
}

interface TrendAnalysis {
  url: string;
  period: {
    start: number;
    end: number;
  };
  trends: {
    performance: {
      direction: 'up' | 'down' | 'stable';
      change: number;
      trend: Array<{ date: number; value: number }>;
    };
    seo: {
      direction: 'up' | 'down' | 'stable';
      change: number;
      trend: Array<{ date: number; value: number }>;
    };
    accessibility: {
      direction: 'up' | 'down' | 'stable';
      change: number;
      trend: Array<{ date: number; value: number }>;
    };
    security: {
      direction: 'up' | 'down' | 'stable';
      change: number;
      trend: Array<{ date: number; value: number }>;
    };
    mobile: {
      direction: 'up' | 'down' | 'stable';
      change: number;
      trend: Array<{ date: number; value: number }>;
    };
    content: {
      direction: 'up' | 'down' | 'stable';
      change: number;
      trend: Array<{ date: number; value: number }>;
    };
  };
  insights: {
    bestPerformingPeriod: { start: number; end: number; avgScore: number };
    worstPerformingPeriod: { start: number; end: number; avgScore: number };
    significantChanges: Array<{
      date: number;
      metric: string;
      change: number;
      description: string;
    }>;
    recommendations: string[];
  };
}

interface ComparisonResult {
  baseline: AnalysisSnapshot;
  current: AnalysisSnapshot;
  improvements: Array<{
    metric: string;
    change: number;
    description: string;
    impact: 'high' | 'medium' | 'low';
  }>;
  regressions: Array<{
    metric: string;
    change: number;
    description: string;
    impact: 'high' | 'medium' | 'low';
  }>;
  overallScore: {
    baseline: number;
    current: number;
    change: number;
  };
}

export class HistoricalDataTracker {
  private static instance: HistoricalDataTracker;
  private readonly storageKey = 'lumina_historical_data';
  private readonly maxSnapshots = 1000; // Maximum snapshots to store
  private readonly dbName = 'LuminaAnalytics';
  private readonly dbVersion = 1;
  private db: IDBDatabase | null = null;

  public static getInstance(): HistoricalDataTracker {
    if (!HistoricalDataTracker.instance) {
      HistoricalDataTracker.instance = new HistoricalDataTracker();
    }
    return HistoricalDataTracker.instance;
  }

  constructor() {
    this.initializeDB();
  }

  private async initializeDB(): Promise<void> {
    if (!('indexedDB' in window)) {
      console.warn('IndexedDB not supported, falling back to localStorage');
      return;
    }

    try {
      this.db = await new Promise<IDBDatabase>((resolve, reject) => {
        const request = indexedDB.open(this.dbName, this.dbVersion);
        
        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve(request.result);
        
        request.onupgradeneeded = (event) => {
          const db = (event.target as IDBOpenDBRequest).result;
          
          // Create object stores
          if (!db.objectStoreNames.contains('snapshots')) {
            const snapshotStore = db.createObjectStore('snapshots', { keyPath: 'id' });
            snapshotStore.createIndex('url', 'url', { unique: false });
            snapshotStore.createIndex('timestamp', 'timestamp', { unique: false });
            snapshotStore.createIndex('url_timestamp', ['url', 'timestamp'], { unique: false });
          }
          
          if (!db.objectStoreNames.contains('trends')) {
            const trendsStore = db.createObjectStore('trends', { keyPath: 'url' });
            trendsStore.createIndex('lastUpdated', 'lastUpdated', { unique: false });
          }
        };
      });
    } catch (error) {
      console.error('Failed to initialize IndexedDB:', error);
    }
  }

  // Store analysis snapshot
  async storeSnapshot(snapshot: Omit<AnalysisSnapshot, 'id' | 'timestamp'>): Promise<string> {
    const fullSnapshot: AnalysisSnapshot = {
      ...snapshot,
      id: this.generateId(),
      timestamp: Date.now(),
      metadata: {
        ...snapshot.metadata,
        analysisVersion: '1.0.0',
        userAgent: navigator.userAgent,
      }
    };

    try {
      if (this.db) {
        await this.storeInIndexedDB(fullSnapshot);
      } else {
        await this.storeInLocalStorage(fullSnapshot);
      }
      
      // Update trends asynchronously
      this.updateTrends(fullSnapshot.url);
      
      return fullSnapshot.id;
    } catch (error) {
      console.error('Failed to store snapshot:', error);
      throw new Error('Failed to store analysis snapshot');
    }
  }

  private async storeInIndexedDB(snapshot: AnalysisSnapshot): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    const transaction = this.db.transaction(['snapshots'], 'readwrite');
    const store = transaction.objectStore('snapshots');
    
    await new Promise<void>((resolve, reject) => {
      const request = store.add(snapshot);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });

    // Clean up old snapshots
    await this.cleanupOldSnapshots();
  }

  private async storeInLocalStorage(snapshot: AnalysisSnapshot): Promise<void> {
    try {
      const existing = this.getFromLocalStorage();
      existing.push(snapshot);
      
      // Sort by timestamp
      existing.sort((a, b) => b.timestamp - a.timestamp);
      
      // Keep only the latest snapshots
      if (existing.length > this.maxSnapshots) {
        existing.splice(this.maxSnapshots);
      }
      
      localStorage.setItem(this.storageKey, JSON.stringify(existing));
    } catch (error) {
      console.error('LocalStorage error:', error);
      throw error;
    }
  }

  private getFromLocalStorage(): AnalysisSnapshot[] {
    try {
      const stored = localStorage.getItem(this.storageKey);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Failed to parse localStorage data:', error);
      return [];
    }
  }

  // Retrieve snapshots for a URL
  async getSnapshots(url: string, limit?: number, offset?: number): Promise<AnalysisSnapshot[]> {
    try {
      if (this.db) {
        return await this.getFromIndexedDB(url, limit, offset);
      } else {
        return this.getFromLocalStorageByUrl(url, limit, offset);
      }
    } catch (error) {
      console.error('Failed to retrieve snapshots:', error);
      return [];
    }
  }

  private async getFromIndexedDB(url: string, limit?: number, offset?: number): Promise<AnalysisSnapshot[]> {
    if (!this.db) return [];

    const transaction = this.db.transaction(['snapshots'], 'readonly');
    const store = transaction.objectStore('snapshots');
    const index = store.index('url_timestamp');
    
    const snapshots: AnalysisSnapshot[] = [];
    const range = IDBKeyRange.bound([url, 0], [url, Date.now()]);
    
    await new Promise<void>((resolve, reject) => {
      const request = index.openCursor(range, 'prev'); // Most recent first
      let count = 0;
      let skipped = 0;
      
      request.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest).result;
        if (cursor) {
          if (offset && skipped < offset) {
            skipped++;
            cursor.continue();
            return;
          }
          
          if (!limit || count < limit) {
            snapshots.push(cursor.value);
            count++;
            cursor.continue();
          } else {
            resolve();
          }
        } else {
          resolve();
        }
      };
      
      request.onerror = () => reject(request.error);
    });

    return snapshots;
  }

  private getFromLocalStorageByUrl(url: string, limit?: number, offset?: number): AnalysisSnapshot[] {
    const allSnapshots = this.getFromLocalStorage();
    const urlSnapshots = allSnapshots.filter(s => s.url === url);
    
    const startIndex = offset || 0;
    const endIndex = limit ? startIndex + limit : urlSnapshots.length;
    
    return urlSnapshots.slice(startIndex, endIndex);
  }

  // Get trend analysis for a URL
  async getTrendAnalysis(url: string, periodDays: number = 30): Promise<TrendAnalysis | null> {
    try {
      const endTime = Date.now();
      const startTime = endTime - (periodDays * 24 * 60 * 60 * 1000);
      
      const snapshots = await this.getSnapshots(url);
      const periodSnapshots = snapshots.filter(s => s.timestamp >= startTime);
      
      if (periodSnapshots.length < 2) {
        return null; // Not enough data for trend analysis
      }

      return this.calculateTrends(periodSnapshots, startTime, endTime);
    } catch (error) {
      console.error('Failed to calculate trends:', error);
      return null;
    }
  }

  private calculateTrends(snapshots: AnalysisSnapshot[], startTime: number, endTime: number): TrendAnalysis {
    const url = snapshots[0].url;
    const metrics = ['performance', 'seo', 'accessibility', 'security', 'mobile', 'content'] as const;
    
    const trends: TrendAnalysis['trends'] = {} as any;
    
    for (const metric of metrics) {
      const values = snapshots.map(s => ({
        date: s.timestamp,
        value: s.metrics[metric].score
      })).sort((a, b) => a.date - b.date);
      
      const firstValue = values[0]?.value || 0;
      const lastValue = values[values.length - 1]?.value || 0;
      const change = lastValue - firstValue;
      
      let direction: 'up' | 'down' | 'stable' = 'stable';
      if (Math.abs(change) > 2) { // Significant change threshold
        direction = change > 0 ? 'up' : 'down';
      }
      
      trends[metric] = {
        direction,
        change,
        trend: values
      };
    }

    // Calculate insights
    const insights = this.calculateInsights(snapshots, trends);

    return {
      url,
      period: { start: startTime, end: endTime },
      trends,
      insights
    };
  }

  private calculateInsights(snapshots: AnalysisSnapshot[], trends: TrendAnalysis['trends']): TrendAnalysis['insights'] {
    // Calculate overall scores for each snapshot
    const snapshotsWithScores = snapshots.map(s => ({
      ...s,
      overallScore: this.calculateOverallScore(s)
    }));

    // Find best and worst performing periods
    const sortedByScore = [...snapshotsWithScores].sort((a, b) => b.overallScore - a.overallScore);
    const bestSnapshot = sortedByScore[0];
    const worstSnapshot = sortedByScore[sortedByScore.length - 1];

    // Detect significant changes
    const significantChanges: TrendAnalysis['insights']['significantChanges'] = [];
    
    for (const [metric, trend] of Object.entries(trends)) {
      if (Math.abs(trend.change) > 5) { // Significant change threshold
        significantChanges.push({
          date: trend.trend[trend.trend.length - 1].date,
          metric,
          change: trend.change,
          description: `${metric} ${trend.direction === 'up' ? 'improved' : 'declined'} by ${Math.abs(trend.change).toFixed(1)} points`
        });
      }
    }

    // Generate recommendations
    const recommendations = this.generateRecommendations(trends, significantChanges);

    return {
      bestPerformingPeriod: {
        start: bestSnapshot.timestamp,
        end: bestSnapshot.timestamp,
        avgScore: bestSnapshot.overallScore
      },
      worstPerformingPeriod: {
        start: worstSnapshot.timestamp,
        end: worstSnapshot.timestamp,
        avgScore: worstSnapshot.overallScore
      },
      significantChanges,
      recommendations
    };
  }

  private calculateOverallScore(snapshot: AnalysisSnapshot): number {
    const scores = [
      snapshot.metrics.performance.score,
      snapshot.metrics.seo.score,
      snapshot.metrics.accessibility.score,
      snapshot.metrics.security.score,
      snapshot.metrics.mobile.score,
      snapshot.metrics.content.score
    ];
    
    return scores.reduce((sum, score) => sum + score, 0) / scores.length;
  }

  private generateRecommendations(trends: TrendAnalysis['trends'], significantChanges: TrendAnalysis['insights']['significantChanges']): string[] {
    const recommendations: string[] = [];
    
    // Recommendations based on trends
    for (const [metric, trend] of Object.entries(trends)) {
      if (trend.direction === 'down' && Math.abs(trend.change) > 5) {
        switch (metric) {
          case 'performance':
            recommendations.push('Consider optimizing images and reducing JavaScript bundle size to improve performance');
            break;
          case 'seo':
            recommendations.push('Review and optimize meta tags, heading structure, and internal linking');
            break;
          case 'accessibility':
            recommendations.push('Audit accessibility issues and ensure proper ARIA labels and keyboard navigation');
            break;
          case 'security':
            recommendations.push('Update security headers and address any identified vulnerabilities');
            break;
          case 'mobile':
            recommendations.push('Improve mobile responsiveness and touch target sizes');
            break;
          case 'content':
            recommendations.push('Review content quality and fix any broken links or duplicate content');
            break;
        }
      }
    }

    // Add general recommendations
    if (significantChanges.length > 3) {
      recommendations.push('Multiple metrics have changed significantly - consider a comprehensive audit');
    }

    return recommendations;
  }

  // Compare two snapshots
  async compareSnapshots(baselineId: string, currentId: string): Promise<ComparisonResult | null> {
    try {
      const [baseline, current] = await Promise.all([
        this.getSnapshotById(baselineId),
        this.getSnapshotById(currentId)
      ]);

      if (!baseline || !current) {
        return null;
      }

      return this.performComparison(baseline, current);
    } catch (error) {
      console.error('Failed to compare snapshots:', error);
      return null;
    }
  }

  private async getSnapshotById(id: string): Promise<AnalysisSnapshot | null> {
    if (this.db) {
      const transaction = this.db.transaction(['snapshots'], 'readonly');
      const store = transaction.objectStore('snapshots');
      
      return new Promise<AnalysisSnapshot | null>((resolve, reject) => {
        const request = store.get(id);
        request.onsuccess = () => resolve(request.result || null);
        request.onerror = () => reject(request.error);
      });
    } else {
      const snapshots = this.getFromLocalStorage();
      return snapshots.find(s => s.id === id) || null;
    }
  }

  private performComparison(baseline: AnalysisSnapshot, current: AnalysisSnapshot): ComparisonResult {
    const improvements: ComparisonResult['improvements'] = [];
    const regressions: ComparisonResult['regressions'] = [];
    
    const metrics = ['performance', 'seo', 'accessibility', 'security', 'mobile', 'content'] as const;
    
    for (const metric of metrics) {
      const baselineScore = baseline.metrics[metric].score;
      const currentScore = current.metrics[metric].score;
      const change = currentScore - baselineScore;
      
      if (Math.abs(change) > 1) { // Significant change threshold
        const impact = Math.abs(change) > 10 ? 'high' : Math.abs(change) > 5 ? 'medium' : 'low';
        const description = `${metric} score ${change > 0 ? 'improved' : 'declined'} by ${Math.abs(change).toFixed(1)} points`;
        
        if (change > 0) {
          improvements.push({ metric, change, description, impact });
        } else {
          regressions.push({ metric, change, description, impact });
        }
      }
    }

    const baselineOverall = this.calculateOverallScore(baseline);
    const currentOverall = this.calculateOverallScore(current);
    
    return {
      baseline,
      current,
      improvements,
      regressions,
      overallScore: {
        baseline: baselineOverall,
        current: currentOverall,
        change: currentOverall - baselineOverall
      }
    };
  }

  // Clean up old snapshots
  private async cleanupOldSnapshots(): Promise<void> {
    if (!this.db) return;

    const transaction = this.db.transaction(['snapshots'], 'readwrite');
    const store = transaction.objectStore('snapshots');
    
    // Get total count
    const countRequest = store.count();
    const totalCount = await new Promise<number>((resolve, reject) => {
      countRequest.onsuccess = () => resolve(countRequest.result);
      countRequest.onerror = () => reject(countRequest.error);
    });

    if (totalCount > this.maxSnapshots) {
      const deleteCount = totalCount - this.maxSnapshots;
      const index = store.index('timestamp');
      
      // Delete oldest snapshots
      const cursor = index.openCursor();
      let deletedCount = 0;
      
      await new Promise<void>((resolve, reject) => {
        cursor.onsuccess = (event) => {
          const cursor = (event.target as IDBRequest).result;
          if (cursor && deletedCount < deleteCount) {
            cursor.delete();
            deletedCount++;
            cursor.continue();
          } else {
            resolve();
          }
        };
        cursor.onerror = () => reject(cursor.error);
      });
    }
  }

  // Update trends cache
  private async updateTrends(url: string): Promise<void> {
    try {
      const trendAnalysis = await this.getTrendAnalysis(url);
      if (trendAnalysis && this.db) {
        const transaction = this.db.transaction(['trends'], 'readwrite');
        const store = transaction.objectStore('trends');
        
        const trendData = {
          url,
          ...trendAnalysis,
          lastUpdated: Date.now()
        };
        
        await new Promise<void>((resolve, reject) => {
          const request = store.put(trendData);
          request.onsuccess = () => resolve();
          request.onerror = () => reject(request.error);
        });
      }
    } catch (error) {
      console.error('Failed to update trends cache:', error);
    }
  }

  // Get all tracked URLs
  async getTrackedUrls(): Promise<string[]> {
    try {
      if (this.db) {
        const transaction = this.db.transaction(['snapshots'], 'readonly');
        const store = transaction.objectStore('snapshots');
        const index = store.index('url');
        
        const urls: string[] = [];
        
        await new Promise<void>((resolve, reject) => {
          const request = index.openKeyCursor(null, 'nextunique');
          request.onsuccess = (event) => {
            const cursor = (event.target as IDBRequest).result;
            if (cursor) {
              urls.push(cursor.key as string);
              cursor.continue();
            } else {
              resolve();
            }
          };
          request.onerror = () => reject(request.error);
        });
        
        return urls;
      } else {
        const snapshots = this.getFromLocalStorage();
        return [...new Set(snapshots.map(s => s.url))];
      }
    } catch (error) {
      console.error('Failed to get tracked URLs:', error);
      return [];
    }
  }

  // Generate unique ID
  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  // Export data
  async exportData(format: 'json' | 'csv' = 'json'): Promise<string> {
    try {
      const urls = await this.getTrackedUrls();
      const allData: any = {};
      
      for (const url of urls) {
        const snapshots = await this.getSnapshots(url);
        const trends = await this.getTrendAnalysis(url);
        
        allData[url] = {
          snapshots,
          trends,
          summary: {
            totalSnapshots: snapshots.length,
            firstSnapshot: snapshots[snapshots.length - 1]?.timestamp,
            lastSnapshot: snapshots[0]?.timestamp,
            avgScore: snapshots.length > 0 ? 
              snapshots.reduce((sum, s) => sum + this.calculateOverallScore(s), 0) / snapshots.length : 0
          }
        };
      }
      
      if (format === 'json') {
        return JSON.stringify(allData, null, 2);
      } else {
        return this.convertToCSV(allData);
      }
    } catch (error) {
      console.error('Failed to export data:', error);
      throw new Error('Failed to export historical data');
    }
  }

  private convertToCSV(data: any): string {
    const headers = [
      'URL', 'Timestamp', 'Performance', 'SEO', 'Accessibility', 'Security', 'Mobile', 'Content', 'Overall'
    ];
    
    const rows = [headers.join(',')];
    
    for (const [url, urlData] of Object.entries(data)) {
      const snapshots = (urlData as any).snapshots;
      
      for (const snapshot of snapshots) {
        const row = [
          url,
          new Date(snapshot.timestamp).toISOString(),
          snapshot.metrics.performance.score,
          snapshot.metrics.seo.score,
          snapshot.metrics.accessibility.score,
          snapshot.metrics.security.score,
          snapshot.metrics.mobile.score,
          snapshot.metrics.content.score,
          this.calculateOverallScore(snapshot).toFixed(2)
        ];
        
        rows.push(row.join(','));
      }
    }
    
    return rows.join('\n');
  }
}

// Export singleton instance
export const historicalDataTracker = HistoricalDataTracker.getInstance();

// Helper functions
export const HistoricalDataHelpers = {
  // Format timestamp for display
  formatTimestamp(timestamp: number): string {
    return new Date(timestamp).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  },

  // Calculate percentage change
  calculatePercentageChange(oldValue: number, newValue: number): number {
    if (oldValue === 0) return newValue > 0 ? 100 : 0;
    return ((newValue - oldValue) / oldValue) * 100;
  },

  // Get trend direction emoji
  getTrendEmoji(direction: 'up' | 'down' | 'stable'): string {
    switch (direction) {
      case 'up': return '📈';
      case 'down': return '📉';
      case 'stable': return '➡️';
      default: return '➡️';
    }
  },

  // Color code for score
  getScoreColor(score: number): string {
    if (score >= 90) return 'text-green-600';
    if (score >= 70) return 'text-yellow-600';
    if (score >= 50) return 'text-orange-600';
    return 'text-red-600';
  }
}; 
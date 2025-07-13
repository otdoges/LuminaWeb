// Plausible Analytics Service
// This service handles fetching analytics data from your self-hosted Plausible instance

export interface PlausibleMetrics {
  visitors: {
    value: number;
    change: number;
  };
  pageviews: {
    value: number;
    change: number;
  };
  bounceRate: {
    value: number;
    change: number;
  };
  visitDuration: {
    value: number;
    change: number;
  };
}

export interface PlausibleTimeseriesData {
  date: string;
  visitors: number;
  pageviews: number;
  bounceRate: number;
  visitDuration: number;
}

export interface PlausibleTopPages {
  page: string;
  visitors: number;
  pageviews: number;
  bounceRate: number;
}

export interface PlausibleTopSources {
  source: string;
  visitors: number;
  percentage: number;
}

export interface PlausibleDeviceData {
  device: string;
  visitors: number;
  percentage: number;
}

class PlausibleAnalyticsService {
  private baseUrl: string;
  private domain: string;
  private apiKey?: string;

  constructor() {
    this.baseUrl = 'http://192.168.1.101:8000';
    this.domain = 'luminaweb.app';
    // Note: For the Stats API, you might need to set up an API key in your Plausible instance
    this.apiKey = import.meta.env.VITE_PLAUSIBLE_API_KEY;
  }

  private async fetchPlausibleData(endpoint: string, params: Record<string, string> = {}) {
    const url = new URL(`${this.baseUrl}/api/v1/stats/${endpoint}`);
    url.searchParams.append('site_id', this.domain);
    
    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.append(key, value);
    });

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (this.apiKey) {
      headers['Authorization'] = `Bearer ${this.apiKey}`;
    }

    try {
      const response = await fetch(url.toString(), {
        method: 'GET',
        headers,
      });

      if (!response.ok) {
        throw new Error(`Plausible API error: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching Plausible data:', error);
      // Return mock data for development
      return this.getMockData(endpoint);
    }
  }

  private getMockData(endpoint: string) {
    // Mock data for development/testing
    const mockData = {
      aggregate: {
        results: {
          visitors: { value: 2847 },
          pageviews: { value: 8234 },
          bounce_rate: { value: 24 },
          visit_duration: { value: 222 }
        }
      },
      timeseries: {
        results: Array.from({ length: 30 }, (_, i) => ({
          date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          visitors: Math.floor(Math.random() * 500) + 100,
          pageviews: Math.floor(Math.random() * 1200) + 300,
          bounce_rate: Math.floor(Math.random() * 30) + 20,
          visit_duration: Math.floor(Math.random() * 180) + 120
        }))
      },
      breakdown: {
        results: [
          { page: '/', visitors: 1234, pageviews: 2345, bounce_rate: 22 },
          { page: '/dashboard', visitors: 867, pageviews: 1543, bounce_rate: 18 },
          { page: '/analysis', visitors: 456, pageviews: 789, bounce_rate: 25 },
          { page: '/settings', visitors: 234, pageviews: 345, bounce_rate: 30 }
        ]
      }
    };

    return mockData[endpoint as keyof typeof mockData] || mockData.aggregate;
  }

  // Get current period metrics
  async getCurrentMetrics(period: string = '30d'): Promise<PlausibleMetrics> {
    const data = await this.fetchPlausibleData('aggregate', {
      period,
      metrics: 'visitors,pageviews,bounce_rate,visit_duration'
    });

    // Get comparison data for previous period
    const comparisonData = await this.fetchPlausibleData('aggregate', {
      period,
      metrics: 'visitors,pageviews,bounce_rate,visit_duration',
      compare: 'previous_period'
    });

    return {
      visitors: {
        value: data.results?.visitors?.value || 0,
        change: this.calculateChange(data.results?.visitors?.value, comparisonData.results?.visitors?.value)
      },
      pageviews: {
        value: data.results?.pageviews?.value || 0,
        change: this.calculateChange(data.results?.pageviews?.value, comparisonData.results?.pageviews?.value)
      },
      bounceRate: {
        value: data.results?.bounce_rate?.value || 0,
        change: this.calculateChange(data.results?.bounce_rate?.value, comparisonData.results?.bounce_rate?.value)
      },
      visitDuration: {
        value: data.results?.visit_duration?.value || 0,
        change: this.calculateChange(data.results?.visit_duration?.value, comparisonData.results?.visit_duration?.value)
      }
    };
  }

  // Get timeseries data for charts
  async getTimeseriesData(period: string = '30d'): Promise<PlausibleTimeseriesData[]> {
    const data = await this.fetchPlausibleData('timeseries', {
      period,
      metrics: 'visitors,pageviews,bounce_rate,visit_duration'
    });

    return data.results?.map((item: any) => ({
      date: item.date,
      visitors: item.visitors || 0,
      pageviews: item.pageviews || 0,
      bounceRate: item.bounce_rate || 0,
      visitDuration: item.visit_duration || 0
    })) || [];
  }

  // Get top pages
  async getTopPages(period: string = '30d'): Promise<PlausibleTopPages[]> {
    const data = await this.fetchPlausibleData('breakdown', {
      period,
      property: 'page',
      metrics: 'visitors,pageviews,bounce_rate'
    });

    return data.results?.map((item: any) => ({
      page: item.page,
      visitors: item.visitors || 0,
      pageviews: item.pageviews || 0,
      bounceRate: item.bounce_rate || 0
    })) || [];
  }

  // Get top sources
  async getTopSources(period: string = '30d'): Promise<PlausibleTopSources[]> {
    const data = await this.fetchPlausibleData('breakdown', {
      period,
      property: 'source',
      metrics: 'visitors'
    });

    const total = data.results?.reduce((sum: number, item: any) => sum + (item.visitors || 0), 0) || 1;

    return data.results?.map((item: any) => ({
      source: item.source,
      visitors: item.visitors || 0,
      percentage: Math.round(((item.visitors || 0) / total) * 100)
    })) || [];
  }

  // Get device data
  async getDeviceData(period: string = '30d'): Promise<PlausibleDeviceData[]> {
    const data = await this.fetchPlausibleData('breakdown', {
      period,
      property: 'device',
      metrics: 'visitors'
    });

    const total = data.results?.reduce((sum: number, item: any) => sum + (item.visitors || 0), 0) || 1;

    return data.results?.map((item: any) => ({
      device: item.device,
      visitors: item.visitors || 0,
      percentage: Math.round(((item.visitors || 0) / total) * 100)
    })) || [];
  }

  // Utility function to calculate percentage change
  private calculateChange(current: number, previous: number): number {
    if (!previous || previous === 0) return 0;
    return Math.round(((current - previous) / previous) * 100);
  }

  // Format visit duration from seconds to human readable format
  formatVisitDuration(seconds: number): string {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  }

  // Format large numbers
  formatNumber(num: number): string {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`;
    } else if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`;
    }
    return num.toString();
  }
}

export const plausibleAnalytics = new PlausibleAnalyticsService(); 
import { supabase } from './supabase';

export interface AnalyticsStatus {
  isUsingExampleData: boolean;
  hasRealAnalytics: boolean;
  lastAnalyzedSite?: string;
  lastAnalysisDate?: Date;
  analyticsProvider?: 'example' | 'self-hosted' | 'none';
}

export interface SiteAnalysis {
  id: string;
  url: string;
  userId: string;
  analysisData: any;
  createdAt: Date;
  isExampleData: boolean;
}

/**
 * Detects whether the user is using example data or has real analytics
 */
export async function detectAnalyticsStatus(userId: string): Promise<AnalyticsStatus> {
  try {
    // Check if user has any real site analyses
    const { data: analyses, error } = await supabase
      .from('site_analyses')
      .select('*')
      .eq('user_id', userId)
      .eq('is_example_data', false)
      .order('created_at', { ascending: false })
      .limit(1);

    if (error) {
      console.warn('Error fetching analytics status:', error);
      return {
        isUsingExampleData: true,
        hasRealAnalytics: false,
        analyticsProvider: 'example'
      };
    }

    const hasRealAnalytics = analyses && analyses.length > 0;
    const lastAnalysis = analyses?.[0];

    // Check if analytics provider is configured
    const analyticsProviderUrl = import.meta.env.VITE_ANALYTICS_PROVIDER_URL;
    const analyticsProviderKey = import.meta.env.VITE_ANALYTICS_PROVIDER_KEY;
    
    let analyticsProvider: 'example' | 'self-hosted' | 'none' = 'example';
    
    if (analyticsProviderUrl && analyticsProviderKey) {
      analyticsProvider = 'self-hosted';
    } else if (!hasRealAnalytics) {
      analyticsProvider = 'none';
    }

    return {
      isUsingExampleData: !hasRealAnalytics,
      hasRealAnalytics,
      lastAnalyzedSite: lastAnalysis?.url,
      lastAnalysisDate: lastAnalysis ? new Date(lastAnalysis.created_at) : undefined,
      analyticsProvider
    };
  } catch (error) {
    console.error('Error detecting analytics status:', error);
    return {
      isUsingExampleData: true,
      hasRealAnalytics: false,
      analyticsProvider: 'example'
    };
  }
}

/**
 * Stores a new site analysis
 */
export async function storeSiteAnalysis(
  userId: string,
  url: string,
  analysisData: any,
  isExampleData: boolean = false
): Promise<SiteAnalysis | null> {
  try {
    const { data, error } = await supabase
      .from('site_analyses')
      .insert({
        user_id: userId,
        url,
        analysis_data: analysisData,
        is_example_data: isExampleData,
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      console.error('Error storing site analysis:', error);
      return null;
    }

    return {
      id: data.id,
      url: data.url,
      userId: data.user_id,
      analysisData: data.analysis_data,
      createdAt: new Date(data.created_at),
      isExampleData: data.is_example_data
    };
  } catch (error) {
    console.error('Error storing site analysis:', error);
    return null;
  }
}

/**
 * Gets recent site analyses for a user
 */
export async function getUserAnalyses(
  userId: string,
  limit: number = 10
): Promise<SiteAnalysis[]> {
  try {
    const { data, error } = await supabase
      .from('site_analyses')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching user analyses:', error);
      return [];
    }

    return data.map(item => ({
      id: item.id,
      url: item.url,
      userId: item.user_id,
      analysisData: item.analysis_data,
      createdAt: new Date(item.created_at),
      isExampleData: item.is_example_data
    }));
  } catch (error) {
    console.error('Error fetching user analyses:', error);
    return [];
  }
}

/**
 * Sends analytics data to the self-hosted analytics provider
 */
export async function sendToAnalyticsProvider(
  siteUrl: string,
  analysisData: any
): Promise<boolean> {
  const analyticsProviderUrl = import.meta.env.VITE_ANALYTICS_PROVIDER_URL;
  const analyticsProviderKey = import.meta.env.VITE_ANALYTICS_PROVIDER_KEY;

  if (!analyticsProviderUrl || !analyticsProviderKey) {
    console.warn('Analytics provider not configured');
    return false;
  }

  try {
    const response = await fetch(`${analyticsProviderUrl}/api/analytics`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${analyticsProviderKey}`,
      },
      body: JSON.stringify({
        site_url: siteUrl,
        analysis_data: analysisData,
        timestamp: new Date().toISOString()
      })
    });

    if (!response.ok) {
      console.error('Failed to send analytics to provider:', response.statusText);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error sending analytics to provider:', error);
    return false;
  }
}
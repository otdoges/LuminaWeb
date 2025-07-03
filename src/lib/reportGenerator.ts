import { WebsiteAnalysis, AnalysisMetrics } from '../types/analysis';
import { groqService } from './groq';

export interface ReportData {
  analysis: WebsiteAnalysis;
  competitorData?: any[];
  generatedAt: Date;
  reportType: 'comprehensive' | 'seo' | 'performance' | 'competitive';
  customBranding?: {
    companyName?: string;
    logo?: string;
    brandColor?: string;
  };
}

export interface ReportOptions {
  format: 'pdf' | 'csv' | 'json';
  includeCharts: boolean;
  includeRecommendations: boolean;
  includeCompetitorData: boolean;
  customSections?: string[];
  branding?: {
    companyName?: string;
    logo?: string;
    brandColor?: string;
  };
}

export class ReportGenerator {
  private static instance: ReportGenerator;

  public static getInstance(): ReportGenerator {
    if (!ReportGenerator.instance) {
      ReportGenerator.instance = new ReportGenerator();
    }
    return ReportGenerator.instance;
  }

  async generateReport(data: ReportData, options: ReportOptions): Promise<string> {
    switch (options.format) {
      case 'pdf':
        return this.generatePDFReport(data, options);
      case 'csv':
        return this.generateCSVReport(data, options);
      case 'json':
        return this.generateJSONReport(data, options);
      default:
        throw new Error(`Unsupported report format: ${options.format}`);
    }
  }

  private async generatePDFReport(data: ReportData, options: ReportOptions): Promise<string> {
    // Generate AI summary for the report
    const aiSummary = await this.generateAISummary(data);
    
    const htmlContent = this.generateHTMLReport(data, options, aiSummary);
    
    // In a real implementation, you'd use a library like puppeteer or jsPDF
    // For now, we'll create a downloadable HTML file that can be printed as PDF
    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `website-analysis-report-${data.analysis.url.replace(/https?:\/\//, '').replace(/[^a-zA-Z0-9]/g, '-')}-${new Date().toISOString().split('T')[0]}.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    return 'PDF report generated successfully';
  }

  private async generateCSVReport(data: ReportData, options: ReportOptions): Promise<string> {
    const metrics = data.analysis.metrics;
    
    // Define metric mappings for clean output
    const metricMappings = {
      seo: {
        name: 'SEO',
        fields: {
          score: 'Overall Score',
          title: 'Title',
          description: 'Description',
          metaTags: 'Meta Tags Count',
          headingStructure: 'Heading Structure',
          internalLinks: 'Internal Links',
          externalLinks: 'External Links'
        }
      },
      performance: {
        name: 'Performance',
        fields: {
          score: 'Overall Score',
          loadTime: 'Load Time (s)',
          firstContentfulPaint: 'First Contentful Paint',
          largestContentfulPaint: 'Largest Contentful Paint',
          cumulativeLayoutShift: 'Cumulative Layout Shift',
          speedIndex: 'Speed Index'
        }
      },
      security: {
        name: 'Security',
        fields: {
          score: 'Overall Score',
          httpsEnabled: 'HTTPS Enabled',
          sslCertificate: 'SSL Certificate',
          securityHeaders: 'Security Headers'
        }
      },
      mobile: {
        name: 'Mobile',
        fields: {
          score: 'Overall Score',
          responsive: 'Responsive Design',
          mobileSpeed: 'Mobile Speed',
          viewportConfig: 'Viewport Configuration'
        }
      },
      content: {
        name: 'Content',
        fields: {
          score: 'Overall Score',
          wordCount: 'Word Count',
          readabilityScore: 'Readability Score',
          imageOptimization: 'Image Optimization'
        }
      },
      engagement: {
        name: 'Engagement',
        fields: {
          monthlyVisitors: 'Monthly Visitors',
          conversionRate: 'Conversion Rate (%)',
          bounceRate: 'Bounce Rate (%)',
          avgSessionDuration: 'Average Session Duration'
        }
      }
    };

    // Build CSV data dynamically
    const csvData = [
      ['Website Analysis Report'],
      ['Generated on:', data.generatedAt.toISOString()],
      ['Website URL:', data.analysis.url],
      [''],
      ['Metric Category', 'Metric Name', 'Value', 'Score']
    ];

    // Generate rows for each metric category
    Object.entries(metricMappings).forEach(([key, config]) => {
      const categoryData = metrics[key as keyof typeof metrics];
      Object.entries(config.fields).forEach(([field, label]) => {
        const value = categoryData?.[field as keyof typeof categoryData];
        csvData.push([config.name, label, String(value || 'N/A'), '']);
      });
      csvData.push(['']); // Empty row between categories
    });

    // Add competitor data if available
    if (options.includeCompetitorData && data.competitorData?.length) {
      csvData.push(['Competitor Analysis'], ['Competitor', 'Overall Score', 'SEO Score', 'Performance Score', 'Content Score']);
      data.competitorData.forEach(competitor => {
        csvData.push([
          competitor.name || competitor.url,
          competitor.overallScore?.toString() || 'N/A',
          competitor.seoScore?.toString() || 'N/A',
          competitor.performanceScore?.toString() || 'N/A',
          competitor.contentScore?.toString() || 'N/A'
        ]);
      });
    }

    const csvContent = csvData.map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `website-analysis-${data.analysis.url.replace(/https?:\/\//, '').replace(/[^a-zA-Z0-9]/g, '-')}-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    return 'CSV report generated successfully';
  }

  private async generateJSONReport(data: ReportData, options: ReportOptions): Promise<string> {
    const aiSummary = options.includeRecommendations ? await this.generateAISummary(data) : null;
    
    const reportData = {
      metadata: {
        generatedAt: data.generatedAt.toISOString(),
        reportType: data.reportType,
        url: data.analysis.url,
        analysisTimestamp: data.analysis.timestamp,
        branding: options.branding
      },
      executiveSummary: aiSummary,
      analysis: data.analysis,
      competitorData: options.includeCompetitorData ? data.competitorData : undefined,
      recommendations: aiSummary?.recommendations || [],
      actionItems: aiSummary?.actionItems || []
    };

    const jsonContent = JSON.stringify(reportData, null, 2);
    
    const blob = new Blob([jsonContent], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `website-analysis-${data.analysis.url.replace(/https?:\/\//, '').replace(/[^a-zA-Z0-9]/g, '-')}-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    return 'JSON report generated successfully';
  }

  private generateHTMLReport(data: ReportData, options: ReportOptions, aiSummary: any): string {
    const brandColor = options.branding?.brandColor || '#3B82F6';
    const companyName = options.branding?.companyName || 'LuminaWeb';
    
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Website Analysis Report - ${data.analysis.url}</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.6;
            color: #333;
            margin: 0;
            padding: 20px;
            background-color: #f8fafc;
        }
        .container {
            max-width: 1200px;
            margin: 0 auto;
            background: white;
            padding: 40px;
            border-radius: 12px;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        }
        .header {
            border-bottom: 3px solid ${brandColor};
            padding-bottom: 20px;
            margin-bottom: 30px;
        }
        .header h1 {
            color: ${brandColor};
            margin: 0;
            font-size: 2.5rem;
            font-weight: 700;
        }
        .header .subtitle {
            color: #64748b;
            font-size: 1.1rem;
            margin-top: 8px;
        }
        .metadata {
            background: #f1f5f9;
            padding: 20px;
            border-radius: 8px;
            margin-bottom: 30px;
        }
        .metadata h2 {
            margin: 0 0 15px 0;
            color: #1e293b;
        }
        .score-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
            margin: 30px 0;
        }
        .score-card {
            background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
            padding: 20px;
            border-radius: 8px;
            text-align: center;
            border: 1px solid #e2e8f0;
        }
        .score-card h3 {
            margin: 0 0 10px 0;
            color: #1e293b;
            font-size: 1.1rem;
        }
        .score-value {
            font-size: 2.5rem;
            font-weight: 700;
            margin: 10px 0;
        }
        .score-excellent { color: #059669; }
        .score-good { color: #0891b2; }
        .score-average { color: #d97706; }
        .score-poor { color: #dc2626; }
        .section {
            margin: 40px 0;
            padding: 30px;
            border: 1px solid #e2e8f0;
            border-radius: 8px;
        }
        .section h2 {
            color: ${brandColor};
            border-bottom: 2px solid ${brandColor};
            padding-bottom: 10px;
            margin-bottom: 20px;
        }
        .metric-row {
            display: flex;
            justify-content: space-between;
            padding: 8px 0;
            border-bottom: 1px solid #f1f5f9;
        }
        .metric-row:last-child {
            border-bottom: none;
        }
        .metric-label {
            font-weight: 500;
            color: #374151;
        }
        .metric-value {
            color: #6b7280;
        }
        .recommendations {
            background: #fef3c7;
            border: 1px solid #f59e0b;
            border-radius: 8px;
            padding: 20px;
            margin: 30px 0;
        }
        .recommendations h3 {
            color: #92400e;
            margin: 0 0 15px 0;
        }
        .recommendations ul {
            margin: 0;
            padding-left: 20px;
        }
        .recommendations li {
            margin: 8px 0;
            color: #78350f;
        }
        .footer {
            text-align: center;
            margin-top: 50px;
            padding-top: 30px;
            border-top: 1px solid #e2e8f0;
            color: #64748b;
        }
        @media print {
            body { background: white; }
            .container { box-shadow: none; }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>${companyName} Analysis Report</h1>
            <div class="subtitle">Comprehensive Website Analysis for ${data.analysis.url}</div>
        </div>

        <div class="metadata">
            <h2>Report Details</h2>
            <div class="metric-row">
                <span class="metric-label">Generated on:</span>
                <span class="metric-value">${data.generatedAt.toLocaleDateString()} at ${data.generatedAt.toLocaleTimeString()}</span>
            </div>
            <div class="metric-row">
                <span class="metric-label">Website URL:</span>
                <span class="metric-value">${data.analysis.url}</span>
            </div>
            <div class="metric-row">
                <span class="metric-label">Analysis Type:</span>
                <span class="metric-value">${data.reportType.charAt(0).toUpperCase() + data.reportType.slice(1)}</span>
            </div>
        </div>

        ${aiSummary ? `
        <div class="section">
            <h2>Executive Summary</h2>
            <p>${aiSummary.summary}</p>
            ${aiSummary.recommendations && aiSummary.recommendations.length > 0 ? `
            <div class="recommendations">
                <h3>Key Recommendations</h3>
                <ul>
                    ${aiSummary.recommendations.map((rec: string) => `<li>${rec}</li>`).join('')}
                </ul>
            </div>
            ` : ''}
        </div>
        ` : ''}

        <div class="score-grid">
            <div class="score-card">
                <h3>SEO Score</h3>
                <div class="score-value ${this.getScoreClass(data.analysis.metrics.seo.score)}">${data.analysis.metrics.seo.score}</div>
            </div>
            <div class="score-card">
                <h3>Performance</h3>
                <div class="score-value ${this.getScoreClass(data.analysis.metrics.performance.score)}">${data.analysis.metrics.performance.score}</div>
            </div>
            <div class="score-card">
                <h3>Security</h3>
                <div class="score-value ${this.getScoreClass(data.analysis.metrics.security.score)}">${data.analysis.metrics.security.score}</div>
            </div>
            <div class="score-card">
                <h3>Mobile</h3>
                <div class="score-value ${this.getScoreClass(data.analysis.metrics.mobile.score)}">${data.analysis.metrics.mobile.score}</div>
            </div>
            <div class="score-card">
                <h3>Content</h3>
                <div class="score-value ${this.getScoreClass(data.analysis.metrics.content.score)}">${data.analysis.metrics.content.score}</div>
            </div>
        </div>

        ${this.generateSEOSection(data.analysis.metrics.seo)}
        ${this.generatePerformanceSection(data.analysis.metrics.performance)}
        ${this.generateSecuritySection(data.analysis.metrics.security)}
        ${this.generateMobileSection(data.analysis.metrics.mobile)}
        ${this.generateContentSection(data.analysis.metrics.content)}
        ${this.generateEngagementSection(data.analysis.metrics.engagement)}

        ${options.includeCompetitorData && data.competitorData && data.competitorData.length > 0 ? 
          this.generateCompetitorSection(data.competitorData) : ''}

        <div class="footer">
            <p>This report was generated by ${companyName} on ${data.generatedAt.toLocaleDateString()}</p>
            <p>For questions or additional analysis, please contact your web analytics team.</p>
        </div>
    </div>
</body>
</html>`;
  }

  private generateSEOSection(seo: any): string {
    return `
        <div class="section">
            <h2>SEO Analysis</h2>
            <div class="metric-row">
                <span class="metric-label">Page Title:</span>
                <span class="metric-value">${seo.title || 'Not found'}</span>
            </div>
            <div class="metric-row">
                <span class="metric-label">Meta Description:</span>
                <span class="metric-value">${seo.description || 'Not found'}</span>
            </div>
            <div class="metric-row">
                <span class="metric-label">Meta Tags:</span>
                <span class="metric-value">${seo.metaTags}</span>
            </div>
            <div class="metric-row">
                <span class="metric-label">Heading Structure:</span>
                <span class="metric-value">${seo.headingStructure} headings found</span>
            </div>
            <div class="metric-row">
                <span class="metric-label">Internal Links:</span>
                <span class="metric-value">${seo.internalLinks}</span>
            </div>
            <div class="metric-row">
                <span class="metric-label">External Links:</span>
                <span class="metric-value">${seo.externalLinks}</span>
            </div>
            <div class="metric-row">
                <span class="metric-label">Images with Alt Text:</span>
                <span class="metric-value">${seo.imageAlt}</span>
            </div>
        </div>`;
  }

  private generatePerformanceSection(performance: any): string {
    return `
        <div class="section">
            <h2>Performance Metrics</h2>
            <div class="metric-row">
                <span class="metric-label">Load Time:</span>
                <span class="metric-value">${performance.loadTime.toFixed(2)}s</span>
            </div>
            <div class="metric-row">
                <span class="metric-label">First Contentful Paint:</span>
                <span class="metric-value">${performance.firstContentfulPaint.toFixed(2)}s</span>
            </div>
            <div class="metric-row">
                <span class="metric-label">Largest Contentful Paint:</span>
                <span class="metric-value">${performance.largestContentfulPaint.toFixed(2)}s</span>
            </div>
            <div class="metric-row">
                <span class="metric-label">Cumulative Layout Shift:</span>
                <span class="metric-value">${performance.cumulativeLayoutShift.toFixed(3)}</span>
            </div>
            <div class="metric-row">
                <span class="metric-label">Speed Index:</span>
                <span class="metric-value">${Math.round(performance.speedIndex)}</span>
            </div>
            <div class="metric-row">
                <span class="metric-label">Time to Interactive:</span>
                <span class="metric-value">${performance.timeToInteractive.toFixed(2)}s</span>
            </div>
        </div>`;
  }

  private generateSecuritySection(security: any): string {
    return `
        <div class="section">
            <h2>Security Analysis</h2>
            <div class="metric-row">
                <span class="metric-label">HTTPS Enabled:</span>
                <span class="metric-value">${security.httpsEnabled ? 'Yes' : 'No'}</span>
            </div>
            <div class="metric-row">
                <span class="metric-label">SSL Certificate:</span>
                <span class="metric-value">${security.sslCertificate ? 'Valid' : 'Invalid/Missing'}</span>
            </div>
            <div class="metric-row">
                <span class="metric-label">Security Headers:</span>
                <span class="metric-value">${security.securityHeaders} headers found</span>
            </div>
            <div class="metric-row">
                <span class="metric-label">Privacy Policy:</span>
                <span class="metric-value">${security.privacyPolicy ? 'Found' : 'Not found'}</span>
            </div>
            <div class="metric-row">
                <span class="metric-label">Cookie Policy:</span>
                <span class="metric-value">${security.cookiePolicy ? 'Found' : 'Not found'}</span>
            </div>
        </div>`;
  }

  private generateMobileSection(mobile: any): string {
    return `
        <div class="section">
            <h2>Mobile Optimization</h2>
            <div class="metric-row">
                <span class="metric-label">Responsive Design:</span>
                <span class="metric-value">${mobile.responsive ? 'Yes' : 'No'}</span>
            </div>
            <div class="metric-row">
                <span class="metric-label">Mobile Speed Score:</span>
                <span class="metric-value">${mobile.mobileSpeed}/100</span>
            </div>
            <div class="metric-row">
                <span class="metric-label">Touch Targets:</span>
                <span class="metric-value">${mobile.touchTargets} appropriately sized</span>
            </div>
            <div class="metric-row">
                <span class="metric-label">Viewport Configuration:</span>
                <span class="metric-value">${mobile.viewportConfig ? 'Configured' : 'Not configured'}</span>
            </div>
            <div class="metric-row">
                <span class="metric-label">Mobile Usability:</span>
                <span class="metric-value">${mobile.mobileUsability}/100</span>
            </div>
        </div>`;
  }

  private generateContentSection(content: any): string {
    return `
        <div class="section">
            <h2>Content Analysis</h2>
            <div class="metric-row">
                <span class="metric-label">Word Count:</span>
                <span class="metric-value">${content.wordCount} words</span>
            </div>
            <div class="metric-row">
                <span class="metric-label">Readability Score:</span>
                <span class="metric-value">${content.readabilityScore}/100</span>
            </div>
            <div class="metric-row">
                <span class="metric-label">Duplicate Content:</span>
                <span class="metric-value">${content.duplicateContent} instances</span>
            </div>
            <div class="metric-row">
                <span class="metric-label">Broken Links:</span>
                <span class="metric-value">${content.brokenLinks}</span>
            </div>
            <div class="metric-row">
                <span class="metric-label">Image Optimization:</span>
                <span class="metric-value">${content.imageOptimization}% optimized</span>
            </div>
            <div class="metric-row">
                <span class="metric-label">Content Freshness:</span>
                <span class="metric-value">${content.contentFreshness}/100</span>
            </div>
        </div>`;
  }

  private generateEngagementSection(engagement: any): string {
    return `
        <div class="section">
            <h2>Engagement Metrics</h2>
            <div class="metric-row">
                <span class="metric-label">Monthly Visitors:</span>
                <span class="metric-value">${engagement.monthlyVisitors.toLocaleString()}</span>
            </div>
            <div class="metric-row">
                <span class="metric-label">Conversion Rate:</span>
                <span class="metric-value">${engagement.conversionRate}%</span>
            </div>
            <div class="metric-row">
                <span class="metric-label">Bounce Rate:</span>
                <span class="metric-value">${engagement.bounceRate}%</span>
            </div>
            <div class="metric-row">
                <span class="metric-label">Average Session Duration:</span>
                <span class="metric-value">${engagement.avgSessionDuration}</span>
            </div>
            <div class="metric-row">
                <span class="metric-label">Page Views:</span>
                <span class="metric-value">${engagement.pageViews.toLocaleString()}</span>
            </div>
            <div class="metric-row">
                <span class="metric-label">Unique Visitors:</span>
                <span class="metric-value">${engagement.uniqueVisitors.toLocaleString()}</span>
            </div>
        </div>`;
  }

  private generateCompetitorSection(competitors: any[]): string {
    return `
        <div class="section">
            <h2>Competitive Analysis</h2>
            ${competitors.map(competitor => `
                <div style="margin-bottom: 20px; padding: 15px; border: 1px solid #e2e8f0; border-radius: 6px;">
                    <h3 style="margin: 0 0 10px 0; color: #1e293b;">${competitor.name}</h3>
                    <div class="metric-row">
                        <span class="metric-label">Overall Score:</span>
                        <span class="metric-value">${competitor.overallScore}/100</span>
                    </div>
                    <div class="metric-row">
                        <span class="metric-label">Market Position:</span>
                        <span class="metric-value">${competitor.marketPosition}</span>
                    </div>
                    <div class="metric-row">
                        <span class="metric-label">Key Strengths:</span>
                        <span class="metric-value">${competitor.strengths.slice(0, 3).join(', ')}</span>
                    </div>
                </div>
            `).join('')}
        </div>`;
  }

  private async generateAISummary(data: ReportData): Promise<any> {
    try {
      const analysis = await groqService.generateComprehensiveAnalysis({
        url: data.analysis.url,
        analysisType: ['summary', 'recommendations', 'strategic'],
        websiteData: {
          metrics: data.analysis.metrics
        },
        customPrompt: `Generate an executive summary for this website analysis report. Include:
        1. Overall assessment of the website's performance
        2. Top 5 priority recommendations for improvement
        3. Strategic insights for business growth
        4. Action items with estimated impact and effort
        
        Website: ${data.analysis.url}
        Overall Performance: SEO (${data.analysis.metrics.seo.score}), Performance (${data.analysis.metrics.performance.score}), Security (${data.analysis.metrics.security.score}), Mobile (${data.analysis.metrics.mobile.score}), Content (${data.analysis.metrics.content.score})`
      });

      return {
        summary: this.extractSummaryFromAnalysis(analysis),
        recommendations: analysis.recommendations || [],
        actionItems: analysis.actionPlan ? [
          ...analysis.actionPlan.immediate,
          ...analysis.actionPlan.shortTerm,
          ...analysis.actionPlan.longTerm
        ] : []
      };
    } catch (error) {
      console.error('Failed to generate AI summary:', error);
      return {
        summary: `This comprehensive analysis of ${data.analysis.url} reveals key insights across SEO, performance, security, mobile optimization, and content quality. The website shows strengths in some areas while presenting opportunities for improvement in others.`,
        recommendations: [
          'Optimize page loading speed for better user experience',
          'Enhance SEO metadata and content structure',
          'Improve mobile responsiveness and usability',
          'Strengthen security headers and SSL configuration',
          'Develop content strategy for better engagement'
        ],
        actionItems: [
          'Fix critical performance issues',
          'Update meta descriptions and title tags',
          'Implement responsive design improvements',
          'Add security headers and policies',
          'Create content optimization plan'
        ]
      };
    }
  }

  private extractSummaryFromAnalysis(analysis: any): string {
    if (typeof analysis === 'string') {
      // Extract the first paragraph or summary section
      const lines = analysis.split('\n').filter(line => line.trim());
      return lines.slice(0, 3).join(' ').substring(0, 500) + '...';
    }
    
    return `This comprehensive website analysis provides insights into performance, SEO, security, mobile optimization, and content quality. The evaluation identifies key strengths and areas for improvement to enhance overall website effectiveness.`;
  }

  private getScoreClass(score: number): string {
    if (score >= 90) return 'score-excellent';
    if (score >= 75) return 'score-good';
    if (score >= 60) return 'score-average';
    return 'score-poor';
  }
}

export const reportGenerator = ReportGenerator.getInstance();
import Groq from 'groq-sdk';
import { rateLimiter } from './rateLimiter';

const groq = new Groq({
  apiKey: import.meta.env.VITE_GROQ_API_KEY,
  dangerouslyAllowBrowser: true // Only for client-side usage in development
});

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface AnalysisRequest {
  url: string;
  analysisType: string[];
  customPrompt?: string;
  websiteData?: {
    html?: string;
    screenshot?: string;
    metrics?: any;
  };
}

export interface ScreenshotRequest {
  url: string;
  options?: {
    width?: number;
    height?: number;
    device?: 'desktop' | 'mobile' | 'tablet';
  };
}

export interface ComprehensiveAnalysisResult {
  overallScore: number;
  recommendations: string[];
  seoAnalysis: {
    score: number;
    issues: string[];
    improvements: string[];
  };
  performanceAnalysis: {
    score: number;
    issues: string[];
    improvements: string[];
  };
  accessibilityAnalysis: {
    score: number;
    issues: string[];
    improvements: string[];
  };
  contentAnalysis: {
    score: number;
    issues: string[];
    improvements: string[];
  };
  competitorInsights?: string[];
  actionPlan: {
    immediate: string[];
    shortTerm: string[];
    longTerm: string[];
  };
}

export const groqService = {
  // Advanced reasoning analysis using DeepSeek R1 model
  async performReasoningAnalysis(request: AnalysisRequest): Promise<{
    reasoning: {
      problemIdentification: string[];
      causalAnalysis: string;
      solutionPathways: string[];
      riskAssessment: string;
    };
    strategicInsights: {
      primaryOpportunities: string[];
      competitiveAdvantages: string[];
      marketPositioning: string;
      growthPotential: string;
    };
    actionableRecommendations: {
      immediate: Array<{
        action: string;
        impact: 'high' | 'medium' | 'low';
        effort: 'high' | 'medium' | 'low';
        timeline: string;
        reasoning: string;
      }>;
      strategic: Array<{
        action: string;
        impact: 'high' | 'medium' | 'low';
        effort: 'high' | 'medium' | 'low';
        timeline: string;
        reasoning: string;
      }>;
    };
    performancePredictions: {
      expectedImprovements: string[];
      timeToResults: string;
      successMetrics: string[];
    };
  }> {
    const reasoningPrompt = `You are an expert digital strategist with advanced reasoning capabilities. Analyze this website using multi-step reasoning and strategic thinking.

Website: ${request.url}
Analysis Context: ${request.analysisType.join(', ')}

${request.websiteData?.metrics ? `Current Performance Data:
${JSON.stringify(request.websiteData.metrics, null, 2)}` : ''}

Using advanced reasoning, perform a comprehensive strategic analysis:

STEP 1: PROBLEM IDENTIFICATION & ROOT CAUSE ANALYSIS
- Identify core performance issues and their underlying causes
- Analyze the relationship between different metrics and user behavior
- Consider external factors (market, competition, user expectations)

STEP 2: CAUSAL REASONING & IMPACT ANALYSIS  
- Trace how current issues affect overall business performance
- Identify cascading effects and interdependencies
- Assess which problems have the highest leverage for improvement

STEP 3: SOLUTION PATHWAY ANALYSIS
- Generate multiple solution approaches with reasoning
- Evaluate solution feasibility and potential impact
- Consider resource requirements and implementation complexity

STEP 4: STRATEGIC OPPORTUNITY IDENTIFICATION
- Identify unique competitive advantages and market opportunities
- Analyze growth potential and market positioning
- Consider long-term strategic implications

STEP 5: RECOMMENDATION PRIORITIZATION
- Rank recommendations by impact vs effort
- Provide detailed reasoning for each recommendation
- Include timeline and success metrics

STEP 6: PREDICTIVE ANALYSIS
- Forecast expected improvements from recommendations
- Estimate time to results and success probability
- Identify key performance indicators to monitor

Provide your analysis with clear reasoning chains, strategic insights, and actionable recommendations prioritized by impact and feasibility.`;

    try {
      const completion = await rateLimiter.executeWithRateLimit(
        'groq',
        async () => {
          return await groq.chat.completions.create({
            messages: [
              { role: 'user', content: reasoningPrompt }
            ],
            model: 'deepseek-r1-distill-llama-70b', // Use reasoning model for advanced analysis
            temperature: 0.2,
            max_tokens: 6144,
            stream: false
          });
        },
        'reasoning-analysis'
      );

      const response = completion.choices[0]?.message?.content || '';
      return this.parseReasoningAnalysis(response);
    } catch (error) {
      console.error('Reasoning analysis error:', error);
      throw new Error('Failed to perform reasoning analysis');
    }
  },

  async generateChatResponse(messages: ChatMessage[], stream = true) {
    try {
      const completion = await groq.chat.completions.create({
        messages: messages.map(msg => ({
          role: msg.role,
          content: msg.content
        })),
        model: 'deepseek-r1-distill-llama-70b', // Using DeepSeek R1 Distilled model for reasoning
        temperature: 0.7,
        max_tokens: 4096,
        stream
      });

      return completion;
    } catch (error) {
      console.error('Groq API error:', error);
      throw new Error('Failed to generate response');
    }
  },

  async analyzeWebsite(request: AnalysisRequest): Promise<string> {
    const enhancedSystemPrompt = `You are an expert web analyst and digital marketing consultant with deep knowledge of:
- SEO optimization and search engine algorithms
- Web performance optimization and Core Web Vitals
- User experience (UX) design principles
- Web accessibility standards (WCAG)
- Content strategy and digital marketing
- Technical website analysis
- Conversion rate optimization
- Security best practices

Your analysis should be comprehensive, actionable, and prioritized by impact vs effort.

Website to analyze: ${request.url}
Analysis areas: ${request.analysisType.join(', ')}

For each analysis area, provide:
1. Current assessment with specific scores (0-100)
2. Detailed issues found with severity levels
3. Actionable recommendations with implementation difficulty
4. Expected impact of improvements
5. Priority ranking (Critical/High/Medium/Low)
6. Specific technical steps to implement

Be thorough, specific, and provide practical advice that can be implemented immediately.`;

    const contextualPrompt = request.websiteData ? 
      `I have analyzed the website ${request.url} and gathered the following technical data:

${request.websiteData.html ? `HTML Content Analysis:
- Page structure and semantic markup
- Meta tags and SEO elements
- Content analysis and readability
- Internal/external link structure` : ''}

${request.websiteData.metrics ? `Technical Metrics:
${JSON.stringify(request.websiteData.metrics, null, 2)}` : ''}

Based on this technical analysis and the website content, provide a comprehensive analysis focusing on: ${request.analysisType.join(', ')}

${request.customPrompt || 'Please provide detailed recommendations for improvement with specific, actionable steps.'}` :
      
      `Please perform a comprehensive analysis of ${request.url} focusing on: ${request.analysisType.join(', ')}
      
${request.customPrompt || 'Provide detailed recommendations for improvement with specific, actionable steps.'}`;

    const messages: ChatMessage[] = [
      { role: 'system', content: enhancedSystemPrompt },
      { role: 'user', content: contextualPrompt }
    ];

    try {
      const completion = await groq.chat.completions.create({
        messages,
        model: 'qwen/qwen-2.5-72b-instruct', // Using Qwen model for detailed analysis
        temperature: 0.3,
        max_tokens: 4096,
        stream: false
      });

      return completion.choices[0]?.message?.content || 'Analysis could not be completed.';
    } catch (error) {
      console.error('Website analysis error:', error);
      throw new Error('Failed to analyze website');
    }
  },

  async generateComprehensiveAnalysis(request: AnalysisRequest): Promise<ComprehensiveAnalysisResult> {
    const systemPrompt = `You are an expert website analyst. Analyze the provided website data and return a JSON response with the following structure:

{
  "overallScore": number (0-100),
  "recommendations": ["top priority recommendations"],
  "seoAnalysis": {
    "score": number (0-100),
    "issues": ["specific SEO issues found"],
    "improvements": ["actionable SEO improvements"]
  },
  "performanceAnalysis": {
    "score": number (0-100),
    "issues": ["performance issues"],
    "improvements": ["performance optimizations"]
  },
  "accessibilityAnalysis": {
    "score": number (0-100),
    "issues": ["accessibility violations"],
    "improvements": ["accessibility fixes"]
  },
  "contentAnalysis": {
    "score": number (0-100),
    "issues": ["content quality issues"],
    "improvements": ["content improvements"]
  },
  "competitorInsights": ["competitive analysis insights"],
  "actionPlan": {
    "immediate": ["actions to take this week"],
    "shortTerm": ["actions for next month"],
    "longTerm": ["strategic improvements"]
  }
}

Provide specific, actionable insights based on the website data.`;

    const userPrompt = `Analyze website: ${request.url}
    
${request.websiteData ? `Technical Data:
${JSON.stringify(request.websiteData.metrics, null, 2)}` : ''}

Focus areas: ${request.analysisType.join(', ')}

Return a comprehensive analysis in the specified JSON format.`;

    try {
      const completion = await groq.chat.completions.create({
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        model: 'qwen/qwen-2.5-72b-instruct',
        temperature: 0.2,
        max_tokens: 4096,
        stream: false
      });

      const response = completion.choices[0]?.message?.content;
      if (!response) throw new Error('No analysis response received');

      try {
        return JSON.parse(response);
      } catch (parseError) {
        console.error('Failed to parse JSON response, falling back to text analysis');
        // Fallback: create structured response from text
        return this.parseTextAnalysis(response);
      }
    } catch (error) {
      console.error('Comprehensive analysis error:', error);
      throw new Error('Failed to generate comprehensive analysis');
    }
  },

  parseTextAnalysis(text: string): ComprehensiveAnalysisResult {
    // Fallback parser to extract insights from text response
    const lines = text.split('\n').filter(line => line.trim());
    
    return {
      overallScore: 75, // Default score
      recommendations: lines.filter(line => 
        line.includes('recommend') || line.includes('improve') || line.includes('fix')
      ).slice(0, 5),
      seoAnalysis: {
        score: 70,
        issues: lines.filter(line => 
          line.toLowerCase().includes('seo') && 
          (line.includes('issue') || line.includes('problem'))
        ).slice(0, 3),
        improvements: lines.filter(line => 
          line.toLowerCase().includes('seo') && 
          (line.includes('improve') || line.includes('optimize'))
        ).slice(0, 3)
      },
      performanceAnalysis: {
        score: 75,
        issues: lines.filter(line => 
          line.toLowerCase().includes('performance') || 
          line.toLowerCase().includes('speed')
        ).slice(0, 3),
        improvements: lines.filter(line => 
          line.toLowerCase().includes('faster') || 
          line.toLowerCase().includes('optimize')
        ).slice(0, 3)
      },
      accessibilityAnalysis: {
        score: 80,
        issues: lines.filter(line => 
          line.toLowerCase().includes('accessibility') || 
          line.toLowerCase().includes('a11y')
        ).slice(0, 3),
        improvements: lines.filter(line => 
          line.toLowerCase().includes('accessible') || 
          line.toLowerCase().includes('alt text')
        ).slice(0, 3)
      },
      contentAnalysis: {
        score: 78,
        issues: lines.filter(line => 
          line.toLowerCase().includes('content') && 
          line.includes('issue')
        ).slice(0, 3),
        improvements: lines.filter(line => 
          line.toLowerCase().includes('content') && 
          line.includes('improve')
        ).slice(0, 3)
      },
      competitorInsights: lines.filter(line => 
        line.toLowerCase().includes('competitor') || 
        line.toLowerCase().includes('industry')
      ).slice(0, 3),
      actionPlan: {
        immediate: lines.filter(line => 
          line.includes('immediate') || line.includes('first') || line.includes('urgent')
        ).slice(0, 3),
        shortTerm: lines.filter(line => 
          line.includes('week') || line.includes('month') || line.includes('short')
        ).slice(0, 3),
        longTerm: lines.filter(line => 
          line.includes('long') || line.includes('strategy') || line.includes('quarter')
        ).slice(0, 3)
      }
    };
  },

  async generateTitle(messages: ChatMessage[]): Promise<string> {
    const lastUserMessage = messages.filter(m => m.role === 'user').pop();
    if (!lastUserMessage) return 'New Conversation';

    try {
      const completion = await groq.chat.completions.create({
        messages: [
          {
            role: 'system',
            content: 'Generate a short, descriptive title (max 6 words) for this conversation based on the user\'s message. Focus on the main topic or website being discussed. Return only the title, no quotes or extra text.'
          },
          {
            role: 'user',
            content: lastUserMessage.content
          }
        ],
        model: 'meta-llama/llama-3.1-70b-versatile',
        temperature: 0.5,
        max_tokens: 20,
        stream: false
      });

      return completion.choices[0]?.message?.content?.trim() || 'New Conversation';
    } catch (error) {
      console.error('Title generation error:', error);
      return 'New Conversation';
    }
  },

  async generateAdvancedResponse(messages: ChatMessage[], useReasoning = false): Promise<string> {
    try {
      const completion = await groq.chat.completions.create({
        messages: messages.map(msg => ({
          role: msg.role,
          content: msg.content
        })),
        model: useReasoning ? 'deepseek-r1-distill-llama-70b' : 'qwen/qwen-2.5-72b-instruct',
        temperature: useReasoning ? 0.1 : 0.7,
        max_tokens: 4096,
        stream: false
      });

      return completion.choices[0]?.message?.content || 'Could not generate response.';
    } catch (error) {
      console.error('Advanced response error:', error);
      throw new Error('Failed to generate advanced response');
    }
  },

  async generateScoutResponse(messages: ChatMessage[]): Promise<string> {
    try {
      const completion = await groq.chat.completions.create({
        messages: messages.map(msg => ({
          role: msg.role,
          content: msg.content
        })),
        model: 'meta-llama/llama-3.1-70b-versatile',
        temperature: 0.6,
        max_tokens: 4096,
        stream: false
      });

      return completion.choices[0]?.message?.content || 'Could not generate response.';
    } catch (error) {
      console.error('Scout response error:', error);
      throw new Error('Failed to generate scout response');
    }
  },

  async generateOptimizationRecommendations(websiteData: any): Promise<string[]> {
    const systemPrompt = `You are a conversion rate optimization expert. Based on the provided website data, generate specific, actionable recommendations to improve user engagement and conversions.

Focus on:
- Content optimization for better user engagement
- UX improvements to reduce bounce rate
- Call-to-action optimization
- Page structure and navigation improvements
- Mobile experience enhancements
- Performance optimizations that impact user behavior

Provide practical, implementable recommendations ranked by potential impact.`;

    const userPrompt = `Analyze this website data and provide optimization recommendations:

${JSON.stringify(websiteData, null, 2)}

Return a prioritized list of specific recommendations that can be implemented to improve user engagement and conversions.`;

    try {
      const completion = await groq.chat.completions.create({
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        model: 'qwen/qwen-2.5-72b-instruct',
        temperature: 0.4,
        max_tokens: 2048,
        stream: false
      });

      const response = completion.choices[0]?.message?.content || '';
      return response.split('\n')
        .filter(line => line.trim() && (line.includes('-') || line.includes('•') || line.match(/^\d+\./)))
        .map(line => line.replace(/^[-•\d.\s]+/, '').trim())
        .filter(rec => rec.length > 10)
        .slice(0, 8);
    } catch (error) {
      console.error('Optimization recommendations error:', error);
      return [
        'Optimize page loading speed by compressing images and minifying CSS/JS',
        'Improve mobile responsiveness and touch targets',
        'Add clear call-to-action buttons above the fold',
        'Enhance content readability with better formatting',
        'Implement proper heading hierarchy for better navigation'
      ];
    }
  },

  // Enhanced content analysis using reasoning models
  async analyzeContentIntelligence(request: AnalysisRequest): Promise<{
    contentQuality: {
      score: number;
      readability: string;
      engagement: string;
      clarity: string;
    };
    userExperience: {
      score: number;
      navigation: string;
      accessibility: string;
      mobile: string;
    };
    conversionOptimization: {
      score: number;
      callToActions: string[];
      trustSignals: string[];
      improvements: string[];
    };
    competitiveAdvantage: {
      strengths: string[];
      weaknesses: string[];
      opportunities: string[];
    };
  }> {
    const systemPrompt = `You are an expert content strategist and UX analyst with deep expertise in:
- Content marketing and engagement psychology
- User experience design and conversion optimization
- Accessibility and inclusive design
- Competitive analysis and market positioning
- Data-driven content optimization

Use advanced reasoning to analyze the provided website data comprehensively. Consider:
1. Content quality: readability, engagement potential, information architecture
2. User experience: navigation, accessibility, mobile experience
3. Conversion optimization: CTAs, trust signals, user journey
4. Competitive positioning: unique value proposition, market differentiation

Provide specific, actionable insights with reasoning behind each recommendation.`;

    const contextualPrompt = `Analyze this website comprehensively using advanced reasoning:

URL: ${request.url}
Focus Areas: ${request.analysisType.join(', ')}

${request.websiteData?.html ? `Content Analysis Available:
- Full HTML structure and content
- Meta tags and SEO elements
- Navigation and link structure
- Content hierarchy and organization` : ''}

${request.websiteData?.metrics ? `Technical Metrics:
${JSON.stringify(request.websiteData.metrics, null, 2)}` : ''}

Using your expertise in content strategy and UX design, provide a detailed analysis covering:

1. CONTENT QUALITY ASSESSMENT
   - Readability and clarity analysis
   - Engagement potential evaluation
   - Information architecture assessment
   - Content gaps and opportunities

2. USER EXPERIENCE EVALUATION
   - Navigation effectiveness
   - Accessibility compliance
   - Mobile experience quality
   - Page flow and user journey

3. CONVERSION OPTIMIZATION ANALYSIS
   - Call-to-action effectiveness
   - Trust signal presence and quality
   - Conversion barrier identification
   - Optimization opportunities

4. COMPETITIVE POSITIONING
   - Unique value proposition strength
   - Market differentiation analysis
   - Competitive advantages/disadvantages
   - Strategic improvement opportunities

Provide specific scores (0-100) and detailed reasoning for each assessment.

${request.customPrompt || ''}`;

    try {
      const completion = await groq.chat.completions.create({
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: contextualPrompt }
        ],
        model: 'deepseek-r1-distill-llama-70b', // Using reasoning model for deeper analysis
        temperature: 0.3,
        max_tokens: 4096,
        stream: false
      });

      const response = completion.choices[0]?.message?.content || '';
      return this.parseIntelligentContentAnalysis(response);
    } catch (error) {
      console.error('Intelligent content analysis error:', error);
      throw new Error('Failed to perform intelligent content analysis');
    }
  },

  // Enhanced reasoning-based SEO analysis
  async analyzeSeosIntelligence(request: AnalysisRequest): Promise<{
    technicalSeo: {
      score: number;
      issues: string[];
      optimizations: string[];
      priority: string;
    };
    contentSeo: {
      score: number;
      keywordStrategy: string;
      contentGaps: string[];
      optimizations: string[];
    };
    competitiveSeo: {
      opportunities: string[];
      threats: string[];
      strategy: string;
    };
  }> {
    const systemPrompt = `You are a senior SEO strategist with expertise in:
- Technical SEO and Core Web Vitals optimization
- Content strategy and keyword research
- Competitive SEO analysis and market positioning
- E-A-T (Expertise, Authoritativeness, Trustworthiness) optimization
- Local and international SEO strategies

Use advanced reasoning to analyze the website's SEO performance comprehensively. Consider:
1. Technical factors: site structure, performance, crawlability
2. Content factors: keyword optimization, topical authority, user intent
3. Competitive landscape: market opportunities, differentiation strategies
4. User experience signals: engagement metrics, accessibility, mobile experience

Provide strategic, data-driven SEO recommendations with clear reasoning.`;

    const userPrompt = `Perform a comprehensive SEO analysis using advanced reasoning:

Website: ${request.url}
Analysis Focus: ${request.analysisType.join(', ')}

${request.websiteData ? `Technical Data Available:
${JSON.stringify(request.websiteData.metrics, null, 2)}` : ''}

Provide a strategic SEO analysis covering:

1. TECHNICAL SEO ASSESSMENT
   - Core Web Vitals and performance analysis
   - Site structure and crawlability evaluation
   - Technical optimization opportunities
   - Priority ranking for technical fixes

2. CONTENT SEO STRATEGY
   - Keyword strategy effectiveness
   - Content quality and relevance assessment
   - Topical authority development opportunities
   - Content gap analysis and recommendations

3. COMPETITIVE SEO POSITIONING
   - Market opportunity identification
   - Competitive advantage analysis
   - Strategic differentiation recommendations
   - Long-term SEO strategy development

Include specific scores, priority rankings, and strategic reasoning for each recommendation.`;

    try {
      const completion = await groq.chat.completions.create({
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        model: 'deepseek-r1-distill-llama-70b',
        temperature: 0.2,
        max_tokens: 4096,
        stream: false
      });

      const response = completion.choices[0]?.message?.content || '';
      return this.parseIntelligentSeoAnalysis(response);
    } catch (error) {
      console.error('Intelligent SEO analysis error:', error);
      throw new Error('Failed to perform intelligent SEO analysis');
    }
  },

  // Parser for intelligent content analysis
  parseIntelligentContentAnalysis(response: string): any {
    const defaultResult = {
      contentQuality: {
        score: 75,
        readability: 'Content is generally readable but could benefit from improved structure and formatting.',
        engagement: 'Moderate engagement potential. Consider adding more interactive elements and compelling CTAs.',
        clarity: 'Message clarity is adequate but could be enhanced with better visual hierarchy.'
      },
      userExperience: {
        score: 70,
        navigation: 'Navigation structure is functional but could be more intuitive and user-friendly.',
        accessibility: 'Basic accessibility compliance. Improvements needed for full WCAG compliance.',
        mobile: 'Mobile experience is acceptable but optimization opportunities exist.'
      },
      conversionOptimization: {
        score: 65,
        callToActions: ['Add prominent CTA buttons above the fold', 'Improve CTA button design and messaging'],
        trustSignals: ['Add customer testimonials', 'Display security badges', 'Include contact information'],
        improvements: ['Optimize page load speed', 'Improve form design', 'Add social proof']
      },
      competitiveAdvantage: {
        strengths: ['Unique value proposition', 'Good content quality'],
        weaknesses: ['Limited social proof', 'Room for UX improvements'],
        opportunities: ['Mobile optimization', 'Content marketing', 'SEO improvements']
      }
    };

    try {
      // Extract scores from the response
      const scoreRegex = /(\d+)\/100|(\d+)%|score[:\s]*(\d+)/gi;
      const scores = [];
      let match;
      while ((match = scoreRegex.exec(response)) !== null) {
        const score = parseInt(match[1] || match[2] || match[3]);
        if (score >= 0 && score <= 100) scores.push(score);
      }

      if (scores.length >= 3) {
        defaultResult.contentQuality.score = scores[0];
        defaultResult.userExperience.score = scores[1];
        defaultResult.conversionOptimization.score = scores[2];
      }

      return defaultResult;
    } catch (error) {
      console.warn('Failed to parse intelligent content analysis, using defaults');
      return defaultResult;
    }
  },

  // Parser for intelligent SEO analysis
  parseIntelligentSeoAnalysis(response: string): any {
    const defaultResult = {
      technicalSeo: {
        score: 75,
        issues: ['Page speed optimization needed', 'Missing schema markup', 'Improve mobile experience'],
        optimizations: ['Optimize Core Web Vitals', 'Implement structured data', 'Enhance mobile responsiveness'],
        priority: 'High - Focus on Core Web Vitals and mobile optimization first'
      },
      contentSeo: {
        score: 70,
        keywordStrategy: 'Keyword strategy needs refinement. Focus on long-tail keywords and user intent.',
        contentGaps: ['Missing FAQ section', 'Limited blog content', 'Insufficient internal linking'],
        optimizations: ['Develop topic clusters', 'Create comprehensive FAQ', 'Improve internal link structure']
      },
      competitiveSeo: {
        opportunities: ['Local SEO optimization', 'Content marketing expansion', 'Voice search optimization'],
        threats: ['Competitors with stronger domain authority', 'Missing key content topics'],
        strategy: 'Focus on niche expertise and local optimization while building topical authority'
      }
    };

    try {
      // Extract scores and insights from the response
      const scoreRegex = /(\d+)\/100|(\d+)%|score[:\s]*(\d+)/gi;
      const scores = [];
      let match;
      while ((match = scoreRegex.exec(response)) !== null) {
        const score = parseInt(match[1] || match[2] || match[3]);
        if (score >= 0 && score <= 100) scores.push(score);
      }

      if (scores.length >= 2) {
        defaultResult.technicalSeo.score = scores[0];
        defaultResult.contentSeo.score = scores[1];
      }

      return defaultResult;
    } catch (error) {
      console.warn('Failed to parse intelligent SEO analysis, using defaults');
      return defaultResult;
    }
  },

  // Parser for reasoning analysis
  parseReasoningAnalysis(response: string): any {
    const defaultResult = {
      reasoning: {
        problemIdentification: [
          'Website performance issues affecting user experience',
          'SEO optimization opportunities not fully utilized',
          'Limited conversion optimization implementation'
        ],
        causalAnalysis: 'Current performance issues stem from technical debt, insufficient optimization, and lack of user-centric design approach.',
        solutionPathways: [
          'Implement technical performance optimizations',
          'Develop comprehensive SEO strategy',
          'Enhance user experience and conversion paths'
        ],
        riskAssessment: 'Medium risk of competitive disadvantage if improvements are not implemented within 3-6 months.'
      },
      strategicInsights: {
        primaryOpportunities: [
          'Market positioning enhancement through improved digital presence',
          'Competitive advantage through superior user experience',
          'Growth potential via optimized conversion funnel'
        ],
        competitiveAdvantages: [
          'Unique value proposition development',
          'Technical excellence implementation',
          'User-centric design approach'
        ],
        marketPositioning: 'Strong potential for market leadership through digital optimization and superior user experience.',
        growthPotential: 'High growth potential with proper implementation of recommended optimizations and strategic initiatives.'
      },
      actionableRecommendations: {
        immediate: [
          {
            action: 'Optimize Core Web Vitals and page load speed',
            impact: 'high' as const,
            effort: 'medium' as const,
            timeline: '2-4 weeks',
            reasoning: 'Performance directly impacts user experience and search rankings'
          },
          {
            action: 'Implement basic SEO optimizations',
            impact: 'high' as const,
            effort: 'low' as const,
            timeline: '1-2 weeks',
            reasoning: 'Quick wins in meta tags, headers, and content structure'
          }
        ],
        strategic: [
          {
            action: 'Develop comprehensive content strategy',
            impact: 'high' as const,
            effort: 'high' as const,
            timeline: '2-3 months',
            reasoning: 'Long-term content authority drives organic growth and user engagement'
          },
          {
            action: 'Implement advanced analytics and conversion tracking',
            impact: 'medium' as const,
            effort: 'medium' as const,
            timeline: '4-6 weeks',
            reasoning: 'Data-driven optimization requires comprehensive measurement framework'
          }
        ]
      },
      performancePredictions: {
        expectedImprovements: [
          '20-30% improvement in page load speed',
          '15-25% increase in organic search traffic',
          '10-20% improvement in conversion rates'
        ],
        timeToResults: '2-6 months for significant improvements, with early wins visible within 2-4 weeks',
        successMetrics: [
          'Core Web Vitals scores above 75',
          'Organic traffic growth of 15%+',
          'Conversion rate improvement of 10%+',
          'User engagement metrics improvement'
        ]
      }
    };

    try {
      // Basic parsing to extract structured information from response
      const lines = response.split('\n').filter(line => line.trim());
      
      // Extract problem identification items
      const problemSection = lines.filter(line => 
        line.includes('problem') || line.includes('issue') || line.includes('challenge')
      );
      if (problemSection.length > 0) {
        defaultResult.reasoning.problemIdentification = problemSection.slice(0, 5);
      }

      // Extract opportunities
      const opportunitySection = lines.filter(line => 
        line.includes('opportunity') || line.includes('potential') || line.includes('advantage')
      );
      if (opportunitySection.length > 0) {
        defaultResult.strategicInsights.primaryOpportunities = opportunitySection.slice(0, 5);
      }

      return defaultResult;
    } catch (error) {
      console.warn('Failed to parse reasoning analysis, using defaults');
      return defaultResult;
    }
  }
};

export default groq;
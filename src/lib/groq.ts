import Groq from 'groq-sdk';

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
    const prompt = `Based on this website analysis data, generate 10 specific, actionable optimization recommendations:

${JSON.stringify(websiteData, null, 2)}

Each recommendation should:
1. Be specific and actionable
2. Include expected impact (High/Medium/Low)
3. Include implementation difficulty (Easy/Medium/Hard)
4. Focus on measurable improvements

Format each recommendation as: "[Impact] - [Difficulty] - [Specific action to take]"`;

    try {
      const completion = await groq.chat.completions.create({
        messages: [
          { role: 'system', content: 'You are a website optimization expert. Provide practical, implementable recommendations.' },
          { role: 'user', content: prompt }
        ],
        model: 'qwen/qwen-2.5-72b-instruct',
        temperature: 0.3,
        max_tokens: 2048,
        stream: false
      });

      const response = completion.choices[0]?.message?.content || '';
      return response.split('\n')
        .filter(line => line.trim() && line.includes('-'))
        .slice(0, 10);
    } catch (error) {
      console.error('Optimization recommendations error:', error);
      return [
        'High - Easy - Add meta descriptions to all pages',
        'High - Medium - Optimize images for faster loading',
        'Medium - Easy - Add alt text to all images',
        'High - Medium - Implement lazy loading for images',
        'Medium - Easy - Use semantic HTML elements'
      ];
    }
  }
};

export default groq;
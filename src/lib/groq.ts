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
}

export interface ScreenshotRequest {
  url: string;
  options?: {
    width?: number;
    height?: number;
    device?: 'desktop' | 'mobile' | 'tablet';
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
    const systemPrompt = `You are an expert web analyst with deep knowledge of SEO, performance optimization, security, and user experience. 

Analyze the website at ${request.url} and provide comprehensive insights on the following areas: ${request.analysisType.join(', ')}.

For each analysis area, provide:
1. Current status and scores (0-100)
2. Specific issues found
3. Actionable recommendations
4. Priority level (High/Medium/Low)
5. Expected impact of improvements

Be thorough, specific, and provide practical advice that can be implemented.`;

    const userPrompt = request.customPrompt || `Please analyze ${request.url} for ${request.analysisType.join(', ')} and provide detailed recommendations.`;

    const messages: ChatMessage[] = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ];

    try {
      const completion = await groq.chat.completions.create({
        messages,
        model: 'qwen/qwen-2.5-72b-instruct', // Using Qwen model for reasoning and analysis
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

  async generateTitle(messages: ChatMessage[]): Promise<string> {
    const lastUserMessage = messages.filter(m => m.role === 'user').pop();
    if (!lastUserMessage) return 'New Conversation';

    try {
      const completion = await groq.chat.completions.create({
        messages: [
          {
            role: 'system',
            content: 'Generate a short, descriptive title (max 6 words) for this conversation based on the user\'s message. Return only the title, no quotes or extra text.'
          },
          {
            role: 'user',
            content: lastUserMessage.content
          }
        ],
        model: 'meta-llama/llama-3.1-70b-versatile', // Using Llama for title generation
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
        temperature: useReasoning ? 0.1 : 0.7, // Lower temperature for reasoning tasks
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
        model: 'meta-llama/llama-3.1-70b-versatile', // Using available Llama model as fallback
        temperature: 0.6,
        max_tokens: 4096,
        stream: false
      });

      return completion.choices[0]?.message?.content || 'Could not generate response.';
    } catch (error) {
      console.error('Scout response error:', error);
      throw new Error('Failed to generate scout response');
    }
  }
};

export default groq;
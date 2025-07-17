import Groq from 'groq-sdk'

const groqApiKey = import.meta.env.VITE_GROQ_API_KEY

if (!groqApiKey) {
  throw new Error('Missing Groq API key. Make sure VITE_GROQ_API_KEY is set in your .env file.')
}

export const groq = new Groq({
  apiKey: groqApiKey,
  dangerouslyAllowBrowser: true, // Required for client-side usage
})

// Available Groq models based on the documentation
export const GROQ_MODELS = {
  // Production models
  LLAMA_33_70B: 'llama-3.3-70b-versatile',
  LLAMA_31_8B: 'llama-3.1-8b-instant',
  
  // Preview models  
  LLAMA_4_MAVERICK: 'meta-llama/llama-4-maverick-17b-128e-instruct',
  LLAMA_4_SCOUT: 'meta-llama/llama-4-scout-17b-16e-instruct', 
  DEEPSEEK_R1_LLAMA: 'deepseek-r1-distill-llama-70b',
  DEEPSEEK_R1_QWEN: 'deepseek-r1-distill-qwen-32b',
  QWEN_25_32B: 'qwen-2.5-32b',
  
  // Kimi K2 for improvements (as requested)
  KIMI_K2: 'kimi-k2-instruct'
} as const

// Default model configurations
export const MODEL_CONFIGS = {
  [GROQ_MODELS.LLAMA_33_70B]: {
    maxTokens: 8192,
    temperature: 0.7,
    topP: 0.9,
  },
  [GROQ_MODELS.KIMI_K2]: {
    maxTokens: 8192,
    temperature: 0.6,
    topP: 0.8,
  },
  [GROQ_MODELS.DEEPSEEK_R1_LLAMA]: {
    maxTokens: 131072,
    temperature: 0.6,
    topP: 0.8,
  }
} as const

// Helper function to generate text with Groq
export async function generateWithGroq(
  prompt: string,
  model: string = GROQ_MODELS.LLAMA_33_70B,
  options: {
    maxTokens?: number
    temperature?: number
    topP?: number
    system?: string
  } = {}
) {
  const config = MODEL_CONFIGS[model as keyof typeof MODEL_CONFIGS] || MODEL_CONFIGS[GROQ_MODELS.LLAMA_33_70B]
  
  try {
    const completion = await groq.chat.completions.create({
      model,
      messages: [
        ...(options.system ? [{ role: 'system' as const, content: options.system }] : []),
        { role: 'user' as const, content: prompt }
      ],
      max_tokens: options.maxTokens || config.maxTokens,
      temperature: options.temperature || config.temperature,
      top_p: options.topP || config.topP,
    })

    return completion.choices[0]?.message?.content || ''
  } catch (error) {
    console.error('Groq API Error:', error)
    throw new Error('Failed to generate response from Groq')
  }
}

// Helper function for website improvement using Kimi K2
export async function improveWebsiteWithKimi(
  websiteAnalysis: string,
  improvements?: string
) {
  const prompt = `
As an expert web developer and UX designer, analyze this website and provide specific, actionable improvements:

Website Analysis:
${websiteAnalysis}

${improvements ? `Specific areas to focus on: ${improvements}` : ''}

Please provide:
1. Priority improvements (High/Medium/Low)
2. Specific implementation suggestions
3. Expected impact on user experience
4. Modern design trends to consider
5. Performance optimization opportunities

Format your response in markdown with clear sections and actionable recommendations.
`

  return generateWithGroq(
    prompt, 
    GROQ_MODELS.KIMI_K2,
    {
      system: "You are an expert web developer and UX designer specializing in modern, accessible, and high-converting website designs.",
      temperature: 0.6
    }
  )
}

export default groq 
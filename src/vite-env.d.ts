/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SCRAPINGBEE_API_KEY: string
  readonly VITE_GROQ_API_KEY: string
  readonly VITE_SUPABASE_URL: string
  readonly VITE_SUPABASE_ANON_KEY: string
  readonly VITE_API_TIMEOUT: string
  readonly VITE_MAX_CONCURRENT_REQUESTS: string
  readonly VITE_ENABLE_DEBUG: string
  readonly VITE_ENABLE_AI_ANALYSIS: string
  readonly VITE_ENABLE_SCREENSHOTS: string
  readonly VITE_ENABLE_BULK_ANALYSIS: string
  readonly VITE_ENABLE_SCHEDULED_REPORTS: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

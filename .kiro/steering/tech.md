# Technology Stack & Build System

## Frontend Stack

- **Framework**: React 18 with TypeScript (strict mode)
- **Build Tool**: Vite with optimized bundling and code splitting
- **Styling**: Tailwind CSS with custom theme and dark mode support
- **UI Components**: Radix UI primitives + custom components
- **Animations**: Framer Motion for smooth interactions
- **Routing**: React Router v6 with lazy loading
- **State Management**: React Context API
- **Charts**: Recharts for data visualization

## Backend & Services

- **Authentication**: Supabase Auth with GitHub OAuth
- **Database**: Supabase PostgreSQL
- **Enhancement Service**: Next.js 14 API routes (separate service)
- **AI Integration**: 
  - Groq SDK for website analysis
  - Gemini 2.5 Flash for code enhancements
- **Web Scraping**: ScrapingBee API

## Development Tools

- **Package Manager**: Bun (preferred) or pnpm/npm
- **Linting**: ESLint with TypeScript rules
- **Type Checking**: TypeScript with strict configuration
- **Bundling**: Vite with manual chunk splitting for optimization

## Common Commands

```bash
# Development
bun run dev              # Start dev server (port 5173)
bun run build           # Production build
bun run preview         # Preview production build
bun run lint            # Run ESLint

# Enhancement Service
cd enhancement-service
npm run dev             # Start service (port 3001)
npm run build           # Build service
npm run start           # Start production service

# Analysis
ANALYZE=true bun run build  # Generate bundle analyzer
```

## Environment Configuration

- Main app uses `.env.local` with VITE_ prefixed variables
- Enhancement service uses `.env.local` with standard Node.js variables
- Required APIs: Supabase, ScrapingBee, Groq, Google Generative AI

## Performance Optimizations

- Code splitting with manual chunks for vendors
- PWA configuration with service worker caching
- Gzip/Brotli compression
- Asset optimization and inlining
- Lazy loading for all route components
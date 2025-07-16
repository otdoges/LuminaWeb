# Project Structure & Organization

## Root Directory Layout

```
├── src/                    # Main React application
├── enhancement-service/    # Separate Next.js API service
├── public/                # Static assets (favicon, manifest, etc.)
├── supabase/              # Database migrations
├── docs/                  # Project documentation
└── .kiro/                 # Kiro configuration and steering
```

## Source Code Organization (`src/`)

```
src/
├── components/            # Reusable UI components
│   ├── ui/               # Base UI components (buttons, inputs, dialogs)
│   ├── auth/             # Authentication-related components
│   ├── dashboard/        # Dashboard-specific components
│   ├── analysis/         # Website analysis components
│   ├── chat/             # AI chat interface components
│   ├── charts/           # Data visualization components
│   ├── analytics/        # Analytics and tracking components
│   ├── mobile/           # Mobile-optimized components
│   ├── motion/           # Framer Motion animation components
│   ├── demo/             # Demo and showcase components
│   └── debug/            # Development/debugging components
├── pages/                # Route components (lazy loaded)
├── context/              # React context providers
├── lib/                  # Utilities and API clients
├── hooks/                # Custom React hooks
├── types/                # TypeScript type definitions
├── styles/               # Global styles and Tailwind config
├── middleware/           # Request/response middleware
├── App.tsx               # Main app component with routing
├── main.tsx              # React app entry point
└── index.css             # Global styles and CSS variables
```

## Component Architecture Patterns

### UI Components (`src/components/ui/`)
- Base components using Radix UI primitives
- Consistent styling with Tailwind CSS
- TypeScript interfaces for all props
- Compound component patterns where appropriate

### Feature Components
- Organized by domain (auth, dashboard, analysis, etc.)
- Each feature folder contains related components
- Shared components promoted to `ui/` when reused

### Page Components (`src/pages/`)
- Lazy loaded for performance
- Handle routing and high-level state
- Compose feature components
- Protected routes with authentication checks

## Library Organization (`src/lib/`)

- **API Clients**: `supabase.ts`, `groq.ts`, `scrapingbee.ts`
- **Services**: `siteEnhancement.ts`, `cachedAnalysisService.ts`
- **Utilities**: `utils.ts`, `motionConfig.ts`
- **Security**: `apiSecurity.ts`, `rateLimiter.ts`
- **Performance**: `cachingLayer.ts`, `requestDeduplication.ts`
- **Analytics**: `plausibleAnalytics.ts`, `analyticsDetection.ts`

## Enhancement Service Structure

```
enhancement-service/
├── src/
│   └── pages/api/        # Next.js API routes
├── package.json          # Service dependencies
├── next.config.js        # Next.js configuration
└── README.md            # Service documentation
```

## Configuration Files

- **TypeScript**: Split config (`tsconfig.json`, `tsconfig.app.json`, `tsconfig.node.json`)
- **Vite**: Optimized build with code splitting (`vite.config.ts`)
- **Tailwind**: Custom theme with animations (`tailwind.config.js`)
- **ESLint**: TypeScript and React rules (`eslint.config.js`)

## Naming Conventions

- **Components**: PascalCase (`UserProfile.tsx`)
- **Files**: camelCase for utilities, PascalCase for components
- **Directories**: lowercase with hyphens for multi-word (`enhancement-service`)
- **Types**: PascalCase interfaces and types
- **Constants**: UPPER_SNAKE_CASE for environment variables

## Import Organization

1. React and external libraries
2. Internal components (relative imports)
3. Utilities and types
4. Styles (if any)

## File Naming Patterns

- Components: `ComponentName.tsx`
- Hooks: `useHookName.ts`
- Types: `types.ts` or `ComponentName.types.ts`
- Utils: `utilityName.ts`
- Context: `ContextName.tsx` or `ContextNameContext.tsx`
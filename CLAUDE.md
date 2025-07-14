# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Essential Commands
- `bun run dev` - Start development server with hot reload (preferred)
- `pnpm run dev` - Alternative package manager (fallback)
- `bun run build` - Build for production
- `bun run lint` - Run ESLint to check code quality and fix issues
- `bun run preview` - Preview production build locally

### Build Analysis
- `ANALYZE=true bun run build` - Generate bundle analyzer in `dist/stats.html`

### Package Management
Always use `bun` as the primary package manager (fallback to `pnpm`, then `npm`). Install packages with `bun add <package>` or `bun add -d <package>` for dev dependencies.

## Project Architecture

### Technology Stack
- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS with custom theme configuration
- **Authentication**: Supabase Auth with GitHub OAuth
- **Database**: Supabase PostgreSQL
- **State Management**: React Context (AuthContext, ThemeContext)
- **Routing**: React Router v6 with lazy loading
- **UI Components**: Custom components + Radix UI primitives
- **Animations**: Framer Motion
- **Charts**: Recharts
- **AI Integration**: Groq SDK for AI analysis features
- **Web Scraping**: ScrapingBee for comprehensive website analysis

### Application Structure

#### Core Architecture
The app follows a context-provider pattern with route-based code splitting:

1. **App.tsx**: Main application wrapper with providers (Theme, Auth, Notifications)
2. **main.tsx**: React root rendering with StrictMode
3. **AuthContext**: Handles all authentication state and Supabase integration
4. **Route Protection**: Authentication-based navigation in App.tsx

#### Key Directories
- `src/pages/` - Route components (Dashboard, AnalysisPage, ChatPage, etc.)
- `src/components/` - Organized by feature (auth, dashboard, analysis, ui, mobile, motion)
- `src/context/` - React context providers for global state
- `src/lib/` - Utilities, API clients, and service layers
- `src/types/` - TypeScript type definitions
- `src/hooks/` - Custom React hooks

#### Authentication Flow
- Supabase handles auth state with automatic session management
- GitHub OAuth and email/password authentication supported
- User profiles automatically created/updated in database on sign-in
- Route-level protection with automatic redirects

#### Component Organization
- **UI Components**: Reusable components in `src/components/ui/`
- **Feature Components**: Grouped by domain (analysis, auth, dashboard, chat)
- **Motion Components**: Framer Motion animations in dedicated folder
- **Mobile Components**: Mobile-optimized versions for responsive design

#### Performance Optimizations
- Lazy loading for all page components
- Bundle splitting configured in vite.config.ts
- PWA support with service worker caching
- Gzip and Brotli compression
- Image optimization and asset inlining

### Development Workflow

#### Code Style & Development Standards
- ESLint configured with React and TypeScript rules
- TypeScript strict mode enabled with explicit types
- Prefer `interface` over `type` for object shapes
- Use `React.memo()` for components with stable props
- Implement proper dependency arrays in React hooks
- Always use Framer Motion for animations (`motion.div`, `AnimatePresence`)
- Use Tailwind CSS with consistent spacing (4, 6, 8, 12, 16, 24)
- Implement dark mode using CSS variables and `dark:` prefix
- No test framework currently configured

#### Environment Setup
- **Required**: Create `.env.local` with Supabase, ScrapingBee, and Groq API keys
- Environment variables must be prefixed with `VITE_` for client-side access
- Never hardcode API keys - always use environment variables
- Use `apiSecurity.ts` for all external API calls with built-in rate limiting
- Development server runs on localhost with auto-open and hot reload

### Key Patterns

#### Component Structure
- React functional components with TypeScript
- Custom hooks for reusable logic
- Context providers for global state
- Lazy loading for route-level components

#### State Management
- AuthContext for authentication state
- ThemeContext for dark/light mode
- Local state with useState/useReducer
- No external state management library

#### API Integration
- Supabase client for database operations and authentication
- Groq SDK for AI-powered analysis
- ScrapingBee for web scraping and screenshot capture
- Custom API security layer (`apiSecurity.ts`) with encryption and validation
- Rate limiting and request deduplication (`rateLimiter.ts`, `requestDeduplication.ts`)
- Caching layer for analysis results (`cachingLayer.ts`, `cachedAnalysisService.ts`)

## Required Environment Variables

Create `.env.local` in the project root with these variables:

```bash
# Supabase Configuration (REQUIRED for authentication)
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here

# ScrapingBee API Configuration
VITE_SCRAPINGBEE_API_KEY=your_scrapingbee_api_key_here

# Groq AI API Configuration  
VITE_GROQ_API_KEY=your_groq_api_key_here

# Analytics Provider Configuration (self-hosted)
VITE_ANALYTICS_PROVIDER_URL=https://your-vps-analytics.domain.com
VITE_ANALYTICS_PROVIDER_KEY=your_analytics_provider_api_key

# LuminaWeb Enhancement Service
VITE_ENHANCEMENT_SERVICE_URL=https://enhance.luminaweb.app
VITE_ENHANCEMENT_SERVICE_API_KEY=your_enhancement_service_api_key

# API Configuration
VITE_API_TIMEOUT=30000
VITE_ENVIRONMENT=development
```

## Security Requirements

- **Never commit API keys**: Use `.env.local` for sensitive configuration
- **API Security**: Use `secureApiCall()` from `apiSecurity.ts` for external requests
- **Input Validation**: Use `validateRequest()` from `requestValidator.ts` 
- **Rate Limiting**: Built-in protection via `rateLimiter.ts`
- **Data Encryption**: Use built-in encryption utilities for sensitive data

## Accessibility Compliance

### WCAG/ADA Standards
This project follows WCAG 2.1 Level AA compliance standards:

- **Semantic HTML**: Use proper HTML5 semantic elements (`nav`, `main`, `header`, `footer`, `section`)
- **ARIA Labels**: Include appropriate `aria-label`, `aria-labelledby`, and `role` attributes
- **Keyboard Navigation**: Ensure all interactive elements are keyboard accessible
- **Focus Management**: Implement proper focus indicators and focus trapping where needed
- **Color Contrast**: Maintain WCAG AA contrast ratios (4.5:1 for normal text, 3:1 for large text)
- **Screen Reader Support**: Use `sr-only` classes and `aria-hidden` for decorative elements
- **Skip Links**: Provide skip navigation for keyboard users

### Accessibility Utilities
- Use `src/lib/accessibility.ts` for contrast checking and focus management
- Include `SkipLink` component for keyboard navigation
- Test with screen readers and keyboard-only navigation

## Git Workflow

### Automatic Commits
**IMPORTANT**: After making any code changes, always commit them immediately with descriptive commit messages.

#### Required Commit Process
1. **After any code modification**: Immediately stage and commit changes
2. **Commit Message Format**: Use conventional commit format:
   ```
   feat: add new feature description
   fix: resolve specific issue
   style: update styling/UI improvements
   refactor: code restructuring
   docs: documentation updates
   accessibility: WCAG compliance improvements
   ```

#### Git Commands to Run After Changes
```bash
# Stage all changes
git add .

# Commit with descriptive message
git commit -m "feat: implement WCAG compliance improvements with semantic HTML and ARIA labels"

# Push to remote (if requested by user)
git push origin main
```

### Commit Guidelines
- **Never skip commits**: Every modification must be committed
- **Descriptive messages**: Explain what was changed and why
- **Small, focused commits**: One logical change per commit
- **Include file context**: Mention which components/files were modified
- **Test before commit**: Ensure code builds and runs without errors

### Branch Management
- Work on `main` branch unless specifically requested otherwise
- Create feature branches only when explicitly requested
- Always ensure clean working directory before starting new work

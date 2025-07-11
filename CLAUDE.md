# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Essential Commands
- `pnpm run dev` - Start development server with hot reload
- `pnpm run build` - Build for production
- `pnpm run lint` - Run ESLint to check code quality
- `pnpm run preview` - Preview production build locally

### Build Analysis
- `ANALYZE=true npm run build` - Generate bundle analyzer in `dist/stats.html`

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

#### Code Style
- ESLint configured with React and TypeScript rules
- Tailwind CSS for styling with custom theme
- TypeScript strict mode enabled
- No test framework currently configured

#### Environment Setup
- Supabase integration requires environment variables
- Development server runs on localhost with auto-open
- Hot reload enabled for fast development

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
- Supabase client for database operations
- Groq SDK for AI-powered analysis
- ScrapingBee for web scraping (analysis features)
- Custom API security and rate limiting utilities

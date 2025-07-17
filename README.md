# LuminaWeb 🌟

A modern, AI-powered website analysis platform built with React, TypeScript, and cutting-edge web technologies. LuminaWeb provides comprehensive website analysis, SEO insights, performance metrics, and AI-driven recommendations to help you optimize your web presence.

![LuminaWeb Dashboard](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)

## ✨ Features

### 🔍 Website Analysis
- **Comprehensive SEO Analysis** - Meta tags, headers, keywords, and optimization recommendations
- **Performance Metrics** - Core Web Vitals, loading times, and performance optimization insights
- **Accessibility Audits** - WCAG compliance checks and accessibility improvements
- **Mobile Responsiveness** - Cross-device compatibility analysis
- **Security Scanning** - SSL certificates, security headers, and vulnerability assessments

### 🤖 AI-Powered Insights
- **Smart Recommendations** - AI-driven suggestions for website improvements
- **Content Analysis** - Automated content quality and readability assessments
- **Competitive Analysis** - Compare your site against industry standards
- **Trend Predictions** - Future-focused optimization strategies

### 📊 Advanced Dashboard
- **Real-time Analytics** - Live performance monitoring and alerts
- **Historical Data** - Track improvements over time with detailed charts
- **Custom Reports** - Generate detailed PDF reports for stakeholders
- **Team Collaboration** - Share insights and collaborate on optimizations

### 🎨 Modern User Experience
- **Dark/Light Mode** - Elegant theme switching with smooth transitions
- **Responsive Design** - Optimized for desktop, tablet, and mobile devices
- **Smooth Animations** - Framer Motion powered interactions
- **Intuitive Navigation** - User-friendly interface with guided workflows

## 🚀 Quick Start

### Prerequisites

- **Node.js** (v18 or higher)
- **Bun** (recommended) or **pnpm**/**npm**
- **Supabase Account** - For authentication and database
- **ScrapingBee API Key** - For website scraping capabilities
- **Groq API Key** - For AI analysis features

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/otdoges/luminaweb.git
   cd luminaweb
   ```

2. **Install dependencies**
   ```bash
   bun install
   # or
   pnpm install
   ```

3. **Environment Setup**
   
   Create a `.env.local` file in the project root:
   ```bash
   # Supabase Configuration (REQUIRED)
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here

   # ScrapingBee API Configuration
   VITE_SCRAPINGBEE_API_KEY=your_scrapingbee_api_key_here

   # Groq AI API Configuration  
   VITE_GROQ_API_KEY=your_groq_api_key_here

   # Analytics Provider Configuration (optional)
   VITE_ANALYTICS_PROVIDER_URL=https://your-analytics.domain.com
   VITE_ANALYTICS_PROVIDER_KEY=your_analytics_api_key

   # LuminaWeb Enhancement Service (optional)
   VITE_ENHANCEMENT_SERVICE_URL=https://enhance.luminaweb.app
   VITE_ENHANCEMENT_SERVICE_API_KEY=your_enhancement_api_key

   # API Configuration
   VITE_API_TIMEOUT=30000
   VITE_ENVIRONMENT=development
   ```

4. **Start the development server**
   ```bash
   bun run dev
   ```

   The application will be available at `http://localhost:5173`

## 🛠️ Development

### Available Scripts

- `bun run dev` - Start development server with hot reload
- `bun run build` - Build for production
- `bun run preview` - Preview production build locally
- `bun run lint` - Run ESLint to check code quality
- `ANALYZE=true bun run build` - Generate bundle analyzer

### Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── ui/             # Base UI components (buttons, inputs, etc.)
│   ├── auth/           # Authentication components
│   ├── dashboard/      # Dashboard-specific components
│   ├── analysis/       # Website analysis components
│   ├── chat/           # AI chat interface components
│   ├── mobile/         # Mobile-optimized components
│   └── motion/         # Framer Motion animation components
├── pages/              # Route components
├── context/            # React context providers
├── lib/                # Utilities and API clients
├── hooks/              # Custom React hooks
├── types/              # TypeScript type definitions
└── styles/             # Global styles and Tailwind config
```

### Technology Stack

- **Frontend Framework**: React 18 with TypeScript
- **Build Tool**: Vite with optimized bundling
- **Styling**: Tailwind CSS with custom theme
- **Authentication**: Supabase Auth with GitHub OAuth
- **Database**: Supabase PostgreSQL
- **State Management**: React Context API
- **Routing**: React Router v6 with lazy loading
- **UI Components**: Radix UI primitives + custom components
- **Animations**: Framer Motion
- **Charts**: Recharts for data visualization
- **AI Integration**: Groq SDK for analysis
- **Web Scraping**: ScrapingBee API

## 📊 Features Overview

### Authentication & User Management
- GitHub OAuth integration
- Email/password authentication
- Automatic user profile creation
- Session management with Supabase

### Website Analysis Engine
- **SEO Analysis**: Meta tags, headers, structured data
- **Performance Testing**: Core Web Vitals, loading speeds
- **Accessibility Audits**: WCAG compliance checks
- **Security Scanning**: SSL, headers, vulnerabilities
- **Mobile Analysis**: Responsive design validation

### AI-Powered Features
- Intelligent content analysis
- Automated optimization suggestions
- Competitive benchmarking
- Performance prediction models

### Data & Analytics
- Real-time performance monitoring
- Historical trend analysis
- Custom report generation
- Export capabilities (PDF, CSV)

## 🔒 Security & Performance

### Security Features
- API key encryption and secure storage
- Request validation and sanitization
- Rate limiting and request deduplication
- CORS protection and secure headers
- Input validation with Zod schemas

### Performance Optimizations
- Code splitting and lazy loading
- Bundle analysis and optimization
- Service worker caching (PWA)
- Image optimization and compression
- Gzip/Brotli compression

## 🤝 Contributing

We welcome contributions to LuminaWeb! Please follow these guidelines:

1. **Fork the repository** and create your feature branch
2. **Follow code standards** - ESLint configuration is provided
3. **Write TypeScript** - Maintain strict typing
4. **Test your changes** - Ensure all functionality works
5. **Submit a pull request** with detailed description

### Code Style Guidelines
- Use TypeScript with strict mode
- Prefer `interface` over `type` for object shapes
- Use React functional components with hooks
- Implement proper dependency arrays
- Use Framer Motion for animations
- Follow Tailwind CSS conventions

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🌟 Acknowledgments

- **Supabase** - Backend infrastructure and authentication
- **ScrapingBee** - Web scraping capabilities
- **Groq** - AI analysis and insights
- **Radix UI** - Accessible component primitives
- **Tailwind CSS** - Utility-first styling
- **Framer Motion** - Smooth animations and transitions

---

Built with ❤️ by the LuminaWeb team. Star this project if you find it useful!

# Snap2Sell - Feature Documentation

## Project Overview

**Snap2Sell** (formerly Snap2Cash) is a comprehensive AI-powered image analysis platform that helps users discover item value and insights through multiple analysis providers.

## Latest Updates (v1.0.0)

### 🆕 New Features

#### 4th Analysis Provider - OpenLens
- **Custom FastAPI Integration**: Built-in Python server for advanced analysis
- **Google Lens Automation**: Selenium-powered web search
- **Web Scraping**: BeautifulSoup content extraction
- **AI Analysis**: OpenAI GPT-4o-mini for comprehensive insights
- **Direct API Integration**: Bypasses Supabase for development efficiency

#### Enhanced Development Experience
- **Single Command Startup**: `npm run dev:full` starts both web and API servers
- **Improved NPM Scripts**: Separate commands for individual services
- **Better Error Handling**: Unicode-safe terminal output
- **Security Improvements**: Protected API keys and sensitive data

#### Updated Architecture
- **Multi-Provider Support**: 4 analysis engines with unified interface
- **Flexible Backend**: Mix of Supabase Edge Functions and custom APIs
- **Modern UI**: Consistent design across all providers
- **Type Safety**: Full TypeScript coverage

## Analysis Providers

### 1. 🤖 Gemini AI Analysis
- **Technology**: Google Gemini Pro API
- **Strengths**: Advanced AI reasoning, detailed valuations
- **Use Case**: Comprehensive product analysis and resale estimates
- **Integration**: Supabase Edge Function

### 2. 🔍 SerpAPI Analysis  
- **Technology**: SerpAPI Google Lens
- **Strengths**: Visual matches, web search results
- **Use Case**: Finding similar items across the web
- **Integration**: Supabase Edge Function

### 3. 🔎 SearchAPI Analysis
- **Technology**: SearchAPI visual search
- **Strengths**: Market analysis, pricing insights
- **Use Case**: Price discovery and market research
- **Integration**: Supabase Edge Function

### 4. 👁️ OpenLens Analysis *(New!)*
- **Technology**: Custom FastAPI + OpenAI
- **Strengths**: Most comprehensive analysis with web scraping
- **Use Case**: Thorough analysis combining multiple data sources
- **Integration**: Direct API calls to local Python server

## Technical Stack

### Frontend
- **React 19** with TypeScript
- **Vite** for fast development
- **Tailwind CSS** for styling
- **Framer Motion** for animations
- **React Router** for navigation

### Backend
- **Supabase** (PostgreSQL + Auth + Storage + Edge Functions)
- **Custom FastAPI** server (Python) for OpenLens
- **Deno** runtime for edge functions

### Analysis Technologies
- **Google Gemini Pro** - Advanced AI analysis
- **SerpAPI** - Google Lens visual search
- **SearchAPI** - Visual search capabilities
- **OpenAI GPT-4o-mini** - AI insights and reasoning
- **Selenium** - Web automation for Google Lens
- **BeautifulSoup** - Web content scraping

### Development Tools
- **TypeScript** - Type safety
- **ESLint** - Code quality
- **Concurrently** - Multi-process development
- **Git** - Version control

## Project Structure

```
Snap2Sell/
├── src/                          # Web application source
│   ├── components/               # React components
│   ├── pages/                    # Page components
│   │   ├── analysis/             # Analysis provider pages
│   │   └── auth/                 # Authentication pages
│   ├── services/                 # API and analysis services
│   ├── types/                    # TypeScript interfaces
│   ├── hooks/                    # React hooks
│   ├── contexts/                 # React contexts
│   └── utils/                    # Utility functions
├── supabase/                     # Supabase configuration
│   ├── functions/                # Edge functions
│   └── migrations/               # Database migrations
├── openlens-app/                 # Custom Python API server
│   ├── src/                      # Python source code
│   ├── data/                     # Runtime data (excluded from git)
│   ├── web/                      # Web interface (unused)
│   └── scripts/                  # Utility scripts
├── mobile/                       # React Native mobile app
└── docs/                         # Documentation
```

## Key Features

### 🔐 Security
- **Protected API Keys**: Sensitive data excluded from repository
- **Supabase Auth**: JWT-based authentication
- **Row Level Security**: Database-level access control
- **Environment Variables**: Secure configuration management

### 🎯 User Experience
- **Intuitive Interface**: Clean, modern design
- **Real-time Feedback**: Progress indicators and loading states
- **Error Handling**: Graceful error recovery and user feedback
- **Responsive Design**: Works on desktop and mobile

### 🚀 Performance
- **Fast Startup**: Optimized development environment
- **Concurrent Processing**: Multiple analysis providers
- **Efficient Caching**: Vite and browser optimizations
- **Background Tasks**: Non-blocking operations

### 📊 Analytics
- **Usage Tracking**: Analysis history and statistics
- **Provider Comparison**: Compare results across providers
- **Saved Results**: Persistent storage of analysis data

## Development Workflow

### Quick Start
```bash
# Clone repository
git clone https://github.com/ReptilePvP/Snap2Sell.git
cd Snap2Sell

# Install dependencies
npm install

# Configure environment variables
cp .env.example .env
# Edit .env with your API keys

# Configure OpenLens
cd openlens-app/src
cp secret_key.py.example secret_key.py
# Edit secret_key.py with your OpenAI API key

# Install Python dependencies
cd ../
pip install -r requirements.txt

# Start complete development environment
cd ../../
npm run dev:full
```

### Available Commands
```bash
npm run dev           # Web app only
npm run openlens      # OpenLens API only  
npm run dev:full      # Both servers together
npm run build         # Production build
npm run lint          # Code quality check
```

## API Documentation

### OpenLens API
- **Base URL**: `http://127.0.0.1:8000`
- **Documentation**: `http://127.0.0.1:8000/docs`
- **Health Check**: `GET /`
- **Analysis**: `POST /analyze`

### Analysis Request Format
```typescript
interface AnalysisRequest {
  image: string; // base64 encoded image
}
```

### Analysis Response Format
```typescript
interface AnalysisResult {
  id: string;
  title: string;
  description: string;
  value: string;
  aiExplanation: string;
  apiProvider: ApiProvider;
  timestamp: number;
  imageUrl?: string;
  visualMatches?: VisualMatch[];
}
```

## Deployment

### Web Application
- **Platform**: Vercel, Netlify, or any static hosting
- **Build Command**: `npm run build`
- **Environment Variables**: Set in hosting platform

### OpenLens API
- **Platform**: Railway, Render, Heroku, or any Python hosting
- **Requirements**: Python 3.8+, pip packages
- **Environment Variables**: OpenAI API key required

### Supabase
- **Database**: Hosted PostgreSQL
- **Edge Functions**: Deploy via Supabase CLI
- **Storage**: Image uploads and analysis data

## Contributing

1. **Fork the repository**
2. **Create feature branch**: `git checkout -b feature/amazing-feature`
3. **Commit changes**: `git commit -m 'Add amazing feature'`
4. **Push to branch**: `git push origin feature/amazing-feature`
5. **Open Pull Request**

## Support

- **Issues**: [GitHub Issues](https://github.com/ReptilePvP/Snap2Sell/issues)
- **Documentation**: This README and inline code comments
- **API Docs**: Available at `http://127.0.0.1:8000/docs` when running OpenLens

## License

MIT License - see [LICENSE](LICENSE) file for details.

---

**Snap2Sell** - Transform your visual world into valuable insights! 📸✨

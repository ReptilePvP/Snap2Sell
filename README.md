# Snap2Sell
> A comprehensive AI-powered image analysis platform for discovering item value and insights.

[![Build Status](https://img.shields.io/badge/build-passing-brightgreen)](https://github.com)
[![Code Coverage](https://img.shields.io/badge/coverage-100%25-brightgreen)](https://github.com)
[![Version](https://img.shields.io/badge/version-1.0.0-blue)](https://github.com)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](https://opensource.org/licenses/MIT)

## Project Overview

Snap2Sell is a cutting-edge web application designed to bridge the gap between the physical and digital worlds through advanced AI-powered image analysis. In today's visual-centric world, Snap2Sell provides a seamless solution to capture, analyze, and extract valuable insights from images.

The core problem this project solves is the inefficiency and manual effort required to understand and value visual information. Whether you're a reseller assessing item value, a collector researching artifacts, or simply curious about objects around you, Snap2Sell streamlines this process into intuitive interactions. Our mission is to transform visual information into actionable, structured data that saves time and provides valuable insights.

## Key Features

*   **🔍 Multi-Provider Analysis:** Integration with four powerful analysis engines:
    - **Gemini AI:** Advanced AI analysis with detailed valuation
    - **SerpAPI:** Google Lens technology for comprehensive web search
    - **SearchAPI:** Visual search for market data and comparable listings
    - **OpenLens:** Custom Google Lens + AI analysis with web scraping
*   **📱 Cross-Platform Support:** Available as both web application and mobile app
*   **🔐 Secure Authentication:** User accounts powered by Supabase with JWT tokens
*   **☁️ Cloud Storage:** Secure image storage with Supabase Storage
*   **📊 Analytics Dashboard:** View analysis history and track activity
*   **🎯 Smart Results:** Structured data with titles, descriptions, valuations, and insights
*   **🔄 Real-time Processing:** Live progress indicators and background processing

## Live Demo / Screenshots

*(This section will be updated with a live demo link and screenshots of the application in action.)*

[Link to Live Demo]()

![Screenshot of Snap2Sell](https://via.placeholder.com/800x450.png?text=Snap2Sell+Screenshot)

## Technology Stack

Our application is built with a modern and robust technology stack to ensure a high-quality user experience.

*   **Frontend:**
    *   React & TypeScript
    *   Vite for fast development and bundling
    *   React Router for navigation
    *   Framer Motion for smooth animations
*   **Mobile:**
    *   React Native with Expo
    *   TypeScript
    *   React Navigation
*   **Backend:**
    *   Supabase Edge Functions (Deno/TypeScript)
    *   Serverless architecture for scalability
*   **Database & Authentication:**
    *   Supabase (PostgreSQL with built-in authentication)
*   **Cloud & Services:**
    *   Supabase Storage for file storage
    *   Google Gemini API for advanced AI analysis
    *   SearchAPI.io for visual search capabilities  
    *   SerpAPI for Google Lens technology
    *   OpenLens (custom) for comprehensive analysis with web scraping
    *   OpenAI GPT-4o-mini for AI insights

## Installation & Setup

Follow these steps to get a local copy of Snap2Sell up and running.

### Prerequisites

*   Node.js (v18 or higher recommended)
*   npm
*   Python 3.8+ (for OpenLens)
*   A Supabase account and project
*   API keys for:
    *   Google Gemini API
    *   SearchAPI.io (optional)
    *   SerpAPI (optional)
    *   OpenAI (for OpenLens)

### Setup Instructions

1.  **Clone the repository:**
    ```sh
    git clone https://github.com/ReptilePvP/Snap2Sell.git
    cd Snap2Sell
    ```

2.  **Install root dependencies:**
    ```sh
    npm install
    ```

3.  **Set up Supabase:**
    *   Create a new project at [supabase.com](https://supabase.com)
    *   Go to Settings > API to get your project URL and anon key
    *   Run the migration to create the profiles table:
        ```sh
        # Install Supabase CLI if you haven't already
        npm install -g supabase
        
        # Initialize Supabase in your project
        supabase init
        
        # Link to your project
        supabase link --project-ref your-project-ref
        
        # Run migrations
        supabase db push
        ```

4.  **Configure Environment Variables:**
    
    > 📋 **See [ENVIRONMENT_SETUP.md](ENVIRONMENT_SETUP.md) for detailed environment variable configuration**
    
    *   Create a `.env` file in the root directory:
        ```sh
        cp .env.example .env
        ```
    *   Edit the `.env` file and add your credentials:
        ```env
        VITE_SUPABASE_URL=your_supabase_project_url
        VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
        VITE_GEMINI_API_KEY=your_gemini_api_key
        VITE_SERPAPI_API_KEY=your_serpapi_key
        VITE_SEARCHAPI_API_KEY=your_searchapi_key
        ```

5.  **Configure OpenLens:**
    *   For local development, create OpenAI API key file:
        ```sh
        cd openlens-app/src
        cp secret_key.py.example secret_key.py
        ```
    *   Edit `secret_key.py` and add your OpenAI API key
    *   **For production**: Use Google Cloud Secret Manager (see deployment guide)
        ```python
        API_KEY = "your-openai-api-key-here"
        ```
    *   Install Python dependencies:
        ```sh
        cd openlens-app
        pip install -r requirements.txt
        ```

6.  **Configure Supabase Functions:**
    *   Set up environment variables for your Supabase Edge Functions:
        ```sh
        # In your Supabase dashboard, go to Edge Functions > Settings
        # Add the following environment variables:
        GEMINI_API_KEY=your_gemini_api_key
        SEARCH_API_KEY=your_searchapi_key
        SERP_API_KEY=your_serpapi_key
        ```

7.  **Run the Complete Development Environment:**
    ```sh
    # Start both web app and OpenLens API
    npm run dev:full
    ```
    
    Or run individually:
    ```sh
    # Web app only
    npm run dev
    
    # OpenLens API only
    npm run openlens
    ```

8.  **Access the Application:**
    *   Web Application: `http://localhost:5173`
    *   OpenLens API: `http://127.0.0.1:8000`
    *   API Documentation: `http://127.0.0.1:8000/docs`

## Usage

Once the application is running, you can start analyzing images with multiple AI providers.

**Web Application:**
1.  Open your browser and navigate to `http://localhost:5173`.
2.  Create an account or sign in using Supabase authentication.
3.  Navigate to the "Analysis" page to choose your preferred provider:
    - **Gemini AI:** Advanced AI analysis with detailed valuation
    - **SerpAPI:** Google Lens technology for web search
    - **SearchAPI:** Visual search for market comparisons  
    - **OpenLens:** Comprehensive analysis with web scraping
4.  Upload an image from your device or use the camera.
5.  View comprehensive results with structured insights.
6.  Access your analysis history from the dashboard.

**Mobile Application:**
1.  Install the Expo Go app on your device.
2.  Scan the QR code when running the mobile development server.
3.  Create an account or sign in.
4.  Use the camera to capture photos or select from gallery.
5.  Choose your preferred analysis service and view results.

## Available Analysis Services

### 1. **🤖 Gemini AI Analysis**
- **Purpose:** Advanced AI-powered image analysis
- **Features:** Item identification, detailed descriptions, estimated value, AI reasoning
- **Best for:** Comprehensive product analysis and accurate valuations
- **Technology:** Google Gemini Pro API

### 2. **🔍 SerpAPI Analysis**  
- **Purpose:** Google Lens technology for visual search
- **Features:** Visual matches, web search results, product listings, price comparisons
- **Best for:** Finding similar items across the web
- **Technology:** SerpAPI Google Lens integration

### 3. **🔎 SearchAPI Analysis**
- **Purpose:** Visual search for comparable listings
- **Features:** Product matching, market analysis, pricing insights, source links
- **Best for:** Market research and price discovery
- **Technology:** SearchAPI visual search capabilities

### 4. **👁️ OpenLens Analysis** *(New!)*
- **Purpose:** Comprehensive Google Lens + AI analysis with web scraping
- **Features:** 
  - Google Lens search via Selenium automation
  - Web content scraping with BeautifulSoup
  - AI analysis using OpenAI GPT-4o-mini
  - Comprehensive insights and structured results
- **Best for:** Most thorough analysis combining multiple data sources
- **Technology:** Custom Python FastAPI server with OpenAI integration

## Project Architecture

The application follows a modern, scalable architecture with multiple analysis providers:

*   **Frontend (Web):** React + TypeScript + Vite
*   **Mobile App:** React Native + Expo  
*   **Backend:** Supabase Edge Functions (Deno/TypeScript)
*   **Custom API:** OpenLens FastAPI server (Python)
*   **Database:** PostgreSQL with Row Level Security via Supabase
*   **Storage:** Supabase Storage for secure image uploads
*   **Authentication:** Supabase Auth with JWT tokens
*   **Analysis Providers:** Multi-provider architecture for diverse insights

## Authentication Flow

1. **Registration:** Users sign up with email/password through Supabase Auth
2. **Profile Creation:** A database trigger automatically creates a profile record
3. **Login:** Users authenticate using Supabase Auth
4. **Session Management:** Supabase handles JWT tokens and session persistence
5. **Row Level Security:** Database policies ensure users can only access their own data

## Security Considerations

### Environment Variables
- **NEVER** commit `.env` files to version control
- Use `.env.example` files to document required environment variables
- Store sensitive API keys securely and rotate them regularly

### API Key Management
- Obtain API keys from their respective providers:
  - **Gemini API:** [Google AI Studio](https://makersuite.google.com/app/apikey)
  - **SearchAPI:** [SearchAPI.io Dashboard](https://www.searchapi.io/dashboard)
  - **SerpAPI:** [SerpAPI Dashboard](https://serpapi.com/dashboard)
- Monitor API usage and set up billing alerts
- Use environment-specific keys for development and production

### Supabase Security
- Enable Row Level Security (RLS) on all tables
- Use Supabase's built-in authentication and authorization
- Regularly review and update database policies

## Contributing

Contributions are what make the open-source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

For detailed guidelines on how to contribute, please see our [CONTRIBUTING.md](CONTRIBUTING.md) file.

## License

Distributed under the MIT License. See `LICENSE` for more information.# Snap2Sell

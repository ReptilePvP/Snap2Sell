# Snap2Cash
> A web application to upload, process, and analyze images to extract structured data and insights.

[![Build Status](https://img.shields.io/badge/build-passing-brightgreen)](https://github.com)
[![Code Coverage](https://img.shields.io/badge/coverage-100%25-brightgreen)](https://github.com)
[![Version](https://img.shields.io/badge/version-1.0.0-blue)](https://github.com)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](https://opensource.org/licenses/MIT)

## Project Overview

Snap2Cash is a powerful web application designed to bridge the gap between the physical and digital worlds. In a world where we are constantly interacting with visual information, Snap2Cash provides a seamless solution to capture, analyze, and extract value from images.

The core problem this project solves is the inefficiency and manual effort required to digitize and understand visual data. Whether you're a reseller trying to quickly assess an item's value, a professional needing to digitize receipts, or a curious individual wanting to learn more about an object, Snap2Cash streamlines this process into a few simple clicks. Our goal is to save you time and effort by turning your visual information into actionable, structured data.

## Key Features

*   **Effortless Image Upload:** A simple and intuitive interface for uploading images from your device.
*   **Multiple Analysis Services:** Integration with powerful APIs like Google Gemini and SerpAPI to provide rich and diverse analysis, from product identification to web search results.
*   **Secure Cloud Storage:** All uploaded images are securely stored in Supabase Storage, ensuring your data is safe and always accessible.
*   **User Authentication:** Secure user accounts powered by Supabase to manage your history and saved analyses.
*   **Dashboard & History:** A personalized dashboard to view your past analyses and track your activity.
*   **Cross-Platform:** Available as both a web application and mobile app (React Native/Expo).

## Live Demo / Screenshots

*(This section will be updated with a live demo link and screenshots of the application in action.)*

[Link to Live Demo]()

![Screenshot of Snap2Cash](https://via.placeholder.com/800x450.png?text=Snap2Cash+Screenshot)

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
    *   SearchAPI.io for search engine results
    *   SerpAPI for search engine results  
    *   Google Gemini for advanced AI-powered analysis

## Installation & Setup

Follow these steps to get a local copy of Snap2Cash up and running.

### Prerequisites

*   Node.js (v18 or higher recommended)
*   npm
*   A Supabase account and project
*   API keys for:
    *   Google Gemini API
    *   SearchAPI.io (optional)
    *   SerpAPI (optional)

### Setup Instructions

1.  **Clone the repository:**
    ```sh
    git clone https://github.com/ReptilePvP/snap2cash.git
    cd snap2cash
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

4.  **Configure Web Frontend:**
    *   Create a `.env` file in the `packages/web` directory:
        ```sh
        cp packages/web/.env.example packages/web/.env
        ```
    *   Edit the `.env` file and add your credentials:
        ```env
        VITE_SUPABASE_URL=your_supabase_project_url
        VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
        VITE_GEMINI_API_KEY=your_gemini_api_key
        VITE_SERPAPI_API_KEY=your_serpapi_key
        VITE_SEARCHAPI_API_KEY=your_searchapi_key
        ```

5.  **Configure Supabase Functions:**
    *   Set up environment variables for your Supabase Edge Functions:
        ```sh
        # In your Supabase dashboard, go to Edge Functions > Settings
        # Add the following environment variables:
        GEMINI_API_KEY=your_gemini_api_key
        SEARCH_API_KEY=your_searchapi_key
        SERP_API_KEY=your_serpapi_key
        ```

6.  **Configure Mobile App (Optional):**
    *   Create a `.env` file in the `packages/mobile` directory:
        ```sh
        cp packages/mobile/.env.example packages/mobile/.env
        ```
    *   Edit the `.env` file and add your credentials:
        ```env
        EXPO_PUBLIC_API_URL=http://localhost:8080
        EXPO_PUBLIC_GEMINI_API_KEY=your_gemini_api_key
        EXPO_PUBLIC_SEARCH_API_KEY=your_search_api_key
        EXPO_PUBLIC_SERP_API_KEY=your_serp_api_key
        EXPO_PUBLIC_SUPABASE_URL=your_supabase_project_url
        EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
        ```
    *   Install mobile dependencies:
        ```sh
        cd mobile
        npm install
        ```

7.  **Run the Web Application:**
    *   Navigate to the web package directory:
        ```sh
        cd packages/web
        ```
    *   Install dependencies and start the development server:
        ```sh
        npm install
        npm run dev
        ```
    *   The web application will be available at `http://localhost:5173`

8.  **Run the Mobile App (Optional):**
    *   In a separate terminal, navigate to the mobile directory:
        ```sh
        cd mobile
        npm start
        ```
    *   Or run the mobile package:
        ```sh
        cd packages/mobile
        npm install
        npm start
        ```

## Usage

Once the application is running, you can start analyzing images.

**Web Application:**
1.  Open your browser and navigate to `http://localhost:5173`.
2.  Create an account or sign in using the Supabase authentication.
3.  Go to the "Home" page and click "Take Photo" or "Upload Image".
4.  Select an image from your device or take a photo with your camera.
5.  Choose the desired analysis service (Gemini, SearchAPI, or SerpAPI).
6.  View the structured results returned by the AI service.

**Mobile Application:**
1.  Open the Expo Go app on your device.
2.  Scan the QR code shown in your terminal when you run `npm start`.
3.  Create an account or sign in.
4.  Use the camera to take photos or select from your gallery.
5.  Choose your preferred analysis service and view results.

## Database Schema

The application uses Supabase (PostgreSQL) with the following main table:

### Profiles Table
```sql
CREATE TABLE profiles (
  id uuid REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  name text NOT NULL,
  email text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
```

This table extends Supabase's built-in `auth.users` table with additional user profile information.

## Project Architecture

The application follows a modern, scalable architecture:

*   **Frontend (Web):** React + TypeScript + Vite in `packages/web/`
*   **Mobile App:** React Native + Expo in `mobile/` and `packages/mobile/`
*   **Backend:** Supabase Edge Functions in `supabase/functions/`
*   **Database:** PostgreSQL with Row Level Security via Supabase
*   **Storage:** Supabase Storage for image uploads
*   **Authentication:** Supabase Auth with JWT tokens

## Available Analysis Services

### 1. **Gemini API Analysis**
- **Purpose:** Advanced AI-powered image analysis
- **Features:** Item identification, description, estimated value, valuation rationale
- **Best for:** Detailed product analysis and resale value estimation

### 2. **SearchAPI Analysis**
- **Purpose:** Google Lens-powered visual search
- **Features:** Visual matches, similar products, pricing information
- **Best for:** Finding similar items and market comparisons

### 3. **SerpAPI Analysis**
- **Purpose:** Search engine results for image queries
- **Features:** Web search results, product listings, related information
- **Best for:** Comprehensive web search and product research

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

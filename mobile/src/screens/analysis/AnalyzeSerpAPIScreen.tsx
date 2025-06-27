import React from 'react';
import AnalysisScreenBase from './AnalysisScreenBase';
import { ApiProvider } from '../../types';
import { analyzeImageWithSerpAPI } from '../../services/apiService';
import { Ionicons } from '@expo/vector-icons'; // For icons

const AnalyzeSerpAPIScreen: React.FC = () => {
  // SerpAPI analysis function might need to handle imageSource differently if it only accepts URLs
  // The base component handles the upload to GCS, so analyzeImageWithSerpAPI will receive a URL.
  const serpApiAnalysis = (imageUrl: string, displayImageUrl: string) => {
    // The analyzeImageWithSerpAPI in apiService already expects a URL, so no special handling here.
    return analyzeImageWithSerpAPI(imageUrl);
  };

  return (
    <AnalysisScreenBase
      apiProvider={ApiProvider.SERPAPI}
      analyzeFunction={serpApiAnalysis}
      pageTitle="SerpAPI Google Lens Analysis"
      pageDescription="Get market-driven resale insights by analyzing product data with SerpAPI's Google Lens."
      apiIconName="cloud-outline" // Example Ionicons name for cloud/API
    />
  );
};

export default AnalyzeSerpAPIScreen;

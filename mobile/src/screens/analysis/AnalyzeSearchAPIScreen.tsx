import React from 'react';
import AnalysisScreenBase from './AnalysisScreenBase';
import { ApiProvider } from '../../types';
import { analyzeImageWithSearchAPI } from '../../services/apiService';
import { Ionicons } from '@expo/vector-icons'; // For icons

const AnalyzeSearchAPIScreen: React.FC = () => {
  // SearchAPI analysis function might need to handle imageSource differently if it only accepts URLs
  // The base component handles the upload to GCS, so analyzeImageWithSearchAPI will receive a URL.
  const searchApiAnalysis = (imageUrl: string, displayImageUrl: string) => {
    // The analyzeImageWithSearchAPI in apiService already expects a URL, so no special handling here.
    return analyzeImageWithSearchAPI(imageUrl);
  };

  return (
    <AnalysisScreenBase
      apiProvider={ApiProvider.SEARCHAPI}
      analyzeFunction={searchApiAnalysis}
      pageTitle="SearchAPI Google Lens Analysis"
      pageDescription="Utilize a SearchAPI provider's Google Lens to gather comparable listings and estimate your item's value."
      apiIconName="search-outline" // Example Ionicons name for search
    />
  );
};

export default AnalyzeSearchAPIScreen;

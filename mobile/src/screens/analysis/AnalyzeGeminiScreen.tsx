import React from 'react';
import AnalysisScreenBase from './AnalysisScreenBase';
import { ApiProvider } from '../../types';
import { analyzeImageWithGemini } from '../../services/geminiService';
import { Ionicons } from '@expo/vector-icons'; // For icons

const AnalyzeGeminiScreen: React.FC = () => {
  return (
    <AnalysisScreenBase
      apiProvider={ApiProvider.GEMINI}
      analyzeFunction={analyzeImageWithGemini}
      pageTitle="Gemini AI Analysis"
      pageDescription="Leverage Google's advanced Gemini model to get insights and valuation for your item."
      apiIconName="bulb-outline" // Example Ionicons name for AI/brain
    />
  );
};

export default AnalyzeGeminiScreen;

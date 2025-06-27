import React from 'react';
import { SparklesIcon } from '@heroicons/react/24/outline';
import AnalysisPageBase from './AnalysisPageBase';
import { ApiProvider } from '../../types';
import { analyzeImageWithGemini } from '../../services/geminiService';

const AnalyzeGeminiPage: React.FC = () => {
  return (
    <AnalysisPageBase
      apiProvider={ApiProvider.GEMINI}
      analyzeFunction={analyzeImageWithGemini}
      pageTitle="Gemini AI Analysis"
      pageDescription="Leverage Google's advanced Gemini model to get detailed insights and valuation for your item."
      icon={SparklesIcon}
    />
  );
};

export default AnalyzeGeminiPage;
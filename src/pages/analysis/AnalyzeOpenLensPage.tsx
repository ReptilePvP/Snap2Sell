import React from 'react';
import { EyeIcon } from '@heroicons/react/24/outline';
import { ApiProvider } from '../../types';
import { analyzeImageWithOpenLens } from '../../services/openLensService';
import AnalysisPageBase from './AnalysisPageBase';

const AnalyzeOpenLensPage: React.FC = () => {
  return (
    <AnalysisPageBase
      apiProvider={ApiProvider.OPENLENS}
      analyzeFunction={analyzeImageWithOpenLens}
      pageTitle="OpenLens Analysis"
      pageDescription="Advanced Google Lens + AI analysis with comprehensive web scraping and detailed insights about your items"
      icon={EyeIcon}
    />
  );
};

export default AnalyzeOpenLensPage;

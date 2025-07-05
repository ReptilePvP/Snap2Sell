import React from 'react';
import { CloudIcon } from '@heroicons/react/24/outline';
import AnalysisPageBase from './AnalysisPageBase';
import { ApiProvider } from '../../types';
import { analyzeImageWithSerp } from '../../services/serpApiService';
import RoleGuard from '../../components/RoleGuard';

const AnalyzeSerpAPIPage: React.FC = () => {
  return (
    <RoleGuard 
      requireProvider={ApiProvider.SERPAPI} 
      showUpgradePrompt={true}
    >
      <AnalysisPageBase
        apiProvider={ApiProvider.SERPAPI}
        analyzeFunction={analyzeImageWithSerp}
        pageTitle="SerpAPI Google Lens Analysis"
        pageDescription="Get market-driven resale insights by analyzing product data with SerpAPI's Google Lens technology."
        icon={CloudIcon}
      />
    </RoleGuard>
  );
};

export default AnalyzeSerpAPIPage;
import React from 'react';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import AnalysisPageBase from './AnalysisPageBase';
import { ApiProvider } from '../../types';
import { analyzeImageWithSearch } from '../../services/searchApiService';
import RoleGuard from '../../components/RoleGuard';

const AnalyzeSearchAPIPage: React.FC = () => {
  return (
    <RoleGuard 
      requireProvider={ApiProvider.SEARCHAPI} 
      showUpgradePrompt={true}
    >
      <AnalysisPageBase
        apiProvider={ApiProvider.SEARCHAPI}
        analyzeFunction={analyzeImageWithSearch}
        pageTitle="SearchAPI Google Lens Analysis"
        pageDescription="Utilize SearchAPI's Google Lens to gather comparable listings and estimate your item's value."
        icon={MagnifyingGlassIcon}
      />
    </RoleGuard>
  );
};

export default AnalyzeSearchAPIPage;
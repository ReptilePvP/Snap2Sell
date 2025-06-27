import React from 'react';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import AnalysisPageBase from './AnalysisPageBase';
import { ApiProvider } from '../../types';
import { analyzeImageWithSearch } from '../../services/searchApiService';

const AnalyzeSearchAPIPage: React.FC = () => {
  return (
    <AnalysisPageBase
      apiProvider={ApiProvider.SEARCHAPI}
      analyzeFunction={analyzeImageWithSearch}
      pageTitle="SearchAPI Google Lens Analysis"
      pageDescription="Utilize SearchAPI's Google Lens to gather comparable listings and estimate your item's value."
      icon={MagnifyingGlassIcon}
    />
  );
};

export default AnalyzeSearchAPIPage;
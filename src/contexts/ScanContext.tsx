import React, { createContext, useContext, useCallback } from 'react';
import { useStats } from '../hooks/useStats';

interface ScanContextType {
  refreshStats: () => void;
}

const ScanContext = createContext<ScanContextType | undefined>(undefined);

export const ScanProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { refreshStats } = useStats();

  const handleRefreshStats = useCallback(() => {
    refreshStats();
  }, [refreshStats]);

  return (
    <ScanContext.Provider value={{ refreshStats: handleRefreshStats }}>
      {children}
    </ScanContext.Provider>
  );
};

export const useScanContext = () => {
  const context = useContext(ScanContext);
  if (context === undefined) {
    throw new Error('useScanContext must be used within a ScanProvider');
  }
  return context;
};

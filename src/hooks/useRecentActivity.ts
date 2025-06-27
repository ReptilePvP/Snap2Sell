import { useState, useEffect } from 'react';
import { scanService } from '../services/scanService';
import { ScanHistoryItem } from '../types';

export const useRecentActivity = () => {
  const [recentActivity, setRecentActivity] = useState<ScanHistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchRecentActivity = async () => {
      try {
        setIsLoading(true);
        const history = await scanService.getScanHistory();
        setRecentActivity(history.slice(0, 5)); // Get top 5 recent
      } catch (err) {
        setError(err instanceof Error ? err : new Error('An unknown error occurred'));
      } finally {
        setIsLoading(false);
      }
    };

    fetchRecentActivity();
  }, []);

  return { recentActivity, isLoading, error };
};

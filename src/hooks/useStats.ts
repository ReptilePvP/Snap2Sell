import { useState, useEffect } from 'react';
import { scanService, ScanStats } from '../services/scanService';
import { useAuth } from './useAuth';
import { useToast } from './useToast';
import { statsEmitter } from '../utils/statsEmitter';

export const useStats = () => {
  const [stats, setStats] = useState<ScanStats>({
    totalScans: 0,
    savedItems: 0,
    thisMonth: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const { isAuthenticated } = useAuth();
  const { showToast } = useToast();

  const loadStats = async () => {
    if (!isAuthenticated) {
      console.log('User not authenticated, setting stats to 0');
      setStats({
        totalScans: 0,
        savedItems: 0,
        thisMonth: 0,
      });
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      console.log('Loading stats for authenticated user...');
      const userStats = await scanService.getUserStats();
      console.log('Stats loaded successfully:', userStats);
      setStats(userStats);
    } catch (error) {
      console.error('Failed to load stats:', error);
      
      // Check if it's a 403 error (permissions issue)
      if (error instanceof Error && error.message.includes('403')) {
        console.log('Permission denied - using fallback stats');
        showToast('warning', 'Stats temporarily unavailable', 'Using default values');
      } else {
        showToast('error', 'Failed to load stats');
      }
      
      // Use fallback stats instead of keeping old ones
      setStats({
        totalScans: 0,
        savedItems: 0,
        thisMonth: 0,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const refreshStats = () => {
    loadStats();
  };

  useEffect(() => {
    loadStats();
  }, [isAuthenticated]);

  // Listen for stats refresh events
  useEffect(() => {
    const unsubscribe = statsEmitter.subscribe(() => {
      loadStats();
    });
    
    return unsubscribe;
  }, [isAuthenticated]);

  return {
    stats,
    isLoading,
    refreshStats,
  };
};

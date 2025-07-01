import React, { useState, useEffect } from 'react';
import { ClockIcon, StarIcon, TrashIcon, EyeIcon } from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';
import { ScanHistoryItem, ApiProvider } from '../types';
import { scanService } from '../services/scanService';
import { statsEmitter } from '../utils/statsEmitter';
import { useToast } from '../hooks/useToast';
import { useAuth } from '../hooks/useAuth';
import ResultCard from '../components/ResultCard';
import { ListSkeleton } from '../components/Skeleton';

const HistoryPage: React.FC = () => {
  const [history, setHistory] = useState<ScanHistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState<ScanHistoryItem | null>(null);
  const { showToast } = useToast();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    loadHistory();
  }, [isAuthenticated]);

  const loadHistory = async () => {
    if (!isAuthenticated) {
      setHistory([]);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const scanHistory = await scanService.getScanHistory();
      setHistory(scanHistory);
    } catch (error) {
      console.error('Failed to load history:', error);
      showToast('error', 'Failed to load scan history');
      
      // Fallback to mock data for demo purposes
      const mockHistory: ScanHistoryItem[] = Array.from({ length: 12 }, (_, i) => ({
        id: `hist-${i}`,
        title: `Scanned Item ${i + 1}`,
        description: `This was item number ${i + 1} scanned via AI analysis. It shows various characteristics and features that were identified during the scanning process.`,
        value: `$${Math.floor(Math.random() * 100) + 10} - $${Math.floor(Math.random() * 200) + 110}`,
        aiExplanation: `AI analysis determined this value based on various criteria including condition, rarity, and market demand.`,
        apiProvider: [ApiProvider.GEMINI, ApiProvider.SERPAPI, ApiProvider.SEARCHAPI][i % 3],
        timestamp: Date.now() - i * 1000 * 60 * 60 * 24,
        imageUrl: `https://picsum.photos/seed/hist${i}/400/300`,
        isFavorite: Math.random() > 0.7,
      }));
      setHistory(mockHistory);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleFavorite = async (id: string) => {
    if (!isAuthenticated) {
      showToast('error', 'Please sign in to save items');
      return;
    }

    try {
      await scanService.toggleSaved(id);
      setHistory(prev =>
        prev.map(item =>
          item.id === id ? { ...item, isFavorite: !item.isFavorite } : item
        )
      );
      const item = history.find(h => h.id === id);
      showToast('success', item?.isFavorite ? 'Removed from saved' : 'Added to saved');
      
      // Emit stats refresh to update saved items count
      statsEmitter.emit();
    } catch (error) {
      console.error('Failed to toggle favorite:', error);
      showToast('error', 'Failed to update saved status');
    }
  };

  const deleteItem = async (id: string) => {
    if (!isAuthenticated) {
      showToast('error', 'Please sign in to delete items');
      return;
    }

    try {
      await scanService.deleteScan(id);
      setHistory(prev => prev.filter(item => item.id !== id));
      if (selectedItem?.id === id) {
        setSelectedItem(null);
      }
      showToast('success', 'Scan deleted successfully');
      
      // Emit stats refresh to update total scans count
      statsEmitter.emit();
    } catch (error) {
      console.error('Failed to delete item:', error);
      showToast('error', 'Failed to delete scan');
    }
  };

  if (selectedItem) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => setSelectedItem(null)}
            className="btn btn-secondary"
          >
            ← Back to History
          </button>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Analysis Details
          </h1>
        </div>
        <ResultCard result={selectedItem} />
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center space-x-3 mb-6">
          <ClockIcon className="h-8 w-8 text-blue-600" />
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Scan History
          </h1>
        </div>
        <ListSkeleton items={8} />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center space-x-3">
        <ClockIcon className="h-8 w-8 text-blue-600" />
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Scan History
        </h1>
      </div>

      {history.length === 0 ? (
        <div className="text-center py-12">
          <ClockIcon className="mx-auto h-16 w-16 text-gray-400 mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            No scans in your history yet
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Start analyzing items to see them here!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {history.map((item) => (
            <div
              key={item.id}
              className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-lg transition-shadow"
            >
              {item.imageUrl && (
                <img
                  src={item.imageUrl}
                  alt={item.title}
                  className="w-full h-48 object-cover"
                />
              )}
              <div className="p-4">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2">
                  {item.title}
                </h3>
                <p className="text-sm font-medium text-green-600 dark:text-green-400 mb-2">
                  {item.value}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
                  {new Date(item.timestamp).toLocaleDateString()} • {item.apiProvider}
                </p>
                
                <div className="flex items-center justify-between">
                  <button
                    onClick={() => setSelectedItem(item)}
                    className="btn btn-primary text-xs px-3 py-1 flex items-center space-x-1"
                  >
                    <EyeIcon className="h-3 w-3" />
                    <span>View</span>
                  </button>
                  
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => toggleFavorite(item.id)}
                      className="p-1 text-gray-400 hover:text-yellow-500 transition-colors"
                    >
                      {item.isFavorite ? (
                        <StarIconSolid className="h-4 w-4 text-yellow-500" />
                      ) : (
                        <StarIcon className="h-4 w-4" />
                      )}
                    </button>
                    <button
                      onClick={() => deleteItem(item.id)}
                      className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default HistoryPage;
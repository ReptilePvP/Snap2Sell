import React, { useState, useEffect } from 'react';
import { StarIcon, EyeIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { ScanHistoryItem, ApiProvider } from '../types';
import { scanService } from '../services/scanService';
import { statsEmitter } from '../utils/statsEmitter';
import { useToast } from '../hooks/useToast';
import { useAuth } from '../hooks/useAuth';
import ResultCard from '../components/ResultCard';
import LoadingSpinner from '../components/LoadingSpinner';

const SavedPage: React.FC = () => {
  const [savedItems, setSavedItems] = useState<ScanHistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState<ScanHistoryItem | null>(null);
  const { showToast } = useToast();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    loadSavedItems();
  }, [isAuthenticated]);

  const loadSavedItems = async () => {
    if (!isAuthenticated) {
      setSavedItems([]);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const saved = await scanService.getSavedItems();
      setSavedItems(saved);
    } catch (error) {
      console.error('Failed to load saved items:', error);
      showToast('error', 'Failed to load saved items');
      
      // Fallback to mock data for demo purposes
      const mockSaved: ScanHistoryItem[] = Array.from({ length: 6 }, (_, i) => ({
        id: `saved-${i}`,
        title: `Favorite Item ${i + 1}`,
        description: `This special item ${i + 1} was saved for future reference. It has unique characteristics that make it particularly valuable or interesting.`,
        value: `$${Math.floor(Math.random() * 200) + 50} - $${Math.floor(Math.random() * 300) + 250}`,
        aiExplanation: `AI marked this as a high-value item based on unique characteristics and market demand.`,
        apiProvider: ApiProvider.GEMINI,
        timestamp: Date.now() - i * 1000 * 60 * 60 * 48,
        imageUrl: `https://picsum.photos/seed/saved${i}/400/300`,
        isFavorite: true,
      }));
      setSavedItems(mockSaved);
    } finally {
      setIsLoading(false);
    }
  };

  const removeFromSaved = async (id: string) => {
    if (!isAuthenticated) {
      showToast('error', 'Please sign in to manage saved items');
      return;
    }

    try {
      await scanService.toggleSaved(id); // This will unsave it
      setSavedItems(prev => prev.filter(item => item.id !== id));
      if (selectedItem?.id === id) {
        setSelectedItem(null);
      }
      showToast('success', 'Removed from saved items');
      
      // Emit stats refresh to update saved items count
      statsEmitter.emit();
    } catch (error) {
      console.error('Failed to remove from saved:', error);
      showToast('error', 'Failed to remove item');
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
            ← Back to Saved
          </button>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Saved Item Details
          </h1>
        </div>
        <ResultCard result={selectedItem} />
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto text-center py-12">
        <LoadingSpinner size="lg" className="mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          Loading saved items...
        </h2>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center space-x-3">
        <StarIcon className="h-8 w-8 text-yellow-500" />
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Saved Items
        </h1>
      </div>

      {savedItems.length === 0 ? (
        <div className="text-center py-12">
          <StarIcon className="mx-auto h-16 w-16 text-gray-400 mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            No saved items yet
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Mark items as favorite in your history to see them here
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {savedItems.map((item) => (
            <div
              key={item.id}
              className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-lg transition-shadow relative"
            >
              <button
                onClick={() => removeFromSaved(item.id)}
                className="absolute top-2 right-2 z-10 p-1 bg-white dark:bg-gray-800 rounded-full shadow-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <XMarkIcon className="h-4 w-4 text-gray-500" />
              </button>
              
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
                  {new Date(item.timestamp).toLocaleDateString()}
                </p>
                
                <button
                  onClick={() => setSelectedItem(item)}
                  className="btn btn-primary text-xs px-3 py-1 flex items-center space-x-1 w-full justify-center"
                >
                  <EyeIcon className="h-3 w-3" />
                  <span>View Details</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SavedPage;
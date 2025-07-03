import React, { useState, useEffect } from 'react';
import { StarIcon, EyeIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { ScanHistoryItem, ApiProvider } from '../types';
import { scanService } from '../services/scanService';
import { statsEmitter } from '../utils/statsEmitter';
import { useToast } from '../hooks/useToast';
import { useAuth } from '../hooks/useAuth';
import ResultCard from '../components/ResultCard';
import { ListSkeleton } from '../components/Skeleton';
import PullToRefresh from '../components/PullToRefresh';
import MobileCard from '../components/MobileCard';
import MobileButton from '../components/MobileButton';

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
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_80%,rgba(120,119,198,0.3),transparent_50%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(255,255,255,0.1),transparent_50%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_40%_40%,rgba(120,119,198,0.2),transparent_50%)]" />
        </div>

        <div className="relative z-10 max-w-4xl mx-auto space-y-6">
          <div className="flex items-center space-x-4">
            <MobileButton
              onClick={() => setSelectedItem(null)}
              variant="secondary"
              size="sm"
              className="bg-white/10 backdrop-blur-lg border-white/20 text-white hover:bg-white/20"
            >
              ← Back to Saved
            </MobileButton>
            <h1 className="text-2xl font-bold text-white">
              Saved Item Details
            </h1>
          </div>
          <ResultCard result={selectedItem} />
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_80%,rgba(120,119,198,0.3),transparent_50%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(255,255,255,0.1),transparent_50%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_40%_40%,rgba(120,119,198,0.2),transparent_50%)]" />
        </div>

        <div className="relative z-10 max-w-6xl mx-auto space-y-6">
          <div className="flex items-center space-x-3 mb-6">
            <StarIcon className="h-8 w-8 text-yellow-400" />
            <h1 className="text-3xl font-bold text-white">
              Saved Items
            </h1>
          </div>
          <ListSkeleton items={6} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_80%,rgba(120,119,198,0.3),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(255,255,255,0.1),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_40%_40%,rgba(120,119,198,0.2),transparent_50%)]" />
      </div>

      <PullToRefresh onRefresh={loadSavedItems}>
        <div className="relative z-10 max-w-6xl mx-auto space-y-6">
          <div className="flex items-center space-x-3">
            <StarIcon className="h-8 w-8 text-yellow-400" />
            <h1 className="text-3xl font-bold text-white">
              Saved Items
            </h1>
          </div>

          {savedItems.length === 0 ? (
            <div className="text-center py-12">
              <StarIcon className="mx-auto h-16 w-16 text-white/40 mb-4" />
              <h2 className="text-xl font-semibold text-white mb-2">
                No saved items yet
              </h2>
              <p className="text-white/60">
                Mark items as favorite in your history to see them here
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {savedItems.map((item) => (
                <MobileCard
                  key={item.id}
                  variant="elevated"
                  className="overflow-hidden relative bg-white/10 backdrop-blur-lg border-white/20"
                >
                  <MobileButton
                    onClick={() => removeFromSaved(item.id)}
                    variant="ghost"
                    size="sm"
                    className="absolute top-2 right-2 z-10 p-1 bg-white/20 backdrop-blur-lg rounded-full shadow-md hover:bg-white/30 text-white/80 hover:text-white"
                  >
                    <XMarkIcon className="h-4 w-4" />
                  </MobileButton>
                  
                  {item.imageUrl && (
                    <img
                      src={item.imageUrl}
                      alt={item.title}
                      className="w-full h-48 object-cover"
                    />
                  )}
                  <div className="p-4">
                    <h3 className="font-semibold text-white mb-2 line-clamp-2">
                      {item.title}
                    </h3>
                    <p className="text-sm font-medium text-green-300 mb-2">
                      {item.value}
                    </p>
                    <p className="text-xs text-white/60 mb-4">
                      {new Date(item.timestamp).toLocaleDateString()}
                    </p>
                    
                    <MobileButton
                      onClick={() => setSelectedItem(item)}
                      variant="primary"
                      size="sm"
                      className="w-full flex items-center space-x-1 justify-center bg-blue-600 hover:bg-blue-700"
                    >
                      <EyeIcon className="h-3 w-3" />
                      <span>View Details</span>
                    </MobileButton>
                  </div>
                </MobileCard>
              ))}
            </div>
          )}
        </div>
      </PullToRefresh>
    </div>
  );
};

export default SavedPage;
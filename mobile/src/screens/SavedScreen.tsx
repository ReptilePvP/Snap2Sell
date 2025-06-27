import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../hooks/useTheme';
import { ScanHistoryItem, ApiProvider } from '../types';
import ResultCard from '../components/ResultCard';

const { width } = Dimensions.get('window');
const itemWidth = (width - 48) / 2;

const SavedScreen: React.FC = () => {
  const { colors } = useTheme();
  const [savedItems, setSavedItems] = useState<ScanHistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState<ScanHistoryItem | null>(null);

  useEffect(() => {
    loadSavedItems();
  }, []);

  const loadSavedItems = async () => {
    // Mock data - replace with actual API call
    setTimeout(() => {
      const mockSaved: ScanHistoryItem[] = Array.from({ length: 6 }, (_, i) => ({
        id: `saved-${i}`,
        title: `Favorite Item ${i + 1}`,
        description: `This special item ${i + 1} was saved for future reference.`,
        value: `$${Math.floor(Math.random() * 200) + 50} - $${Math.floor(Math.random() * 300) + 250}`,
        aiExplanation: `AI marked this as a high-value item based on unique characteristics.`,
        apiProvider: ApiProvider.GEMINI,
        timestamp: Date.now() - i * 1000 * 60 * 60 * 48,
        imageUrl: `https://picsum.photos/seed/saved${i}/200/150`,
        isFavorite: true,
      }));
      setSavedItems(mockSaved);
      setIsLoading(false);
    }, 1000);
  };

  const removeFromSaved = (id: string) => {
    setSavedItems(prev => prev.filter(item => item.id !== id));
    if (selectedItem?.id === id) {
      setSelectedItem(null);
    }
  };

  const renderSavedItem = ({ item }: { item: ScanHistoryItem }) => (
    <TouchableOpacity
      style={[
        styles.savedItem,
        { backgroundColor: colors.surface, borderColor: colors.border },
      ]}
      onPress={() => setSelectedItem(item)}
    >
      <Image source={{ uri: item.imageUrl }} style={styles.itemImage} />
      <View style={styles.itemContent}>
        <Text style={[styles.itemTitle, { color: colors.text }]} numberOfLines={2}>
          {item.title}
        </Text>
        <Text style={[styles.itemValue, { color: colors.primary }]} numberOfLines={1}>
          {item.value}
        </Text>
        <Text style={[styles.itemDate, { color: colors.textSecondary }]}>
          {new Date(item.timestamp).toLocaleDateString()}
        </Text>
      </View>
      <TouchableOpacity
        style={styles.removeButton}
        onPress={() => removeFromSaved(item.id)}
      >
        <Ionicons name="close" size={16} color={colors.error} />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  if (selectedItem) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => setSelectedItem(null)}
        >
          <Ionicons name="arrow-back" size={24} color={colors.primary} />
          <Text style={[styles.backText, { color: colors.primary }]}>Back to Saved</Text>
        </TouchableOpacity>
        <ResultCard result={selectedItem} />
      </View>
    );
  }

  if (isLoading) {
    return (
      <View style={[styles.container, styles.centered, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.loadingText, { color: colors.text }]}>
          Loading saved items...
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {savedItems.length === 0 ? (
        <View style={[styles.centered, { flex: 1 }]}>
          <Ionicons name="star-outline" size={64} color={colors.textSecondary} />
          <Text style={[styles.emptyTitle, { color: colors.text }]}>
            No saved items yet
          </Text>
          <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
            Mark items as favorite in your history to see them here
          </Text>
        </View>
      ) : (
        <FlatList
          data={savedItems}
          renderItem={renderSavedItem}
          keyExtractor={item => item.id}
          numColumns={2}
          contentContainerStyle={styles.listContainer}
          columnWrapperStyle={styles.row}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    marginTop: 12,
  },
  listContainer: {
    padding: 16,
  },
  row: {
    justifyContent: 'space-between',
  },
  savedItem: {
    width: itemWidth,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 16,
    overflow: 'hidden',
  },
  itemImage: {
    width: '100%',
    height: 120,
  },
  itemContent: {
    padding: 12,
  },
  itemTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  itemValue: {
    fontSize: 12,
    fontWeight: '500',
    marginBottom: 4,
  },
  itemDate: {
    fontSize: 10,
  },
  removeButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 8,
  },
  backText: {
    fontSize: 16,
    fontWeight: '500',
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    textAlign: 'center',
    paddingHorizontal: 32,
  },
});

export default SavedScreen;
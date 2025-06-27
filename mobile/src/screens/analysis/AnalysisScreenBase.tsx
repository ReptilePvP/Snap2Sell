import React, { useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, Image, ActivityIndicator, ScrollView, StyleSheet, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { MediaType } from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../hooks/useTheme';
import { adaptiveValue, spacing } from '../../utils/responsive';
import { AnalysisResult, ApiProvider, SearchApiItem } from '../../types';
import { uploadImageDirectly, analyzeImageWithSerpAPI, analyzeImageWithSearchAPI } from '../../services/apiService';
import { analyzeImageWithGemini } from '../../services/geminiService';
import ResultCard from '../../components/ResultCard';
import { useToast } from '../../hooks/useToast';
import ImageUpload from '../../components/ImageUpload';

interface AnalysisScreenBaseProps {
  apiProvider: ApiProvider;
  analyzeFunction: (imageSource: string, displayImageUrl: string) => Promise<AnalysisResult>;
  pageTitle: string;
  pageDescription: string;
  apiIconName: keyof typeof Ionicons.glyphMap; // Use Ionicons for mobile
}

const AnalysisScreenBase: React.FC<AnalysisScreenBaseProps> = ({
  apiProvider,
  analyzeFunction,
  pageTitle,
  pageDescription,
  apiIconName,
}) => {
  const { colors } = useTheme();
  const { showToast } = useToast();

  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [analysisItems, setAnalysisItems] = useState<SearchApiItem[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [localImageUri, setLocalImageUri] = useState<string | null>(null); // URI from image picker
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null); // GCS URL after upload

  const iconSize = adaptiveValue({
    'small-phone': 30,
    phone: 35,
    'large-phone': 38,
    tablet: 40,
  });

  const handleImageUploaded = (gcsUrl: string, localUri: string) => {
    setUploadedImageUrl(gcsUrl);
    setLocalImageUri(localUri);
  };

  const uploadImage = useCallback(async () => {
    if (!localImageUri) {
      setError('No image selected for upload.');
      showToast('error', 'Upload Failed', 'Please select an image first.');
      return;
    }

    setIsAnalyzing(true); // Indicate upload is in progress
    setError(null);
    setUploadedImageUrl(null);

    try {
      const gcsUrl = await uploadImageDirectly(localImageUri);
      setUploadedImageUrl(gcsUrl);
      showToast('success', 'Image uploaded!', 'Successfully uploaded to cloud storage.');
    } catch (err) {
      console.error('Error uploading image:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to upload image.';
      setError(errorMessage);
      showToast('error', 'Upload Failed', errorMessage);
    } finally {
      setIsAnalyzing(false); // Upload finished
    }
  }, [localImageUri, showToast]);

  const startAnalysis = useCallback(async () => {
    let imageSourceForAnalysis: string | null = null;
    let displayImage: string | null = null;

    if (apiProvider === ApiProvider.GEMINI) {
      // Gemini can take local URI directly, or GCS URL if already uploaded
      imageSourceForAnalysis = localImageUri || uploadedImageUrl;
      displayImage = localImageUri || uploadedImageUrl; // Display local if available, else GCS
    } else {
      // SerpAPI and SearchAPI require a public URL (GCS URL)
      imageSourceForAnalysis = uploadedImageUrl;
      displayImage = uploadedImageUrl;
    }

    if (!imageSourceForAnalysis) {
      setError('Please select and/or upload an image first.');
      showToast('error', 'Analysis Failed', 'Please select and/or upload an image first.');
      return;
    }

    setIsAnalyzing(true);
    setError(null);
    setAnalysisResult(null);
    setAnalysisItems([]);

    try {
      const result = await analyzeFunction(imageSourceForAnalysis, displayImage || '');
      if (apiProvider === ApiProvider.SEARCHAPI && result.visualMatches) {
        // Transform the visual matches to SearchApiItem format
        const transformedItems: SearchApiItem[] = result.visualMatches.map((match: any, index: number) => ({
          position: match.position || index + 1,
          title: match.title || 'Unknown item',
          link: match.link || '',
          source: match.source || 'Unknown source',
          price: match.price || match.extracted_price ? `$${match.extracted_price}` : undefined,
          thumbnail: match.thumbnail || match.image?.link || '',
          source_icon: match.source_icon || '' 
        }));
        
        setAnalysisItems(transformedItems);
        // Create a summary AnalysisResult for the main card
        const summaryResult: AnalysisResult = {
          ...result,
          title: 'SearchAPI Analysis',
          description: `Found ${transformedItems.length} visual matches.`,
          value: transformedItems.length > 0 ? 'See matches for pricing details' : 'No matches found',
          aiExplanation: 'Google Lens analyzed your image and found the following similar items based on visual recognition.',
        };
        setAnalysisResult(summaryResult);
      } else {
        setAnalysisResult(result);
      }
      showToast('success', `${apiProvider} Analysis Complete!`, 'Your image has been analyzed.');
    } catch (err) {
      console.error(`Error analyzing with ${apiProvider}:`, err);
      const errorMessage = err instanceof Error ? err.message : `Failed to analyze image with ${apiProvider}.`;
      setError(errorMessage);
      showToast('error', 'Analysis Failed', errorMessage);
    } finally {
      setIsAnalyzing(false);
    }
  }, [localImageUri, uploadedImageUrl, apiProvider, analyzeFunction, showToast]);

  const resetAnalysis = useCallback(() => {
    setAnalysisResult(null);
    setAnalysisItems([]);
    setLocalImageUri(null);
    setUploadedImageUrl(null);
    setError(null);
    setIsAnalyzing(false);
  }, []);

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.background }}
      contentContainerStyle={styles.container}
    >
      <View style={styles.header}>
        <Ionicons name={apiIconName} size={iconSize} color={colors.primary} style={styles.icon} />
        <Text style={[styles.title, { color: colors.text }]}>{pageTitle}</Text>
        <Text style={[styles.description, { color: colors.textSecondary }]}>{pageDescription}</Text>
      </View>

      {!analysisResult && (
        <View style={styles.imageSelectionContainer}>
          {localImageUri && (
            <Image source={{ uri: localImageUri }} style={styles.selectedImage} />
          )}
          <ImageUpload onImageUploaded={handleImageUploaded} isAnalyzing={isAnalyzing} />

          {localImageUri && !uploadedImageUrl && apiProvider !== ApiProvider.GEMINI && (
            <TouchableOpacity
              style={[styles.button, { backgroundColor: colors.secondary, marginTop: spacing.md }]}
              onPress={uploadImage}
              disabled={isAnalyzing}
            >
              <Text style={[styles.buttonText, { color: colors.onSecondary }]}>
                Upload Image to Cloud
              </Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      {localImageUri && !analysisResult && !isAnalyzing && (
        <TouchableOpacity
          style={[styles.analyzeButton, { backgroundColor: colors.success }]}
          onPress={startAnalysis}
          disabled={isAnalyzing}
        >
          <Text style={[styles.buttonText, { color: colors.onSuccess }]}>
            Analyze with {apiProvider}
          </Text>
        </TouchableOpacity>
      )}

      {isAnalyzing && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
            Analyzing with {apiProvider}, please wait...
          </Text>
        </View>
      )}

      {error && (
        <View style={[styles.errorContainer, { borderColor: colors.error, backgroundColor: colors.error + '10' }]}>
          <Text style={[styles.errorText, { color: colors.error }]}>{error}</Text>
          <TouchableOpacity onPress={resetAnalysis} style={styles.tryAgainButton}>
            <Text style={[styles.tryAgainText, { color: colors.primary }]}>Try again</Text>
          </TouchableOpacity>
        </View>
      )}

      {analysisResult && (
        <View style={styles.resultContainer}>
          <ResultCard result={analysisResult} />
          {analysisItems.length > 0 && (
            <View style={styles.itemListContainer}>
              {analysisItems.map((item, index) => (
                <ResultCard key={index} result={analysisResult} item={item} />
              ))}
            </View>
          )}
          <TouchableOpacity
            style={[styles.resetButton, { backgroundColor: colors.primary }]}
            onPress={resetAnalysis}
          >
            <Ionicons name="reload" size={adaptiveValue({ phone: 20, tablet: 24 })} color={colors.onPrimary} style={styles.resetIcon} />
            <Text style={[styles.buttonText, { color: colors.onPrimary }]}>Analyze Another Image</Text>
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: spacing.md,
    alignItems: 'center',
  },
  header: {
    width: '100%',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  icon: {
    marginBottom: spacing.sm,
  },
  title: {
    fontSize: adaptiveValue({ 'small-phone': 24, phone: 28, tablet: 32 }),
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  description: {
    fontSize: adaptiveValue({ 'small-phone': 14, phone: 16, tablet: 18 }),
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  imageSelectionContainer: {
    width: '100%',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  selectedImage: {
    width: adaptiveValue({ 'small-phone': 200, phone: 250, tablet: 300 }),
    height: adaptiveValue({ 'small-phone': 150, phone: 187, tablet: 225 }),
    resizeMode: 'contain',
    marginBottom: spacing.md,
    borderRadius: spacing.sm,
    borderWidth: 1,
    borderColor: '#ccc', // Placeholder, use theme colors
  },
  button: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: spacing.sm,
    width: '80%',
    alignItems: 'center',
  },
  buttonText: {
    fontSize: adaptiveValue({ 'small-phone': 14, phone: 16, tablet: 18 }),
    fontWeight: '600',
  },
  analyzeButton: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: spacing.sm,
    width: '80%',
    alignItems: 'center',
    marginTop: spacing.md,
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xl,
  },
  loadingText: {
    marginTop: spacing.sm,
    fontSize: adaptiveValue({ 'small-phone': 14, phone: 16, tablet: 18 }),
  },
  errorContainer: {
    padding: spacing.md,
    borderRadius: spacing.sm,
    borderWidth: 1,
    width: '90%',
    alignItems: 'center',
    marginTop: spacing.md,
  },
  errorText: {
    fontSize: adaptiveValue({ 'small-phone': 14, phone: 16, tablet: 18 }),
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  tryAgainButton: {
    paddingVertical: spacing.xs,
  },
  tryAgainText: {
    fontSize: adaptiveValue({ 'small-phone': 12, phone: 14, tablet: 16 }),
    textDecorationLine: 'underline',
  },
  resultContainer: {
    width: '100%',
    alignItems: 'center',
    marginTop: spacing.md,
  },
  itemListContainer: {
    width: '100%',
    marginTop: spacing.lg,
  },
  resetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: spacing.sm,
    marginTop: spacing.lg,
  },
  resetIcon: {
    marginRight: spacing.xs,
  },
});

export default AnalysisScreenBase;

import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../hooks/useTheme';
import { useToast } from '../hooks/useToast';
import { analyzeImageWithGemini } from '../services/geminiService';
import { uploadImageDirectly } from '../services/apiService';
import { AnalysisResult } from '../types';
import ResultCard from '../components/ResultCard';
import ImageUpload from '../components/ImageUpload';
import AdaptiveContainer from '../components/AdaptiveContainer';
import AdaptiveText from '../components/AdaptiveText';
import { isTablet, adaptiveValue, spacing } from '../utils/responsive';

const CameraScreen: React.FC = () => {
  const { colors } = useTheme();
  const { showToast } = useToast();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(
    null
  );

  const takePicture = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Permission needed',
        'Camera permission is required to take photos.'
      );
      return;
    }

    try {
      const result = await ImagePicker.launchCameraAsync({
        quality: 0.8,
        allowsEditing: true,
        aspect: [4, 3],
      });

      if (!result.canceled && result.assets && result.assets[0]) {
        const photoUri = result.assets[0].uri;
        try {
          setIsAnalyzing(true);
          const uploadedUrl = await uploadImageDirectly(photoUri);
          analyzeImage(photoUri, uploadedUrl);
        } catch (error) {
          showToast(
            'error',
            'Upload failed',
            error instanceof Error ? error.message : 'Unknown error'
          );
          setIsAnalyzing(false);
        }
      }
    } catch (error) {
      showToast('error', 'Failed to take picture');
    }
  };

  const handleImageUploaded = (uploadedUrl: string, localUri: string) => {
    analyzeImage(localUri, uploadedUrl);
  };

  const analyzeImage = async (localUri: string, uploadedUrl: string) => {
    setIsAnalyzing(true);
    try {
      const result = await analyzeImageWithGemini(localUri, uploadedUrl);
      setAnalysisResult(result);
      showToast('success', 'Analysis complete!');
    } catch (error) {
      showToast(
        'error',
        'Analysis failed',
        error instanceof Error ? error.message : 'Unknown error'
      );
    } finally {
      setIsAnalyzing(false);
    }
  };

  const resetAnalysis = () => {
    setAnalysisResult(null);
    setIsAnalyzing(false);
  };

  const buttonHeight = adaptiveValue({
    'small-phone': 44,
    phone: 48,
    'large-phone': 52,
    tablet: 56,
  });

  const iconSize = adaptiveValue({
    'small-phone': 20,
    phone: 24,
    'large-phone': 26,
    tablet: 28,
  });

  if (analysisResult) {
    return (
      <AdaptiveContainer maxWidth={isTablet() ? 800 : undefined}>
        <ScrollView showsVerticalScrollIndicator={false}>
          <ResultCard result={analysisResult} />
          <TouchableOpacity
            style={[
              styles.resetButton,
              {
                backgroundColor: colors.primary,
                height: buttonHeight,
                marginHorizontal: spacing.lg,
                marginBottom: spacing.xl,
              },
            ]}
            onPress={resetAnalysis}
          >
            <Ionicons name="refresh" size={iconSize} color="white" />
            <AdaptiveText style={styles.buttonText}>
              Analyze Another Item
            </AdaptiveText>
          </TouchableOpacity>
        </ScrollView>
      </AdaptiveContainer>
    );
  }

  if (isAnalyzing) {
    return (
      <AdaptiveContainer centerContent>
        <ActivityIndicator size="large" color={colors.primary} />
        <AdaptiveText
          style={[styles.loadingText, { color: colors.text }]}
          adaptiveSize={{
            'small-phone': 14,
            phone: 16,
            tablet: 18,
          }}
        >
          Analyzing with Gemini AI...
        </AdaptiveText>
      </AdaptiveContainer>
    );
  }

  return (
    <AdaptiveContainer maxWidth={isTablet() ? 600 : undefined}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={[styles.header, { paddingTop: spacing.xl }]}>
          <Ionicons
            name="camera"
            size={adaptiveValue({
              'small-phone': 40,
              phone: 48,
              tablet: 56,
            })}
            color={colors.primary}
          />
          <AdaptiveText
            variant="h2"
            style={[styles.title, { color: colors.text }]}
            adaptiveSize={{
              'small-phone': 24,
              phone: 28,
              tablet: 32,
            }}
          >
            Item Analysis
          </AdaptiveText>
          <AdaptiveText
            variant="body"
            style={[styles.subtitle, { color: colors.textSecondary }]}
            adaptiveSize={{
              'small-phone': 14,
              phone: 16,
              tablet: 18,
            }}
          >
            Take a photo or upload an image to get instant AI-powered value
            estimation
          </AdaptiveText>
        </View>

        <ImageUpload
          onImageUploaded={handleImageUploaded}
          isAnalyzing={isAnalyzing}
        />

        <View style={styles.orContainer}>
          <View
            style={[styles.orLine, { backgroundColor: colors.border }]}
          />
          <AdaptiveText
            style={[styles.orText, { color: colors.textSecondary }]}
            adaptiveSize={{
              'small-phone': 12,
              phone: 14,
              tablet: 16,
            }}
          >
            OR
          </AdaptiveText>
          <View
            style={[styles.orLine, { backgroundColor: colors.border }]}
          />
        </View>

        <TouchableOpacity
          style={[
            styles.cameraButton,
            {
              backgroundColor: colors.primary,
              height: buttonHeight,
              marginHorizontal: spacing.lg,
              marginBottom: spacing.xl,
            },
          ]}
          onPress={takePicture}
        >
          <Ionicons name="camera" size={iconSize} color="white" />
          <AdaptiveText style={styles.buttonText}>Open Camera</AdaptiveText>
        </TouchableOpacity>
      </ScrollView>
    </AdaptiveContainer>
  );
};

const styles = StyleSheet.create({
  header: {
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
  },
  title: {
    fontWeight: 'bold',
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  subtitle: {
    textAlign: 'center',
    lineHeight: 22,
  },
  orContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: spacing.xl,
    marginHorizontal: spacing.lg,
  },
  orLine: {
    flex: 1,
    height: 1,
  },
  orText: {
    marginHorizontal: spacing.lg,
    fontWeight: '500',
  },
  cameraButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    gap: spacing.sm,
  },
  buttonText: {
    color: 'white',
    fontWeight: '600',
    textAlign: 'center',
  },
  loadingText: {
    marginTop: spacing.md,
  },
  resetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    gap: spacing.sm,
  },
});

export default CameraScreen;
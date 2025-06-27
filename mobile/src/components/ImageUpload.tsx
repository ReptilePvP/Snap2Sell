import React, { useState, useCallback } from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../hooks/useTheme';
import { useToast } from '../hooks/useToast';
import { uploadImageDirectly } from '../services/apiService';
import AdaptiveText from './AdaptiveText';
import { spacing, adaptiveValue } from '../utils/responsive';

interface ImageUploadProps {
  onImageUploaded: (uploadedUrl: string, localUri: string) => void;
  isAnalyzing: boolean;
}

const ImageUpload: React.FC<ImageUploadProps> = ({
  onImageUploaded,
  isAnalyzing,
}) => {
  const { colors } = useTheme();
  const { showToast } = useToast();
  const [isUploading, setIsUploading] = useState(false);

  const selectImage = async () => {
    let { status } = await ImagePicker.getMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      const { status: newStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      status = newStatus;
    }

    if (status !== 'granted') {
      showToast(
        'info',
        'Permission needed',
        'Storage permission is required to upload images.'
      );
      return;
    }

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        quality: 0.8,
        allowsEditing: true,
        aspect: [4, 3],
      });

      if (!result.canceled && result.assets && result.assets[0]) {
        const localUri = result.assets[0].uri;
        setIsUploading(true);
        try {
          const uploadedUrl = await uploadImageDirectly(localUri);
          onImageUploaded(uploadedUrl, localUri);
          showToast('success', 'Image uploaded!', 'Ready for analysis.');
        } catch (error) {
          showToast(
            'error',
            'Upload failed',
            error instanceof Error ? error.message : 'Unknown error'
          );
        } finally {
          setIsUploading(false);
        }
      }
    } catch (error) {
      showToast('error', 'Failed to select image');
    }
  };

  const isDisabled = isUploading || isAnalyzing;
  const buttonHeight = adaptiveValue({
    'small-phone': 50,
    phone: 56,
    tablet: 60,
  });
  const iconSize = adaptiveValue({
    'small-phone': 22,
    phone: 26,
    tablet: 30,
  });

  return (
    <TouchableOpacity
      style={[
        styles.container,
        {
          backgroundColor: colors.card,
          borderColor: colors.border,
          height: buttonHeight,
          marginHorizontal: spacing.lg,
        },
        isDisabled && styles.disabled,
      ]}
      onPress={selectImage}
      disabled={isDisabled}
    >
      {isDisabled ? (
        <ActivityIndicator
          size="small"
          color={colors.primary}
        />
      ) : (
        <Ionicons name="cloud-upload" size={iconSize} color={colors.primary} />
      )}
      <AdaptiveText style={[styles.text, { color: colors.text }]}>
        {isUploading
          ? 'Uploading...'
          : isAnalyzing
          ? 'Analyzing...'
          : 'Upload from Gallery'}
      </AdaptiveText>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: spacing.md,
    gap: spacing.md,
  },
  disabled: {
    opacity: 0.6,
  },
  text: {
    fontWeight: '600',
  },
});

export default ImageUpload;

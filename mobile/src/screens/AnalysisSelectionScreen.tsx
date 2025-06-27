import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useTheme } from '../hooks/useTheme';
import { adaptiveValue, spacing } from '../utils/responsive';
import { Ionicons } from '@expo/vector-icons';
import { StackNavigationProp } from '@react-navigation/stack';
import { useNavigation } from '@react-navigation/native';

// Define a type for the root stack navigator's parameters
type RootStackParamList = {
  AnalysisSelection: undefined;
  AnalyzeGemini: undefined;
  AnalyzeSerpAPI: undefined;
  AnalyzeSearchAPI: undefined;
};

type AnalysisSelectionScreenNavigationProp = StackNavigationProp<RootStackParamList, 'AnalysisSelection'>;

const AnalysisSelectionScreen: React.FC = () => {
  const { colors } = useTheme();
  const navigation = useNavigation<AnalysisSelectionScreenNavigationProp>();

  const handleNavigation = (screenName: keyof RootStackParamList) => {
    navigation.navigate(screenName);
  };

  const buttonIconSize = adaptiveValue({
    'small-phone': 24,
    phone: 28,
    'large-phone': 30,
    tablet: 32,
  });

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.background }}
      contentContainerStyle={styles.container}
    >
      <Text style={[styles.title, { color: colors.text }]}>Choose Analysis Type</Text>
      <Text style={[styles.description, { color: colors.textSecondary }]}>
        Select an API provider to analyze your images.
      </Text>

      <TouchableOpacity
        style={[styles.button, { backgroundColor: colors.primary }]}
        onPress={() => handleNavigation('AnalyzeGemini')}
      >
        <Ionicons name="bulb-outline" size={buttonIconSize} color={colors.onPrimary} style={styles.buttonIcon} />
        <Text style={[styles.buttonText, { color: colors.onPrimary }]}>Gemini AI Analysis</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.button, { backgroundColor: colors.secondary, marginTop: spacing.md }]}
        onPress={() => handleNavigation('AnalyzeSerpAPI')}
      >
        <Ionicons name="cloud-outline" size={buttonIconSize} color={colors.onSecondary} style={styles.buttonIcon} />
        <Text style={[styles.buttonText, { color: colors.onSecondary }]}>SerpAPI Google Lens</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.button, { backgroundColor: colors.info, marginTop: spacing.md }]}
        onPress={() => handleNavigation('AnalyzeSearchAPI')}
      >
        <Ionicons name="search-outline" size={buttonIconSize} color={colors.onPrimary} style={styles.buttonIcon} />
        <Text style={[styles.buttonText, { color: colors.onPrimary }]}>SearchAPI Google Lens</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: adaptiveValue({ 'small-phone': 24, phone: 28, tablet: 32 }),
    fontWeight: 'bold',
    marginBottom: spacing.xs,
  },
  description: {
    fontSize: adaptiveValue({ 'small-phone': 14, phone: 16, tablet: 18 }),
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: spacing.sm,
    width: '80%',
  },
  buttonIcon: {
    marginRight: spacing.sm,
  },
  buttonText: {
    fontSize: adaptiveValue({ 'small-phone': 16, phone: 18, tablet: 20 }),
    fontWeight: '600',
  },
});

export default AnalysisSelectionScreen;

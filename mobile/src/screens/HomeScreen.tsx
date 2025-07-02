import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../hooks/useTheme';
import { useNavigation } from '@react-navigation/native';
import AdaptiveContainer from '../components/AdaptiveContainer';
import AdaptiveGrid from '../components/AdaptiveGrid';
import AdaptiveText from '../components/AdaptiveText';
import { wp, hp, spacing, typography, isTablet, adaptiveValue } from '../utils/responsive';

const HomeScreen: React.FC = () => {
  const { colors } = useTheme();
  const navigation = useNavigation();

  const features = [
    {
      icon: 'camera',
      title: 'Quick Scan',
      description: 'Instantly analyze items with your camera',
      onPress: () => navigation.navigate('Camera' as never),
    },
    {
      icon: 'images',
      title: 'Upload Photo',
      description: 'Select from your photo library',
      onPress: () => navigation.navigate('Camera' as never),
    },
    {
      icon: 'time',
      title: 'Recent Scans',
      description: 'View your analysis history',
      onPress: () => navigation.navigate('History' as never),
    },
    {
      icon: 'star',
      title: 'Saved Items',
      description: 'Access your favorite analyses',
      onPress: () => navigation.navigate('Saved' as never),
    },
  ];

  const stats = [
    { label: 'Total Scans', value: '28' },
    { label: 'Saved Items', value: '5' },
    { label: 'This Month', value: '12' },
  ];

  const headerHeight = adaptiveValue({
    'small-phone': hp(25),
    phone: hp(30),
    'large-phone': hp(28),
    tablet: hp(35),
  });

  const cardPadding = adaptiveValue({
    'small-phone': spacing.md,
    phone: spacing.lg,
    tablet: spacing.xl,
  });

  return (
    <ScrollView 
      style={[styles.container, { backgroundColor: colors.background }]}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <LinearGradient
        colors={[colors.primary, colors.primaryDark]}
        style={[styles.header, { height: headerHeight }]}
      >
        <AdaptiveContainer useSafeArea={false} centerContent>
          <AdaptiveText 
            variant="body" 
            style={styles.welcomeText}
            adaptiveSize={{
              'small-phone': 14,
              phone: 16,
              tablet: 18,
            }}
          >
            Welcome back!
          </AdaptiveText>
          <AdaptiveText 
            variant="h1" 
            style={styles.appTitle}
            adaptiveSize={{
              'small-phone': 28,
              phone: 32,
              'large-phone': 36,
              tablet: 42,
            }}
          >
            Snapalyze
          </AdaptiveText>
          <AdaptiveText 
            variant="body" 
            style={styles.subtitle}
            adaptiveSize={{
              'small-phone': 14,
              phone: 16,
              tablet: 18,
            }}
          >
            Discover the value of your items instantly
          </AdaptiveText>
        </AdaptiveContainer>
      </LinearGradient>

      <AdaptiveContainer maxWidth={isTablet() ? 800 : undefined}>
        {/* Stats */}
        <View style={[
          styles.statsContainer, 
          { 
            backgroundColor: colors.surface,
            padding: cardPadding,
            marginTop: -spacing.xl,
            marginHorizontal: spacing.md,
          }
        ]}>
          {stats.map((stat, index) => (
            <View key={index} style={styles.statItem}>
              <AdaptiveText 
                style={[styles.statValue, { color: colors.primary }]}
                adaptiveSize={{
                  'small-phone': 20,
                  phone: 24,
                  tablet: 28,
                }}
              >
                {stat.value}
              </AdaptiveText>
              <AdaptiveText 
                variant="caption" 
                style={[styles.statLabel, { color: colors.textSecondary }]}
                adaptiveSize={{
                  'small-phone': 10,
                  phone: 12,
                  tablet: 14,
                }}
              >
                {stat.label}
              </AdaptiveText>
            </View>
          ))}
        </View>

        {/* Features */}
        <View style={styles.featuresContainer}>
          <AdaptiveText 
            variant="h3" 
            style={[styles.sectionTitle, { color: colors.text }]}
            adaptiveSize={{
              'small-phone': 18,
              phone: 20,
              tablet: 24,
            }}
          >
            Quick Actions
          </AdaptiveText>
          
          <AdaptiveGrid
            columns={{
              'small-phone': 1,
              phone: 2,
              'large-phone': 2,
              tablet: 4,
            }}
            spacing="md"
          >
            {features.map((feature, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.featureCard,
                  { 
                    backgroundColor: colors.surface, 
                    borderColor: colors.border,
                    padding: cardPadding,
                  },
                ]}
                onPress={feature.onPress}
              >
                <View style={[
                  styles.featureIcon, 
                  { 
                    backgroundColor: colors.primary,
                    width: adaptiveValue({
                      'small-phone': 40,
                      phone: 48,
                      tablet: 56,
                    }),
                    height: adaptiveValue({
                      'small-phone': 40,
                      phone: 48,
                      tablet: 56,
                    }),
                  }
                ]}>
                  <Ionicons
                    name={feature.icon as any}
                    size={adaptiveValue({
                      'small-phone': 20,
                      phone: 24,
                      tablet: 28,
                    })}
                    color="white"
                  />
                </View>
                <AdaptiveText 
                  style={[styles.featureTitle, { color: colors.text }]}
                  adaptiveSize={{
                    'small-phone': 14,
                    phone: 16,
                    tablet: 18,
                  }}
                >
                  {feature.title}
                </AdaptiveText>
                <AdaptiveText 
                  variant="bodySmall" 
                  style={[styles.featureDescription, { color: colors.textSecondary }]}
                  adaptiveSize={{
                    'small-phone': 11,
                    phone: 12,
                    tablet: 14,
                  }}
                >
                  {feature.description}
                </AdaptiveText>
              </TouchableOpacity>
            ))}
          </AdaptiveGrid>
        </View>

        {/* Recent Activity */}
        <View style={styles.recentContainer}>
          <AdaptiveText 
            variant="h3" 
            style={[styles.sectionTitle, { color: colors.text }]}
            adaptiveSize={{
              'small-phone': 18,
              phone: 20,
              tablet: 24,
            }}
          >
            Recent Activity
          </AdaptiveText>
          {['Vintage Lamp Scan', 'Old Book Valuation', 'Sneaker Price Check'].map(
            (item, index) => (
              <View
                key={index}
                style={[
                  styles.recentItem,
                  { 
                    backgroundColor: colors.surface, 
                    borderColor: colors.border,
                    padding: cardPadding,
                  },
                ]}
              >
                <View style={styles.recentItemContent}>
                  <AdaptiveText 
                    style={[styles.recentItemTitle, { color: colors.text }]}
                    adaptiveSize={{
                      'small-phone': 14,
                      phone: 16,
                      tablet: 18,
                    }}
                  >
                    {item}
                  </AdaptiveText>
                  <AdaptiveText 
                    variant="caption" 
                    style={[styles.recentItemDate, { color: colors.textSecondary }]}
                  >
                    2 days ago
                  </AdaptiveText>
                </View>
                <Ionicons
                  name="chevron-forward"
                  size={adaptiveValue({
                    'small-phone': 16,
                    phone: 20,
                    tablet: 24,
                  })}
                  color={colors.textSecondary}
                />
              </View>
            )
          )}
        </View>
      </AdaptiveContainer>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: spacing.lg,
    justifyContent: 'center',
  },
  welcomeText: {
    color: 'white',
    opacity: 0.9,
  },
  appTitle: {
    color: 'white',
    fontWeight: 'bold',
    marginVertical: spacing.sm,
  },
  subtitle: {
    color: 'white',
    opacity: 0.9,
    textAlign: 'center',
  },
  statsContainer: {
    flexDirection: 'row',
    borderRadius: 12,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontWeight: 'bold',
  },
  statLabel: {
    marginTop: spacing.xs,
  },
  featuresContainer: {
    padding: spacing.lg,
  },
  sectionTitle: {
    fontWeight: 'bold',
    marginBottom: spacing.lg,
  },
  featureCard: {
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    minHeight: adaptiveValue({
      'small-phone': 120,
      phone: 140,
      tablet: 160,
    }),
    justifyContent: 'center',
  },
  featureIcon: {
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  featureTitle: {
    fontWeight: '600',
    marginBottom: spacing.xs,
    textAlign: 'center',
  },
  featureDescription: {
    textAlign: 'center',
    lineHeight: 16,
  },
  recentContainer: {
    padding: spacing.lg,
  },
  recentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: spacing.sm,
  },
  recentItemContent: {
    flex: 1,
  },
  recentItemTitle: {
    fontWeight: '500',
  },
  recentItemDate: {
    marginTop: spacing.xs,
  },
});

export default HomeScreen;
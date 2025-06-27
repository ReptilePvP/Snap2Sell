import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  TouchableOpacity,
  Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../hooks/useTheme';
import { AnalysisResult, SearchApiItem } from '../types';
import AdaptiveText from './AdaptiveText';
import AdaptiveGrid from './AdaptiveGrid';
import { wp, hp, spacing, isTablet, adaptiveValue } from '../utils/responsive';

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  card: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    resizeMode: 'cover',
    borderRadius: 8,
  },
  content: {
    // Padding set dynamically
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  title: {
    fontWeight: 'bold',
    flex: 1,
  },
  section: {
    // marginBottom set dynamically
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  sectionTitle: {
    fontWeight: '500',
  },
  description: {
    lineHeight: 24,
  },
  valueSection: {
    borderRadius: 12,
  },
  valueLabel: {
    fontWeight: '600',
  },
  value: {
    fontWeight: 'bold',
    marginTop: spacing.xs,
  },
  explanation: {
    lineHeight: 24,
  },
  matchItem: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 8,
    borderWidth: 1,
    gap: spacing.md,
  },
  matchImage: {
    borderRadius: 4,
  },
  matchContent: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: spacing.xs,
  },
  matchTitle: {
    flex: 1,
  },
  sourceIcon: {
    // Size set dynamically
  },
  footer: {
    borderTopWidth: 1,
    alignItems: 'center',
  },
  provider: {
    marginBottom: spacing.xs,
  },
  timestamp: {
    // fontSize set via adaptiveSize
  },
  sourceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  sourceText: {
    // styles for source text
  },
  priceText: {
    fontWeight: 'bold',
    marginTop: spacing.xs,
  },
});

interface ResultCardProps {
  result: AnalysisResult;
  item?: SearchApiItem;
}

const ResultCard: React.FC<ResultCardProps> = ({ result, item }) => {
  const { colors } = useTheme();

  const openLink = (url: string) => {
    Linking.openURL(url);
  };

  if (item) {
    // Render a smaller card for the search result item
    return (
      <TouchableOpacity
        style={[
          styles.matchItem,
          {
            backgroundColor: colors.surface,
            borderColor: colors.border,
            padding: spacing.md,
            marginBottom: spacing.md,
          },
        ]}
        onPress={() => openLink(item.link)}
      >
        {item.thumbnail && (
          <Image
            source={{ uri: item.thumbnail }}
            style={[
              styles.matchImage,
              {
                width: adaptiveValue({ 'small-phone': 60, phone: 70, tablet: 80 }),
                height: adaptiveValue({ 'small-phone': 60, phone: 70, tablet: 80 }),
              },
            ]}
          />
        )}
        <View style={styles.matchContent}>
          <AdaptiveText
            style={[styles.matchTitle, { color: colors.text }]}
            numberOfLines={3}
            adaptiveSize={{
              'small-phone': 14,
              phone: 16,
              tablet: 18,
            }}
          >
            {item.title}
          </AdaptiveText>
          <View style={styles.sourceContainer}>
            {item.source_icon && (
              <Image
                source={{ uri: item.source_icon }}
                style={[
                  styles.sourceIcon,
                  {
                    width: adaptiveValue({ 'small-phone': 16, phone: 18, tablet: 20 }),
                    height: adaptiveValue({ 'small-phone': 16, phone: 18, tablet: 20 }),
                  },
                ]}
              />
            )}
            <AdaptiveText
              style={[styles.sourceText, { color: colors.textSecondary }]}
              adaptiveSize={{
                'small-phone': 12,
                phone: 14,
                tablet: 16,
              }}
            >
              {item.source}
            </AdaptiveText>
          </View>
          {item.price && (
            <AdaptiveText
              style={[styles.priceText, { color: colors.primary }]}
              adaptiveSize={{
                'small-phone': 14,
                phone: 16,
                tablet: 18,
              }}
            >
              {item.price}
            </AdaptiveText>
          )}
        </View>
      </TouchableOpacity>
    );
  }

  const cardPadding = adaptiveValue({
    'small-phone': spacing.md,
    phone: spacing.lg,
    tablet: spacing.xl,
  });

  const imageHeight = adaptiveValue({
    'small-phone': hp(25),
    phone: hp(30),
    'large-phone': hp(28),
    tablet: hp(35),
  });

  const iconSize = adaptiveValue({
    'small-phone': 20,
    phone: 24,
    tablet: 28,
  });

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[
        styles.card, 
        { 
          backgroundColor: colors.surface, 
          borderColor: colors.border,
          margin: spacing.lg,
          padding: cardPadding,
        }
      ]}>
        {result.imageUrl && (
          <Image 
            source={{ uri: result.imageUrl }} 
            style={[
              styles.image,
              {
                height: imageHeight,
                marginBottom: cardPadding,
              }
            ]} 
          />
        )}
        
        <View style={styles.content}>
          <View style={[styles.header, { marginBottom: cardPadding }]}>
            <Ionicons name="pricetag" size={iconSize} color={colors.primary} />
            <AdaptiveText 
              style={[styles.title, { color: colors.text }]}
              adaptiveSize={{
                'small-phone': 18,
                phone: 20,
                'large-phone': 22,
                tablet: 24,
              }}
            >
              {result.title}
            </AdaptiveText>
          </View>

          <View style={[styles.section, { marginBottom: cardPadding }]}>
            <View style={[styles.sectionHeader, { marginBottom: spacing.sm }]}>
              <Ionicons name="document-text" size={iconSize - 4} color={colors.textSecondary} />
              <AdaptiveText 
                style={[styles.sectionTitle, { color: colors.textSecondary }]}
                adaptiveSize={{
                  'small-phone': 12,
                  phone: 14,
                  tablet: 16,
                }}
              >
                Description
              </AdaptiveText>
            </View>
            <AdaptiveText 
              style={[styles.description, { color: colors.text }]}
              adaptiveSize={{
                'small-phone': 14,
                phone: 16,
                tablet: 18,
              }}
            >
              {result.description}
            </AdaptiveText>
          </View>

          <View style={[
            styles.valueSection, 
            { 
              backgroundColor: colors.primary + '20',
              padding: cardPadding,
              marginBottom: cardPadding,
            }
          ]}>
            <View style={[styles.sectionHeader, { marginBottom: spacing.sm }]}>
              <Ionicons name="cash" size={iconSize} color={colors.primary} />
              <AdaptiveText 
                style={[styles.valueLabel, { color: colors.primary }]}
                adaptiveSize={{
                  'small-phone': 14,
                  phone: 16,
                  tablet: 18,
                }}
              >
                Estimated Value
              </AdaptiveText>
            </View>
            <AdaptiveText 
              style={[styles.value, { color: colors.primary }]}
              adaptiveSize={{
                'small-phone': 20,
                phone: 24,
                'large-phone': 26,
                tablet: 28,
              }}
            >
              {result.value}
            </AdaptiveText>
          </View>

          <View style={[styles.section, { marginBottom: cardPadding }]}>
            <View style={[styles.sectionHeader, { marginBottom: spacing.sm }]}>
              <Ionicons name="bulb" size={iconSize - 4} color={colors.textSecondary} />
              <AdaptiveText 
                style={[styles.sectionTitle, { color: colors.textSecondary }]}
                adaptiveSize={{
                  'small-phone': 12,
                  phone: 14,
                  tablet: 16,
                }}
              >
                AI Explanation
              </AdaptiveText>
            </View>
            <AdaptiveText 
              style={[styles.explanation, { color: colors.text }]}
              adaptiveSize={{
                'small-phone': 14,
                phone: 16,
                tablet: 18,
              }}
            >
              {result.aiExplanation}
            </AdaptiveText>
          </View>

          {result.visualMatches && result.visualMatches.length > 0 && (
            <View style={[styles.section, { marginBottom: cardPadding }]}>
              <View style={[styles.sectionHeader, { marginBottom: spacing.md }]}>
                <Ionicons name="images" size={iconSize - 4} color={colors.textSecondary} />
                <AdaptiveText 
                  style={[styles.sectionTitle, { color: colors.textSecondary }]}
                  adaptiveSize={{
                    'small-phone': 12,
                    phone: 14,
                    tablet: 16,
                  }}
                >
                  Visual Matches
                </AdaptiveText>
              </View>
              
              <AdaptiveGrid
                columns={{
                  'small-phone': 1,
                  phone: 1,
                  'large-phone': 2,
                  tablet: 3,
                }}
                spacing="sm"
              >
                {result.visualMatches.slice(0, 3).map((match, index) => (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.matchItem, 
                      { 
                        backgroundColor: colors.background, 
                        borderColor: colors.border,
                        padding: spacing.md,
                      }
                    ]}
                    onPress={() => openLink(match.link)}
                  >
                    {match.thumbnail && (
                      <Image 
                        source={{ uri: match.thumbnail }} 
                        style={[
                          styles.matchImage,
                          {
                            width: adaptiveValue({
                              'small-phone': 35,
                              phone: 40,
                              tablet: 45,
                            }),
                            height: adaptiveValue({
                              'small-phone': 35,
                              phone: 40,
                              tablet: 45,
                            }),
                          }
                        ]} 
                      />
                    )}
                    <View style={styles.matchContent}>
                      <AdaptiveText 
                        style={[styles.matchTitle, { color: colors.text }]} 
                        numberOfLines={2}
                        adaptiveSize={{
                          'small-phone': 12,
                          phone: 14,
                          tablet: 16,
                        }}
                      >
                        {match.title}
                      </AdaptiveText>
                      {match.source_icon && (
                        <Image 
                          source={{ uri: match.source_icon }} 
                          style={[
                            styles.sourceIcon,
                            {
                              width: adaptiveValue({
                                'small-phone': 14,
                                phone: 16,
                                tablet: 18,
                              }),
                              height: adaptiveValue({
                                'small-phone': 14,
                                phone: 16,
                                tablet: 18,
                              }),
                            }
                          ]} 
                        />
                      )}
                    </View>
                    <Ionicons 
                      name="chevron-forward" 
                      size={adaptiveValue({
                        'small-phone': 14,
                        phone: 16,
                        tablet: 18,
                      })} 
                      color={colors.textSecondary} 
                    />
                  </TouchableOpacity>
                ))}
              </AdaptiveGrid>
            </View>
          )}

          <View style={[
            styles.footer,
            {
              paddingTop: cardPadding,
              borderTopColor: colors.border,
            }
          ]}>
            <AdaptiveText 
              style={[styles.provider, { color: colors.textSecondary }]}
              adaptiveSize={{
                'small-phone': 10,
                phone: 12,
                tablet: 14,
              }}
            >
              Analyzed by: {result.apiProvider}
            </AdaptiveText>
            <AdaptiveText 
              style={[styles.timestamp, { color: colors.textSecondary }]}
              adaptiveSize={{
                'small-phone': 10,
                phone: 12,
                tablet: 14,
              }}
            >
              {new Date(result.timestamp).toLocaleString()}
            </AdaptiveText>
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

export default ResultCard;
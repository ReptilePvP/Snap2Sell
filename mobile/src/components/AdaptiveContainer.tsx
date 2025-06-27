import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { wp, hp, isTablet, spacing } from '../utils/responsive';

interface AdaptiveContainerProps {
  children: React.ReactNode;
  style?: ViewStyle;
  useSafeArea?: boolean;
  centerContent?: boolean;
  maxWidth?: number;
  padding?: keyof typeof spacing;
}

const AdaptiveContainer: React.FC<AdaptiveContainerProps> = ({
  children,
  style,
  useSafeArea = true,
  centerContent = false,
  maxWidth,
  padding = 'md',
}) => {
  const insets = useSafeAreaInsets();
  
  const containerStyle: ViewStyle = {
    flex: 1,
    paddingTop: useSafeArea ? insets.top : 0,
    paddingBottom: useSafeArea ? insets.bottom : 0,
    paddingLeft: useSafeArea ? insets.left : 0,
    paddingRight: useSafeArea ? insets.right : 0,
    paddingHorizontal: spacing[padding],
  };

  if (isTablet() && maxWidth) {
    containerStyle.maxWidth = maxWidth;
    containerStyle.alignSelf = 'center';
    containerStyle.width = '100%';
  }

  if (centerContent) {
    containerStyle.justifyContent = 'center';
    containerStyle.alignItems = 'center';
  }

  return (
    <View style={[containerStyle, style]}>
      {children}
    </View>
  );
};

export default AdaptiveContainer;
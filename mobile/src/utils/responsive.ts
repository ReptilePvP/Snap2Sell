import { Dimensions, PixelRatio } from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Device type detection
export const isTablet = () => {
  const pixelDensity = PixelRatio.get();
  const adjustedWidth = SCREEN_WIDTH * pixelDensity;
  const adjustedHeight = SCREEN_HEIGHT * pixelDensity;
  
  if (pixelDensity < 2 && (adjustedWidth >= 1000 || adjustedHeight >= 1000)) {
    return true;
  } else {
    return (
      pixelDensity === 2 && (adjustedWidth >= 1920 || adjustedHeight >= 1920)
    );
  }
};

export const isSmallPhone = () => SCREEN_WIDTH < 375;
export const isLargePhone = () => SCREEN_WIDTH >= 414;

// Responsive dimensions
export const wp = (percentage: number) => {
  const value = (percentage * SCREEN_WIDTH) / 100;
  return Math.round(PixelRatio.roundToNearestPixel(value));
};

export const hp = (percentage: number) => {
  const value = (percentage * SCREEN_HEIGHT) / 100;
  return Math.round(PixelRatio.roundToNearestPixel(value));
};

// Responsive font sizes
export const RFPercentage = (percent: number) => {
  const heightPercent = (percent * SCREEN_HEIGHT) / 100;
  return PixelRatio.roundToNearestPixel(heightPercent);
};

export const RFValue = (fontSize: number, standardScreenHeight = 812) => {
  const heightPercent = (fontSize * SCREEN_HEIGHT) / standardScreenHeight;
  return PixelRatio.roundToNearestPixel(heightPercent);
};

// Spacing system
export const spacing = {
  xs: wp(1),
  sm: wp(2),
  md: wp(4),
  lg: wp(6),
  xl: wp(8),
  xxl: wp(12),
};

// Typography scale
export const typography = {
  h1: RFValue(32),
  h2: RFValue(28),
  h3: RFValue(24),
  h4: RFValue(20),
  h5: RFValue(18),
  h6: RFValue(16),
  body: RFValue(16),
  bodySmall: RFValue(14),
  caption: RFValue(12),
  button: RFValue(16),
};

// Layout breakpoints
export const breakpoints = {
  small: 0,
  medium: 768,
  large: 1024,
  xlarge: 1440,
};

export const getDeviceType = () => {
  if (isTablet()) return 'tablet';
  if (isLargePhone()) return 'large-phone';
  if (isSmallPhone()) return 'small-phone';
  return 'phone';
};

// Adaptive values based on device type
export const adaptiveValue = (values: {
  'small-phone'?: any;
  phone?: any;
  'large-phone'?: any;
  tablet?: any;
}) => {
  const deviceType = getDeviceType();
  return values[deviceType] || values.phone || values['small-phone'];
};
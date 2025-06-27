import React from 'react';
import { Text, TextStyle, StyleProp } from 'react-native';
import { typography, getDeviceType } from '../utils/responsive';

interface AdaptiveTextProps {
  children: React.ReactNode;
  variant?: keyof typeof typography;
  style?: StyleProp<TextStyle>;
  adaptiveSize?: {
    'small-phone'?: number;
    phone?: number;
    'large-phone'?: number;
    tablet?: number;
  };
  [key: string]: any; // For other Text props
}

const AdaptiveText: React.FC<AdaptiveTextProps> = ({
  children,
  variant = 'body',
  style,
  adaptiveSize,
  ...props
}) => {
  const deviceType = getDeviceType();
  
  let fontSize = typography[variant];
  
  if (adaptiveSize) {
    fontSize = adaptiveSize[deviceType] || adaptiveSize.phone || fontSize;
  }

  return (
    <Text
      style={[
        { fontSize },
        style,
      ]}
      {...props}
    >
      {children}
    </Text>
  );
};

export default AdaptiveText;
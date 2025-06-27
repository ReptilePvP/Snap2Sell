import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { wp, isTablet, getDeviceType, spacing } from '../utils/responsive';

interface AdaptiveGridProps {
  children: React.ReactNode;
  columns?: {
    'small-phone'?: number;
    phone?: number;
    'large-phone'?: number;
    tablet?: number;
  };
  spacing?: keyof typeof spacing;
  style?: ViewStyle;
}

const AdaptiveGrid: React.FC<AdaptiveGridProps> = ({
  children,
  columns = { 'small-phone': 1, phone: 2, 'large-phone': 2, tablet: 3 },
  spacing: gridSpacing = 'md',
  style,
}) => {
  const deviceType = getDeviceType();
  const numColumns = columns[deviceType] || columns.phone || 2;
  const itemSpacing = spacing[gridSpacing];
  
  const childrenArray = React.Children.toArray(children);
  const rows: React.ReactNode[][] = [];
  
  for (let i = 0; i < childrenArray.length; i += numColumns) {
    rows.push(childrenArray.slice(i, i + numColumns));
  }

  const itemWidth = (wp(100) - (itemSpacing * (numColumns + 1))) / numColumns;

  return (
    <View style={[styles.container, style]}>
      {rows.map((row, rowIndex) => (
        <View key={rowIndex} style={[styles.row, { marginBottom: itemSpacing }]}>
          {row.map((child, itemIndex) => (
            <View
              key={itemIndex}
              style={[
                styles.item,
                {
                  width: itemWidth,
                  marginLeft: itemIndex > 0 ? itemSpacing : 0,
                },
              ]}
            >
              {child}
            </View>
          ))}
          {/* Fill empty spaces in the last row */}
          {row.length < numColumns &&
            Array.from({ length: numColumns - row.length }).map((_, index) => (
              <View
                key={`empty-${index}`}
                style={[
                  styles.item,
                  {
                    width: itemWidth,
                    marginLeft: itemSpacing,
                  },
                ]}
              />
            ))}
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
  },
  item: {
    // Width is set dynamically
  },
});

export default AdaptiveGrid;
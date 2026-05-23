import { StyleSheet, Text, View } from 'react-native';

import { colors, fontSize, formatPrice, radius, spacing } from '../styles/theme';

interface PriceTagProps {
  price: number;
  color?: string;
  size?: 'sm' | 'lg';
}

export default function PriceTag({ price, color = colors.primary, size = 'sm' }: PriceTagProps) {
  return (
    <View style={[styles.container, { backgroundColor: color }]}>
      <Text style={[styles.text, size === 'lg' && styles.textLarge]}>{formatPrice(price)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignSelf: 'flex-start',
    borderRadius: radius.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  text: {
    color: colors.white,
    fontSize: fontSize.sm,
    fontWeight: '700',
  },
  textLarge: {
    fontSize: fontSize.lg,
  },
});

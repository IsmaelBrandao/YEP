import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { Brand, Filters, FuelType } from '../services/types';
import { colors, fontSize, radius, spacing } from '../styles/theme';

const BRANDS: Brand[] = ['Shell', 'Ipiranga', 'Petrobras', 'Atem', 'Branded'];

const FUELS: { value: FuelType; label: string }[] = [
  { value: 'comum', label: 'Comum' },
  { value: 'aditivada', label: 'Aditivada' },
  { value: 'etanol', label: 'Etanol' },
  { value: 'diesel', label: 'Diesel' },
  { value: 'gnv', label: 'GNV' },
];

interface FilterBarProps {
  filters: Filters;
  onToggleBrand: (brand: Brand) => void;
  onSetFuel: (fuel: FuelType) => void;
}

export default function FilterBar({ filters, onToggleBrand, onSetFuel }: FilterBarProps) {
  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.row}
      >
        {FUELS.map((fuel) => {
          const active = filters.fuel === fuel.value;
          return (
            <TouchableOpacity
              key={fuel.value}
              style={[styles.chip, active && styles.chipActive]}
              onPress={() => onSetFuel(fuel.value)}
            >
              <Text style={[styles.chipText, active && styles.chipTextActive]}>{fuel.label}</Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.row}
      >
        {BRANDS.map((brand) => {
          const active = filters.brands.includes(brand);
          return (
            <TouchableOpacity
              key={brand}
              style={[styles.chip, styles.brandChip, active && styles.brandChipActive]}
              onPress={() => onToggleBrand(brand)}
            >
              <Text style={[styles.chipText, active && styles.brandChipTextActive]}>{brand}</Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.sm,
  },
  row: {
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
  },
  chip: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.pill,
    borderWidth: 1,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  chipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  chipText: {
    color: colors.text,
    fontSize: fontSize.sm,
    fontWeight: '600',
  },
  chipTextActive: {
    color: colors.white,
  },
  brandChip: {
    borderColor: colors.border,
  },
  brandChipActive: {
    backgroundColor: colors.secondary,
    borderColor: colors.secondary,
  },
  brandChipTextActive: {
    color: colors.text,
  },
});

import { useEffect, useMemo, useState } from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import FilterBar from '../../src/components/FilterBar';
import StationCard from '../../src/components/StationCard';
import { useFilters } from '../../src/hooks/useFilters';
import { useLocation } from '../../src/hooks/useLocation';
import { useSettings } from '../../src/hooks/SettingsContext';
import { useStations } from '../../src/hooks/useStations';
import { SortMode } from '../../src/services/types';
import { colors, fontSize, priceColor, radius, spacing } from '../../src/styles/theme';

export default function ListScreen() {
  const insets = useSafeAreaInsets();
  const [sortMode, setSortMode] = useState<SortMode>('price');
  const { coordinate } = useLocation();
  const { defaultFuel, searchRadius } = useSettings();
  const { filters, toggleBrand, setFuel } = useFilters();
  const stations = useStations({ origin: coordinate, filters, sortMode, radiusKm: searchRadius });

  useEffect(() => {
    setFuel(defaultFuel);
  }, [defaultFuel, setFuel]);

  const priceRange = useMemo(() => {
    const prices = stations
      .map((station) => station.prices[filters.fuel])
      .filter((value): value is number => value != null);
    return {
      min: prices.length ? Math.min(...prices) : 0,
      max: prices.length ? Math.max(...prices) : 0,
    };
  }, [stations, filters.fuel]);

  return (
    <View style={[styles.container, { paddingTop: insets.top + spacing.md }]}>
      <View style={styles.header}>
        <Text style={styles.title}>Postos próximos</Text>
        <View style={styles.toggle}>
          <TouchableOpacity
            style={[styles.toggleButton, sortMode === 'price' && styles.toggleActive]}
            onPress={() => setSortMode('price')}
          >
            <Text style={[styles.toggleText, sortMode === 'price' && styles.toggleTextActive]}>
              Menor preço
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.toggleButton, sortMode === 'distance' && styles.toggleActive]}
            onPress={() => setSortMode('distance')}
          >
            <Text style={[styles.toggleText, sortMode === 'distance' && styles.toggleTextActive]}>
              Distância
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <FilterBar filters={filters} onToggleBrand={toggleBrand} onSetFuel={setFuel} />

      <FlatList
        data={stations}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => {
          const price = item.prices[filters.fuel];
          const color =
            price == null ? colors.textMuted : priceColor(price, priceRange.min, priceRange.max);
          return (
            <StationCard
              station={item}
              fuel={filters.fuel}
              priceColor={color}
              onPress={() => router.push(`/station/${item.id}`)}
            />
          );
        }}
        ListEmptyComponent={
          <Text style={styles.empty}>Nenhum posto encontrado com esses filtros.</Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.background,
    flex: 1,
    gap: spacing.md,
  },
  header: {
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
  },
  title: {
    color: colors.text,
    fontSize: fontSize.xl,
    fontWeight: '800',
  },
  toggle: {
    backgroundColor: colors.surface,
    borderRadius: radius.pill,
    flexDirection: 'row',
    padding: 3,
  },
  toggleButton: {
    alignItems: 'center',
    borderRadius: radius.pill,
    flex: 1,
    paddingVertical: spacing.sm,
  },
  toggleActive: {
    backgroundColor: colors.primary,
  },
  toggleText: {
    color: colors.textMuted,
    fontSize: fontSize.sm,
    fontWeight: '600',
  },
  toggleTextActive: {
    color: colors.white,
  },
  list: {
    gap: spacing.md,
    padding: spacing.lg,
  },
  empty: {
    color: colors.textMuted,
    marginTop: spacing.xl,
    textAlign: 'center',
  },
});

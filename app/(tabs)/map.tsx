import { useMemo } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import FilterBar from '../../src/components/FilterBar';
import StationsMap from '../../src/components/StationsMap';
import { useFilters } from '../../src/hooks/useFilters';
import { useLocation } from '../../src/hooks/useLocation';
import { useStations } from '../../src/hooks/useStations';
import { colors, spacing } from '../../src/styles/theme';

export default function MapScreen() {
  const insets = useSafeAreaInsets();
  const { coordinate, loading } = useLocation();
  const { filters, toggleBrand, setFuel } = useFilters();
  const stations = useStations({ origin: coordinate, filters });

  const priceRange = useMemo(() => {
    const prices = stations
      .map((station) => station.prices[filters.fuel])
      .filter((value): value is number => value != null);
    return {
      min: prices.length ? Math.min(...prices) : 0,
      max: prices.length ? Math.max(...prices) : 0,
    };
  }, [stations, filters.fuel]);

  const region = {
    latitude: coordinate.latitude,
    longitude: coordinate.longitude,
    latitudeDelta: 0.08,
    longitudeDelta: 0.08,
  };

  if (loading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator color={colors.primary} size="large" />
        <Text style={styles.loadingText}>Localizando você...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StationsMap stations={stations} region={region} fuel={filters.fuel} priceRange={priceRange} />

      <View style={[styles.topBar, { paddingTop: insets.top + spacing.sm }]}>
        <FilterBar filters={filters} onToggleBrand={toggleBrand} onSetFuel={setFuel} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loading: {
    alignItems: 'center',
    backgroundColor: colors.background,
    flex: 1,
    gap: spacing.md,
    justifyContent: 'center',
  },
  loadingText: {
    color: colors.textMuted,
  },
  topBar: {
    backgroundColor: 'rgba(255,255,255,0.95)',
    left: 0,
    paddingBottom: spacing.sm,
    position: 'absolute',
    right: 0,
    top: 0,
    zIndex: 1100,
  },
});

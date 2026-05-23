import { useMemo, useRef } from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import MapView, { Marker, Region } from 'react-native-maps';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import FilterBar from '../../src/components/FilterBar';
import { useFilters } from '../../src/hooks/useFilters';
import { useLocation } from '../../src/hooks/useLocation';
import { useStations } from '../../src/hooks/useStations';
import { colors, formatPrice, priceColor, radius, spacing } from '../../src/styles/theme';

export default function MapScreen() {
  const insets = useSafeAreaInsets();
  const mapRef = useRef<MapView>(null);
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

  const region: Region = {
    latitude: coordinate.latitude,
    longitude: coordinate.longitude,
    latitudeDelta: 0.08,
    longitudeDelta: 0.08,
  };

  function recenter() {
    mapRef.current?.animateToRegion(region, 500);
  }

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
      <MapView ref={mapRef} style={styles.map} initialRegion={region} showsUserLocation>
        {stations.map((station) => {
          const price = station.prices[filters.fuel];
          const markerColor =
            price == null ? colors.textMuted : priceColor(price, priceRange.min, priceRange.max);
          return (
            <Marker
              key={station.id}
              coordinate={station.coordinate}
              onCalloutPress={() => router.push(`/station/${station.id}`)}
              title={station.name}
              description={station.address}
            >
              <View style={[styles.marker, { backgroundColor: markerColor }]}>
                <Text style={styles.markerText}>
                  {price == null ? '—' : formatPrice(price)}
                </Text>
                <View style={[styles.markerArrow, { borderTopColor: markerColor }]} />
              </View>
            </Marker>
          );
        })}
      </MapView>

      <View style={[styles.topBar, { paddingTop: insets.top + spacing.sm }]}>
        <FilterBar filters={filters} onToggleBrand={toggleBrand} onSetFuel={setFuel} />
      </View>

      <TouchableOpacity
        style={[styles.fab, { bottom: spacing.xl }]}
        onPress={recenter}
        activeOpacity={0.85}
      >
        <MaterialCommunityIcons name="crosshairs-gps" size={24} color={colors.white} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
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
  },
  marker: {
    alignItems: 'center',
    borderRadius: radius.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  markerText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: '800',
  },
  markerArrow: {
    borderLeftColor: 'transparent',
    borderLeftWidth: 5,
    borderRightColor: 'transparent',
    borderRightWidth: 5,
    borderTopWidth: 6,
    bottom: -6,
    position: 'absolute',
  },
  fab: {
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: radius.pill,
    elevation: 4,
    height: 56,
    justifyContent: 'center',
    position: 'absolute',
    right: spacing.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    width: 56,
  },
});

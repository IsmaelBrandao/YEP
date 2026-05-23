import { useRef } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import MapView, { Marker, Region } from 'react-native-maps';
import { router } from 'expo-router';

import { FuelType, StationWithDistance } from '../services/types';
import { colors, formatPrice, priceColor, radius, spacing } from '../styles/theme';

interface StationsMapProps {
  stations: StationWithDistance[];
  region: Region;
  fuel: FuelType;
  priceRange: { min: number; max: number };
}

export default function StationsMap({ stations, region, fuel, priceRange }: StationsMapProps) {
  const mapRef = useRef<MapView>(null);

  function recenter() {
    mapRef.current?.animateToRegion(region, 500);
  }

  return (
    <View style={styles.container}>
      <MapView ref={mapRef} style={styles.map} initialRegion={region} showsUserLocation>
        {stations.map((station) => {
          const price = station.prices[fuel];
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
                <Text style={styles.markerText}>{price == null ? '—' : formatPrice(price)}</Text>
                <View style={[styles.markerArrow, { borderTopColor: markerColor }]} />
              </View>
            </Marker>
          );
        })}
      </MapView>

      <TouchableOpacity style={styles.fab} onPress={recenter} activeOpacity={0.85}>
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
    bottom: spacing.xl,
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

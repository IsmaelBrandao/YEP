import { useEffect, useRef } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import MapView, { Circle, Marker, Region } from 'react-native-maps';
import { router } from 'expo-router';

import { Coordinate, FuelType, StationWithDistance } from '../services/types';
import { colors, formatPrice, priceColor, radius, spacing } from '../styles/theme';

interface StationsMapProps {
  stations: StationWithDistance[];
  region: Region;
  userCoordinate: Coordinate;
  radiusKm: number;
  fuel: FuelType;
  priceRange: { min: number; max: number };
  onRecenter: () => void;
}

export default function StationsMap({
  stations,
  region,
  userCoordinate,
  radiusKm,
  fuel,
  priceRange,
  onRecenter,
}: StationsMapProps) {
  const mapRef = useRef<MapView>(null);

  useEffect(() => {
    mapRef.current?.animateToRegion(region, 500);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userCoordinate.latitude, userCoordinate.longitude]);

  function recenter() {
    onRecenter();
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
              <View style={styles.marker}>
                <View style={[styles.priceLabel, { borderColor: markerColor }]}>
                  <Text style={[styles.priceText, { color: markerColor }]}>
                    {price == null ? '—' : formatPrice(price)}
                  </Text>
                </View>
                <View style={[styles.pin, { backgroundColor: markerColor }]}>
                  <View style={styles.pinDot} />
                </View>
                <View style={[styles.pinTip, { borderTopColor: markerColor }]} />
              </View>
            </Marker>
          );
        })}
        <Circle
          center={userCoordinate}
          radius={radiusKm * 1000}
          strokeColor={colors.primary}
          strokeWidth={2}
          fillColor="rgba(0,117,74,0.08)"
        />
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
  },
  priceLabel: {
    backgroundColor: colors.white,
    borderRadius: radius.pill,
    borderWidth: 1.5,
    elevation: 3,
    marginBottom: -4,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.25,
    shadowRadius: 2,
    zIndex: 2,
  },
  priceText: {
    fontSize: 12,
    fontWeight: '800',
  },
  pin: {
    alignItems: 'center',
    borderColor: colors.white,
    borderRadius: 11,
    borderWidth: 2,
    height: 22,
    justifyContent: 'center',
    width: 22,
  },
  pinDot: {
    backgroundColor: colors.white,
    borderRadius: 4,
    height: 7,
    width: 7,
  },
  pinTip: {
    borderLeftColor: 'transparent',
    borderLeftWidth: 5,
    borderRightColor: 'transparent',
    borderRightWidth: 5,
    borderTopWidth: 7,
    marginTop: -2,
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

import { MaterialCommunityIcons } from '@expo/vector-icons';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { FuelType, StationWithDistance } from '../services/types';
import { colors, fontSize, formatDistance, formatPrice, radius, spacing } from '../styles/theme';

const FUEL_LABEL: Record<FuelType, string> = {
  comum: 'Comum',
  aditivada: 'Aditivada',
  etanol: 'Etanol',
  diesel: 'Diesel',
  gnv: 'GNV',
};

interface StationCardProps {
  station: StationWithDistance;
  fuel: FuelType;
  priceColor: string;
  onPress: () => void;
}

export default function StationCard({ station, fuel, priceColor, onPress }: StationCardProps) {
  const price = station.prices[fuel];

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.8}>
      <View style={styles.iconBox}>
        <MaterialCommunityIcons name="gas-station" size={28} color={colors.primary} />
      </View>
      <View style={styles.info}>
        <Text style={styles.brand}>{station.brand}</Text>
        <Text style={styles.name} numberOfLines={1}>
          {station.name}
        </Text>
        <View style={styles.metaRow}>
          <MaterialCommunityIcons name="map-marker" size={14} color={colors.textMuted} />
          <Text style={styles.meta}>
            {station.neighborhood} · {formatDistance(station.distanceKm)}
          </Text>
        </View>
        <View style={styles.services}>
          {station.services.conveniencia && (
            <MaterialCommunityIcons name="store" size={16} color={colors.textMuted} />
          )}
          {station.services.calibragem && (
            <MaterialCommunityIcons name="car-tire-alert" size={16} color={colors.textMuted} />
          )}
          {station.services.lavagem && (
            <MaterialCommunityIcons name="car-wash" size={16} color={colors.textMuted} />
          )}
          {station.services.gnv && (
            <MaterialCommunityIcons name="fuel" size={16} color={colors.textMuted} />
          )}
        </View>
      </View>
      <View style={styles.priceBox}>
        <Text style={styles.fuelLabel}>{FUEL_LABEL[fuel]}</Text>
        {price == null ? (
          <Text style={styles.unavailable}>—</Text>
        ) : (
          <Text style={[styles.price, { color: priceColor }]}>{formatPrice(price)}</Text>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    alignItems: 'center',
    backgroundColor: colors.white,
    borderColor: colors.border,
    borderRadius: radius.md,
    borderWidth: 1,
    flexDirection: 'row',
    gap: spacing.md,
    padding: spacing.md,
  },
  iconBox: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    height: 52,
    justifyContent: 'center',
    width: 52,
  },
  info: {
    flex: 1,
    gap: 2,
  },
  brand: {
    color: colors.primary,
    fontSize: fontSize.xs,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  name: {
    color: colors.text,
    fontSize: fontSize.md,
    fontWeight: '600',
  },
  metaRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 2,
  },
  meta: {
    color: colors.textMuted,
    fontSize: fontSize.xs,
  },
  services: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  priceBox: {
    alignItems: 'flex-end',
  },
  fuelLabel: {
    color: colors.textMuted,
    fontSize: fontSize.xs,
  },
  price: {
    fontSize: fontSize.lg,
    fontWeight: '800',
  },
  unavailable: {
    color: colors.textMuted,
    fontSize: fontSize.lg,
    fontWeight: '800',
  },
});

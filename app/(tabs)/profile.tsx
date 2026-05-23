import { useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Slider from '@react-native-community/slider';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useAppData } from '../../src/hooks/AppDataContext';
import { getStationById } from '../../src/services/stations';
import { FuelType } from '../../src/services/types';
import { colors, fontSize, formatPrice, radius, spacing } from '../../src/styles/theme';

const FUELS: { value: FuelType; label: string }[] = [
  { value: 'comum', label: 'Comum' },
  { value: 'aditivada', label: 'Aditivada' },
  { value: 'etanol', label: 'Etanol' },
  { value: 'diesel', label: 'Diesel' },
  { value: 'gnv', label: 'GNV' },
];

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const { favorites, reports } = useAppData();
  const [defaultFuel, setDefaultFuel] = useState<FuelType>('comum');
  const [radius_, setRadius] = useState(5);

  const favoriteStations = favorites
    .map((id) => getStationById(id))
    .filter((station) => station != null);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[styles.content, { paddingTop: insets.top + spacing.lg }]}
    >
      <View style={styles.profileHeader}>
        <View style={styles.avatar}>
          <MaterialCommunityIcons name="account" size={48} color={colors.white} />
        </View>
        <Text style={styles.name}>Ismael Estudante</Text>
        <Text style={styles.email}>ismael@unic.edu.br</Text>
      </View>

      <Section title="Postos favoritos">
        {favoriteStations.length === 0 ? (
          <Text style={styles.muted}>Você ainda não favoritou nenhum posto.</Text>
        ) : (
          favoriteStations.map((station) => (
            <TouchableOpacity
              key={station!.id}
              style={styles.rowItem}
              onPress={() => router.push(`/station/${station!.id}`)}
            >
              <MaterialCommunityIcons name="gas-station" size={20} color={colors.primary} />
              <Text style={styles.rowText}>{station!.name}</Text>
              <Text style={styles.rowPrice}>{formatPrice(station!.prices.comum)}</Text>
            </TouchableOpacity>
          ))
        )}
      </Section>

      <Section title="Histórico de reportes">
        {reports.length === 0 ? (
          <Text style={styles.muted}>Nenhum preço reportado ainda.</Text>
        ) : (
          reports.map((report) => (
            <View key={report.id} style={styles.rowItem}>
              <MaterialCommunityIcons name="tag" size={20} color={colors.secondary} />
              <Text style={styles.rowText}>{report.stationName}</Text>
              <Text style={styles.rowPrice}>{formatPrice(report.price)}</Text>
            </View>
          ))
        )}
      </Section>

      <Section title="Combustível padrão">
        <View style={styles.radioGroup}>
          {FUELS.map((fuel) => {
            const active = defaultFuel === fuel.value;
            return (
              <TouchableOpacity
                key={fuel.value}
                style={styles.radioRow}
                onPress={() => setDefaultFuel(fuel.value)}
              >
                <MaterialCommunityIcons
                  name={active ? 'radiobox-marked' : 'radiobox-blank'}
                  size={22}
                  color={active ? colors.primary : colors.textMuted}
                />
                <Text style={styles.rowText}>{fuel.label}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </Section>

      <Section title={`Raio de busca: ${radius_} km`}>
        <Slider
          minimumValue={1}
          maximumValue={20}
          step={1}
          value={radius_}
          onValueChange={setRadius}
          minimumTrackTintColor={colors.primary}
          maximumTrackTintColor={colors.border}
          thumbTintColor={colors.primary}
        />
      </Section>

      <TouchableOpacity style={styles.logout} onPress={() => router.replace('/login')}>
        <MaterialCommunityIcons name="logout" size={20} color={colors.expensive} />
        <Text style={styles.logoutText}>Sair</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.sectionBody}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.background,
    flex: 1,
  },
  content: {
    gap: spacing.lg,
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  profileHeader: {
    alignItems: 'center',
    gap: spacing.xs,
  },
  avatar: {
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: radius.pill,
    height: 88,
    justifyContent: 'center',
    marginBottom: spacing.sm,
    width: 88,
  },
  name: {
    color: colors.text,
    fontSize: fontSize.lg,
    fontWeight: '800',
  },
  email: {
    color: colors.textMuted,
    fontSize: fontSize.sm,
  },
  section: {
    gap: spacing.sm,
  },
  sectionTitle: {
    color: colors.text,
    fontSize: fontSize.md,
    fontWeight: '700',
  },
  sectionBody: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
  },
  muted: {
    color: colors.textMuted,
    fontSize: fontSize.sm,
  },
  rowItem: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
    paddingVertical: spacing.sm,
  },
  rowText: {
    color: colors.text,
    flex: 1,
    fontSize: fontSize.sm,
  },
  rowPrice: {
    color: colors.primary,
    fontSize: fontSize.sm,
    fontWeight: '700',
  },
  radioGroup: {
    gap: spacing.xs,
  },
  radioRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
    paddingVertical: spacing.xs,
  },
  logout: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
    justifyContent: 'center',
    paddingVertical: spacing.md,
  },
  logoutText: {
    color: colors.expensive,
    fontSize: fontSize.md,
    fontWeight: '700',
  },
});

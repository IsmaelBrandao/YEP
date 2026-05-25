import { useMemo, useState } from 'react';
import {
  Alert,
  Image,
  Linking,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { router, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useAppData } from '../../src/hooks/AppDataContext';
import { useLocation } from '../../src/hooks/useLocation';
import { useStationsData } from '../../src/hooks/StationsContext';
import { distanceKm } from '../../src/services/geo';
import { FuelType } from '../../src/services/types';
import { colors, fontSize, formatDistance, formatPrice, radius, spacing } from '../../src/styles/theme';

const FUEL_ROWS: { value: FuelType; label: string }[] = [
  { value: 'comum', label: 'Gasolina comum' },
  { value: 'aditivada', label: 'Gasolina aditivada' },
  { value: 'etanol', label: 'Etanol' },
  { value: 'diesel', label: 'Diesel' },
  { value: 'gnv', label: 'GNV' },
];

export default function StationDetailScreen() {
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { coordinate } = useLocation();
  const { isFavorite, toggleFavorite, addReport } = useAppData();
  const { getById } = useStationsData();

  const station = getById(id);
  const [modalVisible, setModalVisible] = useState(false);
  const [reportPrice, setReportPrice] = useState('');
  const [reportFuel, setReportFuel] = useState<FuelType>('comum');
  const [photoUri, setPhotoUri] = useState<string | null>(null);

  const distance = useMemo(() => {
    if (!station) {
      return 0;
    }
    return distanceKm(coordinate, station.coordinate);
  }, [coordinate, station]);

  if (!station) {
    return (
      <View style={styles.notFound}>
        <Text style={styles.muted}>Posto não encontrado.</Text>
      </View>
    );
  }

  const favorite = isFavorite(station.id);

  function openDirections() {
    const { latitude, longitude } = station!.coordinate;
    const label = encodeURIComponent(station!.name);
    const url = `geo:${latitude},${longitude}?q=${latitude},${longitude}(${label})`;
    Linking.openURL(url).catch(() => {
      Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`);
    });
  }

  async function pickReceiptPhoto() {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permissão necessária', 'Autorize a câmera para fotografar o cupom.');
      return;
    }
    const result = await ImagePicker.launchCameraAsync({ quality: 0.5 });
    if (!result.canceled) {
      setPhotoUri(result.assets[0].uri);
    }
  }

  async function submitReport() {
    const value = Number(reportPrice.replace(',', '.'));
    if (!reportPrice.trim() || Number.isNaN(value) || value <= 0) {
      Alert.alert('Preço inválido', 'Informe um preço válido.');
      return;
    }
    await addReport({
      stationId: station!.id,
      stationName: station!.name,
      fuel: reportFuel,
      price: value,
      photoUri,
    });
    setModalVisible(false);
    setReportPrice('');
    setPhotoUri(null);
    Alert.alert('Obrigado!', 'Seu reporte foi registrado.');
  }

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View>
          <Image source={{ uri: station.photo }} style={styles.photo} />
          <View style={[styles.headerActions, { top: insets.top + spacing.sm }]}>
            <TouchableOpacity style={styles.circleButton} onPress={() => router.back()}>
              <MaterialCommunityIcons name="arrow-left" size={22} color={colors.text} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.circleButton} onPress={() => toggleFavorite(station.id)}>
              <MaterialCommunityIcons
                name={favorite ? 'heart' : 'heart-outline'}
                size={22}
                color={favorite ? colors.expensive : colors.text}
              />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.body}>
          <Text style={styles.brand}>{station.brand}</Text>
          <Text style={styles.name}>{station.name}</Text>
          <View style={styles.metaRow}>
            <MaterialCommunityIcons name="map-marker" size={16} color={colors.textMuted} />
            <Text style={styles.meta}>
              {station.address} · {formatDistance(distance)}
            </Text>
          </View>

          <View style={styles.table}>
            {FUEL_ROWS.map((row) => {
              const price = station.prices[row.value];
              return (
                <View key={row.value} style={styles.tableRow}>
                  <Text style={styles.tableLabel}>{row.label}</Text>
                  <Text style={styles.tablePrice}>
                    {price == null ? 'Indisponível' : formatPrice(price)}
                  </Text>
                </View>
              );
            })}
          </View>

          <Text style={styles.sectionTitle}>Serviços</Text>
          <View style={styles.services}>
            <ServiceBadge active={station.services.conveniencia} icon="store" label="Conveniência" />
            <ServiceBadge active={station.services.calibragem} icon="car-tire-alert" label="Calibragem" />
            <ServiceBadge active={station.services.lavagem} icon="car-wash" label="Lavagem" />
            <ServiceBadge active={station.services.gnv} icon="fuel" label="GNV" />
          </View>

          <TouchableOpacity style={styles.primaryButton} onPress={openDirections}>
            <MaterialCommunityIcons name="navigation-variant" size={20} color={colors.white} />
            <Text style={styles.primaryButtonText}>Como chegar</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.secondaryButton} onPress={() => setModalVisible(true)}>
            <MaterialCommunityIcons name="tag-plus" size={20} color={colors.primary} />
            <Text style={styles.secondaryButtonText}>Reportar preço diferente</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Reportar preço</Text>

            <View style={styles.fuelChips}>
              {FUEL_ROWS.map((row) => {
                const active = reportFuel === row.value;
                return (
                  <TouchableOpacity
                    key={row.value}
                    style={[styles.fuelChip, active && styles.fuelChipActive]}
                    onPress={() => setReportFuel(row.value)}
                  >
                    <Text style={[styles.fuelChipText, active && styles.fuelChipTextActive]}>
                      {row.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <TextInput
              style={styles.input}
              placeholder="Novo preço (ex: 5,89)"
              placeholderTextColor={colors.textMuted}
              keyboardType="decimal-pad"
              value={reportPrice}
              onChangeText={setReportPrice}
            />

            <TouchableOpacity style={styles.photoButton} onPress={pickReceiptPhoto}>
              <MaterialCommunityIcons name="camera" size={20} color={colors.primary} />
              <Text style={styles.photoButtonText}>
                {photoUri ? 'Foto anexada' : 'Tirar foto do cupom'}
              </Text>
            </TouchableOpacity>

            {photoUri && <Image source={{ uri: photoUri }} style={styles.preview} />}

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.modalCancel}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.modalCancelText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalConfirm} onPress={submitReport}>
                <Text style={styles.modalConfirmText}>Confirmar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

function ServiceBadge({
  active,
  icon,
  label,
}: {
  active: boolean;
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  label: string;
}) {
  return (
    <View style={[styles.serviceBadge, !active && styles.serviceBadgeOff]}>
      <MaterialCommunityIcons
        name={icon}
        size={18}
        color={active ? colors.primary : colors.textMuted}
      />
      <Text style={[styles.serviceLabel, !active && styles.serviceLabelOff]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.background,
    flex: 1,
  },
  scroll: {
    paddingBottom: spacing.xxl,
  },
  notFound: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  muted: {
    color: colors.textMuted,
    fontSize: fontSize.sm,
  },
  photo: {
    backgroundColor: colors.surface,
    height: 220,
    width: '100%',
  },
  headerActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    left: spacing.lg,
    position: 'absolute',
    right: spacing.lg,
  },
  circleButton: {
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: radius.pill,
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
  body: {
    gap: spacing.sm,
    padding: spacing.lg,
  },
  brand: {
    color: colors.primary,
    fontSize: fontSize.sm,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  name: {
    color: colors.text,
    fontSize: fontSize.xl,
    fontWeight: '800',
  },
  metaRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.xs,
  },
  meta: {
    color: colors.textMuted,
    flex: 1,
    fontSize: fontSize.sm,
  },
  table: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    marginTop: spacing.md,
    overflow: 'hidden',
  },
  tableRow: {
    alignItems: 'center',
    borderBottomColor: colors.border,
    borderBottomWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: spacing.md,
  },
  tableLabel: {
    color: colors.text,
    fontSize: fontSize.sm,
  },
  tablePrice: {
    color: colors.primary,
    fontSize: fontSize.md,
    fontWeight: '700',
  },
  sectionTitle: {
    color: colors.text,
    fontSize: fontSize.md,
    fontWeight: '700',
    marginTop: spacing.md,
  },
  services: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  serviceBadge: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.pill,
    flexDirection: 'row',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  serviceBadgeOff: {
    opacity: 0.4,
  },
  serviceLabel: {
    color: colors.text,
    fontSize: fontSize.xs,
    fontWeight: '600',
  },
  serviceLabelOff: {
    color: colors.textMuted,
  },
  primaryButton: {
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    flexDirection: 'row',
    gap: spacing.sm,
    justifyContent: 'center',
    marginTop: spacing.lg,
    paddingVertical: spacing.md,
  },
  primaryButtonText: {
    color: colors.white,
    fontSize: fontSize.md,
    fontWeight: '800',
  },
  secondaryButton: {
    alignItems: 'center',
    borderColor: colors.primary,
    borderRadius: radius.md,
    borderWidth: 1,
    flexDirection: 'row',
    gap: spacing.sm,
    justifyContent: 'center',
    paddingVertical: spacing.md,
  },
  secondaryButtonText: {
    color: colors.primary,
    fontSize: fontSize.md,
    fontWeight: '700',
  },
  modalOverlay: {
    backgroundColor: 'rgba(0,0,0,0.4)',
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: colors.white,
    borderTopLeftRadius: radius.lg,
    borderTopRightRadius: radius.lg,
    gap: spacing.md,
    padding: spacing.xl,
  },
  modalTitle: {
    color: colors.text,
    fontSize: fontSize.lg,
    fontWeight: '800',
  },
  fuelChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  fuelChip: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.pill,
    borderWidth: 1,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  fuelChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  fuelChipText: {
    color: colors.text,
    fontSize: fontSize.xs,
    fontWeight: '600',
  },
  fuelChipTextActive: {
    color: colors.white,
  },
  input: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.md,
    borderWidth: 1,
    color: colors.text,
    fontSize: fontSize.md,
    padding: spacing.md,
  },
  photoButton: {
    alignItems: 'center',
    borderColor: colors.primary,
    borderRadius: radius.md,
    borderStyle: 'dashed',
    borderWidth: 1,
    flexDirection: 'row',
    gap: spacing.sm,
    justifyContent: 'center',
    paddingVertical: spacing.md,
  },
  photoButtonText: {
    color: colors.primary,
    fontSize: fontSize.sm,
    fontWeight: '600',
  },
  preview: {
    borderRadius: radius.md,
    height: 140,
    width: '100%',
  },
  modalActions: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  modalCancel: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    flex: 1,
    paddingVertical: spacing.md,
  },
  modalCancelText: {
    color: colors.textMuted,
    fontSize: fontSize.md,
    fontWeight: '700',
  },
  modalConfirm: {
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    flex: 2,
    paddingVertical: spacing.md,
  },
  modalConfirmText: {
    color: colors.white,
    fontSize: fontSize.md,
    fontWeight: '800',
  },
});

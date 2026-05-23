import { useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { Brand, Filters, FuelType } from '../services/types';
import { colors, fontSize, radius, spacing } from '../styles/theme';

const BRANDS: Brand[] = ['Shell', 'Ipiranga', 'Petrobras', 'Atem', 'Branded'];

const FUELS: { value: FuelType; label: string }[] = [
  { value: 'comum', label: 'Gasolina comum' },
  { value: 'aditivada', label: 'Gasolina aditivada' },
  { value: 'etanol', label: 'Etanol' },
  { value: 'diesel', label: 'Diesel' },
  { value: 'gnv', label: 'GNV' },
];

type OpenMenu = 'none' | 'fuel' | 'brands';

interface FilterBarProps {
  filters: Filters;
  onToggleBrand: (brand: Brand) => void;
  onSetFuel: (fuel: FuelType) => void;
}

export default function FilterBar({ filters, onToggleBrand, onSetFuel }: FilterBarProps) {
  const [menu, setMenu] = useState<OpenMenu>('none');

  const fuelLabel = FUELS.find((item) => item.value === filters.fuel)?.label ?? 'Combustível';
  const brandsLabel =
    filters.brands.length === 0
      ? 'Todas as marcas'
      : `${filters.brands.length} marca${filters.brands.length > 1 ? 's' : ''}`;

  function clearBrands() {
    filters.brands.forEach(onToggleBrand);
  }

  return (
    <View style={styles.bar}>
      <FilterButton
        icon="gas-station"
        label={fuelLabel}
        active={menu === 'fuel'}
        highlighted
        onPress={() => setMenu('fuel')}
      />
      <FilterButton
        icon="tag-multiple"
        label={brandsLabel}
        active={menu === 'brands'}
        highlighted={filters.brands.length > 0}
        onPress={() => setMenu('brands')}
      />

      <Modal
        visible={menu !== 'none'}
        transparent
        animationType="fade"
        onRequestClose={() => setMenu('none')}
      >
        <Pressable style={styles.overlay} onPress={() => setMenu('none')}>
          <Pressable style={styles.sheet}>
            <View style={styles.handle} />

            {menu === 'fuel' && (
              <View>
                <Text style={styles.sheetTitle}>Combustível</Text>
                {FUELS.map((item) => {
                  const selected = filters.fuel === item.value;
                  return (
                    <TouchableOpacity
                      key={item.value}
                      style={styles.option}
                      onPress={() => {
                        onSetFuel(item.value);
                        setMenu('none');
                      }}
                    >
                      <MaterialCommunityIcons
                        name={selected ? 'radiobox-marked' : 'radiobox-blank'}
                        size={22}
                        color={selected ? colors.primary : colors.textMuted}
                      />
                      <Text style={[styles.optionText, selected && styles.optionTextActive]}>
                        {item.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            )}

            {menu === 'brands' && (
              <View>
                <View style={styles.sheetHeader}>
                  <Text style={styles.sheetTitle}>Marcas</Text>
                  <TouchableOpacity onPress={clearBrands} disabled={filters.brands.length === 0}>
                    <Text
                      style={[
                        styles.clear,
                        filters.brands.length === 0 && styles.clearDisabled,
                      ]}
                    >
                      Limpar
                    </Text>
                  </TouchableOpacity>
                </View>
                {BRANDS.map((brand) => {
                  const selected = filters.brands.includes(brand);
                  return (
                    <TouchableOpacity
                      key={brand}
                      style={styles.option}
                      onPress={() => onToggleBrand(brand)}
                    >
                      <MaterialCommunityIcons
                        name={selected ? 'checkbox-marked' : 'checkbox-blank-outline'}
                        size={22}
                        color={selected ? colors.primary : colors.textMuted}
                      />
                      <Text style={[styles.optionText, selected && styles.optionTextActive]}>
                        {brand}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
                <TouchableOpacity style={styles.doneButton} onPress={() => setMenu('none')}>
                  <Text style={styles.doneText}>Pronto</Text>
                </TouchableOpacity>
              </View>
            )}
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

interface FilterButtonProps {
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  label: string;
  active: boolean;
  highlighted: boolean;
  onPress: () => void;
}

function FilterButton({ icon, label, active, highlighted, onPress }: FilterButtonProps) {
  return (
    <TouchableOpacity
      style={[styles.button, (active || highlighted) && styles.buttonActive]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <MaterialCommunityIcons
        name={icon}
        size={18}
        color={active || highlighted ? colors.primary : colors.textMuted}
      />
      <Text style={[styles.buttonLabel, (active || highlighted) && styles.buttonLabelActive]} numberOfLines={1}>
        {label}
      </Text>
      <MaterialCommunityIcons
        name="chevron-down"
        size={18}
        color={active || highlighted ? colors.primary : colors.textMuted}
      />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
  },
  button: {
    alignItems: 'center',
    backgroundColor: colors.white,
    borderColor: colors.border,
    borderRadius: radius.pill,
    borderWidth: 1,
    flex: 1,
    flexDirection: 'row',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  buttonActive: {
    backgroundColor: '#E8F3EE',
    borderColor: colors.primary,
  },
  buttonLabel: {
    color: colors.textMuted,
    flex: 1,
    fontSize: fontSize.sm,
    fontWeight: '600',
  },
  buttonLabelActive: {
    color: colors.primary,
  },
  overlay: {
    backgroundColor: 'rgba(0,0,0,0.4)',
    flex: 1,
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: colors.white,
    borderTopLeftRadius: radius.lg,
    borderTopRightRadius: radius.lg,
    paddingBottom: spacing.xxl,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.md,
  },
  handle: {
    alignSelf: 'center',
    backgroundColor: colors.border,
    borderRadius: radius.pill,
    height: 4,
    marginBottom: spacing.md,
    width: 40,
  },
  sheetHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  sheetTitle: {
    color: colors.text,
    fontSize: fontSize.lg,
    fontWeight: '800',
    marginBottom: spacing.sm,
  },
  clear: {
    color: colors.primary,
    fontSize: fontSize.sm,
    fontWeight: '700',
  },
  clearDisabled: {
    color: colors.textMuted,
  },
  option: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.md,
    paddingVertical: spacing.md,
  },
  optionText: {
    color: colors.text,
    fontSize: fontSize.md,
  },
  optionTextActive: {
    color: colors.primary,
    fontWeight: '700',
  },
  doneButton: {
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    marginTop: spacing.md,
    paddingVertical: spacing.md,
  },
  doneText: {
    color: colors.white,
    fontSize: fontSize.md,
    fontWeight: '800',
  },
});

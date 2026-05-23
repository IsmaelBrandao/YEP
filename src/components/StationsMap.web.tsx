import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';

import { colors, fontSize, radius, spacing } from '../styles/theme';

export default function StationsMap() {
  return (
    <View style={styles.container}>
      <MaterialCommunityIcons name="map-search-outline" size={64} color={colors.primary} />
      <Text style={styles.title}>Mapa disponível no app</Text>
      <Text style={styles.subtitle}>
        O mapa interativo funciona no aplicativo (Android/iOS). Na web, use a aba Lista para ver os
        postos.
      </Text>
      <TouchableOpacity style={styles.button} onPress={() => router.push('/(tabs)/list')}>
        <MaterialCommunityIcons name="format-list-bulleted" size={20} color={colors.white} />
        <Text style={styles.buttonText}>Ver lista de postos</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    flex: 1,
    gap: spacing.md,
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
  },
  title: {
    color: colors.text,
    fontSize: fontSize.xl,
    fontWeight: '800',
  },
  subtitle: {
    color: colors.textMuted,
    fontSize: fontSize.md,
    textAlign: 'center',
  },
  button: {
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  buttonText: {
    color: colors.white,
    fontSize: fontSize.md,
    fontWeight: '700',
  },
});

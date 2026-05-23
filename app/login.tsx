import { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';

import { colors, fontSize, radius, spacing } from '../src/styles/theme';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  function handleLogin() {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Campos obrigatórios', 'Preencha e-mail e senha para continuar.');
      return;
    }
    router.replace('/(tabs)/map');
  }

  function handlePlaceholder(message: string) {
    Alert.alert('Em breve', message);
  }

  return (
    <View style={styles.container}>
      <View style={styles.accent} />
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.header}>
          <View style={styles.logo}>
            <MaterialCommunityIcons name="gas-station" size={40} color={colors.primary} />
          </View>
          <Text style={styles.brand}>YEP</Text>
          <Text style={styles.tagline}>Comparador de preços de combustível</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.title}>Entrar</Text>

          <View style={styles.field}>
            <MaterialCommunityIcons name="email-outline" size={20} color={colors.textMuted} />
            <TextInput
              style={styles.input}
              placeholder="E-mail"
              placeholderTextColor={colors.textMuted}
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={setEmail}
            />
          </View>

          <View style={styles.field}>
            <MaterialCommunityIcons name="lock-outline" size={20} color={colors.textMuted} />
            <TextInput
              style={styles.input}
              placeholder="Senha"
              placeholderTextColor={colors.textMuted}
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />
          </View>

          <TouchableOpacity onPress={() => handlePlaceholder('Recuperação de senha em desenvolvimento.')}>
            <Text style={styles.link}>Esqueci a senha</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.button} onPress={handleLogin}>
            <Text style={styles.buttonText}>Entrar</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => handlePlaceholder('Cadastro em desenvolvimento.')}>
            <Text style={styles.footerLink}>
              Não tem conta? <Text style={styles.footerLinkStrong}>Criar conta</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.primary,
    flex: 1,
  },
  flex: {
    flex: 1,
    justifyContent: 'center',
    padding: spacing.xl,
  },
  accent: {
    backgroundColor: colors.secondary,
    height: '45%',
    position: 'absolute',
    right: -120,
    top: -120,
    transform: [{ rotate: '25deg' }],
    width: '90%',
    opacity: 0.25,
    borderRadius: radius.lg,
  },
  header: {
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.xl,
  },
  logo: {
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    height: 80,
    justifyContent: 'center',
    width: 80,
  },
  brand: {
    color: colors.white,
    fontSize: fontSize.xxl,
    fontWeight: '900',
    letterSpacing: 2,
  },
  tagline: {
    color: colors.secondary,
    fontSize: fontSize.sm,
    fontWeight: '600',
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    gap: spacing.md,
    padding: spacing.xl,
  },
  title: {
    color: colors.text,
    fontSize: fontSize.xl,
    fontWeight: '800',
  },
  field: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.md,
    borderWidth: 1,
    flexDirection: 'row',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  input: {
    color: colors.text,
    flex: 1,
    fontSize: fontSize.md,
    paddingVertical: spacing.md,
  },
  link: {
    color: colors.primary,
    fontSize: fontSize.sm,
    fontWeight: '600',
    textAlign: 'right',
  },
  button: {
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
  },
  buttonText: {
    color: colors.white,
    fontSize: fontSize.md,
    fontWeight: '800',
  },
  footerLink: {
    color: colors.textMuted,
    fontSize: fontSize.sm,
    textAlign: 'center',
  },
  footerLinkStrong: {
    color: colors.primary,
    fontWeight: '700',
  },
});

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

type FocusField = 'email' | 'password' | null;

const noOutline = Platform.OS === 'web' ? ({ outlineStyle: 'none' } as object) : null;

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [focused, setFocused] = useState<FocusField>(null);

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

          <View style={[styles.field, focused === 'email' && styles.fieldFocused]}>
            <MaterialCommunityIcons name="email-outline" size={20} color={colors.textMuted} />
            <TextInput
              style={[styles.input, noOutline]}
              placeholder="E-mail"
              placeholderTextColor={colors.textMuted}
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={setEmail}
              onFocus={() => setFocused('email')}
              onBlur={() => setFocused(null)}
            />
          </View>

          <View style={[styles.field, focused === 'password' && styles.fieldFocused]}>
            <MaterialCommunityIcons name="lock-outline" size={20} color={colors.textMuted} />
            <TextInput
              style={[styles.input, noOutline]}
              placeholder="Senha"
              placeholderTextColor={colors.textMuted}
              secureTextEntry={!showPassword}
              value={password}
              onChangeText={setPassword}
              onFocus={() => setFocused('password')}
              onBlur={() => setFocused(null)}
            />
            <TouchableOpacity
              onPress={() => setShowPassword((prev) => !prev)}
              hitSlop={8}
              accessibilityLabel={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
            >
              <MaterialCommunityIcons
                name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                size={20}
                color={colors.textMuted}
              />
            </TouchableOpacity>
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
  fieldFocused: {
    backgroundColor: colors.white,
    borderColor: colors.primary,
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

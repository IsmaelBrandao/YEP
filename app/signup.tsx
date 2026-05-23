import { useState } from 'react';
import {
  ActivityIndicator,
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

import { useAuth } from '../src/hooks/AuthContext';
import { colors, fontSize, radius, spacing } from '../src/styles/theme';

const noOutline = Platform.OS === 'web' ? ({ outlineStyle: 'none' } as object) : null;

export default function SignUpScreen() {
  const { signUp } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  async function handleSignUp() {
    if (!name.trim() || !email.trim() || !password.trim()) {
      Alert.alert('Campos obrigatórios', 'Preencha nome, e-mail e senha.');
      return;
    }
    if (password.length < 6) {
      Alert.alert('Senha curta', 'A senha deve ter pelo menos 6 caracteres.');
      return;
    }
    setSubmitting(true);
    const { error, needsConfirmation } = await signUp(email.trim(), password, name.trim());
    setSubmitting(false);
    if (error) {
      Alert.alert('Não foi possível criar a conta', error);
      return;
    }
    if (needsConfirmation) {
      Alert.alert(
        'Confirme seu e-mail',
        'Enviamos um link de confirmação para o seu e-mail. Confirme e faça login.',
        [{ text: 'OK', onPress: () => router.replace('/login') }],
      );
      return;
    }
    router.replace('/(tabs)/map');
  }

  return (
    <View style={styles.container}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <TouchableOpacity style={styles.back} onPress={() => router.back()}>
          <MaterialCommunityIcons name="arrow-left" size={24} color={colors.text} />
        </TouchableOpacity>

        <Text style={styles.title}>Criar conta</Text>
        <Text style={styles.subtitle}>Comece a economizar no combustível</Text>

        <View style={styles.field}>
          <MaterialCommunityIcons name="account-outline" size={20} color={colors.textMuted} />
          <TextInput
            style={[styles.input, noOutline]}
            placeholder="Nome"
            placeholderTextColor={colors.textMuted}
            value={name}
            onChangeText={setName}
          />
        </View>

        <View style={styles.field}>
          <MaterialCommunityIcons name="email-outline" size={20} color={colors.textMuted} />
          <TextInput
            style={[styles.input, noOutline]}
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
            style={[styles.input, noOutline]}
            placeholder="Senha (mín. 6 caracteres)"
            placeholderTextColor={colors.textMuted}
            secureTextEntry={!showPassword}
            value={password}
            onChangeText={setPassword}
          />
          <TouchableOpacity onPress={() => setShowPassword((prev) => !prev)} hitSlop={8}>
            <MaterialCommunityIcons
              name={showPassword ? 'eye-off-outline' : 'eye-outline'}
              size={20}
              color={colors.textMuted}
            />
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={[styles.button, submitting && styles.buttonDisabled]}
          onPress={handleSignUp}
          disabled={submitting}
        >
          {submitting ? (
            <ActivityIndicator color={colors.white} />
          ) : (
            <Text style={styles.buttonText}>Criar conta</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.replace('/login')}>
          <Text style={styles.footerLink}>
            Já tem conta? <Text style={styles.footerLinkStrong}>Entrar</Text>
          </Text>
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.background,
    flex: 1,
  },
  flex: {
    flex: 1,
    gap: spacing.md,
    justifyContent: 'center',
    padding: spacing.xl,
  },
  back: {
    left: spacing.lg,
    position: 'absolute',
    top: spacing.xxl,
  },
  title: {
    color: colors.text,
    fontSize: fontSize.xxl,
    fontWeight: '900',
  },
  subtitle: {
    color: colors.textMuted,
    fontSize: fontSize.md,
    marginBottom: spacing.sm,
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
  button: {
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    justifyContent: 'center',
    marginTop: spacing.sm,
    minHeight: 50,
    paddingVertical: spacing.md,
  },
  buttonDisabled: {
    opacity: 0.7,
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

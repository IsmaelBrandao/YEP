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

export default function ForgotPasswordScreen() {
  const { resetPassword } = useAuth();
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleReset() {
    if (!email.trim()) {
      Alert.alert('Campo obrigatório', 'Informe seu e-mail.');
      return;
    }
    setSubmitting(true);
    const { error } = await resetPassword(email.trim());
    setSubmitting(false);
    if (error) {
      Alert.alert('Erro', error);
      return;
    }
    setSent(true);
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

        <Text style={styles.title}>Esqueci a senha</Text>

        {sent ? (
          <View style={styles.success}>
            <MaterialCommunityIcons name="email-check-outline" size={56} color={colors.primary} />
            <Text style={styles.successText}>
              Se existir uma conta com esse e-mail, enviamos um link para redefinir a senha.
            </Text>
            <TouchableOpacity style={styles.button} onPress={() => router.replace('/login')}>
              <Text style={styles.buttonText}>Voltar ao login</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            <Text style={styles.subtitle}>
              Digite seu e-mail e enviaremos um link para criar uma nova senha.
            </Text>

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

            <TouchableOpacity
              style={[styles.button, submitting && styles.buttonDisabled]}
              onPress={handleReset}
              disabled={submitting}
            >
              {submitting ? (
                <ActivityIndicator color={colors.white} />
              ) : (
                <Text style={styles.buttonText}>Enviar link</Text>
              )}
            </TouchableOpacity>
          </>
        )}
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
  success: {
    alignItems: 'center',
    gap: spacing.md,
  },
  successText: {
    color: colors.textMuted,
    fontSize: fontSize.md,
    textAlign: 'center',
  },
});

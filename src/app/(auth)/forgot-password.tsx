/**
 * Forgot Password Screen
 */
import React, { useState } from 'react';
import {
  View, Text, TextInput, Pressable, StyleSheet,
  KeyboardAvoidingView, Platform, ActivityIndicator, ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '@/providers';
import { colors, spacing, typography, radii, shadows } from '@/theme';
import { MIN_TOUCH_TARGET } from '@/constants';

export default function ForgotPasswordScreen() {
  const { resetPassword } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleReset = async () => {
    if (!email.trim()) {
      setError('Ingresa tu correo electrónico.');
      return;
    }
    setLoading(true);
    setError(null);
    const result = await resetPassword(email.trim());
    if (result.error) {
      setError(result.error);
    } else {
      setSent(true);
    }
    setLoading(false);
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <Pressable style={styles.backBtn} onPress={() => router.back()}>
          <MaterialCommunityIcons name="arrow-left" size={24} color={colors.graphite} />
        </Pressable>

        <View style={[styles.card, shadows.md]}>
          {sent ? (
            <>
              <View style={styles.successIcon}>
                <MaterialCommunityIcons name="email-check-outline" size={48} color={colors.success} />
              </View>
              <Text style={styles.cardTitle}>Revisa tu correo</Text>
              <Text style={styles.cardSubtitle}>
                Hemos enviado un enlace de recuperación a {email}
              </Text>
              <Pressable style={styles.loginBtn} onPress={() => router.back()}>
                <Text style={styles.loginBtnText}>Volver al inicio de sesión</Text>
              </Pressable>
            </>
          ) : (
            <>
              <Text style={styles.cardTitle}>Recuperar contraseña</Text>
              <Text style={styles.cardSubtitle}>
                Ingresa tu correo y te enviaremos un enlace para restablecer tu contraseña.
              </Text>

              {error && (
                <View style={styles.errorBox}>
                  <Text style={styles.errorText}>{error}</Text>
                </View>
              )}

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Correo electrónico</Text>
                <TextInput
                  style={styles.input}
                  value={email}
                  onChangeText={setEmail}
                  placeholder="tu@correo.com"
                  placeholderTextColor={colors.placeholder}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  editable={!loading}
                />
              </View>

              <Pressable
                style={[styles.loginBtn, loading && styles.loginBtnDisabled]}
                onPress={handleReset}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color={colors.surface} />
                ) : (
                  <Text style={styles.loginBtnText}>Enviar enlace</Text>
                )}
              </Pressable>
            </>
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scrollContent: { flexGrow: 1, justifyContent: 'center', padding: spacing.xl },
  backBtn: {
    width: MIN_TOUCH_TARGET, height: MIN_TOUCH_TARGET,
    borderRadius: radii.full, backgroundColor: colors.surface,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: spacing.xl, ...shadows.sm,
  },
  card: {
    backgroundColor: colors.surface, borderRadius: radii.xl, padding: spacing.xl,
  },
  successIcon: {
    width: 88, height: 88, borderRadius: radii.full,
    backgroundColor: colors.paleSage, alignItems: 'center',
    justifyContent: 'center', alignSelf: 'center', marginBottom: spacing.lg,
  },
  cardTitle: {
    fontFamily: typography.fontFamily.bold, fontSize: typography.sizes.title2,
    color: colors.graphite, marginBottom: spacing.xs,
  },
  cardSubtitle: {
    fontFamily: typography.fontFamily.regular, fontSize: typography.sizes.body,
    color: colors.placeholder, marginBottom: spacing.xl, lineHeight: typography.lineHeights.body,
  },
  errorBox: {
    backgroundColor: '#FCEAE8', borderRadius: radii.md,
    padding: spacing.md, marginBottom: spacing.base,
  },
  errorText: {
    fontFamily: typography.fontFamily.medium, fontSize: typography.sizes.subheadline, color: colors.danger,
  },
  inputGroup: { marginBottom: spacing.base },
  inputLabel: {
    fontFamily: typography.fontFamily.medium, fontSize: typography.sizes.subheadline,
    color: colors.graphite, marginBottom: spacing.xs,
  },
  input: {
    backgroundColor: colors.background, borderRadius: radii.md,
    borderWidth: 1, borderColor: colors.border, paddingHorizontal: spacing.base,
    minHeight: MIN_TOUCH_TARGET, fontFamily: typography.fontFamily.regular,
    fontSize: typography.sizes.body, color: colors.graphite,
  },
  loginBtn: {
    backgroundColor: colors.walnut, borderRadius: radii.lg,
    minHeight: MIN_TOUCH_TARGET + 4, alignItems: 'center',
    justifyContent: 'center', marginTop: spacing.sm,
  },
  loginBtnDisabled: { opacity: 0.6 },
  loginBtnText: {
    fontFamily: typography.fontFamily.bold, fontSize: typography.sizes.callout, color: colors.surface,
  },
});

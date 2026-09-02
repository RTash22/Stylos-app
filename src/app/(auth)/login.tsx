/**
 * Login Screen
 */
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { Link } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { useAuth } from '@/providers';
import { colors, spacing, typography, radii, shadows } from '@/theme';
import { APP_NAME, MIN_TOUCH_TARGET } from '@/constants';

export default function LoginScreen() {
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (loading) return;
    const cleanEmail = email.trim();
    if (!cleanEmail || !password) {
      setError('Ingresa tu correo y contraseña.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await signIn(cleanEmail, password);
      if (result.error) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        setError('Credenciales incorrectas. Verifica tu correo y contraseña.');
      } else {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
    } catch {
      setError('Ocurrió un error al iniciar sesión. Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {/* Brand */}
        <View style={styles.brandSection}>
          <View style={styles.logoCircle}>
            <Text style={styles.logoText}>ES</Text>
          </View>
          <Text style={styles.brandName}>{APP_NAME}</Text>
          <Text style={styles.brandSubtitle}>Salón</Text>
        </View>

        {/* Form Card */}
        <View style={[styles.card, shadows.md]}>
          <Text style={styles.cardTitle}>Iniciar sesión</Text>
          <Text style={styles.cardSubtitle}>
            Ingresa con tu cuenta de trabajador
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
              autoComplete="email"
              autoCorrect={false}
              editable={!loading}
              accessibilityLabel="Correo electrónico"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Contraseña</Text>
            <TextInput
              style={styles.input}
              value={password}
              onChangeText={setPassword}
              placeholder="••••••••"
              placeholderTextColor={colors.placeholder}
              secureTextEntry
              autoComplete="password"
              editable={!loading}
              accessibilityLabel="Contraseña"
            />
          </View>

          <Pressable
            style={({ pressed }) => [
              styles.loginBtn,
              pressed && styles.loginBtnPressed,
              loading && styles.loginBtnDisabled,
            ]}
            onPress={handleLogin}
            disabled={loading}
            accessibilityRole="button"
            accessibilityLabel="Iniciar sesión"
          >
            {loading ? (
              <ActivityIndicator color={colors.surface} />
            ) : (
              <Text style={styles.loginBtnText}>Iniciar sesión</Text>
            )}
          </Pressable>

          <Link href="/(auth)/forgot-password" asChild>
            <Pressable style={styles.forgotLink} accessibilityRole="link">
              <Text style={styles.forgotLinkText}>¿Olvidaste tu contraseña?</Text>
            </Pressable>
          </Link>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: spacing.xl,
  },
  brandSection: {
    alignItems: 'center',
    marginBottom: spacing['3xl'],
  },
  logoCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.walnut,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  logoText: {
    fontFamily: typography.fontFamily.bold,
    fontSize: typography.sizes.title1,
    color: colors.surface,
  },
  brandName: {
    fontFamily: typography.fontFamily.bold,
    fontSize: typography.sizes.largeTitle,
    color: colors.graphite,
  },
  brandSubtitle: {
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.sizes.title3,
    color: colors.oliveGold,
    letterSpacing: 4,
    textTransform: 'uppercase',
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radii.xl,
    padding: spacing.xl,
  },
  cardTitle: {
    fontFamily: typography.fontFamily.bold,
    fontSize: typography.sizes.title2,
    color: colors.graphite,
    marginBottom: spacing.xs,
  },
  cardSubtitle: {
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.sizes.body,
    color: colors.placeholder,
    marginBottom: spacing.xl,
  },
  errorBox: {
    backgroundColor: '#FCEAE8',
    borderRadius: radii.md,
    padding: spacing.md,
    marginBottom: spacing.base,
  },
  errorText: {
    fontFamily: typography.fontFamily.medium,
    fontSize: typography.sizes.subheadline,
    color: colors.danger,
  },
  inputGroup: {
    marginBottom: spacing.base,
  },
  inputLabel: {
    fontFamily: typography.fontFamily.medium,
    fontSize: typography.sizes.subheadline,
    color: colors.graphite,
    marginBottom: spacing.xs,
  },
  input: {
    backgroundColor: colors.background,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.base,
    minHeight: MIN_TOUCH_TARGET,
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.sizes.body,
    color: colors.graphite,
  },
  loginBtn: {
    backgroundColor: colors.walnut,
    borderRadius: radii.lg,
    minHeight: MIN_TOUCH_TARGET + 4,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.sm,
  },
  loginBtnPressed: {
    opacity: 0.85,
  },
  loginBtnDisabled: {
    opacity: 0.6,
  },
  loginBtnText: {
    fontFamily: typography.fontFamily.bold,
    fontSize: typography.sizes.callout,
    color: colors.surface,
  },
  forgotLink: {
    alignItems: 'center',
    marginTop: spacing.lg,
    minHeight: MIN_TOUCH_TARGET,
    justifyContent: 'center',
  },
  forgotLinkText: {
    fontFamily: typography.fontFamily.medium,
    fontSize: typography.sizes.subheadline,
    color: colors.oliveGold,
  },
});

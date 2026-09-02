/**
 * Root Layout — App entry point with Expo Router.
 *
 * Wraps the app with providers, loads fonts,
 * and handles initial auth state routing.
 */
import React, { useEffect } from 'react';
import { View, Text, Pressable, ActivityIndicator, StyleSheet } from 'react-native';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFonts, Inter_400Regular, Inter_500Medium, Inter_600SemiBold, Inter_700Bold } from '@expo-google-fonts/inter';
import { AuthProvider, useAuth, NotificationProvider } from '@/providers';
import { colors, spacing, typography, radii, shadows } from '@/theme';
import { MIN_TOUCH_TARGET } from '@/constants';

function RootNavigation() {
  const {
    loading,
    isInitializing,
    session,
    profile,
    role,
    profileError,
    signOut,
    refreshProfile,
  } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (isInitializing || loading) return;

    const inAuthGroup = segments[0] === '(auth)';
    const inAdminGroup = segments[0] === '(admin)';
    const inBarberGroup = segments[0] === '(barber)';

    if (!session) {
      // No session → go to login
      if (!inAuthGroup) {
        router.replace('/(auth)/login');
      }
      return;
    }

    // Session exists but no valid profile loaded yet (error / inactive / missing)
    // Do NOT redirect to login while session is active; render the controlled error view.
    if (!profile) {
      return;
    }

    // Authenticated with profile — enforce role boundaries
    if (role === 'admin') {
      if (!inAdminGroup) {
        router.replace('/(admin)/(tabs)');
      }
    } else if (role === 'peluquero') {
      if (!inBarberGroup) {
        router.replace('/(barber)/(tabs)');
      }
    } else {
      // Unknown role fallback
      if (!inAuthGroup) {
        router.replace('/(auth)/login');
      }
    }
  }, [isInitializing, loading, session, profile, role, segments, router]);

  if (isInitializing || loading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={colors.walnut} />
      </View>
    );
  }

  // Session exists but failed to load profile or account deactivated
  if (session && !profile) {
    return (
      <View style={styles.errorContainer}>
        <View style={styles.errorCard}>
          <Text style={styles.errorTitle}>Problema con la cuenta</Text>
          <Text style={styles.errorMessage}>
            {profileError || 'No se pudo cargar la información de tu perfil. Por favor contacta al administrador.'}
          </Text>
          <Pressable
            style={({ pressed }) => [styles.retryBtn, pressed && styles.btnPressed]}
            onPress={() => refreshProfile()}
            accessibilityRole="button"
            accessibilityLabel="Reintentar cargar perfil"
          >
            <Text style={styles.retryBtnText}>Reintentar</Text>
          </Pressable>
          <Pressable
            style={({ pressed }) => [styles.signOutBtn, pressed && styles.btnPressed]}
            onPress={() => signOut()}
            accessibilityRole="button"
            accessibilityLabel="Cerrar sesión"
          >
            <Text style={styles.signOutBtnText}>Cerrar sesión</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.background },
        animation: 'fade',
      }}
    />
  );
}

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  if (!fontsLoaded) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={colors.walnut} />
      </View>
    );
  }

  return (
    <AuthProvider>
      <NotificationProvider>
        <StatusBar style="dark" backgroundColor={colors.background} />
        <RootNavigation />
      </NotificationProvider>
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorContainer: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  errorCard: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: colors.surface,
    borderRadius: radii.xl,
    padding: spacing.xl,
    alignItems: 'center',
    ...shadows.md,
  },
  errorTitle: {
    fontFamily: typography.fontFamily.bold,
    fontSize: typography.sizes.title2,
    color: colors.graphite,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  errorMessage: {
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.sizes.body,
    color: colors.placeholder,
    textAlign: 'center',
    marginBottom: spacing.xl,
    lineHeight: typography.lineHeights.body,
  },
  retryBtn: {
    width: '100%',
    backgroundColor: colors.walnut,
    borderRadius: radii.lg,
    minHeight: MIN_TOUCH_TARGET,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  retryBtnText: {
    fontFamily: typography.fontFamily.bold,
    fontSize: typography.sizes.callout,
    color: colors.surface,
  },
  signOutBtn: {
    width: '100%',
    backgroundColor: 'transparent',
    borderRadius: radii.lg,
    minHeight: MIN_TOUCH_TARGET,
    alignItems: 'center',
    justifyContent: 'center',
  },
  signOutBtnText: {
    fontFamily: typography.fontFamily.medium,
    fontSize: typography.sizes.subheadline,
    color: colors.danger,
  },
  btnPressed: {
    opacity: 0.85,
  },
});

/**
 * Root Layout — App entry point with Expo Router.
 *
 * Wraps the app with providers, loads fonts,
 * and handles initial auth state routing.
 */
import React, { useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFonts, Inter_400Regular, Inter_500Medium, Inter_600SemiBold, Inter_700Bold } from '@expo-google-fonts/inter';
import { AuthProvider, useAuth, NotificationProvider } from '@/providers';
import { colors } from '@/theme';

function RootNavigation() {
  const { loading, session, profile, role } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    const inAuthGroup = segments[0] === '(auth)';

    if (!session) {
      // No session → go to login
      if (!inAuthGroup) {
        router.replace('/(auth)/login');
      }
      return;
    }

    if (!profile) {
      // Session exists but no profile → sign out or show error
      // For now, stay on auth screen
      if (!inAuthGroup) {
        router.replace('/(auth)/login');
      }
      return;
    }

    // Authenticated with profile — route by role
    if (inAuthGroup) {
      if (role === 'admin') {
        router.replace('/(admin)/(tabs)');
      } else {
        router.replace('/(barber)/(tabs)');
      }
    }
  }, [loading, session, profile, role, segments]);

  if (loading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={colors.walnut} />
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
});

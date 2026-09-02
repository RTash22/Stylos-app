/**
 * Admin — Settings
 */
import React from 'react';
import { Text, ScrollView, Pressable, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '@/providers';
import { colors, spacing, typography, radii, shadows } from '@/theme';
import { MIN_TOUCH_TARGET } from '@/constants';

export default function AdminSettingsScreen() {
  const { signOut } = useAuth();

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Ajustes</Text>

        <Pressable style={[styles.signOutBtn, shadows.sm]} onPress={signOut}>
          <MaterialCommunityIcons name="logout" size={20} color={colors.danger} />
          <Text style={styles.signOutText}>Cerrar sesión</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.xl, paddingBottom: spacing['3xl'] },
  title: {
    fontFamily: typography.fontFamily.bold,
    fontSize: typography.sizes.title1,
    color: colors.graphite,
    marginBottom: spacing.xl,
  },
  signOutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
    borderRadius: radii.xl,
    minHeight: MIN_TOUCH_TARGET + 4,
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: '#EFC6C2',
  },
  signOutText: {
    fontFamily: typography.fontFamily.semibold,
    fontSize: typography.sizes.callout,
    color: colors.danger,
  },
});

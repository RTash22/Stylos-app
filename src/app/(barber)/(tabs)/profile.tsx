/**
 * Barber Profile Screen
 */
import React from 'react';
import { View, Text, Pressable, ScrollView, StyleSheet, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useAuth } from '@/providers';
import { colors, spacing, typography, radii, shadows } from '@/theme';
import { APP_NAME, MIN_TOUCH_TARGET } from '@/constants';

export default function BarberProfileScreen() {
  const router = useRouter();
  const { profile, signOut } = useAuth();

  const handleSignOut = async () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    Alert.alert(
      'Cerrar sesión',
      '¿Estás seguro de que deseas cerrar sesión?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Cerrar sesión',
          style: 'destructive',
          onPress: async () => { await signOut(); },
        },
      ],
    );
  };

  const menuItems = [
    {
      icon: 'calendar-clock' as const,
      label: 'Mi horario',
      onPress: () => router.push('/(barber)/availability'),
    },
  ];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Perfil</Text>

        {/* Profile Card */}
        <View style={[styles.profileCard, shadows.md]}>
          <View style={styles.avatarLarge}>
            <Text style={styles.avatarLargeText}>
              {profile?.full_name?.[0]?.toUpperCase() ?? '?'}
            </Text>
          </View>
          <Text style={styles.profileName}>{profile?.full_name ?? 'Sin nombre'}</Text>
          <Text style={styles.profileRole}>Peluquero · {APP_NAME}</Text>
          {profile?.phone_e164 && (
            <Text style={styles.profilePhone}>{profile.phone_e164}</Text>
          )}
        </View>

        {/* Menu */}
        <View style={[styles.menuCard, shadows.sm]}>
          {menuItems.map((item) => (
            <Pressable
              key={item.label}
              style={styles.menuItem}
              onPress={item.onPress}
            >
              <MaterialCommunityIcons name={item.icon} size={22} color={colors.walnut} />
              <Text style={styles.menuLabel}>{item.label}</Text>
              <MaterialCommunityIcons name="chevron-right" size={20} color={colors.disabled} />
            </Pressable>
          ))}
        </View>

        {/* Sign Out */}
        <Pressable
          style={[styles.signOutBtn, shadows.sm]}
          onPress={handleSignOut}
        >
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
    fontFamily: typography.fontFamily.bold, fontSize: typography.sizes.title1,
    color: colors.graphite, marginBottom: spacing.xl,
  },
  profileCard: {
    backgroundColor: colors.surface, borderRadius: radii.xl,
    padding: spacing.xl, alignItems: 'center', marginBottom: spacing.xl,
  },
  avatarLarge: {
    width: 80, height: 80, borderRadius: 40, backgroundColor: colors.walnut,
    alignItems: 'center', justifyContent: 'center', marginBottom: spacing.md,
  },
  avatarLargeText: {
    fontFamily: typography.fontFamily.bold, fontSize: typography.sizes.title1, color: colors.surface,
  },
  profileName: {
    fontFamily: typography.fontFamily.bold, fontSize: typography.sizes.title3, color: colors.graphite,
  },
  profileRole: {
    fontFamily: typography.fontFamily.regular, fontSize: typography.sizes.body,
    color: colors.icon, marginTop: spacing.xxs,
  },
  profilePhone: {
    fontFamily: typography.fontFamily.regular, fontSize: typography.sizes.footnote,
    color: colors.placeholder, marginTop: spacing.xs,
  },
  menuCard: {
    backgroundColor: colors.surface, borderRadius: radii.xl,
    overflow: 'hidden', marginBottom: spacing.xl,
  },
  menuItem: {
    flexDirection: 'row', alignItems: 'center', padding: spacing.base,
    gap: spacing.md, minHeight: MIN_TOUCH_TARGET,
    borderBottomWidth: 1, borderBottomColor: colors.border,
  },
  menuLabel: {
    flex: 1, fontFamily: typography.fontFamily.medium,
    fontSize: typography.sizes.body, color: colors.graphite,
  },
  signOutBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    backgroundColor: colors.surface, borderRadius: radii.xl,
    minHeight: MIN_TOUCH_TARGET + 4, gap: spacing.sm,
    borderWidth: 1, borderColor: '#EFC6C2',
  },
  signOutText: {
    fontFamily: typography.fontFamily.semibold, fontSize: typography.sizes.callout, color: colors.danger,
  },
});

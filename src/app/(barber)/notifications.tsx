/**
 * Notifications Screen — Shared between barber and admin.
 */
import React, { useCallback, useState } from 'react';
import {
  View, Text, FlatList, Pressable, RefreshControl, StyleSheet,
} from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useNotificationContext } from '@/providers';
import { colors, spacing, typography, radii, shadows } from '@/theme';
import { EmptyState, LoadingSkeleton } from '@/components/ui';
import type { AppNotification } from '@/types';

export default function NotificationsScreen() {
  const router = useRouter();
  const {
    notifications, unreadCount, loading,
    refresh, markAsRead, markAllAsRead,
  } = useNotificationContext();

  const [refreshing, setRefreshing] = useState(false);
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refresh();
    setRefreshing(false);
  }, [refresh]);

  const handleMarkAllRead = useCallback(async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await markAllAsRead();
  }, [markAllAsRead]);

  const handleNotificationPress = useCallback(async (notification: AppNotification) => {
    if (!notification.read) {
      await markAsRead(notification.id);
    }

    // Navigate based on notification data
    const data = notification.data;
    if (data?.appointmentId) {
      router.push(`/(barber)/appointment/${data.appointmentId}`);
    } else if (data?.clientId) {
      router.push(`/(barber)/client/${data.clientId}`);
    } else if (data?.proofId) {
      router.push(`/(admin)/proof/${data.proofId}`);
    }
  }, [markAsRead, router]);

  const formatTimeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const minutes = Math.floor(diff / 60000);
    if (minutes < 1) return 'Ahora';
    if (minutes < 60) return `Hace ${minutes}m`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `Hace ${hours}h`;
    const days = Math.floor(hours / 24);
    return `Hace ${days}d`;
  };

  const renderItem = ({ item }: { item: AppNotification }) => (
    <Pressable
      style={[styles.notifCard, shadows.sm, !item.read && styles.unread]}
      onPress={() => handleNotificationPress(item)}
    >
      <View style={[styles.dot, !item.read && styles.dotActive]} />
      <View style={styles.notifContent}>
        <Text style={[styles.notifTitle, !item.read && styles.notifTitleUnread]} numberOfLines={1}>
          {item.title}
        </Text>
        <Text style={styles.notifBody} numberOfLines={2}>
          {item.body}
        </Text>
        <Text style={styles.notifTime}>{formatTimeAgo(item.created_at)}</Text>
      </View>
      <MaterialCommunityIcons name="chevron-right" size={18} color={colors.icon} />
    </Pressable>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Stack.Screen options={{
        headerShown: true,
        title: 'Notificaciones',
        headerTintColor: colors.walnut,
        headerStyle: { backgroundColor: colors.background },
        headerTitleStyle: {
          fontFamily: typography.fontFamily.bold,
          fontSize: typography.sizes.headline,
          color: colors.graphite,
        },
        headerRight: () =>
          unreadCount > 0 ? (
            <Pressable onPress={handleMarkAllRead} style={styles.markAllBtn}>
              <Text style={styles.markAllText}>Marcar todas</Text>
            </Pressable>
          ) : null,
      }} />

      {loading ? (
        <View style={styles.skeletonList}>
          {[1, 2, 3, 4, 5].map((i) => <LoadingSkeleton key={i} height={72} />)}
        </View>
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.walnut} />}
          ListEmptyComponent={
            <EmptyState
              icon="bell-off-outline"
              title="Sin notificaciones"
              message="Las notificaciones de tus citas aparecerán aquí."
            />
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  listContent: { padding: spacing.xl, paddingBottom: spacing['3xl'], gap: spacing.md },
  skeletonList: { padding: spacing.xl, gap: spacing.md },
  notifCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radii.xl,
    padding: spacing.lg,
    gap: spacing.md,
  },
  unread: {
    borderLeftWidth: 3,
    borderLeftColor: colors.walnut,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'transparent',
  },
  dotActive: {
    backgroundColor: colors.walnut,
  },
  notifContent: {
    flex: 1,
  },
  notifTitle: {
    fontFamily: typography.fontFamily.medium,
    fontSize: typography.sizes.body,
    color: colors.graphite,
    marginBottom: spacing.xxs,
  },
  notifTitleUnread: {
    fontFamily: typography.fontFamily.bold,
  },
  notifBody: {
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.sizes.subheadline,
    color: colors.icon,
    marginBottom: spacing.xs,
  },
  notifTime: {
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.sizes.caption,
    color: colors.placeholder,
  },
  markAllBtn: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  markAllText: {
    fontFamily: typography.fontFamily.semibold,
    fontSize: typography.sizes.subheadline,
    color: colors.walnut,
  },
});

/**
 * NotificationProvider — Wraps the app to handle push notification setup.
 *
 * Initializes device token registration and manages notification listeners.
 * Must be nested inside AuthProvider since it depends on the user ID.
 */
import React, { createContext, useContext, useMemo } from 'react';
import { useAuth } from './AuthProvider';
import { useNotifications } from '@/hooks/useNotifications';
import type { AppNotification } from '@/types';

interface NotificationContextValue {
  expoPushToken: string | null;
  notifications: AppNotification[];
  unreadCount: number;
  loading: boolean;
  refresh: () => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextValue | undefined>(undefined);

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();

  const {
    expoPushToken,
    notifications,
    unreadCount,
    loading,
    refresh,
    markAsRead,
    markAllAsRead,
  } = useNotifications(user?.id ?? null);

  const value = useMemo(
    () => ({
      expoPushToken,
      notifications,
      unreadCount,
      loading,
      refresh,
      markAsRead,
      markAllAsRead,
    }),
    [expoPushToken, notifications, unreadCount, loading, refresh, markAsRead, markAllAsRead],
  );

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}

/** Hook to consume notification context */
export function useNotificationContext(): NotificationContextValue {
  const ctx = useContext(NotificationContext);
  if (!ctx) {
    throw new Error('useNotificationContext must be used within a NotificationProvider');
  }
  return ctx;
}

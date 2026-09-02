/**
 * Hook: useNotifications
 *
 * Manages push notification setup, device token registration,
 * and notification handling for the app.
 */
import { useState, useEffect, useCallback, useRef } from 'react';
import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import { useRouter } from 'expo-router';
import { supabase } from '@/lib/supabase';
import type { AppNotification } from '@/types';

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

interface UseNotificationsReturn {
  expoPushToken: string | null;
  notifications: AppNotification[];
  unreadCount: number;
  loading: boolean;
  refresh: () => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
}

export function useNotifications(userId: string | null): UseNotificationsReturn {
  const [expoPushToken, setExpoPushToken] = useState<string | null>(null);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const notificationListener = useRef<Notifications.EventSubscription | null>(null);
  const responseListener = useRef<Notifications.EventSubscription | null>(null);
  const router = useRouter();

  // Register for push notifications
  const registerForPushNotifications = useCallback(async () => {
    if (!Device.isDevice) {
      console.log('[Notifications] Not a physical device, skipping push registration');
      return null;
    }

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      console.log('[Notifications] Permission not granted');
      return null;
    }

    // Set up Android notification channel
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'El Stylo',
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#4A3328',
      });
    }

    const projectId = Constants.expoConfig?.extra?.eas?.projectId;
    if (!projectId) {
      console.warn('[Notifications] No projectId found — push tokens unavailable in dev');
      return null;
    }

    try {
      const tokenData = await Notifications.getExpoPushTokenAsync({ projectId });
      return tokenData.data;
    } catch (err) {
      console.warn('[Notifications] Failed to get push token:', err);
      return null;
    }
  }, []);

  // Save device token to Supabase
  const saveDeviceToken = useCallback(async (token: string) => {
    if (!userId) return;

    try {
      // Upsert: update existing or create new
      const { error } = await supabase
        .from('device_tokens')
        .upsert(
          {
            user_id: userId,
            token,
            platform: Platform.OS as 'android' | 'ios',
            is_active: true,
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'user_id,token' },
        );

      if (error) {
        console.warn('[Notifications] Failed to save device token:', error.message);
      }
    } catch (err) {
      console.error('[Notifications] Token save error:', err);
    }
  }, [userId]);

  // Fetch notifications from DB
  const fetchNotifications = useCallback(async () => {
    if (!userId) {
      setNotifications([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(50);

      if (!error && data) {
        setNotifications(data as AppNotification[]);
      }
    } catch (err) {
      console.error('[Notifications] Fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  // Mark single notification as read
  const markAsRead = useCallback(async (id: string) => {
    await supabase
      .from('notifications')
      .update({ read: true })
      .eq('id', id);

    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n)),
    );
  }, []);

  // Mark all notifications as read
  const markAllAsRead = useCallback(async () => {
    if (!userId) return;

    await supabase
      .from('notifications')
      .update({ read: true })
      .eq('user_id', userId)
      .eq('read', false);

    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }, [userId]);

  // Setup push token & listeners
  useEffect(() => {
    if (!userId) return;

    // Register and save token
    registerForPushNotifications().then((token) => {
      if (token) {
        setExpoPushToken(token);
        saveDeviceToken(token);
      }
    });

    // Listen for notifications while app is in foreground
    notificationListener.current = Notifications.addNotificationReceivedListener(
      (_notification) => {
        // Refresh notifications list when a new one arrives
        fetchNotifications();
      },
    );

    // Listen for notification responses (tap on notification)
    responseListener.current = Notifications.addNotificationResponseReceivedListener(
      (response) => {
        const data = response.notification.request.content.data;

        // Deep link based on notification data
        if (data?.appointmentId) {
          router.push(`/(barber)/appointment/${data.appointmentId}`);
        } else if (data?.clientId) {
          router.push(`/(barber)/client/${data.clientId}`);
        }
      },
    );

    // Initial fetch
    fetchNotifications();

    return () => {
      if (notificationListener.current) {
        notificationListener.current.remove();
      }
      if (responseListener.current) {
        responseListener.current.remove();
      }
    };
  }, [userId, registerForPushNotifications, saveDeviceToken, fetchNotifications, router]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  return {
    expoPushToken,
    notifications,
    unreadCount,
    loading,
    refresh: fetchNotifications,
    markAsRead,
    markAllAsRead,
  };
}

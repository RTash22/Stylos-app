import { Tabs } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors, typography, shadows } from '@/theme';
import { MIN_TOUCH_TARGET } from '@/constants';

export default function AdminTabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.tabActive,
        tabBarInactiveTintColor: colors.tabInactive,
        tabBarStyle: {
          backgroundColor: colors.surface, borderTopColor: colors.border,
          borderTopWidth: 1, height: 60, paddingBottom: 6, ...shadows.sm,
        },
        tabBarLabelStyle: { fontFamily: typography.fontFamily.medium, fontSize: typography.sizes.caption },
        tabBarItemStyle: { minHeight: MIN_TOUCH_TARGET },
      }}
    >
      <Tabs.Screen name="index" options={{
        title: 'Dashboard', tabBarIcon: ({ color, size }) => <MaterialCommunityIcons name="view-dashboard-outline" size={size} color={color} />,
      }} />
      <Tabs.Screen name="barbers" options={{
        title: 'Peluqueros', tabBarIcon: ({ color, size }) => <MaterialCommunityIcons name="account-group" size={size} color={color} />,
      }} />
      <Tabs.Screen name="services" options={{
        title: 'Servicios', tabBarIcon: ({ color, size }) => <MaterialCommunityIcons name="content-cut" size={size} color={color} />,
      }} />
      <Tabs.Screen name="strikes" options={{
        title: 'Strikes', tabBarIcon: ({ color, size }) => <MaterialCommunityIcons name="alert-decagram-outline" size={size} color={color} />,
      }} />
      <Tabs.Screen name="proofs" options={{
        title: 'Comprobantes', tabBarIcon: ({ color, size }) => <MaterialCommunityIcons name="file-document-check-outline" size={size} color={color} />,
      }} />
      <Tabs.Screen name="settings" options={{
        title: 'Ajustes', tabBarIcon: ({ color, size }) => <MaterialCommunityIcons name="cog-outline" size={size} color={color} />,
      }} />
    </Tabs>
  );
}

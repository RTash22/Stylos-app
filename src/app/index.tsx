import { Redirect } from 'expo-router';
import { useAuth } from '@/providers';

export default function Index() {
  const { session, role, loading } = useAuth();

  if (loading) return null;

  if (!session) return <Redirect href="/(auth)/login" />;
  if (role === 'admin') return <Redirect href="/(admin)/(tabs)" />;
  return <Redirect href="/(barber)/(tabs)" />;
}

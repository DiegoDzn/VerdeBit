import { Stack, useRouter, useSegments } from 'expo-router';
import { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';
import 'react-native-reanimated';

import { AuthProvider, useAuth } from '@/lib/auth/AuthContext';

const RUTAS_PUBLICAS = ['login', 'nuevaContrasena'];

function AuthGate() {
  const { session, loading, role } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    const ruta = segments[0] as string | undefined;
    const enRutaPublica = !ruta || RUTAS_PUBLICAS.includes(ruta);

    if (!session) {
      if (!enRutaPublica) router.replace('/login');
    } else if (enRutaPublica) {
      router.replace(role === 'admin' ? '/admin' : '/(tabs)');
    } else if (role === 'admin' && ruta !== 'admin') {
      router.replace('/admin');
    } else if (role !== 'admin' && ruta === 'admin') {
      router.replace('/(tabs)');
    }
  }, [session, loading, role, segments, router]);

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#355343" />
      </View>
    );
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="login" />
      <Stack.Screen name="nuevaContrasena" />
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="admin" />
      <Stack.Screen name="professor" />
      <Stack.Screen name="quiz" />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <AuthGate />
    </AuthProvider>
  );
}

const styles = {
  loader: {
    flex: 1,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    backgroundColor: '#fbf4e6',
  },
};

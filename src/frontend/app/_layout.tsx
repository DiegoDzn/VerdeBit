import { Stack, useRouter, useSegments } from 'expo-router';
import { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';
import 'react-native-reanimated';

import { AuthProvider, useAuth } from '@/lib/auth/AuthContext';

export const unstable_settings = {
  anchor: '(tabs)',
};

const RUTAS_PUBLICAS = ['login', 'loginProfesor', 'nuevaContrasena'];

function AuthGate() {
  const { session, loading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    const ruta = segments[0] as string | undefined;
    const enRutaPublica = !ruta || RUTAS_PUBLICAS.includes(ruta);

    if (!session && !enRutaPublica) {
      router.replace('/');
    } else if (session && enRutaPublica) {
      router.replace('/(tabs)');
    }
  }, [session, loading, segments, router]);

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
      <Stack.Screen name="loginProfesor" />
      <Stack.Screen name="nuevaContrasena" />
      <Stack.Screen name="(tabs)" />
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

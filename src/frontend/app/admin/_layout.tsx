import { Stack, useRouter } from 'expo-router';
import React, { useEffect } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { useAuth } from '@/lib/auth/AuthContext';

export default function AdminLayout() {
  const router = useRouter();
  const { loading, role } = useAuth();

  useEffect(() => {
    if (!loading && role !== 'admin') {
      router.replace('/(tabs)');
    }
  }, [loading, role, router]);

  if (loading || role !== 'admin') {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#355343" />
      </View>
    );
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="usuarios" />
      <Stack.Screen name="usuario/[id]" />
      <Stack.Screen name="cursos" />
      <Stack.Screen name="curso/[id]" />
      <Stack.Screen name="gamificacion" />
      <Stack.Screen name="eventos" />
    </Stack>
  );
}

const styles = StyleSheet.create({
  loader: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F9F6EE',
  },
});

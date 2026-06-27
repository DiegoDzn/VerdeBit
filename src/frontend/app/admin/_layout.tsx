import { Stack } from 'expo-router';
import React from 'react';

export default function AdminLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="usuarios" />
      <Stack.Screen name="usuario/[id]" />
      <Stack.Screen name="cursos" />
      <Stack.Screen name="curso/[id]" />
      <Stack.Screen name="gamificacion" />
    </Stack>
  );
}

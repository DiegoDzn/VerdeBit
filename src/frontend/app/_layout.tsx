import { Stack } from 'expo-router';
import 'react-native-reanimated';

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="login" />
      <Stack.Screen name="loginProfesor" /> 
      <Stack.Screen name="nuevaContraseña" />
      <Stack.Screen name="(tabs)" />
    </Stack>
  );
}
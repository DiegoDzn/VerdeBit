import { Stack, useRouter } from 'expo-router';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { palette, radius, spacing } from '@/constants/design';

export default function CreateResourceScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: 'Publicar recurso', headerBackTitle: 'Inicio' }} />
      <Text style={styles.title}>Publicar recurso educativo</Text>
      <Text style={styles.sub}>Próximamente podrás publicar PDFs, videos y enlaces.</Text>
      <TouchableOpacity style={styles.button} onPress={() => router.back()}>
        <Text style={styles.buttonText}>Volver</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: palette.bg,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xxl,
    gap: spacing.lg,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: palette.ink,
    textAlign: 'center',
  },
  sub: {
    fontSize: 15,
    color: palette.sub,
    textAlign: 'center',
  },
  button: {
    backgroundColor: palette.primary,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xxl,
    borderRadius: radius.md,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '700',
  },
});

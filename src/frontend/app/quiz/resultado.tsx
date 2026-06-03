import { Ionicons } from '@expo/vector-icons';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { palette, radius, spacing } from '@/constants/design';

export default function QuizResultScreen() {
  const router = useRouter();
  const { aciertos, total, puntos } = useLocalSearchParams<{
    aciertos: string;
    total: string;
    puntos: string;
  }>();

  const correctas = Number(aciertos ?? 0);
  const totales = Number(total ?? 0);
  const puntosGanados = Number(puntos ?? 0);
  const aprobado = totales > 0 && correctas / totales >= 0.6;

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />

      <View style={[styles.medal, { backgroundColor: aprobado ? palette.accent : palette.sub }]}>
        <Ionicons name={aprobado ? 'trophy' : 'ribbon'} size={56} color="#fff" />
      </View>

      <Text style={styles.title}>{aprobado ? '¡Muy bien!' : '¡Sigue practicando!'}</Text>
      <Text style={styles.score}>
        {correctas} de {totales} correctas
      </Text>

      <View style={styles.pointsCard}>
        <Ionicons name="star" size={20} color={palette.accent} />
        <Text style={styles.pointsText}>+{puntosGanados} puntos ganados</Text>
      </View>

      <TouchableOpacity style={styles.button} onPress={() => router.replace('/quizzes')}>
        <Text style={styles.buttonText}>Volver a los quizzes</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => router.replace('/(tabs)')}>
        <Text style={styles.link}>Ir al inicio</Text>
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
  medal: {
    width: 110,
    height: 110,
    borderRadius: 55,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: palette.ink,
  },
  score: {
    fontSize: 18,
    color: palette.sub,
  },
  pointsCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: palette.card,
    borderWidth: 1,
    borderColor: palette.line,
    borderRadius: radius.lg,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    marginVertical: spacing.sm,
  },
  pointsText: {
    fontSize: 16,
    fontWeight: '700',
    color: palette.ink,
  },
  button: {
    backgroundColor: palette.primary,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.xxxl,
    borderRadius: radius.md,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 16,
  },
  link: {
    color: palette.primary,
    fontWeight: '700',
    fontSize: 15,
    marginTop: spacing.xs,
  },
});

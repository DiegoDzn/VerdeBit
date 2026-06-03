import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { palette, radius, spacing } from '@/constants/design';
import { useAuth } from '@/lib/auth/AuthContext';
import { listPublishedQuizzes } from '@/lib/quizzes/api';
import type { Quiz } from '@/lib/types';

export default function QuizzesTab() {
  const { role } = useAuth();

  if (role === 'teacher') {
    return <CursosPlaceholder />;
  }

  return <QuizListForStudent />;
}

function QuizListForStudent() {
  const router = useRouter();
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const cargar = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setQuizzes(await listPublishedQuizzes());
    } catch {
      setError('No pudimos cargar los quizzes. Revisa tu conexión.');
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      cargar();
    }, [cargar]),
  );

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={palette.primary} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Ionicons name="cloud-offline-outline" size={48} color={palette.sub} />
        <Text style={styles.stateText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={cargar}>
          <Text style={styles.retryText}>Reintentar</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (quizzes.length === 0) {
    return (
      <View style={styles.centered}>
        <Ionicons name="help-circle-outline" size={48} color={palette.sub} />
        <Text style={styles.stateText}>Aún no hay quizzes disponibles.</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.list}>
      <Text style={styles.heading}>Pon a prueba lo que sabes</Text>
      {quizzes.map((quiz) => (
        <View key={quiz.id} style={styles.card}>
          {quiz.topic ? <Text style={styles.topic}>{quiz.topic.toUpperCase()}</Text> : null}
          <Text style={styles.title}>{quiz.title}</Text>
          {quiz.description ? <Text style={styles.description}>{quiz.description}</Text> : null}
          <View style={styles.cardFooter}>
            <View style={styles.points}>
              <Ionicons name="star" size={16} color={palette.accent} />
              <Text style={styles.pointsText}>{quiz.points_reward} pts</Text>
            </View>
            <TouchableOpacity
              style={styles.playButton}
              onPress={() => router.push(`/quiz/${quiz.id}`)}
            >
              <Text style={styles.playText}>Jugar →</Text>
            </TouchableOpacity>
          </View>
        </View>
      ))}
    </ScrollView>
  );
}

function CursosPlaceholder() {
  return (
    <View style={styles.centered}>
      <Ionicons name="stats-chart-outline" size={48} color={palette.sub} />
      <Text style={styles.heading}>Cursos</Text>
      <Text style={styles.stateText}>
        Aquí podrás monitorear el avance de tus estudiantes y gestionar tus quizzes. Próximamente.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: palette.bg,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: palette.bg,
    padding: spacing.xxl,
    gap: spacing.md,
  },
  stateText: {
    color: palette.sub,
    fontSize: 16,
    textAlign: 'center',
  },
  retryButton: {
    marginTop: spacing.sm,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xxl,
    borderRadius: radius.md,
    backgroundColor: palette.primary,
  },
  retryText: {
    color: '#fff',
    fontWeight: '700',
  },
  list: {
    padding: spacing.xl,
    gap: spacing.lg,
  },
  heading: {
    fontSize: 22,
    fontWeight: '800',
    color: palette.ink,
    marginBottom: spacing.xs,
  },
  card: {
    backgroundColor: palette.card,
    borderRadius: radius.xl,
    padding: spacing.xl,
    borderWidth: 1,
    borderColor: palette.line,
  },
  topic: {
    fontSize: 11,
    fontWeight: '800',
    color: palette.secondary,
    letterSpacing: 1,
    marginBottom: spacing.xs,
  },
  title: {
    fontSize: 19,
    fontWeight: '800',
    color: palette.ink,
  },
  description: {
    fontSize: 14,
    color: palette.sub,
    marginTop: spacing.xs,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.lg,
  },
  points: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  pointsText: {
    fontSize: 14,
    fontWeight: '700',
    color: palette.ink,
  },
  playButton: {
    backgroundColor: palette.primary,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xxl,
    borderRadius: radius.md,
  },
  playText: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 15,
  },
});

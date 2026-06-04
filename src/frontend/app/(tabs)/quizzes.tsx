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
import { getMyQuizzes, getQuizStats, updateQuiz } from '@/lib/professor/api';
import type { QuizWithStats } from '@/lib/types';
import type { Quiz } from '@/lib/types';

export default function QuizzesTab() {
  const { role } = useAuth();

  if (role === 'teacher') {
    return <CursosList />;
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

function CursosList() {
  const { session } = useAuth();
  const router = useRouter();
  const [quizzes, setQuizzes] = useState<QuizWithStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const cargar = useCallback(async () => {
    if (!session?.user) return;
    setLoading(true);
    setError(null);
    try {
      const mis = await getMyQuizzes(session.user.id);
      const conStats = await Promise.all(
        mis.map(async (q: Quiz) => {
          const s = await getQuizStats(q.id);
          return {
            ...q,
            completed_count: s.completed,
            total_count: s.total,
            average_score: s.average,
            percent: s.total > 0 ? Math.round((s.completed / s.total) * 100) : 0,
          } as QuizWithStats;
        }),
      );
      setQuizzes(conStats);
    } catch {
      setError('No pudimos cargar tus quizzes.');
    } finally {
      setLoading(false);
    }
  }, [session?.user]);

  useFocusEffect(useCallback(() => { cargar(); }, [cargar]));

  const togglePublish = async (quiz: QuizWithStats) => {
    try {
      await updateQuiz(quiz.id, { is_published: !quiz.is_published });
      cargar();
    } catch {}
  };

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

  return (
    <View style={{ flex: 1 }}>
      <ScrollView style={styles.screen} contentContainerStyle={styles.list}>
        <Text style={styles.heading}>Mis quizzes</Text>
        {quizzes.length === 0 ? (
          <View style={styles.emptyBox}>
            <Ionicons name="help-circle-outline" size={40} color={palette.sub} />
            <Text style={styles.stateText}>No tienes quizzes creados aún.</Text>
          </View>
        ) : (
          quizzes.map((quiz) => (
            <View key={quiz.id} style={styles.card}>
              <View style={styles.cardHeader}>
                <View style={{ flex: 1 }}>
                  {!quiz.is_published && (
                    <Text style={styles.draftBadge}>BORRADOR</Text>
                  )}
                  <Text style={styles.title}>{quiz.title}</Text>
                  {quiz.topic ? <Text style={styles.topic}>{quiz.topic.toUpperCase()}</Text> : null}
                </View>
                <TouchableOpacity
                  style={[styles.publishToggle, quiz.is_published && styles.publishToggleOn]}
                  onPress={() => togglePublish(quiz)}
                >
                  <Text style={styles.publishToggleText}>
                    {quiz.is_published ? 'Publicado' : 'Publicar'}
                  </Text>
                </TouchableOpacity>
              </View>
              <View style={styles.statsRow}>
                <Text style={styles.statItem}>
                  {quiz.completed_count} completados
                </Text>
                <Text style={styles.statItem}>
                  Promedio: {quiz.average_score > 0 ? quiz.average_score.toFixed(1) : 'N/A'}
                </Text>
                <Text style={styles.statItem}>{quiz.points_reward} pts</Text>
              </View>
              <TouchableOpacity
                style={styles.editButton}
                onPress={() => router.push(`/professor/quiz/${quiz.id}`)}
              >
                <Ionicons name="create-outline" size={16} color={palette.primary} />
                <Text style={styles.editText}>Editar quiz</Text>
              </TouchableOpacity>
            </View>
          ))
        )}
      </ScrollView>

      <TouchableOpacity
        style={styles.fab}
        onPress={() => router.push('/professor/quiz/create')}
      >
        <Ionicons name="add" size={28} color="#fff" />
      </TouchableOpacity>
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
  emptyBox: {
    alignItems: 'center',
    paddingVertical: spacing.xxxl,
    gap: spacing.md,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  draftBadge: {
    fontSize: 10,
    fontWeight: '800',
    color: palette.secondary,
    letterSpacing: 1,
    marginBottom: 2,
  },
  publishToggle: {
    paddingVertical: 6,
    paddingHorizontal: spacing.md,
    borderRadius: radius.sm,
    borderWidth: 1.5,
    borderColor: palette.line,
  },
  publishToggleOn: {
    backgroundColor: palette.primary,
    borderColor: palette.primary,
  },
  publishToggleText: {
    fontSize: 12,
    fontWeight: '700',
    color: palette.primary,
  },
  statsRow: {
    flexDirection: 'row',
    gap: spacing.md,
    flexWrap: 'wrap',
    marginBottom: spacing.md,
  },
  statItem: {
    fontSize: 12,
    color: palette.sub,
    fontWeight: '600',
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-start',
    paddingVertical: 6,
    paddingHorizontal: spacing.md,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: palette.line,
  },
  editText: {
    fontSize: 13,
    fontWeight: '700',
    color: palette.primary,
  },
  fab: {
    position: 'absolute',
    bottom: spacing.xxl,
    right: spacing.xxl,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: palette.secondary,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
});

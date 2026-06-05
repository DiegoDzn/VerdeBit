import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useAuth } from '@/lib/auth/AuthContext';
import { getMyQuizzes, getQuizStats } from '@/lib/professor/api';
import { listPublishedQuizzes } from '@/lib/quizzes/api';
import type { Quiz } from '@/lib/types';

const COLORES_QUIZ = ['#355343', '#75875c', '#dfae4b', '#c46d46'];

type CursoProfesor = Quiz & { completados: number; promedio: number };

export default function AulaVerdeScreen() {
  const { role } = useAuth();
  if (role === 'teacher') {
    return <VistaProfesor />;
  }
  return <VistaEstudiante />;
}

function VistaEstudiante() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let activo = true;
    listPublishedQuizzes()
      .then((data) => {
        if (activo) setQuizzes(data);
      })
      .catch((e) => {
        if (activo) setError(e instanceof Error ? e.message : 'No se pudieron cargar los quizzes.');
      })
      .finally(() => {
        if (activo) setCargando(false);
      });
    return () => {
      activo = false;
    };
  }, []);

  return (
    <View style={[styles.container, { paddingTop: insets.top + 15 }]}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.headerSection}>
          <Text style={styles.mainTitle}>Quizzes</Text>
          <Text style={styles.subtitle}>Juega y gana medallas del humedal</Text>
        </View>

        {cargando ? (
          <View style={styles.estadoVacio}>
            <ActivityIndicator size="large" color="#355343" />
          </View>
        ) : error ? (
          <View style={styles.estadoVacio}>
            <Text style={styles.estadoTexto}>{error}</Text>
          </View>
        ) : quizzes.length === 0 ? (
          <View style={styles.estadoVacio}>
            <Text style={styles.estadoTexto}>Aún no hay quizzes publicados.</Text>
          </View>
        ) : (
          <View style={styles.cardsContainer}>
            {quizzes.map((quiz, index) => (
              <View key={quiz.id} style={[styles.studentCard, { backgroundColor: COLORES_QUIZ[index % COLORES_QUIZ.length] }]}>
                <Text style={styles.studentCardLabel}>+{quiz.points_reward} PTS</Text>
                <Text style={styles.studentCardTitle}>{quiz.title}</Text>
                {quiz.description ? <Text style={styles.studentCardDesc}>{quiz.description}</Text> : null}

                <TouchableOpacity
                  style={styles.playButton}
                  onPress={() => router.push({ pathname: '/quiz/[id]', params: { id: quiz.id } })}
                >
                  <Ionicons name="play" size={12} color="#242424" style={{ marginRight: 4 }} />
                  <Text style={styles.playButtonText}>Jugar</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

function VistaProfesor() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { session } = useAuth();
  const userId = session?.user.id;

  const [cursos, setCursos] = useState<CursoProfesor[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) return;
    let activo = true;
    setCargando(true);
    getMyQuizzes(userId)
      .then(async (quizzes) => {
        const conStats = await Promise.all(
          quizzes.map(async (q) => {
            const stats = await getQuizStats(q.id);
            return { ...q, completados: stats.completed, promedio: stats.average };
          }),
        );
        if (activo) setCursos(conStats);
      })
      .catch((e) => {
        if (activo) setError(e instanceof Error ? e.message : 'No se pudieron cargar tus cursos.');
      })
      .finally(() => {
        if (activo) setCargando(false);
      });
    return () => {
      activo = false;
    };
  }, [userId]);

  return (
    <View style={[styles.container, { paddingTop: insets.top + 15 }]}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.headerSection}>
          <Text style={styles.mainTitle}>Mis cursos</Text>
          <Text style={styles.subtitle}>Quizzes asignados y progreso</Text>
        </View>

        {cargando ? (
          <View style={styles.estadoVacio}>
            <ActivityIndicator size="large" color="#355343" />
          </View>
        ) : error ? (
          <View style={styles.estadoVacio}>
            <Text style={styles.estadoTexto}>{error}</Text>
          </View>
        ) : cursos.length === 0 ? (
          <View style={styles.estadoVacio}>
            <Text style={styles.estadoTexto}>Aún no has creado quizzes.</Text>
          </View>
        ) : (
          <View style={styles.cardsContainer}>
            {cursos.map((curso, index) => {
              const borrador = !curso.is_published;
              return (
                <TouchableOpacity
                  key={curso.id}
                  style={[styles.teacherCard, { borderColor: COLORES_QUIZ[index % COLORES_QUIZ.length] }]}
                  onPress={() => router.push({ pathname: '/professor/quiz/[id]', params: { id: curso.id } })}
                >
                  <View style={styles.teacherCardHeader}>
                    <View style={styles.iconCircleBg}>
                      <Ionicons name="help-circle-outline" size={20} color="#5c6e58" />
                    </View>

                    <View style={{ flex: 1, marginLeft: 12 }}>
                      <Text style={[styles.teacherCardTag, { color: borrador ? '#dfae4b' : '#355343' }]}>
                        {borrador ? 'BORRADOR' : 'PUBLICADO'}
                      </Text>
                      <Text style={styles.teacherCardTitle}>{curso.title}</Text>
                    </View>
                  </View>

                  {borrador ? (
                    <Text style={styles.teacherCardDesc}>
                      Aún no publicado. Termina las preguntas para publicarlo.
                    </Text>
                  ) : (
                    <View style={styles.progressSection}>
                      <View style={styles.metaRow}>
                        <Text style={styles.metaLeft}>{curso.completados} completados</Text>
                        <Text style={styles.metaRight}>
                          Promedio <Text style={{ fontWeight: 'bold' }}>{curso.promedio.toFixed(1)}</Text>
                        </Text>
                      </View>
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        )}
      </ScrollView>

      <TouchableOpacity
        style={[styles.fabButton, { bottom: insets.bottom + 20 }]}
        onPress={() => router.push('/professor/quiz/create')}
      >
        <Ionicons name="add" size={24} color="#ffffff" />
        <Text style={styles.fabText}>Crear quiz</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fbf4e6',
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 120,
  },
  headerSection: {
    marginBottom: 20,
  },
  mainTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#242424',
  },
  subtitle: {
    fontSize: 15,
    color: '#7e7568',
    marginTop: 2,
  },
  cardsContainer: {
    gap: 16,
    marginTop: 10,
  },
  estadoVacio: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 60,
  },
  estadoTexto: {
    fontSize: 15,
    color: '#7e7568',
    textAlign: 'center',
  },
  studentCard: {
    borderRadius: 24,
    padding: 20,
    minHeight: 130,
    justifyContent: 'center',
  },
  studentCardLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#ffffff',
    opacity: 0.7,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  studentCardTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#ffffff',
    marginTop: 2,
  },
  studentCardDesc: {
    fontSize: 13,
    color: '#ffffff',
    opacity: 0.85,
    marginTop: 6,
    lineHeight: 18,
  },
  playButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    alignSelf: 'flex-start',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 12,
    marginTop: 14,
  },
  playButtonText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#242424',
  },
  teacherCard: {
    backgroundColor: '#ffffff',
    borderRadius: 24,
    padding: 16,
    borderLeftWidth: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.02,
    shadowRadius: 8,
    elevation: 2,
  },
  teacherCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconCircleBg: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: '#e9e6dd',
    justifyContent: 'center',
    alignItems: 'center',
  },
  teacherCardTag: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  teacherCardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#242424',
    marginTop: 1,
  },
  teacherCardDesc: {
    fontSize: 13,
    color: '#7e7568',
    marginTop: 12,
    lineHeight: 18,
    paddingLeft: 4,
  },
  progressSection: {
    marginTop: 16,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  metaLeft: {
    fontSize: 12,
    fontWeight: '700',
    color: '#242424',
  },
  metaRight: {
    fontSize: 12,
    color: '#242424',
  },
  fabButton: {
    position: 'absolute',
    right: 24,
    backgroundColor: '#355343',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 6,
  },
  fabText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 15,
    marginLeft: 6,
  },
});

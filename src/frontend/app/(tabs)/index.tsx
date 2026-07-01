import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useAuth } from '@/lib/auth/AuthContext';
import { listUpcomingEvents } from '@/lib/calendario/api';
import { listDidYouKnow, listMapucheContent } from '@/lib/contenido/api';
import { levelFromPoints } from '@/lib/gamificacion/api';
import { getTeacherDashboardStats } from '@/lib/professor/api';
import { listPublishedQuizzes } from '@/lib/quizzes/api';
import type { DidYouKnow, Event, MapucheContent, Quiz } from '@/lib/types';

function formatearEvento(iso: string): string {
  const fecha = new Date(iso);
  return fecha.toLocaleDateString('es-CL', {
    weekday: 'short',
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function InicioScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { profile, role } = useAuth();
  const esProfesor = role === 'teacher';
  const nombre = profile?.full_name?.trim() || (esProfesor ? 'Docente' : 'Exploradora');
  const primerNombre = nombre.split(' ')[0];

  const [proximoEvento, setProximoEvento] = useState<Event | null>(null);
  const [puntos, setPuntos] = useState(0);
  const [nivel, setNivel] = useState(0);
  const [statsProfesor, setStatsProfesor] = useState<{ estudiantes: number; recursos: number; cursos: number } | null>(null);
  const [quizDestacado, setQuizDestacado] = useState<Quiz | null>(null);
  const [datoDelDia, setDatoDelDia] = useState<DidYouKnow | null>(null);
  const [contenidoMapuche, setContenidoMapuche] = useState<MapucheContent | null>(null);

  useEffect(() => {
    let activo = true;

    const cargarTodo = async () => {
      const [, eventos, didYouKnow, mapuche, quizzes] = await Promise.all([
        esProfesor
          ? getTeacherDashboardStats(profile!.id).then((s) => {
              if (activo) setStatsProfesor(s);
            })
          : Promise.resolve(),
        listUpcomingEvents().then((e) => {
          if (activo) setProximoEvento(e[0] ?? null);
        }),
        listDidYouKnow().then((d) => {
          if (activo) setDatoDelDia(d[0] ?? null);
        }),
        listMapucheContent().then((c) => {
          if (activo) setContenidoMapuche(c[0] ?? null);
        }),
        listPublishedQuizzes().then((q) => {
          if (activo) setQuizDestacado(q[0] ?? null);
        }),
      ]);
    };

    if (!esProfesor && profile?.total_points !== undefined) {
      setPuntos(profile.total_points);
      setNivel(levelFromPoints(profile.total_points));
    }

    cargarTodo().catch(() => {});

    return () => {
      activo = false;
    };
  }, []);

  const progreso = nivel > 0 ? (puntos % 100) : puntos;
  const progresoPorcentaje = Math.min((progreso / 100) * 100, 100);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        bounces={false}
      >
        {/* --- HEADER VERDE SUPERIOR --- */}
        <View style={[styles.greenHeader, { paddingTop: insets.top + 15 }]}>
          <View style={styles.userInfoRow}>
            {/* Avatar Círculo Amarillo */}
            <View style={styles.avatarCircle}>
              <Text style={styles.avatarText}>{primerNombre.charAt(0).toUpperCase()}</Text>
            </View>
            <View>
              <Text style={styles.greetingText}>
                {esProfesor ? '¡Hola, docente!' : '¡Hola, exploradora!'}
              </Text>
              <Text style={styles.userNameText}>
                {esProfesor ? `Prof. ${primerNombre}` : primerNombre}
              </Text>
            </View>
          </View>

          <Text style={styles.mainQuestion}>
            {esProfesor 
              ? '¿Qué actividades coordinarás hoy?' 
              : '¿Qué descubres hoy en el humedal?'}
          </Text>
        </View>

        {/* --- CONTENIDO INFERIOR CON TARJETAS --- */}
        <View style={styles.whiteSection}>
          
          {/* Tarjeta de Nivel / Estado */}
          <View style={styles.cardLevel}>
            <View style={styles.starCircle}>
              <Text style={styles.starIcon}>⭐</Text>
            </View>
            <View style={styles.levelProgressContainer}>
              <Text style={styles.levelTitle}>
                {esProfesor
                  ? `ESTADO DEL CURSO · ${statsProfesor?.estudiantes ?? 0} estudiantes`
                  : `NIVEL ${nivel} · ${puntos} puntos`}
              </Text>
              <View style={styles.progressBarBg}>
                <View style={[styles.progressBarFill, { width: `${esProfesor ? 100 : progresoPorcentaje}%` }]} />
              </View>
              <Text style={styles.progressText}>
                {esProfesor
                  ? `${statsProfesor?.estudiantes ?? 0} Alumnos · ${statsProfesor?.cursos ?? 0} Cursos`
                  : `${puntos % 100} / 100 pts al siguiente nivel`}
              </Text>
            </View>
          </View>

          {/* Tarjeta Quiz Rápido */}
          {quizDestacado && (
            <View style={styles.cardQuiz}>
              <Text style={styles.quizLabel}>QUIZ RÁPIDO</Text>
              <Text style={styles.quizTitle}>{quizDestacado.title}</Text>
              <View style={styles.quizFooter}>
                <View style={styles.quizBadge}>
                  <Text style={styles.quizBadgeText}>{quizDestacado.description ?? 'Desafío rápido'}</Text>
                </View>
                <Text style={styles.quizPoints}>⭐ +{quizDestacado.points_reward} pts</Text>
                <TouchableOpacity style={styles.playButton} onPress={() => router.push('/(tabs)/aulaverde')}>
                  <Text style={styles.playButtonText}>Jugar →</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* Sección ¿Sabías que...? */}
          <Text style={styles.sectionTitle}>¿Sabías que...?</Text>
          <Text style={styles.sectionSubtitle}>Un dato nuevo cada día</Text>

          {/* Tarjeta del Dato del Día */}
          {datoDelDia && (
            <View style={styles.cardData}>
              <Text style={styles.dataLabel}>DATO DEL DÍA</Text>
              <Text style={styles.dataText}>{datoDelDia.content}</Text>
              <TouchableOpacity onPress={() => router.push('/(tabs)/sabiasque')}>
                <Text style={styles.viewMore}>Ver más datos ›</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* --- NUEVA SECCIÓN: CULTURA MAPUCHE --- */}
          <Text style={styles.sectionTitle}>Cultura Mapuche</Text>
          <Text style={styles.sectionSubtitle}>Sabiduría ancestral del territorio</Text>

          {contenidoMapuche && (
            <View style={styles.cardMapuche}>
              <Text style={styles.mapucheLabel}>KIMÜN (CONOCIMIENTO)</Text>
              <Text style={styles.mapucheText}>{contenidoMapuche.content}</Text>
              <TouchableOpacity onPress={() => router.push('/(tabs)/culturamapuche')}>
                <Text style={styles.viewMoreMapuche}>Aprender más ›</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Próximo Evento */}
          <View style={styles.eventHeaderRow}>
            <Text style={styles.sectionTitle}>Próximo evento</Text>
            <TouchableOpacity onPress={() => router.push('/(tabs)/eventos')}>
              <Text style={styles.viewAllEvents}>Ver todos →</Text>
            </TouchableOpacity>
          </View>
          
          <Text style={[styles.sectionSubtitle, { marginBottom: 20 }]}>Calendario del humedal</Text>

          <TouchableOpacity style={styles.cardEvent} activeOpacity={0.75} onPress={() => router.push('/(tabs)/eventos')}>
            <View style={styles.eventIcon}>
              <Text style={styles.eventIconText}>📅</Text>
            </View>
            <View style={styles.eventInfo}>
              <Text style={styles.eventLabel}>
                {proximoEvento ? formatearEvento(proximoEvento.starts_at).toUpperCase() : 'SIN EVENTOS PROGRAMADOS'}
              </Text>
              <Text style={styles.eventTitle} numberOfLines={1}>
                {proximoEvento?.title ?? 'Aún no hay actividades próximas'}
              </Text>
              <Text style={styles.eventText} numberOfLines={2}>
                {proximoEvento?.location || proximoEvento?.description || 'Cuando administración publique un evento aparecerá aquí.'}
              </Text>
            </View>
          </TouchableOpacity>

        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fbf4e6', 
  },
  scrollContent: {
    paddingBottom: 100,
  },
  greenHeader: {
    backgroundColor: '#355343', 
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    paddingHorizontal: 24,
    paddingBottom: 30,
  },
  userInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    gap: 12,
  },
  avatarCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#ebdcc5', 
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#242424',
  },
  greetingText: {
    fontSize: 14,
    color: '#ebdcc5',
    opacity: 0.9,
  },
  userNameText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  mainQuestion: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#ffffff',
    lineHeight: 32,
    maxWidth: '85%',
  },
  whiteSection: {
    paddingHorizontal: 24,
    marginTop: -15, 
  },
  cardLevel: {
    backgroundColor: '#ffffff',
    borderRadius: 24,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 2,
    marginBottom: 16,
  },
  starCircle: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    backgroundColor: '#ebdcc5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  starIcon: {
    fontSize: 20,
  },
  levelProgressContainer: {
    flex: 1,
  },
  levelTitle: {
    fontSize: 10,
    fontWeight: '800',
    color: '#7e7568',
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  progressBarBg: {
    height: 8,
    backgroundColor: '#f2f0eb',
    borderRadius: 4,
    width: '100%',
    marginBottom: 6,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#355343',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#355343',
  },
  cardQuiz: {
    backgroundColor: '#c46d46', 
    borderRadius: 24,
    padding: 20,
    marginBottom: 25,
  },
  quizLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#ffffff',
    opacity: 0.8,
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  quizTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 16,
  },
  quizFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  quizBadge: {
    backgroundColor: '#a35733',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    maxWidth: '40%',
  },
  quizBadgeText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '700',
  },
  quizPoints: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '600',
  },
  playButton: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 14,
  },
  playButtonText: {
    color: '#c46d46',
    fontWeight: 'bold',
    fontSize: 13,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#242424',
    marginTop: 10,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#7e7568',
    marginTop: 2,
  },
  cardData: {
    backgroundColor: '#dfae4b', 
    borderRadius: 24,
    padding: 20,
    marginTop: 12,
    marginBottom: 25,
  },
  dataLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#242424',
    opacity: 0.6,
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  dataText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#242424',
    lineHeight: 22,
    marginBottom: 12,
  },
  viewMore: {
    fontSize: 13,
    fontWeight: '700',
    color: '#242424',
  },
  cardMapuche: {
    backgroundColor: '#8C4F2B',
    borderRadius: 24,
    padding: 20,
    marginTop: 12,
    marginBottom: 25,
  },
  mapucheLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#ffffff',
    opacity: 0.7,
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  mapucheText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#ffffff',
    lineHeight: 22,
    marginBottom: 12,
  },
  viewMoreMapuche: {
    fontSize: 13,
    fontWeight: '700',
    color: '#ebdcc5', 
  },
  eventHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  viewAllEvents: {
    fontSize: 14,
    fontWeight: '700',
    color: '#355343',
  },
  cardEvent: {
    backgroundColor: '#ffffff',
    borderRadius: 24,
    padding: 16,
    flexDirection: 'row',
    gap: 14,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 2,
  },
  eventIcon: {
    width: 48,
    height: 48,
    borderRadius: 18,
    backgroundColor: '#EBF0EC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  eventIconText: {
    fontSize: 22,
  },
  eventInfo: {
    flex: 1,
  },
  eventLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#355343',
    letterSpacing: 0.5,
    marginBottom: 3,
  },
  eventTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#242424',
  },
  eventText: {
    fontSize: 12,
    color: '#7e7568',
    lineHeight: 17,
    marginTop: 3,
  },
});

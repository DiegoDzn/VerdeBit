import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
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
import { getMyQuizzes, getQuizStats } from '@/lib/professor/api';
import type { ProfessorStats } from '@/lib/types';

export default function InicioScreen() {
  const { role } = useAuth();
  return role === 'teacher' ? <HomeTeacher /> : <HomeStudent />;
}

function HomeTeacher() {
  const { profile, session, signOut } = useAuth();
  const router = useRouter();
  const nombre = profile?.full_name ?? 'Profesor/a';
  const [stats, setStats] = useState<ProfessorStats | null>(null);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      let active = true;
      (async () => {
        if (!session?.user) return;
        setLoading(true);
        try {
          const quizzes = await getMyQuizzes(session.user.id);
          let completados = 0;
          await Promise.all(
            quizzes.map(async (q) => {
              const s = await getQuizStats(q.id);
              completados += s.completed;
            }),
          );
          if (!active) return;
          setStats({
            estudiantes_totales: 0,
            recursos: 0,
            quizzes_completados: completados,
            por_revisar: quizzes.filter((q) => !q.is_published).length,
          });
        } catch {
          if (active) setStats({ estudiantes_totales: 0, recursos: 0, quizzes_completados: 0, por_revisar: 0 });
        } finally {
          if (active) setLoading(false);
        }
      })();
      return () => { active = false; };
    }, [session?.user]),
  );

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <View style={styles.heroTeacher}>
        <Text style={styles.roleTag}>MODO PROFESOR/A</Text>
        <Text style={styles.heroName}>Hola, {nombre}</Text>
        <Text style={styles.heroSub}>Panel de gestión</Text>
      </View>

      {loading ? (
        <ActivityIndicator color={palette.primary} style={{ marginVertical: spacing.xl }} />
      ) : (
        <View style={styles.statsGrid}>
          <StatCard label="Estudiantes" value={stats?.estudiantes_totales ?? 0} icon="people" />
          <StatCard label="Recursos" value={stats?.recursos ?? 0} icon="documents" />
          <StatCard label="Completados" value={stats?.quizzes_completados ?? 0} icon="checkmark-circle" />
          <StatCard label="Borradores" value={stats?.por_revisar ?? 0} icon="create" />
        </View>
      )}

      <TouchableOpacity
        style={styles.ctaSecondary}
        onPress={() => router.push('/professor/resource/create')}
      >
        <Ionicons name="add-circle" size={22} color="#fff" />
        <Text style={styles.ctaText}>Publicar un recurso</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.logoutButton} onPress={signOut}>
        <Text style={styles.logoutText}>Cerrar sesión</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

function StatCard({ label, value, icon }: { label: string; value: number; icon: string }) {
  return (
    <View style={styles.statCard}>
      <Ionicons name={icon as any} size={24} color={palette.primary} />
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function HomeStudent() {
  const { profile, signOut } = useAuth();
  const router = useRouter();
  const nombre = profile?.full_name ?? 'explorador/a';

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <View style={styles.welcomeContainer}>
        <Text style={styles.greetingText}>¡Hola, {nombre}!</Text>
        <Text style={styles.subTitleText}>Escuela Monteverde</Text>
        <Text style={styles.questionText}>¿Qué descubres hoy en el humedal?</Text>
      </View>

      <TouchableOpacity style={styles.quizCta} onPress={() => router.push('/quizzes')}>
        <Text style={styles.quizCtaTitle}>Quiz rápido</Text>
        <Text style={styles.quizCtaText}>Pon a prueba lo que sabes del humedal →</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.logoutButton} onPress={signOut}>
        <Text style={styles.logoutText}>Cerrar sesión</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  content: {
    paddingTop: spacing.xl,
    paddingHorizontal: spacing.xxl,
    paddingBottom: 100,
  },
  heroTeacher: {
    backgroundColor: palette.primaryD,
    borderRadius: radius.xl,
    padding: spacing.xl,
    marginBottom: spacing.xl,
  },
  roleTag: {
    fontSize: 12,
    fontWeight: '800',
    color: palette.accent,
    letterSpacing: 1.5,
    marginBottom: spacing.xs,
  },
  heroName: {
    fontSize: 26,
    fontWeight: '800',
    color: '#fff',
  },
  heroSub: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)',
    marginTop: 2,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: palette.card,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: palette.line,
    padding: spacing.lg,
    alignItems: 'center',
    gap: spacing.xs,
  },
  statValue: {
    fontSize: 28,
    fontWeight: '800',
    color: palette.ink,
  },
  statLabel: {
    fontSize: 12,
    color: palette.sub,
    fontWeight: '600',
    textAlign: 'center',
  },
  ctaSecondary: {
    backgroundColor: palette.secondary,
    borderRadius: radius.lg,
    padding: spacing.xl,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  ctaText: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 16,
  },
  welcomeContainer: {
    marginBottom: spacing.xl,
  },
  greetingText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1a1a1a',
  },
  subTitleText: {
    fontSize: 20,
    fontWeight: '300',
    color: '#000000',
    marginTop: 2,
  },
  questionText: {
    fontSize: 25,
    color: '#000000',
    marginTop: 6,
    fontWeight: '400',
  },
  quizCta: {
    backgroundColor: palette.secondary,
    borderRadius: radius.xl,
    padding: spacing.xl,
    marginBottom: spacing.xl,
  },
  quizCtaTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '800',
  },
  quizCtaText: {
    color: '#fff',
    fontSize: 14,
    marginTop: 4,
    opacity: 0.95,
  },
  logoutButton: {
    marginTop: 10,
    alignSelf: 'flex-start',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  logoutText: {
    color: palette.rose,
    fontWeight: '600',
    fontSize: 15,
  },
});

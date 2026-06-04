import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { palette, radius, spacing } from '@/constants/design';
import { useAuth } from '@/lib/auth/AuthContext';
import { getLeaderboard, getProfile } from '@/lib/gamificacion/api';
import type { LeaderboardEntry, StudentProfile } from '@/lib/gamificacion/api';

export default function ProfileTab() {
  const { session, role } = useAuth();
  const router = useRouter();

  if (role === 'teacher') {
    return <ProfileTeacher />;
  }

  return <ProfileStudent />;
}

function ProfileStudent() {
  const { session, signOut } = useAuth();
  const router = useRouter();
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);

  const cargar = useCallback(async () => {
    if (!session?.user) return;
    setLoading(true);
    setError(null);
    try {
      const prof = await getProfile(session.user.id);
      setProfile(prof);
    } catch {
      setError('No pudimos cargar tu perfil.');
    } finally {
      setLoading(false);
    }
  }, [session?.user]);

  useFocusEffect(useCallback(() => { cargar(); }, [cargar]));

  const handleLeaderboard = async () => {
    try {
      const lb = await getLeaderboard(10);
      setLeaderboard(lb);
      setShowLeaderboard(true);
    } catch {}
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={palette.primary} />
      </View>
    );
  }

  if (error || !profile) {
    return (
      <View style={styles.centered}>
        <Ionicons name="person-circle-outline" size={48} color={palette.sub} />
        <Text style={styles.stateText}>{error || 'No se pudo cargar el perfil.'}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={cargar}>
          <Text style={styles.retryText}>Reintentar</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      {/* Encabezado: Nivel + Puntos */}
      <View style={styles.headerCard}>
        <View style={styles.levelContainer}>
          <Text style={styles.levelNumber}>{profile.level}</Text>
          <Text style={styles.levelLabel}>Nivel</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.pointsContainer}>
          <Ionicons name="star" size={32} color={palette.accent} />
          <Text style={styles.pointsNumber}>{profile.total_points}</Text>
          <Text style={styles.pointsLabel}>Puntos</Text>
        </View>
      </View>

      {/* Barra de progreso */}
      <View style={styles.progressSection}>
        <Text style={styles.progressLabel}>Progreso al siguiente nivel</Text>
        <View style={styles.progressBar}>
          <View
            style={[
              styles.progressFill,
              { width: `${Math.min((profile.total_points % 100) / 100, 1) * 100}%` },
            ]}
          />
        </View>
        <Text style={styles.progressText}>
          {profile.total_points % 100} / 100 puntos
        </Text>
      </View>

      {/* Sección de medallas */}
      <Text style={styles.sectionTitle}>Medallas ({profile.badges.length})</Text>
      {profile.badges.length === 0 ? (
        <View style={styles.emptyAchievements}>
          <Ionicons name="trophy-outline" size={40} color={palette.sub} />
          <Text style={styles.emptyText}>Aún no has desbloqueado medallas. ¡Sigue jugando!</Text>
        </View>
      ) : (
        <View style={styles.achievementsGrid}>
          {profile.badges.map((studentBadge) => (
            <View key={studentBadge.id} style={styles.achievementCard}>
              <Text style={styles.achievementIcon}>🏅</Text>
              <Text style={styles.achievementName}>{studentBadge.badge?.name}</Text>
              <Text style={styles.achievementDate}>
                {new Date(studentBadge.awarded_at).toLocaleDateString('es-CL')}
              </Text>
            </View>
          ))}
        </View>
      )}

      {/* Botón de ranking */}
      <TouchableOpacity style={styles.leaderboardButton} onPress={handleLeaderboard}>
        <Ionicons name="podium-outline" size={20} color={palette.secondary} />
        <Text style={styles.leaderboardText}>Ver ranking</Text>
        <Ionicons name="chevron-forward" size={20} color={palette.sub} />
      </TouchableOpacity>

      {/* Logout */}
      <TouchableOpacity
        style={styles.logoutButton}
        onPress={async () => { await signOut(); router.replace('/login'); }}
      >
        <Ionicons name="log-out-outline" size={20} color={palette.error} />
        <Text style={styles.logoutText}>Cerrar sesión</Text>
      </TouchableOpacity>

      <LeaderboardModal
        visible={showLeaderboard}
        data={leaderboard}
        onClose={() => setShowLeaderboard(false)}
      />
    </ScrollView>
  );
}

function ProfileTeacher() {
  const { signOut } = useAuth();
  const router = useRouter();

  return (
    <View style={styles.centered}>
      <Text style={styles.title}>Perfil del Profesor</Text>
      <Text style={styles.subtitle}>Próximamente: estadísticas y análisis de desempeño</Text>
      <TouchableOpacity
        style={styles.logoutButton}
        onPress={async () => { await signOut(); router.replace('/login'); }}
      >
        <Ionicons name="log-out-outline" size={20} color={palette.error} />
        <Text style={styles.logoutText}>Cerrar sesión</Text>
      </TouchableOpacity>
    </View>
  );
}

// Leaderboard Modal
function LeaderboardModal({
  visible,
  data,
  onClose,
}: {
  visible: boolean;
  data: LeaderboardEntry[];
  onClose: () => void;
}) {
  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <ScrollView style={styles.modalScreen} contentContainerStyle={styles.modalContent}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>🏆 Ranking de Estudiantes</Text>
          <TouchableOpacity onPress={onClose}>
            <Ionicons name="close" size={24} color={palette.ink} />
          </TouchableOpacity>
        </View>

        {data.map((entry) => (
          <View key={entry.student_id} style={styles.leaderboardRow}>
            <Text style={styles.position}>{entry.position}</Text>
            <View style={styles.leaderboardInfo}>
              <Text style={styles.leaderboardName}>{entry.full_name}</Text>
            </View>
            <View style={styles.leaderboardStats}>
              <Text style={styles.leaderboardLevel}>Lvl {entry.level}</Text>
              <Text style={styles.leaderboardPoints}>{entry.total_points} pts</Text>
            </View>
          </View>
        ))}
      </ScrollView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: palette.bg },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: palette.bg,
    padding: spacing.xxl,
    gap: spacing.md,
  },
  content: { padding: spacing.xl, gap: spacing.lg, paddingBottom: 60 },
  title: { fontSize: 24, fontWeight: '800', color: palette.ink },
  subtitle: { fontSize: 15, color: palette.sub, textAlign: 'center' },
  headerCard: {
    flexDirection: 'row',
    backgroundColor: palette.primary,
    borderRadius: radius.xl,
    padding: spacing.xl,
    alignItems: 'center',
    justifyContent: 'space-around',
    gap: spacing.lg,
  },
  levelContainer: { alignItems: 'center', gap: spacing.xs },
  levelNumber: { fontSize: 44, fontWeight: '800', color: '#fff' },
  levelLabel: { fontSize: 13, fontWeight: '700', color: 'rgba(255,255,255,0.8)', letterSpacing: 1 },
  divider: { width: 1, height: 60, backgroundColor: 'rgba(255,255,255,0.3)' },
  pointsContainer: { alignItems: 'center', gap: spacing.xs },
  pointsNumber: { fontSize: 32, fontWeight: '800', color: palette.accent },
  pointsLabel: { fontSize: 13, fontWeight: '700', color: 'rgba(255,255,255,0.8)', letterSpacing: 1 },
  progressSection: { gap: spacing.sm },
  progressLabel: { fontSize: 14, fontWeight: '700', color: palette.ink },
  progressBar: {
    height: 12,
    backgroundColor: palette.line,
    borderRadius: radius.lg,
    overflow: 'hidden',
  },
  progressFill: { height: '100%', backgroundColor: palette.secondary },
  progressText: { fontSize: 12, color: palette.sub, fontWeight: '600' },
  sectionTitle: { fontSize: 18, fontWeight: '800', color: palette.ink, marginTop: spacing.lg },
  emptyAchievements: {
    alignItems: 'center',
    paddingVertical: spacing.xxxl,
    gap: spacing.md,
  },
  emptyText: { color: palette.sub, fontSize: 15, textAlign: 'center' },
  achievementsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    justifyContent: 'space-between',
  },
  achievementCard: {
    width: '30%',
    backgroundColor: palette.card,
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: palette.line,
    alignItems: 'center',
    gap: spacing.xs,
  },
  achievementIcon: { fontSize: 32 },
  achievementName: { fontSize: 12, fontWeight: '800', color: palette.ink, textAlign: 'center' },
  achievementDate: { fontSize: 10, color: palette.sub },
  leaderboardButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: palette.card,
    borderRadius: radius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: palette.line,
    gap: spacing.md,
  },
  leaderboardText: { flex: 1, fontSize: 15, fontWeight: '700', color: palette.ink },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.lg,
    borderWidth: 1.5,
    borderColor: palette.error,
  },
  logoutText: { fontSize: 15, fontWeight: '700', color: palette.error },
  retryButton: {
    backgroundColor: palette.primary,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xxl,
    borderRadius: radius.md,
  },
  retryText: { color: '#fff', fontWeight: '700' },
  stateText: { color: palette.sub, fontSize: 15, textAlign: 'center' },
  modalScreen: { flex: 1, backgroundColor: palette.bg },
  modalContent: { padding: spacing.xl, paddingBottom: 60 },
  modalHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.lg },
  modalTitle: { fontSize: 20, fontWeight: '800', color: palette.ink },
  leaderboardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: palette.card,
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: palette.line,
    gap: spacing.lg,
  },
  position: { fontSize: 18, fontWeight: '800', color: palette.secondary, minWidth: 32 },
  leaderboardInfo: { flex: 1, gap: 4 },
  leaderboardName: { fontSize: 15, fontWeight: '800', color: palette.ink },
  leaderboardStats: { alignItems: 'flex-end', gap: 4 },
  leaderboardLevel: { fontSize: 12, fontWeight: '700', color: palette.primary },
  leaderboardPoints: { fontSize: 14, fontWeight: '800', color: palette.accent },
});

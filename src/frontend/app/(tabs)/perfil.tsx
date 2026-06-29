import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useAuth } from '@/lib/auth/AuthContext';
import {
  getAllBadges,
  getProfile,
  POINTS_PER_LEVEL,
  type Badge,
  type StudentProfile,
} from '@/lib/gamificacion/api';

const COLORES_MEDALLA = ['#7E9362', '#6289A3', '#D9A74A', '#C86D51'];

function inicial(nombre: string | null | undefined): string {
  return nombre?.trim()?.charAt(0)?.toUpperCase() ?? '?';
}

export default function PerfilScreen() {
  const { role } = useAuth();
  if (role === 'admin') {
    return <PerfilAdmin />;
  }
  if (role === 'teacher') {
    return <PerfilProfesor />;
  }
  return <PerfilEstudiante />;
}

function PerfilEstudiante() {
  const insets = useSafeAreaInsets();
  const { session, signOut } = useAuth();
  const userId = session?.user.id;

  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [todasMedallas, setTodasMedallas] = useState<Badge[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) return;
    let activo = true;
    setCargando(true);
    Promise.all([getProfile(userId), getAllBadges()])
      .then(([p, medallas]) => {
        if (activo) {
          setProfile(p);
          setTodasMedallas(medallas);
        }
      })
      .catch((e) => {
        if (activo) setError(e instanceof Error ? e.message : 'No se pudo cargar tu perfil.');
      })
      .finally(() => {
        if (activo) setCargando(false);
      });
    return () => {
      activo = false;
    };
  }, [userId]);

  if (cargando) {
    return (
      <View style={[styles.container, styles.centro]}>
        <ActivityIndicator size="large" color="#355343" />
      </View>
    );
  }

  if (error || !profile) {
    return (
      <View style={[styles.container, styles.centro]}>
        <Text style={styles.estadoTexto}>{error ?? 'No se pudo cargar tu perfil.'}</Text>
      </View>
    );
  }

  const ganadasIds = new Set(profile.badges.map((b) => b.badge_id));
  const puntosEnNivel = profile.total_points % POINTS_PER_LEVEL;

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <View style={[styles.headerBg, { paddingTop: insets.top + 20 }]}>
          <View style={styles.profileHeaderRow}>
            <View style={styles.avatarCircle}>
              <Text style={styles.avatarText}>{inicial(profile.full_name)}</Text>
            </View>
            <View style={styles.headerInfo}>
              <Text style={styles.userName}>{profile.full_name}</Text>
              <Text style={styles.userSubtitle}>Escuela Reducción Monte Verde</Text>
            </View>
          </View>
        </View>

        <View style={styles.mainContentWrapper}>
          <View style={styles.levelCard}>
            <View style={styles.levelRow}>
              <View style={[styles.medalBadge, { backgroundColor: '#D9A74A' }]}>
                <Ionicons name="star" size={24} color="#ffffff" />
              </View>
              <View style={styles.levelInfo}>
                <Text style={styles.levelTag}>NIVEL {profile.level}</Text>
                <Text style={styles.levelTitle}>Explorador del Humedal</Text>
                <View style={styles.progressBarBg}>
                  <View style={[styles.progressBarFill, { width: `${puntosEnNivel}%` }]} />
                </View>
                <Text style={styles.progressText}>{puntosEnNivel} / {POINTS_PER_LEVEL} pts para subir</Text>
              </View>
            </View>
          </View>

          <View style={styles.statsRow}>
            <View style={styles.statCard}>
              <View style={[styles.statIconCircle, { backgroundColor: '#FDF4DF' }]}>
                <Ionicons name="star" size={16} color="#D9A74A" />
              </View>
              <Text style={styles.statNumber}>{profile.total_points}</Text>
              <Text style={styles.statLabel}>PUNTOS</Text>
            </View>

            <View style={styles.statCard}>
              <View style={[styles.statIconCircle, { backgroundColor: '#FBECE8' }]}>
                <Ionicons name="medal" size={16} color="#C86D51" />
              </View>
              <Text style={styles.statNumber}>{profile.badges.length}</Text>
              <Text style={styles.statLabel}>MEDALLAS</Text>
            </View>

            <View style={styles.statCard}>
              <View style={[styles.statIconCircle, { backgroundColor: '#EBF0EC' }]}>
                <Ionicons name="leaf" size={16} color="#355343" />
              </View>
              <Text style={styles.statNumber}>{profile.level}</Text>
              <Text style={styles.statLabel}>NIVEL</Text>
            </View>
          </View>

          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Medallas</Text>
            <Text style={styles.sectionSubtitle}>{profile.badges.length} de {todasMedallas.length} ganadas</Text>
          </View>

          <View style={styles.medalGrid}>
            {todasMedallas.map((medalla, index) => {
              const ganada = ganadasIds.has(medalla.id);
              return (
                <View key={medalla.id} style={styles.medalGridItem}>
                  <View style={[styles.medalCircle, { backgroundColor: ganada ? COLORES_MEDALLA[index % COLORES_MEDALLA.length] : '#E2DEC9' }]}>
                    <Ionicons name={ganada ? 'star' : 'lock-closed'} size={ganada ? 28 : 24} color={ganada ? '#ffffff' : '#8E8A7E'} />
                  </View>
                  {ganada ? <Text style={styles.medalGridLabel}>{medalla.name}</Text> : null}
                </View>
              );
            })}
          </View>

          <TouchableOpacity style={styles.logoutButton} onPress={signOut}>
            <Ionicons name="log-out-outline" size={18} color="#C86D51" />
            <Text style={styles.logoutText}>Cerrar sesión</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

function PerfilProfesor() {
  const insets = useSafeAreaInsets();
  const { session, profile, signOut } = useAuth();
  
  // 2. INICIALIZA LA NAVEGACIÓN
  const router = useRouter();

  // Datos mockeados basados en la imagen (puedes reemplazarlos por datos de tu base de datos)
  const cursos = [
    { id: '1', nivel: '4°', nombre: '4° Básico A', estudiantes: 28, color: '#2B4C3F' },
    { id: '2', nivel: '4°', nombre: '4° Básico B', estudiantes: 26, color: '#C86D51' },
  ];

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* HEADER */}
        <View style={[styles.headerBg, { paddingTop: insets.top + 20 }]}>
          <View style={styles.profileHeaderRow}>
            <View style={styles.avatarCircle}>
              <Text style={styles.avatarText}>{inicial(profile?.full_name)}</Text>
            </View>
            <View style={styles.headerInfo}>
              <View style={styles.profTag}>
                <Text style={styles.profTagText}>PROFESOR/A</Text>
              </View>
              <Text style={styles.userName}>{profile?.full_name ?? 'Profe Marcela Pérez'}</Text>
              <Text style={styles.userSubtitle}>Profesora de Ciencias Naturales</Text>
            </View>
          </View>
        </View>

        {/* CONTENIDO PRINCIPAL */}
        <View style={styles.mainContentWrapper}>
          
          {/* TABLA DE INFORMACIÓN CARD */}
          <View style={styles.infoTableCard}>
            <View style={styles.tableRow}>
              <Text style={styles.tableLabel}>ESCUELA</Text>
              <Text style={styles.tableValue}>Escuela Reducción Monte Verde</Text>
            </View>
            <View style={styles.tableDivider} />
            
            <View style={styles.tableRow}>
              <Text style={styles.tableLabel}>CORREO</Text>
              <Text style={styles.tableValue}>{session?.user.email ?? 'marcela@monteverde.cl'}</Text>
            </View>
            <View style={styles.tableDivider} />

          </View>

          <View style={styles.statsRow}>
            <View style={styles.statCard}>
              <Ionicons name="person-outline" size={20} color="#8E8A7E" />
              <Text style={styles.statNumber}>78</Text>
              <Text style={styles.statLabel}>ESTUDIANTES</Text>
            </View>
            
            <View style={styles.statCard}>
              <Ionicons name="document-text-outline" size={20} color="#C86D51" />
              <Text style={styles.statNumber}>12</Text>
              <Text style={styles.statLabel}>RECURSOS</Text>
            </View>

            <View style={styles.statCard}>
              <Ionicons name="help-circle-outline" size={20} color="#2B4C3F" />
              <Text style={styles.statNumber}>3</Text>
              <Text style={styles.statLabel}>CURSOS</Text>
            </View>
          </View>

          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Cursos asignados</Text>
          </View>

          {/* LISTA DE CURSOS (poner los cursos asignados de la base de datos) */}
          {cursos.map((curso) => (
            <TouchableOpacity 
              key={curso.id} 
              style={[styles.levelCard, { marginBottom: 12, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }]}
              onPress={() => {
                router.push({ pathname: '/(tabs)/cursos', params: { cursoId: curso.id, nombreCurso: curso.nombre } });
              }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <View style={[styles.statIconCircle, { backgroundColor: '#F2EFE6', width: 44, height: 44, borderRadius: 14, marginBottom: 0, borderLeftWidth: 4, borderLeftColor: curso.color }]}>
                  <Text style={{ fontSize: 14, fontWeight: 'bold', color: curso.color }}>{curso.nivel}</Text>
                </View>
                <View style={{ marginLeft: 14 }}>
                  <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#242424' }}>{curso.nombre}</Text>
                  <View style={{ marginTop: 2 }}>
                    <Text style={{ fontSize: 12, color: '#8E8A7E' }}>{curso.estudiantes} estudiantes</Text>
                  </View>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#8E8A7E" />
            </TouchableOpacity>
          ))}

          <TouchableOpacity style={styles.logoutButton} onPress={signOut}>
            <Ionicons name="log-out-outline" size={18} color="#C86D51" />
            <Text style={styles.logoutText}>Cerrar sesión</Text>
          </TouchableOpacity>
          
        </View>
      </ScrollView>
    </View>
  );
}

function PerfilAdmin() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { profile, session, signOut } = useAuth();

  const accesos = [
    { label: 'Gestión de usuarios',  icon: 'people-outline' as const,           ruta: '/admin/usuarios' },
    { label: 'Gestión de cursos',    icon: 'school-outline' as const,            ruta: '/admin/cursos' },
    { label: 'Gamificación',         icon: 'medal-outline' as const,             ruta: '/admin/gamificacion' },
    { label: 'Eventos',              icon: 'calendar-outline' as const,          ruta: '/admin/eventos' },
    { label: 'Panel general',        icon: 'grid-outline' as const,              ruta: '/admin' },
  ];

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={[styles.headerBg, { paddingTop: insets.top + 20 }]}>
          <View style={styles.profileHeaderRow}>
            <View style={[styles.avatarCircle, { backgroundColor: '#D9A74A' }]}>
              <Text style={styles.avatarText}>{inicial(profile?.full_name)}</Text>
            </View>
            <View style={styles.headerInfo}>
              <View style={styles.profTag}>
                <Text style={styles.profTagText}>ADMINISTRADOR</Text>
              </View>
              <Text style={styles.userName}>{profile?.full_name ?? 'Admin'}</Text>
              <Text style={styles.userSubtitle}>{session?.user.email}</Text>
            </View>
          </View>
        </View>

        <View style={styles.mainContentWrapper}>
          {/* Accesos rápidos */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Panel de administración</Text>
          </View>

          {accesos.map((item) => (
            <TouchableOpacity
              key={item.ruta}
              style={[styles.levelCard, { marginBottom: 12, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }]}
              activeOpacity={0.7}
              onPress={() => router.push(item.ruta as any)}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <View style={[styles.statIconCircle, { backgroundColor: '#EBF0EC', width: 44, height: 44, borderRadius: 14, marginBottom: 0 }]}>
                  <Ionicons name={item.icon} size={20} color="#355343" />
                </View>
                <Text style={{ marginLeft: 14, fontSize: 15, fontWeight: '600', color: '#242424' }}>
                  {item.label}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color="#8E8A7E" />
            </TouchableOpacity>
          ))}

          <TouchableOpacity style={styles.logoutButton} onPress={signOut}>
            <Ionicons name="log-out-outline" size={18} color="#C86D51" />
            <Text style={styles.logoutText}>Cerrar sesión</Text>
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
  centro: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  estadoTexto: {
    fontSize: 15,
    color: '#8E8A7E',
    textAlign: 'center',
    paddingHorizontal: 24,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  headerBg: {
    backgroundColor: '#2B4C3F',
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    paddingHorizontal: 24,
    paddingBottom: 60,
  },
  profileHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarCircle: {
    width: 76,
    height: 76,
    borderRadius: 24,
    backgroundColor: '#D9A74A',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#2B4C3F',
  },
  headerInfo: {
    flex: 1,
    marginLeft: 16,
  },
  profTag: {
    backgroundColor: '#D9A74A',
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    marginBottom: 4,
  },
  profTagText: {
    fontSize: 9,
    fontWeight: '900',
    color: '#2B4C3F',
  },
  userName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  userSubtitle: {
    fontSize: 13,
    color: '#E2DEC9',
    marginTop: 2,
    opacity: 0.9,
  },
  mainContentWrapper: {
    paddingHorizontal: 24,
    marginTop: -40,
  },
  levelCard: {
    backgroundColor: '#FFFDF9',
    borderRadius: 24,
    padding: 18,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 10,
  },
  levelRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  medalBadge: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
  levelInfo: {
    flex: 1,
    marginLeft: 16,
  },
  levelTag: {
    fontSize: 10,
    fontWeight: '800',
    color: '#8E8A7E',
    letterSpacing: 0.5,
  },
  levelTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#242424',
    marginTop: 1,
  },
  progressBarBg: {
    height: 8,
    backgroundColor: '#EBF0EC',
    borderRadius: 4,
    marginTop: 8,
    width: '100%',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#355343',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 11,
    color: '#8E8A7E',
    marginTop: 6,
    fontWeight: '600',
  },
  infoTableCard: {
    backgroundColor: '#FFFDF9',
    borderRadius: 24,
    paddingVertical: 12,
    paddingHorizontal: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 10,
  },
  tableRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 14,
    alignItems: 'center',
  },
  tableLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#8E8A7E',
    letterSpacing: 0.5,
  },
  tableValue: {
    fontSize: 14,
    fontWeight: '700',
    color: '#242424',
  },
  tableDivider: {
    height: 1,
    backgroundColor: '#F2EFE6',
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#FFFDF9',
    borderRadius: 20,
    paddingVertical: 16,
    alignItems: 'center',
    padding: 14,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.02,
    shadowRadius: 4,
  },
  statIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  statNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#242424',
  },
  statLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: '#8E8A7E',
    marginTop: 2,
    letterSpacing: 0.3,
  },
  sectionHeader: {
    marginTop: 24,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#242424',
  },
  sectionSubtitle: {
    fontSize: 13,
    color: '#8E8A7E',
    marginTop: 2,
  },
  medalGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'space-between',
  },
  medalGridItem: {
    width: '31%',
    backgroundColor: '#FFFDF9',
    borderRadius: 24,
    paddingVertical: 16,
    paddingHorizontal: 8,
    alignItems: 'center',
    minHeight: 120,
    justifyContent: 'center',
  },
  medalCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
  },
  medalGridLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#242424',
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 13,
  },
  logoutButton: {
    marginTop: 28,
    backgroundColor: '#FFFDF9',
    borderRadius: 16,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: '#ebdcc5',
  },
  logoutText: {
    color: '#C86D51',
    fontWeight: 'bold',
    fontSize: 15,
  },
});

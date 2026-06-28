import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useAuth } from '@/lib/auth/AuthContext';
import { obtenerEstadisticas } from '@/lib/admin/api';
import type { AdminStats } from '@/lib/types';

export default function AdminDashboard() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { profile, role } = useAuth();

  const [stats, setStats] = useState<AdminStats | null>(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Redirigir si no es admin
  useEffect(() => {
    if (role && role !== 'admin') {
      router.replace('/(tabs)');
    }
  }, [role, router]);

  useEffect(() => {
    let activo = true;
    setCargando(true);
    obtenerEstadisticas()
      .then((data) => { if (activo) setStats(data); })
      .catch((e) => { if (activo) setError(e instanceof Error ? e.message : 'Error al cargar estadísticas.'); })
      .finally(() => { if (activo) setCargando(false); });
    return () => { activo = false; };
  }, []);

  const accesos = [
    {
      label: 'Usuarios',
      descripcion: 'Profesores y estudiantes',
      icon: 'people' as const,
      color: '#355343',
      bgColor: '#EBF0EC',
      ruta: '/admin/usuarios',
    },
    {
      label: 'Cursos',
      descripcion: 'Crear y asignar cursos',
      icon: 'school' as const,
      color: '#C86D51',
      bgColor: '#FBECE8',
      ruta: '/admin/cursos',
    },
    {
      label: 'Gamificación',
      descripcion: 'Medallas y puntos',
      icon: 'medal' as const,
      color: '#D9A74A',
      bgColor: '#FDF4DF',
      ruta: '/admin/gamificacion',
    },
    {
      label: 'Eventos',
      descripcion: 'Calendario visible para la comunidad',
      icon: 'calendar' as const,
      color: '#3E6B52',
      bgColor: '#E6F0EA',
      ruta: '/admin/eventos',
    },
  ];

  return (
    <View style={[styles.container]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>

        {/* HEADER */}
        <View style={[styles.headerBg, { paddingTop: insets.top + 20 }]}>
          <View style={styles.headerRow}>
            <View>
              <Text style={styles.headerTag}>PANEL DE ADMINISTRACIÓN</Text>
              <Text style={styles.headerTitle}>
                Hola, {profile?.full_name?.split(' ')[0] ?? 'Admin'}
              </Text>
              <Text style={styles.headerSubtitle}>Gestión de VerdeBit</Text>
            </View>
            <View style={styles.avatarCircle}>
              <Ionicons name="shield-checkmark" size={28} color="#355343" />
            </View>
          </View>
        </View>

        <View style={styles.mainContent}>

          {/* ESTADÍSTICAS */}
          {cargando ? (
            <View style={styles.loadingCard}>
              <ActivityIndicator size="small" color="#355343" />
            </View>
          ) : error ? (
            <View style={styles.loadingCard}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : stats ? (
            <View style={styles.statsGrid}>
              <StatCard valor={stats.profesores} label="PROFESORES" icon="person" color="#355343" bgColor="#EBF0EC" />
              <StatCard valor={stats.estudiantes} label="ESTUDIANTES" icon="people" color="#2B4C3F" bgColor="#E2EDE6" />
              <StatCard valor={stats.recursos} label="RECURSOS" icon="document-text" color="#C86D51" bgColor="#FBECE8" />
              <StatCard valor={stats.quizzes_publicados} label="QUIZZES" icon="help-circle" color="#D9A74A" bgColor="#FDF4DF" />
              <StatCard valor={stats.eventos} label="EVENTOS" icon="calendar" color="#3E6B52" bgColor="#E6F0EA" />
            </View>
          ) : null}

          {/* ACCESOS RÁPIDOS */}
          <Text style={styles.sectionTitle}>Gestión</Text>
          <Text style={styles.sectionSubtitle}>¿Qué quieres administrar hoy?</Text>

          {accesos.map((item) => (
            <TouchableOpacity
              key={item.ruta}
              style={styles.accesoCard}
              activeOpacity={0.7}
              onPress={() => router.push(item.ruta as any)}
            >
              <View style={[styles.accesoIcon, { backgroundColor: item.bgColor }]}>
                <Ionicons name={item.icon} size={24} color={item.color} />
              </View>
              <View style={styles.accesoInfo}>
                <Text style={styles.accesoLabel}>{item.label}</Text>
                <Text style={styles.accesoDesc}>{item.descripcion}</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#8E8A7E" />
            </TouchableOpacity>
          ))}

        </View>
      </ScrollView>
    </View>
  );
}

function StatCard({
  valor, label, icon, color, bgColor,
}: {
  valor: number;
  label: string;
  icon: React.ComponentProps<typeof Ionicons>['name'];
  color: string;
  bgColor: string;
}) {
  return (
    <View style={styles.statCard}>
      <View style={[styles.statIconCircle, { backgroundColor: bgColor }]}>
        <Ionicons name={icon} size={18} color={color} />
      </View>
      <Text style={styles.statNumber}>{valor}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9F6EE',
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
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  headerTag: {
    fontSize: 10,
    fontWeight: '800',
    color: '#D9A74A',
    letterSpacing: 1,
    marginBottom: 4,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#E2DEC9',
    marginTop: 2,
    opacity: 0.9,
  },
  avatarCircle: {
    width: 56,
    height: 56,
    borderRadius: 20,
    backgroundColor: '#D9A74A',
    justifyContent: 'center',
    alignItems: 'center',
  },
  mainContent: {
    paddingHorizontal: 24,
    marginTop: -40,
  },
  loadingCard: {
    backgroundColor: '#FFFDF9',
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    marginBottom: 16,
    elevation: 2,
  },
  errorText: {
    color: '#C86D51',
    fontSize: 14,
    textAlign: 'center',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 28,
  },
  statCard: {
    width: '47%',
    backgroundColor: '#FFFDF9',
    borderRadius: 20,
    padding: 16,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
  },
  statIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  statNumber: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#242424',
  },
  statLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: '#8E8A7E',
    letterSpacing: 0.5,
    marginTop: 2,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#242424',
    marginBottom: 2,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#8E8A7E',
    marginBottom: 16,
  },
  accesoCard: {
    backgroundColor: '#FFFDF9',
    borderRadius: 20,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
  },
  accesoIcon: {
    width: 48,
    height: 48,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  accesoInfo: {
    flex: 1,
    marginLeft: 14,
  },
  accesoLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#242424',
  },
  accesoDesc: {
    fontSize: 12,
    color: '#8E8A7E',
    marginTop: 2,
  },
});

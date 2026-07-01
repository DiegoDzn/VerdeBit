import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { getCourseStudents } from '@/lib/professor/api';
import type { Profile } from '@/lib/types';

type StudentWithEnrollment = Profile & { enrolled_at: string };

function formatearFecha(iso: string): string {
  const fecha = new Date(iso);
  return fecha.toLocaleDateString('es-CL', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export default function CursosScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { cursoId, nombreCurso } = useLocalSearchParams<{ cursoId: string; nombreCurso: string }>();

  const [estudiantes, setEstudiantes] = useState<StudentWithEnrollment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!cursoId) return;
    let activo = true;

    const cargarEstudiantes = async () => {
      try {
        setLoading(true);
        const data = await getCourseStudents(cursoId);
        if (activo) setEstudiantes(data);
      } catch (error) {
        console.error('Error al cargar estudiantes del curso:', error);
      } finally {
        if (activo) setLoading(false);
      }
    };

    cargarEstudiantes();
    return () => { activo = false; };
  }, [cursoId]);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" />

      <View style={styles.headerContainer}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButtonSquare}>
          <Ionicons name="chevron-back" size={20} color="#242424" />
        </TouchableOpacity>
        <View style={styles.titleContainer}>
          <Text style={styles.headerTitle}>Estudiantes del curso</Text>
          {nombreCurso && <Text style={styles.headerSubtitle}>{nombreCurso}</Text>}
        </View>
        <Text style={styles.studentCount}>{estudiantes.length}</Text>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#355343" />
        </View>
      ) : (
        <FlatList
          data={estudiantes}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="people-outline" size={48} color="#7e7568" />
              <Text style={styles.emptyText}>No hay estudiantes inscritos en este curso</Text>
            </View>
          }
          renderItem={({ item, index }) => (
            <View style={styles.studentCard}>
              <View style={[styles.avatarCircle, { backgroundColor: COLORES_AVATAR[index % COLORES_AVATAR.length] }]}>
                <Text style={styles.avatarText}>
                  {(item.full_name ?? '?').charAt(0).toUpperCase()}
                </Text>
              </View>
              <View style={styles.studentInfo}>
                <Text style={styles.studentName}>{item.full_name}</Text>
                <Text style={styles.enrolledDate}>Inscrito el {formatearFecha(item.enrolled_at)}</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color="#7e7568" />
            </View>
          )}
        />
      )}
    </View>
  );
}

const COLORES_AVATAR = ['#dfae4b', '#c96f43', '#7b9c53', '#3e6b52', '#9e3d3d', '#8C4F2B'];

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAF5EC',
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 20,
    gap: 16,
  },
  backButtonSquare: {
    width: 45,
    height: 45,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  titleContainer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#242424',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#7e786b',
    marginTop: 2,
  },
  studentCount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#355343',
    backgroundColor: '#EBF0EC',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 12,
    overflow: 'hidden',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    paddingHorizontal: 24,
    paddingBottom: 40,
    gap: 10,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    gap: 12,
  },
  emptyText: {
    fontSize: 16,
    color: '#7e7568',
    textAlign: 'center',
  },
  studentCard: {
    backgroundColor: '#ffffff',
    borderRadius: 18,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  avatarCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  studentInfo: {
    flex: 1,
  },
  studentName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#242424',
  },
  enrolledDate: {
    fontSize: 12,
    color: '#7e7568',
    marginTop: 2,
  },
});

import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { desmatricularEstudiante, listarCursos, listarUsuarios, matricularEstudiante } from '@/lib/admin/api';
import { supabase } from '@/lib/supabase/client';
import type { Course, CourseEnrollment, Profile } from '@/lib/types';

export default function DetalleCursoScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  const [curso, setCurso] = useState<Course | null>(null);
  const [matriculados, setMatriculados] = useState<(CourseEnrollment & { perfil: Profile | null })[]>([]);
  const [todosEstudiantes, setTodosEstudiantes] = useState<Profile[]>([]);
  const [cargando, setCargando] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [guardando, setGuardando] = useState(false);

  const cargarDatos = useCallback(async () => {
    if (!id) return;
    setCargando(true);
    try {
      const [cursos, usuarios, { data: enrollments }] = await Promise.all([
        listarCursos(),
        listarUsuarios(),
        supabase.from('course_enrollments').select('*').eq('course_id', id),
      ]);
      const cursoEncontrado = cursos.find((c) => c.id === id) ?? null;
      setCurso(cursoEncontrado);
      setTodosEstudiantes(usuarios.filter((u) => u.role === 'student'));
      const enr = (enrollments ?? []) as CourseEnrollment[];
      const conPerfil = enr.map((e) => ({
        ...e,
        perfil: usuarios.find((u) => u.id === e.student_id) ?? null,
      }));
      setMatriculados(conPerfil);
    } catch (e) {
      Alert.alert('Error', e instanceof Error ? e.message : 'No se pudieron cargar los datos.');
    } finally {
      setCargando(false);
    }
  }, [id]);

  useEffect(() => { cargarDatos(); }, [cargarDatos]);

  const matriculadosIds = new Set(matriculados.map((m) => m.student_id));
  const sinMatricular = todosEstudiantes.filter((e) => !matriculadosIds.has(e.id));

  const handleMatricular = async (estudiante: Profile) => {
    if (!id) return;
    setGuardando(true);
    try {
      await matricularEstudiante(id, estudiante.id);
      setModalVisible(false);
      await cargarDatos();
    } catch (e) {
      Alert.alert('Error', e instanceof Error ? e.message : 'No se pudo matricular al estudiante.');
    } finally {
      setGuardando(false);
    }
  };

  const handleDesmatricular = (enrollment: CourseEnrollment & { perfil: Profile | null }) => {
    const nombre = enrollment.perfil?.full_name ?? 'este estudiante';
    Alert.alert(
      'Retirar estudiante',
      `¿Retirar a ${nombre} del curso?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Retirar',
          style: 'destructive',
          onPress: async () => {
            try {
              await desmatricularEstudiante(enrollment.course_id, enrollment.student_id);
              setMatriculados((prev) => prev.filter((m) => m.id !== enrollment.id));
            } catch (e) {
              Alert.alert('Error', e instanceof Error ? e.message : 'No se pudo retirar al estudiante.');
            }
          },
        },
      ]
    );
  };

  function inicial(nombre: string | null): string {
    return nombre?.trim()?.charAt(0)?.toUpperCase() ?? '?';
  }

  if (cargando) {
    return (
      <View style={[styles.container, styles.centro, { paddingTop: insets.top }]}>
        <ActivityIndicator size="large" color="#355343" />
      </View>
    );
  }

  if (!curso) {
    return (
      <View style={[styles.container, styles.centro, { paddingTop: insets.top }]}>
        <Text style={styles.estadoTexto}>Curso no encontrado.</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top + 15 }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={22} color="#242424" />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={styles.titulo} numberOfLines={1}>{curso.name}</Text>
          <Text style={styles.subtitulo}>{matriculados.length} estudiantes matriculados</Text>
        </View>
      </View>

      {/* Descripción */}
      {curso.description && (
        <View style={styles.descripcionCard}>
          <Text style={styles.descripcionText}>{curso.description}</Text>
        </View>
      )}

      {/* Lista de matriculados */}
      <FlatList
        data={matriculados}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listaContainer}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.avatarCircle}>
              <Text style={styles.avatarText}>{inicial(item.perfil?.full_name ?? null)}</Text>
            </View>
            <View style={styles.cardInfo}>
              <Text style={styles.cardNombre}>{item.perfil?.full_name ?? 'Sin nombre'}</Text>
              <Text style={styles.cardPuntos}>{item.perfil?.total_points ?? 0} puntos</Text>
            </View>
            <TouchableOpacity
              onPress={() => handleDesmatricular(item)}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              style={styles.deleteBtn}
            >
              <Ionicons name="person-remove-outline" size={18} color="#C86D51" />
            </TouchableOpacity>
          </View>
        )}
        ListEmptyComponent={
          <View style={styles.estadoVacio}>
            <Text style={styles.estadoTexto}>No hay estudiantes matriculados.</Text>
          </View>
        }
      />

      {/* FAB */}
      <TouchableOpacity
        style={[styles.fab, { bottom: insets.bottom + 20 }]}
        activeOpacity={0.8}
        onPress={() => setModalVisible(true)}
      >
        <Ionicons name="person-add" size={20} color="#ffffff" />
        <Text style={styles.fabText}>Matricular</Text>
      </TouchableOpacity>

      {/* Modal matricular */}
      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitulo}>Matricular estudiante</Text>
            {sinMatricular.length === 0 ? (
              <Text style={styles.estadoTexto}>Todos los estudiantes ya están matriculados.</Text>
            ) : (
              <FlatList
                data={sinMatricular}
                keyExtractor={(item) => item.id}
                style={{ maxHeight: 340 }}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={styles.estudianteOpcion}
                    activeOpacity={0.7}
                    onPress={() => handleMatricular(item)}
                    disabled={guardando}
                  >
                    <View style={styles.estudianteAvatar}>
                      <Text style={styles.estudianteAvatarText}>{inicial(item.full_name)}</Text>
                    </View>
                    <Text style={styles.estudianteNombre}>{item.full_name ?? 'Sin nombre'}</Text>
                    {guardando
                      ? <ActivityIndicator size="small" color="#355343" />
                      : <Ionicons name="add-circle-outline" size={22} color="#355343" />
                    }
                  </TouchableOpacity>
                )}
              />
            )}
            <TouchableOpacity style={styles.btnCerrar} onPress={() => setModalVisible(false)}>
              <Text style={styles.btnCerrarText}>Cerrar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9F6EE' },
  centro: { alignItems: 'center', justifyContent: 'center' },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 24, marginBottom: 12, gap: 14 },
  backButton: { width: 40, height: 40, borderRadius: 14, backgroundColor: '#FFFDF9', justifyContent: 'center', alignItems: 'center', elevation: 1 },
  titulo: { fontSize: 22, fontWeight: 'bold', color: '#242424' },
  subtitulo: { fontSize: 13, color: '#8E8A7E', marginTop: 1 },
  descripcionCard: { marginHorizontal: 24, backgroundColor: '#FFFDF9', borderRadius: 16, padding: 14, marginBottom: 12, elevation: 1 },
  descripcionText: { fontSize: 14, color: '#8E8A7E', lineHeight: 20 },
  listaContainer: { paddingHorizontal: 24, paddingBottom: 100, gap: 10 },
  card: { backgroundColor: '#FFFDF9', borderRadius: 20, padding: 14, flexDirection: 'row', alignItems: 'center', elevation: 1 },
  avatarCircle: { width: 44, height: 44, borderRadius: 14, backgroundColor: '#E2DEC9', justifyContent: 'center', alignItems: 'center' },
  avatarText: { fontSize: 18, fontWeight: 'bold', color: '#355343' },
  cardInfo: { flex: 1, marginLeft: 12 },
  cardNombre: { fontSize: 15, fontWeight: 'bold', color: '#242424' },
  cardPuntos: { fontSize: 12, color: '#8E8A7E', marginTop: 2 },
  deleteBtn: { padding: 6 },
  estadoVacio: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: 40 },
  estadoTexto: { fontSize: 15, color: '#8E8A7E', textAlign: 'center' },
  fab: { position: 'absolute', right: 24, backgroundColor: '#355343', flexDirection: 'row', alignItems: 'center', paddingHorizontal: 18, paddingVertical: 14, borderRadius: 24, elevation: 6 },
  fabText: { color: '#ffffff', fontWeight: 'bold', fontSize: 15, marginLeft: 6 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  modalCard: { backgroundColor: '#FFFDF9', borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 24, paddingBottom: 40 },
  modalTitulo: { fontSize: 20, fontWeight: 'bold', color: '#242424', marginBottom: 16 },
  estudianteOpcion: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#F2EFE6' },
  estudianteAvatar: { width: 38, height: 38, borderRadius: 12, backgroundColor: '#E2DEC9', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  estudianteAvatarText: { fontSize: 16, fontWeight: 'bold', color: '#355343' },
  estudianteNombre: { flex: 1, fontSize: 15, fontWeight: '600', color: '#242424' },
  btnCerrar: { marginTop: 20, paddingVertical: 14, borderRadius: 16, borderWidth: 1, borderColor: '#E2DEC9', alignItems: 'center' },
  btnCerrarText: { fontSize: 15, fontWeight: '700', color: '#8E8A7E' },
});

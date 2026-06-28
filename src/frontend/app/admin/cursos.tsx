import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { crearCurso, eliminarCurso, listarCursos, listarUsuarios } from '@/lib/admin/api';
import type { Course, Profile } from '@/lib/types';

export default function CursosScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const [cursos, setCursos] = useState<Course[]>([]);
  const [profesores, setProfesores] = useState<Profile[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  // Estado del formulario de creación
  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [profesorId, setProfesorId] = useState<string | null>(null);
  const [guardando, setGuardando] = useState(false);

  const cargarDatos = () => {
    setCargando(true);
    Promise.all([listarCursos(), listarUsuarios()])
      .then(([cs, us]) => {
        setCursos(cs);
        setProfesores(us.filter((u) => u.role === 'teacher'));
      })
      .catch((e) => setError(e instanceof Error ? e.message : 'Error al cargar cursos.'))
      .finally(() => setCargando(false));
  };

  useEffect(() => { cargarDatos(); }, []);

  const handleCrear = async () => {
    if (!nombre.trim()) {
      Alert.alert('Error', 'El nombre del curso es obligatorio.');
      return;
    }
    setGuardando(true);
    try {
      const nuevo = await crearCurso(nombre.trim(), descripcion.trim() || null, profesorId);
      setCursos((prev) => [nuevo, ...prev]);
      setModalVisible(false);
      setNombre('');
      setDescripcion('');
      setProfesorId(null);
    } catch (e) {
      Alert.alert('Error', e instanceof Error ? e.message : 'No se pudo crear el curso.');
    } finally {
      setGuardando(false);
    }
  };

  const handleEliminar = (curso: Course) => {
    Alert.alert(
      'Eliminar curso',
      `¿Seguro que quieres eliminar "${curso.name}"? Se eliminarán todas las matrículas asociadas.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              await eliminarCurso(curso.id);
              setCursos((prev) => prev.filter((c) => c.id !== curso.id));
            } catch (e) {
              Alert.alert('Error', e instanceof Error ? e.message : 'No se pudo eliminar el curso.');
            }
          },
        },
      ]
    );
  };

  const profesorNombre = (teacherId: string | null) => {
    if (!teacherId) return 'Sin asignar';
    return profesores.find((p) => p.id === teacherId)?.full_name ?? 'Sin asignar';
  };

  const renderItem = ({ item }: { item: Course }) => (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.7}
      onPress={() => router.push({ pathname: '/admin/curso/[id]', params: { id: item.id } })}
    >
      <View style={styles.cardIconCircle}>
        <Ionicons name="school" size={22} color="#355343" />
      </View>
      <View style={styles.cardInfo}>
        <Text style={styles.cardNombre} numberOfLines={1}>{item.name}</Text>
        <Text style={styles.cardProfesor}>{profesorNombre(item.teacher_id)}</Text>
      </View>
      <TouchableOpacity
        onPress={() => handleEliminar(item)}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        style={styles.deleteBtn}
      >
        <Ionicons name="trash-outline" size={18} color="#C86D51" />
      </TouchableOpacity>
      <Ionicons name="chevron-forward" size={18} color="#8E8A7E" />
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top + 15 }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={22} color="#242424" />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={styles.titulo}>Cursos</Text>
          <Text style={styles.subtitulo}>{cursos.length} registrados</Text>
        </View>
      </View>

      {/* Lista */}
      {cargando ? (
        <View style={styles.estadoVacio}>
          <ActivityIndicator size="large" color="#355343" />
        </View>
      ) : error ? (
        <View style={styles.estadoVacio}>
          <Text style={styles.estadoTexto}>{error}</Text>
        </View>
      ) : (
        <FlatList
          data={cursos}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.listaContainer}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.estadoVacio}>
              <Text style={styles.estadoTexto}>No hay cursos creados todavía.</Text>
            </View>
          }
        />
      )}

      {/* FAB */}
      <TouchableOpacity
        style={[styles.fab, { bottom: insets.bottom + 20 }]}
        activeOpacity={0.8}
        onPress={() => setModalVisible(true)}
      >
        <Ionicons name="add" size={24} color="#ffffff" />
        <Text style={styles.fabText}>Nuevo curso</Text>
      </TouchableOpacity>

      {/* Modal Crear Curso */}
      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitulo}>Nuevo curso</Text>

            <Text style={styles.inputLabel}>Nombre del curso *</Text>
            <TextInput
              style={styles.input}
              placeholder="Ej: 4° Básico A"
              placeholderTextColor="#8E8A7E"
              value={nombre}
              onChangeText={setNombre}
            />

            <Text style={styles.inputLabel}>Descripción (opcional)</Text>
            <TextInput
              style={[styles.input, styles.inputMultiline]}
              placeholder="Descripción del curso..."
              placeholderTextColor="#8E8A7E"
              value={descripcion}
              onChangeText={setDescripcion}
              multiline
              numberOfLines={3}
            />

            <Text style={styles.inputLabel}>Profesor asignado</Text>
            {profesores.length === 0 ? (
              <Text style={styles.sinProfesores}>No hay profesores registrados.</Text>
            ) : (
              profesores.map((p) => (
                <TouchableOpacity
                  key={p.id}
                  style={[styles.profesorOpcion, profesorId === p.id && styles.profesorOpcionActivo]}
                  onPress={() => setProfesorId(profesorId === p.id ? null : p.id)}
                >
                  <Text style={[styles.profesorOpcionText, profesorId === p.id && styles.profesorOpcionTextActivo]}>
                    {p.full_name ?? 'Sin nombre'}
                  </Text>
                  {profesorId === p.id && <Ionicons name="checkmark" size={16} color="#ffffff" />}
                </TouchableOpacity>
              ))
            )}

            <View style={styles.modalBotones}>
              <TouchableOpacity
                style={styles.btnCancelar}
                onPress={() => { setModalVisible(false); setNombre(''); setDescripcion(''); setProfesorId(null); }}
              >
                <Text style={styles.btnCancelarText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.btnCrear} onPress={handleCrear} disabled={guardando}>
                {guardando
                  ? <ActivityIndicator size="small" color="#ffffff" />
                  : <Text style={styles.btnCrearText}>Crear</Text>
                }
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9F6EE' },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 24, marginBottom: 16, gap: 14 },
  backButton: { width: 40, height: 40, borderRadius: 14, backgroundColor: '#FFFDF9', justifyContent: 'center', alignItems: 'center', elevation: 1 },
  titulo: { fontSize: 26, fontWeight: 'bold', color: '#242424' },
  subtitulo: { fontSize: 13, color: '#8E8A7E', marginTop: 1 },
  listaContainer: { paddingHorizontal: 24, paddingBottom: 100, gap: 10 },
  card: { backgroundColor: '#FFFDF9', borderRadius: 20, padding: 14, flexDirection: 'row', alignItems: 'center', elevation: 1 },
  cardIconCircle: { width: 46, height: 46, borderRadius: 16, backgroundColor: '#EBF0EC', justifyContent: 'center', alignItems: 'center' },
  cardInfo: { flex: 1, marginLeft: 12 },
  cardNombre: { fontSize: 15, fontWeight: 'bold', color: '#242424' },
  cardProfesor: { fontSize: 12, color: '#8E8A7E', marginTop: 2 },
  deleteBtn: { padding: 6, marginRight: 4 },
  estadoVacio: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  estadoTexto: { fontSize: 15, color: '#8E8A7E', textAlign: 'center' },
  fab: { position: 'absolute', right: 24, backgroundColor: '#355343', flexDirection: 'row', alignItems: 'center', paddingHorizontal: 18, paddingVertical: 14, borderRadius: 24, elevation: 6 },
  fabText: { color: '#ffffff', fontWeight: 'bold', fontSize: 15, marginLeft: 6 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  modalCard: { backgroundColor: '#FFFDF9', borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 24, paddingBottom: 40 },
  modalTitulo: { fontSize: 22, fontWeight: 'bold', color: '#242424', marginBottom: 20 },
  inputLabel: { fontSize: 12, fontWeight: '700', color: '#8E8A7E', letterSpacing: 0.3, marginBottom: 6, marginTop: 12 },
  input: { backgroundColor: '#F2EFE6', borderRadius: 14, paddingHorizontal: 16, paddingVertical: 12, fontSize: 15, color: '#242424' },
  inputMultiline: { height: 80, textAlignVertical: 'top' },
  sinProfesores: { fontSize: 13, color: '#8E8A7E', fontStyle: 'italic', marginTop: 4 },
  profesorOpcion: { backgroundColor: '#F2EFE6', borderRadius: 12, paddingHorizontal: 14, paddingVertical: 10, marginTop: 6, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  profesorOpcionActivo: { backgroundColor: '#355343' },
  profesorOpcionText: { fontSize: 14, fontWeight: '600', color: '#242424' },
  profesorOpcionTextActivo: { color: '#ffffff' },
  modalBotones: { flexDirection: 'row', gap: 12, marginTop: 24 },
  btnCancelar: { flex: 1, paddingVertical: 14, borderRadius: 16, borderWidth: 1, borderColor: '#E2DEC9', alignItems: 'center' },
  btnCancelarText: { fontSize: 15, fontWeight: '700', color: '#8E8A7E' },
  btnCrear: { flex: 1, paddingVertical: 14, borderRadius: 16, backgroundColor: '#355343', alignItems: 'center' },
  btnCrearText: { fontSize: 15, fontWeight: '700', color: '#ffffff' },
});

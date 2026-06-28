import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { listarMedallas, listarUsuarios, otorgarMedalla, resetearPuntos } from '@/lib/admin/api';
import type { Badge, Profile } from '@/lib/types';

const COLORES_MEDALLA = ['#7E9362', '#6289A3', '#D9A74A', '#C86D51'];

function inicial(nombre: string | null): string {
  return nombre?.trim()?.charAt(0)?.toUpperCase() ?? '?';
}

export default function GamificacionScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const [medallas, setMedallas] = useState<Badge[]>([]);
  const [estudiantes, setEstudiantes] = useState<Profile[]>([]);
  const [cargando, setCargando] = useState(true);

  // Modal otorgar medalla
  const [modalMedalla, setModalMedalla] = useState(false);
  const [estudianteSeleccionado, setEstudianteSeleccionado] = useState<Profile | null>(null);
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    let activo = true;
    setCargando(true);
    Promise.all([listarMedallas(), listarUsuarios()])
      .then(([ms, us]) => {
        if (activo) {
          setMedallas(ms);
          setEstudiantes(us.filter((u) => u.role === 'student'));
        }
      })
      .catch((e) => Alert.alert('Error', e instanceof Error ? e.message : 'Error al cargar datos.'))
      .finally(() => { if (activo) setCargando(false); });
    return () => { activo = false; };
  }, []);

  const handleOtorgarMedalla = (medalla: Badge) => {
    if (!estudianteSeleccionado) return;
    Alert.alert(
      'Otorgar medalla',
      `¿Otorgar la medalla "${medalla.name}" a ${estudianteSeleccionado.full_name ?? 'este estudiante'}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Otorgar',
          onPress: async () => {
            setGuardando(true);
            try {
              await otorgarMedalla(estudianteSeleccionado.id, medalla.id);
              setModalMedalla(false);
              setEstudianteSeleccionado(null);
              Alert.alert('¡Listo!', `Medalla "${medalla.name}" otorgada correctamente.`);
            } catch (e) {
              Alert.alert('Error', e instanceof Error ? e.message : 'No se pudo otorgar la medalla.');
            } finally {
              setGuardando(false);
            }
          },
        },
      ]
    );
  };

  const handleResetearPuntos = (estudiante: Profile) => {
    Alert.alert(
      'Resetear puntos',
      `¿Resetear los puntos de ${estudiante.full_name ?? 'este estudiante'}? Esta acción no se puede deshacer.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Resetear',
          style: 'destructive',
          onPress: async () => {
            try {
              await resetearPuntos(estudiante.id);
              setEstudiantes((prev) =>
                prev.map((e) => e.id === estudiante.id ? { ...e, total_points: 0 } : e)
              );
            } catch (e) {
              Alert.alert('Error', e instanceof Error ? e.message : 'No se pudo resetear los puntos.');
            }
          },
        },
      ]
    );
  };

  if (cargando) {
    return (
      <View style={[styles.container, styles.centro, { paddingTop: insets.top }]}>
        <ActivityIndicator size="large" color="#355343" />
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top + 15 }]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>

        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={22} color="#242424" />
          </TouchableOpacity>
          <Text style={styles.titulo}>Gamificación</Text>
        </View>

        {/* Medallas disponibles */}
        <Text style={styles.seccionTitulo}>Medallas</Text>
        <Text style={styles.seccionSubtitulo}>{medallas.length} medallas en el sistema</Text>

        <View style={styles.medallasGrid}>
          {medallas.map((m, i) => (
            <View key={m.id} style={styles.medallaCard}>
              <View style={[styles.medallaCircle, { backgroundColor: COLORES_MEDALLA[i % COLORES_MEDALLA.length] }]}>
                <Ionicons name="star" size={24} color="#ffffff" />
              </View>
              <Text style={styles.medallaNombre} numberOfLines={2}>{m.name}</Text>
              <Text style={styles.medallaDesc}>{m.description}</Text>
              <Text style={styles.medallaReq}>⭐ {m.points_required} pts</Text>
            </View>
          ))}
        </View>

        {/* Estudiantes — otorgar y resetear */}
        <Text style={[styles.seccionTitulo, { marginTop: 24 }]}>Estudiantes</Text>
        <Text style={styles.seccionSubtitulo}>Otorgar medallas o resetear puntos</Text>

        {estudiantes.map((e) => (
          <View key={e.id} style={styles.estudianteCard}>
            <View style={styles.estudianteAvatar}>
              <Text style={styles.estudianteAvatarText}>{inicial(e.full_name)}</Text>
            </View>
            <View style={styles.estudianteInfo}>
              <Text style={styles.estudianteNombre} numberOfLines={1}>{e.full_name ?? 'Sin nombre'}</Text>
              <Text style={styles.estudiantePuntos}>⭐ {e.total_points} pts</Text>
            </View>
            <TouchableOpacity
              style={styles.accionBtn}
              onPress={() => { setEstudianteSeleccionado(e); setModalMedalla(true); }}
            >
              <Ionicons name="medal-outline" size={18} color="#355343" />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.accionBtn, { marginLeft: 6 }]}
              onPress={() => handleResetearPuntos(e)}
            >
              <Ionicons name="refresh-outline" size={18} color="#C86D51" />
            </TouchableOpacity>
          </View>
        ))}

      </ScrollView>

      {/* Modal otorgar medalla */}
      <Modal visible={modalMedalla} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitulo}>
              Otorgar medalla a{'\n'}
              <Text style={styles.modalNombre}>{estudianteSeleccionado?.full_name ?? ''}</Text>
            </Text>
            <FlatList
              data={medallas}
              keyExtractor={(item) => item.id}
              style={{ maxHeight: 340 }}
              renderItem={({ item, index }) => (
                <TouchableOpacity
                  style={styles.medallaOpcion}
                  activeOpacity={0.7}
                  onPress={() => handleOtorgarMedalla(item)}
                  disabled={guardando}
                >
                  <View style={[styles.medallaOpcionCircle, { backgroundColor: COLORES_MEDALLA[index % COLORES_MEDALLA.length] }]}>
                    <Ionicons name="star" size={16} color="#ffffff" />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.medallaOpcionNombre}>{item.name}</Text>
                    <Text style={styles.medallaOpcionDesc}>{item.description}</Text>
                  </View>
                  {guardando
                    ? <ActivityIndicator size="small" color="#355343" />
                    : <Ionicons name="add-circle-outline" size={22} color="#355343" />
                  }
                </TouchableOpacity>
              )}
            />
            <TouchableOpacity
              style={styles.btnCerrar}
              onPress={() => { setModalMedalla(false); setEstudianteSeleccionado(null); }}
            >
              <Text style={styles.btnCerrarText}>Cancelar</Text>
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
  scrollContent: { paddingHorizontal: 24, paddingBottom: 40 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 20 },
  backButton: { width: 40, height: 40, borderRadius: 14, backgroundColor: '#FFFDF9', justifyContent: 'center', alignItems: 'center', elevation: 1 },
  titulo: { fontSize: 26, fontWeight: 'bold', color: '#242424' },
  seccionTitulo: { fontSize: 20, fontWeight: 'bold', color: '#242424', marginBottom: 4 },
  seccionSubtitulo: { fontSize: 13, color: '#8E8A7E', marginBottom: 14 },
  medallasGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  medallaCard: { width: '47%', backgroundColor: '#FFFDF9', borderRadius: 20, padding: 14, alignItems: 'center', elevation: 1 },
  medallaCircle: { width: 52, height: 52, borderRadius: 26, justifyContent: 'center', alignItems: 'center', marginBottom: 8 },
  medallaNombre: { fontSize: 13, fontWeight: 'bold', color: '#242424', textAlign: 'center', marginBottom: 4 },
  medallaDesc: { fontSize: 11, color: '#8E8A7E', textAlign: 'center', lineHeight: 15, marginBottom: 6 },
  medallaReq: { fontSize: 11, fontWeight: '700', color: '#D9A74A' },
  estudianteCard: { backgroundColor: '#FFFDF9', borderRadius: 18, padding: 14, flexDirection: 'row', alignItems: 'center', marginBottom: 10, elevation: 1 },
  estudianteAvatar: { width: 44, height: 44, borderRadius: 14, backgroundColor: '#E2DEC9', justifyContent: 'center', alignItems: 'center' },
  estudianteAvatarText: { fontSize: 18, fontWeight: 'bold', color: '#355343' },
  estudianteInfo: { flex: 1, marginLeft: 12 },
  estudianteNombre: { fontSize: 15, fontWeight: 'bold', color: '#242424' },
  estudiantePuntos: { fontSize: 12, color: '#8E8A7E', marginTop: 2 },
  accionBtn: { width: 36, height: 36, borderRadius: 12, backgroundColor: '#F2EFE6', justifyContent: 'center', alignItems: 'center' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  modalCard: { backgroundColor: '#FFFDF9', borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 24, paddingBottom: 40 },
  modalTitulo: { fontSize: 18, fontWeight: 'bold', color: '#242424', marginBottom: 16, lineHeight: 26 },
  modalNombre: { color: '#355343' },
  medallaOpcion: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#F2EFE6', gap: 12 },
  medallaOpcionCircle: { width: 36, height: 36, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  medallaOpcionNombre: { fontSize: 14, fontWeight: '700', color: '#242424' },
  medallaOpcionDesc: { fontSize: 11, color: '#8E8A7E', marginTop: 1 },
  btnCerrar: { marginTop: 20, paddingVertical: 14, borderRadius: 16, borderWidth: 1, borderColor: '#E2DEC9', alignItems: 'center' },
  btnCerrarText: { fontSize: 15, fontWeight: '700', color: '#8E8A7E' },
});

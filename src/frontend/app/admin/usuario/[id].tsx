import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { cambiarRol, eliminarUsuario, listarUsuarios } from '@/lib/admin/api';
import type { Profile, UserRole } from '@/lib/types';

const ROLES: { valor: UserRole; label: string; descripcion: string; color: string; bgColor: string }[] = [
  { valor: 'student',  label: 'Estudiante', descripcion: 'Accede a quizzes y recursos', color: '#2B4C3F', bgColor: '#E2EDE6' },
  { valor: 'teacher',  label: 'Profesor',   descripcion: 'Crea recursos y quizzes',     color: '#355343', bgColor: '#EBF0EC' },
  { valor: 'admin',    label: 'Admin',      descripcion: 'Acceso total al sistema',     color: '#D9A74A', bgColor: '#FDF4DF' },
];

function inicial(nombre: string | null): string {
  return nombre?.trim()?.charAt(0)?.toUpperCase() ?? '?';
}

export default function DetalleUsuarioScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  const [usuario, setUsuario] = useState<Profile | null>(null);
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    let activo = true;
    setCargando(true);
    listarUsuarios()
      .then((data) => {
        if (activo) {
          const encontrado = data.find((u) => u.id === id) ?? null;
          setUsuario(encontrado);
        }
      })
      .catch((e) => { if (activo) setError(e instanceof Error ? e.message : 'Error al cargar usuario.'); })
      .finally(() => { if (activo) setCargando(false); });
    return () => { activo = false; };
  }, [id]);

  const handleCambiarRol = (nuevoRol: UserRole) => {
    if (!usuario || nuevoRol === usuario.role) return;
    const rolLabel = ROLES.find((r) => r.valor === nuevoRol)?.label ?? nuevoRol;
    Alert.alert(
      'Cambiar rol',
      `¿Cambiar a ${usuario.full_name ?? 'este usuario'} al rol de ${rolLabel}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Confirmar',
          onPress: async () => {
            setGuardando(true);
            try {
              await cambiarRol(usuario.id, nuevoRol);
              setUsuario((prev) => prev ? { ...prev, role: nuevoRol } : prev);
            } catch (e) {
              Alert.alert('Error', e instanceof Error ? e.message : 'No se pudo cambiar el rol.');
            } finally {
              setGuardando(false);
            }
          },
        },
      ]
    );
  };

  const handleEliminar = () => {
    if (!usuario) return;
    Alert.alert(
      'Eliminar usuario',
      `¿Seguro que quieres eliminar a ${usuario.full_name ?? 'este usuario'}? Esta acción no se puede deshacer.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            setGuardando(true);
            try {
              await eliminarUsuario(usuario.id);
              router.back();
            } catch (e) {
              Alert.alert('Error', e instanceof Error ? e.message : 'No se pudo eliminar el usuario.');
              setGuardando(false);
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

  if (error || !usuario) {
    return (
      <View style={[styles.container, styles.centro, { paddingTop: insets.top }]}>
        <Text style={styles.estadoTexto}>{error ?? 'Usuario no encontrado.'}</Text>
      </View>
    );
  }

  const rolActual = ROLES.find((r) => r.valor === usuario.role);

  return (
    <View style={[styles.container, { paddingTop: insets.top + 15 }]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>

        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={22} color="#242424" />
          </TouchableOpacity>
          <Text style={styles.titulo}>Detalle de usuario</Text>
        </View>

        {/* Perfil */}
        <View style={styles.perfilCard}>
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarText}>{inicial(usuario.full_name)}</Text>
          </View>
          <Text style={styles.nombre}>{usuario.full_name ?? 'Sin nombre'}</Text>
          {rolActual && (
            <View style={[styles.rolBadge, { backgroundColor: rolActual.bgColor }]}>
              <Text style={[styles.rolText, { color: rolActual.color }]}>{rolActual.label}</Text>
            </View>
          )}
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statNumero}>{usuario.total_points}</Text>
              <Text style={styles.statLabel}>PUNTOS</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statNumero}>
                {new Date(usuario.created_at).toLocaleDateString('es-CL', { month: 'short', year: 'numeric' })}
              </Text>
              <Text style={styles.statLabel}>MIEMBRO DESDE</Text>
            </View>
          </View>
        </View>

        {/* Cambiar Rol */}
        <Text style={styles.seccionTitulo}>Cambiar rol</Text>
        <Text style={styles.seccionSubtitulo}>El usuario verá los cambios al volver a iniciar sesión</Text>

        {ROLES.map((r) => {
          const esActual = usuario.role === r.valor;
          return (
            <TouchableOpacity
              key={r.valor}
              style={[styles.rolCard, esActual && styles.rolCardActivo]}
              activeOpacity={0.7}
              onPress={() => handleCambiarRol(r.valor)}
              disabled={guardando}
            >
              <View style={[styles.rolIconCircle, { backgroundColor: r.bgColor }]}>
                <Ionicons
                  name={r.valor === 'admin' ? 'shield-checkmark' : r.valor === 'teacher' ? 'school' : 'person'}
                  size={20}
                  color={r.color}
                />
              </View>
              <View style={styles.rolInfo}>
                <Text style={styles.rolCardLabel}>{r.label}</Text>
                <Text style={styles.rolCardDesc}>{r.descripcion}</Text>
              </View>
              {esActual && (
                <View style={styles.checkCircle}>
                  <Ionicons name="checkmark" size={16} color="#ffffff" />
                </View>
              )}
            </TouchableOpacity>
          );
        })}

        {/* Eliminar */}
        <TouchableOpacity
          style={styles.eliminarBtn}
          activeOpacity={0.7}
          onPress={handleEliminar}
          disabled={guardando}
        >
          {guardando ? (
            <ActivityIndicator size="small" color="#C86D51" />
          ) : (
            <>
              <Ionicons name="trash-outline" size={18} color="#C86D51" />
              <Text style={styles.eliminarText}>Eliminar usuario</Text>
            </>
          )}
        </TouchableOpacity>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9F6EE',
  },
  centro: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginBottom: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 14,
    backgroundColor: '#FFFDF9',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 1,
  },
  titulo: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#242424',
  },
  perfilCard: {
    backgroundColor: '#FFFDF9',
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    marginBottom: 24,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
  },
  avatarCircle: {
    width: 72,
    height: 72,
    borderRadius: 24,
    backgroundColor: '#D9A74A',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatarText: {
    fontSize: 30,
    fontWeight: 'bold',
    color: '#2B4C3F',
  },
  nombre: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#242424',
    marginBottom: 8,
  },
  rolBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 10,
    marginBottom: 16,
  },
  rolText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statNumero: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#242424',
  },
  statLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: '#8E8A7E',
    letterSpacing: 0.3,
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 32,
    backgroundColor: '#E2DEC9',
  },
  seccionTitulo: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#242424',
    marginBottom: 4,
  },
  seccionSubtitulo: {
    fontSize: 12,
    color: '#8E8A7E',
    marginBottom: 14,
  },
  rolCard: {
    backgroundColor: '#FFFDF9',
    borderRadius: 18,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    borderWidth: 1.5,
    borderColor: 'transparent',
    elevation: 1,
  },
  rolCardActivo: {
    borderColor: '#355343',
  },
  rolIconCircle: {
    width: 42,
    height: 42,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  rolInfo: {
    flex: 1,
    marginLeft: 12,
  },
  rolCardLabel: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#242424',
  },
  rolCardDesc: {
    fontSize: 12,
    color: '#8E8A7E',
    marginTop: 1,
  },
  checkCircle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#355343',
    justifyContent: 'center',
    alignItems: 'center',
  },
  eliminarBtn: {
    marginTop: 20,
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
  eliminarText: {
    color: '#C86D51',
    fontWeight: 'bold',
    fontSize: 15,
  },
  estadoTexto: {
    fontSize: 15,
    color: '#8E8A7E',
    textAlign: 'center',
    paddingHorizontal: 24,
  },
});

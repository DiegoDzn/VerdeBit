import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { listarUsuarios } from '@/lib/admin/api';
import type { Profile, UserRole } from '@/lib/types';

const FILTROS: { label: string; valor: UserRole | 'todos' }[] = [
  { label: 'Todos', valor: 'todos' },
  { label: 'Profesores', valor: 'teacher' },
  { label: 'Estudiantes', valor: 'student' },
];

const ROL_CONFIG: Record<UserRole, { label: string; color: string; bgColor: string }> = {
  teacher: { label: 'PROFESOR', color: '#355343', bgColor: '#EBF0EC' },
  student: { label: 'ESTUDIANTE', color: '#2B4C3F', bgColor: '#E2EDE6' },
  admin:   { label: 'ADMIN', color: '#D9A74A', bgColor: '#FDF4DF' },
};

function inicial(nombre: string | null): string {
  return nombre?.trim()?.charAt(0)?.toUpperCase() ?? '?';
}

export default function UsuariosScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const [usuarios, setUsuarios] = useState<Profile[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filtro, setFiltro] = useState<UserRole | 'todos'>('todos');

  useEffect(() => {
    let activo = true;
    setCargando(true);
    listarUsuarios()
      .then((data) => { if (activo) setUsuarios(data); })
      .catch((e) => { if (activo) setError(e instanceof Error ? e.message : 'Error al cargar usuarios.'); })
      .finally(() => { if (activo) setCargando(false); });
    return () => { activo = false; };
  }, []);

  const datosFiltrados = useMemo(() => {
    if (filtro === 'todos') return usuarios;
    return usuarios.filter((u) => u.role === filtro);
  }, [usuarios, filtro]);

  const renderItem = ({ item }: { item: Profile }) => {
    const config = ROL_CONFIG[item.role];
    return (
      <TouchableOpacity
        style={styles.card}
        activeOpacity={0.7}
        onPress={() => router.push({ pathname: '/admin/usuario/[id]', params: { id: item.id } })}
      >
        <View style={styles.avatarCircle}>
          <Text style={styles.avatarText}>{inicial(item.full_name)}</Text>
        </View>
        <View style={styles.infoContainer}>
          <Text style={styles.nombreText} numberOfLines={1}>
            {item.full_name ?? 'Sin nombre'}
          </Text>
          <View style={[styles.rolBadge, { backgroundColor: config.bgColor }]}>
            <Text style={[styles.rolText, { color: config.color }]}>{config.label}</Text>
          </View>
        </View>
        <View style={styles.puntosContainer}>
          <Text style={styles.puntosNumero}>{item.total_points}</Text>
          <Text style={styles.puntosLabel}>pts</Text>
        </View>
        <Ionicons name="chevron-forward" size={18} color="#8E8A7E" />
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top + 15 }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={22} color="#242424" />
        </TouchableOpacity>
        <View>
          <Text style={styles.titulo}>Usuarios</Text>
          <Text style={styles.subtitulo}>{usuarios.length} registrados</Text>
        </View>
      </View>

      {/* Filtros */}
      <View style={styles.filtrosWrapper}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filtrosContainer}>
          {FILTROS.map((f) => {
            const activo = filtro === f.valor;
            return (
              <TouchableOpacity
                key={f.valor}
                onPress={() => setFiltro(f.valor)}
                style={[styles.filtroBtn, activo ? styles.filtroBtnActivo : styles.filtroBtnInactivo]}
              >
                <Text style={[styles.filtroText, activo ? styles.filtroTextActivo : styles.filtroTextInactivo]}>
                  {f.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
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
          data={datosFiltrados}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.listaContainer}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.estadoVacio}>
              <Text style={styles.estadoTexto}>No hay usuarios en esta categoría.</Text>
            </View>
          }
        />
      )}

      {/* FAB para crear usuario */}
      <TouchableOpacity
        style={styles.fab}
        activeOpacity={0.8}
        onPress={() => router.push('/admin/usuario/crear')}
      >
        <Ionicons name="add" size={24} color="#ffffff" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9F6EE',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    marginBottom: 16,
    gap: 14,
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
    fontSize: 26,
    fontWeight: 'bold',
    color: '#242424',
  },
  subtitulo: {
    fontSize: 13,
    color: '#8E8A7E',
    marginTop: 1,
  },
  filtrosWrapper: {
    height: 48,
    marginBottom: 12,
    marginLeft: -24,
    marginRight: -24,
    paddingLeft: 24,
  },
  filtrosContainer: {
    paddingHorizontal: 24,
    alignItems: 'center',
    gap: 10,
  },
  filtroBtn: {
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  filtroBtnActivo: {
    backgroundColor: '#355343',
    borderColor: '#355343',
  },
  filtroBtnInactivo: {
    backgroundColor: '#FFFDF9',
    borderColor: '#E2DEC9',
  },
  filtroText: {
    fontSize: 13,
    fontWeight: '600',
  },
  filtroTextActivo: {
    color: '#ffffff',
  },
  filtroTextInactivo: {
    color: '#242424',
  },
  listaContainer: {
    paddingHorizontal: 24,
    paddingBottom: 30,
    gap: 10,
  },
  card: {
    backgroundColor: '#FFFDF9',
    borderRadius: 20,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
  },
  avatarCircle: {
    width: 46,
    height: 46,
    borderRadius: 16,
    backgroundColor: '#E2DEC9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#355343',
  },
  infoContainer: {
    flex: 1,
    marginLeft: 12,
    gap: 4,
  },
  nombreText: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#242424',
  },
  rolBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  rolText: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  puntosContainer: {
    alignItems: 'center',
    marginRight: 8,
  },
  puntosNumero: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#242424',
  },
  puntosLabel: {
    fontSize: 9,
    color: '#8E8A7E',
    fontWeight: '700',
  },
  estadoVacio: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  estadoTexto: {
    fontSize: 15,
    color: '#8E8A7E',
    textAlign: 'center',
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#355343',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
  },
});

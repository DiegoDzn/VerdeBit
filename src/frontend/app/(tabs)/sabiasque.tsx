import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { listDidYouKnow } from '@/lib/contenido/api';
import type { DidYouKnow } from '@/lib/types';

const COLORES_PALETA = ['#dfae4b', '#c96f43', '#7b9c53', '#3e6b52', '#9e3d3d'];
const ICONOS_PALETA = ['leaf-outline', 'water-outline', 'star-outline', 'leaf-outline', 'sunny-outline'];

export default function SabiasQueScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [datos, setDatos] = useState<DidYouKnow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      const data = await listDidYouKnow();
      setDatos(data);
    } catch (error) {
      console.error('Error al cargar datos de Supabase:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View style={styles.headerContainer}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButtonSquare}>
          <Ionicons name="chevron-back" size={20} color="#242424" />
        </TouchableOpacity>
        <View style={styles.titleContainer}>
          <Text style={styles.headerTitle}>¿Sabías que...?</Text>
          <Text style={styles.headerSubtitle}>Aprende algo nuevo del humedal</Text>
        </View>
      </View>

      {/* Loading */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3e6b52" />
        </View>
      ) : (
        // Datos desde Supabase
        <FlatList
          data={datos}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          renderItem={({ item, index }) => {
            // Asignación de estilos dinámicos por posición en la lista
            const colorActual = COLORES_PALETA[index % COLORES_PALETA.length];
            const iconoActual = ICONOS_PALETA[index % ICONOS_PALETA.length];
            const numeroDato = `DATO ${String(index + 1).padStart(2, '0')}`;

            return (
              <View style={[styles.card, { backgroundColor: colorActual }]}>
                {/* Marca de agua decorativa */}
                <View style={styles.iconBackground}>
                  <Ionicons name={iconoActual as any} size={110} color="rgba(255, 255, 255, 0.12)" />
                </View>

                <Text style={styles.cardLabel}>{numeroDato}</Text>
                <Text style={styles.cardContent} numberOfLines={3} ellipsizeMode="tail">
                  {item.content}
                </Text>
              </View>
            );
          }}
        />
      )}
    </View>
  );
}

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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    paddingHorizontal: 24,
    paddingBottom: 40,
    gap: 14,
  },
  card: {
    borderRadius: 24,
    paddingVertical: 22,
    paddingHorizontal: 24,
    minHeight: 115,
    justifyContent: 'center',
    position: 'relative',
    overflow: 'hidden',
    borderBottomWidth: 4,
    borderBottomColor: 'rgba(0, 0, 0, 0.15)',
  },
  iconBackground: {
    position: 'absolute',
    right: -15,
    bottom: -20,
  },
  cardLabel: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#ffffff',
    opacity: 0.7,
    letterSpacing: 1,
    marginBottom: 6,
    textTransform: 'uppercase',
  },
  cardContent: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#ffffff',
    lineHeight: 23,
  },
});
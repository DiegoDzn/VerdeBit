import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
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

import { listMapucheContent } from '@/lib/contenido/api';
import type { MapucheContent } from '@/lib/types';

const COLORES_PALETA = ['#8C4F2B', '#A0522D', '#6B3A2A', '#5C4033', '#3E2723'];
const ICONOS_PALETA = ['leaf-outline', 'water-outline', 'star-outline', 'moon-outline', 'sunny-outline'];

export default function CulturaMapucheScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [datos, setDatos] = useState<MapucheContent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      const data = await listMapucheContent();
      setDatos(data);
    } catch (error) {
      console.error('Error al cargar contenido mapuche:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" />

      <View style={styles.headerContainer}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButtonSquare}>
          <Ionicons name="chevron-back" size={20} color="#242424" />
        </TouchableOpacity>
        <View style={styles.titleContainer}>
          <Text style={styles.headerTitle}>Cultura Mapuche</Text>
          <Text style={styles.headerSubtitle}>Sabiduría ancestral del territorio</Text>
        </View>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#8C4F2B" />
        </View>
      ) : (
        <FlatList
          data={datos}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="book-outline" size={48} color="#7e7568" />
              <Text style={styles.emptyText}>No hay contenido cultural disponible</Text>
            </View>
          }
          renderItem={({ item, index }) => {
            const colorActual = COLORES_PALETA[index % COLORES_PALETA.length];
            const iconoActual = ICONOS_PALETA[index % ICONOS_PALETA.length];
            const numeroContenido = `KIMÜN ${String(index + 1).padStart(2, '0')}`;

            return (
              <View style={[styles.card, { backgroundColor: colorActual }]}>
                <View style={styles.iconBackground}>
                  <Ionicons name={iconoActual as any} size={110} color="rgba(255, 255, 255, 0.12)" />
                </View>

                {item.category && (
                  <View style={styles.categoryBadge}>
                    <Text style={styles.categoryText}>{item.category.toUpperCase()}</Text>
                  </View>
                )}

                <Text style={styles.cardLabel}>{numeroContenido}</Text>
                <Text style={styles.cardTitle}>{item.title}</Text>
                <Text style={styles.cardContent}>{item.content}</Text>

                {item.audio_url && (
                  <View style={styles.audioRow}>
                    <Ionicons name="musical-notes" size={16} color="rgba(255,255,255,0.8)" />
                    <Text style={styles.audioText}>Audio disponible</Text>
                  </View>
                )}
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
  card: {
    borderRadius: 24,
    paddingVertical: 22,
    paddingHorizontal: 24,
    minHeight: 130,
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
  categoryBadge: {
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  categoryText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#ffffff',
    letterSpacing: 0.5,
    opacity: 0.8,
  },
  cardLabel: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#ffffff',
    opacity: 0.7,
    letterSpacing: 1,
    marginBottom: 4,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 8,
  },
  cardContent: {
    fontSize: 15,
    color: '#ffffff',
    lineHeight: 22,
    opacity: 0.92,
  },
  audioRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 12,
  },
  audioText: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '600',
  },
});

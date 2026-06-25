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
  View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useAuth } from '@/lib/auth/AuthContext';
import { listResources } from '@/lib/recursos/api';
import type { EducationalResource } from '@/lib/types';

const CATEGORIAS = ['Todos', 'PDF', 'Enlace', 'Video', 'Imagen', 'Texto'];

const TYPE_MAP: Record<string, string> = {
  'pdf': 'PDF',
  'link': 'Enlace',
  'video': 'Video',
  'image': 'Imagen',
  'text': 'Texto',
};

export default function AulaScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState('Todos');
  const [recursos, setRecursos] = useState<EducationalResource[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { role } = useAuth();
  const esProfesor = role === 'teacher';

  useEffect(() => {
    let activo = true;
    setCargando(true);
    setError(null);
    listResources()
      .then((data) => {
        if (activo) setRecursos(data);
      })
      .catch((e) => {
        if (activo) setError(e instanceof Error ? e.message : 'No se pudo cargar los recursos.');
      })
      .finally(() => {
        if (activo) setCargando(false);
      });
    return () => {
      activo = false;
    };
  }, []);

  // Filtrado por categoría
  const datosFiltrados = useMemo(() => {
    if (categoriaSeleccionada === 'Todos') return recursos;
    const categoria = Object.keys(TYPE_MAP).find(
      (key) => TYPE_MAP[key] === categoriaSeleccionada
    );
    return recursos.filter((item) => item.resource_type === categoria);
  }, [recursos, categoriaSeleccionada]);

  // Configuración visual por tipo de recurso
  const getTipoConfig = (tipo: string) => {
    switch (tipo) {
      case 'pdf':
        return { icon: 'document-text' as const, bgColor: '#C86D51', textColor: '#C86D51' };
      case 'link':
        return { icon: 'link' as const, bgColor: '#3E5C4E', textColor: '#3E5C4E' };
      case 'image':
        return { icon: 'image' as const, bgColor: '#7B8E55', textColor: '#7B8E55' };
      case 'video':
        return { icon: 'videocam' as const, bgColor: '#A0522D', textColor: '#A0522D' };
      case 'text':
        return { icon: 'reader' as const, bgColor: '#556B72', textColor: '#556B72' };
      default:
        return { icon: 'document' as const, bgColor: '#999', textColor: '#999' };
    }
  };

  const renderItem = ({ item }: { item: EducationalResource }) => {
    const config = getTipoConfig(item.resource_type);
    const fecha = new Date(item.created_at);
    const hoy = new Date();
    const diffTime = Math.abs(hoy.getTime() - fecha.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    let tiempoText = 'Hace poco';
    if (diffDays === 0) tiempoText = 'Hoy';
    else if (diffDays === 1) tiempoText = 'Hace 1 día';
    else if (diffDays < 7) tiempoText = `Hace ${diffDays} días`;
    else if (diffDays < 30) tiempoText = `Hace ${Math.floor(diffDays / 7)} semana${Math.floor(diffDays / 7) > 1 ? 's' : ''}`;
    else tiempoText = `Hace ${Math.floor(diffDays / 30)} mes${Math.floor(diffDays / 30) > 1 ? 'es' : ''}`;

    return (
      <TouchableOpacity style={styles.card} activeOpacity={0.7}>
        <View style={[styles.iconContainer, { backgroundColor: config.bgColor }]}>
          <Ionicons name={config.icon} size={24} color="#FFFFFF" />
        </View>
        <View style={styles.infoContainer}>
          <Text style={[styles.tipoText, { color: config.textColor }]}>{TYPE_MAP[item.resource_type]}</Text>
          <Text style={styles.tituloText} numberOfLines={2}>{item.title}</Text>
          <Text style={styles.autorText}>{item.subject_area || 'General'} • {tiempoText}</Text>
        </View>
        <View style={styles.arrowContainer}>
          <Ionicons name="chevron-forward" size={20} color="#666666" />
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top + 15 }]}>
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
          contentContainerStyle={[styles.listContainer, { paddingBottom: esProfesor ? 120 : 30 }]}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={
            <>
              {/* Encabezado */}
              <View style={styles.headerSection}>
                <Text style={styles.mainTitle}>Aula Virtual</Text>
                <Text style={styles.subtitle}>Recursos de tus profesores</Text>
              </View>

              {/* Selector de Categorías */}
              <View style={styles.categoriesWrapper}>
                <ScrollView 
                  horizontal 
                  showsHorizontalScrollIndicator={false} 
                  contentContainerStyle={styles.categoriesContainer}
                >
                  {CATEGORIAS.map((cat) => {
                    const isActive = categoriaSeleccionada === cat;
                    return (
                      <TouchableOpacity
                        key={cat}
                        onPress={() => setCategoriaSeleccionada(cat)}
                        style={[
                          styles.categoryButton,
                          isActive ? styles.categoryButtonActive : styles.categoryButtonInactive
                        ]}
                      >
                        <Text style={[
                          styles.categoryText,
                          isActive ? styles.categoryTextActive : styles.categoryTextInactive
                        ]}>
                          {cat}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
              </View>
            </>
          }
          ListEmptyComponent={
            <View style={styles.estadoVacio}>
              <Text style={styles.estadoTexto}>No hay recursos disponibles.</Text>
            </View>
          }
        />
      )}

      {/* --- BOTÓN FLOTANTE CREAR RECURSO (Solo Profesor) --- */}
      {esProfesor && (
        <TouchableOpacity 
          style={[styles.fabButton, { bottom: insets.bottom + 20 }]} 
          activeOpacity={0.8}
          onPress={() => router.push('/professor/resource/create')}
        >
          <Ionicons name="add" size={24} color="#ffffff" />
          <Text style={styles.fabText}>Subir archivo</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fbf4e6', // Fondo crema unificado
  },
  headerSection: {
    marginBottom: 20,
  },
  mainTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#242424',
  },
  subtitle: {
    fontSize: 15,
    color: '#7e7568',
    marginTop: 2,
  },
  categoriesWrapper: {
    height: 50,
    marginBottom: 15,
    marginLeft: -24, // Compensa el padding de la lista para scroll infinito horizontal
    marginRight: -24,
  },
  categoriesContainer: {
    paddingHorizontal: 24,
    alignItems: 'center',
    gap: 10,
  },
  categoryButton: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoryButtonActive: {
    backgroundColor: '#355343', // Verde institucional de tus botones primarios
    borderColor: '#355343',
  },
  categoryButtonInactive: {
    backgroundColor: '#FFFFFF',
    borderColor: '#edece7',
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '600',
  },
  categoryTextActive: {
    color: '#FFFFFF',
  },
  categoryTextInactive: {
    color: '#242424',
  },
  listContainer: {
    paddingHorizontal: 24,
    gap: 14,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 24,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.02,
    shadowRadius: 8,
    elevation: 2,
  },
  iconContainer: {
    width: 52,
    height: 52,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoContainer: {
    flex: 1,
    marginLeft: 16,
    marginRight: 8,
  },
  tipoText: {
    fontSize: 11,
    fontWeight: 'bold',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  tituloText: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#242424',
    lineHeight: 20,
    marginBottom: 4,
  },
  autorText: {
    fontSize: 12,
    color: '#7e7568',
  },
  arrowContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  estadoVacio: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  estadoTexto: {
    fontSize: 15,
    color: '#7e7568',
    textAlign: 'center',
  },
  // --- FAB REUTILIZADO ---
  fabButton: {
    position: 'absolute',
    right: 24,
    backgroundColor: '#355343',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 6,
  },
  fabText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 15,
    marginLeft: 6,
  },
});
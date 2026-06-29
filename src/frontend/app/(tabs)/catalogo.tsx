import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router'; 

import { listSpecies } from '@/lib/catalogo/api';
import type { Species, SpeciesKind } from '@/lib/types';

const CATEGORIAS = ['Todos', 'Flora', 'Fauna'];
const COLORES_TARJETA = ['#a67c5d', '#6a97b4', '#6d8c60', '#768d56'];

const KIND_POR_CATEGORIA: Record<string, SpeciesKind | undefined> = {
  Todos: undefined,
  Flora: 'flora',
  Fauna: 'fauna',
};

export default function CatalogoScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter(); 
  const [categoriaActiva, setCategoriaActiva] = useState('Todos');
  const [busqueda, setBusqueda] = useState('');
  const [especies, setEspecies] = useState<Species[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let activo = true;
    setCargando(true);
    setError(null);
    listSpecies(KIND_POR_CATEGORIA[categoriaActiva])
      .then((data) => {
        if (activo) setEspecies(data);
      })
      .catch((e) => {
        if (activo) setError(e instanceof Error ? e.message : 'No se pudo cargar el catálogo.');
      })
      .finally(() => {
        if (activo) setCargando(false);
      });
    return () => {
      activo = false;
    };
  }, [categoriaActiva]);

  const especiesFiltradas = useMemo(() => {
    const q = busqueda.trim().toLowerCase();
    if (!q) return especies;
    return especies.filter(
      (e) =>
        e.common_name.toLowerCase().includes(q) ||
        e.scientific_name.toLowerCase().includes(q),
    );
  }, [especies, busqueda]);

  return (
    <View style={[styles.container, { paddingTop: insets.top + 10 }]}>
      
      {/* --- HEADER --- */}
      <View style={styles.header}>
        <Text style={styles.title}>Catálogo</Text>
        <Text style={styles.subtitle}>Flora y fauna del humedal</Text>
      </View>

      {/* --- BUSCADOR --- */}
      <View style={styles.searchContainer}>
        <Ionicons name="search-outline" size={20} color="#7e7568" style={styles.searchIcon} />
        <TextInput
          placeholder="Buscar especie..."
          placeholderTextColor="#a1998e"
          style={styles.searchInput}
          value={busqueda}
          onChangeText={setBusqueda}
        />
      </View>

      {/* --- FILTROS DE CATEGORÍAS --- */}
      <View style={styles.categoriesContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriesScroll}
        >
          {CATEGORIAS.map((cat) => {
            const isActive = categoriaActiva === cat;
            return (
              <TouchableOpacity
                key={cat}
                onPress={() => setCategoriaActiva(cat)}
                style={[styles.catButton, isActive ? styles.catButtonActive : styles.catButtonInactive]}
              >
                <Text style={[styles.catText, isActive ? styles.catTextActive : styles.catTextInactive]}>
                  {cat}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

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
          data={especiesFiltradas}
          keyExtractor={(item) => item.id}
          numColumns={2}
          columnWrapperStyle={styles.gridRow}
          contentContainerStyle={styles.gridContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.estadoVacio}>
              <Text style={styles.estadoTexto}>No hay especies para mostrar.</Text>
            </View>
          }
          renderItem={({ item, index }) => (
            <TouchableOpacity 
              style={styles.card}
              activeOpacity={0.7}
              onPress={() => {
                router.push({
                  pathname: '/catalogoinfo',
                  params: { id: item.id, name: item.common_name }
                });
              }}
            >
              <View style={[styles.imageContainer, { backgroundColor: COLORES_TARJETA[index % COLORES_TARJETA.length] }]}>
                <View style={styles.typeBadge}>
                  <Text style={styles.typeBadgeText}>{item.kind === 'flora' ? 'Flora' : 'Fauna'}</Text>
                </View>

                {item.image_url ? (
                  <Image
                    source={{ uri: item.image_url }}
                    style={styles.speciesImage}
                    resizeMode="cover"
                  />
                ) : (
                  <View style={styles.photoPlaceholder}>
                    <Text style={styles.photoPlaceholderText}>
                      {item.kind === 'flora' ? '🌿' : '🦜'}
                    </Text>
                  </View>
                )}
              </View>

              <View style={styles.infoContainer}>
                <Text style={styles.speciesName}>{item.common_name}</Text>
                <Text style={styles.scientificName}>{item.scientific_name}</Text>
              </View>
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fbf4e6',
  },
  header: {
    paddingHorizontal: 24,
    marginBottom: 16,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#242424',
  },
  subtitle: {
    fontSize: 16,
    color: '#7e7568',
    marginTop: 2,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fffdf9',
    marginHorizontal: 24,
    borderWidth: 1,
    borderColor: '#ebdcc5',
    borderRadius: 20,
    paddingHorizontal: 16,
    height: 54,
    marginBottom: 20,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#242424',
  },
  categoriesContainer: {
    marginBottom: 20,
  },
  categoriesScroll: {
    paddingHorizontal: 24,
    gap: 8,
  },
  catButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
  },
  catButtonActive: {
    backgroundColor: '#355343',
    borderColor: '#355343',
  },
  catButtonInactive: {
    backgroundColor: '#ffffff',
    borderColor: '#ebdcc5',
  },
  catText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  catTextActive: {
    color: '#ffffff',
  },
  catTextInactive: {
    color: '#242424',
  },
  // Grilla de tarjetas
  gridContent: {
    paddingHorizontal: 16,
    paddingBottom: 100,
  },
  gridRow: {
    justifyContent: 'space-between',
    paddingHorizontal: 8,
  },
  card: {
    backgroundColor: '#ffffff',
    width: '47%',
    borderRadius: 24,
    padding: 10,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.02,
    shadowRadius: 8,
    elevation: 2,
  },
  imageContainer: {
    height: 140,
    borderRadius: 18,
    overflow: 'hidden',
    padding: 10,
    justifyContent: 'space-between',
  },
  typeBadge: {
    backgroundColor: '#ffffff',
    alignSelf: 'flex-end',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    zIndex: 1,
  },
  typeBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#242424',
  },
  // Imagen real
  speciesImage: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  // Fallback sin imagen
  photoPlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  photoPlaceholderText: {
    fontSize: 36,
  },
  infoContainer: {
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  speciesName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#242424',
  },
  scientificName: {
    fontSize: 12,
    fontStyle: 'italic',
    color: '#7e7568',
    marginTop: 2,
  },
  estadoVacio: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 60,
    paddingHorizontal: 24,
  },
  estadoTexto: {
    fontSize: 15,
    color: '#7e7568',
    textAlign: 'center',
  },
});

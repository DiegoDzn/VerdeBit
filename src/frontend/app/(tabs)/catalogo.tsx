import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
  FlatList,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// Categorías del mockup
const CATEGORIAS = ['Todos', 'Flora', 'Fauna', 'Aves', 'Anfibios'];

// Datos de las especies con los colores de fondo del mockup
const ESPECIES_MOCK = [
  {
    id: '1',
    nombre: 'Pidén',
    cientifico: 'Pardirallus sanguinolentus',
    tipo: 'Ave',
    colorBg: '#a67c5d', // Café arcilla
  },
  {
    id: '2',
    nombre: 'Pato Jergón',
    cientifico: 'Anas georgica',
    tipo: 'Ave',
    colorBg: '#6a97b4', // Azul grisáceo
  },
  {
    id: '3',
    nombre: 'Totora',
    cientifico: 'Schoenoplectus californicus',
    tipo: 'Planta',
    colorBg: '#6d8c60', // Verde musgo
  },
  {
    id: '4',
    nombre: 'Ranita de Darwin',
    cientifico: 'Rhinoderma darwinii',
    tipo: 'Anfibio',
    colorBg: '#768d56', // Verde oliva
  },
];

export default function CatalogoScreen() {
  const insets = useSafeAreaInsets();
  const [categoriaActiva, setCategoriaActiva] = useState('Todos');

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
        />
      </View>

      {/* --- FILTROS DE CATEGORÍAS (Horizontal) --- */}
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

      {/* --- GRILLA DE ESPECIES (2 Columnas) --- */}
      <FlatList
        data={ESPECIES_MOCK}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={styles.gridRow}
        contentContainerStyle={styles.gridContent}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <View style={styles.card}>
            {/* Contenedor de la Foto simulada */}
            <View style={[styles.imageContainer, { backgroundColor: item.colorBg }]}>
              {/* Badge del Tipo */}
              <View style={styles.typeBadge}>
                <Text style={styles.typeBadgeText}>{item.tipo}</Text>
              </View>
              
              {/* Marcador de posición de foto */}
              <View style={styles.photoPlaceholder}>
                <Text style={styles.photoPlaceholderText}>foto {item.nombre.toLowerCase()}</Text>
              </View>
            </View>

            {/* Textos Informativos */}
            <View style={styles.infoContainer}>
              <Text style={styles.speciesName}>{item.nombre}</Text>
              <Text style={styles.scientificName}>{item.cientifico}</Text>
            </View>
          </View>
        )}
      />

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fbf4e6', // Fondo crema de tu app
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
  // Buscador
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
  // Categorías
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
    backgroundColor: '#355343', // Verde bosque activo
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
    width: '47%', // Permite que quepan dos por fila perfectamente
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
    padding: 10,
    justifyContent: 'space-between',
  },
  typeBadge: {
    backgroundColor: '#ffffff',
    alignSelf: 'flex-end',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  typeBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#242424',
  },
  photoPlaceholder: {
    backgroundColor: 'rgba(255, 255, 255, 0.75)',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  photoPlaceholderText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#242424',
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
});
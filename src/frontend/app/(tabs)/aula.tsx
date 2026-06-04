import { Ionicons } from '@expo/vector-icons';
import { useGlobalSearchParams } from 'expo-router';
import React, { useState } from 'react';
import {
  FlatList,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// --- DATA MOCK ---
interface Recurso {
  id: string;
  tipo: 'PDF' | 'ENLACE' | 'IMAGEN';
  titulo: string;
  autor: string;
  hace: string;
}

const DATOS_RECURSOS: Recurso[] = [
  { id: '1', tipo: 'PDF', titulo: 'Guía de aves del humedal Vegas de Chivilcán', autor: 'Prof. Marcela Pérez', hace: 'Hace 2 días' },
  { id: '2', tipo: 'ENLACE', titulo: '¿Cómo se forma un humedal?', autor: 'Prof. Diego Salgado', hace: 'Hace 4 días' },
  { id: '3', tipo: 'IMAGEN', titulo: 'Fotos de la última salida a terreno', autor: 'Prof. Camila Huenchupán', hace: 'Hace 1 semana' },
  { id: '4', tipo: 'PDF', titulo: 'Cuaderno de campo para imprimir', autor: 'Prof. Marcela Pérez', hace: 'Hace 1 semana' },
];

const CATEGORIAS = ['Todos', 'PDF', 'Imagen', 'Enlace'];

export default function AulaScreen() {
  const insets = useSafeAreaInsets();
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState('Todos');

  // Captura del rol global persistente
  const { rol } = useGlobalSearchParams<{ rol: 'estudiante' | 'profesor' }>();
  const userRol = rol || 'estudiante';

  // Filtrado por categoría
  const datosFiltrados = DATOS_RECURSOS.filter((item) => {
    if (categoriaSeleccionada === 'Todos') return true;
    return item.tipo.toLowerCase() === categoriaSeleccionada.toLowerCase();
  });

  // Configuración visual por tipo de recurso
  const getTipoConfig = (tipo: 'PDF' | 'ENLACE' | 'IMAGEN') => {
    switch (tipo) {
      case 'PDF':
        return { icon: 'document-text' as const, bgColor: '#C86D51', textColor: '#C86D51' };
      case 'ENLACE':
        return { icon: 'link' as const, bgColor: '#3E5C4E', textColor: '#3E5C4E' };
      case 'IMAGEN':
        return { icon: 'image' as const, bgColor: '#7B8E55', textColor: '#7B8E55' };
    }
  };

  const renderItem = ({ item }: { item: Recurso }) => {
    const config = getTipoConfig(item.tipo);
    return (
      <TouchableOpacity style={styles.card} activeOpacity={0.7}>
        <View style={[styles.iconContainer, { backgroundColor: config.bgColor }]}>
          <Ionicons name={config.icon} size={24} color="#FFFFFF" />
        </View>
        <View style={styles.infoContainer}>
          <Text style={[styles.tipoText, { color: config.textColor }]}>{item.tipo}</Text>
          <Text style={styles.tituloText} numberOfLines={2}>{item.titulo}</Text>
          <Text style={styles.autorText}>{item.autor} • {item.hace}</Text>
        </View>
        <View style={styles.arrowContainer}>
          <Ionicons name="chevron-forward" size={20} color="#666666" />
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top + 15 }]}>
      {/* Lista Principal */}
      <FlatList
        data={datosFiltrados}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={[styles.listContainer, { paddingBottom: userRol === 'profesor' ? 120 : 30 }]}
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
      />

      {/* --- BOTÓN FLOTANTE SUBIR ARCHIVO (Solo Profesor) --- */}
      {userRol === 'profesor' && (
        <TouchableOpacity style={[styles.fabButton, { bottom: insets.bottom + 20 }]} activeOpacity={0.8}>
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
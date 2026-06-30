import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Image, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { getSpecies } from '@/lib/catalogo/api'; 
import type { Species } from '@/lib/types';

export default function CatalogoinfoScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  
  const { id } = useLocalSearchParams<{ id: string }>();
  
  const [especie, setEspecie] = useState<Species | null>(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    if (!id) return;
    setCargando(true);
    getSpecies(id)
      .then((data) => {
        setEspecie(data);
      })
      .catch((err) => console.log(err))
      .finally(() => setCargando(false));
  }, [id]);

  if (cargando) {
    return (
      <View style={styles.centrado}>
        <ActivityIndicator size="large" color="#355343" />
      </View>
    );
  }

  if (!especie) {
    return (
      <View style={styles.centrado}>
        <Text>No se encontró la información de la especie.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>

      <View style={styles.imageWrapper}>

        <TouchableOpacity 
          onPress={() => router.push('/(tabs)/catalogo')} 
          style={[styles.backButtonSquare, { top: insets.top + 12 }]}
        >
          <Ionicons name="chevron-back" size={20} color="#242424" />
        </TouchableOpacity>

        <View style={styles.imageContainer}>
          {especie.image_url ? (
            <Image source={{ uri: especie.image_url }} style={styles.imagen} />
          ) : (
            <Text style={{ fontSize: 64 }}>{especie.kind === 'flora' ? '🌿' : '🦜'}</Text>
          )}
        </View>
      </View>

      {/* --- CONTENEDOR DE INFORMACIÓN --- */}
      <View style={styles.infoContainer}>
        <Text style={styles.tipo}>{especie.kind.toUpperCase()}</Text>
        <Text style={styles.nombreComun}>{especie.common_name}</Text>
        <Text style={styles.nombreCientifico}>{especie.scientific_name}</Text>
        
        <View style={styles.divider} />
        
        <Text style={styles.seccionTitulo}>Descripción</Text>
        <Text style={styles.descripcion}>{especie.description}</Text>

        {especie.habitat && (
          <>
            <Text style={styles.seccionTitulo}>Hábitat</Text>
            <Text style={styles.descripcion}>{especie.habitat}</Text>
          </>
        )}

        {especie.conservation_status && (
          <>
            <Text style={styles.seccionTitulo}>Estado de Conservación</Text>
            <Text style={styles.descripcion}>{especie.conservation_status}</Text>
          </>
        )}

        {especie.mapuche_name && (
          <>
            <Text style={styles.seccionTitulo}>Nombre Mapuche</Text>
            <Text style={styles.descripcion}>{especie.mapuche_name}</Text>
          </>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fbf4e6', 
  },
  imageWrapper: {
    position: 'relative',
    width: '100%',
    height: 300,
  },
  backButtonSquare: {
    position: 'absolute',
    left: 20,
    zIndex: 10,
    width: 45,
    height: 45,
    backgroundColor: '#ffffff', 
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 5,
  },
  imageContainer: {
    width: '100%',
    height: '100%',
    backgroundColor: '#ebdcc5', 
    justifyContent: 'center',
    alignItems: 'center',
  },
  imagen: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  infoContainer: {
    flex: 1,
    backgroundColor: '#fbf4e6', 
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    marginTop: -30, 
    padding: 24,
  },
  centrado: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fbf4e6',
  },
  tipo: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#355343',
    letterSpacing: 1,
  },
  nombreComun: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#242424',
    marginTop: 4,
  },
  nombreCientifico: {
    fontSize: 16,
    fontStyle: 'italic',
    color: '#7e7568',
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: '#ebdcc5', 
    marginVertical: 20,
  },
  seccionTitulo: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#242424',
    marginBottom: 8,
  },
  descripcion: {
    fontSize: 15,
    color: '#555451',
    lineHeight: 22,
  },
});
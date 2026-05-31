import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

export default function InicioScreen() {
  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.welcomeContainer}>
          <Text style={styles.greetingText}>¡Hola!</Text>
          
          <Text style={styles.subTitleText}>Escuela Monteverde</Text>
          
         
          <Text style={styles.questionText}>¿Qué quieres hacer hoy?</Text>
        </View>

        
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  scrollContent: {
    paddingTop: 20, // Un margen pequeño ya que el Header de arriba ya cubre el notch
    paddingHorizontal: 24,
    paddingBottom: 100, // Espacio para que la barra de pestañas de abajo no tape nada
  },
  welcomeContainer: {
    marginBottom: 25,
  },
  greetingText: {
    fontSize: 32,
    fontWeight: 'bold', // Negrita fuerte
    color: '#1a1a1a',
  },
  subTitleText: {
    fontSize: 20,
    fontWeight: '300', // Estilo de subtítulo
    color: '#000000', // El verde de tu app
    marginTop: 2,
  },
  questionText: {
    fontSize: 25,
    color: '#000000',
    marginTop: 6,
    
    fontWeight: '400',
  },
  contentDummy: {
    marginTop: 10,
    height: 250,
    backgroundColor: '#f9f9f9',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderStyle: 'dashed',
    borderWidth: 1,
    borderColor: '#ccc',
  },
  placeholderText: {
    color: '#999999',
  },
});
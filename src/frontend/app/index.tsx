import { useRouter } from 'expo-router';
import React from 'react';
import { StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function WelcomeScreen() {
  const router = useRouter();

  const handleIniciar = () => {
    router.push('/login');
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* --- CÍRCULOS DECORATIVOS DE FONDO --- */}
      <View style={styles.topCircle}>
        <Text style={styles.sunEmoji}>☀️</Text> 
      </View>
      <View style={styles.bottomCircle} />

      {/* --- CONTENIDO PRINCIPAL --- */}
      <View style={styles.contentContainer}>
        
        {/* Contenedor Superior: Logo e Info */}
        <View style={styles.topSection}>
          <View style={styles.logoContainer}>
            <Text style={styles.logoLeaf}>🍃</Text>
          </View>

          <Text style={styles.schoolTitle}>Escuela Reducción{"\n"}Monte Verde</Text>
          <Text style={styles.schoolSubtitle}>
            Aprende, explora y cuida el Humedal Vegas de Chivilcán
          </Text>
          <Text style={styles.locationTag}>TEMUCO · KARÜ MAWIDA</Text>
        </View>

        {/* Contenedor Inferior: Botón de ingreso */}
        <View style={styles.bottomSection}>
          <TouchableOpacity
            style={[styles.button, styles.studentButton]}
            onPress={handleIniciar}
          >
            <Text style={[styles.buttonText, styles.studentButtonText]}>Iniciar sesión</Text>
          </TouchableOpacity>
        </View>

      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#2d533c',
    position: 'relative',
    overflow: 'hidden',
  },
  topCircle: {
    position: 'absolute',
    top: -80,
    right: -80,
    width: 320,
    height: 320,
    borderRadius: 160,
    backgroundColor: '#916843',
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 60,
    paddingRight: 60,
  },
  sunEmoji: {
    fontSize: 40,
    opacity: 0.3,
  },
  bottomCircle: {
    position: 'absolute',
    bottom: -100,
    left: -60,
    width: 260,
    height: 260,
    borderRadius: 130,
    backgroundColor: '#3b664c',
    opacity: 0.7,
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: 30,
    justifyContent: 'space-between',
    paddingTop: 80,
    paddingBottom: 50,
    zIndex: 10,
  },
  topSection: {
    alignItems: 'flex-start',
    marginTop: 120, // Mantiene la posición más abajo que configuramos antes
  },
  logoContainer: {
    width: 85,
    height: 85,
    backgroundColor: '#fffdf0',
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 5,
    elevation: 4,
  },
  logoLeaf: {
    fontSize: 40,
  },
  schoolTitle: {
    fontSize: 40,
    fontWeight: 'bold',
    color: '#ffffff',
    lineHeight: 46,
    letterSpacing: -0.5,
    marginBottom: 15,
  },
  schoolSubtitle: {
    fontSize: 16,
    color: '#e0ece4',
    lineHeight: 22,
    maxWidth: '90%',
    marginBottom: 12,
  },
  locationTag: {
    fontSize: 12,
    fontWeight: '700',
    color: '#a3bfa8',
    letterSpacing: 1,
  },
  bottomSection: {
    width: '100%',
    gap: 14,
  },
  button: {
    width: '100%',
    paddingVertical: 18,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  studentButton: {
    backgroundColor: '#ddab4f',
  },
  teacherButton: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: '#ffffff',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  studentButtonText: {
    color: '#233d2c',
  },
  teacherButtonText: {
    color: '#ffffff',
  },
});
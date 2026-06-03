import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { useAuth } from '@/lib/auth/AuthContext';

export default function InicioScreen() {
  const { profile, role, signOut } = useAuth();

  const nombre = profile?.full_name ?? 'explorador/a';
  const esProfe = role === 'teacher';

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.welcomeContainer}>
          {esProfe && <Text style={styles.roleTag}>MODO PROFESOR/A</Text>}
          <Text style={styles.greetingText}>
            {esProfe ? `Hola, ${nombre}` : `¡Hola, ${nombre}!`}
          </Text>
          <Text style={styles.subTitleText}>Escuela Monteverde</Text>
          <Text style={styles.questionText}>
            {esProfe
              ? '¿Qué quieres publicar hoy?'
              : '¿Qué descubres hoy en el humedal?'}
          </Text>
        </View>

        <TouchableOpacity style={styles.logoutButton} onPress={signOut}>
          <Text style={styles.logoutText}>Cerrar sesión</Text>
        </TouchableOpacity>
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
    paddingTop: 20,
    paddingHorizontal: 24,
    paddingBottom: 100,
  },
  welcomeContainer: {
    marginBottom: 25,
  },
  roleTag: {
    fontSize: 13,
    fontWeight: '700',
    color: '#2e7d32',
    letterSpacing: 1,
    marginBottom: 4,
  },
  greetingText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1a1a1a',
  },
  subTitleText: {
    fontSize: 20,
    fontWeight: '300',
    color: '#000000',
    marginTop: 2,
  },
  questionText: {
    fontSize: 25,
    color: '#000000',
    marginTop: 6,
    fontWeight: '400',
  },
  logoutButton: {
    marginTop: 10,
    alignSelf: 'flex-start',
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  logoutText: {
    color: '#c62828',
    fontWeight: '600',
    fontSize: 15,
  },
});

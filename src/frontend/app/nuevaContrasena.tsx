import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

import { supabase } from '@/lib/supabase/client';

export default function NuevaContrasenaScreen() {
  const [email, setEmail] = useState('');
  const [cargando, setCargando] = useState(false);
  const router = useRouter();

  const handleSendLink = async () => {
    if (email.trim() === '') {
      Alert.alert('Error', 'Por favor ingresa tu correo electrónico');
      return;
    }
    setCargando(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim());
    setCargando(false);
    if (error) {
      Alert.alert('Error', 'No pudimos enviar el enlace. Verifica tu correo e inténtalo de nuevo.');
      return;
    }
    Alert.alert('Éxito', 'Se ha enviado el enlace de recuperación a tu correo.');
    router.back();
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />

      <View style={styles.topSection}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backIcon}>‹</Text>
        </TouchableOpacity>

        <View style={styles.iconContainer}>
          <Ionicons name="mail-outline" size={28} color="#355343" />
        </View>

        {/* Títulos */}
        <Text style={styles.title}>Recupera tu contraseña</Text>
        <Text style={styles.subtitle}>
          Te enviaremos un correo con un enlace para crear una nueva contraseña.
        </Text>
      </View>

      <View style={styles.formSection}>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>TU CORREO DE LA ESCUELA</Text>
          <TextInput
            style={styles.input}
            placeholder="tu@monteverde.cl"
            placeholderTextColor="#999"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
          />
        </View>
      </View>


      <View style={styles.bottomSection}>
        {/* Botón Enviar Enlace */}
        <TouchableOpacity style={styles.submitButton} onPress={handleSendLink} disabled={cargando}>
          <Text style={styles.submitButtonText}>{cargando ? 'Enviando…' : 'Enviar enlace'}</Text>
        </TouchableOpacity>
      </View>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fbf4e6', 
    paddingHorizontal: 28,
    paddingTop: 60,
    paddingBottom: 40,
    justifyContent: 'space-between',
  },
  topSection: {
    alignItems: 'flex-start',
    width: '100%',
  },
  backButton: {
    width: 45,
    height: 45,
    borderRadius: 14,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  backIcon: {
    fontSize: 28,
    color: '#333333',
    fontWeight: '300',
    marginTop: -4,
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 18,
    backgroundColor: '#f3e5d8', 
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 25,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#242424',
    letterSpacing: -0.5,
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 15,
    color: '#7e7568',
    lineHeight: 22,
    maxWidth: '90%',
  },
  formSection: {
    width: '100%',
    marginTop: 30,
  },
  inputGroup: {
    width: '100%',
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
    color: '#7e7568',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  input: {
    width: '100%',
    backgroundColor: '#fffdf9',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#ebdcc5',
    fontSize: 16,
    color: '#333333',
  },
  bottomSection: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 10, 
  },
  submitButton: {
    width: '100%',
    backgroundColor: '#355343', 
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
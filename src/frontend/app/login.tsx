import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();

  const handleLogin = () => {
    if (email.trim() === '' || password.trim() === '') {
      Alert.alert('Error', 'Por favor llena todos los campos');
      return;
    }
    router.replace('/(tabs)');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.logo}>VerdeBit</Text>
      <Text style={styles.subtitle}>¡Explora y aprende con nosotros!</Text>

      {/* --- INICIO DEL CUADRADO / TARJETA --- */}
      <View style={styles.loginCard}>
        
        {/* Campo de Correo */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Nombre de usuario</Text> 
          <TextInput
            style={styles.input}
            placeholder="Tu apodo genial"
            placeholderTextColor="#999"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
          />
        </View>

        {/* Campo de Contraseña */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Contraseña Secreta</Text>
          <TextInput
            style={styles.input}
            placeholder="***"
            placeholderTextColor="#999"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />
        </View>

        {/* Botón Entrar */}
        <TouchableOpacity style={styles.button} onPress={handleLogin}>
          <Text style={styles.buttonText}>¡Entrar! →</Text>
        </TouchableOpacity>

      </View>


    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f7f7f7',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  logo: {
    fontSize: 40,
    fontWeight: 'bold',
    color: '#2e7d32',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 40,
  },
  /* --- ESTILOS DEL CUADRADO PRINCIPAL --- */
  loginCard: {
    width: '100%',
     // Fondo crema claro (como tu imagen)
    borderRadius: 20,          // Bordes redondeados
    borderWidth: 1.5,          // Grosor del borde
    borderColor: '#5d3c22',    // Color marrón madera del borde
    padding: 20,               // Espacio interno para que nada toque los bordes
    alignItems: 'center',
  },
  inputGroup: {
    width: '100%',
    marginBottom: 15,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
    alignSelf: 'flex-start',
  },
  input: {
    width: '100%',
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    fontSize: 16,
  },
  button: {
    width: '100%',
    backgroundColor: '#2e7d32',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 15, // Espacio entre el último input y el botón
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
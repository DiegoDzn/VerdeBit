import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();

  const handleLogin = () => {
  if (email.trim() === '' || password.trim() === '') {
    Alert.alert('Error', 'Por favor llena todos los campos');
    return;
  }
  router.replace({
    pathname: '/(tabs)',
    params: { rol: 'profesor' }
  });
};

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* --- SECCIÓN SUPERIOR (Botón atrás y Títulos) --- */}
      <View style={styles.topSection}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backIcon}>‹</Text>
        </TouchableOpacity>

        <Text style={styles.title}>Bienvenido{"\n"}de vuelta</Text>
        
        <View style={styles.roleContainer}>
          <Text style={styles.roleText}>
            Inicia sesión como <Text style={styles.roleHighlight}>profesor</Text>.
          </Text>
        </View>
      </View>

      {/* --- SECCIÓN CENTRAL (Formulario) --- */}
      <View style={styles.formSection}>
        {/* Campo de Correo */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>CORREO ELECTRÓNICO</Text> 
          <TextInput
            style={styles.input}
            placeholder="ejemplo@monteverde.cl"
            placeholderTextColor="#999"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>CONTRASEÑA</Text>
          <TextInput
            style={styles.input}
            placeholder="••••••••"
            placeholderTextColor="#999"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />
        </View>

        <TouchableOpacity 
          style={styles.forgotPasswordButton}
          onPress={() => router.push('/nuevaContrasena')}
        >
          <Text style={styles.forgotPasswordText}>¿Olvidaste tu contraseña?</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.bottomSection}>
        <TouchableOpacity style={styles.submitButton} onPress={handleLogin}>
          <Text style={styles.submitButtonText}>Iniciar sesión</Text>
        </TouchableOpacity>
        
        <Text style={styles.disclaimerText}>
          Al continuar aceptas usar la app con cuidado del humedal.
        </Text>
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
    marginBottom: 25,
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
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#242424',
    lineHeight: 42,
    letterSpacing: -0.5,
    marginBottom: 12,
  },
  roleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  roleText: {
    fontSize: 15,
    color: '#6e695e',
  },
  roleHighlight: {
    fontWeight: 'bold',
    color: '#345543', 
  },
  formSection: {
    width: '100%',
    flex: 1,
    justifyContent: 'flex-start', 
    marginTop: -150,                
    maxHeight: 280, 
  },
  inputGroup: {
    width: '100%',
    marginBottom: 20,
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
  forgotPasswordButton: {
    alignSelf: 'flex-start',
    marginTop: 4,
  },
  forgotPasswordText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#c46d46',
  },
  bottomSection: {
    width: '100%',
    alignItems: 'center',
    gap: 16,
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
  disclaimerText: {
    fontSize: 12,
    color: '#7e7568',
    textAlign: 'center',
    lineHeight: 16,
    paddingHorizontal: 10,
  },
});
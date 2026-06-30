import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { crearUsuarioAdmin } from '@/lib/admin/api';
import type { UserRole } from '@/lib/types';

export default function CrearUsuarioScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<Extract<UserRole, 'student' | 'teacher'>>('student');
  const [guardando, setGuardando] = useState(false);

  const handleGuardar = async () => {
    if (!fullName.trim() || !email.trim() || !password.trim()) {
      Alert.alert('Error', 'Todos los campos son obligatorios');
      return;
    }
    if (password.length < 6) {
      Alert.alert('Error', 'La contraseña debe tener al menos 6 caracteres');
      return;
    }

    setGuardando(true);
    try {
      await crearUsuarioAdmin({
        email: email.trim(),
        password,
        fullName: fullName.trim(),
        role,
      });
      Alert.alert('Éxito', 'Usuario creado exitosamente', [
        { text: 'OK', onPress: () => router.back() }
      ]);
    } catch (e) {
      Alert.alert('Error', e instanceof Error ? e.message : 'No se pudo crear el usuario');
    } finally {
      setGuardando(false);
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top + 15 }]}>
      <KeyboardAvoidingView 
        style={{ flex: 1 }} 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
              <Ionicons name="arrow-back" size={22} color="#242424" />
            </TouchableOpacity>
            <Text style={styles.titulo}>Nuevo Usuario</Text>
          </View>

          {/* Formulario */}
          <View style={styles.formContainer}>
            <Text style={styles.label}>Nombre completo</Text>
            <TextInput
              style={styles.input}
              placeholder="Ej. Juan Pérez"
              placeholderTextColor="#8E8A7E"
              value={fullName}
              onChangeText={setFullName}
              autoCapitalize="words"
              editable={!guardando}
            />

            <Text style={styles.label}>Correo electrónico</Text>
            <TextInput
              style={styles.input}
              placeholder="Ej. juan@ejemplo.com"
              placeholderTextColor="#8E8A7E"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              editable={!guardando}
            />

            <Text style={styles.label}>Contraseña</Text>
            <TextInput
              style={styles.input}
              placeholder="Mínimo 6 caracteres"
              placeholderTextColor="#8E8A7E"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              editable={!guardando}
            />

            <Text style={styles.label}>Rol de usuario</Text>
            <View style={styles.rolesRow}>
              <TouchableOpacity
                style={[styles.rolBtn, role === 'student' && styles.rolBtnActivo]}
                onPress={() => setRole('student')}
                disabled={guardando}
                activeOpacity={0.7}
              >
                <Ionicons name="person" size={20} color={role === 'student' ? '#ffffff' : '#355343'} />
                <Text style={[styles.rolText, role === 'student' && styles.rolTextActivo]}>Estudiante</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.rolBtn, role === 'teacher' && styles.rolBtnActivo]}
                onPress={() => setRole('teacher')}
                disabled={guardando}
                activeOpacity={0.7}
              >
                <Ionicons name="school" size={20} color={role === 'teacher' ? '#ffffff' : '#355343'} />
                <Text style={[styles.rolText, role === 'teacher' && styles.rolTextActivo]}>Profesor</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity 
              style={styles.guardarBtn}
              onPress={handleGuardar}
              disabled={guardando}
              activeOpacity={0.8}
            >
              {guardando ? (
                <ActivityIndicator color="#ffffff" size="small" />
              ) : (
                <Text style={styles.guardarBtnText}>Crear Usuario</Text>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9F6EE',
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginBottom: 30,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 14,
    backgroundColor: '#FFFDF9',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 1,
  },
  titulo: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#242424',
  },
  formContainer: {
    gap: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#242424',
    marginBottom: -8,
  },
  input: {
    backgroundColor: '#FFFDF9',
    borderWidth: 1,
    borderColor: '#E2DEC9',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#242424',
  },
  rolesRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 4,
  },
  rolBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#FFFDF9',
    borderWidth: 1.5,
    borderColor: '#E2DEC9',
    borderRadius: 16,
    paddingVertical: 14,
  },
  rolBtnActivo: {
    backgroundColor: '#355343',
    borderColor: '#355343',
  },
  rolText: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#355343',
  },
  rolTextActivo: {
    color: '#ffffff',
  },
  guardarBtn: {
    backgroundColor: '#355343',
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    shadowColor: '#355343',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 4,
  },
  guardarBtnText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

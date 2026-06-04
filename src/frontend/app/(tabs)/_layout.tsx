import { Tabs, usePathname } from 'expo-router';
import React from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Ionicons } from '@expo/vector-icons';

import { useAuth } from '@/lib/auth/AuthContext';

export default function TabLayout() {
  const insets = useSafeAreaInsets();
  const pathname = usePathname();
  const { role } = useAuth();

  const esProfe = role === 'teacher';
  const quizzesLabel = esProfe ? 'Cursos' : 'Quizzes';
  const quizzesIcon = esProfe ? 'stats-chart' : 'help-circle';

  // Le damos un poco más de altura fija abajo para que el diseño vertical respire bien
  const tabBarHeight = Platform.OS === 'ios' ? 75 + insets.bottom : 80 + insets.bottom;

  const isTabActive = (routeName: string) => {
    if (routeName === 'index') {
      return pathname === '/' || pathname === '/index';
    }
    return pathname.includes(routeName);
  };

  return (
    <Tabs
      screenOptions={{
        // --- HEADER (ARRIBA) ---
        headerShown: true,
        headerTitle: "VerdeBit",
        headerTitleAlign: 'center',
        headerTitleStyle: {
          fontSize: 22,
          fontWeight: 'bold',
          color: '#006B2D',
        },
        headerStyle: {
          backgroundColor: '#ffffff',
          elevation: 0,
          shadowOpacity: 0,
          borderBottomWidth: 1,
          borderBottomColor: '#f0f0f0',
        },
        
        // --- BARRA INFERIOR ---
        tabBarShowLabel: false,
        tabBarStyle: {
          height: tabBarHeight,
          backgroundColor: '#ffffff',
          borderTopWidth: 1,
          borderTopColor: '#f0f0f0',
        },
      }}>
      
      <Tabs.Screen
        name="index"
        options={{
          title: 'Inicio',
          tabBarButton: (props) => (
            <CustomTabButton 
              {...props} 
              icon="home" 
              label="Inicio" 
              isActive={isTabActive('index')} 
              insetsBottom={insets.bottom} 
            />
          ),
        }}
      />

      <Tabs.Screen
        name="catalogo"
        options={{
          title: 'Catálogo',
          tabBarButton: (props) => (
            <CustomTabButton 
              {...props} 
              icon="book" 
              label="Catálogo" 
              isActive={isTabActive('catalogo')} 
              insetsBottom={insets.bottom} 
            />
          ),
        }}
      />

      <Tabs.Screen
        name="quizzes"
        options={{
          title: quizzesLabel,
          tabBarButton: (props) => (
            <CustomTabButton
              {...props}
              icon={quizzesIcon}
              label={quizzesLabel}
              isActive={isTabActive('quizzes')}
              insetsBottom={insets.bottom}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="aulaverde"
        options={{
          title: 'Aula',
          tabBarButton: (props) => (
            <CustomTabButton 
              {...props} 
              icon="school" 
              label="Aula" 
              isActive={isTabActive('aulaverde')} 
              insetsBottom={insets.bottom} 
            />
          ),
        }}
      />

      <Tabs.Screen
        name="profile"
        options={{
          title: 'Perfil',
          tabBarButton: (props) => (
            <CustomTabButton 
              {...props} 
              icon="person" 
              label="Perfil" 
              isActive={isTabActive('profile')} 
              insetsBottom={insets.bottom} 
            />
          ),
        }}
      />

      <Tabs.Screen name="calendario" options={{ href: null }} />
    </Tabs>
  );
}

function CustomTabButton(props: any) {
  const { onPress, icon, label, insetsBottom, isActive } = props;

  return (
    <Pressable 
      onPress={onPress} 
      style={[
        styles.tabItem, 
        { paddingBottom: insetsBottom > 0 ? insetsBottom / 2 : 0 }
      ]}
    >
      <View style={[styles.pillContainer, isActive ? styles.pillActive : styles.pillInactive]}>
        <Ionicons 
          size={22} // Icono un pelín más grande para que luzca mejor centrado
          name={isActive ? icon : `${icon}-outline`} 
          color={isActive ? "#ffffff" : "#666666"} 
        />
        <Text style={isActive ? styles.textActive : styles.textInactive}>
          {label}
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pillContainer: {
    flexDirection: 'column', // <--- SIEMPRE vertical, activo o inactivo
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
    paddingVertical: 6,
    paddingHorizontal: 12,
    width: 85, // Ancho fijo para que el botón verde cubra bien el texto sin importar el largo
    height: 55, // Altura fija para contener ambos elementos de manera simétrica
  },
  pillActive: {
    backgroundColor: '#006B2D', // fondo verde en boton activo
  },
  pillInactive: {
    backgroundColor: 'transparent',
  },
  textActive: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: 'bold',
    marginTop: 3,
  },
  textInactive: {
    color: '#666666',
    fontSize: 11,
    fontWeight: '500',
    marginTop: 3,
  },
});

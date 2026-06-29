import { Ionicons } from '@expo/vector-icons';
import { Tabs, usePathname } from 'expo-router';
import React from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useAuth } from '@/lib/auth/AuthContext';

export default function TabLayout() {
  const insets = useSafeAreaInsets();
  const pathname = usePathname();

  const { role } = useAuth();
  const esProfesor = role === 'teacher';

  const tabBarHeight = Platform.OS === 'ios' ? 75 + insets.bottom : 80 + insets.bottom;

  const isTabActive = (routeName: string) => {
    const currentTab = pathname.split('/').pop();

    if (routeName === 'index') {
      return pathname === '/' || currentTab === 'index' || currentTab === '';
    }
    
    return currentTab === routeName;
  };

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: {
          height: tabBarHeight,
          backgroundColor: '#ffffff',
          borderTopWidth: 1,
          borderTopColor: '#f0f0f0',
          elevation: 0,
          shadowOpacity: 0,
        },
      }}>
      
      <Tabs.Screen
        name="index"
        options={{
          title: 'Inicio',
          tabBarButton: (props) => (
            <CustomTabButton {...props} icon="home" label="Inicio" isActive={isTabActive('index')} insetsBottom={insets.bottom} />
          ),
        }}
      />

      <Tabs.Screen
        name="catalogo"
        options={{
          title: 'Catálogo',
          tabBarButton: (props) => (
            <CustomTabButton {...props} icon="book" label="Catálogo" isActive={isTabActive('catalogo')} insetsBottom={insets.bottom} />
          ),
        }}
      />

      <Tabs.Screen
        name="aulaverde"
        options={{
          title: esProfesor ? 'Cursos' : 'Quizzes',
          tabBarButton: (props) => (
            <CustomTabButton 
              {...props} 
              icon="school" 
              label={esProfesor ? 'Cursos' : 'Quizzes'} 
              isActive={isTabActive('aulaverde')} 
              insetsBottom={insets.bottom} 
            />
          ),
        }}
      />

      <Tabs.Screen
        name="aula"
        options={{
          title: 'Aula',
          tabBarButton: (props) => (
            <CustomTabButton 
              {...props} 
              icon="document-text" 
              label="Aula" 
              isActive={isTabActive('aula')} 
              insetsBottom={insets.bottom} 
            />
          ),
        }}
      />

      <Tabs.Screen
        name="perfil"
        options={{
          title: 'Perfil',
          tabBarButton: (props) => (
            <CustomTabButton {...props} icon="person" label="Perfil" isActive={isTabActive('perfil')} insetsBottom={insets.bottom} />
          ),
        }}
      />
      <Tabs.Screen
        name="eventos"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="sabiasque"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="cursos"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="catalogoinfo"
        options={{
          href: null,
        }}
      />
    </Tabs>
  );
}

function CustomTabButton(props: any) {
  const { onPress, icon, label, insetsBottom, isActive } = props;
  return (
    <Pressable onPress={onPress} style={[styles.tabItem, { paddingBottom: insetsBottom > 0 ? insetsBottom / 2 : 0 }]}>
      <View style={[styles.pillContainer, isActive ? styles.pillActive : styles.pillInactive]}>
        <Ionicons size={22} name={isActive ? icon : `${icon}-outline`} color={isActive ? "#ffffff" : "#666666"} />
        <Text style={isActive ? styles.textActive : styles.textInactive}>{label}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  loader: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#fbf4e6' },
  tabItem: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  pillContainer: { flexDirection: 'column', alignItems: 'center', justifyContent: 'center', borderRadius: 16, paddingVertical: 6, paddingHorizontal: 8, width: 75, height: 55 },
  pillActive: { backgroundColor: '#006B2D' },
  pillInactive: { backgroundColor: 'transparent' },
  textActive: { color: '#ffffff', fontSize: 10, fontWeight: 'bold', marginTop: 3 },
  textInactive: { color: '#666666', fontSize: 10, fontWeight: '500', marginTop: 3 },
});

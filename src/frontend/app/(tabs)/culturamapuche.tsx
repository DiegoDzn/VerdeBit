import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function CulturaMapucheScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  return (
    <View style={[styles.container, { paddingTop: insets.top + 15 }]}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.headerSection}>
          <TouchableOpacity onPress={() => router.push('/(tabs)')} style={styles.backButtonSquare}>
            <Ionicons name="chevron-back" size={20} color="#242424" />
          </TouchableOpacity>
          
          <View style={styles.titleContainer}>
            <Text style={styles.mainTitle}>Cultura Mapuche</Text> 
            <Text style={styles.headerSubtitle}>Sabiduría ancestral del territorio</Text>
          </View>
        </View>

        {/* --- añadir la info de cultura mapuche de la base de datos --- */}

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fbf4e6',
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 120,
  },
  headerSection: {
    flexDirection: 'row',  
    alignItems: 'center',    
    gap: 16,
    marginBottom: 25,
  },
  backButtonSquare: {
    width: 45,
    height: 45,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
  },
  titleContainer: {
    flex: 1,              
  },
  mainTitle: {
    fontSize: 26,          
    fontWeight: 'bold',
    color: '#242424',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#7e7568',
    marginTop: 2,
  },
});
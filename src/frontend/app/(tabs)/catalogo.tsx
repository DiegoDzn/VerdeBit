import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

export default function CatalogoScreen() {
  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        
        <Text style={styles.bigText}>
          Encuentra videos, noticias, imágenes...
        </Text>

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
    paddingTop: 24, 
    paddingHorizontal: 24,
    paddingBottom: 100, 
  },
  bigText: {
    fontSize: 32,
    fontWeight: 'bold', 
    color: '#1a1a1a',
    lineHeight: 40,
  },
});
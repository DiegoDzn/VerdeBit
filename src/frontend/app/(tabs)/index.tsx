import { useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';
import { ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function InicioScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  // Capturamos el rol real que viene desde el login
  const { rol } = useLocalSearchParams<{ rol: 'estudiante' | 'profesor' }>();
  const userRol = rol || 'estudiante';

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        bounces={false}
      >
        {/* --- HEADER VERDE SUPERIOR --- */}
        <View style={[styles.greenHeader, { paddingTop: insets.top + 15 }]}>
          <View style={styles.userInfoRow}>
            {/* Avatar Círculo Amarillo */}
            <View style={styles.avatarCircle}>
              <Text style={styles.avatarText}>A</Text>
            </View>
            <View>
              <Text style={styles.greetingText}>
                {userRol === 'profesor' ? '¡Hola, docente!' : '¡Hola, exploradora!'}
              </Text>
              <Text style={styles.userNameText}>
                {userRol === 'profesor' ? 'Prof. Alejandro' : 'Antonia'}
              </Text>
            </View>
          </View>

          <Text style={styles.mainQuestion}>
            {userRol === 'profesor' 
              ? '¿Qué actividades coordinarás hoy?' 
              : '¿Qué descubres hoy en el humedal?'}
          </Text>
        </View>

        {/* --- CONTENIDO INFERIOR CON TARJETAS --- */}
        <View style={styles.whiteSection}>
          
          {/* Tarjeta de Nivel / Estado */}
          <View style={styles.cardLevel}>
            <View style={styles.starCircle}>
              <Text style={styles.starIcon}>⭐</Text>
            </View>
            <View style={styles.levelProgressContainer}>
              <Text style={styles.levelTitle}>
                {userRol === 'profesor' ? 'ESTADO DEL CURSO' : 'NIVEL 2 · EXPLORADOR DEL HUMEDAL'}
              </Text>
              <View style={styles.progressBarBg}>
                <View style={[styles.progressBarFill, { width: '60%' }]} />
              </View>
              <Text style={styles.progressText}>
                {userRol === 'profesor' ? '85% Alumnos Activos' : '120 / 200 puntos'}
              </Text>
            </View>
          </View>

          {/* Tarjeta Quiz Rápido */}
          <View style={styles.cardQuiz}>
            <Text style={styles.quizLabel}>QUIZ RÁPIDO</Text>
            <Text style={styles.quizTitle}>Animales del humedal</Text>
            <View style={styles.quizFooter}>
              <View style={styles.quizBadge}>
                <Text style={styles.quizBadgeText}>5 preguntas</Text>
              </View>
              <Text style={styles.quizPoints}>⭐ +50 pts</Text>
              <TouchableOpacity style={styles.playButton}>
                <Text style={styles.playButtonText}>Jugar →</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Sección ¿Sabías que...? */}
          <Text style={styles.sectionTitle}>¿Sabías que...?</Text>
          <Text style={styles.sectionSubtitle}>Un dato nuevo cada día</Text>

          {/* Tarjeta del Dato del Día */}
          <View style={styles.cardData}>
            <Text style={styles.dataLabel}>DATO DEL DÍA</Text>
            <Text style={styles.dataText}>
              ¿Sabías que los humedales filtran el agua de forma natural, como un gran riñón verde?
            </Text>
            <TouchableOpacity>
              <Text style={styles.viewMore}>Ver más datos ›</Text>
            </TouchableOpacity>
          </View>

          {/* Próximo Evento */}
 
          <View style={styles.eventHeaderRow}>
            <Text style={styles.sectionTitle}>Próximo evento</Text>
            <TouchableOpacity onPress={() => router.push('/eventos')}>
              <Text style={styles.viewAllEvents}>Ver todos →</Text>
            </TouchableOpacity>
          </View>
          
          <Text style={[styles.sectionSubtitle, { marginBottom: 20 }]}>Calendario del humedal</Text>

        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fbf4e6', // Fondo crema de la app
  },
  scrollContent: {
    paddingBottom: 100,
  },
  // --- HEADER ESTILO MAQUETA ---
  greenHeader: {
    backgroundColor: '#355343', // Verde bosque de la imagen
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    paddingHorizontal: 24,
    paddingBottom: 30,
  },
  userInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    gap: 12,
  },
  avatarCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#ebdcc5', // Color crema/amarillo del avatar
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#242424',
  },
  greetingText: {
    fontSize: 14,
    color: '#ebdcc5',
    opacity: 0.9,
  },
  userNameText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  mainQuestion: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#ffffff',
    lineHeight: 32,
    maxWidth: '85%',
  },
  // --- SECCIÓN INFERIOR BLANCA ---
  whiteSection: {
    paddingHorizontal: 24,
    marginTop: -15, // Solape estético suave
  },
  cardLevel: {
    backgroundColor: '#ffffff',
    borderRadius: 24,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 2,
    marginBottom: 16,
  },
  starCircle: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    backgroundColor: '#ebdcc5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  starIcon: {
    fontSize: 20,
  },
  levelProgressContainer: {
    flex: 1,
  },
  levelTitle: {
    fontSize: 10,
    fontWeight: '800',
    color: '#7e7568',
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  progressBarBg: {
    height: 8,
    backgroundColor: '#f2f0eb',
    borderRadius: 4,
    width: '100%',
    marginBottom: 6,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#355343',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#355343',
  },
  // --- TARJETA QUIZ TERRACOTA ---
  cardQuiz: {
    backgroundColor: '#c46d46', // Color arcilla/naranja del mock
    borderRadius: 24,
    padding: 20,
    marginBottom: 25,
  },
  quizLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#ffffff',
    opacity: 0.8,
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  quizTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 16,
  },
  quizFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  quizBadge: {
    backgroundColor: '#a35733',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  quizBadgeText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '700',
  },
  quizPoints: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '600',
  },
  playButton: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 14,
  },
  playButtonText: {
    color: '#c46d46',
    fontWeight: 'bold',
    fontSize: 13,
  },
  // --- DATOS Y TEXTOS ---
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#242424',
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#7e7568',
    marginTop: 2,
  },
  cardData: {
    backgroundColor: '#dfae4b', // Mostaza/Amarillo del dato del día
    borderRadius: 24,
    padding: 20,
    marginTop: 12,
    marginBottom: 25,
  },
  dataLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#242424',
    opacity: 0.6,
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  dataText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#242424',
    lineHeight: 22,
    marginBottom: 12,
  },
  viewMore: {
    fontSize: 13,
    fontWeight: '700',
    color: '#242424',
  },
  eventHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  viewAllEvents: {
    fontSize: 14,
    fontWeight: '700',
    color: '#355343',
  },
});
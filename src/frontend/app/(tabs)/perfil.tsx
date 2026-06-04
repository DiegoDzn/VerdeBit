import { Ionicons } from '@expo/vector-icons';
import { useGlobalSearchParams } from 'expo-router';
import React from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function PerfilScreen() {
  const insets = useSafeAreaInsets();
  const { rol } = useGlobalSearchParams<{ rol: 'estudiante' | 'profesor' }>();
  const userRol = rol || 'estudiante';

  // ==========================================
  // VISTA: ESTUDIANTE (12 · Perfil estudiante)
  // ==========================================
  if (userRol === 'estudiante') {
    return (
      <View style={styles.container}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          
          {/* Header Verde Superior */}
          <View style={[styles.headerBg, { paddingTop: insets.top + 20 }]}>
            <View style={styles.profileHeaderRow}>
              <View style={styles.avatarCircle}>
                <Text style={styles.avatarText}>A</Text>
              </View>
              <View style={styles.headerInfo}>
                <Text style={styles.userName}>Antonia Curihuinca ☀️</Text>
                <Text style={styles.userSubtitle}>4° Básico • Escuela Monteverde</Text>
              </View>
            </View>
          </View>

          {/* Contenido con Margen Negativo para traslapar */}
          <View style={styles.mainContentWrapper}>
            
            {/* Tarjeta de Nivel / Progreso */}
            <View style={styles.levelCard}>
              <View style={styles.levelRow}>
                <View style={[styles.medalBadge, { backgroundColor: '#D9A74A' }]}>
                  <Ionicons name="star" size={24} color="#ffffff" />
                </View>
                <View style={styles.levelInfo}>
                  <Text style={styles.levelTag}>NIVEL 2</Text>
                  <Text style={styles.levelTitle}>Explorador del Humedal</Text>
                  {/* Barra de Progreso */}
                  <View style={styles.progressBarBg}>
                    <View style={[styles.progressBarFill, { width: '60%' }]} />
                  </View>
                  <Text style={styles.progressText}>120 / 200 pts para subir</Text>
                </View>
              </View>
            </View>

            {/* Fila de 3 Estadísticas */}
            <View style={styles.statsRow}>
              <View style={styles.statCard}>
                <View style={[styles.statIconCircle, { backgroundColor: '#FDF4DF' }]}>
                  <Ionicons name="star" size={16} color="#D9A74A" />
                </View>
                <Text style={styles.statNumber}>120</Text>
                <Text style={styles.statLabel}>PUNTOS</Text>
              </View>

              <View style={styles.statCard}>
                <View style={[styles.statIconCircle, { backgroundColor: '#FBECE8' }]}>
                  <Ionicons name="help-circle" size={16} color="#C86D51" />
                </View>
                <Text style={styles.statNumber}>7</Text>
                <Text style={styles.statLabel}>QUIZZES</Text>
              </View>

              <View style={styles.statCard}>
                <View style={[styles.statIconCircle, { backgroundColor: '#EBF0EC' }]}>
                  <Ionicons name="leaf" size={16} color="#355343" />
                </View>
                <Text style={styles.statNumber}>12</Text>
                <Text style={styles.statLabel}>ESPECIES</Text>
              </View>
            </View>

            {/* Sección Medallas */}
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Medallas</Text>
              <Text style={styles.sectionSubtitle}>3 de 6 ganadas</Text>
            </View>

            {/* Grid de Medallas */}
            <View style={styles.medalGrid}>
              <View style={styles.medalGridItem}>
                <View style={[styles.medalCircle, { backgroundColor: '#7E9362' }]}>
                  <Ionicons name="star" size={28} color="#ffffff" />
                </View>
                <Text style={styles.medalGridLabel}>Explorador del Humedal</Text>
              </View>

              <View style={styles.medalGridItem}>
                <View style={[styles.medalCircle, { backgroundColor: '#6289A3' }]}>
                  <Ionicons name="star" size={28} color="#ffffff" />
                </View>
                <Text style={styles.medalGridLabel}>Protector del Agua</Text>
              </View>

              <View style={styles.medalGridItem}>
                <View style={[styles.medalCircle, { backgroundColor: '#D9A74A' }]}>
                  <Ionicons name="star" size={28} color="#ffffff" />
                </View>
                <Text style={styles.medalGridLabel}>Amigo de la fauna</Text>
              </View>

              {/* Medallas Bloqueadas */}
              <View style={styles.medalGridItem}>
                <View style={[styles.medalCircle, { backgroundColor: '#E2DEC9' }]}>
                  <Ionicons name="lock-closed" size={24} color="#8E8A7E" />
                </View>
              </View>
              <View style={styles.medalGridItem}>
                <View style={[styles.medalCircle, { backgroundColor: '#E2DEC9' }]}>
                  <Ionicons name="lock-closed" size={24} color="#8E8A7E" />
                </View>
              </View>
              <View style={styles.medalGridItem}>
                <View style={[styles.medalCircle, { backgroundColor: '#E2DEC9' }]}>
                  <Ionicons name="lock-closed" size={24} color="#8E8A7E" />
                </View>
              </View>
            </View>

          </View>
        </ScrollView>
      </View>
    );
  }

  // ==========================================
  // VISTA: PROFESOR (12b · Perfil profesor/a)
  // ==========================================
  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        
        {/* Header Verde Superior Profesor */}
        <View style={[styles.headerBg, { paddingTop: insets.top + 20 }]}>
          <View style={styles.profileHeaderRow}>
            <View style={styles.avatarCircle}>
              <Text style={styles.avatarText}>M</Text>
            </View>
            <View style={styles.headerInfo}>
              <View style={styles.profTag}>
                <Text style={styles.profTagText}>PROFESOR/A</Text>
              </View>
              <Text style={styles.userName}>Profe Marcela Pérez 🌿</Text>
              <Text style={styles.userSubtitle}>Profesora de Ciencias Naturales</Text>
            </View>
          </View>
        </View>

        {/* Contenido con Margen Negativo */}
        <View style={styles.mainContentWrapper}>
          
          {/* Tarjeta de Datos de Institución */}
          <View style={styles.infoTableCard}>
            <View style={styles.tableRow}>
              <Text style={styles.tableLabel}>ESCUELA</Text>
              <Text style={styles.tableValue}>Escuela Monteverde • Temuco</Text>
            </View>
            <View style={styles.tableDivider} />
            <View style={styles.tableRow}>
              <Text style={styles.tableLabel}>CORREO</Text>
              <Text style={styles.tableValue}>marcela@monteverde.cl</Text>
            </View>
            <View style={styles.tableDivider} />
            <View style={styles.tableRow}>
              <Text style={styles.tableLabel}>AÑOS ENSEÑANDO</Text>
              <Text style={styles.tableValue}>8 años</Text>
            </View>
          </View>

          {/* Fila de 3 Estadísticas Profesor */}
          <View style={styles.statsRow}>
            <View style={styles.statCard}>
              <View style={[styles.statIconCircle, { backgroundColor: '#EBF0EC' }]}>
                <Ionicons name="people" size={16} color="#355343" />
              </View>
              <Text style={styles.statNumber}>78</Text>
              <Text style={styles.statLabel}>ESTUDIANTES</Text>
            </View>

            <View style={styles.statCard}>
              <View style={[styles.statIconCircle, { backgroundColor: '#FBECE8' }]}>
                <Ionicons name="document-text" size={16} color="#C86D51" />
              </View>
              <Text style={styles.statNumber}>12</Text>
              <Text style={styles.statLabel}>RECURSOS</Text>
            </View>

            <View style={styles.statCard}>
              <View style={[styles.statIconCircle, { backgroundColor: '#FDF4DF' }]}>
                <Ionicons name="help-circle" size={16} color="#D9A74A" />
              </View>
              <Text style={styles.statNumber}>3</Text>
              <Text style={styles.statLabel}>CURSOS</Text>
            </View>
          </View>

          {/* Sección Cursos Asignados */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Cursos asignados</Text>
            <Text style={styles.sectionSubtitle}>78 estudiantes en total</Text>
          </View>

          {/* Listado de Cursos Asignados */}
          <View style={styles.assignedCoursesContainer}>
            <TouchableOpacity style={styles.courseRowCard}>
              <View style={[styles.courseNumberBadge, { backgroundColor: '#EBF0EC', borderLeftWidth: 4, borderLeftColor: '#355343' }]}>
                <Text style={[styles.courseNumberText, { color: '#355343' }]}>4°</Text>
              </View>
              <View style={styles.courseRowInfo}>
                <Text style={styles.courseRowTitle}>4° Básico A</Text>
                <Text style={styles.courseRowStudents}>28 estudiantes</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color="#8E8A7E" />
            </TouchableOpacity>

            <TouchableOpacity style={styles.courseRowCard}>
              <View style={[styles.courseNumberBadge, { backgroundColor: '#FBECE8', borderLeftWidth: 4, borderLeftColor: '#C86D51' }]}>
                <Text style={[styles.courseNumberText, { color: '#C86D51' }]}>4°</Text>
              </View>
              <View style={styles.courseRowInfo}>
                <Text style={styles.courseRowTitle}>4° Básico B</Text>
                <Text style={styles.courseRowStudents}>26 estudiantes</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color="#8E8A7E" />
            </TouchableOpacity>
          </View>

        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9F6EE', // Fondo crema suave global
  },
  scrollContent: {
    paddingBottom: 40,
  },
  headerBg: {
    backgroundColor: '#2B4C3F', // Verde oscuro de la cabecera
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    paddingHorizontal: 24,
    paddingBottom: 60, // Espacio para que floten las tarjetas encima
  },
  profileHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarCircle: {
    width: 76,
    height: 76,
    borderRadius: 24,
    backgroundColor: '#D9A74A', // Color mostaza del avatar original
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#2B4C3F',
  },
  headerInfo: {
    flex: 1,
    marginLeft: 16,
  },
  profTag: {
    backgroundColor: '#D9A74A',
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    marginBottom: 4,
  },
  profTagText: {
    fontSize: 9,
    fontWeight: '900',
    color: '#2B4C3F',
  },
  userName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  userSubtitle: {
    fontSize: 13,
    color: '#E2DEC9',
    marginTop: 2,
    opacity: 0.9,
  },
  mainContentWrapper: {
    paddingHorizontal: 24,
    marginTop: -40, // Traslapa las tarjetas sobre el banner verde
  },
  // --- TARJETA DE NIVEL (ESTUDIANTE) ---
  levelCard: {
    backgroundColor: '#FFFDF9',
    borderRadius: 24,
    padding: 18,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 10,
  },
  levelRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  medalBadge: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
  levelInfo: {
    flex: 1,
    marginLeft: 16,
  },
  levelTag: {
    fontSize: 10,
    fontWeight: '800',
    color: '#8E8A7E',
    letterSpacing: 0.5,
  },
  levelTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#242424',
    marginTop: 1,
  },
  progressBarBg: {
    height: 8,
    backgroundColor: '#EBF0EC',
    borderRadius: 4,
    marginTop: 8,
    width: '100%',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#355343',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 11,
    color: '#8E8A7E',
    marginTop: 6,
    fontWeight: '600',
  },
  // --- TARJETA DE TABLA (PROFESOR) ---
  infoTableCard: {
    backgroundColor: '#FFFDF9',
    borderRadius: 24,
    paddingVertical: 12,
    paddingHorizontal: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 10,
  },
  tableRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 14,
    alignItems: 'center',
  },
  tableLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#8E8A7E',
    letterSpacing: 0.5,
  },
  tableValue: {
    fontSize: 14,
    fontWeight: '700',
    color: '#242424',
  },
  tableDivider: {
    height: 1,
    backgroundColor: '#F2EFE6',
  },
  // --- CONTENEDORES COMPARTIDOS DE ESTADÍSTICAS ---
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#FFFDF9',
    borderRadius: 20,
    paddingVertical: 16,
    alignItems: 'center',
    padding: 14,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.02,
    shadowRadius: 4,
  },
  statIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  statNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#242424',
  },
  statLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: '#8E8A7E',
    marginTop: 2,
    letterSpacing: 0.3,
  },
  // --- ENCABEZADOS DE SECCIÓN ---
  sectionHeader: {
    marginTop: 24,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#242424',
  },
  sectionSubtitle: {
    fontSize: 13,
    color: '#8E8A7E',
    marginTop: 2,
  },
  // --- GRID MEDALLAS (ESTUDIANTE) ---
  medalGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'space-between',
  },
  medalGridItem: {
    width: '31%',
    backgroundColor: '#FFFDF9',
    borderRadius: 24,
    paddingVertical: 16,
    paddingHorizontal: 8,
    alignItems: 'center',
    minHeight: 120,
    justifyContent: 'center',
  },
  medalCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
  },
  medalGridLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#242424',
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 13,
  },
  // --- LISTA DE CURSOS (PROFESOR) ---
  assignedCoursesContainer: {
    gap: 12,
  },
  courseRowCard: {
    backgroundColor: '#FFFDF9',
    borderRadius: 20,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.02,
    shadowRadius: 4,
  },
  courseNumberBadge: {
    width: 44,
    height: 44,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  courseNumberText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  courseRowInfo: {
    flex: 1,
    marginLeft: 14,
  },
  courseRowTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#242424',
  },
  courseRowStudents: {
    fontSize: 12,
    color: '#8E8A7E',
    marginTop: 1,
  },
});
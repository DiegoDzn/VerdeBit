import { Ionicons } from '@expo/vector-icons';
import { useGlobalSearchParams } from 'expo-router'; // 💡 Solución al rol perdido
import React from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// --- DATA MOCK ESTUDIANTE ---
const QUIZZES_ESTUDIANTE = [
  { id: '1', estado: 'ACTIVO', label: '5 PREGUNTAS · +50 PTS', titulo: 'Animales del humedal', desc: '5 preguntas sobre las aves y anfibios del humedal.', colorBg: '#355343', activo: true },
  { id: '2', estado: 'PRÓXIMAMENTE', label: 'PRÓXIMAMENTE', titulo: 'Plantas del humedal', desc: 'Próximamente', colorBg: '#75875c', activo: false },
  { id: '3', estado: 'PRÓXIMAMENTE', label: 'PRÓXIMAMENTE', titulo: 'Servicios del humedal', desc: 'Próximamente', colorBg: '#dfae4b', activo: false },
  { id: '4', estado: 'PRÓXIMAMENTE', label: 'PRÓXIMAMENTE', titulo: 'Cultura Mapuche y el agua', desc: 'Próximamente', colorBg: '#c46d46', activo: false },
];

// --- DATA MOCK PROFESOR ---
const CURSOS_PROFESOR = [
  { id: '1', tipo: 'ASIGNADO', tag: 'ASIGNADO A 4° A · 4° B · 5° A', titulo: 'Animales del humedal', completados: '62 de 78 completaron', promedio: '4.1/5', porcentaje: '79%', colorBorde: '#355343' },
  { id: '2', tipo: 'BORRADOR', tag: 'BORRADOR', titulo: 'Plantas del humedal', desc: 'Aún no publicado. Termina las preguntas para asignarlo a tus cursos.', totalPreguntas: '0 preg.', colorBorde: '#75875c' },
  { id: '3', tipo: 'BORRADOR', tag: 'BORRADOR', titulo: 'Servicios del humedal', desc: 'Aún no publicado. Termina las preguntas para asignarlo a tus cursos.', totalPreguntas: '0 preg.', colorBorde: '#dfae4b' },
];

export default function AulaVerdeScreen() {
  const insets = useSafeAreaInsets();
  
  // Capturamos el rol global para que persista entre pestañas
  const { rol } = useGlobalSearchParams<{ rol: 'estudiante' | 'profesor' }>();
  const userRol = rol || 'estudiante';

  // ==========================================
  // VISTA: ESTUDIANTE (07 · Quizzes estudiante)
  // ==========================================
  if (userRol === 'estudiante') {
    return (
      <View style={[styles.container, { paddingTop: insets.top + 15 }]}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={styles.headerSection}>
            <Text style={styles.mainTitle}>Quizzes</Text>
            <Text style={styles.subtitle}>Juega y gana medallas del humedal</Text>
          </View>

          <View style={styles.cardsContainer}>
            {QUIZZES_ESTUDIANTE.map((quiz) => (
              <View key={quiz.id} style={[styles.studentCard, { backgroundColor: quiz.colorBg }]}>
                <Text style={styles.studentCardLabel}>{quiz.label}</Text>
                <Text style={styles.studentCardTitle}>{quiz.titulo}</Text>
                <Text style={styles.studentCardDesc}>{quiz.desc}</Text>
                
                {quiz.activo && (
                  <TouchableOpacity style={styles.playButton}>
                    <Ionicons name="play" size={12} color="#242424" style={{ marginRight: 4 }} />
                    <Text style={styles.playButtonText}>Jugar</Text>
                  </TouchableOpacity>
                )}
              </View>
            ))}
          </View>
        </ScrollView>
      </View>
    );
  }

  // ==========================================
  // VISTA: PROFESOR (07b · Cursos profesor/a)
  // ==========================================
  return (
    <View style={[styles.container, { paddingTop: insets.top + 15 }]}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.headerSection}>
          <Text style={styles.mainTitle}>Mis cursos</Text>
          <Text style={styles.subtitle}>Quizzes asignados y progreso</Text>
        </View>

        {/* Botón Resumen General */}
        <TouchableOpacity style={styles.summaryButton}>
          <Text style={styles.summaryButtonText}>RESUMEN GENERAL</Text>
        </TouchableOpacity>

        <View style={styles.sectionDividerRow}>
          <Text style={styles.sectionHeading}>Quizzes del humedal</Text>
          <Text style={styles.sectionSubheading}>Toca uno para ver el detalle por curso</Text>
        </View>

        {/* Listado de Tarjetas de Cursos */}
        <View style={styles.cardsContainer}>
          {CURSOS_PROFESOR.map((curso) => (
            <View key={curso.id} style={[styles.teacherCard, { borderColor: curso.colorBorde }]}>
              
              <View style={styles.teacherCardHeader}>
                <View style={styles.iconCircleBg}>
                  <Ionicons name="help-circle-outline" size={20} color="#5c6e58" />
                </View>
                
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text style={[styles.teacherCardTag, { color: curso.tipo === 'BORRADOR' ? '#dfae4b' : '#355343' }]}>
                    {curso.tag}
                  </Text>
                  <Text style={styles.teacherCardTitle}>{curso.titulo}</Text>
                </View>

                {curso.porcentaje ? (
                  <View style={styles.percentBadge}>
                    <Text style={styles.percentText}>{curso.porcentaje}</Text>
                  </View>
                ) : (
                  <View style={styles.draftBadge}>
                    <Text style={styles.draftText}>{curso.totalPreguntas}</Text>
                  </View>
                )}
              </View>

              {/* Si está asignado, muestra barras de progreso métricas */}
              {curso.tipo === 'ASIGNADO' ? (
                <View style={styles.progressSection}>
                  <View style={styles.barBg}>
                    {/* 💡 CORRECCIÓN DE TIPADO AQUÍ: Convertimos explícitamente a tipo válido de dimensión */}
                    <View style={[styles.barFill, { width: curso.porcentaje as any }]} />
                  </View>
                  <View style={styles.metaRow}>
                    <Text style={styles.metaLeft}>{curso.completados}</Text>
                    <Text style={styles.metaRight}>
                      Promedio <Text style={{ fontWeight: 'bold' }}>{curso.promedio}</Text>
                    </Text>
                  </View>
                </View>
              ) : (
                /* Si es borrador, muestra la descripción inferior */
                <Text style={styles.teacherCardDesc}>{curso.desc}</Text>
              )}

            </View>
          ))}
        </View>
      </ScrollView>

      {/* --- BOTÓN FLOTANTE CREAR QUIZ --- */}
      <TouchableOpacity style={[styles.fabButton, { bottom: insets.bottom + 20 }]}>
        <Ionicons name="add" size={24} color="#ffffff" />
        <Text style={styles.fabText}>Crear quiz</Text>
      </TouchableOpacity>
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
    marginBottom: 20,
  },
  mainTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#242424',
  },
  subtitle: {
    fontSize: 15,
    color: '#7e7568',
    marginTop: 2,
  },
  cardsContainer: {
    gap: 16,
    marginTop: 10,
  },
  // --- ESTUDIANTE ---
  studentCard: {
    borderRadius: 24,
    padding: 20,
    minHeight: 130,
    justifyContent: 'center',
  },
  studentCardLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#ffffff',
    opacity: 0.7,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  studentCardTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#ffffff',
    marginTop: 2,
  },
  studentCardDesc: {
    fontSize: 13,
    color: '#ffffff',
    opacity: 0.85,
    marginTop: 6,
    lineHeight: 18,
  },
  playButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    alignSelf: 'flex-start',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 12,
    marginTop: 14,
  },
  playButtonText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#242424',
  },
  // --- PROFESOR ---
  summaryButton: {
    backgroundColor: '#355343',
    borderRadius: 16,
    paddingVertical: 12,
    alignItems: 'center',
    marginBottom: 24,
  },
  summaryButtonText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  sectionDividerRow: {
    marginBottom: 8,
  },
  sectionHeading: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#242424',
  },
  sectionSubheading: {
    fontSize: 13,
    color: '#7e7568',
    marginTop: 2,
  },
  teacherCard: {
    backgroundColor: '#ffffff',
    borderRadius: 24,
    padding: 16,
    borderLeftWidth: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.02,
    shadowRadius: 8,
    elevation: 2,
  },
  teacherCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconCircleBg: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: '#e9e6dd',
    justifyContent: 'center',
    alignItems: 'center',
  },
  teacherCardTag: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  teacherCardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#242424',
    marginTop: 1,
  },
  teacherCardDesc: {
    fontSize: 13,
    color: '#7e7568',
    marginTop: 12,
    lineHeight: 18,
    paddingLeft: 4,
  },
  percentBadge: {
    backgroundColor: '#f2f0eb',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },
  percentText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#355343',
  },
  draftBadge: {
    backgroundColor: '#edece7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
  },
  draftText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#7e7568',
  },
  progressSection: {
    marginTop: 16,
  },
  barBg: {
    height: 8,
    backgroundColor: '#f2f0eb',
    borderRadius: 4,
    width: '100%',
  },
  barFill: {
    height: '100%',
    backgroundColor: '#355343',
    borderRadius: 4,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  metaLeft: {
    fontSize: 12,
    fontWeight: '700',
    color: '#242424',
  },
  metaRight: {
    fontSize: 12,
    color: '#242424',
  },
  // --- FAB ---
  fabButton: {
    position: 'absolute',
    right: 24,
    backgroundColor: '#355343',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 6,
  },
  fabText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 15,
    marginLeft: 6,
  },
});
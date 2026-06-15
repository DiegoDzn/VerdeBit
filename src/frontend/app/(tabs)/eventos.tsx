import { Ionicons } from '@expo/vector-icons'; // Importamos los iconos
import { useRouter } from 'expo-router';
import React from 'react';
import { FlatList, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const EVENTOS_MOCK = [
  {
    id: '1',
    mes: 'MAY',
    dia: '22',
    diaSemana: 'VIE',
    titulo: 'Recorrido por el humedal',
    hora: '10:00 HRS',
    lugar: 'Escuela Reducción Monte Verde • Karü Mawida ',
    descripcion: 'Salida educativa para observar aves y plantas con guías Mapuche.',
    colorHeader: '#355343'
  },
  {
    id: '2',
    mes: 'MAY',
    dia: '28',
    diaSemana: 'JUE',
    titulo: 'Taller "Cuida tu humedal"',
    hora: '15:30 HRS',
    lugar: 'CENTRO CULTURAL',
    descripcion: 'Aprende técnicas básicas de conservación y reconocimiento del ecosistema local.',
    colorHeader: '#75875c'
  }
];

export default function EventosScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" />
      
      {/* BARRA SUPERIOR MODIFICADA */}
      <View style={styles.headerNav}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButtonSquare}>
          <Ionicons name="chevron-back" size={20} color="#242424" />
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <Text style={styles.sectionTitle}>Próximos eventos</Text>
        <Text style={styles.sectionSubtitle}>{EVENTOS_MOCK.length} actividades</Text>

        <FlatList
          data={EVENTOS_MOCK}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <View style={styles.cardEvent}>
              <View style={styles.calendarBadge}>
                <View style={[styles.calendarHeader, { backgroundColor: item.colorHeader }]} />
                <View style={styles.calendarBody}>
                  <Text style={styles.calendarMonth}>{item.mes}</Text>
                  <Text style={styles.calendarDayNum}>{item.dia}</Text>
                  <Text style={styles.calendarDayName}>{item.diaSemana}</Text>
                </View>
              </View>

              <View style={styles.eventInfoContainer}>
                <Text style={styles.eventTitle}>{item.titulo}</Text>
                <Text style={styles.eventMeta}>
                  {item.hora} · <Text style={styles.eventLocation}>{item.lugar}</Text>
                </Text>
                <Text style={styles.eventDescription} numberOfLines={2}>
                  {item.descripcion}
                </Text>
              </View>
            </View>
          )}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fbf4e6', 
  },
  // --- NUEVO ESTILO DEL BOTÓN DE VOLVER ---
  headerNav: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 12,
  },
  backButtonSquare: {
    width: 45,
    height: 45,
    backgroundColor: '#ffffff',
    borderRadius: 16, // Bordes bien redondeados como la foto
    justifyContent: 'center',
    alignItems: 'center',
    // Sombras ligeras para darle volumen
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 2,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
  sectionTitle: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#242424',
    marginTop: 8,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#7e7568',
    marginTop: 2,
    marginBottom: 20,
  },
  listContent: {
    gap: 16,
    paddingBottom: 40,
  },
  cardEvent: {
    backgroundColor: '#ffffff',
    borderRadius: 24,
    padding: 16,
    flexDirection: 'row',
    gap: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 10,
    elevation: 2,
  },
  calendarBadge: {
    width: 65,
    height: 80,
    backgroundColor: '#e9e6dd',
    borderRadius: 16,
    overflow: 'hidden',
    alignItems: 'center',
  },
  calendarHeader: {
    width: '100%',
    height: 14,
  },
  calendarBody: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 4,
  },
  calendarMonth: {
    fontSize: 9,
    fontWeight: '800',
    color: '#355343',
    letterSpacing: 0.5,
  },
  calendarDayNum: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#355343',
    lineHeight: 28,
  },
  calendarDayName: {
    fontSize: 8,
    fontWeight: '700',
    color: '#7e7568',
  },
  eventInfoContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  eventTitle: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#242424',
    marginBottom: 4,
  },
  eventMeta: {
    fontSize: 11,
    fontWeight: '800',
    color: '#355343',
    marginBottom: 6,
  },
  eventLocation: {
    color: '#355343',
  },
  eventDescription: {
    fontSize: 13,
    color: '#5c5449',
    lineHeight: 18,
  },
});
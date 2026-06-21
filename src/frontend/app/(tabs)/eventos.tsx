import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { listUpcomingEvents } from '@/lib/calendario/api';
import type { Event } from '@/lib/types';

// Constantes para formato de fechas y colores
const MESES_ABREV = ['ENE', 'FEB', 'MAR', 'ABR', 'MAY', 'JUN', 'JUL', 'AGO', 'SEP', 'OCT', 'NOV', 'DIC'];
const DIAS_SEMANA_ABREV = ['DOM', 'LUN', 'MAR', 'MIE', 'JUE', 'VIE', 'SÁB'];
const COLORES_EVENTOS = ['#355343', '#75875c', '#c96f43', '#3e6b52', '#9e3d3d', '#dfae4b'];

/**
 * Convierte un timestamp ISO a objeto con fecha formateada
 */
function formatearFecha(isoString: string) {
  const date = new Date(isoString);
  const mes = MESES_ABREV[date.getMonth()];
  const dia = String(date.getDate()).padStart(2, '0');
  const diaSemana = DIAS_SEMANA_ABREV[date.getDay()];
  const horas = String(date.getHours()).padStart(2, '0');
  const minutos = String(date.getMinutes()).padStart(2, '0');
  const hora = `${horas}:${minutos} HRS`;

  return { mes, dia, diaSemana, hora };
}

/**
 * Genera un color consistente basado en el índice del evento
 */
function obtenerColorEvento(index: number): string {
  return COLORES_EVENTOS[index % COLORES_EVENTOS.length];
}

export default function EventosScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [eventos, setEventos] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    cargarEventos();
  }, []);

  const cargarEventos = async () => {
    try {
      setLoading(true);
      const data = await listUpcomingEvents();
      setEventos(data);
    } catch (error) {
      console.error('Error al cargar eventos:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" />

      {/* BARRA SUPERIOR */}
      <View style={styles.headerNav}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButtonSquare}>
          <Ionicons name="chevron-back" size={20} color="#242424" />
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <Text style={styles.sectionTitle}>Próximos eventos</Text>
        <Text style={styles.sectionSubtitle}>{eventos.length} actividades</Text>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#3e6b52" />
          </View>
        ) : (
          <FlatList
            data={eventos}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            renderItem={({ item, index }) => {
              const { mes, dia, diaSemana, hora } = formatearFecha(item.starts_at);
              const colorHeader = obtenerColorEvento(index);

              return (
                <View style={styles.cardEvent}>
                  <View style={styles.calendarBadge}>
                    <View style={[styles.calendarHeader, { backgroundColor: colorHeader }]} />
                    <View style={styles.calendarBody}>
                      <Text style={styles.calendarMonth}>{mes}</Text>
                      <Text style={styles.calendarDayNum}>{dia}</Text>
                      <Text style={styles.calendarDayName}>{diaSemana}</Text>
                    </View>
                  </View>

                  <View style={styles.eventInfoContainer}>
                    <Text style={styles.eventTitle}>{item.title}</Text>
                    <Text style={styles.eventMeta}>
                      {hora} · <Text style={styles.eventLocation}>{item.location}</Text>
                    </Text>
                    <Text style={styles.eventDescription} numberOfLines={2}>
                      {item.description}
                    </Text>
                  </View>
                </View>
              );
            }}
          />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fbf4e6',
  },
  headerNav: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 12,
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
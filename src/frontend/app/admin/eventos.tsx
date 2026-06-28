import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  actualizarEventoAdmin,
  crearEventoAdmin,
  eliminarEventoAdmin,
  listarEventosAdmin,
  type AdminEventInput,
} from '@/lib/admin/api';
import { useAuth } from '@/lib/auth/AuthContext';
import type { Event } from '@/lib/types';

const FORMATO_FECHA = 'AAAA-MM-DD HH:mm';

function pad(value: number): string {
  return String(value).padStart(2, '0');
}

function formatearFechaCorta(iso: string): string {
  const fecha = new Date(iso);
  return fecha.toLocaleDateString('es-CL', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatearParaInput(iso: string | null): string {
  if (!iso) return '';
  const fecha = new Date(iso);
  return `${fecha.getFullYear()}-${pad(fecha.getMonth() + 1)}-${pad(fecha.getDate())} ${pad(fecha.getHours())}:${pad(fecha.getMinutes())}`;
}

function parsearFechaLocal(valor: string): string | null {
  const match = valor.trim().match(/^(\d{4})-(\d{2})-(\d{2})\s+(\d{2}):(\d{2})$/);
  if (!match) return null;

  const [, year, month, day, hour, minute] = match;
  const fecha = new Date(
    Number(year),
    Number(month) - 1,
    Number(day),
    Number(hour),
    Number(minute),
  );

  if (Number.isNaN(fecha.getTime())) return null;
  if (
    fecha.getFullYear() !== Number(year) ||
    fecha.getMonth() !== Number(month) - 1 ||
    fecha.getDate() !== Number(day) ||
    fecha.getHours() !== Number(hour) ||
    fecha.getMinutes() !== Number(minute)
  ) {
    return null;
  }

  return fecha.toISOString();
}

type FormState = {
  title: string;
  description: string;
  location: string;
  startsAt: string;
  endsAt: string;
};

const FORM_INICIAL: FormState = {
  title: '',
  description: '',
  location: '',
  startsAt: '',
  endsAt: '',
};

export default function AdminEventosScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { session } = useAuth();

  const [eventos, setEventos] = useState<Event[]>([]);
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [eventoEditando, setEventoEditando] = useState<Event | null>(null);
  const [form, setForm] = useState<FormState>(FORM_INICIAL);
  const [error, setError] = useState<string | null>(null);

  const eventosOrdenados = useMemo(
    () => [...eventos].sort((a, b) => new Date(a.starts_at).getTime() - new Date(b.starts_at).getTime()),
    [eventos],
  );

  const cargarEventos = async () => {
    setCargando(true);
    try {
      setEventos(await listarEventosAdmin());
    } catch (e) {
      Alert.alert('Error', e instanceof Error ? e.message : 'No se pudieron cargar los eventos.');
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarEventos();
  }, []);

  const abrirCrear = () => {
    setEventoEditando(null);
    setForm(FORM_INICIAL);
    setError(null);
    setModalVisible(true);
  };

  const abrirEditar = (evento: Event) => {
    setEventoEditando(evento);
    setForm({
      title: evento.title,
      description: evento.description ?? '',
      location: evento.location ?? '',
      startsAt: formatearParaInput(evento.starts_at),
      endsAt: formatearParaInput(evento.ends_at),
    });
    setError(null);
    setModalVisible(true);
  };

  const cerrarModal = () => {
    if (guardando) return;
    setModalVisible(false);
    setEventoEditando(null);
    setForm(FORM_INICIAL);
    setError(null);
  };

  const construirInput = (): AdminEventInput | null => {
    if (!form.title.trim()) {
      setError('El titulo es obligatorio.');
      return null;
    }

    const startsAt = parsearFechaLocal(form.startsAt);
    if (!startsAt) {
      setError(`La fecha de inicio debe usar el formato ${FORMATO_FECHA}.`);
      return null;
    }

    const endsAt = form.endsAt.trim() ? parsearFechaLocal(form.endsAt) : null;
    if (form.endsAt.trim() && !endsAt) {
      setError(`La fecha de termino debe usar el formato ${FORMATO_FECHA}.`);
      return null;
    }

    if (endsAt && new Date(endsAt).getTime() < new Date(startsAt).getTime()) {
      setError('La fecha de termino no puede ser anterior al inicio.');
      return null;
    }

    return {
      title: form.title.trim(),
      description: form.description.trim() || null,
      location: form.location.trim() || null,
      starts_at: startsAt,
      ends_at: endsAt,
    };
  };

  const guardarEvento = async () => {
    const input = construirInput();
    if (!input || !session?.user.id) return;

    setGuardando(true);
    setError(null);
    try {
      const eventoGuardado = eventoEditando
        ? await actualizarEventoAdmin(eventoEditando.id, input)
        : await crearEventoAdmin(session.user.id, input);

      setEventos((prev) => {
        if (eventoEditando) {
          return prev.map((evento) => evento.id === eventoGuardado.id ? eventoGuardado : evento);
        }
        return [...prev, eventoGuardado];
      });
      setModalVisible(false);
      setEventoEditando(null);
      setForm(FORM_INICIAL);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudo guardar el evento.');
    } finally {
      setGuardando(false);
    }
  };

  const confirmarEliminar = (evento: Event) => {
    Alert.alert(
      'Eliminar evento',
      `¿Seguro que quieres eliminar "${evento.title}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              await eliminarEventoAdmin(evento.id);
              setEventos((prev) => prev.filter((item) => item.id !== evento.id));
            } catch (e) {
              Alert.alert('Error', e instanceof Error ? e.message : 'No se pudo eliminar el evento.');
            }
          },
        },
      ],
    );
  };

  const actualizarCampo = (campo: keyof FormState, valor: string) => {
    setForm((prev) => ({ ...prev, [campo]: valor }));
  };

  const renderItem = ({ item }: { item: Event }) => {
    const esPasado = new Date(item.starts_at).getTime() < Date.now();

    return (
      <TouchableOpacity style={styles.card} activeOpacity={0.75} onPress={() => abrirEditar(item)}>
        <View style={[styles.iconCircle, esPasado && styles.iconCirclePast]}>
          <Ionicons name={esPasado ? 'time-outline' : 'calendar'} size={21} color="#355343" />
        </View>
        <View style={styles.cardInfo}>
          <Text style={styles.cardTitle} numberOfLines={1}>{item.title}</Text>
          <Text style={styles.cardMeta}>{formatearFechaCorta(item.starts_at)}</Text>
          <Text style={styles.cardDescription} numberOfLines={2}>
            {item.location || item.description || 'Sin ubicacion definida'}
          </Text>
        </View>
        <TouchableOpacity
          onPress={() => confirmarEliminar(item)}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          style={styles.deleteBtn}
        >
          <Ionicons name="trash-outline" size={18} color="#C86D51" />
        </TouchableOpacity>
        <Ionicons name="create-outline" size={18} color="#8E8A7E" />
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top + 15 }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={22} color="#242424" />
        </TouchableOpacity>
        <View style={styles.headerText}>
          <Text style={styles.titulo}>Eventos</Text>
          <Text style={styles.subtitulo}>{eventos.length} actividades registradas</Text>
        </View>
      </View>

      {cargando ? (
        <View style={styles.estadoVacio}>
          <ActivityIndicator size="large" color="#355343" />
        </View>
      ) : (
        <FlatList
          data={eventosOrdenados}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.listaContainer}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.estadoVacio}>
              <Text style={styles.estadoTexto}>No hay eventos creados todavía.</Text>
            </View>
          }
        />
      )}

      <TouchableOpacity
        style={[styles.fab, { bottom: insets.bottom + 20 }]}
        activeOpacity={0.8}
        onPress={abrirCrear}
      >
        <Ionicons name="add" size={24} color="#ffffff" />
        <Text style={styles.fabText}>Nuevo evento</Text>
      </TouchableOpacity>

      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
              <Text style={styles.modalTitulo}>
                {eventoEditando ? 'Editar evento' : 'Nuevo evento'}
              </Text>

              <Text style={styles.inputLabel}>Titulo *</Text>
              <TextInput
                style={styles.input}
                placeholder="Ej: Jornada de limpieza del humedal"
                placeholderTextColor="#8E8A7E"
                value={form.title}
                onChangeText={(value) => actualizarCampo('title', value)}
                editable={!guardando}
              />

              <Text style={styles.inputLabel}>Ubicacion</Text>
              <TextInput
                style={styles.input}
                placeholder="Ej: Entrada principal del humedal"
                placeholderTextColor="#8E8A7E"
                value={form.location}
                onChangeText={(value) => actualizarCampo('location', value)}
                editable={!guardando}
              />

              <Text style={styles.inputLabel}>Inicio * ({FORMATO_FECHA})</Text>
              <TextInput
                style={styles.input}
                placeholder="2026-07-10 09:30"
                placeholderTextColor="#8E8A7E"
                value={form.startsAt}
                onChangeText={(value) => actualizarCampo('startsAt', value)}
                editable={!guardando}
                autoCapitalize="none"
              />

              <Text style={styles.inputLabel}>Termino ({FORMATO_FECHA})</Text>
              <TextInput
                style={styles.input}
                placeholder="2026-07-10 11:00"
                placeholderTextColor="#8E8A7E"
                value={form.endsAt}
                onChangeText={(value) => actualizarCampo('endsAt', value)}
                editable={!guardando}
                autoCapitalize="none"
              />

              <Text style={styles.inputLabel}>Descripcion</Text>
              <TextInput
                style={[styles.input, styles.inputMultiline]}
                placeholder="Detalles para estudiantes y docentes..."
                placeholderTextColor="#8E8A7E"
                value={form.description}
                onChangeText={(value) => actualizarCampo('description', value)}
                editable={!guardando}
                multiline
                numberOfLines={4}
              />

              {error ? <Text style={styles.error}>{error}</Text> : null}

              <View style={styles.modalBotones}>
                <TouchableOpacity style={styles.btnCancelar} onPress={cerrarModal} disabled={guardando}>
                  <Text style={styles.btnCancelarText}>Cancelar</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.btnGuardar} onPress={guardarEvento} disabled={guardando}>
                  {guardando
                    ? <ActivityIndicator size="small" color="#ffffff" />
                    : <Text style={styles.btnGuardarText}>Guardar</Text>
                  }
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9F6EE' },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 24, marginBottom: 16, gap: 14 },
  backButton: { width: 40, height: 40, borderRadius: 14, backgroundColor: '#FFFDF9', justifyContent: 'center', alignItems: 'center', elevation: 1 },
  headerText: { flex: 1 },
  titulo: { fontSize: 26, fontWeight: 'bold', color: '#242424' },
  subtitulo: { fontSize: 13, color: '#8E8A7E', marginTop: 1 },
  listaContainer: { paddingHorizontal: 24, paddingBottom: 110, gap: 10 },
  card: { backgroundColor: '#FFFDF9', borderRadius: 20, padding: 14, flexDirection: 'row', alignItems: 'center', elevation: 1 },
  iconCircle: { width: 44, height: 44, borderRadius: 14, backgroundColor: '#EBF0EC', justifyContent: 'center', alignItems: 'center' },
  iconCirclePast: { backgroundColor: '#F2EFE6' },
  cardInfo: { flex: 1, marginLeft: 12 },
  cardTitle: { fontSize: 15, fontWeight: 'bold', color: '#242424' },
  cardMeta: { fontSize: 12, fontWeight: '700', color: '#355343', marginTop: 2 },
  cardDescription: { fontSize: 12, color: '#8E8A7E', marginTop: 3, lineHeight: 17 },
  deleteBtn: { padding: 6, marginRight: 2 },
  estadoVacio: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 24 },
  estadoTexto: { fontSize: 15, color: '#8E8A7E', textAlign: 'center' },
  fab: { position: 'absolute', right: 24, backgroundColor: '#355343', flexDirection: 'row', alignItems: 'center', paddingHorizontal: 18, paddingVertical: 14, borderRadius: 24, elevation: 6 },
  fabText: { color: '#ffffff', fontWeight: 'bold', fontSize: 15, marginLeft: 6 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  modalCard: { maxHeight: '90%', backgroundColor: '#FFFDF9', borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 24, paddingBottom: 40 },
  modalTitulo: { fontSize: 20, fontWeight: 'bold', color: '#242424', marginBottom: 16 },
  inputLabel: { fontSize: 12, fontWeight: '800', color: '#7E7568', letterSpacing: 0.4, marginBottom: 6, marginTop: 12 },
  input: { backgroundColor: '#F9F6EE', borderRadius: 16, borderWidth: 1, borderColor: '#E2DEC9', paddingHorizontal: 16, paddingVertical: 13, fontSize: 15, color: '#242424' },
  inputMultiline: { minHeight: 95, textAlignVertical: 'top' },
  error: { color: '#C86D51', fontSize: 13, marginTop: 12 },
  modalBotones: { flexDirection: 'row', gap: 12, marginTop: 22 },
  btnCancelar: { flex: 1, paddingVertical: 14, borderRadius: 16, borderWidth: 1, borderColor: '#E2DEC9', alignItems: 'center' },
  btnCancelarText: { fontSize: 15, fontWeight: '700', color: '#8E8A7E' },
  btnGuardar: { flex: 1, paddingVertical: 14, borderRadius: 16, backgroundColor: '#355343', alignItems: 'center' },
  btnGuardarText: { fontSize: 15, fontWeight: '800', color: '#ffffff' },
});

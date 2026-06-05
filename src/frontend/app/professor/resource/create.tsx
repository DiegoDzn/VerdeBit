import { Ionicons } from '@expo/vector-icons';
import { Stack, useRouter } from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import { palette, radius, spacing } from '@/constants/design';
import { useAuth } from '@/lib/auth/AuthContext';
import { createResource } from '@/lib/recursos/api';
import type { ResourceType } from '@/lib/types';

const TYPES: { value: ResourceType; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
  { value: 'link', label: 'Enlace', icon: 'link' },
  { value: 'pdf', label: 'PDF', icon: 'document-text' },
  { value: 'video', label: 'Video', icon: 'videocam' },
  { value: 'image', label: 'Imagen', icon: 'image' },
  { value: 'text', label: 'Texto', icon: 'reader' },
];

export default function CreateResourceScreen() {
  const router = useRouter();
  const { session } = useAuth();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [resourceType, setResourceType] = useState<ResourceType>('link');
  const [url, setUrl] = useState('');
  const [subjectArea, setSubjectArea] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSave = async () => {
    if (!title.trim()) { setError('El título es obligatorio.'); return; }
    if (!url.trim()) { setError('La URL o enlace del recurso es obligatoria.'); return; }
    if (!session?.user) return;

    setSaving(true);
    setError(null);
    try {
      await createResource(
        session.user.id,
        title.trim(),
        description.trim() || null,
        resourceType,
        url.trim(),
        subjectArea.trim() || null,
      );
      router.back();
    } catch {
      setError('No se pudo publicar el recurso. Inténtalo de nuevo.');
      setSaving(false);
    }
  };

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Stack.Screen options={{ title: 'Publicar recurso', headerBackTitle: 'Inicio' }} />

      <Text style={styles.label}>Título *</Text>
      <TextInput
        style={styles.input}
        placeholder="Ej: Guía de aves del humedal"
        placeholderTextColor={palette.sub}
        value={title}
        onChangeText={setTitle}
        editable={!saving}
      />

      <Text style={styles.label}>Tipo de recurso</Text>
      <View style={styles.typeRow}>
        {TYPES.map((t) => (
          <TouchableOpacity
            key={t.value}
            style={[styles.typeChip, resourceType === t.value && styles.typeChipOn]}
            onPress={() => setResourceType(t.value)}
            disabled={saving}
          >
            <Ionicons
              name={t.icon}
              size={16}
              color={resourceType === t.value ? '#fff' : palette.primary}
            />
            <Text style={[styles.typeChipText, resourceType === t.value && styles.typeChipTextOn]}>
              {t.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.label}>URL o enlace *</Text>
      <TextInput
        style={styles.input}
        placeholder="https://..."
        placeholderTextColor={palette.sub}
        value={url}
        onChangeText={setUrl}
        autoCapitalize="none"
        keyboardType="url"
        editable={!saving}
      />

      <Text style={styles.label}>Descripción</Text>
      <TextInput
        style={[styles.input, styles.inputMultiline]}
        placeholder="Breve descripción del recurso"
        placeholderTextColor={palette.sub}
        value={description}
        onChangeText={setDescription}
        multiline
        numberOfLines={3}
        editable={!saving}
      />

      <Text style={styles.label}>Área temática</Text>
      <TextInput
        style={styles.input}
        placeholder="Ej: Flora, Fauna, Cultura"
        placeholderTextColor={palette.sub}
        value={subjectArea}
        onChangeText={setSubjectArea}
        editable={!saving}
      />

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <TouchableOpacity
        style={[styles.saveButton, saving && styles.saveButtonDisabled]}
        onPress={handleSave}
        disabled={saving}
      >
        {saving ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.saveText}>Publicar recurso</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity style={styles.cancelButton} onPress={() => router.back()} disabled={saving}>
        <Text style={styles.cancelText}>Cancelar</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: palette.bg },
  content: { padding: spacing.xl, gap: spacing.sm, paddingBottom: 60 },
  label: {
    fontSize: 14,
    fontWeight: '700',
    color: palette.ink,
    marginTop: spacing.md,
    marginBottom: 4,
  },
  input: {
    backgroundColor: palette.card,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: palette.line,
    padding: spacing.lg,
    fontSize: 16,
    color: palette.ink,
  },
  inputMultiline: { minHeight: 80, textAlignVertical: 'top' },
  typeRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  typeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radius.sm,
    borderWidth: 1.5,
    borderColor: palette.line,
    backgroundColor: palette.card,
  },
  typeChipOn: { backgroundColor: palette.primary, borderColor: palette.primary },
  typeChipText: { fontSize: 13, fontWeight: '700', color: palette.primary },
  typeChipTextOn: { color: '#fff' },
  error: { color: palette.error, fontSize: 14, marginTop: spacing.sm },
  saveButton: {
    backgroundColor: palette.secondary,
    borderRadius: radius.md,
    padding: spacing.lg,
    alignItems: 'center',
    marginTop: spacing.xl,
  },
  saveButtonDisabled: { opacity: 0.6 },
  saveText: { color: '#fff', fontWeight: '800', fontSize: 16 },
  cancelButton: { alignItems: 'center', padding: spacing.md },
  cancelText: { color: palette.sub, fontSize: 15, fontWeight: '600' },
});

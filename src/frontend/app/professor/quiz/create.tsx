import { Stack, useRouter } from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import { palette, radius, spacing } from '@/constants/design';
import { useAuth } from '@/lib/auth/AuthContext';
import { createQuiz } from '@/lib/professor/api';

export default function CreateQuizScreen() {
  const router = useRouter();
  const { session } = useAuth();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [topic, setTopic] = useState('');
  const [pointsReward, setPointsReward] = useState('10');
  const [isPublished, setIsPublished] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSave = async () => {
    if (!title.trim()) {
      setError('El título es obligatorio.');
      return;
    }
    if (!session?.user) return;

    setSaving(true);
    setError(null);
    try {
      const quiz = await createQuiz(
        session.user.id,
        title.trim(),
        description.trim() || null,
        topic.trim() || null,
        parseInt(pointsReward, 10) || 10,
        isPublished,
      );
      router.replace(`/professor/quiz/${quiz.id}`);
    } catch {
      setError('No se pudo crear el quiz. Inténtalo de nuevo.');
      setSaving(false);
    }
  };

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Stack.Screen options={{ title: 'Nuevo quiz', headerBackTitle: 'Cursos' }} />

      <Text style={styles.label}>Título *</Text>
      <TextInput
        style={styles.input}
        placeholder="Ej: Conoce el Humedal"
        placeholderTextColor={palette.sub}
        value={title}
        onChangeText={setTitle}
        editable={!saving}
      />

      <Text style={styles.label}>Descripción</Text>
      <TextInput
        style={[styles.input, styles.inputMultiline]}
        placeholder="Descripción breve del quiz"
        placeholderTextColor={palette.sub}
        value={description}
        onChangeText={setDescription}
        multiline
        numberOfLines={3}
        editable={!saving}
      />

      <Text style={styles.label}>Tema</Text>
      <TextInput
        style={styles.input}
        placeholder="Ej: Flora y Fauna"
        placeholderTextColor={palette.sub}
        value={topic}
        onChangeText={setTopic}
        editable={!saving}
      />

      <Text style={styles.label}>Puntos al completar</Text>
      <TextInput
        style={styles.input}
        placeholder="10"
        placeholderTextColor={palette.sub}
        value={pointsReward}
        onChangeText={setPointsReward}
        keyboardType="number-pad"
        editable={!saving}
      />

      <View style={styles.switchRow}>
        <Text style={styles.label}>Publicar al guardar</Text>
        <Switch
          value={isPublished}
          onValueChange={setIsPublished}
          trackColor={{ true: palette.primary }}
          disabled={saving}
        />
      </View>

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <TouchableOpacity
        style={[styles.saveButton, saving && styles.saveButtonDisabled]}
        onPress={handleSave}
        disabled={saving}
      >
        {saving ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.saveText}>Crear quiz y agregar preguntas →</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity style={styles.cancelButton} onPress={() => router.back()} disabled={saving}>
        <Text style={styles.cancelText}>Cancelar</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: palette.bg,
  },
  content: {
    padding: spacing.xl,
    gap: spacing.sm,
    paddingBottom: 60,
  },
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
  inputMultiline: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.lg,
  },
  error: {
    color: palette.error,
    fontSize: 14,
    marginTop: spacing.sm,
  },
  saveButton: {
    backgroundColor: palette.primary,
    borderRadius: radius.md,
    padding: spacing.lg,
    alignItems: 'center',
    marginTop: spacing.xl,
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveText: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 16,
  },
  cancelButton: {
    alignItems: 'center',
    padding: spacing.md,
  },
  cancelText: {
    color: palette.sub,
    fontSize: 15,
    fontWeight: '600',
  },
});

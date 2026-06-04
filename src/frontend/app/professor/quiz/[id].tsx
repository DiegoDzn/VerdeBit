import { Ionicons } from '@expo/vector-icons';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Modal,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import { palette, radius, spacing } from '@/constants/design';
import {
  createOption,
  createQuestion,
  deleteQuestion,
  getQuiz,
  getQuizQuestions,
  updateOption,
  updateQuiz,
} from '@/lib/professor/api';
import type { Quiz, QuizQuestion } from '@/lib/types';

export default function EditQuizScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [topic, setTopic] = useState('');
  const [pointsReward, setPointsReward] = useState('10');
  const [isPublished, setIsPublished] = useState(false);

  const [showQuestionModal, setShowQuestionModal] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<QuizQuestion | null>(null);

  const reload = useCallback(async () => {
    if (!id) return;
    try {
      const [q, qs] = await Promise.all([getQuiz(id), getQuizQuestions(id)]);
      setQuiz(q);
      setTitle(q.title);
      setDescription(q.description ?? '');
      setTopic(q.topic ?? '');
      setPointsReward(String(q.points_reward));
      setIsPublished(q.is_published);
      setQuestions(qs);
    } catch {
      setError('No se pudo cargar el quiz.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { reload(); }, [reload]);

  const handleSave = async () => {
    if (!title.trim() || !id) return;
    setSaving(true);
    setError(null);
    try {
      await updateQuiz(id, {
        title: title.trim(),
        description: description.trim() || undefined,
        topic: topic.trim() || undefined,
        points_reward: parseInt(pointsReward, 10) || 10,
        is_published: isPublished,
      });
      router.back();
    } catch {
      setError('No se pudo guardar el quiz.');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteQuestion = (questionId: string) => {
    Alert.alert('Eliminar pregunta', '¿Estás seguro?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Eliminar',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteQuestion(questionId);
            reload();
          } catch {}
        },
      },
    ]);
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <Stack.Screen options={{ title: 'Editar quiz' }} />
        <ActivityIndicator size="large" color={palette.primary} />
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <Stack.Screen options={{ title: quiz?.title ?? 'Editar quiz', headerBackTitle: 'Cursos' }} />
      <ScrollView style={styles.screen} contentContainerStyle={styles.content}>

        <Text style={styles.sectionTitle}>Datos del quiz</Text>

        <Text style={styles.label}>Título *</Text>
        <TextInput
          style={styles.input}
          value={title}
          onChangeText={setTitle}
          editable={!saving}
          placeholderTextColor={palette.sub}
        />

        <Text style={styles.label}>Descripción</Text>
        <TextInput
          style={[styles.input, styles.inputMultiline]}
          value={description}
          onChangeText={setDescription}
          multiline
          numberOfLines={3}
          editable={!saving}
          placeholderTextColor={palette.sub}
        />

        <Text style={styles.label}>Tema</Text>
        <TextInput
          style={styles.input}
          value={topic}
          onChangeText={setTopic}
          editable={!saving}
          placeholderTextColor={palette.sub}
        />

        <Text style={styles.label}>Puntos al completar</Text>
        <TextInput
          style={styles.input}
          value={pointsReward}
          onChangeText={setPointsReward}
          keyboardType="number-pad"
          editable={!saving}
          placeholderTextColor={palette.sub}
        />

        <View style={styles.switchRow}>
          <Text style={styles.label}>Publicado</Text>
          <Switch
            value={isPublished}
            onValueChange={setIsPublished}
            trackColor={{ true: palette.primary }}
            disabled={saving}
          />
        </View>

        <Text style={[styles.sectionTitle, { marginTop: spacing.xl }]}>
          Preguntas ({questions.length})
        </Text>

        {questions.map((q, idx) => (
          <View key={q.id} style={styles.questionCard}>
            <View style={styles.questionHeader}>
              <Text style={styles.questionNumber}>P{idx + 1}</Text>
              <Text style={styles.questionPrompt} numberOfLines={2}>{q.prompt}</Text>
              <View style={styles.questionActions}>
                <TouchableOpacity onPress={() => { setEditingQuestion(q); setShowQuestionModal(true); }}>
                  <Ionicons name="create-outline" size={20} color={palette.primary} />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => handleDeleteQuestion(q.id)}>
                  <Ionicons name="trash-outline" size={20} color={palette.rose} />
                </TouchableOpacity>
              </View>
            </View>
            <Text style={styles.optionsCount}>
              {q.quiz_options.length} opciones ·{' '}
              {q.quiz_options.filter((o) => o.is_correct).length} correcta(s)
            </Text>
          </View>
        ))}

        <TouchableOpacity
          style={styles.addQuestionButton}
          onPress={() => { setEditingQuestion(null); setShowQuestionModal(true); }}
        >
          <Ionicons name="add-circle-outline" size={20} color={palette.secondary} />
          <Text style={styles.addQuestionText}>Agregar pregunta</Text>
        </TouchableOpacity>

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <TouchableOpacity
          style={[styles.saveButton, saving && styles.saveButtonDisabled]}
          onPress={handleSave}
          disabled={saving}
        >
          {saving ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveText}>Guardar cambios</Text>}
        </TouchableOpacity>

        <TouchableOpacity style={styles.cancelButton} onPress={() => router.back()}>
          <Text style={styles.cancelText}>Cancelar</Text>
        </TouchableOpacity>
      </ScrollView>

      <QuestionModal
        visible={showQuestionModal}
        quizId={id!}
        question={editingQuestion}
        onClose={() => setShowQuestionModal(false)}
        onSaved={() => { setShowQuestionModal(false); reload(); }}
      />
    </View>
  );
}

function QuestionModal({
  visible,
  quizId,
  question,
  onClose,
  onSaved,
}: {
  visible: boolean;
  quizId: string;
  question: QuizQuestion | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [prompt, setPrompt] = useState('');
  const [options, setOptions] = useState([
    { label: '', is_correct: false },
    { label: '', is_correct: false },
    { label: '', is_correct: false },
    { label: '', is_correct: false },
  ]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (question) {
      setPrompt(question.prompt);
      const opts = question.quiz_options.slice(0, 4).map((o) => ({
        label: o.label,
        is_correct: o.is_correct,
      }));
      while (opts.length < 4) opts.push({ label: '', is_correct: false });
      setOptions(opts);
    } else {
      setPrompt('');
      setOptions([
        { label: '', is_correct: false },
        { label: '', is_correct: false },
        { label: '', is_correct: false },
        { label: '', is_correct: false },
      ]);
    }
    setError(null);
  }, [question, visible]);

  const setOptionLabel = (idx: number, label: string) => {
    setOptions((prev) => prev.map((o, i) => (i === idx ? { ...o, label } : o)));
  };

  const setCorrect = (idx: number) => {
    setOptions((prev) => prev.map((o, i) => ({ ...o, is_correct: i === idx })));
  };

  const handleSave = async () => {
    if (!prompt.trim()) { setError('El enunciado es obligatorio.'); return; }
    const filled = options.filter((o) => o.label.trim());
    if (filled.length < 2) { setError('Agrega al menos 2 opciones.'); return; }
    if (!options.some((o) => o.is_correct && o.label.trim())) {
      setError('Marca una opción como correcta.');
      return;
    }

    setSaving(true);
    setError(null);
    try {
      if (question) {
        for (let i = 0; i < question.quiz_options.length; i++) {
          const opt = options[i];
          if (opt && question.quiz_options[i]) {
            await updateOption(question.quiz_options[i].id, opt.label || '', opt.is_correct, i);
          }
        }
        for (let i = question.quiz_options.length; i < 4; i++) {
          const opt = options[i];
          if (opt?.label.trim()) {
            await createOption(question.id, opt.label.trim(), opt.is_correct, i);
          }
        }
      } else {
        const newQ = await createQuestion(quizId, prompt.trim(), Date.now());
        for (let i = 0; i < 4; i++) {
          const opt = options[i];
          if (opt?.label.trim()) {
            await createOption(newQ.id, opt.label.trim(), opt.is_correct, i);
          }
        }
      }
      onSaved();
    } catch {
      setError('No se pudo guardar la pregunta.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <ScrollView style={styles.modalScreen} contentContainerStyle={styles.modalContent}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>{question ? 'Editar pregunta' : 'Nueva pregunta'}</Text>
          <TouchableOpacity onPress={onClose}>
            <Ionicons name="close" size={24} color={palette.ink} />
          </TouchableOpacity>
        </View>

        <Text style={styles.label}>Enunciado *</Text>
        <TextInput
          style={[styles.input, styles.inputMultiline]}
          placeholder="¿Cuál es...?"
          placeholderTextColor={palette.sub}
          value={prompt}
          onChangeText={setPrompt}
          multiline
          numberOfLines={3}
          editable={!saving}
        />

        <Text style={[styles.label, { marginTop: spacing.lg }]}>Opciones (toca el círculo para marcar correcta)</Text>
        {options.map((opt, idx) => (
          <View key={idx} style={styles.optionRow}>
            <TouchableOpacity style={styles.radioButton} onPress={() => setCorrect(idx)}>
              <View style={[styles.radioInner, opt.is_correct && styles.radioInnerSelected]} />
            </TouchableOpacity>
            <TextInput
              style={[styles.input, styles.optionInput]}
              placeholder={`Opción ${idx + 1}`}
              placeholderTextColor={palette.sub}
              value={opt.label}
              onChangeText={(v) => setOptionLabel(idx, v)}
              editable={!saving}
            />
          </View>
        ))}

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <TouchableOpacity
          style={[styles.saveButton, saving && styles.saveButtonDisabled]}
          onPress={handleSave}
          disabled={saving}
        >
          {saving ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveText}>Guardar pregunta</Text>}
        </TouchableOpacity>
      </ScrollView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: palette.bg },
  content: { padding: spacing.xl, gap: spacing.xs, paddingBottom: 80 },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: palette.bg },
  sectionTitle: { fontSize: 18, fontWeight: '800', color: palette.ink, marginBottom: spacing.xs },
  label: { fontSize: 14, fontWeight: '700', color: palette.ink, marginTop: spacing.md, marginBottom: 4 },
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
  switchRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: spacing.lg },
  questionCard: {
    backgroundColor: palette.card,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: palette.line,
    padding: spacing.lg,
    marginTop: spacing.md,
  },
  questionHeader: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.sm },
  questionNumber: { fontSize: 13, fontWeight: '800', color: palette.secondary, minWidth: 24 },
  questionPrompt: { flex: 1, fontSize: 14, color: palette.ink, fontWeight: '600' },
  questionActions: { flexDirection: 'row', gap: spacing.md },
  optionsCount: { fontSize: 12, color: palette.sub, marginTop: 4 },
  addQuestionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.lg,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: palette.secondary,
    borderRadius: radius.lg,
    justifyContent: 'center',
    marginTop: spacing.md,
  },
  addQuestionText: { color: palette.secondary, fontWeight: '800', fontSize: 15 },
  error: { color: palette.error, fontSize: 14, marginTop: spacing.sm },
  saveButton: { backgroundColor: palette.primary, borderRadius: radius.md, padding: spacing.lg, alignItems: 'center', marginTop: spacing.xl },
  saveButtonDisabled: { opacity: 0.6 },
  saveText: { color: '#fff', fontWeight: '800', fontSize: 16 },
  cancelButton: { alignItems: 'center', padding: spacing.md },
  cancelText: { color: palette.sub, fontSize: 15, fontWeight: '600' },
  modalScreen: { flex: 1, backgroundColor: palette.bg },
  modalContent: { padding: spacing.xl, paddingBottom: 60 },
  modalHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.lg },
  modalTitle: { fontSize: 20, fontWeight: '800', color: palette.ink },
  optionRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, marginTop: spacing.sm },
  radioButton: { width: 28, height: 28, borderRadius: 14, borderWidth: 2, borderColor: palette.primary, alignItems: 'center', justifyContent: 'center' },
  radioInner: { width: 14, height: 14, borderRadius: 7 },
  radioInnerSelected: { backgroundColor: palette.primary },
  optionInput: { flex: 1 },
});

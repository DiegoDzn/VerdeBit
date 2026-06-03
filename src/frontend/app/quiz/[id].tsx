import { Ionicons } from '@expo/vector-icons';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { palette, radius, spacing } from '@/constants/design';
import { useAuth } from '@/lib/auth/AuthContext';
import {
  completeAttempt,
  createAttempt,
  getQuizWithQuestions,
  saveAnswer,
} from '@/lib/quizzes/api';
import type { Quiz, QuizQuestion } from '@/lib/types';

export default function QuizPlayScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { session } = useAuth();

  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const attemptId = useRef<string | null>(null);
  const correctCount = useRef(0);

  const [qIdx, setQIdx] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [answered, setAnswered] = useState(false);
  const [finishing, setFinishing] = useState(false);

  useEffect(() => {
    let active = true;
    (async () => {
      if (!id || !session?.user) return;
      try {
        const { quiz: q, questions: qs } = await getQuizWithQuestions(id);
        if (!active) return;
        if (qs.length === 0) {
          setError('Este quiz aún no tiene preguntas.');
          setLoading(false);
          return;
        }
        const attempt = await createAttempt(id, session.user.id);
        if (!active) return;
        attemptId.current = attempt.id;
        setQuiz(q);
        setQuestions(qs);
        setLoading(false);
      } catch {
        if (active) {
          setError('No pudimos iniciar el quiz. Inténtalo de nuevo.');
          setLoading(false);
        }
      }
    })();
    return () => {
      active = false;
    };
  }, [id, session?.user]);

  const question = questions[qIdx];
  const isLast = qIdx === questions.length - 1;

  const handlePick = async (optionId: string, isCorrect: boolean) => {
    if (answered) return;
    setSelectedOption(optionId);
    setAnswered(true);
    if (isCorrect) correctCount.current += 1;
    if (attemptId.current) {
      try {
        await saveAnswer(attemptId.current, question.id, optionId);
      } catch {}
    }
  };

  const handleNext = async () => {
    if (!isLast) {
      setQIdx((i) => i + 1);
      setSelectedOption(null);
      setAnswered(false);
      return;
    }
    setFinishing(true);
    if (attemptId.current) {
      try {
        await completeAttempt(attemptId.current, correctCount.current);
      } catch {}
    }
    router.replace({
      pathname: '/quiz/resultado',
      params: {
        aciertos: String(correctCount.current),
        total: String(questions.length),
        puntos: String(quiz?.points_reward ?? 0),
      },
    });
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <Stack.Screen options={{ title: 'Quiz' }} />
        <ActivityIndicator size="large" color={palette.primary} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Stack.Screen options={{ title: 'Quiz' }} />
        <Ionicons name="alert-circle-outline" size={48} color={palette.sub} />
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.primaryButton} onPress={() => router.back()}>
          <Text style={styles.primaryButtonText}>Volver</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const progress = ((qIdx + (answered ? 1 : 0)) / questions.length) * 100;

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: quiz?.title ?? 'Quiz', headerBackVisible: false }} />

      <View style={styles.progressTrack}>
        <View style={[styles.progressFill, { width: `${progress}%` }]} />
      </View>
      <Text style={styles.counter}>
        Pregunta {qIdx + 1} de {questions.length}
      </Text>

      <ScrollView contentContainerStyle={styles.body}>
        <Text style={styles.prompt}>{question.prompt}</Text>

        {question.quiz_options.map((option) => {
          const isPicked = selectedOption === option.id;
          const showCorrect = answered && option.is_correct;
          const showWrong = answered && isPicked && !option.is_correct;

          return (
            <TouchableOpacity
              key={option.id}
              style={[
                styles.option,
                showCorrect && styles.optionCorrect,
                showWrong && styles.optionWrong,
              ]}
              onPress={() => handlePick(option.id, option.is_correct)}
              disabled={answered}
              activeOpacity={0.8}
            >
              <Text
                style={[
                  styles.optionLabel,
                  (showCorrect || showWrong) && styles.optionLabelOnColor,
                ]}
              >
                {option.label}
              </Text>
              {showCorrect ? (
                <Ionicons name="checkmark-circle" size={22} color="#fff" />
              ) : showWrong ? (
                <Ionicons name="close-circle" size={22} color="#fff" />
              ) : null}
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {answered ? (
        <TouchableOpacity
          style={styles.nextButton}
          onPress={handleNext}
          disabled={finishing}
        >
          {finishing ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.nextText}>{isLast ? 'Ver resultado →' : 'Siguiente →'}</Text>
          )}
        </TouchableOpacity>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: palette.bg,
    padding: spacing.xl,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: palette.bg,
    padding: spacing.xxl,
    gap: spacing.md,
  },
  errorText: {
    color: palette.sub,
    fontSize: 16,
    textAlign: 'center',
  },
  progressTrack: {
    height: 10,
    borderRadius: 5,
    backgroundColor: palette.line,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: palette.primary,
  },
  counter: {
    marginTop: spacing.sm,
    fontSize: 13,
    fontWeight: '700',
    color: palette.sub,
  },
  body: {
    paddingVertical: spacing.xl,
    gap: spacing.md,
  },
  prompt: {
    fontSize: 22,
    fontWeight: '800',
    color: palette.ink,
    marginBottom: spacing.md,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: palette.card,
    borderWidth: 2,
    borderColor: palette.line,
    borderRadius: radius.lg,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.xl,
    minHeight: 56,
  },
  optionCorrect: {
    backgroundColor: palette.success,
    borderColor: palette.success,
  },
  optionWrong: {
    backgroundColor: palette.rose,
    borderColor: palette.rose,
  },
  optionLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: palette.ink,
    flex: 1,
  },
  optionLabelOnColor: {
    color: '#fff',
  },
  nextButton: {
    backgroundColor: palette.primary,
    paddingVertical: spacing.lg,
    borderRadius: radius.md,
    alignItems: 'center',
  },
  nextText: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 17,
  },
  primaryButton: {
    backgroundColor: palette.primary,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xxl,
    borderRadius: radius.md,
  },
  primaryButtonText: {
    color: '#fff',
    fontWeight: '700',
  },
});

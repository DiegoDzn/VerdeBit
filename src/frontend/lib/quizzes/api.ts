import { supabase } from '@/lib/supabase/client';
import type { Quiz, QuizAttempt, QuizQuestion } from '@/lib/types';

export async function listPublishedQuizzes(): Promise<Quiz[]> {
  const { data, error } = await supabase
    .from('quizzes')
    .select('*')
    .eq('is_published', true)
    .order('created_at', { ascending: false });

  if (error) throw new Error(error.message);
  return (data ?? []) as Quiz[];
}

export async function getQuizWithQuestions(
  quizId: string,
): Promise<{ quiz: Quiz; questions: QuizQuestion[] }> {
  const { data: quiz, error: quizError } = await supabase
    .from('quizzes')
    .select('*')
    .eq('id', quizId)
    .single();

  if (quizError) throw new Error(quizError.message);

  const { data: questions, error: questionsError } = await supabase
    .from('quiz_questions')
    .select('*, quiz_options(*)')
    .eq('quiz_id', quizId)
    .order('position', { ascending: true });

  if (questionsError) throw new Error(questionsError.message);

  const ordered = (questions ?? []).map((q: QuizQuestion) => ({
    ...q,
    quiz_options: [...q.quiz_options].sort((a, b) => a.position - b.position),
  }));

  return { quiz: quiz as Quiz, questions: ordered as QuizQuestion[] };
}

export async function createAttempt(quizId: string, studentId: string): Promise<QuizAttempt> {
  const { data, error } = await supabase
    .from('quiz_attempts')
    .insert({ quiz_id: quizId, student_id: studentId })
    .select('*')
    .single();

  if (error) throw new Error(error.message);
  return data as QuizAttempt;
}

export async function saveAnswer(
  attemptId: string,
  questionId: string,
  optionId: string,
): Promise<void> {
  const { error } = await supabase
    .from('quiz_answers')
    .insert({ attempt_id: attemptId, question_id: questionId, option_id: optionId });

  if (error) throw new Error(error.message);
}

export async function completeAttempt(attemptId: string, score: number): Promise<void> {
  const { error } = await supabase
    .from('quiz_attempts')
    .update({ score, completed_at: new Date().toISOString() })
    .eq('id', attemptId);

  if (error) throw new Error(error.message);
}

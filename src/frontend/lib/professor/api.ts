import { supabase } from '@/lib/supabase/client';
import type { Quiz, QuizOption, QuizQuestion } from '@/lib/types';

export async function getMyQuizzes(userId: string): Promise<Quiz[]> {
  const { data, error } = await supabase
    .from('quizzes')
    .select('*')
    .eq('author_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw new Error(error.message);
  return (data ?? []) as Quiz[];
}

export async function getQuiz(quizId: string): Promise<Quiz> {
  const { data, error } = await supabase
    .from('quizzes')
    .select('*')
    .eq('id', quizId)
    .single();

  if (error) throw new Error(error.message);
  return data as Quiz;
}

export async function createQuiz(
  authorId: string,
  title: string,
  description: string | null,
  topic: string | null,
  pointsReward: number,
  isPublished: boolean = false,
): Promise<Quiz> {
  const { data, error } = await supabase
    .from('quizzes')
    .insert({
      author_id: authorId,
      title,
      description,
      topic,
      points_reward: pointsReward,
      is_published: isPublished,
    })
    .select('*')
    .single();

  if (error) throw new Error(error.message);
  return data as Quiz;
}

export async function updateQuiz(
  quizId: string,
  updates: Partial<{ title: string; description: string; topic: string; points_reward: number; is_published: boolean }>,
): Promise<void> {
  const { error } = await supabase
    .from('quizzes')
    .update(updates)
    .eq('id', quizId);

  if (error) throw new Error(error.message);
}

export async function deleteQuiz(quizId: string): Promise<void> {
  const { error } = await supabase
    .from('quizzes')
    .delete()
    .eq('id', quizId);

  if (error) throw new Error(error.message);
}

export async function getQuizQuestions(quizId: string): Promise<QuizQuestion[]> {
  const { data, error } = await supabase
    .from('quiz_questions')
    .select('*, quiz_options(*)')
    .eq('quiz_id', quizId)
    .order('position', { ascending: true });

  if (error) throw new Error(error.message);

  const questions = (data ?? []) as any[];
  return questions.map((q) => ({
    ...q,
    quiz_options: q.quiz_options.sort((a: QuizOption, b: QuizOption) => a.position - b.position),
  })) as QuizQuestion[];
}

export async function createQuestion(
  quizId: string,
  prompt: string,
  position: number,
): Promise<QuizQuestion> {
  const { data, error } = await supabase
    .from('quiz_questions')
    .insert({ quiz_id: quizId, prompt, position })
    .select('*, quiz_options(*)')
    .single();

  if (error) throw new Error(error.message);
  return data as QuizQuestion;
}

export async function updateQuestion(
  questionId: string,
  prompt: string,
  position: number,
): Promise<void> {
  const { error } = await supabase
    .from('quiz_questions')
    .update({ prompt, position })
    .eq('id', questionId);

  if (error) throw new Error(error.message);
}

export async function deleteQuestion(questionId: string): Promise<void> {
  const { error } = await supabase
    .from('quiz_questions')
    .delete()
    .eq('id', questionId);

  if (error) throw new Error(error.message);
}

export async function createOption(
  questionId: string,
  label: string,
  isCorrect: boolean,
  position: number,
): Promise<QuizOption> {
  const { data, error } = await supabase
    .from('quiz_options')
    .insert({ question_id: questionId, label, is_correct: isCorrect, position })
    .select('*')
    .single();

  if (error) throw new Error(error.message);
  return data as QuizOption;
}

export async function updateOption(
  optionId: string,
  label: string,
  isCorrect: boolean,
  position: number,
): Promise<void> {
  const { error } = await supabase
    .from('quiz_options')
    .update({ label, is_correct: isCorrect, position })
    .eq('id', optionId);

  if (error) throw new Error(error.message);
}

export async function deleteOption(optionId: string): Promise<void> {
  const { error } = await supabase
    .from('quiz_options')
    .delete()
    .eq('id', optionId);

  if (error) throw new Error(error.message);
}

export async function getQuizStats(
  quizId: string,
): Promise<{ completed: number; total: number; average: number }> {
  const { data: attempts, error } = await supabase
    .from('quiz_attempts')
    .select('id, score')
    .eq('quiz_id', quizId)
    .not('completed_at', 'is', null);

  if (error) throw new Error(error.message);

  const completedCount = attempts?.length ?? 0;
  const totalCount = completedCount;
  const average =
    completedCount > 0
      ? (attempts?.reduce((sum, a) => sum + a.score, 0) ?? 0) / completedCount
      : 0;

  return { completed: completedCount, total: totalCount, average };
}

import { supabase } from '@/lib/supabase/client';
import type { Profile, Quiz, QuizOption, QuizQuestion } from '@/lib/types';

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
  const { count: totalCount, error: totalError } = await supabase
    .from('quiz_attempts')
    .select('id', { count: 'exact', head: true })
    .eq('quiz_id', quizId);

  if (totalError) throw new Error(totalError.message);

  const { data: completed, error: completedError } = await supabase
    .from('quiz_attempts')
    .select('score')
    .eq('quiz_id', quizId)
    .not('completed_at', 'is', null);

  if (completedError) throw new Error(completedError.message);

  const completedCount = completed?.length ?? 0;
  const average =
    completedCount > 0
      ? (completed?.reduce((sum, a) => sum + a.score, 0) ?? 0) / completedCount
      : 0;

  return { completed: completedCount, total: totalCount ?? 0, average };
}

export async function getTeacherDashboardStats(teacherId: string) {
  const coursesQuery = supabase
    .from('courses')
    .select('id', { count: 'exact', head: true })
    .eq('teacher_id', teacherId);

  const resourcesQuery = supabase
    .from('educational_resources')
    .select('id', { count: 'exact', head: true })
    .eq('author_id', teacherId);

  const { data: courses } = await supabase
    .from('courses')
    .select('id')
    .eq('teacher_id', teacherId);

  let uniqueStudentsCount = 0;
  if (courses && courses.length > 0) {
    const courseIds = courses.map((c) => c.id);
    const { data: enrollments } = await supabase
      .from('course_enrollments')
      .select('student_id')
      .in('course_id', courseIds);
    
    if (enrollments) {
      const uniqueIds = new Set(enrollments.map((e) => e.student_id));
      uniqueStudentsCount = uniqueIds.size;
    }
  }

  const [
    { count: coursesCount },
    { count: resourcesCount }
  ] = await Promise.all([coursesQuery, resourcesQuery]);

  return {
    estudiantes: uniqueStudentsCount,
    recursos: resourcesCount ?? 0,
    cursos: coursesCount ?? 0,
  };
}

export async function getTeacherCourses(teacherId: string) {
  const { data: courses, error } = await supabase
    .from('courses')
    .select('*')
    .eq('teacher_id', teacherId)
    .order('created_at', { ascending: false });

  if (error) throw new Error(error.message);
  if (!courses || courses.length === 0) return [];

  const courseIds = courses.map((c) => c.id);
  const { data: enrollments, error: enrollError } = await supabase
    .from('course_enrollments')
    .select('course_id')
    .in('course_id', courseIds);

  if (enrollError) throw new Error(enrollError.message);

  const studentCountMap: Record<string, number> = {};
  if (enrollments) {
    for (const e of enrollments) {
      studentCountMap[e.course_id] = (studentCountMap[e.course_id] || 0) + 1;
    }
  }

  return courses.map((course) => ({
    id: course.id,
    nombre: course.name,
    nivel: course.name.split(' ')[0] || 'N/A',
    estudiantes: studentCountMap[course.id] || 0,
  }));
}

export async function getCourseStudents(
  courseId: string,
): Promise<(Profile & { enrolled_at: string })[]> {
  const { data, error } = await supabase
    .from('course_enrollments')
    .select('enrolled_at, student:profiles(*)')
    .eq('course_id', courseId)
    .order('enrolled_at', { ascending: true });

  if (error) throw new Error(error.message);

  return (data ?? []).map((entry: any) => ({
    ...entry.student,
    enrolled_at: entry.enrolled_at,
  }));
}

import { supabase } from '@/lib/supabase/client';
import type { AdminStats, Badge, Course, Profile, UserRole } from '@/lib/types';

export async function listarUsuarios(): Promise<Profile[]> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .order('role')
    .order('full_name');
  if (error) throw new Error(error.message);
  return (data ?? []) as Profile[];
}

export async function cambiarRol(userId: string, nuevoRol: UserRole): Promise<void> {
  const { error } = await supabase.rpc('admin_cambiar_rol', {
    target_user_id: userId,
    nuevo_rol: nuevoRol,
  });
  if (error) throw new Error(error.message);
}

export async function eliminarUsuario(userId: string): Promise<void> {
  const { error } = await supabase.rpc('admin_eliminar_usuario', {
    target_user_id: userId,
  });
  if (error) throw new Error(error.message);
}

export async function resetearPuntos(userId: string): Promise<void> {
  const { error } = await supabase.rpc('admin_resetear_puntos', {
    target_user_id: userId,
  });
  if (error) throw new Error(error.message);
}

export async function listarCursos(): Promise<Course[]> {
  const { data, error } = await supabase
    .from('courses')
    .select('*')
    .order('name');
  if (error) throw new Error(error.message);
  return (data ?? []) as Course[];
}

export async function crearCurso(
  name: string,
  description: string | null,
  teacherId: string | null
): Promise<Course> {
  const { data, error } = await supabase
    .from('courses')
    .insert({ name, description, teacher_id: teacherId })
    .select('*')
    .single();
  if (error) throw new Error(error.message);
  return data as Course;
}

export async function eliminarCurso(courseId: string): Promise<void> {
  const { error } = await supabase.from('courses').delete().eq('id', courseId);
  if (error) throw new Error(error.message);
}

export async function matricularEstudiante(
  courseId: string,
  studentId: string
): Promise<void> {
  const { error } = await supabase
    .from('course_enrollments')
    .insert({ course_id: courseId, student_id: studentId });
  if (error) throw new Error(error.message);
}

export async function desmatricularEstudiante(
  courseId: string,
  studentId: string
): Promise<void> {
  const { error } = await supabase
    .from('course_enrollments')
    .delete()
    .eq('course_id', courseId)
    .eq('student_id', studentId);
  if (error) throw new Error(error.message);
}

export async function listarMedallas(): Promise<Badge[]> {
  const { data, error } = await supabase.from('badges').select('*').order('points_required');
  if (error) throw new Error(error.message);
  return (data ?? []) as Badge[];
}

export async function otorgarMedalla(studentId: string, badgeId: string): Promise<void> {
  const { error } = await supabase
    .from('student_badges')
    .insert({ student_id: studentId, badge_id: badgeId });
  if (error) throw new Error(error.message);
}

export async function obtenerEstadisticas(): Promise<AdminStats> {
  const [profesores, estudiantes, recursos, quizzes] = await Promise.all([
    supabase.from('profiles').select('id', { count: 'exact', head: true }).eq('role', 'teacher'),
    supabase.from('profiles').select('id', { count: 'exact', head: true }).eq('role', 'student'),
    supabase.from('educational_resources').select('id', { count: 'exact', head: true }),
    supabase.from('quizzes').select('id', { count: 'exact', head: true }).eq('is_published', true),
  ]);
  return {
    profesores: profesores.count ?? 0,
    estudiantes: estudiantes.count ?? 0,
    recursos: recursos.count ?? 0,
    quizzes_publicados: quizzes.count ?? 0,
  };
}

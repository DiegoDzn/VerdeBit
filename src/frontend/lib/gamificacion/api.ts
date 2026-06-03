import { supabase } from '@/lib/supabase/client';

// Medalla del catálogo (tabla badges)
export interface Badge {
  id: string;
  code: string;
  name: string;
  description: string | null;
  icon_url: string | null;
  points_required: number;
}

// Medalla obtenida por un estudiante (tabla student_badges)
export interface StudentBadge {
  id: string;
  student_id: string;
  badge_id: string;
  awarded_at: string;
  badge: Badge;
}

// Perfil del estudiante con datos de gamificación
export interface StudentProfile {
  id: string;
  role: string;
  full_name: string;
  avatar_url: string | null;
  total_points: number;
  level: number;
  badges: StudentBadge[];
}

// Entrada en el ranking de estudiantes
export interface LeaderboardEntry {
  student_id: string;
  full_name: string;
  total_points: number;
  level: number;
  position: number;
}

// Puntos necesarios para subir de nivel
export const POINTS_PER_LEVEL = 100;

// Deriva el nivel a partir de los puntos acumulados.
// El backend no almacena nivel: se calcula desde total_points.
export function levelFromPoints(points: number): number {
  return Math.floor((points || 0) / POINTS_PER_LEVEL);
}

// Obtener perfil del estudiante con sus medallas
async function getProfile(userId: string): Promise<StudentProfile> {
  const { data: profile, error } = await supabase
    .from('profiles')
    .select('id, role, full_name, avatar_url, total_points')
    .eq('id', userId)
    .single();

  if (error) throw new Error(error.message);

  const { data: badges, error: badgesError } = await supabase
    .from('student_badges')
    .select('id, student_id, badge_id, awarded_at, badge:badges(*)')
    .eq('student_id', userId)
    .order('awarded_at', { ascending: false });

  if (badgesError) throw new Error(badgesError.message);

  const totalPoints = profile.total_points ?? 0;

  return {
    id: profile.id,
    role: profile.role,
    full_name: profile.full_name,
    avatar_url: profile.avatar_url,
    total_points: totalPoints,
    level: levelFromPoints(totalPoints),
    badges: (badges as any) ?? [],
  };
}

// Ranking de estudiantes por puntos acumulados
async function getLeaderboard(limit = 10): Promise<LeaderboardEntry[]> {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, full_name, total_points')
    .eq('role', 'student')
    .order('total_points', { ascending: false })
    .limit(limit);

  if (error) throw new Error(error.message);

  return (data ?? []).map((p: any, idx: number) => ({
    student_id: p.id,
    full_name: p.full_name ?? 'Anónimo',
    total_points: p.total_points ?? 0,
    level: levelFromPoints(p.total_points ?? 0),
    position: idx + 1,
  }));
}

// Catálogo completo de medallas disponibles
async function getAllBadges(): Promise<Badge[]> {
  const { data, error } = await supabase
    .from('badges')
    .select('*')
    .order('points_required', { ascending: true });

  if (error) throw new Error(error.message);
  return data ?? [];
}

// Medallas obtenidas por un estudiante
async function getStudentBadges(userId: string): Promise<StudentBadge[]> {
  const { data, error } = await supabase
    .from('student_badges')
    .select('id, student_id, badge_id, awarded_at, badge:badges(*)')
    .eq('student_id', userId)
    .order('awarded_at', { ascending: false });

  if (error) throw new Error(error.message);
  return (data as any) ?? [];
}

export { getProfile, getLeaderboard, getAllBadges, getStudentBadges };

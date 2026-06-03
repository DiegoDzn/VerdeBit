import { supabase } from '@/lib/supabase/client';

// Logro desbloqueado por el estudiante
export interface Achievement {
  id: string;
  name: string;
  description: string | null;
  icon: string | null;
  criteria_type: 'quiz_completed' | 'perfect_score' | 'total_points' | 'quiz_count';
  criteria_value: number | null;
  created_at: string;
}

// Logro que un estudiante ha desbloqueado
export interface StudentAchievement {
  id: string;
  user_id: string;
  achievement_id: string;
  earned_at: string;
  achievement: Achievement;
}

// Nivel y puntos del estudiante
export interface StudentLevel {
  id: string;
  user_id: string;
  level: number;
  total_points: number;
  updated_at: string;
}

// Perfil completo del estudiante con logros
export interface StudentProfile {
  id: string;
  role: string;
  total_points: number;
  level: number;
  achievements: StudentAchievement[];
}

// Entrada en el ranking de estudiantes
export interface LeaderboardEntry {
  user_id: string;
  name: string;
  email: string;
  total_points: number;
  level: number;
  position: number;
}

// Obtener perfil completo del estudiante
async function getProfile(userId: string): Promise<StudentProfile> {
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('id, role, total_points')
    .eq('id', userId)
    .single();

  if (profileError) throw new Error(profileError.message);

  const { data: level, error: levelError } = await supabase
    .from('student_levels')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (levelError && levelError.code !== 'PGRST116') throw new Error(levelError.message);

  const { data: achievements, error: achievementsError } = await supabase
    .from('student_achievements')
    .select(`
      id,
      user_id,
      achievement_id,
      earned_at,
      achievement:achievements(*)
    `)
    .eq('user_id', userId)
    .order('earned_at', { ascending: false });

  if (achievementsError) throw new Error(achievementsError.message);

  return {
    id: profile.id,
    role: profile.role,
    total_points: profile.total_points || 0,
    level: level?.level || 0,
    achievements: (achievements as any) || [],
  };
}

async function getLeaderboard(limit = 10): Promise<LeaderboardEntry[]> {
  const { data: leaderboard, error } = await supabase
    .from('student_levels')
    .select(`
      user_id,
      level,
      total_points,
      profile:profiles(name, email)
    `)
    .order('total_points', { ascending: false })
    .limit(limit);

  if (error) throw new Error(error.message);

  return (leaderboard as any).map((entry: any, idx: number) => ({
    user_id: entry.user_id,
    name: entry.profile?.name || 'Anónimo',
    email: entry.profile?.email || '',
    total_points: entry.total_points,
    level: entry.level,
    position: idx + 1,
  }));
}

async function getAchievements(): Promise<Achievement[]> {
  const { data, error } = await supabase
    .from('achievements')
    .select('*')
    .order('created_at', { ascending: true });

  if (error) throw new Error(error.message);
  return data || [];
}

async function getUserAchievements(userId: string): Promise<StudentAchievement[]> {
  const { data, error } = await supabase
    .from('student_achievements')
    .select(`
      id,
      user_id,
      achievement_id,
      earned_at,
      achievement:achievements(*)
    `)
    .eq('user_id', userId)
    .order('earned_at', { ascending: false });

  if (error) throw new Error(error.message);
  return (data as any) || [];
}

export { getProfile, getLeaderboard, getAchievements, getUserAchievements };

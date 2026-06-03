export type UserRole = 'student' | 'teacher';

export type Profile = {
  id: string;
  role: UserRole;
  full_name: string | null;
  avatar_url: string | null;
  total_points: number;
  created_at: string;
  updated_at: string;
};

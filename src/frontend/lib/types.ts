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

export type Quiz = {
  id: string;
  author_id: string;
  title: string;
  description: string | null;
  topic: string | null;
  points_reward: number;
  is_published: boolean;
  created_at: string;
  updated_at: string;
};

export type QuizOption = {
  id: string;
  question_id: string;
  label: string;
  is_correct: boolean;
  position: number;
};

export type QuizQuestion = {
  id: string;
  quiz_id: string;
  prompt: string;
  position: number;
  quiz_options: QuizOption[];
};

export type QuizAttempt = {
  id: string;
  quiz_id: string;
  student_id: string;
  score: number;
  completed_at: string | null;
};

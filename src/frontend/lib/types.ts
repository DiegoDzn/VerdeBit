export type UserRole = 'student' | 'teacher' | 'admin';

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

export type ResourceType = 'pdf' | 'video' | 'link' | 'image' | 'text';

export type SpeciesKind = 'flora' | 'fauna';

export type Species = {
  id: string;
  common_name: string;
  scientific_name: string;
  kind: SpeciesKind;
  description: string;
  habitat: string | null;
  conservation_status: string | null;
  image_url: string | null;
  mapuche_name: string | null;
  created_at: string;
  updated_at: string;
};

export type EducationalResource = {
  id: string;
  author_id: string;
  title: string;
  description: string | null;
  resource_type: ResourceType;
  url: string;
  subject_area: string | null;
  created_at: string;
  updated_at: string;
};

export type Event = {
  id: string;
  author_id: string;
  title: string;
  description: string | null;
  location: string | null;
  starts_at: string;
  ends_at: string | null;
  created_at: string;
  updated_at: string;
};

export type DidYouKnow = {
  id: string;
  title: string;
  content: string;
  source: string | null;
  image_url: string | null;
  is_published: boolean;
  created_at: string;
  updated_at: string;
};

export type MapucheContent = {
  id: string;
  title: string;
  content: string;
  category: string | null;
  audio_url: string | null;
  image_url: string | null;
  is_published: boolean;
  created_at: string;
  updated_at: string;
};

export type ProfessorStats = {
  estudiantes_totales: number;
  recursos: number;
  quizzes_completados: number;
  por_revisar: number;
};

export type QuizWithStats = Quiz & {
  completed_count: number;
  total_count: number;
  average_score: number;
  percent: number;
};

export type Badge = {
  id: string;
  code: string;
  name: string;
  description: string;
  icon_url: string | null;
  points_required: number;
  created_at: string;
  updated_at: string;
};

export type StudentBadge = {
  id: string;
  student_id: string;
  badge_id: string;
  awarded_at: string;
};

export type Course = {
  id: string;
  name: string;
  description: string | null;
  teacher_id: string | null;
  created_at: string;
  updated_at: string;
};

export type CourseEnrollment = {
  id: string;
  course_id: string;
  student_id: string;
  enrolled_at: string;
};

export type AdminStats = {
  profesores: number;
  estudiantes: number;
  recursos: number;
  quizzes_publicados: number;
};

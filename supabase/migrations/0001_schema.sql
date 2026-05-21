-- =====================================================================
-- VerdeBit / Escuela Monteverde 
-- =====================================================================

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------
-- Tipos enumerados
-- ---------------------------------------------------------------------
do $$
begin
  if not exists (select 1 from pg_type where typname = 'user_role') then
    create type public.user_role as enum ('student', 'teacher');
  end if;

  if not exists (select 1 from pg_type where typname = 'species_kind') then
    create type public.species_kind as enum ('flora', 'fauna');
  end if;

  if not exists (select 1 from pg_type where typname = 'resource_type') then
    create type public.resource_type as enum ('pdf', 'video', 'link', 'image', 'text');
  end if;
end
$$;

-- ---------------------------------------------------------------------
-- profiles : extiende auth.users con rol y datos de gamificación
-- ---------------------------------------------------------------------
create table if not exists public.profiles (
  id              uuid primary key references auth.users(id) on delete cascade,
  role            public.user_role not null default 'student',
  full_name       text not null,
  avatar_url      text,
  total_points    integer not null default 0 check (total_points >= 0),
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index if not exists profiles_role_idx on public.profiles (role);

-- ---------------------------------------------------------------------
-- species : catálogo de flora y fauna del humedal
-- ---------------------------------------------------------------------
create table if not exists public.species (
  id                    uuid primary key default gen_random_uuid(),
  common_name           text not null,
  scientific_name       text not null,
  kind                  public.species_kind not null,
  description           text not null,
  habitat               text,
  conservation_status   text,
  image_url             text,
  mapuche_name          text,
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now()
);

create index if not exists species_kind_idx on public.species (kind);
create index if not exists species_common_name_idx on public.species (common_name);

-- ---------------------------------------------------------------------
-- educational_resources : archivos / enlaces subidos por profesores
-- ---------------------------------------------------------------------
create table if not exists public.educational_resources (
  id              uuid primary key default gen_random_uuid(),
  author_id       uuid not null references public.profiles(id) on delete cascade,
  title           text not null,
  description     text,
  resource_type   public.resource_type not null,
  url             text not null,
  subject_area    text,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index if not exists educational_resources_author_idx on public.educational_resources (author_id);
create index if not exists educational_resources_subject_idx on public.educational_resources (subject_area);

-- ---------------------------------------------------------------------
-- quizzes
-- ---------------------------------------------------------------------
create table if not exists public.quizzes (
  id              uuid primary key default gen_random_uuid(),
  author_id       uuid not null references public.profiles(id) on delete cascade,
  title           text not null,
  description     text,
  topic           text,
  points_reward   integer not null default 10 check (points_reward >= 0),
  is_published    boolean not null default false,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index if not exists quizzes_author_idx on public.quizzes (author_id);
create index if not exists quizzes_published_idx on public.quizzes (is_published);

-- ---------------------------------------------------------------------
-- quiz_questions : preguntas de cada quiz
-- ---------------------------------------------------------------------
create table if not exists public.quiz_questions (
  id              uuid primary key default gen_random_uuid(),
  quiz_id         uuid not null references public.quizzes(id) on delete cascade,
  prompt          text not null,
  position        integer not null default 0,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  unique (quiz_id, position)
);

create index if not exists quiz_questions_quiz_idx on public.quiz_questions (quiz_id);

-- ---------------------------------------------------------------------
-- quiz_options : alternativas de cada pregunta
-- ---------------------------------------------------------------------
create table if not exists public.quiz_options (
  id              uuid primary key default gen_random_uuid(),
  question_id     uuid not null references public.quiz_questions(id) on delete cascade,
  label           text not null,
  is_correct      boolean not null default false,
  position        integer not null default 0,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  unique (question_id, position)
);

create index if not exists quiz_options_question_idx on public.quiz_options (question_id);

-- ---------------------------------------------------------------------
-- quiz_attempts : intento de un estudiante sobre un quiz
-- ---------------------------------------------------------------------
create table if not exists public.quiz_attempts (
  id              uuid primary key default gen_random_uuid(),
  quiz_id         uuid not null references public.quizzes(id) on delete cascade,
  student_id      uuid not null references public.profiles(id) on delete cascade,
  score           integer not null default 0 check (score >= 0),
  completed_at    timestamptz,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index if not exists quiz_attempts_quiz_idx on public.quiz_attempts (quiz_id);
create index if not exists quiz_attempts_student_idx on public.quiz_attempts (student_id);

-- ---------------------------------------------------------------------
-- quiz_answers : respuestas individuales dentro de un intento
-- ---------------------------------------------------------------------
create table if not exists public.quiz_answers (
  id              uuid primary key default gen_random_uuid(),
  attempt_id      uuid not null references public.quiz_attempts(id) on delete cascade,
  question_id     uuid not null references public.quiz_questions(id) on delete cascade,
  option_id       uuid not null references public.quiz_options(id) on delete cascade,
  is_correct      boolean not null default false,
  created_at      timestamptz not null default now(),
  unique (attempt_id, question_id)
);

create index if not exists quiz_answers_attempt_idx on public.quiz_answers (attempt_id);

-- ---------------------------------------------------------------------
-- badges : catálogo de medallas
-- ---------------------------------------------------------------------
create table if not exists public.badges (
  id                uuid primary key default gen_random_uuid(),
  code              text not null unique,
  name              text not null,
  description       text not null,
  icon_url          text,
  points_required   integer not null default 0 check (points_required >= 0),
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- student_badges : medallas obtenidas por un estudiante
-- ---------------------------------------------------------------------
create table if not exists public.student_badges (
  id              uuid primary key default gen_random_uuid(),
  student_id      uuid not null references public.profiles(id) on delete cascade,
  badge_id        uuid not null references public.badges(id) on delete cascade,
  awarded_at      timestamptz not null default now(),
  unique (student_id, badge_id)
);

create index if not exists student_badges_student_idx on public.student_badges (student_id);

-- ---------------------------------------------------------------------
-- events : calendario comunitario
-- ---------------------------------------------------------------------
create table if not exists public.events (
  id              uuid primary key default gen_random_uuid(),
  author_id       uuid not null references public.profiles(id) on delete cascade,
  title           text not null,
  description     text,
  location        text,
  starts_at       timestamptz not null,
  ends_at         timestamptz,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  check (ends_at is null or ends_at >= starts_at)
);

create index if not exists events_starts_at_idx on public.events (starts_at);

-- ---------------------------------------------------------------------
-- did_you_know : feed de datos curiosos sobre el humedal
-- ---------------------------------------------------------------------
create table if not exists public.did_you_know (
  id              uuid primary key default gen_random_uuid(),
  title           text not null,
  content         text not null,
  source          text,
  image_url       text,
  is_published    boolean not null default true,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index if not exists did_you_know_published_idx on public.did_you_know (is_published);

-- ---------------------------------------------------------------------
-- mapuche_content : contenido cultural vinculado al territorio
-- ---------------------------------------------------------------------
create table if not exists public.mapuche_content (
  id              uuid primary key default gen_random_uuid(),
  title           text not null,
  content         text not null,
  category        text,
  audio_url       text,
  image_url       text,
  is_published    boolean not null default true,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index if not exists mapuche_content_category_idx on public.mapuche_content (category);
create index if not exists mapuche_content_published_idx on public.mapuche_content (is_published);

-- Tablas de cursos y matrículas

create table if not exists public.courses (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  description text,
  teacher_id  uuid references public.profiles(id) on delete set null,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index if not exists courses_teacher_idx on public.courses (teacher_id);

drop trigger if exists set_updated_at on public.courses;
create trigger set_updated_at
  before update on public.courses
  for each row execute function public.set_updated_at();

create table if not exists public.course_enrollments (
  id          uuid primary key default gen_random_uuid(),
  course_id   uuid not null references public.courses(id) on delete cascade,
  student_id  uuid not null references public.profiles(id) on delete cascade,
  enrolled_at timestamptz not null default now(),
  unique (course_id, student_id)
);

create index if not exists enrollments_course_idx on public.course_enrollments (course_id);
create index if not exists enrollments_student_idx on public.course_enrollments (student_id);

-- RLS
alter table public.courses enable row level security;
alter table public.course_enrollments enable row level security;

create policy courses_select on public.courses
  for select to authenticated using (true);

create policy courses_write_admin on public.courses
  for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- matriculas: el estudiante ve las suyas, profe ve las de sus cursos y el admin ve todo
create policy enrollments_select on public.course_enrollments
  for select to authenticated
  using (
    student_id = auth.uid()
    or public.current_user_role() = 'teacher'
    or public.is_admin()
  );

create policy enrollments_write_admin on public.course_enrollments
  for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());
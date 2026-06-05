-- =====================================================================
-- Funciones y triggers
-- =====================================================================

-- ---------------------------------------------------------------------
-- Trigger genérico para mantener updated_at
-- ---------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

-- Asocia el trigger updated_at a cada tabla que tiene esa columna.
do $$
declare
  t text;
  tables text[] := array[
    'profiles',
    'species',
    'educational_resources',
    'quizzes',
    'quiz_questions',
    'quiz_options',
    'quiz_attempts',
    'badges',
    'events',
    'did_you_know',
    'mapuche_content'
  ];
begin
  foreach t in array tables loop
    execute format('drop trigger if exists set_updated_at on public.%I;', t);
    execute format(
      'create trigger set_updated_at
         before update on public.%I
         for each row execute function public.set_updated_at();',
      t
    );
  end loop;
end
$$;

-- ---------------------------------------------------------------------
-- Crea automáticamente una fila en profiles cuando se inserta un nuevo
-- registro en auth.users
-- ---------------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  meta_role text;
  resolved_role public.user_role;
begin
  meta_role := coalesce(new.raw_user_meta_data ->> 'role', 'student');
  if meta_role not in ('student', 'teacher') then
    resolved_role := 'student';
  else
    resolved_role := meta_role::public.user_role;
  end if;

  insert into public.profiles (id, role, full_name)
  values (
    new.id,
    resolved_role,
    coalesce(
      new.raw_user_meta_data ->> 'full_name',
      split_part(new.email, '@', 1)
    )
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------
-- Helper para leer el rol del usuario actual desde public.profiles sin
-- caer en recursión al evaluar las políticas RLS sobre la tabla profiles
-- ---------------------------------------------------------------------
create or replace function public.current_user_role()
returns text
language sql
stable
security definer
set search_path = public
as $$
  select role::text from public.profiles where id = auth.uid();
$$;

grant execute on function public.current_user_role() to authenticated;

-- ---------------------------------------------------------------------
-- Cuando un intento de quiz se marca como completado, suma la recompensa
-- del quiz al total_points del estudiante y otorga la medalla
-- "first_quiz" una sola vez.
-- ---------------------------------------------------------------------
create or replace function public.award_quiz_points()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  reward integer;
  first_badge uuid;
begin
  if new.completed_at is null then
    return new;
  end if;

  if tg_op = 'UPDATE' and old.completed_at is not null then
    return new;
  end if;

  select points_reward into reward from public.quizzes where id = new.quiz_id;
  if reward is null then
    reward := 0;
  end if;

  update public.profiles
     set total_points = total_points + reward
   where id = new.student_id;

  select id into first_badge from public.badges where code = 'first_quiz';
  if first_badge is not null then
    insert into public.student_badges (student_id, badge_id)
    values (new.student_id, first_badge)
    on conflict (student_id, badge_id) do nothing;
  end if;

  return new;
end;
$$;

drop trigger if exists award_quiz_points_trg on public.quiz_attempts;
create trigger award_quiz_points_trg
  after insert or update of completed_at on public.quiz_attempts
  for each row execute function public.award_quiz_points();

-- ---------------------------------------------------------------------
-- Marca quiz_answers.is_correct según la opción elegida (lado servidor).
-- Evita que el cliente decida si una respuesta es correcta.
-- ---------------------------------------------------------------------
create or replace function public.set_quiz_answer_correctness()
returns trigger
language plpgsql
as $$
begin
  select is_correct into new.is_correct
    from public.quiz_options
   where id = new.option_id;
  return new;
end;
$$;

drop trigger if exists set_quiz_answer_correctness_trg on public.quiz_answers;
create trigger set_quiz_answer_correctness_trg
  before insert on public.quiz_answers
  for each row execute function public.set_quiz_answer_correctness();

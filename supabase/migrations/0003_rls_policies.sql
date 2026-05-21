-- =====================================================================
-- Políticas de Row Level Security (RLS)
-- Roles considerados:
--   - anónimo (sin auth.uid)            -> bloqueado por defecto
--   - autenticado student               -> lee la mayoría del contenido,
--                                          escribe solo lo propio
--   - autenticado teacher               -> administra catálogos y lo que
--                                          él mismo creó
-- =====================================================================

-- ---------------------------------------------------------------------
-- Habilitar RLS en todas las tablas del esquema public
-- ---------------------------------------------------------------------
alter table public.profiles                enable row level security;
alter table public.species                 enable row level security;
alter table public.educational_resources   enable row level security;
alter table public.quizzes                 enable row level security;
alter table public.quiz_questions          enable row level security;
alter table public.quiz_options            enable row level security;
alter table public.quiz_attempts           enable row level security;
alter table public.quiz_answers            enable row level security;
alter table public.badges                  enable row level security;
alter table public.student_badges          enable row level security;
alter table public.events                  enable row level security;
alter table public.did_you_know            enable row level security;
alter table public.mapuche_content         enable row level security;

-- ---------------------------------------------------------------------
-- profiles
-- ---------------------------------------------------------------------
drop policy if exists profiles_select_authenticated on public.profiles;
create policy profiles_select_authenticated on public.profiles
  for select to authenticated
  using (true);

drop policy if exists profiles_update_self on public.profiles;
create policy profiles_update_self on public.profiles
  for update to authenticated
  using (id = auth.uid())
  with check (id = auth.uid());

-- ---------------------------------------------------------------------
-- species (catálogo flora/fauna)
-- ---------------------------------------------------------------------
drop policy if exists species_select_authenticated on public.species;
create policy species_select_authenticated on public.species
  for select to authenticated
  using (true);

drop policy if exists species_write_teacher on public.species;
create policy species_write_teacher on public.species
  for all to authenticated
  using (public.current_user_role() = 'teacher')
  with check (public.current_user_role() = 'teacher');

-- ---------------------------------------------------------------------
-- educational_resources
-- ---------------------------------------------------------------------
drop policy if exists educational_resources_select_authenticated on public.educational_resources;
create policy educational_resources_select_authenticated on public.educational_resources
  for select to authenticated
  using (true);

drop policy if exists educational_resources_insert_teacher on public.educational_resources;
create policy educational_resources_insert_teacher on public.educational_resources
  for insert to authenticated
  with check (
    public.current_user_role() = 'teacher'
    and author_id = auth.uid()
  );

drop policy if exists educational_resources_update_author on public.educational_resources;
create policy educational_resources_update_author on public.educational_resources
  for update to authenticated
  using (author_id = auth.uid() and public.current_user_role() = 'teacher')
  with check (author_id = auth.uid());

drop policy if exists educational_resources_delete_author on public.educational_resources;
create policy educational_resources_delete_author on public.educational_resources
  for delete to authenticated
  using (author_id = auth.uid() and public.current_user_role() = 'teacher');

-- ---------------------------------------------------------------------
-- quizzes
-- ---------------------------------------------------------------------
drop policy if exists quizzes_select_published_or_author on public.quizzes;
create policy quizzes_select_published_or_author on public.quizzes
  for select to authenticated
  using (is_published or author_id = auth.uid());

drop policy if exists quizzes_insert_teacher on public.quizzes;
create policy quizzes_insert_teacher on public.quizzes
  for insert to authenticated
  with check (
    public.current_user_role() = 'teacher'
    and author_id = auth.uid()
  );

drop policy if exists quizzes_update_author on public.quizzes;
create policy quizzes_update_author on public.quizzes
  for update to authenticated
  using (author_id = auth.uid() and public.current_user_role() = 'teacher')
  with check (author_id = auth.uid());

drop policy if exists quizzes_delete_author on public.quizzes;
create policy quizzes_delete_author on public.quizzes
  for delete to authenticated
  using (author_id = auth.uid() and public.current_user_role() = 'teacher');

-- ---------------------------------------------------------------------
-- quiz_questions
-- ---------------------------------------------------------------------
drop policy if exists quiz_questions_select_visible on public.quiz_questions;
create policy quiz_questions_select_visible on public.quiz_questions
  for select to authenticated
  using (
    exists (
      select 1 from public.quizzes q
      where q.id = quiz_id
        and (q.is_published or q.author_id = auth.uid())
    )
  );

drop policy if exists quiz_questions_write_author on public.quiz_questions;
create policy quiz_questions_write_author on public.quiz_questions
  for all to authenticated
  using (
    exists (
      select 1 from public.quizzes q
      where q.id = quiz_id and q.author_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.quizzes q
      where q.id = quiz_id and q.author_id = auth.uid()
    )
  );

-- ---------------------------------------------------------------------
-- quiz_options
-- ---------------------------------------------------------------------
drop policy if exists quiz_options_select_visible on public.quiz_options;
create policy quiz_options_select_visible on public.quiz_options
  for select to authenticated
  using (
    exists (
      select 1
        from public.quiz_questions qq
        join public.quizzes q on q.id = qq.quiz_id
       where qq.id = question_id
         and (q.is_published or q.author_id = auth.uid())
    )
  );

drop policy if exists quiz_options_write_author on public.quiz_options;
create policy quiz_options_write_author on public.quiz_options
  for all to authenticated
  using (
    exists (
      select 1
        from public.quiz_questions qq
        join public.quizzes q on q.id = qq.quiz_id
       where qq.id = question_id and q.author_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1
        from public.quiz_questions qq
        join public.quizzes q on q.id = qq.quiz_id
       where qq.id = question_id and q.author_id = auth.uid()
    )
  );

-- ---------------------------------------------------------------------
-- quiz_attempts
-- ---------------------------------------------------------------------
drop policy if exists quiz_attempts_select_owner_or_quiz_author on public.quiz_attempts;
create policy quiz_attempts_select_owner_or_quiz_author on public.quiz_attempts
  for select to authenticated
  using (
    student_id = auth.uid()
    or exists (
      select 1 from public.quizzes q
      where q.id = quiz_id and q.author_id = auth.uid()
    )
  );

drop policy if exists quiz_attempts_insert_student on public.quiz_attempts;
create policy quiz_attempts_insert_student on public.quiz_attempts
  for insert to authenticated
  with check (student_id = auth.uid());

drop policy if exists quiz_attempts_update_student on public.quiz_attempts;
create policy quiz_attempts_update_student on public.quiz_attempts
  for update to authenticated
  using (student_id = auth.uid())
  with check (student_id = auth.uid());

-- ---------------------------------------------------------------------
-- quiz_answers
-- ---------------------------------------------------------------------
drop policy if exists quiz_answers_select_owner_or_quiz_author on public.quiz_answers;
create policy quiz_answers_select_owner_or_quiz_author on public.quiz_answers
  for select to authenticated
  using (
    exists (
      select 1 from public.quiz_attempts qa
      where qa.id = attempt_id
        and (
          qa.student_id = auth.uid()
          or exists (
            select 1 from public.quizzes q
            where q.id = qa.quiz_id and q.author_id = auth.uid()
          )
        )
    )
  );

drop policy if exists quiz_answers_insert_student on public.quiz_answers;
create policy quiz_answers_insert_student on public.quiz_answers
  for insert to authenticated
  with check (
    exists (
      select 1 from public.quiz_attempts qa
      where qa.id = attempt_id
        and qa.student_id = auth.uid()
    )
  );

-- ---------------------------------------------------------------------
-- badges
-- ---------------------------------------------------------------------
drop policy if exists badges_select_authenticated on public.badges;
create policy badges_select_authenticated on public.badges
  for select to authenticated
  using (true);

drop policy if exists badges_write_teacher on public.badges;
create policy badges_write_teacher on public.badges
  for all to authenticated
  using (public.current_user_role() = 'teacher')
  with check (public.current_user_role() = 'teacher');

-- ---------------------------------------------------------------------
-- student_badges
-- ---------------------------------------------------------------------
drop policy if exists student_badges_select_owner_or_teacher on public.student_badges;
create policy student_badges_select_owner_or_teacher on public.student_badges
  for select to authenticated
  using (
    student_id = auth.uid()
    or public.current_user_role() = 'teacher'
  );

drop policy if exists student_badges_insert_teacher on public.student_badges;
create policy student_badges_insert_teacher on public.student_badges
  for insert to authenticated
  with check (public.current_user_role() = 'teacher');

-- ---------------------------------------------------------------------
-- events
-- ---------------------------------------------------------------------
drop policy if exists events_select_authenticated on public.events;
create policy events_select_authenticated on public.events
  for select to authenticated
  using (true);

drop policy if exists events_insert_teacher on public.events;
create policy events_insert_teacher on public.events
  for insert to authenticated
  with check (
    public.current_user_role() = 'teacher'
    and author_id = auth.uid()
  );

drop policy if exists events_update_author on public.events;
create policy events_update_author on public.events
  for update to authenticated
  using (author_id = auth.uid() and public.current_user_role() = 'teacher')
  with check (author_id = auth.uid());

drop policy if exists events_delete_author on public.events;
create policy events_delete_author on public.events
  for delete to authenticated
  using (author_id = auth.uid() and public.current_user_role() = 'teacher');

-- ---------------------------------------------------------------------
-- did_you_know
-- ---------------------------------------------------------------------
drop policy if exists did_you_know_select_visible on public.did_you_know;
create policy did_you_know_select_visible on public.did_you_know
  for select to authenticated
  using (is_published or public.current_user_role() = 'teacher');

drop policy if exists did_you_know_write_teacher on public.did_you_know;
create policy did_you_know_write_teacher on public.did_you_know
  for all to authenticated
  using (public.current_user_role() = 'teacher')
  with check (public.current_user_role() = 'teacher');

-- ---------------------------------------------------------------------
-- mapuche_content
-- ---------------------------------------------------------------------
drop policy if exists mapuche_content_select_visible on public.mapuche_content;
create policy mapuche_content_select_visible on public.mapuche_content
  for select to authenticated
  using (is_published or public.current_user_role() = 'teacher');

drop policy if exists mapuche_content_write_teacher on public.mapuche_content;
create policy mapuche_content_write_teacher on public.mapuche_content
  for all to authenticated
  using (public.current_user_role() = 'teacher')
  with check (public.current_user_role() = 'teacher');

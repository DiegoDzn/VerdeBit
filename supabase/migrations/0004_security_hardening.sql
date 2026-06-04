-- ---------------------------------------------------------------------
-- los usuarios creados desde la app siempre parten como estudiantes
-- el rol teacher debe asignarse desde una operación administrativa
-- ---------------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, role, full_name)
  values (
    new.id,
    'student'::public.user_role,
    coalesce(
      new.raw_user_meta_data ->> 'full_name',
      split_part(new.email, '@', 1)
    )
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

-- ---------------------------------------------------------------------
-- evita que clientes autenticados alteren datos del perfil
-- ---------------------------------------------------------------------
create or replace function public.prevent_profile_sensitive_update()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if current_user in ('anon', 'authenticated') then
    if new.role is distinct from old.role then
      raise exception 'profiles.role cannot be updated from the client'
        using errcode = '42501';
    end if;

    if new.total_points is distinct from old.total_points then
      raise exception 'profiles.total_points cannot be updated from the client'
        using errcode = '42501';
    end if;
  end if;

  return new;
end;
$$;

-- Fija search_path de triggers auxiliares creados en migraciones previas.
create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

create or replace function public.set_quiz_answer_correctness()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  select is_correct into new.is_correct
    from public.quiz_options
   where id = new.option_id;
  return new;
end;
$$;

drop trigger if exists prevent_profile_sensitive_update_trg on public.profiles;
create trigger prevent_profile_sensitive_update_trg
  before update on public.profiles
  for each row execute function public.prevent_profile_sensitive_update();

-- ---------------------------------------------------------------------
--funciones auxiliares no deben quedar ejecutables via RPC 
-- ---------------------------------------------------------------------
revoke all on function public.handle_new_user() from public, anon, authenticated;
revoke all on function public.award_quiz_points() from public, anon, authenticated;
revoke all on function public.set_updated_at() from public, anon, authenticated;
revoke all on function public.set_quiz_answer_correctness() from public, anon, authenticated;
revoke all on function public.prevent_profile_sensitive_update() from public, anon, authenticated;
revoke all on function public.current_user_role() from public, anon, authenticated;
grant execute on function public.current_user_role() to authenticated;

-- ---------------------------------------------------------------------
-- educational_resources el autor puede editar solo si sigue siendo teacher
-- ---------------------------------------------------------------------
drop policy if exists educational_resources_update_author on public.educational_resources;
create policy educational_resources_update_author on public.educational_resources
  for update to authenticated
  using (
    author_id = auth.uid()
    and public.current_user_role() = 'teacher'
  )
  with check (
    author_id = auth.uid()
    and public.current_user_role() = 'teacher'
  );

-- ---------------------------------------------------------------------
-- quizzes: el autor puede editar solo si sigue siendo teacher
-- ---------------------------------------------------------------------
drop policy if exists quizzes_update_author on public.quizzes;
create policy quizzes_update_author on public.quizzes
  for update to authenticated
  using (
    author_id = auth.uid()
    and public.current_user_role() = 'teacher'
  )
  with check (
    author_id = auth.uid()
    and public.current_user_role() = 'teacher'
  );

-- ---------------------------------------------------------------------
-- quiz_questions: solo teacher autor del quiz puede administrar preguntas
-- ---------------------------------------------------------------------
drop policy if exists quiz_questions_write_author on public.quiz_questions;
create policy quiz_questions_write_author on public.quiz_questions
  for all to authenticated
  using (
    public.current_user_role() = 'teacher'
    and exists (
      select 1 from public.quizzes q
      where q.id = quiz_id and q.author_id = auth.uid()
    )
  )
  with check (
    public.current_user_role() = 'teacher'
    and exists (
      select 1 from public.quizzes q
      where q.id = quiz_id and q.author_id = auth.uid()
    )
  );

-- ---------------------------------------------------------------------
-- quiz_options: solo teacher autor del quiz puede administrar alternativas
-- ---------------------------------------------------------------------
drop policy if exists quiz_options_write_author on public.quiz_options;
create policy quiz_options_write_author on public.quiz_options
  for all to authenticated
  using (
    public.current_user_role() = 'teacher'
    and exists (
      select 1
        from public.quiz_questions qq
        join public.quizzes q on q.id = qq.quiz_id
       where qq.id = question_id and q.author_id = auth.uid()
    )
  )
  with check (
    public.current_user_role() = 'teacher'
    and exists (
      select 1
        from public.quiz_questions qq
        join public.quizzes q on q.id = qq.quiz_id
       where qq.id = question_id and q.author_id = auth.uid()
    )
  );

-- ---------------------------------------------------------------------
-- quiz_attempts y quiz_answers: la visibilidad de profesor requiere rol teacher
-- ---------------------------------------------------------------------
drop policy if exists quiz_attempts_select_owner_or_quiz_author on public.quiz_attempts;
create policy quiz_attempts_select_owner_or_quiz_author on public.quiz_attempts
  for select to authenticated
  using (
    student_id = auth.uid()
    or (
      public.current_user_role() = 'teacher'
      and exists (
        select 1 from public.quizzes q
        where q.id = quiz_id and q.author_id = auth.uid()
      )
    )
  );

drop policy if exists quiz_answers_select_owner_or_quiz_author on public.quiz_answers;
create policy quiz_answers_select_owner_or_quiz_author on public.quiz_answers
  for select to authenticated
  using (
    exists (
      select 1 from public.quiz_attempts qa
      where qa.id = attempt_id
        and (
          qa.student_id = auth.uid()
          or (
            public.current_user_role() = 'teacher'
            and exists (
              select 1 from public.quizzes q
              where q.id = qa.quiz_id and q.author_id = auth.uid()
            )
          )
        )
    )
  );

-- ---------------------------------------------------------------------
-- events: puede editar solo si sigue siendo teacher
-- ---------------------------------------------------------------------
drop policy if exists events_update_author on public.events;
create policy events_update_author on public.events
  for update to authenticated
  using (
    author_id = auth.uid()
    and public.current_user_role() = 'teacher'
  )
  with check (
    author_id = auth.uid()
    and public.current_user_role() = 'teacher'
  );

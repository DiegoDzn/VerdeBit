drop policy if exists profiles_select_authenticated on public.profiles;
create policy profiles_select_authenticated on public.profiles
  for select to authenticated
  using (
    id = auth.uid()
    or public.current_user_role() = 'teacher'
    or public.is_admin()
  );

create policy profiles_delete_admin on public.profiles
  for delete to authenticated
  using (public.is_admin());

drop policy if exists educational_resources_delete_author on public.educational_resources;
create policy educational_resources_delete_author on public.educational_resources
  for delete to authenticated
  using (
    (author_id = auth.uid() and public.current_user_role() = 'teacher')
    or public.is_admin()
  );

drop policy if exists quizzes_update_author on public.quizzes;
create policy quizzes_update_author on public.quizzes
  for update to authenticated
  using (
    (author_id = auth.uid() and public.current_user_role() = 'teacher')
    or public.is_admin()
  )
  with check (
    author_id = auth.uid() or public.is_admin()
  );

drop policy if exists quizzes_delete_author on public.quizzes;
create policy quizzes_delete_author on public.quizzes
  for delete to authenticated
  using (
    (author_id = auth.uid() and public.current_user_role() = 'teacher')
    or public.is_admin()
  );

drop policy if exists events_update_author on public.events;
create policy events_update_author on public.events
  for update to authenticated
  using (
    (author_id = auth.uid() and public.current_user_role() = 'teacher')
    or public.is_admin()
  )
  with check (author_id = auth.uid() or public.is_admin());

drop policy if exists events_delete_author on public.events;
create policy events_delete_author on public.events
  for delete to authenticated
  using (
    (author_id = auth.uid() and public.current_user_role() = 'teacher')
    or public.is_admin()
  );

drop policy if exists badges_write_teacher on public.badges;
create policy badges_write_admin on public.badges
  for all to authenticated
  using (public.is_admin() or public.current_user_role() = 'teacher')
  with check (public.is_admin() or public.current_user_role() = 'teacher');

drop policy if exists student_badges_insert_teacher on public.student_badges;
create policy student_badges_write_admin on public.student_badges
  for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists did_you_know_write_teacher on public.did_you_know;
create policy did_you_know_write_admin on public.did_you_know
  for all to authenticated
  using (public.is_admin() or public.current_user_role() = 'teacher')
  with check (public.is_admin() or public.current_user_role() = 'teacher');

drop policy if exists mapuche_content_write_teacher on public.mapuche_content;
create policy mapuche_content_write_admin on public.mapuche_content
  for all to authenticated
  using (public.is_admin() or public.current_user_role() = 'teacher')
  with check (public.is_admin() or public.current_user_role() = 'teacher');
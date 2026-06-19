create or replace function public.award_quiz_points()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  reward          integer;
  total_questions integer;
  earned          integer;
  first_badge     uuid;
  new_total       integer;
begin
  if new.completed_at is null then
    return new;
  end if;

  if tg_op = 'UPDATE' and old.completed_at is not null then
    return new;
  end if;

  if exists (
    select 1
      from public.quiz_attempts qa
     where qa.student_id = new.student_id
       and qa.quiz_id = new.quiz_id
       and qa.completed_at is not null
       and qa.id <> new.id
  ) then
    return new;
  end if;

  select points_reward into reward from public.quizzes where id = new.quiz_id;
  if reward is null then
    reward := 0;
  end if;

  select count(*) into total_questions
    from public.quiz_questions
   where quiz_id = new.quiz_id;

  if total_questions > 0 then
    earned := round(reward::numeric * least(new.score, total_questions) / total_questions);
  else
    earned := 0;
  end if;

  update public.profiles
     set total_points = total_points + earned
   where id = new.student_id
  returning total_points into new_total;

  select id into first_badge from public.badges where code = 'first_quiz';
  if first_badge is not null then
    insert into public.student_badges (student_id, badge_id)
    values (new.student_id, first_badge)
    on conflict (student_id, badge_id) do nothing;
  end if;

  insert into public.student_badges (student_id, badge_id)
  select new.student_id, b.id
    from public.badges b
   where b.points_required > 0
     and b.points_required <= new_total
  on conflict (student_id, badge_id) do nothing;

  return new;
end;
$$;

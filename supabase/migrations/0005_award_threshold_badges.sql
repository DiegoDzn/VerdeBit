-- =====================================================================
-- Gamificación: otorgar medallas por umbral de puntos
--
-- Hasta ahora award_quiz_points() solo entregaba la medalla 'first_quiz'.
-- Las medallas con points_required > 0 (explorer_50, guardian_100, ...)
-- nunca se otorgaban automáticamente. Esta migración extiende el trigger
-- para que, al sumar puntos por completar un quiz, se entreguen todas las
-- medallas cuyo umbral haya alcanzado el estudiante.
-- =====================================================================

create or replace function public.award_quiz_points()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  reward        integer;
  first_badge   uuid;
  new_total     integer;
begin
  -- Solo actúa cuando el intento queda completado
  if new.completed_at is null then
    return new;
  end if;

  -- Evita volver a sumar si el intento ya estaba completado
  if tg_op = 'UPDATE' and old.completed_at is not null then
    return new;
  end if;

  -- Suma la recompensa del quiz al total del estudiante
  select points_reward into reward from public.quizzes where id = new.quiz_id;
  if reward is null then
    reward := 0;
  end if;

  update public.profiles
     set total_points = total_points + reward
   where id = new.student_id
  returning total_points into new_total;

  -- Medalla por completar el primer quiz (umbral 0)
  select id into first_badge from public.badges where code = 'first_quiz';
  if first_badge is not null then
    insert into public.student_badges (student_id, badge_id)
    values (new.student_id, first_badge)
    on conflict (student_id, badge_id) do nothing;
  end if;

  -- Medallas por umbral de puntos: entrega todas las que el estudiante
  -- haya alcanzado con su nuevo total y que aún no posea.
  insert into public.student_badges (student_id, badge_id)
  select new.student_id, b.id
    from public.badges b
   where b.points_required > 0
     and b.points_required <= new_total
  on conflict (student_id, badge_id) do nothing;

  return new;
end;
$$;

-- El trigger award_quiz_points_trg sigue vigente desde 0002; no es
-- necesario recrearlo. create or replace conserva los permisos fijados
-- en 0004 (revoke a public/anon/authenticated).

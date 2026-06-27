-- Admin: función is_admin(), RPC para cambiar
-- rol y eliminar usuarios y cursos

-- nuevo valor en el enum
alter type public.user_role add value if not exists 'admin';

create or replace function public.is_admin()
returns boolean
language sql stable security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles where id = auth.uid() and role = 'admin'
  );
$$;

grant execute on function public.is_admin() to authenticated;

-- RPC para que el admin cambie el rol de un usuario
create or replace function public.admin_cambiar_rol(
  target_user_id uuid,
  nuevo_rol       text
)
returns void
language plpgsql security definer
set search_path = public
as $$
begin
  if not public.is_admin() then
    raise exception 'Solo el administrador puede cambiar roles'
      using errcode = '42501';
  end if;

  if nuevo_rol not in ('student', 'teacher', 'admin') then
    raise exception 'Rol inválido: %', nuevo_rol
      using errcode = '22023';
  end if;

  update public.profiles
    set role = nuevo_rol::public.user_role,
        updated_at = now()
  where id = target_user_id;
end;
$$;

grant execute on function public.admin_cambiar_rol(uuid, text) to authenticated;

-- RPC para que el admin elimine un usuario
create or replace function public.admin_eliminar_usuario(
  target_user_id uuid
)
returns void
language plpgsql security definer
set search_path = public
as $$
begin
  if not public.is_admin() then
    raise exception 'Solo el administrador puede eliminar usuarios'
      using errcode = '42501';
  end if;

  delete from auth.users where id = target_user_id;
end;
$$;

grant execute on function public.admin_eliminar_usuario(uuid) to authenticated;

-- RPC para resetear puntos 
create or replace function public.admin_resetear_puntos(
  target_user_id uuid
)
returns void
language plpgsql security definer
set search_path = public
as $$
begin
  if not public.is_admin() then
    raise exception 'Solo el administrador puede resetear puntos'
      using errcode = '42501';
  end if;

  update public.profiles
    set total_points = 0, updated_at = now()
  where id = target_user_id;
end;
$$;

grant execute on function public.admin_resetear_puntos(uuid) to authenticated;
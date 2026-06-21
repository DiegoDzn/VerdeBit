import { supabase } from './client';

export interface Event {
  id: string;
  author_id: string;
  title: string;
  description: string;
  location: string;
  starts_at: string;
  ends_at: string;
  created_at: string;
  updated_at: string;
}

/**
 * Obtiene todos los eventos futuros ordenados por fecha de inicio
 */
export async function getUpcomingEvents(): Promise<Event[]> {
  const { data, error } = await supabase
    .from('events')
    .select('*')
    .gte('starts_at', new Date().toISOString())
    .order('starts_at', { ascending: true });

  if (error) {
    console.error('Error al obtener eventos:', error);
    return [];
  }

  return data || [];
}

/**
 * Obtiene todos los eventos sin filtro de fecha
 */
export async function getAllEvents(): Promise<Event[]> {
  const { data, error } = await supabase
    .from('events')
    .select('*')
    .order('starts_at', { ascending: true });

  if (error) {
    console.error('Error al obtener todos los eventos:', error);
    return [];
  }

  return data || [];
}

/**
 * Obtiene un evento por ID
 */
export async function getEventById(id: string): Promise<Event | null> {
  const { data, error } = await supabase
    .from('events')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error(`Error al obtener evento ${id}:`, error);
    return null;
  }

  return data;
}

/**
 * Crea un nuevo evento (requiere rol de profesor)
 */
export async function createEvent(
  title: string,
  description: string,
  location: string,
  startsAt: string,
  endsAt: string,
): Promise<Event | null> {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    console.error('No hay usuario autenticado');
    return null;
  }

  const { data, error } = await supabase
    .from('events')
    .insert([
      {
        author_id: user.id,
        title,
        description,
        location,
        starts_at: startsAt,
        ends_at: endsAt,
      },
    ])
    .select()
    .single();

  if (error) {
    console.error('Error al crear evento:', error);
    return null;
  }

  return data;
}

/**
 * Actualiza un evento
 */
export async function updateEvent(
  id: string,
  updates: Partial<Omit<Event, 'id' | 'author_id' | 'created_at'>>,
): Promise<Event | null> {
  const { data, error } = await supabase
    .from('events')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error(`Error al actualizar evento ${id}:`, error);
    return null;
  }

  return data;
}

/**
 * Elimina un evento
 */
export async function deleteEvent(id: string): Promise<boolean> {
  const { error } = await supabase.from('events').delete().eq('id', id);

  if (error) {
    console.error(`Error al eliminar evento ${id}:`, error);
    return false;
  }

  return true;
}

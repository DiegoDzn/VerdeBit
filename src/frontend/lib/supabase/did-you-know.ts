import { supabase } from './client';

export interface DidYouKnow {
  id: string;
  title: string;
  content: string;
  source: string | null;
  image_url: string | null;
  is_published: boolean;
  created_at: string;
  updated_at: string;
}

/**
 * Obtiene todos los datos de "¿Sabías que...?" publicados
 */
export async function getDidYouKnowData(): Promise<DidYouKnow[]> {
  const { data, error } = await supabase
    .from('did_you_know')
    .select('*')
    .eq('is_published', true)
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Error al obtener datos de did_you_know:', error);
    return [];
  }

  return data || [];
}

/**
 * Obtiene un dato de "¿Sabías que...?" por ID
 */
export async function getDidYouKnowById(id: string): Promise<DidYouKnow | null> {
  const { data, error } = await supabase
    .from('did_you_know')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error(`Error al obtener did_you_know ${id}:`, error);
    return null;
  }

  return data;
}

/**
 * Crea un nuevo registro de "¿Sabías que...?" (requiere rol de profesor)
 */
export async function createDidYouKnow(
  title: string,
  content: string,
  source?: string,
  imageUrl?: string,
): Promise<DidYouKnow | null> {
  const { data, error } = await supabase
    .from('did_you_know')
    .insert([
      {
        title,
        content,
        source: source || null,
        image_url: imageUrl || null,
        is_published: false,
      },
    ])
    .select()
    .single();

  if (error) {
    console.error('Error al crear did_you_know:', error);
    return null;
  }

  return data;
}

/**
 * Actualiza un registro de "¿Sabías que...?"
 */
export async function updateDidYouKnow(
  id: string,
  updates: Partial<Omit<DidYouKnow, 'id' | 'created_at'>>,
): Promise<DidYouKnow | null> {
  const { data, error } = await supabase
    .from('did_you_know')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error(`Error al actualizar did_you_know ${id}:`, error);
    return null;
  }

  return data;
}

/**
 * Elimina un registro de "¿Sabías que...?"
 */
export async function deleteDidYouKnow(id: string): Promise<boolean> {
  const { error } = await supabase
    .from('did_you_know')
    .delete()
    .eq('id', id);

  if (error) {
    console.error(`Error al eliminar did_you_know ${id}:`, error);
    return false;
  }

  return true;
}

import { supabase } from '@/lib/supabase/client';
import type { DidYouKnow, MapucheContent } from '@/lib/types';

export async function listDidYouKnow(): Promise<DidYouKnow[]> {
  const { data, error } = await supabase
    .from('did_you_know')
    .select('*')
    .eq('is_published', true)
    .order('created_at', { ascending: false });

  if (error) throw new Error(error.message);
  return (data ?? []) as DidYouKnow[];
}

export async function listMapucheContent(): Promise<MapucheContent[]> {
  const { data, error } = await supabase
    .from('mapuche_content')
    .select('*')
    .eq('is_published', true)
    .order('created_at', { ascending: false });

  if (error) throw new Error(error.message);
  return (data ?? []) as MapucheContent[];
}

import { supabase } from '@/lib/supabase/client';
import type { Species, SpeciesKind } from '@/lib/types';

export async function listSpecies(kind?: SpeciesKind): Promise<Species[]> {
  let query = supabase
    .from('species')
    .select('*')
    .order('common_name', { ascending: true });

  if (kind) {
    query = query.eq('kind', kind);
  }

  const { data, error } = await query;

  if (error) throw new Error(error.message);
  return (data ?? []) as Species[];
}

export async function getSpecies(speciesId: string): Promise<Species> {
  const { data, error } = await supabase
    .from('species')
    .select('*')
    .eq('id', speciesId)
    .single();

  if (error) throw new Error(error.message);
  return data as Species;
}

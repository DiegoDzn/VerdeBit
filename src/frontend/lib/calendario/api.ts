import { supabase } from '@/lib/supabase/client';
import type { Event } from '@/lib/types';

export async function listUpcomingEvents(fromDate = new Date()): Promise<Event[]> {
  const { data, error } = await supabase
    .from('events')
    .select('*')
    .gte('starts_at', fromDate.toISOString())
    .order('starts_at', { ascending: true });

  if (error) throw new Error(error.message);
  return (data ?? []) as Event[];
}

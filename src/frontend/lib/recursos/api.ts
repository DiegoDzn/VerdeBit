import { supabase } from '@/lib/supabase/client';
import type { EducationalResource, ResourceType } from '@/lib/types';

// Lista todos los recursos visibles (RLS permite lectura a autenticados)
export async function listResources(): Promise<EducationalResource[]> {
  const { data, error } = await supabase
    .from('educational_resources')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw new Error(error.message);
  return (data ?? []) as EducationalResource[];
}

// Recursos publicados por un profesor
export async function getMyResources(authorId: string): Promise<EducationalResource[]> {
  const { data, error } = await supabase
    .from('educational_resources')
    .select('*')
    .eq('author_id', authorId)
    .order('created_at', { ascending: false });

  if (error) throw new Error(error.message);
  return (data ?? []) as EducationalResource[];
}

// Obtiene un recurso por id
export async function getResource(resourceId: string): Promise<EducationalResource> {
  const { data, error } = await supabase
    .from('educational_resources')
    .select('*')
    .eq('id', resourceId)
    .single();

  if (error) throw new Error(error.message);
  return data as EducationalResource;
}

// Crea un recurso 
export async function createResource(
  authorId: string,
  title: string,
  description: string | null,
  resourceType: ResourceType,
  url: string,
  subjectArea: string | null,
): Promise<EducationalResource> {
  const { data, error } = await supabase
    .from('educational_resources')
    .insert({
      author_id: authorId,
      title,
      description,
      resource_type: resourceType,
      url,
      subject_area: subjectArea,
    })
    .select('*')
    .single();

  if (error) throw new Error(error.message);
  return data as EducationalResource;
}

// Actualiza un recurso del profesor autor
export async function updateResource(
  resourceId: string,
  updates: Partial<Pick<EducationalResource, 'title' | 'description' | 'resource_type' | 'url' | 'subject_area'>>,
): Promise<void> {
  const { error } = await supabase
    .from('educational_resources')
    .update(updates)
    .eq('id', resourceId);

  if (error) throw new Error(error.message);
}

// Elimina un recurso del profesor autor
export async function deleteResource(resourceId: string): Promise<void> {
  const { error } = await supabase
    .from('educational_resources')
    .delete()
    .eq('id', resourceId);

  if (error) throw new Error(error.message);
}

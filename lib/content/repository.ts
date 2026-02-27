import 'server-only';

import { isSupabaseConfigured } from '@/lib/supabase/config';
import { createSupabaseServerClient } from '@/lib/supabase/server';

export const CONTENT_COLLECTIONS = [
  'services',
  'products',
  'kits',
  'portfolio',
] as const;

export type ContentCollection = (typeof CONTENT_COLLECTIONS)[number];
export type ContentStatus = 'draft' | 'published';

const TABLE_BY_COLLECTION: Record<ContentCollection, string> = {
  services: 'services',
  products: 'products',
  kits: 'kits',
  portfolio: 'portfolio_items',
};

export type ContentItem = {
  id: string;
  slug: string;
  status: ContentStatus;
  title_ar: string;
  title_en: string;
  description_ar: string | null;
  description_en: string | null;
  created_by: string;
  assigned_to: string | null;
  created_at: string;
  updated_at: string;
};

export type ContentInput = {
  titleAr: string;
  titleEn: string;
  descriptionAr?: string;
  descriptionEn?: string;
  slug: string;
  status: ContentStatus;
  assignedTo?: string;
};

function normalizeNullable(value: string | undefined): string | null {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

export async function listPublishedContent(collection: ContentCollection): Promise<ContentItem[]> {
  if (!isSupabaseConfigured()) {
    return [];
  }

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from(TABLE_BY_COLLECTION[collection])
    .select(
      'id, slug, status, title_ar, title_en, description_ar, description_en, created_by, assigned_to, created_at, updated_at',
    )
    .eq('status', 'published')
    .order('created_at', { ascending: false });

  if (error || !data) {
    return [];
  }

  return data as ContentItem[];
}

export async function listManageableContent(collection: ContentCollection): Promise<ContentItem[]> {
  if (!isSupabaseConfigured()) {
    return [];
  }

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from(TABLE_BY_COLLECTION[collection])
    .select(
      'id, slug, status, title_ar, title_en, description_ar, description_en, created_by, assigned_to, created_at, updated_at',
    )
    .order('updated_at', { ascending: false });

  if (error || !data) {
    return [];
  }

  return data as ContentItem[];
}

export async function createContentItem(
  collection: ContentCollection,
  input: ContentInput,
  userId: string,
): Promise<{ success: true } | { success: false; message: string }> {
  if (!isSupabaseConfigured()) {
    return { success: false, message: 'Supabase is not configured.' };
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from(TABLE_BY_COLLECTION[collection]).insert({
    status: input.status,
    title_ar: input.titleAr.trim(),
    title_en: input.titleEn.trim(),
    description_ar: normalizeNullable(input.descriptionAr),
    description_en: normalizeNullable(input.descriptionEn),
    slug: input.slug.trim(),
    created_by: userId,
    assigned_to: normalizeNullable(input.assignedTo),
  });

  if (error) {
    return { success: false, message: error.message };
  }

  return { success: true };
}

export async function updateContentItem(
  collection: ContentCollection,
  id: string,
  input: ContentInput,
): Promise<{ success: true } | { success: false; message: string }> {
  if (!isSupabaseConfigured()) {
    return { success: false, message: 'Supabase is not configured.' };
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase
    .from(TABLE_BY_COLLECTION[collection])
    .update({
      status: input.status,
      title_ar: input.titleAr.trim(),
      title_en: input.titleEn.trim(),
      description_ar: normalizeNullable(input.descriptionAr),
      description_en: normalizeNullable(input.descriptionEn),
      slug: input.slug.trim(),
      assigned_to: normalizeNullable(input.assignedTo),
    })
    .eq('id', id);

  if (error) {
    return { success: false, message: error.message };
  }

  return { success: true };
}

export async function deleteContentItem(
  collection: ContentCollection,
  id: string,
): Promise<{ success: true } | { success: false; message: string }> {
  if (!isSupabaseConfigured()) {
    return { success: false, message: 'Supabase is not configured.' };
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from(TABLE_BY_COLLECTION[collection]).delete().eq('id', id);

  if (error) {
    return { success: false, message: error.message };
  }

  return { success: true };
}

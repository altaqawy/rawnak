import 'server-only';

import { createSupabaseAdminClient } from '@/lib/supabase/admin';
import {
  getSupabaseUrl,
  isSupabaseAdminConfigured,
  isSupabaseConfigured,
} from '@/lib/supabase/config';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { OWNER_MEDIA_BUCKET, defaultThemeTokens } from '@/lib/builder/defaults';
import { normalizeBlocks, normalizeThemeTokens } from '@/lib/builder/normalize';
import type {
  AuditLogRecord,
  BuilderPageRecord,
  BuilderPageRevisionRecord,
  BuilderPageStatus,
  BuilderTemplateRecord,
  MediaRecord,
  PublishedNavPageRecord,
  PublishedPageRecord,
  ThemePresetRecord,
  ThemeRevisionRecord,
  ThemeTokens,
} from '@/lib/builder/types';

type SavePageInput = {
  pageId: string;
  slug: string;
  titleAr: string;
  titleEn: string;
  navLabelAr: string;
  navLabelEn: string;
  showInNav: boolean;
  navOrder: number;
  status: BuilderPageStatus;
  blocksJson: unknown;
  actorId: string;
};

export type PublicSiteSettings = {
  brandNameAr: string | null;
  brandNameEn: string | null;
  taglineAr: string | null;
  taglineEn: string | null;
  logoPath: string | null;
  customersSignupEnabled: boolean;
  bgMotionEnabled: boolean;
  bgIntensityLight: number;
  bgIntensityDark: number;
  tokens: ThemeTokens;
};

export async function listOwnerPages(): Promise<BuilderPageRecord[]> {
  if (!isSupabaseConfigured()) return [];

  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from('pages')
    .select(
      'id, slug, status, title_ar, title_en, nav_label_ar, nav_label_en, show_in_nav, nav_order, is_system, blocks_json, created_at, updated_at',
    )
    .order('nav_order', { ascending: true })
    .order('updated_at', { ascending: false });

  return (data as BuilderPageRecord[] | null) ?? [];
}

export async function getOwnerPageById(pageId: string): Promise<BuilderPageRecord | null> {
  if (!isSupabaseConfigured()) return null;

  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from('pages')
    .select(
      'id, slug, status, title_ar, title_en, nav_label_ar, nav_label_en, show_in_nav, nav_order, is_system, blocks_json, created_at, updated_at',
    )
    .eq('id', pageId)
    .maybeSingle();

  return (data as BuilderPageRecord | null) ?? null;
}

export async function getOwnerPageBySlug(slug: string): Promise<BuilderPageRecord | null> {
  if (!isSupabaseConfigured()) return null;

  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from('pages')
    .select(
      'id, slug, status, title_ar, title_en, nav_label_ar, nav_label_en, show_in_nav, nav_order, is_system, blocks_json, created_at, updated_at',
    )
    .eq('slug', slug)
    .maybeSingle();

  return (data as BuilderPageRecord | null) ?? null;
}

export async function listPublishedNavPages(): Promise<PublishedNavPageRecord[]> {
  if (!isSupabaseConfigured()) return [];
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase.rpc('get_published_nav_pages');
  return (data as PublishedNavPageRecord[] | null) ?? [];
}

export async function createOwnerPage(input: {
  slug: string;
  titleAr: string;
  titleEn: string;
  navLabelAr?: string;
  navLabelEn?: string;
  showInNav?: boolean;
  navOrder?: number;
}): Promise<{ success: true; id: string } | { success: false; message: string }> {
  if (!isSupabaseConfigured()) {
    return { success: false, message: 'Supabase is not configured.' };
  }

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from('pages')
    .insert({
      slug: input.slug.trim(),
      title_ar: input.titleAr.trim() || null,
      title_en: input.titleEn.trim() || null,
      nav_label_ar: input.navLabelAr?.trim() || null,
      nav_label_en: input.navLabelEn?.trim() || null,
      show_in_nav: input.showInNav ?? false,
      nav_order: input.navOrder ?? 100,
      status: 'draft',
      blocks_json: [],
    })
    .select('id')
    .single();

  if (error || !data) {
    return { success: false, message: error?.message ?? 'Unable to create page.' };
  }

  return { success: true, id: data.id as string };
}

export async function deleteOwnerPage(
  pageId: string,
): Promise<{ success: true } | { success: false; message: string }> {
  if (!isSupabaseConfigured()) {
    return { success: false, message: 'Supabase is not configured.' };
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from('pages').delete().eq('id', pageId);

  if (error) return { success: false, message: error.message };
  return { success: true };
}

export async function saveOwnerPage(input: SavePageInput): Promise<
  { success: true } | { success: false; message: string }
> {
  if (!isSupabaseConfigured()) {
    return { success: false, message: 'Supabase is not configured.' };
  }

  const normalizedBlocks = normalizeBlocks(input.blocksJson);
  const supabase = await createSupabaseServerClient();

  const { data: updatedPage, error: updateError } = await supabase
    .from('pages')
    .update({
      slug: input.slug.trim(),
      title_ar: input.titleAr.trim() || null,
      title_en: input.titleEn.trim() || null,
      nav_label_ar: input.navLabelAr.trim() || null,
      nav_label_en: input.navLabelEn.trim() || null,
      show_in_nav: input.showInNav,
      nav_order: input.navOrder,
      status: input.status,
      blocks_json: normalizedBlocks,
    })
    .eq('id', input.pageId)
    .select(
      'id, slug, status, title_ar, title_en, nav_label_ar, nav_label_en, show_in_nav, nav_order, is_system, blocks_json, updated_at',
    )
    .single();

  if (updateError || !updatedPage) {
    return { success: false, message: updateError?.message ?? 'Unable to save page.' };
  }

  const snapshot = {
    page: updatedPage,
    savedAt: updatedPage.updated_at,
  };

  const { error: revisionError } = await supabase.from('page_revisions').insert({
    page_id: input.pageId,
    snapshot_json: snapshot,
    created_by: input.actorId,
  });

  if (revisionError) {
    return { success: false, message: revisionError.message };
  }

  return { success: true };
}

export async function listPageRevisions(pageId: string): Promise<BuilderPageRevisionRecord[]> {
  if (!isSupabaseConfigured()) return [];

  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from('page_revisions')
    .select('id, page_id, snapshot_json, created_by, created_at')
    .eq('page_id', pageId)
    .order('created_at', { ascending: false });

  return (data as BuilderPageRevisionRecord[] | null) ?? [];
}

export async function restorePageRevision(input: {
  pageId: string;
  revisionId: string;
  actorId: string;
}): Promise<{ success: true } | { success: false; message: string }> {
  if (!isSupabaseConfigured()) {
    return { success: false, message: 'Supabase is not configured.' };
  }

  const supabase = await createSupabaseServerClient();
  const { data: revision, error: revisionError } = await supabase
    .from('page_revisions')
    .select('snapshot_json')
    .eq('id', input.revisionId)
    .eq('page_id', input.pageId)
    .maybeSingle();

  if (revisionError || !revision) {
    return { success: false, message: revisionError?.message ?? 'Revision not found.' };
  }

  const snapshot = revision.snapshot_json as {
    page?: {
      slug?: string;
      status?: BuilderPageStatus;
      title_ar?: string | null;
      title_en?: string | null;
      nav_label_ar?: string | null;
      nav_label_en?: string | null;
      show_in_nav?: boolean;
      nav_order?: number;
      blocks_json?: unknown;
    };
  };

  const pageSnapshot = snapshot.page;
  if (!pageSnapshot) {
    return { success: false, message: 'Revision payload is invalid.' };
  }

  const { error: updateError } = await supabase
    .from('pages')
    .update({
      slug: (pageSnapshot.slug ?? '').trim(),
      status: pageSnapshot.status ?? 'draft',
      title_ar: pageSnapshot.title_ar ?? null,
      title_en: pageSnapshot.title_en ?? null,
      nav_label_ar: pageSnapshot.nav_label_ar ?? null,
      nav_label_en: pageSnapshot.nav_label_en ?? null,
      show_in_nav: pageSnapshot.show_in_nav ?? false,
      nav_order: pageSnapshot.nav_order ?? 100,
      blocks_json: normalizeBlocks(pageSnapshot.blocks_json),
    })
    .eq('id', input.pageId);

  if (updateError) {
    return { success: false, message: updateError.message };
  }

  const { error: revisionInsertError } = await supabase.from('page_revisions').insert({
    page_id: input.pageId,
    snapshot_json: {
      page: {
        slug: pageSnapshot.slug ?? '',
        status: pageSnapshot.status ?? 'draft',
        title_ar: pageSnapshot.title_ar ?? null,
        title_en: pageSnapshot.title_en ?? null,
        nav_label_ar: pageSnapshot.nav_label_ar ?? null,
        nav_label_en: pageSnapshot.nav_label_en ?? null,
        show_in_nav: pageSnapshot.show_in_nav ?? false,
        nav_order: pageSnapshot.nav_order ?? 100,
        blocks_json: normalizeBlocks(pageSnapshot.blocks_json),
      },
      restoredFromRevisionId: input.revisionId,
    },
    created_by: input.actorId,
  });

  if (revisionInsertError) {
    return { success: false, message: revisionInsertError.message };
  }

  return { success: true };
}

export async function listOwnerTemplates(): Promise<BuilderTemplateRecord[]> {
  if (!isSupabaseConfigured()) return [];

  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from('templates')
    .select('id, name, snapshot_json, created_by, created_at')
    .order('created_at', { ascending: false });

  return (data as BuilderTemplateRecord[] | null) ?? [];
}

export async function saveTemplateSnapshot(input: {
  name: string;
  snapshotJson: unknown;
  actorId: string;
}): Promise<{ success: true; id: string } | { success: false; message: string }> {
  if (!isSupabaseConfigured()) {
    return { success: false, message: 'Supabase is not configured.' };
  }

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from('templates')
    .insert({
      name: input.name.trim() || null,
      snapshot_json: input.snapshotJson,
      created_by: input.actorId,
    })
    .select('id')
    .single();

  if (error || !data) {
    return { success: false, message: error?.message ?? 'Unable to save template.' };
  }

  return { success: true, id: data.id as string };
}

export async function deleteTemplate(
  templateId: string,
): Promise<{ success: true } | { success: false; message: string }> {
  if (!isSupabaseConfigured()) {
    return { success: false, message: 'Supabase is not configured.' };
  }
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from('templates').delete().eq('id', templateId);
  if (error) return { success: false, message: error.message };
  return { success: true };
}

export async function getTemplateById(templateId: string): Promise<BuilderTemplateRecord | null> {
  if (!isSupabaseConfigured()) return null;
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from('templates')
    .select('id, name, snapshot_json, created_by, created_at')
    .eq('id', templateId)
    .maybeSingle();

  return (data as BuilderTemplateRecord | null) ?? null;
}

export async function listThemePresets(): Promise<ThemePresetRecord[]> {
  if (!isSupabaseConfigured()) return [];
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from('theme_presets')
    .select('id, name, tokens_json, created_by, created_at')
    .order('created_at', { ascending: false });
  return (data as ThemePresetRecord[] | null) ?? [];
}

export async function createThemePreset(input: {
  name: string;
  tokens: ThemeTokens;
  actorId: string;
}): Promise<{ success: true } | { success: false; message: string }> {
  if (!isSupabaseConfigured()) return { success: false, message: 'Supabase is not configured.' };

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from('theme_presets').insert({
    name: input.name.trim() || null,
    tokens_json: input.tokens,
    created_by: input.actorId,
  });

  if (error) return { success: false, message: error.message };
  return { success: true };
}

export async function createThemeRevision(input: {
  actorId: string;
  snapshotJson: unknown;
}): Promise<{ success: true } | { success: false; message: string }> {
  if (!isSupabaseConfigured()) return { success: false, message: 'Supabase is not configured.' };
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from('theme_revisions').insert({
    created_by: input.actorId,
    snapshot_json: input.snapshotJson,
  });
  if (error) return { success: false, message: error.message };
  return { success: true };
}

export async function listThemeRevisions(): Promise<ThemeRevisionRecord[]> {
  if (!isSupabaseConfigured()) return [];
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from('theme_revisions')
    .select('id, snapshot_json, created_by, created_at')
    .order('created_at', { ascending: false })
    .limit(200);
  return (data as ThemeRevisionRecord[] | null) ?? [];
}

export async function restoreThemeRevision(
  revisionId: string,
): Promise<{ success: true } | { success: false; message: string }> {
  if (!isSupabaseConfigured()) return { success: false, message: 'Supabase is not configured.' };
  const supabase = await createSupabaseServerClient();
  const { data: revision, error } = await supabase
    .from('theme_revisions')
    .select('snapshot_json')
    .eq('id', revisionId)
    .maybeSingle();

  if (error || !revision) {
    return { success: false, message: error?.message ?? 'Theme revision not found.' };
  }

  const snapshot = revision.snapshot_json as {
    tokens?: unknown;
    bg_motion_enabled?: boolean;
    bg_intensity_light?: number;
    bg_intensity_dark?: number;
  };

  const { error: updateError } = await supabase
    .from('site_settings')
    .update({
      active_theme_tokens_json: normalizeThemeTokens(snapshot.tokens ?? {}),
      bg_motion_enabled: snapshot.bg_motion_enabled ?? true,
      bg_intensity_light: snapshot.bg_intensity_light ?? 1,
      bg_intensity_dark: snapshot.bg_intensity_dark ?? 1,
    })
    .eq('id', 1);

  if (updateError) return { success: false, message: updateError.message };
  return { success: true };
}

export async function getOwnerSiteSettings() {
  if (!isSupabaseConfigured()) return null;

  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from('site_settings')
    .select(
      'id, brand_name_ar, brand_name_en, tagline_ar, tagline_en, logo_path, customers_signup_enabled, bg_motion_enabled, bg_intensity_light, bg_intensity_dark, active_theme_tokens_json',
    )
    .eq('id', 1)
    .maybeSingle();

  return data;
}

export async function applyThemePreset(
  presetId: string,
): Promise<{ success: true } | { success: false; message: string }> {
  if (!isSupabaseConfigured()) return { success: false, message: 'Supabase is not configured.' };

  const supabase = await createSupabaseServerClient();
  const { data: preset, error: presetError } = await supabase
    .from('theme_presets')
    .select('tokens_json')
    .eq('id', presetId)
    .maybeSingle();

  if (presetError || !preset) {
    return { success: false, message: presetError?.message ?? 'Preset not found.' };
  }

  const tokens = normalizeThemeTokens(preset.tokens_json);
  const { error: updateError } = await supabase
    .from('site_settings')
    .update({
      active_theme_tokens_json: tokens,
    })
    .eq('id', 1);

  if (updateError) return { success: false, message: updateError.message };
  return { success: true };
}

export async function updateSiteSettingsOwner(input: {
  brandNameAr: string;
  brandNameEn: string;
  taglineAr: string;
  taglineEn: string;
  logoPath: string;
  customersSignupEnabled: boolean;
  bgMotionEnabled: boolean;
  bgIntensityLight: number;
  bgIntensityDark: number;
  tokens: ThemeTokens;
}): Promise<{ success: true } | { success: false; message: string }> {
  if (!isSupabaseConfigured()) return { success: false, message: 'Supabase is not configured.' };

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase
    .from('site_settings')
    .update({
      brand_name_ar: input.brandNameAr.trim() || null,
      brand_name_en: input.brandNameEn.trim() || null,
      tagline_ar: input.taglineAr.trim() || null,
      tagline_en: input.taglineEn.trim() || null,
      logo_path: input.logoPath.trim() || null,
      customers_signup_enabled: input.customersSignupEnabled,
      bg_motion_enabled: input.bgMotionEnabled,
      bg_intensity_light: input.bgIntensityLight,
      bg_intensity_dark: input.bgIntensityDark,
      active_theme_tokens_json: input.tokens,
    })
    .eq('id', 1);

  if (error) return { success: false, message: error.message };
  return { success: true };
}

export async function listMediaItems(): Promise<MediaRecord[]> {
  if (!isSupabaseConfigured()) return [];
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from('media')
    .select('id, storage_path, media_type, alt_ar, alt_en, created_by, created_at')
    .order('created_at', { ascending: false });
  return (data as MediaRecord[] | null) ?? [];
}

async function ensureMediaBucketExists() {
  if (!isSupabaseAdminConfigured()) {
    throw new Error('Supabase admin environment variables are not configured.');
  }

  const admin = createSupabaseAdminClient();
  const { data: bucket } = await admin.storage.getBucket(OWNER_MEDIA_BUCKET);

  if (!bucket) {
    const { error } = await admin.storage.createBucket(OWNER_MEDIA_BUCKET, {
      public: false,
      fileSizeLimit: 10 * 1024 * 1024,
    });
    if (error && !error.message.toLowerCase().includes('already')) {
      throw new Error(error.message);
    }
  } else if (bucket.public) {
    const { error } = await admin.storage.updateBucket(OWNER_MEDIA_BUCKET, {
      public: false,
      fileSizeLimit: 10 * 1024 * 1024,
    });
    if (error) {
      throw new Error(error.message);
    }
  }
}

function detectMediaType(file: File): string {
  const mime = file.type.toLowerCase();
  if (mime.startsWith('image/')) return 'image';
  if (mime.startsWith('video/')) return 'video';
  if (mime.startsWith('audio/')) return 'audio';
  if (mime === 'application/json' || mime === 'text/json') return 'lottie';
  if (mime === 'model/gltf+json' || mime === 'model/gltf-binary') return 'model3d';

  const fileName = file.name.toLowerCase();
  if (fileName.endsWith('.glb') || fileName.endsWith('.gltf')) return 'model3d';
  if (fileName.endsWith('.json')) return 'lottie';
  return 'file';
}

export async function uploadMedia(input: {
  file: File;
  altAr: string;
  altEn: string;
  actorId: string;
}): Promise<{ success: true } | { success: false; message: string }> {
  if (!isSupabaseConfigured() || !isSupabaseAdminConfigured()) {
    return { success: false, message: 'Supabase is not configured.' };
  }

  if (input.file.size > 10 * 1024 * 1024) {
    return { success: false, message: 'File size exceeds the 10MB limit.' };
  }

  await ensureMediaBucketExists();

  const admin = createSupabaseAdminClient();
  const extension = input.file.name.includes('.')
    ? input.file.name.slice(input.file.name.lastIndexOf('.'))
    : '';
  const storagePath = `${Date.now()}-${crypto.randomUUID()}${extension}`;
  const arrayBuffer = await input.file.arrayBuffer();

  const { error: uploadError } = await admin.storage
    .from(OWNER_MEDIA_BUCKET)
    .upload(storagePath, arrayBuffer, {
      contentType: input.file.type || 'application/octet-stream',
      upsert: false,
    });

  if (uploadError) return { success: false, message: uploadError.message };

  const supabase = await createSupabaseServerClient();
  const { error: insertError } = await supabase.from('media').insert({
    storage_path: storagePath,
    media_type: detectMediaType(input.file),
    alt_ar: input.altAr.trim() || null,
    alt_en: input.altEn.trim() || null,
    created_by: input.actorId,
  });

  if (insertError) return { success: false, message: insertError.message };

  return { success: true };
}

export async function deleteMediaItem(
  mediaId: string,
): Promise<{ success: true } | { success: false; message: string }> {
  if (!isSupabaseConfigured() || !isSupabaseAdminConfigured()) {
    return { success: false, message: 'Supabase is not configured.' };
  }

  const supabase = await createSupabaseServerClient();
  const { data: mediaRow, error: fetchError } = await supabase
    .from('media')
    .select('storage_path')
    .eq('id', mediaId)
    .maybeSingle();

  if (fetchError || !mediaRow) {
    return { success: false, message: fetchError?.message ?? 'Media item not found.' };
  }

  const admin = createSupabaseAdminClient();
  const { error: storageError } = await admin.storage
    .from(OWNER_MEDIA_BUCKET)
    .remove([mediaRow.storage_path as string]);

  if (storageError) {
    return { success: false, message: storageError.message };
  }

  const { error: deleteError } = await supabase.from('media').delete().eq('id', mediaId);
  if (deleteError) return { success: false, message: deleteError.message };

  return { success: true };
}

export async function listAuditLog(): Promise<AuditLogRecord[]> {
  if (!isSupabaseConfigured()) return [];
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from('audit_log')
    .select('id, actor_id, action, entity_type, entity_id, details_json, created_at')
    .order('created_at', { ascending: false })
    .limit(500);
  return (data as AuditLogRecord[] | null) ?? [];
}

export async function appendAuditLog(input: {
  actorId: string;
  action: string;
  entityType: string;
  entityId?: string;
  detailsJson?: Record<string, unknown>;
}) {
  if (!isSupabaseConfigured()) return;
  const supabase = await createSupabaseServerClient();
  await supabase.from('audit_log').insert({
    actor_id: input.actorId,
    action: input.action,
    entity_type: input.entityType,
    entity_id: input.entityId ?? null,
    details_json: input.detailsJson ?? null,
  });
}

export async function getPublicSiteSettings(): Promise<PublicSiteSettings> {
  const fallback = defaultThemeTokens();
  if (!isSupabaseConfigured()) {
    return {
      brandNameAr: null,
      brandNameEn: null,
      taglineAr: null,
      taglineEn: null,
      logoPath: null,
      customersSignupEnabled: true,
      bgMotionEnabled: true,
      bgIntensityLight: 1,
      bgIntensityDark: 1,
      tokens: fallback,
    };
  }

  const supabase = await createSupabaseServerClient();
  const { data } = await supabase.rpc('get_public_site_settings');

  const row = Array.isArray(data) ? data[0] : data;

  return {
    brandNameAr: row?.brand_name_ar ?? null,
    brandNameEn: row?.brand_name_en ?? null,
    taglineAr: row?.tagline_ar ?? null,
    taglineEn: row?.tagline_en ?? null,
    logoPath: row?.logo_path ?? null,
    customersSignupEnabled: row?.customers_signup_enabled ?? true,
    bgMotionEnabled: row?.bg_motion_enabled ?? true,
    bgIntensityLight: Number(row?.bg_intensity_light ?? 1),
    bgIntensityDark: Number(row?.bg_intensity_dark ?? 1),
    tokens: normalizeThemeTokens(row?.active_theme_tokens_json ?? fallback),
  };
}

export async function getPublishedPageBySlug(slug: string): Promise<PublishedPageRecord | null> {
  if (!isSupabaseConfigured()) return null;

  const supabase = await createSupabaseServerClient();
  const { data } = await supabase.rpc('get_published_page_by_slug', {
    input_slug: slug,
  });

  const row = Array.isArray(data) ? data[0] : data;
  if (!row) return null;

  return row as PublishedPageRecord;
}

export function collectMediaPathsFromBlocks(blocks: unknown): string[] {
  const normalized = normalizeBlocks(blocks);
  const unique = new Set<string>();
  const looksLikeStoragePath = (value: string) =>
    value.includes('/') || value.includes('.') || value.startsWith('http');

  for (const block of normalized) {
    for (const value of block.content.mediaPaths ?? []) {
      if (value) unique.add(value);
    }
    for (const value of block.content.mediaIds ?? []) {
      if (value && looksLikeStoragePath(value)) unique.add(value);
    }
    const lottieRef = block.animation.lottie?.mediaId;
    if (lottieRef && looksLikeStoragePath(lottieRef)) {
      unique.add(lottieRef);
    }
  }

  return Array.from(unique);
}

export async function createSignedMediaUrlMap(
  storagePaths: string[],
  expiresInSeconds = 60 * 60,
): Promise<Record<string, string>> {
  if (!isSupabaseAdminConfigured() || storagePaths.length === 0) {
    return {};
  }

  const uniquePaths = Array.from(new Set(storagePaths.filter(Boolean)));
  const admin = createSupabaseAdminClient();
  const entries = await Promise.all(
    uniquePaths.map(async (path) => {
      const { data, error } = await admin.storage
        .from(OWNER_MEDIA_BUCKET)
        .createSignedUrl(path, expiresInSeconds);
      if (error || !data?.signedUrl) return [path, ''] as const;
      return [path, data.signedUrl] as const;
    }),
  );

  return Object.fromEntries(entries.filter((entry) => entry[1]));
}

export function getMediaPublicUrl(storagePath: string): string {
  if (!isSupabaseConfigured()) return '';
  const baseUrl = getSupabaseUrl().replace(/\/$/, '');
  const safePath = storagePath.replace(/^\//, '');
  return `${baseUrl}/storage/v1/object/public/${OWNER_MEDIA_BUCKET}/${safePath}`;
}

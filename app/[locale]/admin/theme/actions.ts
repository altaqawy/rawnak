'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { requireOwner } from '@/lib/auth/guards';
import { normalizeThemeTokens } from '@/lib/builder/normalize';
import {
  appendAuditLog,
  applyThemePreset,
  createThemePreset,
  createThemeRevision,
  getOwnerSiteSettings,
  listThemeRevisions,
  restoreThemeRevision,
  updateSiteSettingsOwner,
} from '@/lib/builder/repository';

function withQuery(pathname: string, query: Record<string, string | undefined>) {
  const params = new URLSearchParams();
  Object.entries(query).forEach(([key, value]) => {
    if (value) params.set(key, value);
  });
  const search = params.toString();
  return search ? `${pathname}?${search}` : pathname;
}

function themePath(locale: string) {
  return `/${locale}/admin/theme`;
}

function toNumber(value: FormDataEntryValue | null, fallback: number) {
  if (typeof value !== 'string') return fallback;
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.min(2, Math.max(0, parsed));
}

function toBoolean(value: FormDataEntryValue | null) {
  return value === 'on' || value === 'true';
}

function readTokens(formData: FormData) {
  return normalizeThemeTokens({
    light: {
      base: String(formData.get('light_base') ?? ''),
      secondary: String(formData.get('light_secondary') ?? ''),
      primary: String(formData.get('light_primary') ?? ''),
      text: String(formData.get('light_text') ?? ''),
    },
    dark: {
      base: String(formData.get('dark_base') ?? ''),
      secondary: String(formData.get('dark_secondary') ?? ''),
      accent: String(formData.get('dark_accent') ?? ''),
      text: String(formData.get('dark_text') ?? ''),
    },
    radius: String(formData.get('radius') ?? ''),
    shadowSoft: String(formData.get('shadow_soft') ?? ''),
    typographyScale: String(formData.get('typography_scale') ?? ''),
  });
}

export async function saveThemeSettingsAction(locale: string, formData: FormData) {
  const context = await requireOwner(locale);
  const tokens = readTokens(formData);
  const currentSettings = await getOwnerSiteSettings();

  if (!currentSettings) {
    redirect(withQuery(themePath(locale), { error: 'save_failed' }));
  }

  await createThemeRevision({
    actorId: context.user!.id,
    snapshotJson: {
      tokens: currentSettings.active_theme_tokens_json,
      bg_motion_enabled: currentSettings.bg_motion_enabled ?? true,
      bg_intensity_light: Number(currentSettings.bg_intensity_light ?? 1),
      bg_intensity_dark: Number(currentSettings.bg_intensity_dark ?? 1),
    },
  });

  const result = await updateSiteSettingsOwner({
    brandNameAr: currentSettings.brand_name_ar ?? '',
    brandNameEn: currentSettings.brand_name_en ?? '',
    taglineAr: currentSettings.tagline_ar ?? '',
    taglineEn: currentSettings.tagline_en ?? '',
    logoPath: currentSettings.logo_path ?? '',
    customersSignupEnabled: currentSettings.customers_signup_enabled ?? true,
    bgMotionEnabled: toBoolean(formData.get('bg_motion_enabled')),
    bgIntensityLight: toNumber(formData.get('bg_intensity_light'), 1),
    bgIntensityDark: toNumber(formData.get('bg_intensity_dark'), 1),
    tokens,
  });

  if (!result.success) {
    redirect(withQuery(themePath(locale), { error: 'save_failed' }));
  }

  await appendAuditLog({
    actorId: context.user!.id,
    action: 'theme.update',
    entityType: 'site_settings',
    detailsJson: { bgMotionEnabled: toBoolean(formData.get('bg_motion_enabled')) },
  });

  revalidatePath(themePath(locale));
  revalidatePath(`/${locale}`);
  redirect(withQuery(themePath(locale), { status: 'saved' }));
}

export async function saveThemePresetAction(locale: string, formData: FormData) {
  const context = await requireOwner(locale);
  const name = String(formData.get('preset_name') ?? '').trim();
  const tokens = readTokens(formData);

  const result = await createThemePreset({
    name,
    tokens,
    actorId: context.user!.id,
  });

  if (!result.success) {
    redirect(withQuery(themePath(locale), { error: 'save_failed' }));
  }

  await appendAuditLog({
    actorId: context.user!.id,
    action: 'theme.preset.save',
    entityType: 'theme_preset',
    detailsJson: { name: name || null },
  });

  revalidatePath(themePath(locale));
  redirect(withQuery(themePath(locale), { status: 'preset_saved' }));
}

export async function applyThemePresetAction(locale: string, formData: FormData) {
  const context = await requireOwner(locale);
  const presetId = String(formData.get('preset_id') ?? '').trim();
  if (!presetId) {
    redirect(withQuery(themePath(locale), { error: 'invalid_request' }));
  }

  const currentSettings = await getOwnerSiteSettings();
  if (currentSettings) {
    await createThemeRevision({
      actorId: context.user!.id,
      snapshotJson: {
        tokens: currentSettings.active_theme_tokens_json,
        bg_motion_enabled: currentSettings.bg_motion_enabled ?? true,
        bg_intensity_light: Number(currentSettings.bg_intensity_light ?? 1),
        bg_intensity_dark: Number(currentSettings.bg_intensity_dark ?? 1),
      },
    });
  }

  const result = await applyThemePreset(presetId);
  if (!result.success) {
    redirect(withQuery(themePath(locale), { error: 'save_failed' }));
  }

  await appendAuditLog({
    actorId: context.user!.id,
    action: 'theme.apply',
    entityType: 'theme_preset',
    entityId: presetId,
  });

  revalidatePath(themePath(locale));
  revalidatePath(`/${locale}`);
  redirect(withQuery(themePath(locale), { status: 'applied' }));
}

export async function restoreThemeRevisionAction(locale: string, formData: FormData) {
  const context = await requireOwner(locale);
  const revisionId = String(formData.get('revision_id') ?? '').trim();
  if (!revisionId) {
    redirect(withQuery(themePath(locale), { error: 'invalid_request' }));
  }

  const revisions = await listThemeRevisions();
  const exists = revisions.some((item) => item.id === revisionId);
  if (!exists) {
    redirect(withQuery(themePath(locale), { error: 'invalid_request' }));
  }

  const result = await restoreThemeRevision(revisionId);
  if (!result.success) {
    redirect(withQuery(themePath(locale), { error: 'save_failed' }));
  }

  await appendAuditLog({
    actorId: context.user!.id,
    action: 'theme.restore',
    entityType: 'theme_revision',
    entityId: revisionId,
  });

  revalidatePath(themePath(locale));
  revalidatePath(`/${locale}`);
  redirect(withQuery(themePath(locale), { status: 'restored' }));
}

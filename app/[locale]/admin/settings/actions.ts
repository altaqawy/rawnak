'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { requireOwner } from '@/lib/auth/guards';
import { normalizeThemeTokens } from '@/lib/builder/normalize';
import {
  appendAuditLog,
  getOwnerSiteSettings,
  updateSiteSettingsOwner,
} from '@/lib/builder/repository';

function withQuery(pathname: string, query: Record<string, string | undefined>) {
  const params = new URLSearchParams();
  Object.entries(query).forEach(([key, value]) => {
    if (value) params.set(key, value);
  });
  const queryString = params.toString();
  return queryString ? `${pathname}?${queryString}` : pathname;
}

function parseBoolean(value: FormDataEntryValue | null): boolean {
  return value === 'on' || value === 'true';
}

function settingsPath(locale: string) {
  return `/${locale}/admin/settings`;
}

export async function saveOwnerSiteSettingsAction(locale: string, formData: FormData) {
  const context = await requireOwner(locale);

  const current = await getOwnerSiteSettings();
  if (!current) {
    redirect(withQuery(settingsPath(locale), { error: 'save_failed' }));
  }

  const result = await updateSiteSettingsOwner({
    brandNameAr: String(formData.get('brand_name_ar') ?? '').trim(),
    brandNameEn: String(formData.get('brand_name_en') ?? '').trim(),
    taglineAr: String(formData.get('tagline_ar') ?? '').trim(),
    taglineEn: String(formData.get('tagline_en') ?? '').trim(),
    logoPath: String(formData.get('logo_path') ?? '').trim(),
    customersSignupEnabled: parseBoolean(formData.get('customers_signup_enabled')),
    bgMotionEnabled: current.bg_motion_enabled ?? true,
    bgIntensityLight: Number(current.bg_intensity_light ?? 1),
    bgIntensityDark: Number(current.bg_intensity_dark ?? 1),
    tokens: normalizeThemeTokens(current.active_theme_tokens_json ?? {}),
  });

  if (!result.success) {
    redirect(withQuery(settingsPath(locale), { error: 'save_failed' }));
  }

  await appendAuditLog({
    actorId: context.user!.id,
    action: 'site_settings.update',
    entityType: 'site_settings',
  });

  revalidatePath(settingsPath(locale));
  revalidatePath(`/${locale}`);
  redirect(withQuery(settingsPath(locale), { status: 'saved' }));
}

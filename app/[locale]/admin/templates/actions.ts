'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { requireOwner } from '@/lib/auth/guards';
import { normalizeBlocks } from '@/lib/builder/normalize';
import {
  appendAuditLog,
  createOwnerPage,
  deleteTemplate,
  getTemplateById,
  saveOwnerPage,
} from '@/lib/builder/repository';

const RESERVED_SLUGS = new Set([
  'admin',
  'portal',
  'auth',
  'services',
  'products',
  'diy',
  'portfolio',
  'about',
  'contact',
  'p',
  'api',
  '_next',
]);

function withQuery(pathname: string, query: Record<string, string | undefined>) {
  const params = new URLSearchParams();
  Object.entries(query).forEach(([key, value]) => {
    if (value) params.set(key, value);
  });
  const search = params.toString();
  return search ? `${pathname}?${search}` : pathname;
}

function templatesPath(locale: string) {
  return `/${locale}/admin/templates`;
}

function editorPath(locale: string, pageId: string) {
  return `/${locale}/admin/builder/${pageId}`;
}

export async function applyTemplateToNewPageAction(locale: string, formData: FormData) {
  const context = await requireOwner(locale);
  const templateId = String(formData.get('template_id') ?? '').trim();
  const slug = String(formData.get('slug') ?? '').trim();
  const normalizedSlug = slug.toLowerCase();
  const titleAr = String(formData.get('title_ar') ?? '').trim();
  const titleEn = String(formData.get('title_en') ?? '').trim();

  if (!templateId || !normalizedSlug) {
    redirect(withQuery(templatesPath(locale), { error: 'missing_fields' }));
  }
  if (RESERVED_SLUGS.has(normalizedSlug)) {
    redirect(withQuery(templatesPath(locale), { error: 'invalid_request' }));
  }

  const template = await getTemplateById(templateId);
  if (!template) {
    redirect(withQuery(templatesPath(locale), { error: 'invalid_request' }));
  }

  const createdPage = await createOwnerPage({
    slug: normalizedSlug,
    titleAr,
    titleEn,
    navLabelAr: '',
    navLabelEn: '',
    showInNav: false,
    navOrder: 100,
  });
  if (!createdPage.success) {
    redirect(withQuery(templatesPath(locale), { error: 'save_failed' }));
  }

  const snapshot = template.snapshot_json as {
    kind?: string;
    page?: {
      blocks_json?: unknown;
    };
    blocks_json?: unknown;
  };

  const blocks =
    snapshot.kind === 'page'
      ? normalizeBlocks(snapshot.page?.blocks_json ?? [])
      : normalizeBlocks(snapshot.blocks_json ?? []);

  const result = await saveOwnerPage({
    pageId: createdPage.id,
    slug: normalizedSlug,
    titleAr,
    titleEn,
    navLabelAr: '',
    navLabelEn: '',
    showInNav: false,
    navOrder: 100,
    status: 'draft',
    blocksJson: blocks,
    actorId: context.user!.id,
  });

  if (!result.success) {
    redirect(withQuery(templatesPath(locale), { error: 'save_failed' }));
  }

  await appendAuditLog({
    actorId: context.user!.id,
    action: 'template.apply',
    entityType: 'template',
    entityId: templateId,
    detailsJson: { pageId: createdPage.id, slug: normalizedSlug },
  });

  revalidatePath(templatesPath(locale));
  revalidatePath(`/${locale}/admin/pages`);
  redirect(editorPath(locale, createdPage.id));
}

export async function deleteTemplateAction(locale: string, formData: FormData) {
  const context = await requireOwner(locale);
  const templateId = String(formData.get('template_id') ?? '').trim();
  if (!templateId) {
    redirect(withQuery(templatesPath(locale), { error: 'invalid_request' }));
  }

  const result = await deleteTemplate(templateId);
  if (!result.success) {
    redirect(withQuery(templatesPath(locale), { error: 'delete_failed' }));
  }

  await appendAuditLog({
    actorId: context.user!.id,
    action: 'template.delete',
    entityType: 'template',
    entityId: templateId,
  });

  revalidatePath(templatesPath(locale));
  redirect(withQuery(templatesPath(locale), { status: 'deleted' }));
}

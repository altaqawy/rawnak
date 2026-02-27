'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { requireOwner } from '@/lib/auth/guards';
import { normalizeBlocks } from '@/lib/builder/normalize';
import {
  appendAuditLog,
  createOwnerPage,
  deleteOwnerPage,
  getOwnerPageById,
  restorePageRevision,
  saveOwnerPage,
  saveTemplateSnapshot,
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

function adminPages(locale: string) {
  return `/${locale}/admin/pages`;
}

function adminPageEditor(locale: string, pageId: string) {
  return `/${locale}/admin/builder/${pageId}`;
}

export async function createPageAction(locale: string, formData: FormData) {
  const context = await requireOwner(locale);
  const slug = String(formData.get('slug') ?? '').trim();
  const normalizedSlug = slug.toLowerCase();
  const titleAr = String(formData.get('title_ar') ?? '').trim();
  const titleEn = String(formData.get('title_en') ?? '').trim();
  const navLabelAr = String(formData.get('nav_label_ar') ?? '').trim();
  const navLabelEn = String(formData.get('nav_label_en') ?? '').trim();
  const showInNav = formData.get('show_in_nav') === 'on';
  const navOrder = Number(formData.get('nav_order') ?? 100);

  if (!normalizedSlug) {
    redirect(withQuery(adminPages(locale), { error: 'missing_fields' }));
  }
  if (RESERVED_SLUGS.has(normalizedSlug)) {
    redirect(withQuery(adminPages(locale), { error: 'invalid_request' }));
  }

  const result = await createOwnerPage({
    slug: normalizedSlug,
    titleAr,
    titleEn,
    navLabelAr,
    navLabelEn,
    showInNav,
    navOrder: Number.isFinite(navOrder) ? navOrder : 100,
  });
  if (!result.success) {
    redirect(withQuery(adminPages(locale), { error: 'save_failed' }));
  }

  await appendAuditLog({
    actorId: context.user!.id,
    action: 'page.create',
    entityType: 'page',
    entityId: result.id,
    detailsJson: { slug: normalizedSlug },
  });

  revalidatePath(adminPages(locale));
  redirect(adminPageEditor(locale, result.id));
}

export async function savePageAction(locale: string, formData: FormData) {
  const context = await requireOwner(locale);
  const pageId = String(formData.get('page_id') ?? '').trim();
  const slug = String(formData.get('slug') ?? '').trim();
  const normalizedSlug = slug.toLowerCase();
  const titleAr = String(formData.get('title_ar') ?? '').trim();
  const titleEn = String(formData.get('title_en') ?? '').trim();
  const navLabelAr = String(formData.get('nav_label_ar') ?? '').trim();
  const navLabelEn = String(formData.get('nav_label_en') ?? '').trim();
  const showInNav = formData.get('show_in_nav') === 'on';
  const navOrder = Number(formData.get('nav_order') ?? 100);
  const intent = String(formData.get('intent') ?? 'draft').trim();
  const blocksRaw = String(formData.get('blocks_json') ?? '[]');
  const existingPage = await getOwnerPageById(pageId);

  if (!pageId || !normalizedSlug || !existingPage) {
    redirect(withQuery(adminPages(locale), { error: 'invalid_request' }));
  }
  if (RESERVED_SLUGS.has(normalizedSlug) && normalizedSlug !== existingPage.slug) {
    redirect(withQuery(adminPageEditor(locale, pageId), { error: 'invalid_request' }));
  }

  let blocksJson: unknown = [];
  try {
    blocksJson = JSON.parse(blocksRaw);
  } catch {
    redirect(withQuery(adminPageEditor(locale, pageId), { error: 'invalid_request' }));
  }

  const normalizedBlocks = normalizeBlocks(blocksJson);
  const status = intent === 'publish' ? 'published' : 'draft';
  const result = await saveOwnerPage({
    pageId,
    slug: normalizedSlug,
    titleAr,
    titleEn,
    navLabelAr,
    navLabelEn,
    showInNav,
    navOrder: Number.isFinite(navOrder) ? navOrder : 100,
    status,
    blocksJson: normalizedBlocks,
    actorId: context.user!.id,
  });

  if (!result.success) {
    redirect(withQuery(adminPageEditor(locale, pageId), { error: 'save_failed' }));
  }

  const auditAction =
    intent === 'publish' ? 'page.publish' : intent === 'unpublish' ? 'page.unpublish' : 'page.update';

  await appendAuditLog({
    actorId: context.user!.id,
    action: auditAction,
    entityType: 'page',
    entityId: pageId,
    detailsJson: {
      slug: normalizedSlug,
      status,
      showInNav,
      navOrder: Number.isFinite(navOrder) ? navOrder : 100,
    },
  });

  revalidatePath(adminPages(locale));
  revalidatePath(adminPageEditor(locale, pageId));
  revalidatePath(`/${locale}/${normalizedSlug}`);
  revalidatePath(`/${locale}/p/${normalizedSlug}`);
  if (existingPage?.slug && existingPage.slug !== normalizedSlug) {
    revalidatePath(`/${locale}/${existingPage.slug}`);
    revalidatePath(`/${locale}/p/${existingPage.slug}`);
  }
  redirect(withQuery(adminPageEditor(locale, pageId), { status: 'saved' }));
}

export async function deletePageAction(locale: string, formData: FormData) {
  const context = await requireOwner(locale);
  const pageId = String(formData.get('page_id') ?? '').trim();
  if (!pageId) {
    redirect(withQuery(adminPages(locale), { error: 'invalid_request' }));
  }

  const page = await getOwnerPageById(pageId);
  const result = await deleteOwnerPage(pageId);
  if (!result.success) {
    redirect(withQuery(adminPages(locale), { error: 'delete_failed' }));
  }

  await appendAuditLog({
    actorId: context.user!.id,
    action: 'page.delete',
    entityType: 'page',
    entityId: pageId,
    detailsJson: { slug: page?.slug ?? null },
  });

  revalidatePath(adminPages(locale));
  if (page?.slug) {
    revalidatePath(`/${locale}/p/${page.slug}`);
  }
  redirect(withQuery(adminPages(locale), { status: 'deleted' }));
}

export async function restoreRevisionAction(locale: string, formData: FormData) {
  const context = await requireOwner(locale);
  const pageId = String(formData.get('page_id') ?? '').trim();
  const revisionId = String(formData.get('revision_id') ?? '').trim();

  if (!pageId || !revisionId) {
    redirect(withQuery(adminPages(locale), { error: 'invalid_request' }));
  }

  const result = await restorePageRevision({
    pageId,
    revisionId,
    actorId: context.user!.id,
  });

  if (!result.success) {
    redirect(withQuery(adminPageEditor(locale, pageId), { error: 'save_failed' }));
  }

  await appendAuditLog({
    actorId: context.user!.id,
    action: 'revision.restore',
    entityType: 'page',
    entityId: pageId,
    detailsJson: { revisionId },
  });

  revalidatePath(adminPageEditor(locale, pageId));
  revalidatePath(adminPages(locale));
  redirect(withQuery(adminPageEditor(locale, pageId), { status: 'restored' }));
}

export async function savePageTemplateAction(locale: string, formData: FormData) {
  const context = await requireOwner(locale);
  const pageId = String(formData.get('page_id') ?? '').trim();
  const name = String(formData.get('name') ?? '').trim();

  if (!pageId) {
    redirect(withQuery(adminPages(locale), { error: 'invalid_request' }));
  }

  const page = await getOwnerPageById(pageId);
  if (!page) {
    redirect(withQuery(adminPages(locale), { error: 'invalid_request' }));
  }

  const snapshot = {
    kind: 'page',
    page: {
      slug: page.slug,
      title_ar: page.title_ar,
      title_en: page.title_en,
      blocks_json: normalizeBlocks(page.blocks_json),
    },
  };

  const result = await saveTemplateSnapshot({
    name,
    snapshotJson: snapshot,
    actorId: context.user!.id,
  });

  if (!result.success) {
    redirect(withQuery(adminPageEditor(locale, pageId), { error: 'save_failed' }));
  }

  await appendAuditLog({
    actorId: context.user!.id,
    action: 'template.save',
    entityType: 'template',
    entityId: result.id,
    detailsJson: { source: 'page', pageId },
  });

  revalidatePath(`/${locale}/admin/templates`);
  redirect(withQuery(adminPageEditor(locale, pageId), { status: 'template_saved' }));
}

export async function saveBlockGroupTemplateAction(locale: string, formData: FormData) {
  const context = await requireOwner(locale);
  const pageId = String(formData.get('page_id') ?? '').trim();
  const name = String(formData.get('name') ?? '').trim();
  const blockIdsRaw = String(formData.get('selected_block_ids') ?? '[]');
  const blocksRaw = String(formData.get('blocks_json') ?? '[]');

  if (!pageId) {
    redirect(withQuery(adminPages(locale), { error: 'invalid_request' }));
  }

  let selectedIds: string[] = [];
  let blocksInput: unknown = [];
  try {
    const parsedIds = JSON.parse(blockIdsRaw);
    selectedIds = Array.isArray(parsedIds)
      ? parsedIds.filter((value): value is string => typeof value === 'string')
      : [];
    blocksInput = JSON.parse(blocksRaw);
  } catch {
    redirect(withQuery(adminPageEditor(locale, pageId), { error: 'invalid_request' }));
  }

  const normalized = normalizeBlocks(blocksInput);
  const selectedBlocks = normalized.filter((block) => selectedIds.includes(block.id));

  if (selectedBlocks.length === 0) {
    redirect(withQuery(adminPageEditor(locale, pageId), { error: 'missing_fields' }));
  }

  const result = await saveTemplateSnapshot({
    name,
    snapshotJson: {
      kind: 'block_group',
      blocks_json: selectedBlocks,
    },
    actorId: context.user!.id,
  });

  if (!result.success) {
    redirect(withQuery(adminPageEditor(locale, pageId), { error: 'save_failed' }));
  }

  await appendAuditLog({
    actorId: context.user!.id,
    action: 'template.save',
    entityType: 'template',
    entityId: result.id,
    detailsJson: { source: 'block_group', pageId, blocksCount: selectedBlocks.length },
  });

  revalidatePath(`/${locale}/admin/templates`);
  redirect(withQuery(adminPageEditor(locale, pageId), { status: 'template_saved' }));
}

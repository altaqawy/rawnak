'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { requireStaff } from '@/lib/auth/guards';
import {
  CONTENT_COLLECTIONS,
  createContentItem,
  deleteContentItem,
  listManageableContent,
  type ContentCollection,
  type ContentStatus,
  updateContentItem,
} from '@/lib/content/repository';
import { appendAuditLog } from '@/lib/builder/repository';
import { recordAnalyticsEvent } from '@/lib/analytics/repository';

const CONTENT_SET = new Set<string>(CONTENT_COLLECTIONS);
const STATUS_SET = new Set<ContentStatus>(['draft', 'published']);

const ADMIN_PATH_BY_COLLECTION: Record<ContentCollection, string> = {
  services: 'services',
  products: 'products',
  kits: 'kits',
  portfolio: 'portfolio',
};

const PUBLIC_PATH_BY_COLLECTION: Record<ContentCollection, string> = {
  services: 'services',
  products: 'products',
  kits: 'diy',
  portfolio: 'portfolio',
};

function withQuery(pathname: string, query: Record<string, string | undefined>) {
  const params = new URLSearchParams();
  Object.entries(query).forEach(([key, value]) => {
    if (value) params.set(key, value);
  });
  const queryString = params.toString();
  return queryString ? `${pathname}?${queryString}` : pathname;
}

function parseCollection(value: FormDataEntryValue | null): ContentCollection | null {
  if (!value || typeof value !== 'string') return null;
  return CONTENT_SET.has(value) ? (value as ContentCollection) : null;
}

function parseStatus(value: FormDataEntryValue | null): ContentStatus {
  if (!value || typeof value !== 'string') return 'draft';
  return STATUS_SET.has(value as ContentStatus) ? (value as ContentStatus) : 'draft';
}

function getAdminPath(locale: string, collection: ContentCollection) {
  return `/${locale}/admin/${ADMIN_PATH_BY_COLLECTION[collection]}`;
}

function getPublicPath(locale: string, collection: ContentCollection) {
  return `/${locale}/${PUBLIC_PATH_BY_COLLECTION[collection]}`;
}

export async function createContentAction(locale: string, formData: FormData) {
  const context = await requireStaff(locale);
  const collection = parseCollection(formData.get('collection'));

  if (!collection || !context.user) {
    redirect(withQuery(`/${locale}/admin`, { error: 'invalid_request' }));
  }

  const titleAr = String(formData.get('title_ar') ?? '').trim();
  const titleEn = String(formData.get('title_en') ?? '').trim();
  const slug = String(formData.get('slug') ?? '').trim();

  if (!titleAr || !titleEn || !slug) {
    redirect(withQuery(getAdminPath(locale, collection), { error: 'missing_fields' }));
  }

  const result = await createContentItem(
    collection,
    {
      status: parseStatus(formData.get('status')),
      titleAr,
      titleEn,
      descriptionAr: String(formData.get('description_ar') ?? ''),
      descriptionEn: String(formData.get('description_en') ?? ''),
      slug,
      assignedTo: String(formData.get('assigned_to') ?? ''),
    },
    context.user.id,
  );

  if (!result.success) {
    redirect(withQuery(getAdminPath(locale, collection), { error: 'save_failed' }));
  }

  revalidatePath(getAdminPath(locale, collection));
  revalidatePath(getPublicPath(locale, collection));
  redirect(withQuery(getAdminPath(locale, collection), { status: 'saved' }));
}

export async function updateContentAction(locale: string, formData: FormData) {
  await requireStaff(locale);
  const collection = parseCollection(formData.get('collection'));
  const id = String(formData.get('id') ?? '').trim();

  if (!collection || !id) {
    redirect(withQuery(`/${locale}/admin`, { error: 'invalid_request' }));
  }

  const titleAr = String(formData.get('title_ar') ?? '').trim();
  const titleEn = String(formData.get('title_en') ?? '').trim();
  const slug = String(formData.get('slug') ?? '').trim();

  if (!titleAr || !titleEn || !slug) {
    redirect(withQuery(getAdminPath(locale, collection), { error: 'missing_fields' }));
  }

  const result = await updateContentItem(collection, id, {
    status: parseStatus(formData.get('status')),
    titleAr,
    titleEn,
    descriptionAr: String(formData.get('description_ar') ?? ''),
    descriptionEn: String(formData.get('description_en') ?? ''),
    slug,
    assignedTo: String(formData.get('assigned_to') ?? ''),
  });

  if (!result.success) {
    redirect(withQuery(getAdminPath(locale, collection), { error: 'save_failed' }));
  }

  revalidatePath(getAdminPath(locale, collection));
  revalidatePath(getPublicPath(locale, collection));
  redirect(withQuery(getAdminPath(locale, collection), { status: 'saved' }));
}

export async function deleteContentAction(locale: string, formData: FormData) {
  await requireStaff(locale);
  const collection = parseCollection(formData.get('collection'));
  const id = String(formData.get('id') ?? '').trim();

  if (!collection || !id) {
    redirect(withQuery(`/${locale}/admin`, { error: 'invalid_request' }));
  }

  const result = await deleteContentItem(collection, id);
  if (!result.success) {
    redirect(withQuery(getAdminPath(locale, collection), { error: 'delete_failed' }));
  }

  revalidatePath(getAdminPath(locale, collection));
  revalidatePath(getPublicPath(locale, collection));
  redirect(withQuery(getAdminPath(locale, collection), { status: 'deleted' }));
}

export async function recordContentCompletionAction(locale: string, formData: FormData) {
  const context = await requireStaff(locale);
  const collection = parseCollection(formData.get('collection'));
  const id = String(formData.get('id') ?? '').trim();

  if (!collection || !id || !context.user) {
    redirect(withQuery(`/${locale}/admin`, { error: 'invalid_request' }));
  }

  const items = await listManageableContent(collection);
  const item = items.find((candidate) => candidate.id === id);

  if (!item) {
    redirect(withQuery(getAdminPath(locale, collection), { error: 'invalid_request' }));
  }

  const safeLocale = locale === 'ar' ? 'ar' : 'en';
  const label = safeLocale === 'ar' ? item.title_ar : item.title_en;
  await recordAnalyticsEvent({
    eventName: 'operation_completed',
    locale: safeLocale,
    pageSlug: PUBLIC_PATH_BY_COLLECTION[collection],
    entityType: collection,
    entityId: item.id,
    entitySlug: item.slug,
    entityLabel: label,
    userId: context.user.id,
    metadata: {
      source: 'admin_manual',
      collection,
    },
  });

  await appendAuditLog({
    actorId: context.user.id,
    action: 'content.operation_completed',
    entityType: collection,
    entityId: item.id,
    detailsJson: {
      slug: item.slug,
    },
  });

  revalidatePath(getAdminPath(locale, collection));
  revalidatePath(`/${locale}/admin/analytics`);
  redirect(withQuery(getAdminPath(locale, collection), { status: 'saved' }));
}

'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { requireOwner } from '@/lib/auth/guards';
import { appendAuditLog, deleteMediaItem, uploadMedia } from '@/lib/builder/repository';

function withQuery(pathname: string, query: Record<string, string | undefined>) {
  const params = new URLSearchParams();
  Object.entries(query).forEach(([key, value]) => {
    if (value) params.set(key, value);
  });
  const search = params.toString();
  return search ? `${pathname}?${search}` : pathname;
}

function mediaPath(locale: string) {
  return `/${locale}/admin/media`;
}

export async function uploadMediaAction(locale: string, formData: FormData) {
  const context = await requireOwner(locale);
  const file = formData.get('file');
  const altAr = String(formData.get('alt_ar') ?? '').trim();
  const altEn = String(formData.get('alt_en') ?? '').trim();

  if (!(file instanceof File) || file.size === 0) {
    redirect(withQuery(mediaPath(locale), { error: 'missing_fields' }));
  }

  const result = await uploadMedia({
    file,
    altAr,
    altEn,
    actorId: context.user!.id,
  });

  if (!result.success) {
    redirect(withQuery(mediaPath(locale), { error: 'save_failed' }));
  }

  await appendAuditLog({
    actorId: context.user!.id,
    action: 'media.upload',
    entityType: 'media',
    detailsJson: { fileName: file.name },
  });

  revalidatePath(mediaPath(locale));
  redirect(withQuery(mediaPath(locale), { status: 'saved' }));
}

export async function deleteMediaAction(locale: string, formData: FormData) {
  const context = await requireOwner(locale);
  const mediaId = String(formData.get('media_id') ?? '').trim();
  if (!mediaId) {
    redirect(withQuery(mediaPath(locale), { error: 'invalid_request' }));
  }

  const result = await deleteMediaItem(mediaId);
  if (!result.success) {
    redirect(withQuery(mediaPath(locale), { error: 'delete_failed' }));
  }

  await appendAuditLog({
    actorId: context.user!.id,
    action: 'media.delete',
    entityType: 'media',
    entityId: mediaId,
  });

  revalidatePath(mediaPath(locale));
  redirect(withQuery(mediaPath(locale), { status: 'deleted' }));
}

'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { requireOwner } from '@/lib/auth/guards';
import { appendAuditLog } from '@/lib/builder/repository';
import {
  importTableFromFile,
  parseImportTarget,
  type ImportMode,
} from '@/lib/admin-console/importer';

function withQuery(pathname: string, query: Record<string, string | undefined>) {
  const params = new URLSearchParams();
  Object.entries(query).forEach(([key, value]) => {
    if (value) params.set(key, value);
  });
  const queryString = params.toString();
  return queryString ? `${pathname}?${queryString}` : pathname;
}

function integrationsPath(locale: string) {
  return `/${locale}/admin/settings/integrations`;
}

function targetRevalidatePath(locale: string, target: string): string {
  if (target === 'services') return `/${locale}/admin/services`;
  if (target === 'products') return `/${locale}/admin/products`;
  if (target === 'kits') return `/${locale}/admin/kits`;
  if (target === 'portfolio_items') return `/${locale}/admin/portfolio`;
  if (target === 'inventory_items') return `/${locale}/admin/inventory/items`;
  if (target === 'customers') return `/${locale}/admin/customers`;
  if (target === 'leads_requests') return `/${locale}/admin/leads`;
  return `/${locale}/admin`;
}

function parseMode(value: FormDataEntryValue | null): ImportMode {
  return value === 'upsert' ? 'upsert' : 'insert';
}

export async function importDataFileAction(locale: string, formData: FormData) {
  const context = await requireOwner(locale);

  const targetInput = String(formData.get('target') ?? '');
  const target = parseImportTarget(targetInput);
  if (!target) {
    redirect(withQuery(integrationsPath(locale), { error: 'invalid_target' }));
  }

  const file = formData.get('file');
  if (!(file instanceof File) || file.size === 0) {
    redirect(withQuery(integrationsPath(locale), { error: 'file_required' }));
  }

  const mode = parseMode(formData.get('mode'));
  const dryRun = formData.get('dry_run') === 'on';
  const summary = await importTableFromFile({
    file,
    target,
    mode,
    dryRun,
    actorId: context.user!.id,
  });

  await appendAuditLog({
    actorId: context.user!.id,
    action: 'data_import.run',
    entityType: target,
    detailsJson: {
      mode,
      dryRun,
      parsedRows: summary.parsedRows,
      validRows: summary.validRows,
      writtenRows: summary.writtenRows,
      skippedRows: summary.skippedRows,
      errorCount: summary.errorCount,
    },
  });

  revalidatePath(`/${locale}/admin`);
  revalidatePath(`/${locale}/admin/dashboard`);
  revalidatePath(targetRevalidatePath(locale, target));
  revalidatePath(integrationsPath(locale));

  redirect(
    withQuery(integrationsPath(locale), {
      status: summary.ok ? (dryRun ? 'dry_run_done' : 'import_done') : undefined,
      target,
      parsed: String(summary.parsedRows),
      valid: String(summary.validRows),
      written: String(summary.writtenRows),
      skipped: String(summary.skippedRows),
      errors: String(summary.errorCount),
      error: summary.ok ? undefined : 'import_failed',
    }),
  );
}

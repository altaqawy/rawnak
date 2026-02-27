import 'server-only';

import * as XLSX from 'xlsx';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { isSupabaseConfigured } from '@/lib/supabase/config';

const CONTENT_TARGETS = ['services', 'products', 'kits', 'portfolio_items'] as const;
const IMPORT_TARGETS = [
  ...CONTENT_TARGETS,
  'inventory_items',
  'customers',
  'leads_requests',
] as const;

const CONTENT_STATUSES = new Set(['draft', 'published']);
const LEAD_STATUSES = new Set(['new', 'in_progress', 'closed']);
const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export type ImportTarget = (typeof IMPORT_TARGETS)[number];
export type ImportMode = 'insert' | 'upsert';

export type ImportError = {
  row: number;
  message: string;
};

export type ImportSummary = {
  ok: boolean;
  target: ImportTarget;
  parsedRows: number;
  validRows: number;
  writtenRows: number;
  skippedRows: number;
  errorCount: number;
  errors: ImportError[];
};

type RawRow = Record<string, unknown>;

function isImportTarget(value: string): value is ImportTarget {
  return IMPORT_TARGETS.includes(value as ImportTarget);
}

function normalizeKey(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^\w\u0600-\u06ff]+/g, '_')
    .replace(/^_+|_+$/g, '');
}

const KEY_ALIAS: Record<string, string> = {
  slug: 'slug',
  title_ar: 'title_ar',
  title_en: 'title_en',
  description_ar: 'description_ar',
  description_en: 'description_en',
  status: 'status',
  assigned_to: 'assigned_to',
  sku: 'sku',
  name: 'name',
  name_ar: 'name_ar',
  name_en: 'name_en',
  user_id: 'user_id',
  customer_id: 'customer_id',
  channel: 'channel',
};

function normalizeRow(row: RawRow): RawRow {
  const normalized: RawRow = {};
  for (const [rawKey, value] of Object.entries(row)) {
    const key = KEY_ALIAS[normalizeKey(rawKey)] ?? normalizeKey(rawKey);
    normalized[key] = value;
  }
  return normalized;
}

function valueToString(row: RawRow, key: string): string | null {
  const raw = row[key];
  if (raw == null) return null;
  const value = String(raw).trim();
  return value ? value : null;
}

function valueToOptionalUuid(row: RawRow, key: string): string | null {
  const value = valueToString(row, key);
  if (!value) return null;
  return UUID_REGEX.test(value) ? value : null;
}

function parseJsonRows(text: string): RawRow[] {
  const parsed = JSON.parse(text);
  if (!Array.isArray(parsed)) return [];
  return parsed.filter((row): row is RawRow => row != null && typeof row === 'object');
}

async function readRowsFromFile(file: File): Promise<RawRow[]> {
  const name = file.name.toLowerCase();
  if (name.endsWith('.json')) {
    const text = await file.text();
    return parseJsonRows(text);
  }

  const bytes = await file.arrayBuffer();
  const workbook = XLSX.read(bytes, { type: 'array' });
  const firstSheetName = workbook.SheetNames[0];
  if (!firstSheetName) return [];
  const sheet = workbook.Sheets[firstSheetName];
  return XLSX.utils.sheet_to_json<RawRow>(sheet, { defval: null, raw: false });
}

function buildContentPayload(row: RawRow, actorId: string): { payload?: RawRow; error?: string } {
  const slug = valueToString(row, 'slug');
  const titleAr = valueToString(row, 'title_ar');
  const titleEn = valueToString(row, 'title_en');
  if (!slug || !titleAr || !titleEn) {
    return { error: 'Missing required columns: slug, title_ar, title_en.' };
  }

  const status = valueToString(row, 'status') ?? 'draft';
  if (!CONTENT_STATUSES.has(status)) {
    return { error: 'Invalid status. Allowed: draft, published.' };
  }

  return {
    payload: {
      slug,
      title_ar: titleAr,
      title_en: titleEn,
      description_ar: valueToString(row, 'description_ar'),
      description_en: valueToString(row, 'description_en'),
      assigned_to: valueToOptionalUuid(row, 'assigned_to'),
      status,
      created_by: actorId,
    },
  };
}

function buildInventoryPayload(row: RawRow): RawRow {
  return {
    sku: valueToString(row, 'sku'),
    name_ar: valueToString(row, 'name_ar'),
    name_en: valueToString(row, 'name_en'),
  };
}

function buildCustomerPayload(row: RawRow): RawRow {
  return {
    name: valueToString(row, 'name'),
    user_id: valueToOptionalUuid(row, 'user_id'),
  };
}

function buildLeadPayload(row: RawRow): { payload?: RawRow; error?: string } {
  const status = valueToString(row, 'status') ?? 'new';
  if (!LEAD_STATUSES.has(status)) {
    return { error: 'Invalid lead status. Allowed: new, in_progress, closed.' };
  }
  return {
    payload: {
      customer_id: valueToOptionalUuid(row, 'customer_id'),
      name: valueToString(row, 'name'),
      channel: valueToString(row, 'channel'),
      status,
    },
  };
}

export function getImportTargets(): ImportTarget[] {
  return [...IMPORT_TARGETS];
}

export function parseImportTarget(value: string): ImportTarget | null {
  return isImportTarget(value) ? value : null;
}

export async function importTableFromFile(input: {
  file: File;
  target: ImportTarget;
  mode: ImportMode;
  dryRun: boolean;
  actorId: string;
}): Promise<ImportSummary> {
  const empty: ImportSummary = {
    ok: false,
    target: input.target,
    parsedRows: 0,
    validRows: 0,
    writtenRows: 0,
    skippedRows: 0,
    errorCount: 0,
    errors: [{ row: 0, message: 'Supabase is not configured.' }],
  };

  if (!isSupabaseConfigured()) return empty;

  let rows: RawRow[] = [];
  try {
    rows = (await readRowsFromFile(input.file)).map(normalizeRow);
  } catch {
    return {
      ...empty,
      errors: [{ row: 0, message: 'Unsupported or invalid file format.' }],
      errorCount: 1,
    };
  }

  const summary: ImportSummary = {
    ok: true,
    target: input.target,
    parsedRows: rows.length,
    validRows: 0,
    writtenRows: 0,
    skippedRows: 0,
    errorCount: 0,
    errors: [],
  };

  if (rows.length === 0) return summary;

  const supabase = await createSupabaseServerClient();

  for (let index = 0; index < rows.length; index += 1) {
    const rowNumber = index + 2;
    const row = rows[index];

    try {
      if (CONTENT_TARGETS.includes(input.target as (typeof CONTENT_TARGETS)[number])) {
        const built = buildContentPayload(row, input.actorId);
        if (!built.payload) {
          summary.skippedRows += 1;
          summary.errors.push({ row: rowNumber, message: built.error || 'Invalid row.' });
          continue;
        }
        summary.validRows += 1;
        if (input.dryRun) continue;
        if (input.mode === 'upsert') {
          const { data: existing, error: existingError } = await supabase
            .from(input.target)
            .select('id')
            .eq('slug', String(built.payload.slug))
            .maybeSingle();
          if (existingError) {
            summary.skippedRows += 1;
            summary.errors.push({ row: rowNumber, message: existingError.message });
            continue;
          }

          if (existing?.id) {
            const { error: updateError } = await supabase
              .from(input.target)
              .update({
                title_ar: built.payload.title_ar,
                title_en: built.payload.title_en,
                description_ar: built.payload.description_ar,
                description_en: built.payload.description_en,
                assigned_to: built.payload.assigned_to,
                status: built.payload.status,
              })
              .eq('id', existing.id);
            if (updateError) {
              summary.skippedRows += 1;
              summary.errors.push({ row: rowNumber, message: updateError.message });
              continue;
            }
            summary.writtenRows += 1;
            continue;
          }
        }

        const { error } = await supabase.from(input.target).insert(built.payload);
        if (error) {
          summary.skippedRows += 1;
          summary.errors.push({ row: rowNumber, message: error.message });
          continue;
        }
        summary.writtenRows += 1;
        continue;
      }

      if (input.target === 'inventory_items') {
        const payload = buildInventoryPayload(row);
        summary.validRows += 1;
        if (input.dryRun) continue;

        const sku = valueToString(payload, 'sku');
        const query =
          input.mode === 'upsert' && sku
            ? supabase
                .from('inventory_items')
                .upsert(payload, { onConflict: 'sku', ignoreDuplicates: false })
            : supabase.from('inventory_items').insert(payload);

        const { error } = await query;
        if (error) {
          summary.skippedRows += 1;
          summary.errors.push({ row: rowNumber, message: error.message });
          continue;
        }
        summary.writtenRows += 1;
        continue;
      }

      if (input.target === 'customers') {
        const payload = buildCustomerPayload(row);
        summary.validRows += 1;
        if (input.dryRun) continue;

        const { error } = await supabase.from('customers').insert(payload);
        if (error) {
          summary.skippedRows += 1;
          summary.errors.push({ row: rowNumber, message: error.message });
          continue;
        }
        summary.writtenRows += 1;
        continue;
      }

      if (input.target === 'leads_requests') {
        const built = buildLeadPayload(row);
        if (!built.payload) {
          summary.skippedRows += 1;
          summary.errors.push({ row: rowNumber, message: built.error || 'Invalid row.' });
          continue;
        }
        summary.validRows += 1;
        if (input.dryRun) continue;

        const { error } = await supabase.from('leads_requests').insert(built.payload);
        if (error) {
          summary.skippedRows += 1;
          summary.errors.push({ row: rowNumber, message: error.message });
          continue;
        }
        summary.writtenRows += 1;
      }
    } catch {
      summary.skippedRows += 1;
      summary.errors.push({ row: rowNumber, message: 'Unexpected row error.' });
    }
  }

  summary.errorCount = summary.errors.length;
  if (summary.errors.length > 25) {
    summary.errors = summary.errors.slice(0, 25);
  }
  return summary;
}

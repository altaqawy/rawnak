import { NextResponse } from 'next/server';
import { getAuthContext } from '@/lib/auth/session';
import {
  filterReactBitsComponentCatalog,
  filterReactBitsCatalog,
  getReactBitsCatalogCategories,
  getReactBitsCatalogMeta,
  getReactBitsCatalogVariants,
  paginateReactBitsComponentCatalog,
  paginateReactBitsCatalog,
} from '@/lib/reactbits/catalog';

function sanitizePage(value: string | null) {
  const parsed = Number.parseInt(value ?? '1', 10);
  if (!Number.isFinite(parsed)) return 1;
  return Math.max(1, parsed);
}

function sanitizePageSize(value: string | null) {
  const parsed = Number.parseInt(value ?? '30', 10);
  if (!Number.isFinite(parsed)) return 30;
  return Math.min(100, Math.max(10, parsed));
}

export async function GET(request: Request) {
  const auth = await getAuthContext();
  if (!auth.user || auth.role !== 'owner') {
    return NextResponse.json({ ok: false, error: 'forbidden' }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const query = (searchParams.get('q') ?? '').trim();
  const category = (searchParams.get('category') ?? 'all').trim().toLowerCase();
  const variant = (searchParams.get('variant') ?? 'all').trim().toLowerCase();
  const page = sanitizePage(searchParams.get('page'));
  const pageSize = sanitizePageSize(searchParams.get('pageSize'));
  const mode = (searchParams.get('mode') ?? 'files').trim().toLowerCase();

  if (mode === 'components') {
    const filtered = filterReactBitsComponentCatalog({ query, category, variant });
    const pagination = paginateReactBitsComponentCatalog(filtered, page, pageSize);
    return NextResponse.json(
      {
        ok: true,
        mode: 'components',
        meta: getReactBitsCatalogMeta(),
        categories: getReactBitsCatalogCategories(),
        variants: getReactBitsCatalogVariants(),
        page: pagination.page,
        pageSize: pagination.pageSize,
        total: pagination.total,
        totalPages: pagination.totalPages,
        rows: pagination.rows,
      },
      {
        status: 200,
        headers: { 'Cache-Control': 'no-store' },
      },
    );
  }

  const filtered = filterReactBitsCatalog({ query, category, variant });
  const pagination = paginateReactBitsCatalog(filtered, page, pageSize);

  return NextResponse.json(
    {
      ok: true,
      mode: 'files',
      meta: getReactBitsCatalogMeta(),
      categories: getReactBitsCatalogCategories(),
      variants: getReactBitsCatalogVariants(),
      page: pagination.page,
      pageSize: pagination.pageSize,
      total: pagination.total,
      totalPages: pagination.totalPages,
      rows: pagination.rows,
    },
    {
      status: 200,
      headers: { 'Cache-Control': 'no-store' },
    },
  );
}

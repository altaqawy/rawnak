import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import {
  filterReactBitsCatalog,
  getReactBitsCatalogCategories,
  getReactBitsCatalogMeta,
  getReactBitsCatalogVariants,
  paginateReactBitsCatalog,
} from '@/lib/reactbits/catalog';

type SearchParams = Promise<Record<string, string | string[] | undefined>>;
type PageProps = {
  params: Promise<{ locale: string }>;
  searchParams: SearchParams;
};

function valueFromSearch(
  searchParams: Record<string, string | string[] | undefined>,
  key: string,
  fallback: string,
) {
  const value = searchParams[key];
  if (Array.isArray(value)) return value[0] ?? fallback;
  return value ?? fallback;
}

function buildQuery(input: {
  q: string;
  category: string;
  variant: string;
  page: number;
}) {
  const params = new URLSearchParams();
  if (input.q) params.set('q', input.q);
  if (input.category && input.category !== 'all') params.set('category', input.category);
  if (input.variant && input.variant !== 'all') params.set('variant', input.variant);
  if (input.page > 1) params.set('page', String(input.page));
  const query = params.toString();
  return query ? `?${query}` : '';
}

export default async function ContentReactBitsPage({ params, searchParams }: PageProps) {
  const { locale } = await params;
  const search = await searchParams;
  const t = await getTranslations('adminHub');

  const q = valueFromSearch(search, 'q', '').trim();
  const category = valueFromSearch(search, 'category', 'all').trim().toLowerCase() || 'all';
  const variant = valueFromSearch(search, 'variant', 'all').trim().toLowerCase() || 'all';
  const pageRaw = Number.parseInt(valueFromSearch(search, 'page', '1'), 10);
  const page = Number.isFinite(pageRaw) ? pageRaw : 1;

  const categories = getReactBitsCatalogCategories();
  const variants = getReactBitsCatalogVariants();
  const meta = getReactBitsCatalogMeta();
  const filtered = filterReactBitsCatalog({ query: q, category, variant });
  const pagination = paginateReactBitsCatalog(filtered, page, 50);

  return (
    <div className="space-y-4">
      <section className="glass-card rounded-2xl border border-border/70 p-6">
        <h2 className="text-start text-xl font-semibold text-foreground">{t('reactBits.title')}</h2>
        <p className="mt-2 text-start text-sm text-muted-foreground">{t('reactBits.subtitle')}</p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-xl border border-border/70 bg-card/70 p-3">
            <p className="text-start text-xs text-muted-foreground">{t('reactBits.summary.totalFiles')}</p>
            <p className="mt-1 text-start text-lg font-semibold text-foreground">{meta.totalFiles}</p>
          </div>
          <div className="rounded-xl border border-border/70 bg-card/70 p-3">
            <p className="text-start text-xs text-muted-foreground">{t('reactBits.summary.estimatedComponents')}</p>
            <p className="mt-1 text-start text-lg font-semibold text-foreground">
              {meta.estimatedComponents}
            </p>
          </div>
          <div className="rounded-xl border border-border/70 bg-card/70 p-3">
            <p className="text-start text-xs text-muted-foreground">{t('reactBits.summary.filteredRows')}</p>
            <p className="mt-1 text-start text-lg font-semibold text-foreground">{pagination.total}</p>
          </div>
          <div className="rounded-xl border border-border/70 bg-card/70 p-3">
            <p className="text-start text-xs text-muted-foreground">{t('reactBits.summary.categories')}</p>
            <p className="mt-1 text-start text-lg font-semibold text-foreground">{categories.length}</p>
          </div>
        </div>
      </section>

      <section className="glass-card rounded-2xl border border-border/70 p-6">
        <form className="grid gap-2 md:grid-cols-4">
          <input
            name="q"
            defaultValue={q}
            placeholder={t('reactBits.searchPlaceholder')}
            className="h-10 rounded-md border border-border/70 bg-background/70 px-3 text-sm md:col-span-2"
          />
          <select
            name="category"
            defaultValue={category}
            className="h-10 rounded-md border border-border/70 bg-background/70 px-3 text-sm"
          >
            <option value="all">{t('reactBits.allCategories')}</option>
            {categories.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
          <select
            name="variant"
            defaultValue={variant}
            className="h-10 rounded-md border border-border/70 bg-background/70 px-3 text-sm"
          >
            <option value="all">{t('reactBits.allVariants')}</option>
            {variants.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
          <div className="md:col-span-4">
            <button
              type="submit"
              className="rounded-md border border-border/70 bg-card/70 px-3 py-2 text-xs text-foreground"
            >
              {t('reactBits.applyFilters')}
            </button>
          </div>
        </form>
      </section>

      <section className="glass-card rounded-2xl border border-border/70 p-4">
        {pagination.rows.length === 0 ? (
          <p className="text-start text-sm text-muted-foreground">{t('favorites.empty')}</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b border-border/70 text-start text-xs text-muted-foreground">
                  <th className="px-2 py-2 text-start font-medium">{t('reactBits.table.component')}</th>
                  <th className="px-2 py-2 text-start font-medium">{t('reactBits.table.category')}</th>
                  <th className="px-2 py-2 text-start font-medium">{t('reactBits.table.variant')}</th>
                  <th className="px-2 py-2 text-start font-medium">{t('reactBits.table.path')}</th>
                </tr>
              </thead>
              <tbody>
                {pagination.rows.map((item) => (
                  <tr key={item.id} className="border-b border-border/60 align-top">
                    <td className="px-2 py-2 text-start text-foreground">
                      {item.componentName || item.fileName}
                    </td>
                    <td className="px-2 py-2 text-start text-muted-foreground">{item.category || '-'}</td>
                    <td className="px-2 py-2 text-start text-muted-foreground">{item.variant || '-'}</td>
                    <td className="px-2 py-2 text-start text-xs text-muted-foreground">{item.relPath}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <div className="mt-4 flex items-center justify-between gap-2 text-xs text-muted-foreground">
          <p>
            {t('reactBits.pagination.page')} {pagination.page} / {pagination.totalPages}
          </p>
          <div className="flex items-center gap-2">
            {pagination.page > 1 ? (
              <Link
                href={`/${locale}/admin/content/reactbits${buildQuery({
                  q,
                  category,
                  variant,
                  page: pagination.page - 1,
                })}`}
                className="rounded-md border border-border/70 bg-card/70 px-3 py-2 text-xs text-foreground"
              >
                {t('reactBits.pagination.previous')}
              </Link>
            ) : null}
            {pagination.page < pagination.totalPages ? (
              <Link
                href={`/${locale}/admin/content/reactbits${buildQuery({
                  q,
                  category,
                  variant,
                  page: pagination.page + 1,
                })}`}
                className="rounded-md border border-border/70 bg-card/70 px-3 py-2 text-xs text-foreground"
              >
                {t('reactBits.pagination.next')}
              </Link>
            ) : null}
          </div>
        </div>
      </section>
    </div>
  );
}

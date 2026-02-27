import catalogSource from '@/lib/reactbits/index-lite.json';

export type ReactBitsCatalogItem = {
  id: string;
  relPath: string;
  fileName: string;
  extension: string;
  sizeBytes: number;
  sha1: string;
  modifiedUtc: string;
  category: string;
  componentName: string;
  variant: string;
  tags: string[];
};

export type ReactBitsCatalogComponent = {
  componentName: string;
  category: string;
  preferredVariant: string;
  preferredPath: string;
  availableVariants: string[];
  filesCount: number;
  tags: string[];
};

type RawCatalogItem = {
  id?: unknown;
  rel_path?: unknown;
  file_name?: unknown;
  extension?: unknown;
  size_bytes?: unknown;
  sha1?: unknown;
  modified_utc?: unknown;
  category?: unknown;
  component_name?: unknown;
  variant?: unknown;
  tags?: unknown;
};

type RawCatalog = {
  meta?: {
    summary?: {
      total_files?: number;
      estimated_components?: number;
      categories?: Record<string, number>;
    };
  };
  items?: RawCatalogItem[];
};

function toStringOrEmpty(value: unknown) {
  return typeof value === 'string' ? value : '';
}

function toNumberOrZero(value: unknown) {
  return typeof value === 'number' && Number.isFinite(value) ? value : 0;
}

function normalizeItem(input: RawCatalogItem): ReactBitsCatalogItem | null {
  const id = toStringOrEmpty(input.id);
  const relPath = toStringOrEmpty(input.rel_path);
  if (!id || !relPath) return null;

  return {
    id,
    relPath,
    fileName: toStringOrEmpty(input.file_name),
    extension: toStringOrEmpty(input.extension),
    sizeBytes: toNumberOrZero(input.size_bytes),
    sha1: toStringOrEmpty(input.sha1),
    modifiedUtc: toStringOrEmpty(input.modified_utc),
    category: toStringOrEmpty(input.category),
    componentName: toStringOrEmpty(input.component_name),
    variant: toStringOrEmpty(input.variant),
    tags: Array.isArray(input.tags) ? input.tags.filter((tag): tag is string => typeof tag === 'string') : [],
  };
}

const RAW_CATALOG = catalogSource as RawCatalog;

const ALL_ITEMS: ReactBitsCatalogItem[] = Array.isArray(RAW_CATALOG.items)
  ? RAW_CATALOG.items.map(normalizeItem).filter((item): item is ReactBitsCatalogItem => Boolean(item))
  : [];

const VARIANT_PRIORITY: Record<string, number> = {
  'ts-tailwind': 1,
  ts: 2,
  'js-tailwind': 3,
  js: 4,
  'data-tailwind': 5,
  data: 6,
  'style-css': 7,
  docs: 8,
  'docs-tailwind': 9,
};

function variantRank(variant: string) {
  return VARIANT_PRIORITY[variant] ?? 99;
}

export function getReactBitsCatalogMeta() {
  return {
    totalFiles:
      typeof RAW_CATALOG.meta?.summary?.total_files === 'number'
        ? RAW_CATALOG.meta.summary.total_files
        : ALL_ITEMS.length,
    estimatedComponents:
      typeof RAW_CATALOG.meta?.summary?.estimated_components === 'number'
        ? RAW_CATALOG.meta.summary.estimated_components
        : 0,
    categoryCounts:
      RAW_CATALOG.meta?.summary?.categories && typeof RAW_CATALOG.meta.summary.categories === 'object'
        ? RAW_CATALOG.meta.summary.categories
        : {},
  };
}

export function getReactBitsCatalogCategories() {
  const set = new Set<string>();
  for (const item of ALL_ITEMS) {
    if (item.category) set.add(item.category);
  }
  return Array.from(set).sort((a, b) => a.localeCompare(b));
}

export function getReactBitsCatalogVariants() {
  const set = new Set<string>();
  for (const item of ALL_ITEMS) {
    if (item.variant) set.add(item.variant);
  }
  return Array.from(set).sort((a, b) => a.localeCompare(b));
}

export function filterReactBitsCatalog(input: {
  query?: string;
  category?: string;
  variant?: string;
}) {
  const query = input.query?.trim().toLowerCase() ?? '';
  const category = input.category?.trim().toLowerCase() ?? 'all';
  const variant = input.variant?.trim().toLowerCase() ?? 'all';

  return ALL_ITEMS.filter((item) => {
    if (category !== 'all' && item.category.toLowerCase() !== category) return false;
    if (variant !== 'all' && item.variant.toLowerCase() !== variant) return false;

    if (!query) return true;
    return (
      item.id.toLowerCase().includes(query) ||
      item.relPath.toLowerCase().includes(query) ||
      item.componentName.toLowerCase().includes(query) ||
      item.tags.some((tag) => tag.toLowerCase().includes(query))
    );
  });
}

export function listReactBitsComponents() {
  const map = new Map<string, ReactBitsCatalogItem[]>();

  for (const item of ALL_ITEMS) {
    const key = `${item.category}::${item.componentName || item.fileName}`;
    const bucket = map.get(key);
    if (bucket) bucket.push(item);
    else map.set(key, [item]);
  }

  const components: ReactBitsCatalogComponent[] = [];

  for (const [, rows] of map) {
    const sortedByVariant = [...rows].sort((a, b) => {
      const rankDiff = variantRank(a.variant) - variantRank(b.variant);
      if (rankDiff !== 0) return rankDiff;
      return a.relPath.localeCompare(b.relPath);
    });
    const preferred = sortedByVariant[0];
    const variants = Array.from(new Set(rows.map((row) => row.variant).filter(Boolean))).sort((a, b) =>
      variantRank(a) - variantRank(b),
    );
    const tags = Array.from(
      new Set(rows.flatMap((row) => row.tags).map((tag) => tag.toLowerCase())),
    ).sort((a, b) => a.localeCompare(b));

    components.push({
      componentName: preferred.componentName || preferred.fileName,
      category: preferred.category,
      preferredVariant: preferred.variant,
      preferredPath: preferred.relPath,
      availableVariants: variants,
      filesCount: rows.length,
      tags,
    });
  }

  components.sort((a, b) => {
    const categoryDiff = a.category.localeCompare(b.category);
    if (categoryDiff !== 0) return categoryDiff;
    return a.componentName.localeCompare(b.componentName);
  });

  return components;
}

export function filterReactBitsComponentCatalog(input: {
  query?: string;
  category?: string;
  variant?: string;
}) {
  const query = input.query?.trim().toLowerCase() ?? '';
  const category = input.category?.trim().toLowerCase() ?? 'all';
  const variant = input.variant?.trim().toLowerCase() ?? 'all';

  return listReactBitsComponents().filter((item) => {
    if (category !== 'all' && item.category.toLowerCase() !== category) return false;
    if (variant !== 'all' && !item.availableVariants.some((value) => value.toLowerCase() === variant)) {
      return false;
    }

    if (!query) return true;
    return (
      item.componentName.toLowerCase().includes(query) ||
      item.category.toLowerCase().includes(query) ||
      item.preferredPath.toLowerCase().includes(query) ||
      item.tags.some((tag) => tag.includes(query))
    );
  });
}

export function paginateReactBitsCatalog(items: ReactBitsCatalogItem[], page: number, pageSize: number) {
  const safePageSize = Math.min(200, Math.max(10, pageSize));
  const total = items.length;
  const totalPages = Math.max(1, Math.ceil(total / safePageSize));
  const safePage = Math.min(totalPages, Math.max(1, page));
  const start = (safePage - 1) * safePageSize;
  const end = start + safePageSize;
  return {
    page: safePage,
    pageSize: safePageSize,
    total,
    totalPages,
    rows: items.slice(start, end),
  };
}

export function paginateReactBitsComponentCatalog(
  items: ReactBitsCatalogComponent[],
  page: number,
  pageSize: number,
) {
  const safePageSize = Math.min(200, Math.max(10, pageSize));
  const total = items.length;
  const totalPages = Math.max(1, Math.ceil(total / safePageSize));
  const safePage = Math.min(totalPages, Math.max(1, page));
  const start = (safePage - 1) * safePageSize;
  const end = start + safePageSize;
  return {
    page: safePage,
    pageSize: safePageSize,
    total,
    totalPages,
    rows: items.slice(start, end),
  };
}

export function getAllReactBitsCatalogItems() {
  return ALL_ITEMS;
}


'use client';

import Link from 'next/link';
import { useDeferredValue, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { BlockRenderer } from '@/components/builder/BlockRenderer';
import { instantiateBuiltinTemplate, listBuiltinTemplates } from '@/lib/builder/builtin-templates';
import { createEmptyBlock } from '@/lib/builder/defaults';
import {
  getAnimationPresetDefinition,
  listAnimationPresetsByEngine,
} from '@/lib/builder/animation/presets';
import { patchBlockAnimation } from '@/lib/builder/animation/schema';
import { normalizeBlocks } from '@/lib/builder/normalize';
import type {
  AnimationEngine,
  AnimationTrigger,
  BuilderBlock,
  BuilderBlockType,
  BuilderDevice,
  BuilderPageRevisionRecord,
  BuilderPageStatus,
  BuilderTemplateRecord,
  MediaRecord,
} from '@/lib/builder/types';
import { cn } from '@/lib/utils';

type OwnerPageEditorProps = {
  locale: string;
  pageId: string;
  initialSlug: string;
  initialTitleAr: string;
  initialTitleEn: string;
  initialNavLabelAr: string;
  initialNavLabelEn: string;
  initialShowInNav: boolean;
  initialNavOrder: number;
  initialStatus: BuilderPageStatus;
  initialBlocks: BuilderBlock[];
  revisions: BuilderPageRevisionRecord[];
  templates: BuilderTemplateRecord[];
  mediaItems: MediaRecord[];
  mediaUrlMap: Record<string, string>;
  saveAction: (formData: FormData) => void;
  restoreRevisionAction: (formData: FormData) => void;
  savePageTemplateAction: (formData: FormData) => void;
  saveBlockGroupTemplateAction: (formData: FormData) => void;
  availablePages: Array<{ id: string; slug: string }>;
};

type LeftTab = 'blocks' | 'templates' | 'layers';
type InspectorTab = 'content' | 'style' | 'animation' | 'advanced';
type TemplateApplyMode = 'append' | 'replace';
type StyleTarget = 'base' | BuilderDevice;
type ReactBitsComponentRow = {
  componentName: string;
  category: string;
  preferredVariant: string;
  preferredPath: string;
  availableVariants: string[];
  filesCount: number;
  tags: string[];
};

type ReactBitsResponse = {
  ok: boolean;
  mode?: 'files' | 'components';
  categories: string[];
  variants: string[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  rows: ReactBitsComponentRow[];
};

const BLOCK_LIBRARY: BuilderBlockType[] = [
  'container',
  'columns',
  'grid',
  'spacer',
  'divider',
  'richText',
  'image',
  'video',
  'audio',
  'file',
  'button',
  'gallery',
  'buttonRow',
  'hero',
  'featureCards',
  'faq',
  'ctaBanner',
  'lottie',
  'model3d',
];

const DEVICE_WIDTHS: Record<BuilderDevice, number> = {
  desktop: 1200,
  tablet: 768,
  mobile: 375,
};

function reorder(blocks: BuilderBlock[], sourceId: string, targetId: string): BuilderBlock[] {
  const sourceIndex = blocks.findIndex((block) => block.id === sourceId);
  const targetIndex = blocks.findIndex((block) => block.id === targetId);
  if (sourceIndex < 0 || targetIndex < 0 || sourceIndex === targetIndex) return blocks;
  const copy = [...blocks];
  const [moved] = copy.splice(sourceIndex, 1);
  copy.splice(targetIndex, 0, moved);
  return copy;
}

function parseTemplate(snapshotJson: unknown): BuilderBlock[] {
  if (!snapshotJson || typeof snapshotJson !== 'object') return [];
  const snapshot = snapshotJson as Record<string, unknown>;
  if (snapshot.kind === 'page' && snapshot.page && typeof snapshot.page === 'object') {
    return normalizeBlocks((snapshot.page as Record<string, unknown>).blocks_json);
  }
  if (snapshot.kind === 'block_group') return normalizeBlocks(snapshot.blocks_json);
  return [];
}

function cloneBlocks(blocks: BuilderBlock[]): BuilderBlock[] {
  const idMap = new Map<string, string>(blocks.map((block) => [block.id, crypto.randomUUID()]));
  return blocks.map((block) => ({
    ...block,
    id: idMap.get(block.id) ?? crypto.randomUUID(),
    content: { ...block.content, mediaPaths: [...(block.content.mediaPaths ?? [])] },
    settings: { ...block.settings },
    style: {
      base: { ...block.style.base },
      desktop: block.style.desktop ? { ...block.style.desktop } : null,
      tablet: block.style.tablet ? { ...block.style.tablet } : null,
      mobile: block.style.mobile ? { ...block.style.mobile } : null,
    },
    animation: {
      ...block.animation,
      lottie: block.animation.lottie ? { ...block.animation.lottie } : null,
    },
    visibility: { ...block.visibility },
    advanced: {
      ...block.advanced,
      parentId: block.advanced.parentId ? idMap.get(block.advanced.parentId) ?? null : null,
    },
  }));
}

function getStyleTarget(autoSync: boolean, target: StyleTarget): StyleTarget {
  return autoSync ? 'base' : target;
}

function slugifyToken(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 48);
}

function inferAnimationFromReactBits(componentName: string): {
  engine: Exclude<AnimationEngine, 'none' | 'lottie'>;
  preset: BuilderBlock['animation']['preset'];
} | null {
  const key = componentName.replace(/[^a-z0-9]/gi, '').toLowerCase();
  if (!key) return null;

  if (key.includes('animeslideup')) return { engine: 'anime', preset: 'animeSlideUp' };
  if (key.includes('anime') || key.includes('fade')) return { engine: 'anime', preset: 'animeFade' };

  if (key.includes('slideup')) return { engine: 'framer', preset: 'slideUp' };
  if (key.includes('slidedown')) return { engine: 'framer', preset: 'slideDown' };
  if (key.includes('slideleft')) return { engine: 'framer', preset: 'slideLeft' };
  if (key.includes('slideright')) return { engine: 'framer', preset: 'slideRight' };
  if (key.includes('scale')) return { engine: 'framer', preset: 'scaleIn' };
  if (key.includes('stagger')) return { engine: 'framer', preset: 'staggerChildren' };
  if (key.includes('hoverlift')) return { engine: 'framer', preset: 'hoverLift' };
  if (key.includes('hover')) return { engine: 'framer', preset: 'hoverScale' };
  if (key.includes('parallax')) return { engine: 'framer', preset: 'parallaxOnScroll' };
  if (key.includes('slide')) return { engine: 'framer', preset: 'slideUp' };
  return null;
}

export function OwnerPageEditor({
  locale,
  pageId,
  initialSlug,
  initialTitleAr,
  initialTitleEn,
  initialNavLabelAr,
  initialNavLabelEn,
  initialShowInNav,
  initialNavOrder,
  initialStatus,
  initialBlocks,
  revisions,
  templates,
  mediaItems,
  mediaUrlMap,
  saveAction,
  restoreRevisionAction,
  savePageTemplateAction,
  saveBlockGroupTemplateAction,
  availablePages,
}: OwnerPageEditorProps) {
  const router = useRouter();
  const t = useTranslations('ownerBuilder');
  const [slug, setSlug] = useState(initialSlug);
  const [titleAr, setTitleAr] = useState(initialTitleAr);
  const [titleEn, setTitleEn] = useState(initialTitleEn);
  const [navLabelAr, setNavLabelAr] = useState(initialNavLabelAr);
  const [navLabelEn, setNavLabelEn] = useState(initialNavLabelEn);
  const [showInNav, setShowInNav] = useState(initialShowInNav);
  const [navOrder, setNavOrder] = useState(initialNavOrder);
  const [blocks, setBlocks] = useState<BuilderBlock[]>(normalizeBlocks(initialBlocks));
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(blocks[0]?.id ?? null);
  const [selectedForTemplate, setSelectedForTemplate] = useState<string[]>([]);
  const [leftTab, setLeftTab] = useState<LeftTab>('blocks');
  const [inspectorTab, setInspectorTab] = useState<InspectorTab>('content');
  const [templateApplyMode, setTemplateApplyMode] = useState<TemplateApplyMode>('append');
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [zoom, setZoom] = useState(100);
  const [device, setDevice] = useState<BuilderDevice>('desktop');
  const [previewAnimations, setPreviewAnimations] = useState(true);
  const [styleTarget, setStyleTarget] = useState<StyleTarget>('base');
  const [autoSync, setAutoSync] = useState(true);
  const [animationReplayMap, setAnimationReplayMap] = useState<Record<string, number>>({});
  const [reactBitsOpen, setReactBitsOpen] = useState(false);
  const [reactBitsQuery, setReactBitsQuery] = useState('');
  const [reactBitsCategory, setReactBitsCategory] = useState('all');
  const [reactBitsVariant, setReactBitsVariant] = useState('all');
  const [reactBitsPage, setReactBitsPage] = useState(1);
  const [reactBitsLoading, setReactBitsLoading] = useState(false);
  const [reactBitsError, setReactBitsError] = useState<string | null>(null);
  const [reactBitsRows, setReactBitsRows] = useState<ReactBitsComponentRow[]>([]);
  const [reactBitsCategories, setReactBitsCategories] = useState<string[]>([]);
  const [reactBitsVariants, setReactBitsVariants] = useState<string[]>([]);
  const [reactBitsTotal, setReactBitsTotal] = useState(0);
  const [reactBitsTotalPages, setReactBitsTotalPages] = useState(1);
  const [reactBitsPageSize, setReactBitsPageSize] = useState(30);
  const [past, setPast] = useState<BuilderBlock[][]>([]);
  const [future, setFuture] = useState<BuilderBlock[][]>([]);
  const previewStageRef = useRef<HTMLDivElement | null>(null);
  const deferredReactBitsQuery = useDeferredValue(reactBitsQuery);

  const selectedBlock = useMemo(
    () => blocks.find((block) => block.id === selectedBlockId) ?? null,
    [blocks, selectedBlockId],
  );
  const lottieMediaItems = useMemo(
    () => mediaItems.filter((item) => item.media_type === 'lottie'),
    [mediaItems],
  );
  const mediaIdToPathMap = useMemo(
    () =>
      Object.fromEntries(
        mediaItems.map((item) => [item.id, item.storage_path]),
      ),
    [mediaItems],
  );
  const blocksJson = useMemo(() => JSON.stringify(normalizeBlocks(blocks)), [blocks]);
  const selectedBlocksJson = useMemo(() => JSON.stringify(selectedForTemplate), [selectedForTemplate]);

  const updateBlocks = (next: BuilderBlock[] | ((current: BuilderBlock[]) => BuilderBlock[])) => {
    setBlocks((current) => {
      const nextValue = normalizeBlocks(typeof next === 'function' ? next(current) : next);
      setPast((value) => [...value, current]);
      setFuture([]);
      return nextValue;
    });
  };

  useEffect(() => {
    if (!reactBitsOpen) return;
    const controller = new AbortController();
    setReactBitsLoading(true);
    setReactBitsError(null);

    const params = new URLSearchParams();
    if (deferredReactBitsQuery.trim()) params.set('q', deferredReactBitsQuery.trim());
    if (reactBitsCategory !== 'all') params.set('category', reactBitsCategory);
    if (reactBitsVariant !== 'all') params.set('variant', reactBitsVariant);
    params.set('page', String(reactBitsPage));
    params.set('pageSize', '30');
    params.set('mode', 'components');

    fetch(`/api/admin/reactbits?${params.toString()}`, {
      method: 'GET',
      cache: 'no-store',
      signal: controller.signal,
    })
      .then(async (response) => {
        if (!response.ok) throw new Error('fetch_failed');
        const data = (await response.json()) as ReactBitsResponse;
        if (!data.ok) throw new Error('invalid_data');
        setReactBitsRows(data.rows as ReactBitsComponentRow[]);
        setReactBitsCategories(data.categories);
        setReactBitsVariants(data.variants);
        setReactBitsTotal(data.total);
        setReactBitsTotalPages(data.totalPages);
        setReactBitsPageSize(data.pageSize);
      })
      .catch((error: unknown) => {
        if ((error as { name?: string })?.name === 'AbortError') return;
        setReactBitsError('load_failed');
      })
      .finally(() => {
        if (!controller.signal.aborted) setReactBitsLoading(false);
      });

    return () => controller.abort();
  }, [deferredReactBitsQuery, reactBitsCategory, reactBitsOpen, reactBitsPage, reactBitsVariant]);

  const applyReactBitsAnimation = (item: ReactBitsComponentRow) => {
    if (!selectedBlock) return;
    const mapped = inferAnimationFromReactBits(item.componentName);
    if (!mapped) return;
    updateSelectedAnimation({
      enabled: true,
      engine: mapped.engine,
      preset: mapped.preset,
      trigger: 'onView',
    });
    setInspectorTab('animation');
  };

  const addReactBitsReferenceBlock = (item: ReactBitsComponentRow) => {
    const mapped = inferAnimationFromReactBits(item.componentName);
    const nextBlock = createEmptyBlock('container');
    nextBlock.advanced.customClass = `reactbits-ref reactbits-${slugifyToken(item.componentName || item.category)}`;
    nextBlock.content.en = item.componentName;
    nextBlock.content.ar = item.componentName;
    nextBlock.content.embedUrl = item.preferredPath;
    if (mapped) {
      nextBlock.animation = patchBlockAnimation(
        nextBlock.animation,
        {
          enabled: true,
          engine: mapped.engine,
          preset: mapped.preset,
          trigger: 'onView',
        },
        nextBlock.type,
      );
    }

    updateBlocks((current) => [...current, nextBlock]);
    setSelectedBlockId(nextBlock.id);
    if (mapped) setInspectorTab('animation');
  };

  const addBlock = (type: BuilderBlockType) => {
    const block = createEmptyBlock(type);
    if (
      selectedBlock &&
      (selectedBlock.type === 'container' ||
        selectedBlock.type === 'columns' ||
        selectedBlock.type === 'grid')
    ) {
      block.advanced.parentId = selectedBlock.id;
    }
    updateBlocks((current) => [...current, block]);
    setSelectedBlockId(block.id);
  };

  const applyTemplateBlocks = (templateBlocks: BuilderBlock[]) => {
    const cloned = cloneBlocks(templateBlocks);
    if (templateApplyMode === 'replace') updateBlocks(cloned);
    else updateBlocks((current) => [...current, ...cloned]);
  };

  const currentStyleTarget = getStyleTarget(autoSync, styleTarget);
  const selectedStyleBase =
    selectedBlock?.style.base ??
    selectedBlock?.settings ??
    createEmptyBlock('container').style.base;
  const selectedStyleOverride =
    selectedBlock && currentStyleTarget !== 'base'
      ? selectedBlock.style[currentStyleTarget] ?? null
      : null;
  const availablePresets = selectedBlock
    ? listAnimationPresetsByEngine(selectedBlock.animation.engine)
    : [];
  const selectedPresetDefinition = selectedBlock
    ? getAnimationPresetDefinition(selectedBlock.animation.preset)
    : undefined;

  const updateSelectedAnimation = (patch: Partial<BuilderBlock['animation']>) => {
    if (!selectedBlock) return;
    updateBlocks((current) =>
      current.map((item) =>
        item.id === selectedBlock.id
          ? { ...item, animation: patchBlockAnimation(item.animation, patch, item.type) }
          : item,
      ),
    );
  };

  const testSelectedAnimation = () => {
    if (!selectedBlock) return;
    setAnimationReplayMap((current) => ({
      ...current,
      [selectedBlock.id]: (current[selectedBlock.id] ?? 0) + 1,
    }));
  };

  const getStyleField = (field: keyof BuilderBlock['style']['base']) => {
    if (!selectedBlock) return '';
    if (currentStyleTarget === 'base') return selectedStyleBase[field];
    if (selectedStyleOverride && Object.prototype.hasOwnProperty.call(selectedStyleOverride, field)) {
      return selectedStyleOverride[field] ?? selectedStyleBase[field];
    }
    return selectedStyleBase[field];
  };

  const isInherited = (field: keyof BuilderBlock['style']['base']) => {
    if (!selectedBlock) return false;
    if (currentStyleTarget === 'base') return false;
    if (!selectedStyleOverride) return true;
    return !Object.prototype.hasOwnProperty.call(selectedStyleOverride, field);
  };

  const updateStyleField = (field: keyof BuilderBlock['style']['base'], value: string | number) => {
    if (!selectedBlock) return;
    updateBlocks((current) =>
      current.map((item) => {
        if (item.id !== selectedBlock.id) return item;
        const target = getStyleTarget(autoSync, styleTarget);
        if (target === 'base') {
          const nextBase = { ...item.style.base, [field]: value };
          return {
            ...item,
            settings: { ...item.settings, [field]: value },
            style: { ...item.style, base: nextBase },
          };
        }
        const nextOverride = {
          ...(item.style[target] ?? {}),
          [field]: value,
        };
        return {
          ...item,
          style: { ...item.style, [target]: nextOverride },
        };
      }),
    );
  };

  const resetOverrides = (target: BuilderDevice) => {
    if (!selectedBlock) return;
    updateBlocks((current) =>
      current.map((item) =>
        item.id === selectedBlock.id
          ? { ...item, style: { ...item.style, [target]: null } }
          : item,
      ),
    );
  };

  const copyBaseToDevice = (target: BuilderDevice) => {
    if (!selectedBlock) return;
    updateBlocks((current) =>
      current.map((item) =>
        item.id === selectedBlock.id
          ? {
              ...item,
              style: { ...item.style, [target]: { ...item.style.base } },
            }
          : item,
      ),
    );
  };

  const updateVisibility = (value: 'show' | 'hide') => {
    if (!selectedBlock) return;
    updateBlocks((current) =>
      current.map((item) => {
        if (item.id !== selectedBlock.id) return item;
        const target = getStyleTarget(autoSync, styleTarget);
        if (target === 'base') {
          return {
            ...item,
            hidden: value === 'hide',
            visibility: { ...item.visibility, base: value },
          };
        }
        return {
          ...item,
          visibility: { ...item.visibility, [target]: value },
        };
      }),
    );
  };

  const currentVisibility = (() => {
    if (!selectedBlock) return 'show';
    const target = getStyleTarget(autoSync, styleTarget);
    if (target === 'base') return selectedBlock.visibility.base;
    return selectedBlock.visibility[target] ?? selectedBlock.visibility.base;
  })();

  const deviceWidth = DEVICE_WIDTHS[device];

  return (
    <div className="space-y-4">
      <form action={saveAction} className="glass-card rounded-2xl border border-border/70 p-4">
        <input type="hidden" name="page_id" value={pageId} />
        <input type="hidden" name="blocks_json" value={blocksJson} />
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="submit"
            name="intent"
            value="draft"
            className="rounded-md border border-border/70 bg-card/70 px-3 py-2 text-xs"
          >
            {t('actions.saveDraft')}
          </button>
          <button
            type="submit"
            name="intent"
            value="publish"
            className="rounded-md border border-border/70 bg-card/70 px-3 py-2 text-xs"
          >
            {t('actions.publish')}
          </button>
          <button
            type="submit"
            name="intent"
            value="unpublish"
            className="rounded-md border border-border/70 bg-card/70 px-3 py-2 text-xs"
          >
            {t('actions.unpublish')}
          </button>
          <Link
            href={`/${locale}/preview/${slug || initialSlug}`}
            className="rounded-md border border-border/70 bg-card/70 px-3 py-2 text-xs"
          >
            {t('actions.preview')}
          </Link>
          <button
            type="button"
            disabled={past.length === 0}
            onClick={() => {
              const previous = past[past.length - 1];
              if (!previous) return;
              setPast((value) => value.slice(0, -1));
              setFuture((value) => [blocks, ...value]);
              setBlocks(previous);
            }}
            className="rounded-md border border-border/70 bg-card/70 px-3 py-2 text-xs disabled:opacity-50"
          >
            {t('actions.undo')}
          </button>
          <button
            type="button"
            disabled={future.length === 0}
            onClick={() => {
              const [next, ...rest] = future;
              if (!next) return;
              setFuture(rest);
              setPast((value) => [...value, blocks]);
              setBlocks(next);
            }}
            className="rounded-md border border-border/70 bg-card/70 px-3 py-2 text-xs disabled:opacity-50"
          >
            {t('actions.redo')}
          </button>
          <div className="ms-auto flex items-center gap-2 text-xs text-muted-foreground">
            <span>{t('labels.page')}</span>
            <select
              value={pageId}
              onChange={(event) => {
                const nextPageId = event.target.value;
                if (!nextPageId || nextPageId === pageId) return;
                router.push(`/${locale}/admin/builder/${nextPageId}`);
              }}
              className="h-8 min-w-[12rem] rounded-md border border-border/70 bg-background/70 px-2 text-xs"
            >
              {availablePages.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.slug}
                </option>
              ))}
            </select>
            <span>{t('labels.device')}</span>
            {(['desktop', 'tablet', 'mobile'] as BuilderDevice[]).map((value) => (
              <button
                key={value}
                type="button"
                onClick={() => setDevice(value)}
                className={cn(
                  'rounded-md border border-border/70 px-2 py-1 text-xs',
                  device === value ? 'bg-card/80' : 'bg-card/50',
                )}
              >
                {t(`labels.${value}`)}
              </button>
            ))}
          </div>
          <label className="flex items-center gap-2 text-xs text-muted-foreground">
            <span>{t('fields.zoom')}</span>
            <input
              type="range"
              min={50}
              max={125}
              value={zoom}
              onChange={(event) => setZoom(Number(event.target.value))}
            />
          </label>
          <button
            type="button"
            onClick={() => setPreviewAnimations((value) => !value)}
            className={cn(
              'rounded-md border border-border/70 px-3 py-2 text-xs',
              previewAnimations ? 'bg-card/80' : 'bg-card/50 text-muted-foreground',
            )}
          >
            {previewAnimations ? t('actions.previewAnimationsOn') : t('actions.previewAnimationsOff')}
          </button>
        </div>
        <div className="mt-4 grid gap-2 md:grid-cols-3">
          <input
            name="slug"
            value={slug}
            onChange={(event) => setSlug(event.target.value)}
            className="h-10 rounded-md border border-border/70 bg-background/70 px-3 text-sm"
          />
          <input
            name="title_ar"
            value={titleAr}
            onChange={(event) => setTitleAr(event.target.value)}
            className="h-10 rounded-md border border-border/70 bg-background/70 px-3 text-sm"
          />
          <input
            name="title_en"
            value={titleEn}
            onChange={(event) => setTitleEn(event.target.value)}
            className="h-10 rounded-md border border-border/70 bg-background/70 px-3 text-sm"
          />
          <input
            name="nav_label_ar"
            value={navLabelAr}
            onChange={(event) => setNavLabelAr(event.target.value)}
            className="h-10 rounded-md border border-border/70 bg-background/70 px-3 text-sm"
          />
          <input
            name="nav_label_en"
            value={navLabelEn}
            onChange={(event) => setNavLabelEn(event.target.value)}
            className="h-10 rounded-md border border-border/70 bg-background/70 px-3 text-sm"
          />
          <input
            name="nav_order"
            type="number"
            value={navOrder}
            onChange={(event) => setNavOrder(Number(event.target.value) || 100)}
            className="h-10 rounded-md border border-border/70 bg-background/70 px-3 text-sm"
          />
          <label className="inline-flex items-center gap-2 text-xs text-muted-foreground md:col-span-3">
            <input
              type="checkbox"
              name="show_in_nav"
              checked={showInNav}
              onChange={(event) => setShowInNav(event.target.checked)}
            />
            <span>{t('fields.showInNav')}</span>
          </label>
          <p className="text-xs text-muted-foreground md:col-span-3">{t(`status.${initialStatus}`)}</p>
        </div>
      </form>

      <div className="grid gap-4 xl:grid-cols-[280px_minmax(0,1fr)_320px]">
        <section className="glass-card rounded-2xl border border-border/70 p-4">
          <div className="flex gap-2">
            {(['blocks', 'templates', 'layers'] as LeftTab[]).map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setLeftTab(tab)}
                className={cn(
                  'rounded-md border border-border/70 px-2 py-1 text-xs',
                  leftTab === tab ? 'bg-card/80' : 'bg-card/50',
                )}
              >
                {t(`editor.${tab}`)}
              </button>
            ))}
          </div>

          {leftTab === 'blocks' ? (
            <div className="mt-3 grid gap-2">
              <button
                type="button"
                onClick={() => {
                  setReactBitsOpen(true);
                  setReactBitsPage(1);
                }}
                className="rounded-md border border-border/70 bg-card/70 px-2 py-2 text-start text-xs font-medium"
              >
                {t('reactBits.openLibrary')}
              </button>
              {BLOCK_LIBRARY.map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => addBlock(type)}
                  className="rounded-md border border-border/70 bg-card/60 px-2 py-1 text-start text-xs"
                >
                  {t(`blocks.${type}`)}
                </button>
              ))}
            </div>
          ) : null}

          {leftTab === 'templates' ? (
            <div className="mt-3 space-y-2">
              <select
                value={templateApplyMode}
                onChange={(event) => setTemplateApplyMode(event.target.value as TemplateApplyMode)}
                className="h-9 w-full rounded-md border border-border/70 bg-background/70 px-2 text-xs"
              >
                <option value="append">{t('actions.append')}</option>
                <option value="replace">{t('actions.replace')}</option>
              </select>
              {listBuiltinTemplates().map((template) => (
                <button
                  key={template.key}
                  type="button"
                  onClick={() => applyTemplateBlocks(instantiateBuiltinTemplate(template.key))}
                  className="w-full rounded-md border border-border/70 bg-card/60 px-2 py-1 text-start text-xs"
                >
                  {template.name}
                </button>
              ))}
              {templates.map((template) => (
                <button
                  key={template.id}
                  type="button"
                  onClick={() => applyTemplateBlocks(parseTemplate(template.snapshot_json))}
                  className="w-full rounded-md border border-border/70 bg-card/60 px-2 py-1 text-start text-xs"
                >
                  {template.name || t('labels.untitledTemplate')}
                </button>
              ))}
              <form action={savePageTemplateAction} className="space-y-2 rounded-md border border-border/70 p-2">
                <input type="hidden" name="page_id" value={pageId} />
                <input
                  name="name"
                  placeholder={t('fields.templateName')}
                  className="h-9 w-full rounded-md border border-border/70 bg-background/70 px-2 text-xs"
                />
                <button
                  type="submit"
                  className="rounded-md border border-border/70 bg-card/60 px-2 py-1 text-xs"
                >
                  {t('actions.saveTemplate')}
                </button>
              </form>
              <form action={saveBlockGroupTemplateAction} className="space-y-2 rounded-md border border-border/70 p-2">
                <input type="hidden" name="page_id" value={pageId} />
                <input type="hidden" name="blocks_json" value={blocksJson} />
                <input type="hidden" name="selected_block_ids" value={selectedBlocksJson} />
                <input
                  name="name"
                  placeholder={t('fields.blockTemplateName')}
                  className="h-9 w-full rounded-md border border-border/70 bg-background/70 px-2 text-xs"
                />
                <button
                  type="submit"
                  className="rounded-md border border-border/70 bg-card/60 px-2 py-1 text-xs"
                >
                  {t('actions.saveBlockTemplate')}
                </button>
              </form>
            </div>
          ) : null}

          {leftTab === 'layers' ? (
            <div className="mt-3 space-y-2">
              {blocks.map((block) => (
                <div
                  key={block.id}
                  draggable
                  onDragStart={() => setDraggedId(block.id)}
                  onDragOver={(event) => event.preventDefault()}
                  onDrop={() => {
                    if (!draggedId) return;
                    updateBlocks((current) => reorder(current, draggedId, block.id));
                    setDraggedId(null);
                  }}
                  className={cn(
                    'rounded-md border border-border/70 p-2',
                    selectedBlockId === block.id ? 'bg-card/80' : 'bg-card/50',
                  )}
                >
                  <div className="flex items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={() => setSelectedBlockId(block.id)}
                      className="text-start text-xs"
                    >
                      {t(`blocks.${block.type}`)}
                    </button>
                    <label className="inline-flex items-center gap-1 text-[11px]">
                      <input
                        type="checkbox"
                        checked={selectedForTemplate.includes(block.id)}
                        onChange={() =>
                          setSelectedForTemplate((value) =>
                            value.includes(block.id)
                              ? value.filter((id) => id !== block.id)
                              : [...value, block.id],
                          )
                        }
                      />
                      <span>{t('editor.pick')}</span>
                    </label>
                  </div>
                </div>
              ))}
            </div>
          ) : null}
        </section>

        <section className="glass-card min-w-0 rounded-2xl border border-border/70 p-4">
          <div
            ref={previewStageRef}
            className="h-[76vh] min-h-0 overflow-auto rounded-xl border border-border/70 bg-background/40 p-5"
          >
            <div className="flex min-h-full items-start justify-center">
              <div
                className="shrink-0"
                style={{ width: Math.max(320, Math.round(deviceWidth * (zoom / 100))) }}
              >
                <div
                  className="origin-top will-change-transform"
                  style={{
                    transform: `scale(${zoom / 100})`,
                    transformOrigin: 'top center',
                  }}
                >
                  <div
                    className="rounded-[1.75rem] border border-border/60 bg-card/35 p-3 shadow-[0_32px_90px_-60px_rgba(0,0,0,0.5)]"
                  >
                    <div className="overflow-hidden rounded-[1.2rem] border border-border/60 bg-background/40">
                      <BlockRenderer
                        blocks={normalizeBlocks(blocks)}
                        locale={locale === 'ar' ? 'ar' : 'en'}
                        emptyText={t('empty.noItems')}
                        hiddenLabel={t('labels.hiddenOnDevice')}
                        mediaUrlMap={mediaUrlMap}
                        mediaIdToPathMap={mediaIdToPathMap}
                        selectedBlockId={selectedBlockId}
                        onSelectBlock={setSelectedBlockId}
                        device={device}
                        previewMode
                        animationsEnabled={previewAnimations}
                        replayTokenMap={animationReplayMap}
                        viewportRootRef={previewStageRef}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <section className="mt-4 rounded-xl border border-border/70 p-3">
            <h3 className="text-sm font-medium text-foreground">{t('editor.revisions')}</h3>
            {revisions.length === 0 ? (
              <p className="mt-2 text-xs text-muted-foreground">{t('empty.noItems')}</p>
            ) : (
              <div className="mt-2 space-y-2">
                {revisions.map((revision) => (
                  <form key={revision.id} action={restoreRevisionAction} className="rounded-md border border-border/70 p-2">
                    <input type="hidden" name="page_id" value={pageId} />
                    <input type="hidden" name="revision_id" value={revision.id} />
                    <p className="text-xs text-muted-foreground">{new Date(revision.created_at).toLocaleString()}</p>
                    <button
                      type="submit"
                      className="mt-2 rounded-md border border-border/70 bg-card/60 px-2 py-1 text-xs"
                    >
                      {t('actions.restore')}
                    </button>
                  </form>
                ))}
              </div>
            )}
          </section>
        </section>

        <section className="glass-card rounded-2xl border border-border/70 p-4">
          <div className="flex gap-2">
            {(['content', 'style', 'animation', 'advanced'] as InspectorTab[]).map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setInspectorTab(tab)}
                className={cn(
                  'rounded-md border border-border/70 px-2 py-1 text-xs',
                  inspectorTab === tab ? 'bg-card/80' : 'bg-card/50',
                )}
              >
                {t(`editor.tab.${tab}`)}
              </button>
            ))}
          </div>

          {!selectedBlock ? (
            <p className="mt-3 text-xs text-muted-foreground">{t('empty.noItems')}</p>
          ) : (
            <div className="mt-3 space-y-3">
              {inspectorTab === 'content' ? (
                <>
                  <textarea
                    rows={3}
                    value={selectedBlock.content.ar}
                    onChange={(event) =>
                      updateBlocks((current) =>
                        current.map((item) =>
                          item.id === selectedBlock.id
                            ? { ...item, content: { ...item.content, ar: event.target.value } }
                            : item,
                        ),
                      )
                    }
                    className="w-full rounded-md border border-border/70 bg-background/70 px-2 py-1 text-sm"
                  />
                  <textarea
                    rows={3}
                    value={selectedBlock.content.en}
                    onChange={(event) =>
                      updateBlocks((current) =>
                        current.map((item) =>
                          item.id === selectedBlock.id
                            ? { ...item, content: { ...item.content, en: event.target.value } }
                            : item,
                        ),
                      )
                    }
                    className="w-full rounded-md border border-border/70 bg-background/70 px-2 py-1 text-sm"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      updateBlocks((current) =>
                        current.map((item) =>
                          item.id === selectedBlock.id
                            ? {
                                ...item,
                                content: {
                                  ...item.content,
                                  mediaPaths: item.content.mediaPaths?.length
                                    ? []
                                    : mediaItems.slice(0, 1).map((media) => media.storage_path),
                                },
                              }
                            : item,
                        ),
                      )
                    }
                    className="rounded-md border border-border/70 bg-card/60 px-2 py-1 text-xs"
                  >
                    {t('actions.pickMedia')}
                  </button>

                  {(selectedBlock.type === 'image' || selectedBlock.type === 'gallery') ? (
                    <>
                      <input
                        value={selectedBlock.content.altAr ?? ''}
                        onChange={(event) =>
                          updateBlocks((current) =>
                            current.map((item) =>
                              item.id === selectedBlock.id
                                ? { ...item, content: { ...item.content, altAr: event.target.value } }
                                : item,
                            ),
                          )
                        }
                        placeholder={t('fields.titleAr')}
                        className="h-9 w-full rounded-md border border-border/70 bg-background/70 px-2 text-sm"
                      />
                      <input
                        value={selectedBlock.content.altEn ?? ''}
                        onChange={(event) =>
                          updateBlocks((current) =>
                            current.map((item) =>
                              item.id === selectedBlock.id
                                ? { ...item, content: { ...item.content, altEn: event.target.value } }
                                : item,
                            ),
                          )
                        }
                        placeholder={t('fields.titleEn')}
                        className="h-9 w-full rounded-md border border-border/70 bg-background/70 px-2 text-sm"
                      />
                    </>
                  ) : null}

                  {selectedBlock.type === 'gallery' ? (
                    <div className="space-y-1">
                      <label className="block text-start text-xs text-muted-foreground">
                        {t('fields.galleryMode')}
                      </label>
                      <select
                        value={selectedBlock.content.galleryMode ?? 'grid'}
                        onChange={(event) =>
                          updateBlocks((current) =>
                            current.map((item) =>
                              item.id === selectedBlock.id
                                ? {
                                    ...item,
                                    content: {
                                      ...item.content,
                                      galleryMode: event.target.value as 'grid' | 'carousel' | 'lightbox',
                                    },
                                  }
                                : item,
                            ),
                          )
                        }
                        className="h-9 w-full rounded-md border border-border/70 bg-background/70 px-2 text-sm"
                      >
                        <option value="grid">{t('options.grid')}</option>
                        <option value="carousel">{t('options.carousel')}</option>
                        <option value="lightbox">{t('options.lightbox')}</option>
                      </select>
                    </div>
                  ) : null}
                </>
              ) : null}

              {inspectorTab === 'style' ? (
                <>
                  <div className="space-y-2 rounded-md border border-border/70 p-2">
                    <label className="block text-start text-xs text-muted-foreground">{t('labels.editingTarget')}</label>
                    <select
                      value={styleTarget}
                      onChange={(event) => setStyleTarget(event.target.value as StyleTarget)}
                      className="h-9 w-full rounded-md border border-border/70 bg-background/70 px-2 text-xs"
                    >
                      <option value="base">{t('labels.base')}</option>
                      <option value="desktop">{t('labels.desktop')}</option>
                      <option value="tablet">{t('labels.tablet')}</option>
                      <option value="mobile">{t('labels.mobile')}</option>
                    </select>
                    <label className="inline-flex items-center gap-2 text-xs text-muted-foreground">
                      <input
                        type="checkbox"
                        checked={autoSync}
                        onChange={(event) => setAutoSync(event.target.checked)}
                      />
                      <span>{t('labels.autoSync')}</span>
                    </label>
                  </div>

                  {currentStyleTarget !== 'base' ? (
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => copyBaseToDevice(currentStyleTarget)}
                        className="rounded-md border border-border/70 bg-card/60 px-2 py-1 text-xs"
                      >
                        {t('actions.copyBaseToDevice')}
                      </button>
                      <button
                        type="button"
                        onClick={() => resetOverrides(currentStyleTarget)}
                        className="rounded-md border border-border/70 bg-card/60 px-2 py-1 text-xs"
                      >
                        {t('actions.resetOverrides')}
                      </button>
                    </div>
                  ) : null}

                  <div className="space-y-1">
                    <label className="block text-start text-xs text-muted-foreground">
                      {t('fields.spacingTop')}
                      {isInherited('spacingTop') ? (
                        <span className="ms-2 text-[10px] text-muted-foreground/70">
                          {t('labels.inherited')}
                        </span>
                      ) : null}
                    </label>
                    <input
                      type="number"
                      value={getStyleField('spacingTop')}
                      onChange={(event) => updateStyleField('spacingTop', Number(event.target.value) || 0)}
                      className="h-9 w-full rounded-md border border-border/70 bg-background/70 px-2 text-sm"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-start text-xs text-muted-foreground">
                      {t('fields.spacingBottom')}
                      {isInherited('spacingBottom') ? (
                        <span className="ms-2 text-[10px] text-muted-foreground/70">
                          {t('labels.inherited')}
                        </span>
                      ) : null}
                    </label>
                    <input
                      type="number"
                      value={getStyleField('spacingBottom')}
                      onChange={(event) => updateStyleField('spacingBottom', Number(event.target.value) || 0)}
                      className="h-9 w-full rounded-md border border-border/70 bg-background/70 px-2 text-sm"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-start text-xs text-muted-foreground">
                      {t('fields.containerWidth')}
                      {isInherited('containerWidth') ? (
                        <span className="ms-2 text-[10px] text-muted-foreground/70">
                          {t('labels.inherited')}
                        </span>
                      ) : null}
                    </label>
                    <select
                      value={getStyleField('containerWidth')}
                      onChange={(event) => updateStyleField('containerWidth', event.target.value)}
                      className="h-9 w-full rounded-md border border-border/70 bg-background/70 px-2 text-sm"
                    >
                      <option value="content">{t('options.content')}</option>
                      <option value="wide">{t('options.wide')}</option>
                      <option value="full">{t('options.full')}</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-start text-xs text-muted-foreground">
                      {t('fields.alignment')}
                      {isInherited('alignment') ? (
                        <span className="ms-2 text-[10px] text-muted-foreground/70">
                          {t('labels.inherited')}
                        </span>
                      ) : null}
                    </label>
                    <select
                      value={getStyleField('alignment')}
                      onChange={(event) => updateStyleField('alignment', event.target.value)}
                      className="h-9 w-full rounded-md border border-border/70 bg-background/70 px-2 text-sm"
                    >
                      <option value="start">{t('options.start')}</option>
                      <option value="center">{t('options.center')}</option>
                      <option value="end">{t('options.end')}</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-start text-xs text-muted-foreground">
                      {t('fields.columns')}
                      {isInherited('columns') ? (
                        <span className="ms-2 text-[10px] text-muted-foreground/70">
                          {t('labels.inherited')}
                        </span>
                      ) : null}
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={6}
                      value={getStyleField('columns')}
                      onChange={(event) => updateStyleField('columns', Number(event.target.value) || 1)}
                      className="h-9 w-full rounded-md border border-border/70 bg-background/70 px-2 text-sm"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-start text-xs text-muted-foreground">
                      {t('labels.visibility')}
                    </label>
                    <select
                      value={currentVisibility}
                      onChange={(event) => updateVisibility(event.target.value as 'show' | 'hide')}
                      className="h-9 w-full rounded-md border border-border/70 bg-background/70 px-2 text-sm"
                    >
                      <option value="show">{t('labels.show')}</option>
                      <option value="hide">{t('labels.hide')}</option>
                    </select>
                  </div>
                </>
              ) : null}

              {inspectorTab === 'animation' ? (
                <div className="space-y-3">
                  <label className="inline-flex items-center gap-2 text-xs text-muted-foreground">
                    <input
                      type="checkbox"
                      checked={selectedBlock.animation.enabled}
                      onChange={(event) => updateSelectedAnimation({ enabled: event.target.checked })}
                    />
                    <span>{t('fields.animationEnabled')}</span>
                  </label>

                  <div className="grid gap-2 md:grid-cols-2">
                    <div className="space-y-1">
                      <label className="block text-start text-xs text-muted-foreground">
                        {t('fields.animationEngine')}
                      </label>
                      <select
                        value={selectedBlock.animation.engine}
                        onChange={(event) => {
                          const nextEngine = event.target.value as AnimationEngine;
                          const nextPresets = listAnimationPresetsByEngine(nextEngine);
                          const nextPreset = nextPresets[0]?.id ?? 'none';
                          const nextTrigger = nextPresets[0]?.supportedTriggers?.[0] ?? 'onView';

                          updateSelectedAnimation({
                            engine: nextEngine,
                            preset: nextEngine === 'lottie' ? 'none' : nextPreset,
                            trigger: nextEngine === 'lottie' ? 'onLoad' : nextTrigger,
                            enabled: nextEngine !== 'none',
                            lottie:
                              nextEngine === 'lottie'
                                ? selectedBlock.animation.lottie ?? {
                                    mediaId: null,
                                    loop: true,
                                    autoplay: true,
                                    speed: 1,
                                  }
                                : null,
                          });
                        }}
                        className="h-9 w-full rounded-md border border-border/70 bg-background/70 px-2 text-sm"
                      >
                        <option value="none">{t('animation.engine.none')}</option>
                        <option value="framer">{t('animation.engine.framer')}</option>
                        <option value="lottie">{t('animation.engine.lottie')}</option>
                        <option value="anime">{t('animation.engine.anime')}</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="block text-start text-xs text-muted-foreground">
                        {t('fields.animationPreset')}
                      </label>
                      <select
                        value={selectedBlock.animation.preset}
                        onChange={(event) => {
                          const nextPreset = event.target.value as BuilderBlock['animation']['preset'];
                          const presetMeta = getAnimationPresetDefinition(nextPreset);
                          updateSelectedAnimation({
                            preset: nextPreset,
                            trigger: presetMeta?.supportedTriggers[0] ?? selectedBlock.animation.trigger,
                            ...presetMeta?.defaults,
                          });
                        }}
                        disabled={selectedBlock.animation.engine === 'none' || selectedBlock.animation.engine === 'lottie'}
                        className="h-9 w-full rounded-md border border-border/70 bg-background/70 px-2 text-sm disabled:opacity-60"
                      >
                        <option value="none">{t('animation.none')}</option>
                        {availablePresets.map((preset) => (
                          <option key={preset.id} value={preset.id}>
                            {t(`animation.${preset.id}`)}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-start text-xs text-muted-foreground">
                      {t('fields.trigger')}
                    </label>
                    <select
                      value={selectedBlock.animation.trigger}
                      onChange={(event) =>
                        updateSelectedAnimation({
                          trigger: event.target.value as AnimationTrigger,
                        })
                      }
                      disabled={selectedBlock.animation.engine === 'none'}
                      className="h-9 w-full rounded-md border border-border/70 bg-background/70 px-2 text-sm disabled:opacity-60"
                    >
                      {(selectedPresetDefinition?.supportedTriggers ?? ['onView', 'onLoad', 'hover', 'manual']).map(
                        (trigger) => (
                          <option key={trigger} value={trigger}>
                            {t(`options.${trigger}`)}
                          </option>
                        ),
                      )}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-start text-xs text-muted-foreground">{t('fields.durationMs')}</label>
                    <input
                      type="number"
                      min={0}
                      max={10000}
                      value={selectedBlock.animation.durationMs}
                      onChange={(event) =>
                        updateSelectedAnimation({ durationMs: Number(event.target.value) || 0 })
                      }
                      className="h-9 w-full rounded-md border border-border/70 bg-background/70 px-2 text-sm"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-start text-xs text-muted-foreground">{t('fields.delayMs')}</label>
                    <input
                      type="number"
                      min={0}
                      max={10000}
                      value={selectedBlock.animation.delayMs}
                      onChange={(event) =>
                        updateSelectedAnimation({ delayMs: Number(event.target.value) || 0 })
                      }
                      className="h-9 w-full rounded-md border border-border/70 bg-background/70 px-2 text-sm"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-start text-xs text-muted-foreground">{t('fields.easing')}</label>
                    <select
                      value={selectedBlock.animation.easing}
                      onChange={(event) =>
                        updateSelectedAnimation({
                          easing: event.target.value as BuilderBlock['animation']['easing'],
                        })
                      }
                      className="h-9 w-full rounded-md border border-border/70 bg-background/70 px-2 text-sm"
                    >
                      <option value="linear">linear</option>
                      <option value="easeOut">easeOut</option>
                      <option value="easeInOut">easeInOut</option>
                      <option value="spring">spring</option>
                      <option value="cubicBezier">cubicBezier</option>
                    </select>
                  </div>

                  <div className="grid gap-2 md:grid-cols-2">
                    <label className="inline-flex items-center gap-2 text-xs text-muted-foreground">
                      <input
                        type="checkbox"
                        checked={selectedBlock.animation.once}
                        onChange={(event) => updateSelectedAnimation({ once: event.target.checked })}
                      />
                      <span>{t('fields.once')}</span>
                    </label>
                    <div className="space-y-1">
                      <label className="block text-start text-xs text-muted-foreground">
                        {t('fields.viewportAmount')}
                      </label>
                      <input
                        type="number"
                        min={0}
                        max={1}
                        step={0.05}
                        value={selectedBlock.animation.viewportAmount}
                        onChange={(event) =>
                          updateSelectedAnimation({
                            viewportAmount: Number(event.target.value) || 0,
                          })
                        }
                        className="h-9 w-full rounded-md border border-border/70 bg-background/70 px-2 text-sm"
                      />
                    </div>
                  </div>

                  {selectedBlock.animation.preset === 'staggerChildren' ? (
                    <div className="space-y-1">
                      <label className="block text-start text-xs text-muted-foreground">
                        {t('fields.staggerMs')}
                      </label>
                      <input
                        type="number"
                        min={0}
                        max={4000}
                        value={selectedBlock.animation.staggerMs ?? 90}
                        onChange={(event) =>
                          updateSelectedAnimation({ staggerMs: Number(event.target.value) || 0 })
                        }
                        className="h-9 w-full rounded-md border border-border/70 bg-background/70 px-2 text-sm"
                      />
                    </div>
                  ) : null}

                  {selectedBlock.animation.preset === 'hoverScale' ? (
                    <div className="space-y-1">
                      <label className="block text-start text-xs text-muted-foreground">
                        {t('fields.hoverScale')}
                      </label>
                      <input
                        type="number"
                        min={0.5}
                        max={2}
                        step={0.01}
                        value={selectedBlock.animation.hoverScale ?? 1.03}
                        onChange={(event) =>
                          updateSelectedAnimation({ hoverScale: Number(event.target.value) || 1.03 })
                        }
                        className="h-9 w-full rounded-md border border-border/70 bg-background/70 px-2 text-sm"
                      />
                    </div>
                  ) : null}

                  {selectedBlock.animation.preset === 'parallaxOnScroll' ? (
                    <div className="space-y-1">
                      <label className="block text-start text-xs text-muted-foreground">
                        {t('fields.parallaxStrength')}
                      </label>
                      <input
                        type="number"
                        min={0}
                        max={200}
                        value={selectedBlock.animation.parallaxStrength ?? 14}
                        onChange={(event) =>
                          updateSelectedAnimation({
                            parallaxStrength: Number(event.target.value) || 0,
                          })
                        }
                        className="h-9 w-full rounded-md border border-border/70 bg-background/70 px-2 text-sm"
                      />
                    </div>
                  ) : null}

                  {selectedBlock.animation.engine === 'lottie' || selectedBlock.type === 'lottie' ? (
                    <>
                      <div className="space-y-1">
                        <label className="block text-start text-xs text-muted-foreground">
                          {t('fields.lottieMedia')}
                        </label>
                        <select
                          value={selectedBlock.animation.lottie?.mediaId ?? ''}
                          onChange={(event) => {
                            const mediaId = event.target.value || null;
                            const media = lottieMediaItems.find((item) => item.id === mediaId);
                            updateBlocks((current) =>
                              current.map((item) =>
                                item.id === selectedBlock.id
                                  ? {
                                      ...item,
                                      animation: patchBlockAnimation(
                                        item.animation,
                                        {
                                          engine: 'lottie',
                                          enabled: true,
                                          preset: 'none',
                                          trigger: 'onLoad',
                                          lottie: {
                                            mediaId,
                                            loop: item.animation.lottie?.loop ?? true,
                                            autoplay: item.animation.lottie?.autoplay ?? true,
                                            speed: item.animation.lottie?.speed ?? 1,
                                          },
                                        },
                                        item.type,
                                      ),
                                      content: {
                                        ...item.content,
                                        mediaPaths: media?.storage_path ? [media.storage_path] : [],
                                        mediaIds: mediaId ? [mediaId] : [],
                                      },
                                    }
                                  : item,
                              ),
                            );
                          }}
                          className="h-9 w-full rounded-md border border-border/70 bg-background/70 px-2 text-sm"
                        >
                          <option value="">{t('empty.noItems')}</option>
                          {lottieMediaItems.map((media) => (
                            <option key={media.id} value={media.id}>
                              {media.storage_path}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="grid gap-2 md:grid-cols-2">
                        <label className="inline-flex items-center gap-2 text-xs text-muted-foreground">
                          <input
                            type="checkbox"
                            checked={selectedBlock.animation.lottie?.loop ?? true}
                            onChange={(event) =>
                              updateSelectedAnimation({
                                lottie: {
                                  mediaId: selectedBlock.animation.lottie?.mediaId ?? null,
                                  loop: event.target.checked,
                                  autoplay: selectedBlock.animation.lottie?.autoplay ?? true,
                                  speed: selectedBlock.animation.lottie?.speed ?? 1,
                                },
                              })
                            }
                          />
                          <span>{t('fields.loop')}</span>
                        </label>
                        <label className="inline-flex items-center gap-2 text-xs text-muted-foreground">
                          <input
                            type="checkbox"
                            checked={selectedBlock.animation.lottie?.autoplay ?? true}
                            onChange={(event) =>
                              updateSelectedAnimation({
                                lottie: {
                                  mediaId: selectedBlock.animation.lottie?.mediaId ?? null,
                                  loop: selectedBlock.animation.lottie?.loop ?? true,
                                  autoplay: event.target.checked,
                                  speed: selectedBlock.animation.lottie?.speed ?? 1,
                                },
                              })
                            }
                          />
                          <span>{t('fields.autoplay')}</span>
                        </label>
                      </div>

                      <div className="space-y-1">
                        <label className="block text-start text-xs text-muted-foreground">{t('fields.speed')}</label>
                        <input
                          type="number"
                          min={0.25}
                          max={3}
                          step={0.05}
                          value={selectedBlock.animation.lottie?.speed ?? 1}
                          onChange={(event) =>
                            updateSelectedAnimation({
                              lottie: {
                                mediaId: selectedBlock.animation.lottie?.mediaId ?? null,
                                loop: selectedBlock.animation.lottie?.loop ?? true,
                                autoplay: selectedBlock.animation.lottie?.autoplay ?? true,
                                speed: Number(event.target.value) || 1,
                              },
                            })
                          }
                          className="h-9 w-full rounded-md border border-border/70 bg-background/70 px-2 text-sm"
                        />
                      </div>
                    </>
                  ) : null}

                  <button
                    type="button"
                    onClick={testSelectedAnimation}
                    disabled={
                      !selectedBlock.animation.enabled || selectedBlock.animation.engine === 'none'
                    }
                    className="rounded-md border border-border/70 bg-card/60 px-3 py-2 text-xs disabled:opacity-60"
                  >
                    {t('actions.testAnimation')}
                  </button>
                </div>
              ) : null}

              {inspectorTab === 'advanced' ? (
                <>
                  <select
                    value={selectedBlock.advanced.parentId ?? ''}
                    onChange={(event) =>
                      updateBlocks((current) =>
                        current.map((item) =>
                          item.id === selectedBlock.id
                            ? { ...item, advanced: { ...item.advanced, parentId: event.target.value || null } }
                            : item,
                        ),
                      )
                    }
                    className="h-9 w-full rounded-md border border-border/70 bg-background/70 px-2 text-sm"
                  >
                    <option value="">{t('labels.root')}</option>
                    {blocks
                      .filter(
                        (item) =>
                          item.id !== selectedBlock.id &&
                          (item.type === 'container' || item.type === 'columns' || item.type === 'grid'),
                      )
                      .map((item) => (
                        <option key={item.id} value={item.id}>
                          {t(`blocks.${item.type}`)}
                        </option>
                      ))}
                  </select>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        updateBlocks((current) =>
                          current.map((item) =>
                            item.id === selectedBlock.id
                              ? {
                                  ...item,
                                  hidden: item.visibility.base === 'show',
                                  visibility: {
                                    ...item.visibility,
                                    base: item.visibility.base === 'show' ? 'hide' : 'show',
                                  },
                                }
                              : item,
                          ),
                        )
                      }
                      className="rounded-md border border-border/70 bg-card/60 px-2 py-1 text-xs"
                    >
                      {selectedBlock.visibility.base === 'hide' ? t('actions.show') : t('actions.hide')}
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        updateBlocks((current) => current.filter((item) => item.id !== selectedBlock.id))
                      }
                      className="rounded-md border border-border/70 bg-card/60 px-2 py-1 text-xs"
                    >
                      {t('actions.delete')}
                    </button>
                  </div>
                </>
              ) : null}
            </div>
          )}
        </section>
      </div>

      {reactBitsOpen ? (
        <div className="fixed inset-0 z-50 bg-black/45 p-4 backdrop-blur-[2px]">
          <div className="mx-auto flex h-full w-full max-w-7xl flex-col overflow-hidden rounded-2xl border border-border/70 bg-background shadow-[0_45px_120px_-60px_rgba(0,0,0,0.7)]">
            <div className="flex items-center justify-between gap-3 border-b border-border/70 px-4 py-3">
              <div className="text-start">
                <h3 className="text-base font-semibold text-foreground">{t('reactBits.title')}</h3>
                <p className="text-xs text-muted-foreground">{t('reactBits.subtitle')}</p>
              </div>
              <div className="flex items-center gap-2">
                <Link
                  href={`/${locale}/admin/content/reactbits`}
                  target="_blank"
                  className="rounded-md border border-border/70 bg-card/70 px-3 py-2 text-xs text-foreground"
                >
                  {t('reactBits.openCatalog')}
                </Link>
                <button
                  type="button"
                  onClick={() => setReactBitsOpen(false)}
                  className="rounded-md border border-border/70 bg-card/70 px-3 py-2 text-xs text-foreground"
                >
                  {t('actions.close')}
                </button>
              </div>
            </div>

            <div className="grid gap-3 border-b border-border/70 px-4 py-3 md:grid-cols-[minmax(0,1fr)_12rem_12rem_auto]">
              <input
                value={reactBitsQuery}
                onChange={(event) => {
                  setReactBitsQuery(event.target.value);
                  setReactBitsPage(1);
                }}
                placeholder={t('reactBits.searchPlaceholder')}
                className="h-10 rounded-md border border-border/70 bg-background/70 px-3 text-sm"
              />
              <select
                value={reactBitsCategory}
                onChange={(event) => {
                  setReactBitsCategory(event.target.value);
                  setReactBitsPage(1);
                }}
                className="h-10 rounded-md border border-border/70 bg-background/70 px-3 text-sm"
              >
                <option value="all">{t('reactBits.allCategories')}</option>
                {reactBitsCategories.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
              <select
                value={reactBitsVariant}
                onChange={(event) => {
                  setReactBitsVariant(event.target.value);
                  setReactBitsPage(1);
                }}
                className="h-10 rounded-md border border-border/70 bg-background/70 px-3 text-sm"
              >
                <option value="all">{t('reactBits.allVariants')}</option>
                {reactBitsVariants.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
              <div className="flex items-center justify-end text-xs text-muted-foreground">
                {reactBitsLoading ? t('reactBits.loading') : `${reactBitsTotal} ${t('reactBits.results')}`}
              </div>
            </div>

            <div className="min-h-0 flex-1 overflow-auto px-4 py-3">
              {reactBitsError ? (
                <p className="text-start text-sm text-destructive">{t('reactBits.loadError')}</p>
              ) : reactBitsRows.length === 0 ? (
                <p className="text-start text-sm text-muted-foreground">{t('empty.noItems')}</p>
              ) : (
                <div className="grid gap-2">
                  {reactBitsRows.map((item) => {
                    const mapped = inferAnimationFromReactBits(item.componentName);
                    return (
                      <div
                        key={`${item.category}-${item.componentName}`}
                        className="rounded-xl border border-border/70 bg-card/40 p-3"
                      >
                        <div className="flex flex-wrap items-start justify-between gap-2">
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-start text-sm font-medium text-foreground">
                              {item.componentName}
                            </p>
                            <p className="text-start text-xs text-muted-foreground">
                              {item.category || '-'} • {item.preferredVariant || '-'}
                            </p>
                            <p className="mt-1 truncate text-start text-[11px] text-muted-foreground">
                              {item.preferredPath}
                            </p>
                            <p className="mt-1 text-start text-[11px] text-muted-foreground">
                              {item.filesCount} {t('reactBits.files')} • {item.availableVariants.length}{' '}
                              {t('reactBits.variants')}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => addReactBitsReferenceBlock(item)}
                              className="rounded-md border border-border/70 bg-card/70 px-2 py-1 text-xs"
                            >
                              {t('reactBits.addBlock')}
                            </button>
                            <button
                              type="button"
                              disabled={!mapped || !selectedBlock}
                              onClick={() => applyReactBitsAnimation(item)}
                              className="rounded-md border border-border/70 bg-card/70 px-2 py-1 text-xs disabled:opacity-50"
                            >
                              {t('reactBits.applyToSelected')}
                            </button>
                          </div>
                        </div>
                        {mapped ? (
                          <p className="mt-2 text-start text-[11px] text-muted-foreground">
                            {t('reactBits.mappedTo')} {mapped.preset}
                          </p>
                        ) : null}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="flex items-center justify-between gap-3 border-t border-border/70 px-4 py-3 text-xs text-muted-foreground">
              <p>
                {t('reactBits.pageLabel')} {reactBitsPage} / {reactBitsTotalPages}
              </p>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={reactBitsPage <= 1 || reactBitsLoading}
                  onClick={() => setReactBitsPage((value) => Math.max(1, value - 1))}
                  className="rounded-md border border-border/70 bg-card/70 px-3 py-2 text-xs disabled:opacity-50"
                >
                  {t('reactBits.previous')}
                </button>
                <button
                  type="button"
                  disabled={reactBitsPage >= reactBitsTotalPages || reactBitsLoading}
                  onClick={() => setReactBitsPage((value) => value + 1)}
                  className="rounded-md border border-border/70 bg-card/70 px-3 py-2 text-xs disabled:opacity-50"
                >
                  {t('reactBits.next')}
                </button>
              </div>
              <p>
                {t('reactBits.pageSize')} {reactBitsPageSize}
              </p>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

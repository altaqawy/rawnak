'use client';

import dynamic from 'next/dynamic';
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type RefObject,
} from 'react';
import { usePathname } from 'next/navigation';
import { motion, useReducedMotion } from 'framer-motion';
import type { LottieRefCurrentProps } from 'lottie-react';
import { cn } from '@/lib/utils';
import type { Locale } from '@/i18n/config';
import type { BuilderBlock, BuilderDevice } from '@/lib/builder/types';
import { trackAnalyticsEvent } from '@/lib/analytics/client';
import {
  buildFramerMotionProps,
  isAnimationDisabled,
  needsAnimeEngine,
  runAnimePresetAnimation,
  shouldAutoRunAnime,
} from '@/lib/builder/animation/runtime';

type BlockRendererProps = {
  blocks: BuilderBlock[];
  locale: Locale;
  emptyText: string;
  mediaUrlMap?: Record<string, string>;
  mediaIdToPathMap?: Record<string, string>;
  selectedBlockId?: string | null;
  onSelectBlock?: (blockId: string) => void;
  className?: string;
  device?: BuilderDevice;
  hiddenLabel?: string;
  previewMode?: boolean;
  animationsEnabled?: boolean;
  replayTokenMap?: Record<string, number>;
  viewportRootRef?: RefObject<HTMLElement | null>;
};

type TrackingContext = {
  locale: Locale;
  pageSlug: string;
};

const LottieRenderer = dynamic(() => import('lottie-react'), { ssr: false });

function LottieBlock({
  src,
  loop,
  autoplay,
  speed,
  animationsEnabled,
  reducedMotion,
  emptyText,
}: {
  src: string;
  loop: boolean;
  autoplay: boolean;
  speed: number;
  animationsEnabled: boolean;
  reducedMotion: boolean;
  emptyText: string;
}) {
  const [animationData, setAnimationData] = useState<Record<string, unknown> | null>(null);
  const [failed, setFailed] = useState(false);
  const lottieRef = useRef<LottieRefCurrentProps | null>(null);

  useEffect(() => {
    let active = true;
    setAnimationData(null);
    setFailed(false);
    if (!src) return;

    fetch(src)
      .then((response) => {
        if (!response.ok) throw new Error('Unable to load lottie json');
        return response.json();
      })
      .then((json) => {
        if (!active) return;
        if (json && typeof json === 'object') {
          setAnimationData(json as Record<string, unknown>);
        } else {
          setFailed(true);
        }
      })
      .catch(() => {
        if (!active) return;
        setFailed(true);
      });

    return () => {
      active = false;
    };
  }, [src]);

  useEffect(() => {
    if (!lottieRef.current?.setSpeed) return;
    lottieRef.current.setSpeed(speed);
  }, [speed]);

  if (!src || failed || !animationData) {
    return <p className="text-sm text-muted-foreground">{emptyText}</p>;
  }

  return (
    <div className="rounded-xl border border-border/70 bg-card/40 p-3">
      <LottieRenderer
        lottieRef={lottieRef}
        animationData={animationData}
        loop={loop}
        autoplay={autoplay && animationsEnabled && !reducedMotion}
        style={{ width: '100%', minHeight: 220 }}
      />
    </div>
  );
}

function getTrackingContext(pathname: string | null): TrackingContext | null {
  if (!pathname) return null;
  const segments = pathname.split('/').filter(Boolean);
  if (segments.length === 0) return null;
  const locale = segments[0] === 'ar' ? 'ar' : segments[0] === 'en' ? 'en' : null;
  if (!locale) return null;
  const first = segments[1] ?? '';
  if (
    first === 'admin' ||
    first === 'preview' ||
    first === 'auth' ||
    first === 'portal'
  ) {
    return null;
  }
  const pageSlug = first === '' ? 'home' : first === 'p' ? segments[2] || 'home' : first;
  return { locale, pageSlug };
}

function alignmentClass(alignment: BuilderBlock['style']['base']['alignment']) {
  if (alignment === 'center') return 'text-center items-center';
  if (alignment === 'end') return 'text-end items-end';
  return 'text-start items-start';
}

function justifyClass(alignment: BuilderBlock['style']['base']['alignment']) {
  if (alignment === 'center') return 'justify-center';
  if (alignment === 'end') return 'justify-end';
  return 'justify-start';
}

function widthClass(width: BuilderBlock['style']['base']['containerWidth']) {
  if (width === 'full') return 'w-full';
  if (width === 'wide') return 'mx-auto w-full max-w-6xl';
  return 'mx-auto w-full max-w-4xl';
}

function blockValue(block: BuilderBlock, locale: Locale) {
  return locale === 'ar' ? block.content.ar : block.content.en;
}

function mediaPaths(block: BuilderBlock) {
  const paths = block.content.mediaPaths ?? [];
  if (paths.length > 0) return paths;
  return (block.content.mediaIds ?? []).filter(Boolean);
}

function resolveMediaUrl(storagePath: string, mediaUrlMap?: Record<string, string>) {
  if (!storagePath) return '';
  if (mediaUrlMap?.[storagePath]) return mediaUrlMap[storagePath];
  if (storagePath.startsWith('https://') || storagePath.startsWith('http://')) return storagePath;
  if (storagePath.startsWith('/')) return storagePath;
  return '';
}

function resolveLottieUrl(block: BuilderBlock, mediaUrlMap?: Record<string, string>, mediaIdToPathMap?: Record<string, string>) {
  const mediaId = block.animation.lottie?.mediaId ?? null;
  const mediaPath = mediaId ? mediaIdToPathMap?.[mediaId] : undefined;
  const path = mediaPath || mediaPaths(block)[0] || '';
  return resolveMediaUrl(path, mediaUrlMap);
}

function getEffectiveStyle(block: BuilderBlock, device?: BuilderDevice) {
  const base = block.style?.base ?? block.settings;
  if (!device) return base;
  const override = block.style?.[device];
  return {
    ...base,
    ...(override ?? {}),
  };
}

function getVisibility(block: BuilderBlock, device?: BuilderDevice) {
  const base = block.visibility?.base ?? (block.hidden ? 'hide' : 'show');
  if (!device) return base;
  const override = block.visibility?.[device];
  return override ?? base;
}

function containerWidthCss(width: BuilderBlock['style']['base']['containerWidth']) {
  if (width === 'full') {
    return 'max-width: none; width: 100%;';
  }
  if (width === 'wide') {
    return 'max-width: 72rem; width: 100%; margin-left: auto; margin-right: auto;';
  }
  return 'max-width: 56rem; width: 100%; margin-left: auto; margin-right: auto;';
}

function alignmentCss(alignment: BuilderBlock['style']['base']['alignment']) {
  if (alignment === 'center') {
    return {
      text: 'text-align: center;',
      justify: 'justify-content: center;',
    };
  }
  if (alignment === 'end') {
    return {
      text: 'text-align: end;',
      justify: 'justify-content: flex-end;',
    };
  }
  return {
    text: 'text-align: start;',
    justify: 'justify-content: flex-start;',
  };
}

function buildResponsiveCss(block: BuilderBlock) {
  const base = block.style?.base ?? block.settings;
  const desktop = block.style?.desktop ?? null;
  const tablet = block.style?.tablet ?? null;
  const mobile = block.style?.mobile ?? null;

  const visibility = block.visibility ?? { base: 'show' };
  const baseVisibility = visibility.base ?? (block.hidden ? 'hide' : 'show');
  const cssChunks: string[] = [];

  function buildForDevice(style: BuilderBlock['style']['base'], visibilityOverride: 'show' | 'hide') {
    const align = alignmentCss(style.alignment);
    const columns = Math.max(1, style.columns);
    const visibilityCss = visibilityOverride === 'hide' ? 'display: none;' : 'display: block;';
    return [
      `[data-block-id="${block.id}"] { padding-top: ${style.spacingTop}px; padding-bottom: ${style.spacingBottom}px; ${align.text} ${containerWidthCss(style.containerWidth)} ${visibilityCss} }`,
      `[data-block-id="${block.id}"] .rb-flex { ${align.justify} }`,
      `[data-block-id="${block.id}"] .rb-grid { grid-template-columns: repeat(${columns}, minmax(0, 1fr)); }`,
    ].join('\n');
  }

  if (mobile || visibility.mobile) {
    const effective = { ...base, ...(mobile ?? {}) };
    const deviceVisibility = visibility.mobile ?? baseVisibility;
    cssChunks.push(`@media (max-width: 767px) { ${buildForDevice(effective, deviceVisibility)} }`);
  }
  if (tablet || visibility.tablet) {
    const effective = { ...base, ...(tablet ?? {}) };
    const deviceVisibility = visibility.tablet ?? baseVisibility;
    cssChunks.push(`@media (min-width: 768px) and (max-width: 1023px) { ${buildForDevice(effective, deviceVisibility)} }`);
  }
  if (desktop || visibility.desktop) {
    const effective = { ...base, ...(desktop ?? {}) };
    const deviceVisibility = visibility.desktop ?? baseVisibility;
    cssChunks.push(`@media (min-width: 1024px) { ${buildForDevice(effective, deviceVisibility)} }`);
  }

  return cssChunks.length > 0 ? cssChunks.join('\n') : '';
}

function useAnimeBlockAnimation({
  block,
  replayToken,
  previewMode,
  animationsEnabled,
  reducedMotion,
  viewportRootRef,
}: {
  block: BuilderBlock;
  replayToken: number;
  previewMode: boolean;
  animationsEnabled: boolean;
  reducedMotion: boolean;
  viewportRootRef?: RefObject<HTMLElement | null>;
}) {
  const ref = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (isAnimationDisabled(block.animation, { animationsEnabled, reducedMotion })) return;
    if (!needsAnimeEngine(block.animation, block.animation.preset)) return;
    if (block.animation.trigger === 'hover') return;
    if (!shouldAutoRunAnime(block.animation, { previewMode, replayToken })) return;

    let disposed = false;
    let observer: IntersectionObserver | null = null;
    let animeInstance: { pause?: () => void } | null = null;

    const run = async () => {
      if (disposed || !ref.current) return;
      try {
        animeInstance = await runAnimePresetAnimation(ref.current, block.animation);
      } catch {
        animeInstance = null;
      }
    };

    if (block.animation.trigger === 'onView') {
      observer = new IntersectionObserver(
        (entries) => {
          const entry = entries[0];
          if (!entry?.isIntersecting) return;
          run();
          if (block.animation.once) {
            observer?.disconnect();
          }
        },
        {
          root: viewportRootRef?.current ?? null,
          threshold: block.animation.viewportAmount,
        },
      );
      if (ref.current) {
        observer.observe(ref.current);
      }
    } else {
      run();
    }

    return () => {
      disposed = true;
      observer?.disconnect();
      animeInstance?.pause?.();
    };
  }, [
    block,
    replayToken,
    previewMode,
    animationsEnabled,
    reducedMotion,
    viewportRootRef,
  ]);

  return ref;
}

function renderFaqItems(block: BuilderBlock, locale: Locale, emptyText: string) {
  const items = block.content.faqItems ?? [];
  if (items.length === 0) {
    return (
      <article className="rounded-xl border border-dashed border-border/70 p-4 text-sm text-muted-foreground">
        {emptyText}
      </article>
    );
  }

  return items.map((item, index) => {
    const value = (locale === 'ar' ? item.ar : item.en).trim();
    return (
      <article key={`${block.id}-faq-${index}`} className="rounded-xl border border-border/70 bg-card/60 p-4">
        <p className="text-sm text-foreground">{value || emptyText}</p>
      </article>
    );
  });
}

function useModelViewerLoader(blocks: BuilderBlock[]) {
  const hasModel3d = useMemo(() => blocks.some((block) => block.type === 'model3d'), [blocks]);

  useEffect(() => {
    if (!hasModel3d) return;

    if (document.querySelector('script[data-model-viewer="1"]')) {
      return;
    }

    const script = document.createElement('script');
    script.type = 'module';
    script.src = 'https://unpkg.com/@google/model-viewer/dist/model-viewer.min.js';
    script.dataset.modelViewer = '1';
    document.head.appendChild(script);
  }, [hasModel3d]);
}

function buildChildrenMap(blocks: BuilderBlock[]) {
  const map = new Map<string, BuilderBlock[]>();
  const roots: BuilderBlock[] = [];

  for (const block of blocks) {
    const parentId = block.advanced.parentId;
    if (!parentId) {
      roots.push(block);
      continue;
    }

    const collection = map.get(parentId);
    if (collection) {
      collection.push(block);
    } else {
      map.set(parentId, [block]);
    }
  }

  return { roots, map };
}

function BlockNode({
  block,
  locale,
  emptyText,
  mediaUrlMap,
  mediaIdToPathMap,
  childrenMap,
  selectedBlockId,
  onSelectBlock,
  device,
  hiddenLabel,
  previewMode,
  animationsEnabled,
  replayTokenMap,
  viewportRootRef,
  tracking,
}: {
  block: BuilderBlock;
  locale: Locale;
  emptyText: string;
  mediaUrlMap?: Record<string, string>;
  mediaIdToPathMap?: Record<string, string>;
  childrenMap: Map<string, BuilderBlock[]>;
  selectedBlockId?: string | null;
  onSelectBlock?: (blockId: string) => void;
  device?: BuilderDevice;
  hiddenLabel?: string;
  previewMode: boolean;
  animationsEnabled: boolean;
  replayTokenMap?: Record<string, number>;
  viewportRootRef?: RefObject<HTMLElement | null>;
  tracking?: TrackingContext | null;
}) {
  const reducedMotion = useReducedMotion() ?? false;
  const replayToken = replayTokenMap?.[block.id] ?? 0;
  const value = blockValue(block, locale).trim();
  const effectiveStyle = getEffectiveStyle(block, device);
  const visibility = getVisibility(block, device);
  const baseVisibility = block.visibility?.base ?? (block.hidden ? 'hide' : 'show');
  const alignment = alignmentClass(effectiveStyle.alignment);
  const blockPaths = mediaPaths(block);
  const media = blockPaths.map((path) => ({
    path,
    url: resolveMediaUrl(path, mediaUrlMap),
  })).filter((item) => Boolean(item.url));
  const lottieUrl = resolveLottieUrl(block, mediaUrlMap, mediaIdToPathMap);
  const children = childrenMap.get(block.id) ?? [];
  const framerProps = buildFramerMotionProps(block.animation, {
    animationsEnabled,
    reducedMotion,
    previewMode,
    replayToken,
    viewportRoot: viewportRootRef,
  });
  const animeRef = useAnimeBlockAnimation({
    block,
    replayToken,
    previewMode,
    animationsEnabled,
    reducedMotion,
    viewportRootRef,
  });
  const trackClick = (eventName: 'block_click' | 'cta_click', targetUrl?: string) => {
    if (!tracking || device) return;
    trackAnalyticsEvent({
      eventName,
      pageSlug: tracking.pageSlug,
      locale: tracking.locale,
      blockId: block.id,
      blockType: block.type,
      targetUrl,
    });
  };

  if (device && visibility === 'hide') {
    if (onSelectBlock) {
      return (
        <div
          className="rounded-xl border border-dashed border-border/70 bg-card/40 px-4 py-6 text-sm text-muted-foreground"
          onClick={(event) => {
            event.stopPropagation();
            onSelectBlock(block.id);
          }}
        >
          {hiddenLabel ?? emptyText}
        </div>
      );
    }
    return null;
  }

  const content = (() => {
    switch (block.type) {
      case 'spacer':
        return <div style={{ height: `${Math.max(8, effectiveStyle.spacingTop)}px` }} />;
      case 'divider':
        return <hr className="border-border/70" />;
      case 'columns':
      case 'grid': {
        const columns = Math.max(1, effectiveStyle.columns);
        return (
          <div
            className={cn('rb-grid grid gap-4', alignment)}
            style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}
          >
            {children.length === 0 ? (
              <div className="col-span-full rounded-xl border border-dashed border-border/70 p-4 text-sm text-muted-foreground">
                {emptyText}
              </div>
            ) : (
              children.map((child) => (
                <BlockNode
                  key={child.id}
                  block={child}
                  locale={locale}
                  emptyText={emptyText}
                  mediaUrlMap={mediaUrlMap}
                  mediaIdToPathMap={mediaIdToPathMap}
                  childrenMap={childrenMap}
                  selectedBlockId={selectedBlockId}
                  onSelectBlock={onSelectBlock}
                  device={device}
                  hiddenLabel={hiddenLabel}
                  previewMode={previewMode}
                  animationsEnabled={animationsEnabled}
                  replayTokenMap={replayTokenMap}
                  viewportRootRef={viewportRootRef}
                  tracking={tracking}
                />
              ))
            )}
          </div>
        );
      }
      case 'image':
        return media[0]?.url ? (
          <figure className={cn('w-full', alignment)}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={media[0].url}
              alt={locale === 'ar' ? block.content.altAr || '' : block.content.altEn || ''}
              className="max-h-[420px] w-full rounded-xl border border-border/70 object-cover"
            />
            {value ? <figcaption className="mt-2 text-sm text-muted-foreground">{value}</figcaption> : null}
          </figure>
        ) : (
          <p className="text-sm text-muted-foreground">{emptyText}</p>
        );
      case 'video':
        return media[0]?.url || block.content.embedUrl ? (
          <div className="space-y-2">
            {block.content.embedUrl ? (
              <div className="overflow-hidden rounded-xl border border-border/70">
                <iframe
                  src={block.content.embedUrl}
                  className="aspect-video w-full"
                  allow="autoplay; encrypted-media; picture-in-picture"
                  allowFullScreen
                  title={value || block.id}
                />
              </div>
            ) : (
              <video controls className="w-full rounded-xl border border-border/70" src={media[0]?.url}>
                <track kind="captions" />
              </video>
            )}
            {value ? <p className="text-sm text-muted-foreground">{value}</p> : null}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">{emptyText}</p>
        );
      case 'audio':
        return media[0]?.url ? (
          <div className="space-y-2">
            <audio controls className="w-full" src={media[0].url}>
              <track kind="captions" />
            </audio>
            {value ? <p className="text-sm text-muted-foreground">{value}</p> : null}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">{emptyText}</p>
        );
      case 'file': {
        const label = locale === 'ar' ? block.content.fileLabelAr : block.content.fileLabelEn;
        return media[0]?.url ? (
          <a
            href={media[0].url}
            className="inline-flex rounded-md border border-border/70 bg-card/70 px-4 py-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
            target="_blank"
            rel="noreferrer"
            onClick={() => trackClick('block_click', media[0].url)}
          >
            {label?.trim() || value || emptyText}
          </a>
        ) : (
          <p className="text-sm text-muted-foreground">{emptyText}</p>
        );
      }
      case 'button':
        return (
          <div className={cn('rb-flex flex', justifyClass(effectiveStyle.alignment))}>
            <a
              href={block.content.link || '#'}
              onClick={() => trackClick('cta_click', block.content.link || '#')}
              className="rounded-md border border-border/70 bg-card/70 px-4 py-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              {value || emptyText}
            </a>
          </div>
        );
      case 'gallery':
        return media.length > 0 ? (
          <div className="space-y-3">
            <div
              className={cn(
                block.content.galleryMode === 'carousel'
                  ? device
                    ? 'flex gap-3 overflow-hidden pb-1'
                    : 'flex gap-3 overflow-x-auto pb-1'
                  : 'grid gap-3 sm:grid-cols-2 lg:grid-cols-3',
              )}
            >
              {media.map((item) => (
                <a
                  key={item.path}
                  href={block.content.galleryMode === 'lightbox' ? item.url : undefined}
                  target={block.content.galleryMode === 'lightbox' ? '_blank' : undefined}
                  rel={block.content.galleryMode === 'lightbox' ? 'noreferrer' : undefined}
                  className={cn(block.content.galleryMode === 'carousel' ? 'min-w-[16rem]' : '')}
                  onClick={() =>
                    trackClick(
                      block.content.galleryMode === 'lightbox' ? 'cta_click' : 'block_click',
                      item.url,
                    )
                  }
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={item.url}
                    alt={locale === 'ar' ? block.content.altAr || '' : block.content.altEn || ''}
                    className="h-52 w-full rounded-xl border border-border/70 object-cover"
                  />
                </a>
              ))}
            </div>
            {value ? <p className="text-sm text-muted-foreground">{value}</p> : null}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">{emptyText}</p>
        );
      case 'buttonRow': {
        const labels = value
          ? value.split('\n').map((item) => item.trim()).filter(Boolean)
          : [];

        return (
          <div className={cn('rb-flex flex flex-wrap gap-3', justifyClass(effectiveStyle.alignment))}>
            {(labels.length > 0 ? labels : [emptyText]).map((label, index) => (
              <button
                key={`${block.id}-button-${index}`}
                type="button"
                disabled
                className="rounded-md border border-border/70 bg-card/70 px-4 py-2 text-sm text-muted-foreground"
              >
                {label}
              </button>
            ))}
          </div>
        );
      }
      case 'hero':
        return (
          <section className={cn('space-y-3 rounded-2xl border border-border/70 bg-card/60 p-8', alignment)}>
            <h2 className="text-3xl font-semibold text-foreground">{value || emptyText}</h2>
          </section>
        );
      case 'featureCards':
        return (
          <div className="grid gap-4 md:grid-cols-3">
            {(children.length > 0 ? children : Array.from({ length: 3 })).map((child, index) =>
              children.length > 0 ? (
                <BlockNode
                  key={(child as BuilderBlock).id}
                  block={child as BuilderBlock}
                  locale={locale}
                  emptyText={emptyText}
                  mediaUrlMap={mediaUrlMap}
                  mediaIdToPathMap={mediaIdToPathMap}
                  childrenMap={childrenMap}
                  selectedBlockId={selectedBlockId}
                  onSelectBlock={onSelectBlock}
                  device={device}
                  hiddenLabel={hiddenLabel}
                  previewMode={previewMode}
                  animationsEnabled={animationsEnabled}
                  replayTokenMap={replayTokenMap}
                  viewportRootRef={viewportRootRef}
                  tracking={tracking}
                />
              ) : (
                <article
                  key={`${block.id}-feature-${index}`}
                  className="rounded-xl border border-dashed border-border/70 bg-card/60 p-5 text-sm text-muted-foreground"
                >
                  {index === 0 && value ? value : emptyText}
                </article>
              ),
            )}
          </div>
        );
      case 'faq':
        return <div className="space-y-3">{renderFaqItems(block, locale, emptyText)}</div>;
      case 'ctaBanner':
        return (
          <section className={cn('rounded-2xl border border-border/70 bg-card/70 p-6', alignment)}>
            <p className="text-base text-foreground">{value || emptyText}</p>
          </section>
        );
      case 'lottie':
        return (
          <LottieBlock
            src={lottieUrl}
            loop={block.animation.lottie?.loop ?? true}
            autoplay={block.animation.lottie?.autoplay ?? true}
            speed={block.animation.lottie?.speed ?? 1}
            animationsEnabled={animationsEnabled}
            reducedMotion={reducedMotion}
            emptyText={emptyText}
          />
        );
      case 'model3d':
        return media[0]?.url ? (
          <div className="overflow-hidden rounded-xl border border-border/70 bg-card/50">
            {/* eslint-disable-next-line @typescript-eslint/ban-ts-comment */}
            {/* @ts-ignore */}
            <model-viewer
              src={media[0].url}
              camera-controls
              auto-rotate
              ar
              style={{ width: '100%', minHeight: '340px', background: 'transparent' }}
            />
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">{emptyText}</p>
        );
      case 'container':
      case 'richText':
      default:
        return (
          <article className={cn('space-y-2', alignment)}>
            {value ? <p className="whitespace-pre-wrap text-base text-foreground">{value}</p> : null}
            {children.length > 0 ? (
              <div className="space-y-4">
                {children.map((child) => (
                  <BlockNode
                    key={child.id}
                    block={child}
                    locale={locale}
                    emptyText={emptyText}
                    mediaUrlMap={mediaUrlMap}
                    mediaIdToPathMap={mediaIdToPathMap}
                    childrenMap={childrenMap}
                    selectedBlockId={selectedBlockId}
                    onSelectBlock={onSelectBlock}
                    device={device}
                    hiddenLabel={hiddenLabel}
                    previewMode={previewMode}
                    animationsEnabled={animationsEnabled}
                    replayTokenMap={replayTokenMap}
                    viewportRootRef={viewportRootRef}
                    tracking={tracking}
                  />
                ))}
              </div>
            ) : !value ? (
              <p className="text-sm text-muted-foreground">{emptyText}</p>
            ) : null}
          </article>
        );
    }
  })();

  const blockClasses = cn(
    widthClass(effectiveStyle.containerWidth),
    block.advanced.customClass,
    onSelectBlock && 'cursor-pointer rounded-xl border border-transparent transition-colors',
    onSelectBlock && selectedBlockId === block.id && 'border-primary/50 bg-card/40',
  );

  const responsiveCss = device ? '' : buildResponsiveCss(block);

  return (
    <motion.section
      key={`${block.id}-${replayToken}-${previewMode ? 'preview' : 'public'}`}
      ref={animeRef}
      data-block-id={block.id}
      className={cn('rb-block', blockClasses)}
      style={{
        paddingTop: `${effectiveStyle.spacingTop}px`,
        paddingBottom: `${effectiveStyle.spacingBottom}px`,
        display: !device && baseVisibility === 'hide' ? 'none' : undefined,
      }}
      onClick={(event) => {
        if (!onSelectBlock) return;
        event.stopPropagation();
        onSelectBlock(block.id);
      }}
      {...framerProps}
      onMouseEnter={async () => {
        if (isAnimationDisabled(block.animation, { animationsEnabled, reducedMotion })) return;
        if (!needsAnimeEngine(block.animation, block.animation.preset)) return;
        if (block.animation.trigger !== 'hover') return;
        if (!animeRef.current) return;
        await runAnimePresetAnimation(animeRef.current, block.animation);
      }}
    >
      {responsiveCss ? <style>{responsiveCss}</style> : null}
      {content}
    </motion.section>
  );
}

export function BlockRenderer({
  blocks,
  locale,
  emptyText,
  mediaUrlMap,
  mediaIdToPathMap,
  selectedBlockId,
  onSelectBlock,
  className,
  device,
  hiddenLabel,
  previewMode = false,
  animationsEnabled = true,
  replayTokenMap,
  viewportRootRef,
}: BlockRendererProps) {
  const pathname = usePathname();
  const trackedPathRef = useRef<string | null>(null);
  useModelViewerLoader(blocks);
  const tracking = useMemo(() => getTrackingContext(pathname), [pathname]);
  const enableTracking = !onSelectBlock && !device && Boolean(tracking);

  useEffect(() => {
    if (!enableTracking || !tracking || !pathname) return;
    if (trackedPathRef.current === pathname) return;
    trackedPathRef.current = pathname;
    trackAnalyticsEvent({
      eventName: 'page_view',
      locale: tracking.locale,
      pageSlug: tracking.pageSlug,
      metadata: { pathname },
    });
  }, [enableTracking, tracking, pathname]);

  const preparedBlocks = useMemo(() => blocks, [blocks]);

  if (preparedBlocks.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border/70 p-6 text-start">
        <p className="text-sm text-muted-foreground">{emptyText}</p>
      </div>
    );
  }

  const { roots, map } = buildChildrenMap(preparedBlocks);

  return (
    <div className={cn('space-y-6', className)}>
      {roots.map((block) => (
        <BlockNode
          key={block.id}
          block={block}
          locale={locale}
          emptyText={emptyText}
          mediaUrlMap={mediaUrlMap}
          mediaIdToPathMap={mediaIdToPathMap}
          childrenMap={map}
          selectedBlockId={selectedBlockId}
          onSelectBlock={onSelectBlock}
          device={device}
          hiddenLabel={hiddenLabel}
          previewMode={previewMode}
          animationsEnabled={animationsEnabled}
          replayTokenMap={replayTokenMap}
          viewportRootRef={viewportRootRef}
          tracking={enableTracking ? tracking : null}
        />
      ))}
    </div>
  );
}

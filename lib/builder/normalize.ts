import { createEmptyBlock, defaultThemeTokens } from '@/lib/builder/defaults';
import { normalizeBlockAnimation } from '@/lib/builder/animation/schema';
import {
  BUILDER_BLOCK_TYPES,
  type BuilderBlock,
  type BuilderBlockType,
  type ThemeTokens,
} from '@/lib/builder/types';

const blockTypeSet = new Set<string>(BUILDER_BLOCK_TYPES);

function clampNumber(value: unknown, min: number, max: number, fallback: number) {
  if (typeof value !== 'number' || Number.isNaN(value)) {
    return fallback;
  }
  return Math.min(max, Math.max(min, value));
}

function parseBlockType(value: unknown): BuilderBlockType {
  if (typeof value === 'string' && blockTypeSet.has(value)) {
    return value as BuilderBlockType;
  }
  return 'container';
}

function parseString(value: unknown): string {
  return typeof value === 'string' ? value : '';
}

type StyleShape = {
  spacingTop: number;
  spacingBottom: number;
  containerWidth: 'content' | 'wide' | 'full';
  alignment: 'start' | 'center' | 'end';
  columns: number;
};

function parseStyle(input: unknown, fallback: StyleShape): StyleShape {
  const raw = (typeof input === 'object' && input ? input : {}) as Record<string, unknown>;
  return {
    spacingTop: clampNumber(raw.spacingTop, 0, 400, fallback.spacingTop),
    spacingBottom: clampNumber(raw.spacingBottom, 0, 400, fallback.spacingBottom),
    containerWidth:
      raw.containerWidth === 'content' ||
      raw.containerWidth === 'wide' ||
      raw.containerWidth === 'full'
        ? raw.containerWidth
        : fallback.containerWidth,
    alignment:
      raw.alignment === 'start' || raw.alignment === 'center' || raw.alignment === 'end'
        ? raw.alignment
        : fallback.alignment,
    columns: clampNumber(raw.columns, 1, 6, fallback.columns),
  };
}

function parseStyleOverride(input: unknown, fallback: StyleShape) {
  if (!input || typeof input !== 'object') return null;
  const raw = input as Record<string, unknown>;
  const hasAny =
    raw.spacingTop !== undefined ||
    raw.spacingBottom !== undefined ||
    raw.containerWidth !== undefined ||
    raw.alignment !== undefined ||
    raw.columns !== undefined;
  if (!hasAny) return null;
  return {
    spacingTop: clampNumber(raw.spacingTop, 0, 400, fallback.spacingTop),
    spacingBottom: clampNumber(raw.spacingBottom, 0, 400, fallback.spacingBottom),
    containerWidth:
      raw.containerWidth === 'content' ||
      raw.containerWidth === 'wide' ||
      raw.containerWidth === 'full'
        ? raw.containerWidth
        : fallback.containerWidth,
    alignment:
      raw.alignment === 'start' || raw.alignment === 'center' || raw.alignment === 'end'
        ? raw.alignment
        : fallback.alignment,
    columns: clampNumber(raw.columns, 1, 6, fallback.columns),
  };
}

export function normalizeBlocks(input: unknown): BuilderBlock[] {
  if (!Array.isArray(input)) {
    return [];
  }

  return input.map((raw) => {
    const block = typeof raw === 'object' && raw ? (raw as Record<string, unknown>) : {};
    const type = parseBlockType(block.type);
    const fallback = createEmptyBlock(type);

    const settings = (typeof block.settings === 'object' && block.settings
      ? block.settings
      : {}) as Record<string, unknown>;
    const content = (typeof block.content === 'object' && block.content
      ? block.content
      : {}) as Record<string, unknown>;
    const animation = (typeof block.animation === 'object' && block.animation
      ? block.animation
      : {}) as Record<string, unknown>;
    const style = (typeof block.style === 'object' && block.style
      ? block.style
      : {}) as Record<string, unknown>;
    const visibility = (typeof block.visibility === 'object' && block.visibility
      ? block.visibility
      : {}) as Record<string, unknown>;
    const advanced = (typeof block.advanced === 'object' && block.advanced
      ? block.advanced
      : {}) as Record<string, unknown>;

    const baseStyleSource =
      style.base && typeof style.base === 'object'
        ? style.base
        : // Backward compatibility: allow style to be a flat object
          (style as Record<string, unknown>);

    const baseStyle = parseStyle(
      baseStyleSource && Object.keys(baseStyleSource).length > 0
        ? baseStyleSource
        : settings,
      fallback.settings,
    );

    const desktopOverride = parseStyleOverride(style.desktop, baseStyle);
    const tabletOverride = parseStyleOverride(style.tablet, baseStyle);
    const mobileOverride = parseStyleOverride(style.mobile, baseStyle);

    const baseVisibility =
      visibility.base === 'show' || visibility.base === 'hide'
        ? (visibility.base as 'show' | 'hide')
        : block.hidden
          ? 'hide'
          : 'show';

    const visibilityDesktop =
      visibility.desktop === 'show' || visibility.desktop === 'hide'
        ? (visibility.desktop as 'show' | 'hide')
        : null;
    const visibilityTablet =
      visibility.tablet === 'show' || visibility.tablet === 'hide'
        ? (visibility.tablet as 'show' | 'hide')
        : null;
    const visibilityMobile =
      visibility.mobile === 'show' || visibility.mobile === 'hide'
        ? (visibility.mobile as 'show' | 'hide')
        : null;

    return {
      id: typeof block.id === 'string' && block.id ? block.id : fallback.id,
      type,
      hidden: Boolean(block.hidden),
      content: {
        ar: parseString(content.ar),
        en: parseString(content.en),
        altAr: parseString(content.altAr),
        altEn: parseString(content.altEn),
        mediaIds: Array.isArray(content.mediaIds)
          ? content.mediaIds.filter((value): value is string => typeof value === 'string')
          : [],
        mediaPaths: Array.isArray(content.mediaPaths)
          ? content.mediaPaths.filter((value): value is string => typeof value === 'string')
          : [],
        link: parseString(content.link),
        embedUrl: parseString(content.embedUrl),
        fileLabelAr: parseString(content.fileLabelAr),
        fileLabelEn: parseString(content.fileLabelEn),
        faqItems: Array.isArray(content.faqItems)
          ? content.faqItems
              .map((item) => {
                if (!item || typeof item !== 'object') return null;
                const raw = item as Record<string, unknown>;
                return {
                  ar: parseString(raw.ar),
                  en: parseString(raw.en),
                };
              })
              .filter((item): item is { ar: string; en: string } => Boolean(item))
          : [],
        galleryMode:
          content.galleryMode === 'grid' ||
          content.galleryMode === 'carousel' ||
          content.galleryMode === 'lightbox'
            ? content.galleryMode
            : 'grid',
      },
      settings: {
        spacingTop: baseStyle.spacingTop,
        spacingBottom: baseStyle.spacingBottom,
        containerWidth: baseStyle.containerWidth,
        alignment: baseStyle.alignment,
        columns: baseStyle.columns,
      },
      style: {
        base: baseStyle,
        desktop: desktopOverride,
        tablet: tabletOverride,
        mobile: mobileOverride,
      },
      animation: normalizeBlockAnimation(animation, type),
      visibility: {
        base: baseVisibility,
        desktop: visibilityDesktop,
        tablet: visibilityTablet,
        mobile: visibilityMobile,
      },
      advanced: {
        customClass: parseString(advanced.customClass),
        parentId: parseString(advanced.parentId) || null,
      },
    };
  });
}

export function normalizeThemeTokens(input: unknown): ThemeTokens {
  const fallback = defaultThemeTokens();
  const forcedDarkBase = '#000000';
  if (!input || typeof input !== 'object') {
    return {
      ...fallback,
      dark: {
        ...fallback.dark,
        base: forcedDarkBase,
      },
    };
  }

  const raw = input as Record<string, unknown>;
  const light = (raw.light ?? {}) as Record<string, unknown>;
  const dark = (raw.dark ?? {}) as Record<string, unknown>;

  return {
    light: {
      base: typeof light.base === 'string' && light.base ? light.base : fallback.light.base,
      secondary:
        typeof light.secondary === 'string' && light.secondary
          ? light.secondary
          : fallback.light.secondary,
      primary:
        typeof light.primary === 'string' && light.primary
          ? light.primary
          : fallback.light.primary,
      text: typeof light.text === 'string' && light.text ? light.text : fallback.light.text,
    },
    dark: {
      base: forcedDarkBase,
      secondary:
        typeof dark.secondary === 'string' && dark.secondary
          ? dark.secondary
          : fallback.dark.secondary,
      accent:
        typeof dark.accent === 'string' && dark.accent
          ? dark.accent
          : fallback.dark.accent,
      text: typeof dark.text === 'string' && dark.text ? dark.text : fallback.dark.text,
    },
    radius: typeof raw.radius === 'string' && raw.radius ? raw.radius : fallback.radius,
    shadowSoft:
      typeof raw.shadowSoft === 'string' && raw.shadowSoft
        ? raw.shadowSoft
        : fallback.shadowSoft,
    typographyScale:
      typeof raw.typographyScale === 'string' && raw.typographyScale
        ? raw.typographyScale
        : fallback.typographyScale,
  };
}

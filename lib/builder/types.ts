export const BUILDER_BLOCK_TYPES = [
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
] as const;

export type BuilderBlockType = (typeof BUILDER_BLOCK_TYPES)[number];

export type BlockContainerWidth = 'content' | 'wide' | 'full';
export type BlockAlignment = 'start' | 'center' | 'end';
export type GalleryMode = 'grid' | 'carousel' | 'lightbox';
export type BuilderDevice = 'desktop' | 'tablet' | 'mobile';

export const ANIMATION_ENGINES = ['none', 'framer', 'lottie', 'anime'] as const;
export type AnimationEngine = (typeof ANIMATION_ENGINES)[number];

export const ANIMATION_PRESET_IDS = [
  'none',
  'fadeIn',
  'slideUp',
  'slideDown',
  'slideLeft',
  'slideRight',
  'scaleIn',
  'staggerChildren',
  'hoverLift',
  'hoverScale',
  'parallaxOnScroll',
  'animeFade',
  'animeSlideUp',
] as const;
export type AnimationPreset = (typeof ANIMATION_PRESET_IDS)[number];

export const ANIMATION_TRIGGERS = ['onView', 'onLoad', 'hover', 'manual'] as const;
export type AnimationTrigger = (typeof ANIMATION_TRIGGERS)[number];

export const ANIMATION_EASINGS = [
  'linear',
  'easeOut',
  'easeInOut',
  'spring',
  'cubicBezier',
] as const;
export type AnimationEasing = (typeof ANIMATION_EASINGS)[number];

export type BuilderBlockAnimation = {
  enabled: boolean;
  engine: AnimationEngine;
  preset: AnimationPreset;
  trigger: AnimationTrigger;
  durationMs: number;
  delayMs: number;
  easing: AnimationEasing;
  once: boolean;
  viewportAmount: number;
  staggerMs: number | null;
  hoverScale: number | null;
  parallaxStrength: number | null;
  lottie: {
    mediaId: string | null;
    loop: boolean;
    autoplay: boolean;
    speed: number;
  } | null;
};

export type BuilderBlock = {
  id: string;
  type: BuilderBlockType;
  hidden: boolean;
  content: {
    ar: string;
    en: string;
    altAr?: string;
    altEn?: string;
    mediaIds?: string[];
    mediaPaths?: string[];
    link?: string;
    galleryMode?: GalleryMode;
    embedUrl?: string;
    fileLabelAr?: string;
    fileLabelEn?: string;
    faqItems?: Array<{ ar: string; en: string }>;
  };
  // Legacy shape retained for backward compatibility; normalization maps into `style`.
  settings: {
    spacingTop: number;
    spacingBottom: number;
    containerWidth: BlockContainerWidth;
    alignment: BlockAlignment;
    columns: number;
  };
  style: {
    base: {
      spacingTop: number;
      spacingBottom: number;
      containerWidth: BlockContainerWidth;
      alignment: BlockAlignment;
      columns: number;
    };
    desktop?: Partial<BuilderBlock['style']['base']> | null;
    tablet?: Partial<BuilderBlock['style']['base']> | null;
    mobile?: Partial<BuilderBlock['style']['base']> | null;
  };
  animation: BuilderBlockAnimation;
  visibility: {
    base: 'show' | 'hide';
    desktop?: 'show' | 'hide' | null;
    tablet?: 'show' | 'hide' | null;
    mobile?: 'show' | 'hide' | null;
  };
  advanced: {
    customClass: string;
    parentId: string | null;
  };
};

export type BuilderPageStatus = 'draft' | 'published';

export type BuilderPageRecord = {
  id: string;
  slug: string;
  status: BuilderPageStatus;
  title_ar: string | null;
  title_en: string | null;
  nav_label_ar: string | null;
  nav_label_en: string | null;
  show_in_nav: boolean;
  nav_order: number;
  is_system: boolean;
  blocks_json: unknown;
  created_at: string;
  updated_at: string;
};

export type PublishedPageRecord = {
  id: string;
  slug: string;
  status: BuilderPageStatus;
  title_ar: string | null;
  title_en: string | null;
  blocks_json: unknown;
  updated_at: string;
};

export type PublishedNavPageRecord = {
  slug: string;
  nav_label_ar: string | null;
  nav_label_en: string | null;
  title_ar: string | null;
  title_en: string | null;
  nav_order: number;
};

export type BuilderPageRevisionRecord = {
  id: string;
  page_id: string;
  snapshot_json: unknown;
  created_by: string | null;
  created_at: string;
};

export type BuilderTemplateRecord = {
  id: string;
  name: string | null;
  snapshot_json: unknown;
  created_by: string | null;
  created_at: string;
};

export type ThemeTokens = {
  light: {
    base: string;
    secondary: string;
    primary: string;
    text: string;
  };
  dark: {
    base: string;
    secondary: string;
    accent: string;
    text: string;
  };
  radius: string;
  shadowSoft: string;
  typographyScale: string;
};

export type ThemePresetRecord = {
  id: string;
  name: string | null;
  tokens_json: unknown;
  created_by: string | null;
  created_at: string;
};

export type MediaRecord = {
  id: string;
  storage_path: string;
  media_type: string;
  alt_ar: string | null;
  alt_en: string | null;
  created_by: string | null;
  created_at: string;
};

export type ThemeRevisionRecord = {
  id: string;
  snapshot_json: unknown;
  created_by: string | null;
  created_at: string;
};

export type AuditLogRecord = {
  id: string;
  actor_id: string | null;
  action: string;
  entity_type: string;
  entity_id: string | null;
  details_json: unknown;
  created_at: string;
};

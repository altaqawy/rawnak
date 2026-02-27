import type { BuilderBlock, BuilderBlockType, ThemeTokens } from '@/lib/builder/types';
import { defaultBlockAnimation } from '@/lib/builder/animation/schema';

export const OWNER_MEDIA_BUCKET = 'rawnak-media';

export function defaultThemeTokens(): ThemeTokens {
  return {
    light: {
      base: '#F6F8FB',
      secondary: '#EEF3F8',
      primary: '#1F3B57',
      text: '#0E1B2A',
    },
    dark: {
      base: '#000000',
      secondary: '#0E1A2B',
      accent: '#9FC3FF',
      text: '#EAF0FF',
    },
    radius: '0.875rem',
    shadowSoft: '0 16px 48px -36px rgba(31,59,87,0.35)',
    typographyScale: '1',
  };
}

export function createEmptyBlock(type: BuilderBlockType): BuilderBlock {
  const isGridLike = type === 'columns' || type === 'grid';

  return {
    id: crypto.randomUUID(),
    type,
    hidden: false,
    content: {
      ar: '',
      en: '',
      altAr: '',
      altEn: '',
      mediaIds: [],
      mediaPaths: [],
      link: '',
      galleryMode: 'grid',
      embedUrl: '',
      fileLabelAr: '',
      fileLabelEn: '',
      faqItems: [],
    },
    settings: {
      spacingTop: 24,
      spacingBottom: 24,
      containerWidth: 'content',
      alignment: 'start',
      columns: isGridLike ? 2 : 1,
    },
    style: {
      base: {
        spacingTop: 24,
        spacingBottom: 24,
        containerWidth: 'content',
        alignment: 'start',
        columns: isGridLike ? 2 : 1,
      },
      desktop: null,
      tablet: null,
      mobile: null,
    },
    animation: defaultBlockAnimation(type),
    visibility: {
      base: 'show',
      desktop: null,
      tablet: null,
      mobile: null,
    },
    advanced: {
      customClass: '',
      parentId: null,
    },
  };
}

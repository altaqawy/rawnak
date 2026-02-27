import { createEmptyBlock } from '@/lib/builder/defaults';
import type { BuilderBlock, BuilderBlockType } from '@/lib/builder/types';

export type BuiltinTemplateKey =
  | 'premium-landing'
  | 'portfolio-agency'
  | 'catalog-storefront';

export type BuiltinTemplate = {
  key: BuiltinTemplateKey;
  name: string;
  blocks: BuilderBlock[];
};

function makeBlock(
  type: BuilderBlockType,
  overrides?: Partial<BuilderBlock>,
): BuilderBlock {
  const block = createEmptyBlock(type);
  const baseOverride = {
    ...(overrides?.style?.base ?? {}),
    ...(overrides?.settings ?? {}),
  };
  return {
    ...block,
    ...overrides,
    content: {
      ...block.content,
      ...(overrides?.content ?? {}),
    },
    settings: {
      ...block.settings,
      ...(overrides?.settings ?? {}),
    },
    style: {
      base: {
        ...block.style.base,
        ...baseOverride,
      },
      desktop: overrides?.style?.desktop ?? block.style.desktop ?? null,
      tablet: overrides?.style?.tablet ?? block.style.tablet ?? null,
      mobile: overrides?.style?.mobile ?? block.style.mobile ?? null,
    },
    animation: {
      ...block.animation,
      ...(overrides?.animation ?? {}),
    },
    visibility: {
      ...block.visibility,
      ...(overrides?.visibility ?? {}),
    },
    advanced: {
      ...block.advanced,
      ...(overrides?.advanced ?? {}),
    },
  };
}

const BUILTIN_TEMPLATES: BuiltinTemplate[] = [
  {
    key: 'premium-landing',
    name: 'Premium Landing',
    blocks: [
      makeBlock('hero', { settings: { spacingTop: 64, spacingBottom: 32, containerWidth: 'wide', alignment: 'start', columns: 1 } }),
      makeBlock('ctaBanner', { settings: { spacingTop: 16, spacingBottom: 32, containerWidth: 'content', alignment: 'start', columns: 1 } }),
      makeBlock('featureCards', { settings: { spacingTop: 16, spacingBottom: 32, containerWidth: 'wide', alignment: 'start', columns: 3 } }),
    ],
  },
  {
    key: 'portfolio-agency',
    name: 'Portfolio / Agency',
    blocks: [
      makeBlock('hero', { settings: { spacingTop: 56, spacingBottom: 24, containerWidth: 'wide', alignment: 'start', columns: 1 } }),
      makeBlock('grid', { settings: { spacingTop: 8, spacingBottom: 24, containerWidth: 'wide', alignment: 'start', columns: 3 } }),
      makeBlock('gallery', { settings: { spacingTop: 8, spacingBottom: 24, containerWidth: 'wide', alignment: 'start', columns: 1 } }),
      makeBlock('ctaBanner', { settings: { spacingTop: 8, spacingBottom: 32, containerWidth: 'content', alignment: 'start', columns: 1 } }),
    ],
  },
  {
    key: 'catalog-storefront',
    name: 'Catalog / Storefront',
    blocks: [
      makeBlock('hero', { settings: { spacingTop: 56, spacingBottom: 24, containerWidth: 'wide', alignment: 'start', columns: 1 } }),
      makeBlock('grid', { settings: { spacingTop: 8, spacingBottom: 16, containerWidth: 'wide', alignment: 'start', columns: 4 } }),
      makeBlock('buttonRow', { settings: { spacingTop: 8, spacingBottom: 16, containerWidth: 'content', alignment: 'center', columns: 1 } }),
      makeBlock('faq', { settings: { spacingTop: 16, spacingBottom: 32, containerWidth: 'content', alignment: 'start', columns: 1 } }),
    ],
  },
];

export function listBuiltinTemplates(): BuiltinTemplate[] {
  return BUILTIN_TEMPLATES;
}

export function instantiateBuiltinTemplate(key: BuiltinTemplateKey): BuilderBlock[] {
  const source = BUILTIN_TEMPLATES.find((template) => template.key === key);
  if (!source) return [];

  const idMap = new Map<string, string>();
  for (const block of source.blocks) {
    idMap.set(block.id, crypto.randomUUID());
  }

  return source.blocks.map((block) => {
    const nextId = idMap.get(block.id) ?? crypto.randomUUID();
    const oldParentId = block.advanced.parentId;
    const nextParentId = oldParentId ? idMap.get(oldParentId) ?? null : null;

    return {
      ...block,
      id: nextId,
      content: {
        ...block.content,
        mediaIds: [...(block.content.mediaIds ?? [])],
        mediaPaths: [...(block.content.mediaPaths ?? [])],
        faqItems: [...(block.content.faqItems ?? [])],
      },
      settings: { ...block.settings },
      style: {
        base: { ...block.style.base },
        desktop: block.style.desktop ? { ...block.style.desktop } : null,
        tablet: block.style.tablet ? { ...block.style.tablet } : null,
        mobile: block.style.mobile ? { ...block.style.mobile } : null,
      },
      animation: { ...block.animation },
      visibility: { ...block.visibility },
      advanced: {
        ...block.advanced,
        parentId: nextParentId,
      },
    };
  });
}

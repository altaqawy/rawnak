/** First-party Rawnak Tools catalog. No third-party component code is redistributed. */
export const toolCatalog = [
  {
    slug: 'button-studio',
    label: { en: 'Button Studio', ar: 'استوديو الأزرار' },
    subtitle: { en: 'Create buttons with thoughtful details.', ar: 'صمّم أزرارًا بتفاصيل وتفاعلات احترافية.' },
    category: { en: 'Components', ar: 'مكوّنات' },
    icon: 'mouse-pointer',
    hint: '01',
  },
  {
    slug: 'motion-studio',
    label: { en: 'Motion Studio', ar: 'استوديو الحركة' },
    subtitle: { en: 'Create lightweight CSS animations.', ar: 'اصنع تأثيرات حركة CSS خفيفة.' },
    category: { en: 'Animation', ar: 'حركة' },
    icon: 'activity',
    hint: '02',
  },
  {
    slug: 'theme-builder',
    label: { en: 'Theme Builder', ar: 'مصمم الثيمات' },
    subtitle: { en: 'Create and export theme tokens.', ar: 'أنشئ متغيرات الألوان وصدّرها.' },
    category: { en: 'Design', ar: 'تصميم' },
    icon: 'palette',
    hint: '03',
  },
  {
    slug: 'svg-studio',
    label: { en: 'SVG Pattern Studio', ar: 'استوديو زخارف SVG' },
    subtitle: { en: 'Generate infinitely scalable patterns.', ar: 'ولّد خلفيات وزخارف لا تفقد جودتها.' },
    category: { en: 'Graphics', ar: 'رسومات' },
    icon: 'grid-3x3',
    hint: '04',
  },
  {
    slug: 'hero-builder',
    label: { en: 'Hero Builder', ar: 'منشئ واجهات Hero' },
    subtitle: { en: 'Build a responsive hero section.', ar: 'أنشئ القسم الرئيسي للصفحات بمرونة.' },
    category: { en: 'Sections', ar: 'أقسام' },
    icon: 'layout-template',
    hint: '05',
  },
] as const;

export type ToolSlug = (typeof toolCatalog)[number]['slug'];

export function isToolSlug(value: string): value is ToolSlug {
  return toolCatalog.some((tool) => tool.slug === value);
}

export function findTool(slug: string) {
  return toolCatalog.find((tool) => tool.slug === slug);
}

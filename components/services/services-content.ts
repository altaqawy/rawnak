import type { Locale } from '@/i18n/config';

export type LocalizedText = {
  ar: string;
  en: string;
};

export type ServiceScenePreset = {
  id: string;
  darkBase: string;
  darkOverlay: string;
  lightBase: string;
  lightOverlay: string;
  accent: string;
  spotlight: string;
  streak: string;
};

export type ServiceContent = {
  id: string;
  title: LocalizedText;
  subtitle: LocalizedText;
  heroHeadline: LocalizedText;
  heroSubline: LocalizedText;
  deliverables: LocalizedText[];
  deliverablesCaption: LocalizedText;
  processSteps: LocalizedText[];
  processCaption: LocalizedText;
  ctaHeadline: LocalizedText;
  ctaSubline: LocalizedText;
  ctaPrimaryLabel: LocalizedText;
  ctaPrimaryHref: string;
  ctaSecondaryLabel: LocalizedText;
  ctaSecondaryHref: string;
  scenePreset: ServiceScenePreset;
};

export const SERVICES_CONTENT: ServiceContent[] = [
  {
    id: 'branding-design',
    title: { en: 'Branding & Design', ar: 'الهوية والتصميم' },
    subtitle: {
      en: 'A clear visual system for every customer touchpoint.',
      ar: 'نظام بصري واضح لكل نقطة تواصل مع العميل.',
    },
    heroHeadline: {
      en: 'Brand direction built for consistency.',
      ar: 'اتجاه بصري مبني على الاتساق.',
    },
    heroSubline: {
      en: 'Define the look, tone, and design structure before execution.',
      ar: 'تحديد الشكل والنبرة وبنية التصميم قبل التنفيذ.',
    },
    deliverables: [
      { en: 'Identity direction and visual language.', ar: 'اتجاه الهوية واللغة البصرية.' },
      { en: 'Reusable typography and color system.', ar: 'نظام خطوط وألوان قابل لإعادة الاستخدام.' },
      { en: 'Key layouts for digital and print assets.', ar: 'تخطيطات أساسية للأصول الرقمية والمطبوعة.' },
      { en: 'Guidelines for consistent implementation.', ar: 'إرشادات لضمان تطبيق موحد.' },
    ],
    deliverablesCaption: {
      en: 'Deliverables include adaptable system files.',
      ar: 'المخرجات تشمل ملفات نظام قابلة للتكيّف.',
    },
    processSteps: [
      { en: 'Audit current brand material.', ar: 'مراجعة المواد الحالية للهوية.' },
      { en: 'Define direction and approve style.', ar: 'تحديد الاتجاه واعتماد الأسلوب.' },
      { en: 'Build final assets and handoff.', ar: 'تجهيز الأصول النهائية والتسليم.' },
    ],
    processCaption: {
      en: 'A focused process with visible checkpoints.',
      ar: 'مسار عمل واضح بنقاط مراجعة محددة.',
    },
    ctaHeadline: {
      en: 'Start your brand foundation.',
      ar: 'ابدأ تأسيس الهوية الآن.',
    },
    ctaSubline: {
      en: 'Move from scattered visuals to one coherent system.',
      ar: 'انتقل من عناصر متفرقة إلى نظام بصري موحد.',
    },
    ctaPrimaryLabel: { en: 'Request this service', ar: 'اطلب هذه الخدمة' },
    ctaPrimaryHref: '/contact',
    ctaSecondaryLabel: { en: 'Discuss your scope', ar: 'ناقش نطاق العمل' },
    ctaSecondaryHref: '/contact',
    scenePreset: {
      id: 'a',
      darkBase: '#000000',
      darkOverlay: '#1f3b57',
      lightBase: '#f6f8fb',
      lightOverlay: '#dce9f6',
      accent: '#9fc3ff',
      spotlight: '#8fb4ff',
      streak: '#b8d2ff',
    },
  },
  {
    id: 'websites-ecommerce',
    title: { en: 'Websites & E-commerce', ar: 'المواقع والمتاجر الإلكترونية' },
    subtitle: {
      en: 'Fast, scalable pages focused on conversion and usability.',
      ar: 'صفحات سريعة وقابلة للتوسع تركز على سهولة الاستخدام والتحويل.',
    },
    heroHeadline: {
      en: 'Structured pages ready for growth.',
      ar: 'صفحات منظمة وجاهزة للنمو.',
    },
    heroSubline: {
      en: 'Build clear journeys for browsing, discovery, and checkout.',
      ar: 'بناء رحلة واضحة للتصفح والاكتشاف وإتمام الطلب.',
    },
    deliverables: [
      { en: 'Responsive service and product pages.', ar: 'صفحات خدمات ومنتجات متجاوبة.' },
      { en: 'Reusable components and content blocks.', ar: 'مكونات وبلوكات محتوى قابلة لإعادة الاستخدام.' },
      { en: 'Checkout and request flow structure.', ar: 'هيكلة مسار الطلب وإتمام الشراء.' },
      { en: 'Performance and accessibility baseline.', ar: 'أساس قوي للأداء وإمكانية الوصول.' },
    ],
    deliverablesCaption: {
      en: 'Each deliverable is prepared for ongoing iteration.',
      ar: 'كل مخرج يتم تجهيزه ليقبل التطوير المستمر.',
    },
    processSteps: [
      { en: 'Map page goals and user flows.', ar: 'تحديد أهداف الصفحات وتدفق المستخدم.' },
      { en: 'Build and review key templates.', ar: 'تنفيذ القوالب الأساسية ومراجعتها.' },
      { en: 'Launch and refine by feedback.', ar: 'الإطلاق ثم التحسين وفق الملاحظات.' },
    ],
    processCaption: {
      en: 'Continuous refinement after launch is built into the cycle.',
      ar: 'التحسين بعد الإطلاق جزء أساسي من دورة العمل.',
    },
    ctaHeadline: {
      en: 'Launch a focused web experience.',
      ar: 'أطلق تجربة ويب مركزة.',
    },
    ctaSubline: {
      en: 'Turn service information into clear user actions.',
      ar: 'حوّل معلومات الخدمات إلى خطوات واضحة للمستخدم.',
    },
    ctaPrimaryLabel: { en: 'Start website scope', ar: 'ابدأ نطاق الموقع' },
    ctaPrimaryHref: '/contact',
    ctaSecondaryLabel: { en: 'Request consultation', ar: 'اطلب استشارة' },
    ctaSecondaryHref: '/contact',
    scenePreset: {
      id: 'b',
      darkBase: '#000000',
      darkOverlay: '#12304f',
      lightBase: '#f7f9fc',
      lightOverlay: '#d9e8fb',
      accent: '#7eb5ff',
      spotlight: '#7aa8e8',
      streak: '#9cc6ff',
    },
  },
  {
    id: 'systems-automation',
    title: { en: 'Business Systems & Automation', ar: 'أنظمة الأعمال والأتمتة' },
    subtitle: {
      en: 'Connected workflows that reduce repetitive manual steps.',
      ar: 'تدفقات عمل مترابطة تقلل التكرار اليدوي.',
    },
    heroHeadline: {
      en: 'Systems designed to remove friction.',
      ar: 'أنظمة مصممة لتقليل الاحتكاك التشغيلي.',
    },
    heroSubline: {
      en: 'Unify forms, approvals, and dashboards in one workflow.',
      ar: 'توحيد النماذج والاعتمادات ولوحات المتابعة في مسار واحد.',
    },
    deliverables: [
      { en: 'Process mapping and role permissions.', ar: 'تصميم العمليات وصلاحيات الأدوار.' },
      { en: 'Automated triggers and notifications.', ar: 'مشغلات آلية وتنبيهات مهيكلة.' },
      { en: 'Admin dashboards and reporting views.', ar: 'لوحات تحكم وتقارير تشغيلية.' },
      { en: 'Data validation and access controls.', ar: 'تحقق من البيانات وضوابط الوصول.' },
    ],
    deliverablesCaption: {
      en: 'Deliverables are aligned to your internal operations.',
      ar: 'المخرجات مرتبطة مباشرة بعملياتك الداخلية.',
    },
    processSteps: [
      { en: 'Document current workflow and blockers.', ar: 'توثيق سير العمل الحالي ونقاط التعطيل.' },
      { en: 'Design target workflow and rules.', ar: 'تصميم المسار المستهدف وقواعده.' },
      { en: 'Implement, test, and hand over.', ar: 'تنفيذ واختبار ثم تسليم منظّم.' },
    ],
    processCaption: {
      en: 'Execution focuses on clarity, control, and maintainability.',
      ar: 'التنفيذ يركز على الوضوح والتحكم وقابلية الصيانة.',
    },
    ctaHeadline: {
      en: 'Automate your core operations.',
      ar: 'قم بأتمتة العمليات الأساسية.',
    },
    ctaSubline: {
      en: 'Shift effort from repetitive tasks to decision-making.',
      ar: 'انقل الجهد من التكرار اليومي إلى اتخاذ القرار.',
    },
    ctaPrimaryLabel: { en: 'Request system planning', ar: 'اطلب تخطيط النظام' },
    ctaPrimaryHref: '/contact',
    ctaSecondaryLabel: { en: 'Review your workflow', ar: 'راجع سير العمل' },
    ctaSecondaryHref: '/contact',
    scenePreset: {
      id: 'c',
      darkBase: '#000000',
      darkOverlay: '#0f2942',
      lightBase: '#f5f8fc',
      lightOverlay: '#d8e5f5',
      accent: '#8ac3ff',
      spotlight: '#7aa4d4',
      streak: '#a2c8ef',
    },
  },
  {
    id: 'performance-seo-maintenance',
    title: { en: 'Performance, SEO & Maintenance', ar: 'الأداء وتهيئة البحث والصيانة' },
    subtitle: {
      en: 'Reliable speed, technical hygiene, and continuous optimization.',
      ar: 'سرعة موثوقة وصحة تقنية وتحسين مستمر.',
    },
    heroHeadline: {
      en: 'Sustain quality after launch.',
      ar: 'حافظ على الجودة بعد الإطلاق.',
    },
    heroSubline: {
      en: 'Track issues early and improve discoverability over time.',
      ar: 'اكتشف المشاكل مبكرًا وارفع قابلية الوصول تدريجيًا.',
    },
    deliverables: [
      { en: 'Technical audits and priority fixes.', ar: 'مراجعات تقنية مع أولويات إصلاح واضحة.' },
      { en: 'Search structure and indexing readiness.', ar: 'هيكلة البحث وجاهزية الأرشفة.' },
      { en: 'Monitoring alerts and maintenance cycles.', ar: 'تنبيهات متابعة ودورات صيانة دورية.' },
      { en: 'Performance tuning across critical pages.', ar: 'تحسين الأداء في الصفحات الأساسية.' },
    ],
    deliverablesCaption: {
      en: 'Maintenance is structured as an ongoing service loop.',
      ar: 'الصيانة تُدار كحلقة عمل مستمرة.',
    },
    processSteps: [
      { en: 'Baseline measurement and issue list.', ar: 'قياس أولي وقائمة مشاكل واضحة.' },
      { en: 'Apply technical and content improvements.', ar: 'تطبيق تحسينات تقنية ومحتوى.' },
      { en: 'Monitor, report, and iterate.', ar: 'متابعة وتقرير وتحسين متكرر.' },
    ],
    processCaption: {
      en: 'Progress is reviewed in recurring maintenance checkpoints.',
      ar: 'يتم مراجعة التقدم عبر نقاط متابعة دورية.',
    },
    ctaHeadline: {
      en: 'Keep your platform healthy.',
      ar: 'حافظ على منصة مستقرة وصحية.',
    },
    ctaSubline: {
      en: 'Build a clear maintenance rhythm with measurable outcomes.',
      ar: 'أنشئ دورة صيانة واضحة بنتائج قابلة للقياس.',
    },
    ctaPrimaryLabel: { en: 'Start optimization', ar: 'ابدأ التحسين' },
    ctaPrimaryHref: '/contact',
    ctaSecondaryLabel: { en: 'Request technical review', ar: 'اطلب مراجعة تقنية' },
    ctaSecondaryHref: '/contact',
    scenePreset: {
      id: 'd',
      darkBase: '#000000',
      darkOverlay: '#0d2337',
      lightBase: '#f7f9fb',
      lightOverlay: '#dce7f2',
      accent: '#94beef',
      spotlight: '#7f9ec2',
      streak: '#a7c4e6',
    },
  },
];

export function pickText(value: LocalizedText, locale: Locale) {
  return locale === 'ar' ? value.ar : value.en;
}

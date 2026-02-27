'use client';

import { useCallback, useEffect, useMemo, useRef, useState, type PointerEvent, type WheelEvent } from 'react';
import Link from 'next/link';
import { AnimatePresence, motion, useMotionValueEvent, useReducedMotion, useSpring } from 'framer-motion';
import { useTheme } from 'next-themes';
import type { Locale } from '@/i18n/config';
import { cn } from '@/lib/utils';
import { AdaptiveTextColor } from '@/components/services/AdaptiveTextColor';
import { ParallaxBackground, sceneLuminanceModel } from '@/components/services/ParallaxBackground';
import { SceneCarousel } from '@/components/services/SceneCarousel';
import { ScrambledText } from '@/components/services/ScrambledText';
import { SERVICES_CONTENT, pickText, type LocalizedText, type ServiceContent } from '@/components/services/services-content';
import { ShinyText } from '@/components/services/ShinyText';
import { StepPager } from '@/components/services/StepPager';

const STEP_COUNT = 4;
const WHEEL_LOCK_MS = 430;
const SWIPE_THRESHOLD = 44;

type ServicesStageProps = {
  locale: Locale;
};

type StepView = {
  id: 'hero' | 'deliverables' | 'process' | 'cta';
  label: string;
  headline: string;
  subline: string;
  ctaPrimary?: { label: string; href: string };
  ctaSecondary?: { label: string; href: string };
  bullets?: string[];
  process?: string[];
  caption?: string;
};

type ViewportMode = 'mobile' | 'tablet' | 'desktop';

const TEXTS: Record<
  Locale,
  {
    axisScene: string;
    axisStep: string;
    scenePrev: string;
    sceneNext: string;
    stepUp: string;
    stepDown: string;
    stepAria: string;
    hintDesktop: string;
    hintTouch: string;
    stepHero: string;
    stepDeliverables: string;
    stepProcess: string;
    stepCta: string;
    deliverablesLabel: string;
    processLabel: string;
    processExpectation: string;
    startLabel: string;
  }
> = {
  en: {
    axisScene: 'Service scenes',
    axisStep: 'Step flow',
    scenePrev: 'Previous service',
    sceneNext: 'Next service',
    stepUp: 'Previous step',
    stepDown: 'Next step',
    stepAria: 'Step',
    hintDesktop: 'Scroll up/down for steps. Use left/right to switch services.',
    hintTouch: 'Swipe up/down for steps and left/right to switch services.',
    stepHero: 'Hero',
    stepDeliverables: 'Deliverables',
    stepProcess: 'Process',
    stepCta: 'Call to action',
    deliverablesLabel: 'Deliverables include:',
    processLabel: 'Process',
    processExpectation: 'What to expect',
    startLabel: 'Start',
  },
  ar: {
    axisScene: 'محاور الخدمات',
    axisStep: 'تدرج الخطوات',
    scenePrev: 'الخدمة السابقة',
    sceneNext: 'الخدمة التالية',
    stepUp: 'الخطوة السابقة',
    stepDown: 'الخطوة التالية',
    stepAria: 'الخطوة',
    hintDesktop: 'مرّر للأعلى أو للأسفل بين الخطوات. واستخدم اليمين/اليسار لتبديل الخدمات.',
    hintTouch: 'اسحب لأعلى أو لأسفل بين الخطوات، ولليمين أو اليسار لتبديل الخدمات.',
    stepHero: 'المقدمة',
    stepDeliverables: 'المخرجات',
    stepProcess: 'آلية العمل',
    stepCta: 'الإجراء',
    deliverablesLabel: 'تشمل المخرجات:',
    processLabel: 'المسار',
    processExpectation: 'ما الذي تتوقعه',
    startLabel: 'ابدأ',
  },
};

function clampStep(value: number) {
  return Math.max(0, Math.min(STEP_COUNT - 1, value));
}

function toLocaleHref(locale: Locale, href: string) {
  if (!href.startsWith('/')) return href;
  if (href.startsWith(`/${locale}/`) || href === `/${locale}`) return href;
  return `/${locale}${href}`;
}

function pickList(values: LocalizedText[], locale: Locale) {
  return values.map((entry) => pickText(entry, locale));
}

function buildStepViews(scene: ServiceContent, locale: Locale, texts: (typeof TEXTS)[Locale]): StepView[] {
  return [
    {
      id: 'hero',
      label: texts.stepHero,
      headline: pickText(scene.heroHeadline, locale),
      subline: pickText(scene.heroSubline, locale),
      ctaPrimary: {
        label: pickText(scene.ctaPrimaryLabel, locale),
        href: toLocaleHref(locale, scene.ctaPrimaryHref),
      },
      ctaSecondary: {
        label: pickText(scene.ctaSecondaryLabel, locale),
        href: toLocaleHref(locale, scene.ctaSecondaryHref),
      },
    },
    {
      id: 'deliverables',
      label: texts.stepDeliverables,
      headline: texts.deliverablesLabel,
      subline: pickText(scene.deliverablesCaption, locale),
      bullets: pickList(scene.deliverables, locale),
      caption: pickText(scene.subtitle, locale),
    },
    {
      id: 'process',
      label: texts.stepProcess,
      headline: texts.processLabel,
      subline: pickText(scene.processCaption, locale),
      process: pickList(scene.processSteps, locale),
      caption: texts.processExpectation,
    },
    {
      id: 'cta',
      label: texts.stepCta,
      headline: pickText(scene.ctaHeadline, locale),
      subline: pickText(scene.ctaSubline, locale),
      ctaPrimary: {
        label: pickText(scene.ctaPrimaryLabel, locale),
        href: toLocaleHref(locale, scene.ctaPrimaryHref),
      },
      ctaSecondary: {
        label: pickText(scene.ctaSecondaryLabel, locale),
        href: toLocaleHref(locale, scene.ctaSecondaryHref),
      },
    },
  ];
}

export default function ServicesStage({ locale }: ServicesStageProps) {
  const isRtl = locale === 'ar';
  const texts = TEXTS[locale];
  const reducedMotion = useReducedMotion() ?? false;
  const { resolvedTheme } = useTheme();

  const [sceneIndex, setSceneIndex] = useState(0);
  const [stepIndex, setStepIndex] = useState(0);
  const [mouse, setMouse] = useState({ x: 0, y: 0 });
  const [viewportMode, setViewportMode] = useState<ViewportMode>('desktop');

  const activeScene = SERVICES_CONTENT[sceneIndex] ?? SERVICES_CONTENT[0];
  const steps = useMemo(() => buildStepViews(activeScene, locale, texts), [activeScene, locale, texts]);
  const activeStep = steps[stepIndex] ?? steps[0];

  const progressTarget = stepIndex / (STEP_COUNT - 1);
  const progressSpring = useSpring(progressTarget, {
    stiffness: reducedMotion ? 260 : 150,
    damping: reducedMotion ? 36 : 26,
    mass: 0.7,
  });
  const [progress, setProgress] = useState(progressTarget);

  const wheelLockRef = useRef(false);
  const rafRef = useRef<number | null>(null);
  const stageRef = useRef<HTMLElement | null>(null);
  const pointerStartRef = useRef<{ x: number; y: number; t: number } | null>(null);

  useMotionValueEvent(progressSpring, 'change', (value) => {
    setProgress(value);
  });

  useEffect(() => {
    progressSpring.set(progressTarget);
  }, [progressSpring, progressTarget]);

  useEffect(() => {
    const updateViewportMode = () => {
      const width = window.innerWidth;
      if (width < 768) {
        setViewportMode('mobile');
        return;
      }
      if (width < 1024) {
        setViewportMode('tablet');
        return;
      }
      setViewportMode('desktop');
    };
    updateViewportMode();
    window.addEventListener('resize', updateViewportMode);
    return () => window.removeEventListener('resize', updateViewportMode);
  }, []);

  const changeStep = useCallback((nextStep: number) => {
    setStepIndex(clampStep(nextStep));
  }, []);

  const changeScene = useCallback((nextScene: number) => {
    const total = SERVICES_CONTENT.length;
    const normalized = ((nextScene % total) + total) % total;
    setSceneIndex(normalized);
    setStepIndex(0);
  }, []);

  const applyHorizontalDelta = useCallback(
    (delta: number) => {
      if (delta === 0) return;
      changeScene(sceneIndex + delta);
    },
    [changeScene, sceneIndex],
  );

  const onWheel = useCallback(
    (event: WheelEvent<HTMLElement>) => {
      if (viewportMode === 'mobile') return;
      if (Math.abs(event.deltaY) < 18) return;
      const delta = event.deltaY > 0 ? 1 : -1;
      const nextStep = stepIndex + delta;
      if (nextStep < 0 || nextStep >= STEP_COUNT) {
        return;
      }
      event.preventDefault();
      if (wheelLockRef.current) return;
      wheelLockRef.current = true;
      window.setTimeout(() => {
        wheelLockRef.current = false;
      }, WHEEL_LOCK_MS);
      changeStep(nextStep);
    },
    [changeStep, stepIndex, viewportMode],
  );

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      if (target) {
        const tag = target.tagName.toLowerCase();
        if (['input', 'textarea', 'select', 'button'].includes(tag) || target.isContentEditable) {
          return;
        }
      }

      if (event.key === 'ArrowUp') {
        event.preventDefault();
        changeStep(stepIndex - 1);
        return;
      }
      if (event.key === 'ArrowDown') {
        event.preventDefault();
        changeStep(stepIndex + 1);
        return;
      }
      if (event.key === 'ArrowLeft') {
        event.preventDefault();
        applyHorizontalDelta(isRtl ? 1 : -1);
        return;
      }
      if (event.key === 'ArrowRight') {
        event.preventDefault();
        applyHorizontalDelta(isRtl ? -1 : 1);
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [applyHorizontalDelta, changeStep, isRtl, stepIndex]);

  const handlePointerMove = useCallback(
    (event: PointerEvent<HTMLElement>) => {
      if (reducedMotion || viewportMode !== 'desktop') return;
      const stage = stageRef.current;
      if (!stage) return;
      const rect = stage.getBoundingClientRect();
      const nx = (event.clientX - rect.left) / rect.width - 0.5;
      const ny = (event.clientY - rect.top) / rect.height - 0.5;
      const nextMouse = { x: nx * 28, y: ny * 24 };
      if (rafRef.current !== null) return;
      rafRef.current = window.requestAnimationFrame(() => {
        setMouse(nextMouse);
        rafRef.current = null;
      });
    },
    [reducedMotion, viewportMode],
  );

  useEffect(
    () => () => {
      if (rafRef.current !== null) {
        window.cancelAnimationFrame(rafRef.current);
      }
    },
    [],
  );

  const handlePointerDown = useCallback((event: PointerEvent<HTMLElement>) => {
    const target = event.target as HTMLElement;
    if (target.closest('button,a,input,textarea,select,label')) {
      pointerStartRef.current = null;
      return;
    }
    pointerStartRef.current = { x: event.clientX, y: event.clientY, t: Date.now() };
  }, []);

  const handlePointerUp = useCallback(
    (event: PointerEvent<HTMLElement>) => {
      const start = pointerStartRef.current;
      pointerStartRef.current = null;
      if (!start) return;

      const elapsed = Date.now() - start.t;
      if (elapsed > 900) return;

      const dx = event.clientX - start.x;
      const dy = event.clientY - start.y;
      if (Math.abs(dx) < SWIPE_THRESHOLD && Math.abs(dy) < SWIPE_THRESHOLD) return;

      if (Math.abs(dx) > Math.abs(dy)) {
        const normalized = isRtl ? -dx : dx;
        applyHorizontalDelta(normalized > 0 ? -1 : 1);
        return;
      }
      changeStep(stepIndex + (dy > 0 ? -1 : 1));
    },
    [applyHorizontalDelta, changeStep, isRtl, stepIndex],
  );

  const isDark = resolvedTheme === 'dark';
  const textTone = sceneLuminanceModel(progress, isDark);
  const isCompact = viewportMode !== 'desktop';
  const activeStepKey = `${activeScene.id}-${activeStep.id}-${stepIndex}`;

  return (
    <section
      ref={stageRef}
      className="relative isolate min-h-[100svh] overflow-hidden"
      onWheel={onWheel}
      onPointerMove={handlePointerMove}
      onPointerLeave={() => setMouse({ x: 0, y: 0 })}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      aria-label={pickText(activeScene.title, locale)}
    >
      <ParallaxBackground
        preset={activeScene.scenePreset}
        progress={progress}
        mouseX={mouse.x}
        mouseY={mouse.y}
        reducedMotion={reducedMotion}
        isDark={isDark}
        isCompact={isCompact}
      />

      <div className="relative mx-auto flex min-h-[100svh] w-full max-w-[1440px] flex-col px-4 py-5 md:px-6 lg:px-8 lg:py-8">
        <div className="glass-card rounded-3xl border border-border/70 px-4 py-4 md:px-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="min-w-0 flex-1">
              <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">{texts.axisScene}</p>
              <SceneCarousel
                items={SERVICES_CONTENT.map((service) => ({
                  id: service.id,
                  label: pickText(service.title, locale),
                }))}
                activeIndex={sceneIndex}
                onChange={changeScene}
                isRtl={isRtl}
                labels={{ previous: texts.scenePrev, next: texts.sceneNext }}
                className="mt-2"
              />
            </div>

            <div className="flex flex-col items-start gap-2 lg:items-end">
              <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">{texts.axisStep}</p>
              <StepPager
                stepIndex={stepIndex}
                total={STEP_COUNT}
                onStepChange={changeStep}
                labels={{ up: texts.stepUp, down: texts.stepDown, step: texts.stepAria }}
              />
            </div>
          </div>
          <p className="mt-4 text-xs text-muted-foreground">
            {viewportMode === 'mobile' ? texts.hintTouch : texts.hintDesktop}
          </p>
        </div>

        <div
          className={cn(
            'mt-5 grid min-h-0 flex-1 gap-4 pb-3 lg:gap-5',
            isRtl ? 'lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]' : 'lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]',
          )}
        >
          <AdaptiveTextColor
            tone={textTone}
            className={cn(
              'min-h-[320px] max-h-[62svh] overflow-auto rounded-3xl border border-border/70 md:max-h-none md:overflow-hidden',
              'flex flex-col justify-between p-5 md:p-7',
              isRtl ? 'lg:order-2' : 'lg:order-1',
              isRtl ? 'text-right' : 'text-left',
            )}
          >
            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">{activeStep.label}</p>
              <h1 className="mt-3 text-balance text-2xl font-semibold leading-tight md:text-4xl">
                <ScrambledText
                  text={activeStep.headline}
                  locale={locale}
                  activeKey={activeStepKey}
                />
              </h1>
              <p className="mt-4 text-base leading-relaxed md:text-lg">
                <ShinyText active={!reducedMotion}>{activeStep.subline}</ShinyText>
              </p>
            </div>

            <div className="mt-5 min-h-[180px]">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeStepKey}
                  initial={reducedMotion ? { opacity: 1 } : { opacity: 0, y: 22 }}
                  animate={reducedMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
                  exit={reducedMotion ? { opacity: 1 } : { opacity: 0, y: -16 }}
                  transition={{ duration: reducedMotion ? 0 : 0.38, ease: 'easeOut' }}
                  className="space-y-4"
                >
                  {activeStep.bullets ? (
                    <ul className="space-y-2">
                      {activeStep.bullets.map((item) => (
                        <li
                          key={item}
                          className={cn(
                            'flex items-start gap-2 text-sm md:text-base',
                            isRtl && 'flex-row-reverse',
                          )}
                        >
                          <span className="mt-2 h-1.5 w-1.5 rounded-full bg-primary" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  ) : null}

                  {activeStep.process ? (
                    <ol className="space-y-3">
                      {activeStep.process.map((item, index) => (
                        <li
                          key={item}
                          className={cn(
                            'flex items-start gap-3',
                            isRtl && 'flex-row-reverse',
                          )}
                        >
                          <span className="inline-flex h-6 w-6 flex-none items-center justify-center rounded-full border border-border/80 bg-card/50 text-xs">
                            {index + 1}
                          </span>
                          <span className="pt-0.5 text-sm md:text-base">{item}</span>
                        </li>
                      ))}
                    </ol>
                  ) : null}

                  {activeStep.caption ? (
                    <p className="text-sm text-muted-foreground">{activeStep.caption}</p>
                  ) : null}

                  {(activeStep.ctaPrimary || activeStep.ctaSecondary) ? (
                    <div
                      className={cn(
                        'flex flex-wrap items-center gap-2 pt-2',
                        isRtl ? 'justify-end' : 'justify-start',
                      )}
                    >
                      {activeStep.ctaPrimary ? (
                        <Link
                          href={activeStep.ctaPrimary.href}
                          className="inline-flex h-10 items-center rounded-full bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
                        >
                          {activeStep.ctaPrimary.label || texts.startLabel}
                        </Link>
                      ) : null}
                      {activeStep.ctaSecondary ? (
                        <Link
                          href={activeStep.ctaSecondary.href}
                          className="inline-flex h-10 items-center rounded-full border border-border/80 bg-card/55 px-4 text-sm font-medium text-foreground transition-colors hover:bg-card/75"
                        >
                          {activeStep.ctaSecondary.label}
                        </Link>
                      ) : null}
                    </div>
                  ) : null}
                </motion.div>
              </AnimatePresence>
            </div>
          </AdaptiveTextColor>

          <motion.div
            className={cn(
              'glass-card relative min-h-[320px] overflow-hidden rounded-3xl border border-border/70 p-4 md:p-6',
              isRtl ? 'lg:order-1' : 'lg:order-2',
              isRtl ? 'text-right' : 'text-left',
            )}
            initial={false}
            animate={{
              scale: reducedMotion ? 1 : 1 + progress * 0.015,
              rotateX: reducedMotion ? 0 : mouse.y * -0.08,
              rotateY: reducedMotion ? 0 : mouse.x * 0.07,
            }}
            transition={{ type: 'spring', stiffness: 120, damping: 24 }}
          >
            <div className="absolute inset-0 bg-[radial-gradient(120%_120%_at_0%_0%,rgba(255,255,255,0.22)_0%,transparent_58%)] dark:bg-[radial-gradient(120%_120%_at_0%_0%,rgba(159,195,255,0.16)_0%,transparent_58%)]" />

            <div className="relative z-10 flex h-full flex-col">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-medium text-foreground">{pickText(activeScene.title, locale)}</h2>
                <span className="rounded-full border border-border/70 bg-card/60 px-2.5 py-1 text-xs text-muted-foreground">
                  {stepIndex + 1}/{STEP_COUNT}
                </span>
              </div>

              <div className="mt-4 grid flex-1 gap-3 md:gap-4">
                {steps.map((step, index) => {
                  const isActive = index === stepIndex;
                  return (
                    <motion.button
                      key={step.id}
                      type="button"
                      onClick={() => changeStep(index)}
                      className={cn(
                        'rounded-2xl border p-3 text-start transition-colors',
                        isActive
                          ? 'border-primary/65 bg-primary/12 text-foreground'
                          : 'border-border/70 bg-card/45 text-muted-foreground hover:bg-card/65',
                      )}
                      animate={{
                        opacity: isActive ? 1 : 0.72,
                        scale: isActive ? 1.01 : 1,
                        y: reducedMotion ? 0 : (index - stepIndex) * 2.5,
                      }}
                      transition={{ duration: reducedMotion ? 0 : 0.24, ease: 'easeOut' }}
                    >
                      <p className="text-xs uppercase tracking-[0.14em]">{step.label}</p>
                      <p className="mt-1 line-clamp-2 text-sm font-medium text-foreground">{step.headline}</p>
                    </motion.button>
                  );
                })}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

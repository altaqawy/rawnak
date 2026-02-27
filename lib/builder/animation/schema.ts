import { z } from 'zod';
import {
  ANIMATION_EASINGS,
  ANIMATION_ENGINES,
  ANIMATION_PRESET_IDS,
  ANIMATION_TRIGGERS,
  type AnimationEngine,
  type AnimationPreset,
  type BuilderBlock,
  type BuilderBlockAnimation,
  type BuilderBlockType,
} from '@/lib/builder/types';
import {
  getAnimationPresetDefinition,
  isPresetAllowedForEngine,
  isTriggerSupportedForPreset,
} from '@/lib/builder/animation/presets';

const engineSchema = z.enum(ANIMATION_ENGINES);
const presetSchema = z.enum(ANIMATION_PRESET_IDS);
const triggerSchema = z.enum(ANIMATION_TRIGGERS);
const easingSchema = z.enum(ANIMATION_EASINGS);

const lottieSettingsSchema = z.object({
  mediaId: z.string().nullable(),
  loop: z.boolean(),
  autoplay: z.boolean(),
  speed: z.number().min(0.25).max(3),
});

export const blockAnimationSchema = z
  .object({
    enabled: z.boolean(),
    engine: engineSchema,
    preset: presetSchema,
    trigger: triggerSchema,
    durationMs: z.number().min(0).max(10_000),
    delayMs: z.number().min(0).max(10_000),
    easing: easingSchema,
    once: z.boolean(),
    viewportAmount: z.number().min(0).max(1),
    staggerMs: z.number().min(0).max(4_000).nullable(),
    hoverScale: z.number().min(0.5).max(2).nullable(),
    parallaxStrength: z.number().min(0).max(200).nullable(),
    lottie: lottieSettingsSchema.nullable(),
  })
  .superRefine((value, ctx) => {
    if (!isPresetAllowedForEngine(value.engine, value.preset)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Animation preset does not match selected engine.',
        path: ['preset'],
      });
    }

    if (!isTriggerSupportedForPreset(value.preset, value.trigger)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Animation trigger is not supported for this preset.',
        path: ['trigger'],
      });
    }

    if (value.engine === 'lottie') {
      if (!value.lottie) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Lottie settings are required when engine is lottie.',
          path: ['lottie'],
        });
      }
      if (value.preset !== 'none') {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Lottie engine requires preset "none".',
          path: ['preset'],
        });
      }
    }

    if (value.preset === 'staggerChildren' && value.staggerMs == null) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'staggerMs is required for staggerChildren.',
        path: ['staggerMs'],
      });
    }

    if (value.preset === 'hoverScale' && value.hoverScale == null) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'hoverScale is required for hoverScale preset.',
        path: ['hoverScale'],
      });
    }

    if (value.preset === 'parallaxOnScroll' && value.parallaxStrength == null) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'parallaxStrength is required for parallaxOnScroll preset.',
        path: ['parallaxStrength'],
      });
    }
  });

function clampNumber(value: unknown, min: number, max: number, fallback: number) {
  if (typeof value !== 'number' || Number.isNaN(value)) return fallback;
  return Math.min(max, Math.max(min, value));
}

function mapLegacyTrigger(value: unknown): BuilderBlockAnimation['trigger'] {
  if (value === 'onScroll') return 'onView';
  if (value === 'onHover') return 'hover';
  if (value === 'manual' || value === 'onLoad' || value === 'onView' || value === 'hover') {
    return value;
  }
  return 'onView';
}

function mapLegacyPreset(value: unknown): AnimationPreset {
  if (typeof value !== 'string') return 'none';
  if (value === 'parallax') return 'parallaxOnScroll';
  if (ANIMATION_PRESET_IDS.includes(value as AnimationPreset)) {
    return value as AnimationPreset;
  }
  return 'none';
}

function inferEngine(
  preset: AnimationPreset,
  rawEngine: unknown,
  blockType: BuilderBlockType,
): AnimationEngine {
  if (
    rawEngine === 'none' ||
    rawEngine === 'framer' ||
    rawEngine === 'lottie' ||
    rawEngine === 'anime'
  ) {
    return rawEngine;
  }
  if (blockType === 'lottie') return 'lottie';
  const presetDefinition = getAnimationPresetDefinition(preset);
  if (presetDefinition) return presetDefinition.engine;
  return preset === 'none' ? 'none' : 'framer';
}

export function defaultBlockAnimation(type: BuilderBlockType): BuilderBlockAnimation {
  if (type === 'lottie') {
    return {
      enabled: true,
      engine: 'lottie',
      preset: 'none',
      trigger: 'onLoad',
      durationMs: 0,
      delayMs: 0,
      easing: 'linear',
      once: true,
      viewportAmount: 0.2,
      staggerMs: null,
      hoverScale: null,
      parallaxStrength: null,
      lottie: {
        mediaId: null,
        loop: true,
        autoplay: true,
        speed: 1,
      },
    };
  }

  return {
    enabled: false,
    engine: 'none',
    preset: 'none',
    trigger: 'onView',
    durationMs: 450,
    delayMs: 0,
    easing: 'easeOut',
    once: true,
    viewportAmount: 0.2,
    staggerMs: null,
    hoverScale: null,
    parallaxStrength: null,
    lottie: null,
  };
}

export function normalizeBlockAnimation(
  input: unknown,
  blockType: BuilderBlockType,
): BuilderBlockAnimation {
  const fallback = defaultBlockAnimation(blockType);
  const raw = (typeof input === 'object' && input ? input : {}) as Record<string, unknown>;
  const preset = mapLegacyPreset(raw.preset);
  const engine = inferEngine(preset, raw.engine, blockType);

  const candidate: BuilderBlockAnimation = {
    enabled:
      typeof raw.enabled === 'boolean'
        ? raw.enabled
        : preset !== 'none' || engine === 'lottie' || blockType === 'lottie',
    engine,
    preset: engine === 'lottie' ? 'none' : preset,
    trigger: mapLegacyTrigger(raw.trigger),
    durationMs:
      typeof raw.durationMs === 'number'
        ? clampNumber(raw.durationMs, 0, 10_000, fallback.durationMs)
        : clampNumber(
            typeof raw.duration === 'number' ? raw.duration * 1000 : undefined,
            0,
            10_000,
            fallback.durationMs,
          ),
    delayMs:
      typeof raw.delayMs === 'number'
        ? clampNumber(raw.delayMs, 0, 10_000, fallback.delayMs)
        : clampNumber(
            typeof raw.delay === 'number' ? raw.delay * 1000 : undefined,
            0,
            10_000,
            fallback.delayMs,
          ),
    easing:
      raw.easing === 'linear' ||
      raw.easing === 'easeOut' ||
      raw.easing === 'easeInOut' ||
      raw.easing === 'spring' ||
      raw.easing === 'cubicBezier'
        ? raw.easing
        : fallback.easing,
    once:
      typeof raw.once === 'boolean'
        ? raw.once
        : typeof raw.repeat === 'boolean'
          ? !raw.repeat
          : fallback.once,
    viewportAmount: clampNumber(raw.viewportAmount, 0, 1, fallback.viewportAmount),
    staggerMs:
      raw.staggerMs == null
        ? fallback.staggerMs
        : clampNumber(raw.staggerMs, 0, 4_000, fallback.staggerMs ?? 0),
    hoverScale:
      raw.hoverScale == null
        ? fallback.hoverScale
        : clampNumber(raw.hoverScale, 0.5, 2, fallback.hoverScale ?? 1.03),
    parallaxStrength:
      raw.parallaxStrength == null
        ? fallback.parallaxStrength
        : clampNumber(raw.parallaxStrength, 0, 200, fallback.parallaxStrength ?? 14),
    lottie:
      blockType === 'lottie' || engine === 'lottie'
        ? {
            mediaId:
              raw.lottie && typeof raw.lottie === 'object' && raw.lottie
                ? typeof (raw.lottie as Record<string, unknown>).mediaId === 'string'
                  ? ((raw.lottie as Record<string, unknown>).mediaId as string)
                  : null
                : null,
            loop:
              raw.lottie && typeof raw.lottie === 'object' && raw.lottie
                ? Boolean((raw.lottie as Record<string, unknown>).loop ?? true)
                : true,
            autoplay:
              raw.lottie && typeof raw.lottie === 'object' && raw.lottie
                ? Boolean((raw.lottie as Record<string, unknown>).autoplay ?? true)
                : true,
            speed:
              raw.lottie && typeof raw.lottie === 'object' && raw.lottie
                ? clampNumber((raw.lottie as Record<string, unknown>).speed, 0.25, 3, 1)
                : 1,
          }
        : null,
  };

  const parsed = blockAnimationSchema.safeParse(candidate);
  if (!parsed.success) return fallback;
  return parsed.data;
}

export function patchBlockAnimation(
  current: BuilderBlock['animation'],
  patch: Partial<BuilderBlock['animation']>,
  blockType: BuilderBlockType,
) {
  return normalizeBlockAnimation({ ...current, ...patch }, blockType);
}

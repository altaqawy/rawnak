import type {
  AnimationEngine,
  AnimationPreset,
  AnimationTrigger,
  BuilderBlockAnimation,
} from '@/lib/builder/types';

export type AnimationPresetDefinition = {
  id: Exclude<AnimationPreset, 'none'>;
  engine: Exclude<AnimationEngine, 'none' | 'lottie'>;
  labelKey: string;
  supportedTriggers: AnimationTrigger[];
  defaults: Partial<BuilderBlockAnimation>;
};

export const ANIMATION_PRESET_REGISTRY: readonly AnimationPresetDefinition[] = [
  {
    id: 'fadeIn',
    engine: 'framer',
    labelKey: 'ownerBuilder.animation.fadeIn',
    supportedTriggers: ['onView', 'onLoad', 'manual', 'hover'],
    defaults: { durationMs: 450, easing: 'easeOut' },
  },
  {
    id: 'slideUp',
    engine: 'framer',
    labelKey: 'ownerBuilder.animation.slideUp',
    supportedTriggers: ['onView', 'onLoad', 'manual', 'hover'],
    defaults: { durationMs: 500, easing: 'easeOut' },
  },
  {
    id: 'slideDown',
    engine: 'framer',
    labelKey: 'ownerBuilder.animation.slideDown',
    supportedTriggers: ['onView', 'onLoad', 'manual', 'hover'],
    defaults: { durationMs: 500, easing: 'easeOut' },
  },
  {
    id: 'slideLeft',
    engine: 'framer',
    labelKey: 'ownerBuilder.animation.slideLeft',
    supportedTriggers: ['onView', 'onLoad', 'manual', 'hover'],
    defaults: { durationMs: 500, easing: 'easeOut' },
  },
  {
    id: 'slideRight',
    engine: 'framer',
    labelKey: 'ownerBuilder.animation.slideRight',
    supportedTriggers: ['onView', 'onLoad', 'manual', 'hover'],
    defaults: { durationMs: 500, easing: 'easeOut' },
  },
  {
    id: 'scaleIn',
    engine: 'framer',
    labelKey: 'ownerBuilder.animation.scaleIn',
    supportedTriggers: ['onView', 'onLoad', 'manual', 'hover'],
    defaults: { durationMs: 420, easing: 'easeOut' },
  },
  {
    id: 'staggerChildren',
    engine: 'framer',
    labelKey: 'ownerBuilder.animation.staggerChildren',
    supportedTriggers: ['onView', 'onLoad', 'manual'],
    defaults: { durationMs: 350, staggerMs: 90, easing: 'easeOut' },
  },
  {
    id: 'hoverLift',
    engine: 'framer',
    labelKey: 'ownerBuilder.animation.hoverLift',
    supportedTriggers: ['hover', 'onView', 'onLoad', 'manual'],
    defaults: { durationMs: 260, easing: 'easeOut' },
  },
  {
    id: 'hoverScale',
    engine: 'framer',
    labelKey: 'ownerBuilder.animation.hoverScale',
    supportedTriggers: ['hover'],
    defaults: { durationMs: 220, hoverScale: 1.03, easing: 'easeOut' },
  },
  {
    id: 'parallaxOnScroll',
    engine: 'framer',
    labelKey: 'ownerBuilder.animation.parallaxOnScroll',
    supportedTriggers: ['onView', 'manual'],
    defaults: { durationMs: 600, parallaxStrength: 14, easing: 'easeOut' },
  },
  {
    id: 'animeFade',
    engine: 'anime',
    labelKey: 'ownerBuilder.animation.animeFade',
    supportedTriggers: ['onView', 'onLoad', 'manual', 'hover'],
    defaults: { durationMs: 420, easing: 'easeOut' },
  },
  {
    id: 'animeSlideUp',
    engine: 'anime',
    labelKey: 'ownerBuilder.animation.animeSlideUp',
    supportedTriggers: ['onView', 'onLoad', 'manual', 'hover'],
    defaults: { durationMs: 500, easing: 'easeOut' },
  },
] as const;

const PRESET_INDEX = new Map<AnimationPreset, AnimationPresetDefinition>(
  ANIMATION_PRESET_REGISTRY.map((preset) => [preset.id, preset]),
);

export function getAnimationPresetDefinition(presetId: AnimationPreset) {
  return PRESET_INDEX.get(presetId);
}

export function listAnimationPresetsByEngine(engine: AnimationEngine) {
  return ANIMATION_PRESET_REGISTRY.filter((preset) => preset.engine === engine);
}

export function isPresetAllowedForEngine(engine: AnimationEngine, preset: AnimationPreset) {
  if (preset === 'none') return true;
  const presetDefinition = getAnimationPresetDefinition(preset);
  if (!presetDefinition) return false;
  return presetDefinition.engine === engine;
}

export function isTriggerSupportedForPreset(
  preset: AnimationPreset,
  trigger: AnimationTrigger,
) {
  if (preset === 'none') return true;
  const presetDefinition = getAnimationPresetDefinition(preset);
  if (!presetDefinition) return false;
  return presetDefinition.supportedTriggers.includes(trigger);
}

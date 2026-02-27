import type { RefObject } from 'react';
import type { MotionProps } from 'framer-motion';
import type {
  AnimationEasing,
  AnimationPreset,
  BuilderBlockAnimation,
} from '@/lib/builder/types';

type AnimationRuntimeOptions = {
  animationsEnabled: boolean;
  reducedMotion: boolean;
  previewMode: boolean;
  replayToken: number;
  viewportRoot?: RefObject<HTMLElement | null>;
};

function mapFramerEase(easing: AnimationEasing): MotionProps['transition'] {
  switch (easing) {
    case 'linear':
      return { ease: 'linear' };
    case 'easeInOut':
      return { ease: 'easeInOut' };
    case 'spring':
      return { type: 'spring', stiffness: 190, damping: 22 };
    case 'cubicBezier':
      return { ease: [0.22, 1, 0.36, 1] };
    case 'easeOut':
    default:
      return { ease: 'easeOut' };
  }
}

export function isAnimationDisabled(
  config: BuilderBlockAnimation,
  options: Pick<AnimationRuntimeOptions, 'animationsEnabled' | 'reducedMotion'>,
) {
  if (!config.enabled) return true;
  if (config.engine === 'none') return true;
  if (options.reducedMotion || !options.animationsEnabled) return true;
  return false;
}

function getFramerStates(config: BuilderBlockAnimation) {
  switch (config.preset) {
    case 'fadeIn':
      return { hidden: { opacity: 0 }, visible: { opacity: 1 } };
    case 'slideUp':
      return { hidden: { opacity: 0, y: 28 }, visible: { opacity: 1, y: 0 } };
    case 'slideDown':
      return { hidden: { opacity: 0, y: -28 }, visible: { opacity: 1, y: 0 } };
    case 'slideLeft':
      return { hidden: { opacity: 0, x: 28 }, visible: { opacity: 1, x: 0 } };
    case 'slideRight':
      return { hidden: { opacity: 0, x: -28 }, visible: { opacity: 1, x: 0 } };
    case 'scaleIn':
      return { hidden: { opacity: 0, scale: 0.96 }, visible: { opacity: 1, scale: 1 } };
    case 'parallaxOnScroll':
      return { hidden: { opacity: 0, y: Number(config.parallaxStrength ?? 14) }, visible: { opacity: 1, y: 0 } };
    case 'staggerChildren':
    case 'hoverLift':
    case 'hoverScale':
      return { hidden: { opacity: 0 }, visible: { opacity: 1 } };
    default:
      return { hidden: {}, visible: {} };
  }
}

export function buildFramerMotionProps(
  config: BuilderBlockAnimation,
  options: AnimationRuntimeOptions,
): MotionProps {
  if (isAnimationDisabled(config, options)) {
    return {};
  }

  if (config.engine !== 'framer') {
    return {};
  }

  const states = getFramerStates(config);
  const transition: MotionProps['transition'] = {
    duration: Math.max(0, config.durationMs) / 1000,
    delay: Math.max(0, config.delayMs) / 1000,
    ...(mapFramerEase(config.easing) ?? {}),
    ...(config.preset === 'staggerChildren' && config.staggerMs != null
      ? { staggerChildren: config.staggerMs / 1000 }
      : {}),
  };

  if (config.trigger === 'hover') {
    if (config.preset === 'hoverLift') {
      return {
        whileHover: { y: -6, boxShadow: '0 20px 40px -24px rgba(0,0,0,0.35)' },
        transition,
      };
    }
    if (config.preset === 'hoverScale') {
      return {
        whileHover: { scale: config.hoverScale ?? 1.03 },
        transition,
      };
    }
    return { whileHover: { opacity: 0.92 }, transition };
  }

  if (config.trigger === 'manual') {
    if (options.previewMode && options.replayToken === 0) {
      return {};
    }
    return {
      initial: states.hidden,
      animate: states.visible,
      transition,
    };
  }

  if (config.trigger === 'onLoad') {
    return {
      initial: states.hidden,
      animate: states.visible,
      transition,
    };
  }

  return {
    initial: states.hidden,
    whileInView: states.visible,
    transition,
    viewport: {
      once: config.once,
      amount: config.viewportAmount,
      root: options.viewportRoot ?? undefined,
    },
  };
}

function mapAnimeEasing(easing: AnimationEasing) {
  switch (easing) {
    case 'linear':
      return 'linear';
    case 'easeInOut':
      return 'easeInOutQuad';
    case 'spring':
      return 'spring(1, 80, 10, 0)';
    case 'cubicBezier':
      return 'cubicBezier(.22,1,.36,1)';
    case 'easeOut':
    default:
      return 'easeOutQuad';
  }
}

export async function runAnimePresetAnimation(
  element: HTMLElement,
  config: BuilderBlockAnimation,
) {
  if (config.engine !== 'anime') return null;
  const animeModule = await import('animejs/lib/anime.es.js');
  const anime = animeModule.default;

  const common = {
    targets: element,
    duration: Math.max(0, config.durationMs),
    delay: Math.max(0, config.delayMs),
    easing: mapAnimeEasing(config.easing),
    autoplay: true,
  };

  if (config.preset === 'animeSlideUp') {
    return anime({
      ...common,
      opacity: [0, 1],
      translateY: [24, 0],
    });
  }

  return anime({
    ...common,
    opacity: [0, 1],
  });
}

export function shouldAutoRunAnime(
  config: BuilderBlockAnimation,
  options: Pick<AnimationRuntimeOptions, 'previewMode' | 'replayToken'>,
) {
  if (config.trigger === 'manual') {
    return !options.previewMode || options.replayToken > 0;
  }
  return true;
}

export function needsAnimeEngine(config: BuilderBlockAnimation, preset: AnimationPreset) {
  return config.engine === 'anime' && (preset === 'animeFade' || preset === 'animeSlideUp');
}

'use client';

import type { CSSProperties } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import type { ServiceScenePreset } from '@/components/services/services-content';

type ParallaxBackgroundProps = {
  preset: ServiceScenePreset;
  progress: number;
  mouseX: number;
  mouseY: number;
  reducedMotion: boolean;
  isDark: boolean;
  isCompact: boolean;
  className?: string;
};

function clampProgress(value: number) {
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, Math.min(1, value));
}

export function sceneLuminanceModel(progressInput: number, isDark: boolean) {
  const progress = clampProgress(progressInput);
  if (isDark) {
    return 0.08 + progress * 0.18;
  }
  return 0.84 - progress * 0.14;
}

export function ParallaxBackground({
  preset,
  progress: progressInput,
  mouseX,
  mouseY,
  reducedMotion,
  isDark,
  isCompact,
  className,
}: ParallaxBackgroundProps) {
  const progress = clampProgress(progressInput);
  const motionScale = reducedMotion || isCompact ? 0 : 1;
  const x = mouseX * motionScale;
  const y = mouseY * motionScale;
  const stepOffset = reducedMotion ? 0 : progress;

  const spring = reducedMotion
    ? { duration: 0 }
    : { type: 'spring' as const, stiffness: 120, damping: 28, mass: 0.6 };
  const springSoft = reducedMotion
    ? { duration: 0 }
    : { type: 'spring' as const, stiffness: 110, damping: 26, mass: 0.68 };
  const springAccent = reducedMotion
    ? { duration: 0 }
    : { type: 'spring' as const, stiffness: 130, damping: 30, mass: 0.62 };
  const springGlow = reducedMotion
    ? { duration: 0 }
    : { type: 'spring' as const, stiffness: 118, damping: 27, mass: 0.7 };
  const springNoise = reducedMotion
    ? { duration: 0 }
    : { type: 'spring' as const, stiffness: 100, damping: 24, mass: 0.72 };

  const colorOpacity = isDark ? 0.16 + progress * 0.5 : 0.08 + progress * 0.3;
  const colorSaturation = isDark ? 0.82 + progress * 0.4 : 0.64 + progress * 0.24;
  const accentContrast = isDark ? 0.88 + progress * 0.24 : 0.64 + progress * 0.18;
  const lightIntensity = isDark ? 0.1 + progress * 0.2 : 0.24 + progress * 0.28;

  return (
    <div
      className={cn('pointer-events-none absolute inset-0 overflow-hidden', className)}
      style={
        {
          ['--scene-color-opacity' as string]: String(colorOpacity),
          ['--scene-saturation' as string]: String(colorSaturation),
          ['--scene-contrast' as string]: String(accentContrast),
          ['--scene-light' as string]: String(lightIntensity),
        } as CSSProperties
      }
    >
      <motion.div
        className="absolute inset-0"
        animate={{
          transform: `translate3d(${x * -1.4}px, ${y * -1.1}px, 0) scale(1.02)`,
          filter: `saturate(var(--scene-saturation)) contrast(var(--scene-contrast))`,
          background: isDark ? preset.darkBase : preset.lightBase,
        }}
        transition={spring}
      />

      <motion.div
        className="absolute -inset-[14%]"
        animate={{
          transform: `translate3d(${x * 1.7}px, ${y * 1.2}px, 0)`,
          opacity: 'var(--scene-color-opacity)',
          background: `radial-gradient(120% 95% at 22% 20%, ${isDark ? preset.spotlight : preset.lightOverlay} 0%, transparent 62%)`,
        }}
        transition={springSoft}
      />

      <motion.div
        className="absolute -inset-[18%]"
        animate={{
          transform: `translate3d(${x * -1.2}px, ${y * 1.8 - stepOffset * 18}px, 0)`,
          opacity: isDark ? 0.28 + progress * 0.26 : 0.22 + progress * 0.2,
          background: `linear-gradient(112deg, transparent 16%, ${isDark ? preset.darkOverlay : preset.lightOverlay} 40%, transparent 68%)`,
        }}
        transition={springAccent}
      />

      {!isCompact ? (
        <>
          <motion.div
            className="absolute -inset-[10%]"
            animate={{
              transform: `translate3d(${x * 0.7}px, ${y * 0.6 + stepOffset * 14}px, 0)`,
              opacity: isDark ? 0.24 + progress * 0.22 : 0.18 + progress * 0.2,
              background: `linear-gradient(118deg, transparent 26%, ${preset.streak} 48%, transparent 72%)`,
            }}
            transition={springGlow}
          />

          <motion.div
            className="absolute inset-0"
            animate={{
              opacity: isDark ? 0.4 + progress * 0.24 : 0.22 + progress * 0.16,
              background: `radial-gradient(110% 90% at 80% 16%, ${preset.accent}33 0%, transparent 60%)`,
              transform: `translate3d(${x * -0.35}px, ${y * -0.35}px, 0)`,
            }}
            transition={springNoise}
          />
        </>
      ) : null}

      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(circle at 50% 50%, transparent 58%, rgba(0,0,0,0.32) 100%)',
          opacity: isDark ? 0.7 : 0.45,
        }}
      />

      <div
        className="absolute inset-0"
        style={{
          opacity: isDark ? 0.06 : 0.04,
          backgroundImage:
            'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.4) 0.5px, transparent 0.6px)',
          backgroundSize: '3px 3px',
        }}
      />
    </div>
  );
}

'use client';

import { useTheme } from 'next-themes';
import { useEffect, useMemo, useRef, useState } from 'react';

type MotionState = {
  x: number;
  y: number;
  scroll: number;
};

type BackgroundEffectProps = {
  motionEnabled: boolean;
  intensityLight: number;
  intensityDark: number;
};

const INITIAL_MOTION: MotionState = { x: 0, y: 0, scroll: 0 };

function useReducedMotion() {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setReduced(media.matches);
    update();

    media.addEventListener('change', update);
    return () => media.removeEventListener('change', update);
  }, []);

  return reduced;
}

function clampIntensity(value: number) {
  if (!Number.isFinite(value)) return 1;
  return Math.min(2, Math.max(0, value));
}

export function BackgroundEffect({
  motionEnabled,
  intensityLight,
  intensityDark,
}: BackgroundEffectProps) {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const reducedMotion = useReducedMotion();
  const [motion, setMotion] = useState<MotionState>(INITIAL_MOTION);
  const rafId = useRef<number | null>(null);
  const pointerFine = useRef(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted || reducedMotion || !motionEnabled) {
      setMotion(INITIAL_MOTION);
      return;
    }

    pointerFine.current = window.matchMedia('(pointer:fine)').matches;

    const nextMotion: MotionState = { ...INITIAL_MOTION };
    const commit = () => {
      if (rafId.current !== null) return;
      rafId.current = window.requestAnimationFrame(() => {
        rafId.current = null;
        setMotion({ ...nextMotion });
      });
    };

    const onPointerMove = (event: PointerEvent) => {
      if (!pointerFine.current || event.pointerType !== 'mouse') return;
      const cx = window.innerWidth / 2;
      const cy = window.innerHeight / 2;
      nextMotion.x = ((event.clientX - cx) / cx) * 8;
      nextMotion.y = ((event.clientY - cy) / cy) * 8;
      commit();
    };

    const onScroll = () => {
      nextMotion.scroll = Math.min(window.scrollY * 0.04, 18);
      commit();
    };

    window.addEventListener('pointermove', onPointerMove, { passive: true });
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    return () => {
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('scroll', onScroll);
      if (rafId.current !== null) {
        window.cancelAnimationFrame(rafId.current);
      }
    };
  }, [mounted, motionEnabled, reducedMotion]);

  const isDark = resolvedTheme === 'dark';
  const motionOff = reducedMotion || !motionEnabled;
  const motionX = motionOff ? 0 : motion.x;
  const motionY = motionOff ? 0 : motion.y;
  const motionScroll = motionOff ? 0 : motion.scroll;
  const intensity = isDark ? clampIntensity(intensityDark) : clampIntensity(intensityLight);

  const primaryLayerStyle = useMemo(
    () => ({
      transform: `translate3d(${motionX * 1.4}px, ${motionY * 1.2 - motionScroll * 0.3}px, 0)`,
    }),
    [motionX, motionY, motionScroll],
  );

  const castLayerStyle = useMemo(
    () => ({
      transform: `translate3d(${motionX * -0.8}px, ${motionY * -0.7 - motionScroll * 0.2}px, 0)`,
    }),
    [motionX, motionY, motionScroll],
  );

  const accentLayerStyle = useMemo(
    () => ({
      transform: `translate3d(${motionX * 0.5}px, ${motionY * 0.4 + motionScroll * 0.35}px, 0)`,
    }),
    [motionX, motionY, motionScroll],
  );

  if (!mounted) return null;

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <div className="absolute inset-0 bg-[var(--bg-base)]" />

      <div
        className="absolute -inset-[18%]"
        style={{
          ...primaryLayerStyle,
          opacity: 0.55 + intensity * 0.22,
          background: isDark
            ? 'linear-gradient(115deg, rgba(255,255,255,0) 18%, rgba(0,0,0,0.5) 34%, rgba(0,0,0,0.2) 49%, rgba(255,255,255,0) 66%)'
            : 'linear-gradient(115deg, rgba(255,255,255,0) 18%, rgba(255,255,255,0.68) 34%, rgba(255,255,255,0.26) 49%, rgba(255,255,255,0) 66%)',
        }}
      />

      <div
        className="absolute inset-0"
        style={{
          ...castLayerStyle,
          opacity: 0.45 + intensity * 0.2,
          background: isDark
            ? 'radial-gradient(130% 90% at 0% 0%, rgba(0,0,0,0.42) 0%, rgba(0,0,0,0) 68%)'
            : 'radial-gradient(130% 90% at 0% 0%, rgba(14,27,42,0.14) 0%, rgba(14,27,42,0) 68%)',
        }}
      />

      <div
        className="absolute -inset-[12%]"
        style={{
          ...accentLayerStyle,
          opacity: 0.45 + intensity * 0.18,
          background: isDark
            ? 'linear-gradient(115deg, rgba(255,255,255,0) 28%, rgba(0,0,0,0.22) 43%, rgba(255,255,255,0) 60%)'
            : 'linear-gradient(115deg, rgba(255,255,255,0) 28%, rgba(255,255,255,0.33) 43%, rgba(255,255,255,0) 60%)',
        }}
      />

      <div
        className="absolute inset-0 opacity-[0.045] dark:opacity-[0.065]"
        style={{
          backgroundImage:
            'radial-gradient(circle at 1px 1px, rgba(14,27,42,0.7) 0.5px, transparent 0.55px)',
          backgroundSize: '3px 3px',
        }}
      />
    </div>
  );
}

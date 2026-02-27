'use client';

import { useEffect, useState, type CSSProperties, type ReactNode } from 'react';
import { cn } from '@/lib/utils';

type AdaptiveTextColorProps = {
  tone: number;
  className?: string;
  children: ReactNode;
};

const SWITCH_THRESHOLD = 0.54;
const HYSTERESIS = 0.08;

function clampTone(value: number) {
  if (!Number.isFinite(value)) return 0.5;
  return Math.max(0, Math.min(1, value));
}

export function AdaptiveTextColor({ tone, className, children }: AdaptiveTextColorProps) {
  const clamped = clampTone(tone);
  const [isLightText, setIsLightText] = useState(clamped < SWITCH_THRESHOLD);

  useEffect(() => {
    if (isLightText && clamped > SWITCH_THRESHOLD + HYSTERESIS) {
      setIsLightText(false);
      return;
    }
    if (!isLightText && clamped < SWITCH_THRESHOLD - HYSTERESIS) {
      setIsLightText(true);
    }
  }, [clamped, isLightText]);

  const style: CSSProperties = {
    color: isLightText ? 'rgba(239,246,255,0.98)' : 'rgba(12,20,31,0.96)',
    backgroundColor: isLightText ? 'rgba(8,12,18,0.34)' : 'rgba(255,255,255,0.58)',
    borderColor: isLightText ? 'rgba(159,195,255,0.24)' : 'rgba(14,27,42,0.14)',
    textShadow: isLightText
      ? '0 1px 1px rgba(0,0,0,0.25)'
      : '0 1px 1px rgba(255,255,255,0.16)',
  };

  return (
    <div
      className={cn(
        'rounded-2xl border px-5 py-5 backdrop-blur-md transition-[color,background-color,border-color] duration-300',
        className,
      )}
      style={style}
    >
      {children}
    </div>
  );
}

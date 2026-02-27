'use client';

import { useEffect, useMemo, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { cn } from '@/lib/utils';

type ScrambledTextProps = {
  text: string;
  locale: 'ar' | 'en';
  activeKey: string;
  className?: string;
};

const LATIN_POOL = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

function hashString(value: string) {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash +=
      (hash << 1) +
      (hash << 4) +
      (hash << 7) +
      (hash << 8) +
      (hash << 24);
  }
  return hash >>> 0;
}

function seededPick(seed: number, index: number, frame: number) {
  const value = (seed + index * 1103515245 + frame * 12345) >>> 0;
  return LATIN_POOL[value % LATIN_POOL.length] ?? LATIN_POOL[0];
}

export function ScrambledText({ text, locale, activeKey, className }: ScrambledTextProps) {
  const reducedMotion = useReducedMotion() ?? false;
  const [display, setDisplay] = useState(text);
  const isArabic = locale === 'ar';
  const cleanedText = useMemo(() => text, [text]);

  useEffect(() => {
    setDisplay(cleanedText);
    if (reducedMotion || isArabic || !cleanedText) return;

    const seed = hashString(`${activeKey}::${cleanedText}`);
    const totalFrames = 14;
    let frame = 0;
    const interval = window.setInterval(() => {
      frame += 1;
      const revealRatio = frame / totalFrames;
      const revealCount = Math.floor(cleanedText.length * revealRatio);
      const next = cleanedText
        .split('')
        .map((char, index) => {
          if (char.trim() === '') return char;
          if (index < revealCount) return cleanedText[index] ?? char;
          return seededPick(seed, index, frame);
        })
        .join('');
      setDisplay(next);

      if (frame >= totalFrames) {
        window.clearInterval(interval);
        setDisplay(cleanedText);
      }
    }, 28);

    return () => window.clearInterval(interval);
  }, [activeKey, cleanedText, isArabic, reducedMotion]);

  if (reducedMotion) {
    return (
      <motion.span
        key={activeKey}
        className={className}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
      >
        {cleanedText}
      </motion.span>
    );
  }

  return (
    <span key={activeKey} className={cn('inline-block', className)}>
      {display}
    </span>
  );
}

'use client';

import { useRef } from 'react';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

type SceneItem = {
  id: string;
  label: string;
};

type SceneCarouselProps = {
  items: SceneItem[];
  activeIndex: number;
  onChange: (index: number) => void;
  className?: string;
  isRtl: boolean;
  labels: {
    previous: string;
    next: string;
  };
};

export function SceneCarousel({
  items,
  activeIndex,
  onChange,
  className,
  isRtl,
  labels,
}: SceneCarouselProps) {
  const startRef = useRef<{ x: number; y: number } | null>(null);

  const previous = () => onChange((activeIndex - 1 + items.length) % items.length);
  const next = () => onChange((activeIndex + 1) % items.length);

  return (
    <div
      className={cn('space-y-3', className)}
      onPointerDown={(event) => {
        startRef.current = { x: event.clientX, y: event.clientY };
      }}
      onPointerUp={(event) => {
        if (!startRef.current) return;
        const dx = event.clientX - startRef.current.x;
        const dy = event.clientY - startRef.current.y;
        startRef.current = null;
        if (Math.abs(dx) < 48 || Math.abs(dx) <= Math.abs(dy)) return;
        const normalizedDx = isRtl ? -dx : dx;
        if (normalizedDx > 0) previous();
        else next();
      }}
    >
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={previous}
          aria-label={labels.previous}
          className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-border/70 bg-card/65 text-foreground"
        >
          {isRtl ? <ArrowRight className="h-4 w-4" /> : <ArrowLeft className="h-4 w-4" />}
        </button>
        <button
          type="button"
          onClick={next}
          aria-label={labels.next}
          className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-border/70 bg-card/65 text-foreground"
        >
          {isRtl ? <ArrowLeft className="h-4 w-4" /> : <ArrowRight className="h-4 w-4" />}
        </button>
      </div>

      <div className="flex flex-wrap gap-2">
        {items.map((item, index) => {
          const active = index === activeIndex;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onChange(index)}
              className={cn(
                'rounded-full border px-3 py-1.5 text-xs transition-colors',
                active
                  ? 'border-primary/70 bg-primary/15 text-foreground'
                  : 'border-border/70 bg-card/50 text-muted-foreground',
              )}
            >
              {item.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

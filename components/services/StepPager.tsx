'use client';

import { ArrowDown, ArrowUp } from 'lucide-react';
import { cn } from '@/lib/utils';

type StepPagerProps = {
  stepIndex: number;
  total: number;
  onStepChange: (next: number) => void;
  className?: string;
  labels: {
    up: string;
    down: string;
    step: string;
  };
};

export function StepPager({ stepIndex, total, onStepChange, className, labels }: StepPagerProps) {
  return (
    <div className={cn('flex items-center gap-3', className)}>
      <button
        type="button"
        onClick={() => onStepChange(Math.max(0, stepIndex - 1))}
        disabled={stepIndex === 0}
        className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-border/70 bg-card/65 text-foreground disabled:opacity-45"
        aria-label={labels.up}
      >
        <ArrowUp className="h-4 w-4" />
      </button>
      <div className="flex items-center gap-2">
        {Array.from({ length: total }).map((_, index) => {
          const active = index === stepIndex;
          return (
            <button
              key={`step-${index + 1}`}
              type="button"
              onClick={() => onStepChange(index)}
              className={cn(
                'h-2.5 w-2.5 rounded-full border transition-colors',
                active ? 'border-primary bg-primary' : 'border-border bg-card/40',
              )}
              aria-label={`${labels.step} ${index + 1}`}
            />
          );
        })}
      </div>
      <button
        type="button"
        onClick={() => onStepChange(Math.min(total - 1, stepIndex + 1))}
        disabled={stepIndex === total - 1}
        className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-border/70 bg-card/65 text-foreground disabled:opacity-45"
        aria-label={labels.down}
      >
        <ArrowDown className="h-4 w-4" />
      </button>
      <span className="text-xs text-muted-foreground">
        {stepIndex + 1}/{total}
      </span>
    </div>
  );
}

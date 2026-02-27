'use client';

import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

type ShinyTextProps = {
  children: ReactNode;
  active: boolean;
  className?: string;
};

export function ShinyText({ children, active, className }: ShinyTextProps) {
  return (
    <span className={cn('group relative inline-flex overflow-hidden', className)}>
      <span className="relative z-10">{children}</span>
      <span
        aria-hidden
        className={cn(
          'pointer-events-none absolute inset-0',
          'bg-[linear-gradient(105deg,transparent_15%,rgba(255,255,255,0.05)_35%,rgba(255,255,255,0.35)_50%,rgba(255,255,255,0.05)_65%,transparent_85%)]',
          'bg-[length:220%_100%] opacity-0 mix-blend-screen transition-opacity duration-300',
          'group-hover:opacity-100',
          active && 'animate-[services-shiny_1.4s_ease-in-out_1] opacity-100',
        )}
      />
    </span>
  );
}

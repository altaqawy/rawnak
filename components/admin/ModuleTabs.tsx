'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';

export type ModuleTabItem = {
  labelKey: string;
  href: string;
  matchPrefix?: string;
  label?: string;
};

type ModuleTabsProps = {
  tabs: ModuleTabItem[];
  namespace?: string;
  translateKeys?: boolean;
  className?: string;
};

function isTabActive(pathname: string, tab: ModuleTabItem) {
  const prefix = tab.matchPrefix ?? tab.href;
  return pathname === tab.href || pathname.startsWith(`${prefix}/`);
}

export function ModuleTabs({
  tabs,
  namespace = 'adminHub.links',
  translateKeys = true,
  className,
}: ModuleTabsProps) {
  const pathname = usePathname();
  const t = useTranslations(namespace);

  return (
    <nav
      role='tablist'
      aria-label='Module navigation tabs'
      className={cn(
        'flex flex-wrap items-center gap-2 rounded-xl border border-border/70 bg-card/45 p-2',
        className,
      )}
    >
      {tabs.map((tab) => {
        const active = isTabActive(pathname, tab);
        const label = translateKeys ? t(tab.labelKey) : (tab.label ?? tab.labelKey);

        return (
          <Link
            key={tab.href}
            href={tab.href}
            role='tab'
            aria-selected={active}
            className={cn(
              'inline-flex h-8 items-center rounded-lg border px-3 text-xs transition-colors',
              active
                ? 'border-border/80 bg-card/85 text-foreground'
                : 'border-transparent text-muted-foreground hover:border-border/70 hover:text-foreground',
            )}
          >
            {label}
          </Link>
        );
      })}
    </nav>
  );
}

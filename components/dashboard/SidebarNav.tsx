'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

type SidebarItem = {
  href: string;
  label: string;
};

type SidebarSection = {
  title: string;
  items: SidebarItem[];
};

export function SidebarNav({
  items,
  sections,
}: {
  items?: SidebarItem[];
  sections?: SidebarSection[];
}) {
  const pathname = usePathname();
  const normalizedSections: SidebarSection[] = sections ?? [{ title: '', items: items ?? [] }];

  return (
    <nav className="grid gap-4">
      {normalizedSections.map((section) => (
        <div key={section.title || section.items.map((i) => i.href).join('|')} className="grid gap-1">
          {section.title ? (
            <p className="px-3 text-start text-[11px] font-medium uppercase tracking-wide text-muted-foreground/80">
              {section.title}
            </p>
          ) : null}
          {section.items.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'rounded-lg border border-transparent px-3 py-2 text-start text-sm text-muted-foreground transition-colors hover:text-foreground',
                  isActive && 'border-border/70 bg-card/70 text-foreground',
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </div>
      ))}
    </nav>
  );
}

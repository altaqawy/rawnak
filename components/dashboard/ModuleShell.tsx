import { type ReactNode } from 'react';
import { SidebarNav } from '@/components/dashboard/SidebarNav';

type ModuleLink = {
  href: string;
  label: string;
};

type ModuleShellProps = {
  locale: string;
  title: string;
  subtitle: string;
  links: ModuleLink[];
  children: ReactNode;
};

export function ModuleShell({ locale, title, subtitle, links, children }: ModuleShellProps) {
  const isRtl = locale === 'ar';

  return (
    <div className="space-y-6">
      <header className="glass-card rounded-2xl border border-border/70 p-6">
        <h1 className="text-start text-2xl font-semibold text-foreground">{title}</h1>
        <p className="mt-2 text-start text-sm text-muted-foreground">{subtitle}</p>
      </header>

      <div
        className={
          isRtl
            ? 'grid gap-6 lg:grid-cols-[minmax(0,1fr)_240px]'
            : 'grid gap-6 lg:grid-cols-[240px_minmax(0,1fr)]'
        }
      >
        {isRtl ? (
          <>
            <div>{children}</div>
            <aside className="glass-card h-fit rounded-2xl border border-border/70 p-4">
              <SidebarNav items={links} />
            </aside>
          </>
        ) : (
          <>
            <aside className="glass-card h-fit rounded-2xl border border-border/70 p-4">
              <SidebarNav items={links} />
            </aside>
            <div>{children}</div>
          </>
        )}
      </div>
    </div>
  );
}


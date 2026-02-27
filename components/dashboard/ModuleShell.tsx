import { type ReactNode } from 'react';
import { SidebarNav } from '@/components/dashboard/SidebarNav';
import { ModuleTabs, type ModuleTabItem } from '@/components/admin/ModuleTabs';

type ModuleLink = {
  href: string;
  label: string;
  matchPrefix?: string;
};

type ModuleShellProps = {
  locale: string;
  title: string;
  subtitle: string;
  links: ModuleLink[];
  children: ReactNode;
};

const SHOW_SECONDARY_SIDEBAR_WHEN_TABS = process.env.NEXT_PUBLIC_ADMIN_SECONDARY_SIDEBAR === '1';

export function ModuleShell({ locale, title, subtitle, links, children }: ModuleShellProps) {
  const tabs: ModuleTabItem[] = links.map((link) => ({
    href: link.href,
    labelKey: link.label,
    label: link.label,
    matchPrefix: link.matchPrefix,
  }));

  return (
    <div className="space-y-6" data-locale={locale}>
      <header className="glass-card rounded-2xl border border-border/70 p-6">
        <h1 className="text-start text-2xl font-semibold text-foreground">{title}</h1>
        <p className="mt-2 text-start text-sm text-muted-foreground">{subtitle}</p>
      </header>

      <ModuleTabs tabs={tabs} translateKeys={false} />

      <div className="space-y-6">
        {SHOW_SECONDARY_SIDEBAR_WHEN_TABS ? (
          <aside className="glass-card h-fit rounded-2xl border border-border/70 p-4">
            <SidebarNav items={links} />
          </aside>
        ) : null}
        <div>{children}</div>
      </div>
    </div>
  );
}

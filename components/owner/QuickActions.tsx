/**
 * Quick Actions Component
 * Links to key modules for Owner Dashboard
 */

import Link from 'next/link';
import type { QuickAction } from '@/lib/owner-console/types';
import { PanelWrapper } from './PanelStates';

type QuickActionsProps = {
  actions: QuickAction[];
  labels: {
    title: string;
  };
};

export function QuickActions({ actions, labels }: QuickActionsProps) {
  if (actions.length === 0) {
    return null;
  }

  return (
    <PanelWrapper title={labels.title} status="ok">
      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-5">
        {actions.map((action) => (
          <Link
            key={action.id}
            href={action.href}
            className="rounded-lg border border-border/70 bg-card p-4 text-center transition-all hover:border-primary/50 hover:bg-accent"
          >
            <span className="block text-sm font-medium text-foreground">{action.label}</span>
          </Link>
        ))}
      </div>
    </PanelWrapper>
  );
}

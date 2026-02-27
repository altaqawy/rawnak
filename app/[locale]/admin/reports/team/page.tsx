import { getTranslations } from 'next-intl/server';
import { requireOwner } from '@/lib/auth/guards';
import { listAuditLog } from '@/lib/builder/repository';

type PageProps = {
  params: Promise<{ locale: string }>;
};

export default async function AdminTeamReportPage({ params }: PageProps) {
  const { locale } = await params;
  await requireOwner(locale);
  const t = await getTranslations('adminModules');
  const logs = (await listAuditLog()).slice(0, 200);

  const byAction = new Map<string, number>();
  for (const log of logs) {
    const key = log.action || 'unknown';
    byAction.set(key, (byAction.get(key) ?? 0) + 1);
  }

  return (
    <div className="space-y-6">
      <header className="glass-card rounded-2xl border border-border/70 p-6">
        <h1 className="text-start text-2xl font-semibold text-foreground">{t('reports.team')}</h1>
        <a
          href={`/api/admin/export?dataset=team`}
          className="mt-3 inline-block rounded-md border border-border/70 bg-card/70 px-3 py-1.5 text-xs text-muted-foreground"
        >
          {t('actions.exportCsv')}
        </a>
      </header>
      <section className="glass-card rounded-2xl border border-border/70 p-6">
        {logs.length === 0 ? (
          <p className="text-sm text-muted-foreground">{t('empty')}</p>
        ) : (
          <div className="space-y-2">
            {Array.from(byAction.entries()).map(([action, count]) => (
              <div key={action} className="flex items-center justify-between rounded-md border border-border/70 p-3 text-sm">
                <span className="text-foreground">{action}</span>
                <span className="text-muted-foreground">{count}</span>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

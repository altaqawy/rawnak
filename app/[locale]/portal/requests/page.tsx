import { getTranslations } from 'next-intl/server';

export default async function PortalRequestsPage() {
  const t = await getTranslations('portal');

  return (
    <div className="space-y-6">
      <header className="glass-card rounded-2xl border border-border/70 p-6">
        <h1 className="text-start text-2xl font-semibold text-foreground">{t('nav.requests')}</h1>
        <p className="mt-2 text-start text-sm text-muted-foreground">{t('requests.subtitle')}</p>
      </header>

      <section className="glass-card rounded-2xl border border-border/70 p-6">
        <p className="text-start text-sm text-muted-foreground">{t('empty.noItems')}</p>
        <p className="mt-1 text-start text-xs text-muted-foreground">{t('empty.authorizedOnly')}</p>
      </section>
    </div>
  );
}

import { getTranslations } from 'next-intl/server';
import { requireOwner } from '@/lib/auth/guards';

type PageProps = { params: Promise<{ locale: string }> };

export default async function AdminOrdersPage({ params }: PageProps) {
  const { locale } = await params;
  await requireOwner(locale);
  const t = await getTranslations('adminModules');
  return (
    <div className="space-y-6">
      <header className="glass-card rounded-2xl border border-border/70 p-6">
        <h1 className="text-start text-2xl font-semibold text-foreground">{t('operations.orders')}</h1>
      </header>
      <section className="glass-card rounded-2xl border border-border/70 p-6">
        <p className="text-sm text-muted-foreground">{t('empty')}</p>
      </section>
    </div>
  );
}

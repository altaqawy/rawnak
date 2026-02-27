import Link from 'next/link';
import { getTranslations } from 'next-intl/server';

type PageProps = {
  params: Promise<{ locale: string }>;
};

export default async function OpsModulePage({ params }: PageProps) {
  const { locale } = await params;
  const t = await getTranslations('adminHub');

  return (
    <section className="glass-card rounded-2xl border border-border/70 p-6">
      <div className="grid gap-2 sm:grid-cols-2">
        <Link href={`/${locale}/admin/ops/orders`} className="rounded-md border border-border/70 bg-card/70 px-3 py-2 text-xs text-foreground">
          {t('links.orders')}
        </Link>
        <Link href={`/${locale}/admin/ops/deliveries`} className="rounded-md border border-border/70 bg-card/70 px-3 py-2 text-xs text-foreground">
          {t('links.deliveries')}
        </Link>
      </div>
    </section>
  );
}


import Link from 'next/link';
import { getTranslations } from 'next-intl/server';

type PageProps = {
  params: Promise<{ locale: string }>;
};

export default async function ContentBuilderEntryPage({ params }: PageProps) {
  const { locale } = await params;
  const t = await getTranslations('adminHub');

  return (
    <section className="glass-card rounded-2xl border border-border/70 p-6">
      <p className="text-start text-sm text-muted-foreground">{t('builderEntry')}</p>
      <Link
        href={`/${locale}/admin/content/pages`}
        className="mt-4 inline-flex rounded-md border border-border/70 bg-card/70 px-3 py-2 text-xs text-foreground"
      >
        {t('links.pages')}
      </Link>
    </section>
  );
}


import { getTranslations } from 'next-intl/server';
import { AdminContentSection } from '@/components/dashboard/AdminContentSection';

type PageProps = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function AdminPortfolioPage({ params, searchParams }: PageProps) {
  const { locale } = await params;
  const query = await searchParams;
  const t = await getTranslations('admin.nav');

  return (
    <AdminContentSection
      locale={locale}
      collection="portfolio"
      title={t('portfolio')}
      searchParams={query}
    />
  );
}

import Link from 'next/link';

type PageProps = {
  params: Promise<{ locale: string }>;
};

export default async function SystemModulePage({ params }: PageProps) {
  const { locale } = await params;
  const isArabic = locale === 'ar';

  return (
    <section className='glass-card rounded-2xl border border-border/70 p-6'>
      <div className='grid gap-2 sm:grid-cols-2'>
        <Link
          href={`/${locale}/admin/system/access`}
          className='rounded-md border border-border/70 bg-card/70 px-3 py-2 text-xs text-foreground'
        >
          {isArabic ? 'التحكم بالوصول' : 'Access control'}
        </Link>
        <Link
          href={`/${locale}/admin/system/operations`}
          className='rounded-md border border-border/70 bg-card/70 px-3 py-2 text-xs text-foreground'
        >
          {isArabic ? 'عمليات النظام' : 'System operations'}
        </Link>
      </div>
    </section>
  );
}

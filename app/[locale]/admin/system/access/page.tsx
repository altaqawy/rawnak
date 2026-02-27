import Link from 'next/link';

type PageProps = {
  params: Promise<{ locale: string }>;
};

export default async function SystemAccessPage({ params }: PageProps) {
  const { locale } = await params;
  const isArabic = locale === 'ar';

  return (
    <section className='glass-card rounded-2xl border border-border/70 p-6'>
      <div className='grid gap-2 sm:grid-cols-2'>
        <Link
          href={`/${locale}/admin/team/users`}
          className='rounded-md border border-border/70 bg-card/70 px-3 py-2 text-xs text-foreground'
        >
          {isArabic ? 'المستخدمون والأدوار' : 'Users & Roles'}
        </Link>
        <Link
          href={`/${locale}/admin/settings/security`}
          className='rounded-md border border-border/70 bg-card/70 px-3 py-2 text-xs text-foreground'
        >
          {isArabic ? 'الأمان' : 'Security'}
        </Link>
      </div>
    </section>
  );
}

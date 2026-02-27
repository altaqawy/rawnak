import Link from 'next/link';
import { getTranslations } from 'next-intl/server';

type PageProps = {
  params: Promise<{ locale: string }>;
};

export default async function ContentModulePage({ params }: PageProps) {
  const { locale } = await params;
  const t = await getTranslations('adminHub');

  const links = [
    { href: `/${locale}/admin/content/pages`, label: t('links.pages') },
    { href: `/${locale}/admin/content/builder`, label: t('links.builder') },
    { href: `/${locale}/admin/content/templates`, label: t('links.templates') },
    { href: `/${locale}/admin/content/reactbits`, label: t('links.reactBits') },
    { href: `/${locale}/admin/content/media`, label: t('links.media') },
    { href: `/${locale}/admin/content/seo`, label: t('links.seo') },
    { href: `/${locale}/admin/content/site-settings`, label: t('links.siteSettings') },
  ];

  return (
    <section className="glass-card rounded-2xl border border-border/70 p-6">
      <div className="grid gap-2 sm:grid-cols-2">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="rounded-md border border-border/70 bg-card/70 px-3 py-2 text-xs text-foreground"
          >
            {link.label}
          </Link>
        ))}
      </div>
    </section>
  );
}

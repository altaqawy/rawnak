import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import { requireOwner } from '@/lib/auth/guards';
import { getOwnerSiteSettings } from '@/lib/builder/repository';

type PageProps = {
  params: Promise<{ locale: string }>;
};

export default async function SecuritySettingsPage({ params }: PageProps) {
  const { locale } = await params;
  const context = await requireOwner(locale);
  const t = await getTranslations('adminSecurity');
  const settings = await getOwnerSiteSettings();

  return (
    <div className="space-y-6">
      <section className="glass-card rounded-2xl border border-border/70 p-6">
        <h2 className="text-start text-base font-medium text-foreground">{t('title')}</h2>
        <p className="mt-2 text-start text-sm text-muted-foreground">{t('subtitle')}</p>
      </section>

      <section className="glass-card rounded-2xl border border-border/70 p-6">
        <div className="grid gap-3 text-sm text-muted-foreground">
          <p>{t('ownerId')}: {context.user?.id ?? '-'}</p>
          <p>{t('ownerEmail')}: {context.user?.email ?? '-'}</p>
          <p>
            {t('customerSignup')}:{' '}
            {settings?.customers_signup_enabled ? t('enabled') : t('disabled')}
          </p>
        </div>
        <Link
          href={`/${locale}/admin/settings`}
          className="mt-4 inline-flex rounded-md border border-border/70 bg-card/70 px-3 py-2 text-xs text-foreground"
        >
          {t('goToSiteSettings')}
        </Link>
      </section>
    </div>
  );
}


import { type ReactNode } from 'react';
import { requireOwner } from '@/lib/auth/guards';
import { ModuleShell } from '@/components/dashboard/ModuleShell';

type LayoutProps = {
  children: ReactNode;
  params: Promise<{ locale: string }>;
};

export default async function SystemModuleLayout({ children, params }: LayoutProps) {
  const { locale } = await params;
  await requireOwner(locale);
  const isArabic = locale === 'ar';

  return (
    <ModuleShell
      locale={locale}
      title={isArabic ? 'النظام' : 'System'}
      subtitle={
        isArabic
          ? 'إدارة الوصول والأمان والتدقيق والتكاملات.'
          : 'Manage access, security, audit, and integrations.'
      }
      links={[
        { href: `/${locale}/admin/system`, label: isArabic ? 'نظرة النظام' : 'System overview' },
        { href: `/${locale}/admin/system/access`, label: isArabic ? 'التحكم بالوصول' : 'Access control' },
        { href: `/${locale}/admin/system/operations`, label: isArabic ? 'عمليات النظام' : 'System operations' },
      ]}
    >
      {children}
    </ModuleShell>
  );
}

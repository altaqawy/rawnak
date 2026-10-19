import type { Metadata } from 'next';
import { headers } from 'next/headers';
import { notFound } from 'next/navigation';
import ToolsLanding from '@/components/tools/ToolsLanding';
import { isLocale } from '@/i18n/config';
import { isToolsHost, toolsPublicUrl } from '@/lib/tools/domain';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const language = locale === 'ar' ? 'ar' : 'en';
  return {
    title: language === 'ar' ? 'Rawnak Tools | أدوات رونق' : 'Rawnak Tools | Build. Design. Create.',
    description: language === 'ar'
      ? 'استوديو أدوات مجاني للمبرمجين والمصممين. جرّب الأدوات وخصصها وصدّر الكود.'
      : 'Premium free tools for developers and designers. Customize components and export clean code.',
    alternates: {
      canonical: toolsPublicUrl(language),
      languages: { ar: toolsPublicUrl('ar'), en: toolsPublicUrl('en') },
    },
  };
}

export default async function ToolsIndex({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const requestHeaders = await headers();
  const toolsHost = isToolsHost(requestHeaders.get('host') ?? requestHeaders.get('x-forwarded-host'));
  return <ToolsLanding locale={locale} toolsHost={toolsHost} />;
}

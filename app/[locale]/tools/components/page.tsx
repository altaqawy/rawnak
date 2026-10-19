import type { Metadata } from 'next';
import { headers } from 'next/headers';
import { notFound } from 'next/navigation';
import ComponentLibrary from '@/components/tools/ComponentLibrary';
import { isLocale } from '@/i18n/config';
import { isToolsHost, toolsPath, TOOLS_ORIGIN } from '@/lib/tools/domain';

type Props = { params: Promise<{locale: string}> };

export async function generateMetadata({params}: Props): Promise<Metadata> {
  const {locale}=await params;
  const lang=locale==='ar'?'ar':'en';
  return {
    title: lang==='ar'?'مكتبة المكونات | Rawnak Tools':'Component Library | Rawnak Tools',
    description: lang==='ar'
      ? 'خمسة مكونات واجهات أصلية قابلة للتجربة والتخصيص ونسخ كود React أو HTML وCSS.'
      : 'Five original UI components to preview, customize, and export as HTML/CSS or React JSX.',
    alternates: {
      canonical: TOOLS_ORIGIN+'/'+lang+'/components',
      languages: {
        ar:TOOLS_ORIGIN+'/ar/components',
        en:TOOLS_ORIGIN+'/en/components',
      },
    },
  };
}

export default async function ComponentsPage({params}: Props) {
  const {locale}=await params;
  if(!isLocale(locale)) notFound();
  const requestHeaders=await headers();
  const host=isToolsHost(requestHeaders.get('host')??requestHeaders.get('x-forwarded-host'));
  return <ComponentLibrary locale={locale} baseHref={toolsPath(locale,undefined,host)} />;
}

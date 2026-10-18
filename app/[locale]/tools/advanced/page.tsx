import type { Metadata } from 'next';
import { headers } from 'next/headers';
import { notFound } from 'next/navigation';
import AdvancedLab from '@/components/tools/AdvancedLab';
import { isLocale } from '@/i18n/config';
import { isToolsHost, toolsPath, TOOLS_ORIGIN } from '@/lib/tools/domain';

type Props={params:Promise<{locale:string}>};
export async function generateMetadata({params}:Props):Promise<Metadata>{
  const {locale}=await params;const lang=locale==='ar'?'ar':'en';
  return {
    title:lang==='ar'?'التفاعلات المتقدمة | Rawnak Tools':'Advanced Interaction Lab | Rawnak Tools',
    description:lang==='ar'?'ثماني تجارب أصلية متقدمة للسحب والورق والمعارض والجسيمات.':'Eight original physics, gesture, gallery and canvas interaction experiments.',
    alternates:{canonical:TOOLS_ORIGIN+'/'+lang+'/advanced',
      languages:{ar:TOOLS_ORIGIN+'/ar/advanced',en:TOOLS_ORIGIN+'/en/advanced'}},
  };
}
export default async function Page({params}:Props){
  const {locale}=await params;
  if(!isLocale(locale))notFound();
  const h=await headers();
  const toolsHost=isToolsHost(h.get('host')??h.get('x-forwarded-host'));
  return <AdvancedLab locale={locale} baseHref={toolsPath(locale,undefined,toolsHost)}/>;
}

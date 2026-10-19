import type { Metadata } from 'next';
import { headers } from 'next/headers';
import { notFound } from 'next/navigation';
import MotionLibrary from '@/components/tools/MotionLibrary';
import { isLocale } from '@/i18n/config';
import { isToolsHost, toolsPath, TOOLS_ORIGIN } from '@/lib/tools/domain';
import { motionCount } from '@/lib/tools/original-motions';

type Props={params:Promise<{locale:string}>};

export async function generateMetadata({params}:Props):Promise<Metadata>{
  const {locale}=await params;
  const lang=locale==='ar'?'ar':'en';
  return {
    title:lang==='ar'?'مكتبة الأنيميشن | Rawnak Tools':'Motion Library | Rawnak Tools',
    description:lang==='ar'
      ? 'تصفح '+motionCount+' حركة CSS أصلية مع تعديل مباشر وتصدير React وHTML/CSS.'
      : 'Explore '+motionCount+' original CSS animations with live controls, React and HTML/CSS export.',
    alternates:{
      canonical:TOOLS_ORIGIN+'/'+lang+'/animations',
      languages:{ar:TOOLS_ORIGIN+'/ar/animations',en:TOOLS_ORIGIN+'/en/animations'},
    },
  };
}

export default async function AnimationsPage({params}:Props){
  const {locale}=await params;
  if(!isLocale(locale))notFound();
  const h=await headers();
  const isTools=isToolsHost(h.get('host')??h.get('x-forwarded-host'));
  return <MotionLibrary locale={locale} baseHref={toolsPath(locale,undefined,isTools)}/>;
}

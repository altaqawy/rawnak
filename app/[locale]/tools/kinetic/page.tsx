import type { Metadata } from 'next';
import { headers } from 'next/headers';
import { notFound } from 'next/navigation';
import KineticLab from '@/components/tools/KineticLab';
import { kineticCount } from '@/lib/tools/kinetic-presets';
import { isLocale } from '@/i18n/config';
import { isToolsHost, toolsPath, TOOLS_ORIGIN } from '@/lib/tools/domain';

type Props={params:Promise<{locale:string}>};
export async function generateMetadata({params}:Props):Promise<Metadata>{
  const {locale}=await params;
  const lang=locale==='ar'?'ar':'en';
  return {
    title:lang==='ar'?'مختبر البطاقات والمعارض | Rawnak Tools':'Kinetic Lab | Rawnak Tools',
    description:lang==='ar'
      ? kineticCount+' تأثير أصلي للبطاقات ثلاثية الأبعاد والأزرار المغناطيسية والمعارض التفاعلية.'
      : kineticCount+' original 3D cards, magnetic controls and interactive galleries with live preview and code export.',
    alternates:{canonical:TOOLS_ORIGIN+'/'+lang+'/kinetic',languages:{ar:TOOLS_ORIGIN+'/ar/kinetic',en:TOOLS_ORIGIN+'/en/kinetic'}},
  };
}
export default async function Page({params}:Props){
  const {locale}=await params;
  if(!isLocale(locale))notFound();
  const h=await headers();
  const host=isToolsHost(h.get('host')??h.get('x-forwarded-host'));
  return <KineticLab locale={locale} baseHref={toolsPath(locale,undefined,host)}/>;
}

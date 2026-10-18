import type {Metadata} from 'next';
import {headers} from 'next/headers';
import {notFound} from 'next/navigation';
import SpectraLab from '@/components/tools/SpectraLab';
import {isLocale} from '@/i18n/config';
import {isToolsHost,toolsPath,TOOLS_ORIGIN} from '@/lib/tools/domain';
type Props={params:Promise<{locale:string}>};
export async function generateMetadata({params}:Props):Promise<Metadata>{
  const {locale}=await params;
  const lang=locale==='ar'?'ar':'en';
  return {
    title:lang==='ar'?'مختبر المؤثرات المتقدمة | أدوات رونق':'Spectra Motion Lab | Rawnak Tools',
    description:lang==='ar'
      ?'صمّم انفجارات الجسيمات والشرائط المرنة ومعارض Prism ثلاثية الأبعاد، وحمّل إعداداتها.'
      :'Original Star Burst particles, multi-ribbon physics and 3D Prism Carousel with a live customizable editor.',
    alternates:{canonical:TOOLS_ORIGIN+'/'+lang+'/spectra',
      languages:{ar:TOOLS_ORIGIN+'/ar/spectra',en:TOOLS_ORIGIN+'/en/spectra'}},
  };
}
export default async function Page({params}:Props){
  const {locale}=await params;
  if(!isLocale(locale))notFound();
  const h=await headers();
  const isTools=isToolsHost(h.get('host')??h.get('x-forwarded-host'));
  return <SpectraLab locale={locale} baseHref={toolsPath(locale,undefined,isTools)}/>;
}
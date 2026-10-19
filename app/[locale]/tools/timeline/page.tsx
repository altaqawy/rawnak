import type {Metadata} from 'next';
import {headers} from 'next/headers';
import {notFound} from 'next/navigation';
import MotionTimeline from '@/components/tools/MotionTimeline';
import {isLocale} from '@/i18n/config';
import {isToolsHost,toolsPath,TOOLS_ORIGIN} from '@/lib/tools/domain';
type Props={params:Promise<{locale:string}>};
export async function generateMetadata({params}:Props):Promise<Metadata>{
  const {locale}=await params,lang=locale==='ar'?'ar':'en';
  return {title:lang==='ar'?'محرر خط الزمن | Rawnak Tools':'Motion Timeline | Rawnak Tools',
    description:lang==='ar'?'رتّب الأنيميشن في مسارات متراكبة، وحرّك وقتها وصدّر HTML وJSON.'
      :'A real layered motion timeline with scrubbing, clip dragging and standalone HTML/JSON export.',
    alternates:{canonical:TOOLS_ORIGIN+'/'+lang+'/timeline',
      languages:{en:TOOLS_ORIGIN+'/en/timeline',ar:TOOLS_ORIGIN+'/ar/timeline'}}};
}
export default async function Page({params}:Props){
  const {locale}=await params;
  if(!isLocale(locale))notFound();
  const h=await headers();const isTools=isToolsHost(h.get('host')??h.get('x-forwarded-host'));
  return <MotionTimeline locale={locale} baseHref={toolsPath(locale,undefined,isTools)}/>;
}
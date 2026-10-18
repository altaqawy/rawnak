import type {Metadata} from 'next';
import {headers} from 'next/headers';
import {notFound} from 'next/navigation';
import GpuLab from '@/components/tools/GpuLab';
import {isLocale} from '@/i18n/config';
import {isToolsHost,toolsPath,TOOLS_ORIGIN} from '@/lib/tools/domain';

type Props={params:Promise<{locale:string}>};
export async function generateMetadata({params}:Props):Promise<Metadata>{
  const {locale}=await params;
  const lang=locale==='ar'?'ar':'en';
  return {
    title:lang==='ar'?'مختبر WebGL | أدوات رونق':'WebGL Lab | Rawnak Tools',
    description:lang==='ar'
      ?'تجارب كرة أرضية وقبة داخلية وشريط متفاعل باستخدام Three.js وWebGL مع مستويات جودة.'
      :'Three original WebGL experiments: interactive point globe, shader-driven inverted dome and a live mesh ribbon.',
    alternates:{canonical:TOOLS_ORIGIN+'/'+lang+'/gpu',
      languages:{ar:TOOLS_ORIGIN+'/ar/gpu',en:TOOLS_ORIGIN+'/en/gpu'}},
  };
}
export default async function Page({params}:Props){
  const {locale}=await params;
  if(!isLocale(locale))notFound();
  const h=await headers();
  const toolsHost=isToolsHost(h.get('host')??h.get('x-forwarded-host'));
  return <GpuLab locale={locale} baseHref={toolsPath(locale,undefined,toolsHost)}/>;
}

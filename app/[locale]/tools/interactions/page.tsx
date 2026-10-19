import type { Metadata } from 'next';
import { headers } from 'next/headers';
import { notFound } from 'next/navigation';
import InteractionLab from '@/components/tools/InteractionLab';
import { isLocale } from '@/i18n/config';
import { isToolsHost, toolsPath, TOOLS_ORIGIN } from '@/lib/tools/domain';
import { interactionCount } from '@/lib/tools/interaction-presets';

type Props={params:Promise<{locale:string}>};

export async function generateMetadata({params}:Props):Promise<Metadata>{
  const {locale}=await params;
  const lang=locale==='ar'?'ar':'en';
  return {
    title:lang==='ar'?'مختبر التفاعل | أدوات رونق':'Interaction Lab | Rawnak Tools',
    description:lang==='ar'
      ? interactionCount+' تأثير Scroll وخلفيات تفاعلية أصلية مع معاينة وتصدير React وHTML وCSS.'
      : interactionCount+' original scroll reveals and pointer-reactive backgrounds with live previews and source export.',
    alternates:{
      canonical:TOOLS_ORIGIN+'/'+lang+'/interactions',
      languages:{
        ar:TOOLS_ORIGIN+'/ar/interactions',
        en:TOOLS_ORIGIN+'/en/interactions',
      },
    },
  };
}

export default async function InteractionPage({params}:Props){
  const {locale}=await params;
  if(!isLocale(locale))notFound();
  const h=await headers();
  const isTools=isToolsHost(h.get('host')??h.get('x-forwarded-host'));
  return <InteractionLab locale={locale} baseHref={toolsPath(locale,undefined,isTools)}/>;
}

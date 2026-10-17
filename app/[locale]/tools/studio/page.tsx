import type { Metadata } from 'next';
import { headers } from 'next/headers';
import { notFound } from 'next/navigation';
import VisualStudio from '@/components/tools/VisualStudio';
import { isLocale } from '@/i18n/config';
import { isToolsHost, toolsPath, TOOLS_ORIGIN } from '@/lib/tools/domain';
import { motionPresets } from '@/lib/tools/original-motions';
import { interactionPresets } from '@/lib/tools/interaction-presets';
import { kineticPresets } from '@/lib/tools/kinetic-presets';
import { toolCatalog } from '@/lib/tools/catalog';

type Props={params:Promise<{locale:string}>};
const count=motionPresets.length+interactionPresets.length+kineticPresets.length+5+toolCatalog.length;

export async function generateMetadata({params}:Props):Promise<Metadata>{
  const {locale}=await params;
  const language=locale==='ar'?'ar':'en';
  return {
    title:language==='ar'?'المحرر البصري | Rawnak Tools':'Visual Studio | Rawnak Tools',
    description:language==='ar'
      ?'محرر بصري واحد يجمع '+count+' تأثيرًا ومكونًا وأداة، بمعاينة وتخصيص وتصدير كود.'
      :'One editor for '+count+' Rawnak effects, components and studio entry points, with live previews and code exports.',
    alternates:{canonical:TOOLS_ORIGIN+'/'+language+'/studio',
      languages:{ar:TOOLS_ORIGIN+'/ar/studio',en:TOOLS_ORIGIN+'/en/studio'}},
  };
}
export default async function Page({params}:Props){
  const {locale}=await params;
  if(!isLocale(locale))notFound();
  const h=await headers();
  const toolsHost=isToolsHost(h.get('host')??h.get('x-forwarded-host'));
  return <VisualStudio locale={locale} toolsHost={toolsHost} baseHref={toolsPath(locale,undefined,toolsHost)}/>;
}

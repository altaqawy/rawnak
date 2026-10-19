import type {Metadata} from 'next';
import {headers} from 'next/headers';
import {notFound} from 'next/navigation';
import GalleryPhysicsLab from '@/components/tools/GalleryPhysicsLab';
import {isLocale} from '@/i18n/config';
import {isToolsHost,toolsPath,TOOLS_ORIGIN} from '@/lib/tools/domain';

type Props={params:Promise<{locale:string}>};

export async function generateMetadata({params}:Props):Promise<Metadata>{
  const {locale}=await params;
  const language=locale==='ar'?'ar':'en';
  return {
    title:language==='ar'?'معمل معارض الفيزياء | Rawnak Tools':'Gallery Physics Lab | Rawnak Tools',
    description:language==='ar'
      ?'تقليب صفحات بالسحب، ومعارض لا نهائية ومرنة، وتحويل الصور إلى جسيمات Canvas.'
      :'Original physics-inspired page turns, inertial infinite galleries, elastic filmstrips and local image particle morphs.',
    alternates:{
      canonical:TOOLS_ORIGIN+'/'+language+'/gallery-physics',
      languages:{en:TOOLS_ORIGIN+'/en/gallery-physics',ar:TOOLS_ORIGIN+'/ar/gallery-physics'},
    },
  };
}
export default async function Page({params}:Props){
  const {locale}=await params;
  if(!isLocale(locale))notFound();
  const h=await headers();
  const toolsHost=isToolsHost(h.get('host')??h.get('x-forwarded-host'));
  return <GalleryPhysicsLab locale={locale} baseHref={toolsPath(locale,undefined,toolsHost)}/>;
}

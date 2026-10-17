import type { Metadata } from 'next';
import Link from 'next/link';
import { headers } from 'next/headers';
import { ArrowLeft, ArrowRight, Braces } from 'lucide-react';
import { notFound } from 'next/navigation';
import { isLocale } from '@/i18n/config';
import { findTool, toolCatalog } from '@/lib/tools/catalog';
import { isToolsHost, toolsPath, toolsPublicUrl } from '@/lib/tools/domain';
import ToolWorkbench from '@/components/tools/ToolWorkbench';

type Props = { params: Promise<{locale: string; tool: string}> };

export function generateStaticParams() {
  return ['ar', 'en'].flatMap((locale) => toolCatalog.map(({ slug }) => ({ locale, tool: slug })));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, tool } = await params;
  const item = findTool(tool);
  return {
    title: item ? item.label[locale === 'ar' ? 'ar' : 'en'] + ' | Rawnak Tools' : 'Rawnak Tools',
    description: item?.subtitle[locale === 'ar' ? 'ar' : 'en'],
    ...(item ? { alternates: { canonical: toolsPublicUrl(locale === 'ar' ? 'ar' : 'en', item.slug), languages: { ar: toolsPublicUrl('ar', item.slug), en: toolsPublicUrl('en', item.slug) } } } : {}),
  };
}

export default async function ToolPage({ params }: Props) {
  const { locale, tool } = await params;
  if (!isLocale(locale) || !findTool(tool)) notFound();
  const selected = findTool(tool)!;
  const toolsHost = isToolsHost((await headers()).get('host'));
  const BackIcon = locale === 'ar' ? ArrowRight : ArrowLeft;
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-6xl px-4 pb-24 pt-10 sm:px-6">
        <div className="mb-10 flex flex-wrap items-center justify-between gap-4">
          <Link href={toolsPath(locale, undefined, toolsHost)} className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground">
            <BackIcon className="size-4" />{locale === 'ar' ? 'كل الأدوات' : 'All tools'}
          </Link>
          <div className="flex items-center gap-2 text-xs tracking-[0.15em] text-muted-foreground">
            <Braces className="size-4" /> RAWNAK TOOLS / {selected.hint}
          </div>
        </div>
        <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">{selected.label[locale]}</h1>
        <p className="mb-8 mt-3 text-muted-foreground">{selected.subtitle[locale]}</p>
        <ToolWorkbench tool={selected.slug} locale={locale} />
      </div>
    </div>
  );
}

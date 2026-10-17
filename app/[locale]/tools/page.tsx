import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowUpRight, Braces, Component, MousePointer2, MoveUpRight, Palette, Shapes } from 'lucide-react';
import { notFound } from 'next/navigation';
import { isLocale } from '@/i18n/config';
import { toolCatalog } from '@/lib/tools/catalog';

const icons = [MousePointer2, MoveUpRight, Palette, Shapes, Component] as const;

export async function generateMetadata({ params }: { params: Promise<{locale: string}> }): Promise<Metadata> {
  const { locale } = await params;
  return {
    title: locale === 'ar' ? 'Rawnak Tools | أدوات رونق' : 'Rawnak Tools | Make more with less',
    description: locale === 'ar' ? 'مجموعة أدوات مجانية للمطورين والمصممين، مع معاينة وتعديل وتصدير مباشر.' : 'Free developer and designer tools. Preview, customize and export.',
  };
}

export default async function ToolsIndex({ params }: { params: Promise<{locale: string}> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const ar = locale === 'ar';

  return (
    <div className="relative isolate min-h-screen overflow-hidden bg-background text-foreground">
      <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-[440px] bg-[radial-gradient(ellipse_at_50%_0%,rgba(79,111,218,0.13),transparent_65%)]" />
      <div className="relative mx-auto max-w-6xl px-5 pb-24 pt-16 sm:px-6 md:pt-24">
        <div className="mb-9 flex items-center gap-3 text-xs tracking-[0.2em] text-muted-foreground">
          <Braces className="size-4" />
          <span>RAWNAK GROUP / TOOLS</span>
          <span className="h-px flex-1 bg-border/50" />
          <span>BETA / 01</span>
        </div>
        <div className="max-w-3xl">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1.5 text-xs text-muted-foreground">
            <span className="size-1.5 rounded-full bg-blue-500" />
            {ar ? 'مجانية، ومفتوحة للجميع — بدون تسجيل' : 'Free to use — no sign-in required'}
          </div>
          <h1 className="text-5xl font-semibold tracking-[-0.055em] sm:text-6xl md:text-[78px]">
            Rawnak <span className="text-blue-500">Tools.</span>
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground sm:text-xl">
            {ar
              ? 'معمل أدوات صغير بطموح كبير. صمّم، عدّل، جرّب وصدّر — من غير ما تبدأ من الصفر.'
              : 'A growing creative toolkit. Design, tweak, preview, and export — without starting from scratch.'}
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-5 text-sm text-muted-foreground">
            <span>{ar ? '٥ أدوات تعمل فعليًا' : '5 working studios'}</span>
            <span className="size-1 rounded-full bg-muted-foreground/60" />
            <span>{ar ? 'معاينة مباشرة' : 'Live previews'}</span>
            <span className="size-1 rounded-full bg-muted-foreground/60" />
            <span>{ar ? 'كود قابل للنسخ' : 'Copy-ready code'}</span>
          </div>
        </div>

        <section className="mt-16 md:mt-20" aria-labelledby="studios-heading">
          <div className="mb-6 flex items-center justify-between gap-4 border-b border-border/80 pb-4">
            <h2 id="studios-heading" className="text-lg font-semibold">{ar ? 'ابدأ بأداة' : 'Explore the studios'}</h2>
            <span className="font-mono text-xs text-muted-foreground">01—05</span>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {toolCatalog.map((tool, index) => {
              const Icon = icons[index];
              return (
                <Link
                  key={tool.slug}
                  href={'/' + locale + '/tools/' + tool.slug}
                  className="group relative flex min-h-[230px] flex-col justify-between overflow-hidden rounded-2xl border border-border/75 bg-card/60 p-7 transition-all duration-200 hover:-translate-y-1 hover:border-blue-500/50 hover:bg-card hover:shadow-xl hover:shadow-blue-950/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex size-12 items-center justify-center rounded-xl border border-border bg-background">
                      <Icon className="size-5 text-foreground" strokeWidth={1.6} />
                    </div>
                    <ArrowUpRight className="size-5 text-muted-foreground transition-transform group-hover:-translate-y-1 group-hover:translate-x-1 group-hover:text-blue-500 rtl:group-hover:-translate-x-1" />
                  </div>
                  <div>
                    <div className="mb-3 flex items-center gap-2 text-xs text-muted-foreground">
                      <span className="font-mono">{tool.hint}</span><span>—</span><span>{tool.category[locale]}</span>
                    </div>
                    <h3 className="text-2xl font-semibold tracking-tight">{tool.label[locale]}</h3>
                    <p className="mt-2 max-w-sm text-sm leading-6 text-muted-foreground">{tool.subtitle[locale]}</p>
                  </div>
                </Link>
              );
            })}
            <div className="flex min-h-[230px] flex-col justify-between rounded-2xl border border-dashed border-border bg-background/35 p-7">
              <div className="text-xs uppercase tracking-[0.22em] text-muted-foreground">RAWNAK / NEXT</div>
              <div>
                <p className="text-xl font-medium">{ar ? 'أدوات جديدة قريبًا' : 'More tools to come'}</p>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  {ar ? 'هنضيف أدوات جديدة بناءً على احتياجات المستخدمين — مش لمجرد زيادة العدد.' : 'We’ll expand based on real workflows, not vanity tool counts.'}
                </p>
              </div>
            </div>
          </div>
        </section>
        <p className="mt-12 text-center text-xs text-muted-foreground">
          {ar ? 'طوّرته رونق — المكونات والأكواد المعروضة أصلية.' : 'Crafted by Rawnak — original tools and code exports.'}
        </p>
      </div>
    </div>
  );
}

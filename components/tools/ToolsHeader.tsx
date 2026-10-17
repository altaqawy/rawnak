'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ArrowUpRight, Braces, Globe2, Menu, X } from 'lucide-react';
import { useState } from 'react';
import { ThemeToggle } from '@/components/ThemeToggle';
import { localeCookieName, type Locale } from '@/i18n/config';
import { isToolSlug } from '@/lib/tools/catalog';
import { toolsPath } from '@/lib/tools/domain';

export function ToolsHeader({ locale }: { locale: Locale }) {
  const pathname = usePathname() || '/';
  const ar = locale === 'ar';
  const [menuOpen, setMenuOpen] = useState(false);
  const nextLocale: Locale = ar ? 'en' : 'ar';
  const candidateTool = pathname.split('/').filter(Boolean)[1] ?? '';
  const selectedTool = isToolSlug(candidateTool) ? candidateTool : undefined;
  const langHref = toolsPath(nextLocale, selectedTool, true);

  const switchLocale = () => {
    document.cookie = localeCookieName + '=' + nextLocale + '; path=/; max-age=31536000; SameSite=Lax';
    setMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 border-b border-border/70 bg-background/90 backdrop-blur-xl">
      <div className="mx-auto flex h-[74px] max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link href={toolsPath(locale, undefined, true)} className="flex items-center gap-3" aria-label="Rawnak Tools">
          <span className="flex size-10 items-center justify-center rounded-xl border border-blue-500/35 bg-blue-500/10 text-blue-500">
            <Braces className="size-[21px]" strokeWidth={1.8} />
          </span>
          <span className="flex flex-col gap-0.5">
            <strong className="text-[15px] leading-5 tracking-tight">RAWNAK TOOLS</strong>
            <span className="text-[10px] tracking-[0.16em] text-muted-foreground">BY RAWNAK GROUP</span>
          </span>
        </Link>

        <nav aria-label={ar ? 'التنقل الرئيسي' : 'Primary navigation'} className="hidden items-center gap-8 md:flex">
          <Link href={toolsPath(locale, undefined, true)} className="text-sm font-medium text-foreground hover:text-blue-500">
            {ar ? 'مكتبة الأدوات' : 'Explore tools'}
          </Link>
          <a href={'https://rawnakgroup.com/' + locale} className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-blue-500">
            {ar ? 'رونق جروب' : 'Rawnak Group'} <ArrowUpRight className="size-3.5 rtl:scale-x-[-1]" />
          </a>
        </nav>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Link
            href={langHref}
            onClick={switchLocale}
            className="inline-flex h-9 items-center gap-2 rounded-full border border-border/80 bg-card/70 px-3 text-xs font-semibold hover:border-blue-500/50"
            aria-label={ar ? 'Switch to English' : 'التبديل إلى العربية'}
            hrefLang={nextLocale}
          >
            <Globe2 className="size-3.5" /> {nextLocale.toUpperCase()}
          </Link>
          <button
            type="button"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label={ar ? 'القائمة' : 'Open navigation'}
            aria-expanded={menuOpen}
            className="inline-flex size-9 items-center justify-center rounded-lg border border-border bg-card md:hidden"
          >{menuOpen ? <X className="size-4" /> : <Menu className="size-4" />}</button>
        </div>
      </div>
      {menuOpen && (
        <nav aria-label={ar ? 'القائمة' : 'Mobile menu'} className="flex flex-col gap-1 border-t border-border/70 bg-background p-4 md:hidden">
          <Link href={toolsPath(locale, undefined, true)} onClick={() => setMenuOpen(false)} className="rounded-lg p-3 text-sm hover:bg-card">{ar ? 'مكتبة الأدوات' : 'Explore tools'}</Link>
          <a href={'https://rawnakgroup.com/' + locale} className="rounded-lg p-3 text-sm text-muted-foreground hover:bg-card">{ar ? 'العودة لرونق جروب' : 'Back to Rawnak Group'}</a>
        </nav>
      )}
    </header>
  );
}

export function ToolsFooter({ locale }: { locale: Locale }) {
  return (
    <footer className="border-t border-border/70 bg-background/80">
      <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-3 px-5 py-8 text-xs text-muted-foreground sm:flex-row sm:items-center sm:px-6">
        <span>© {new Date().getFullYear()} Rawnak Group · Rawnak Tools</span>
        <span>{locale === 'ar' ? 'صُممت الأدوات لتعمل مباشرة من متصفحك.' : 'Made for builders. Runs in your browser.'}</span>
      </div>
    </footer>
  );
}

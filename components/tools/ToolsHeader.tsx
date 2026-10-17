'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ArrowUpRight, Globe2, Menu, X } from 'lucide-react';
import { useState } from 'react';
import { localeCookieName, type Locale } from '@/i18n/config';
import { isToolSlug } from '@/lib/tools/catalog';
import { toolsPath } from '@/lib/tools/domain';

export function ToolsHeader({ locale }: { locale: Locale }) {
  const pathname = usePathname() || '/';
  const ar = locale === 'ar';
  const [menuOpen, setMenuOpen] = useState(false);
  const nextLocale: Locale = ar ? 'en' : 'ar';
  const segments = pathname.split('/').filter(Boolean);
  const candidateTool = segments[1] === 'tools' ? segments[2] : segments[1];
  const selectedTool = candidateTool && isToolSlug(candidateTool) ? candidateTool : undefined;
  const home = toolsPath(locale, undefined, true);
  const langHref = toolsPath(nextLocale, selectedTool, true);

  const switchLocale = () => {
    document.cookie = localeCookieName + '=' + nextLocale +
      '; path=/; max-age=31536000; SameSite=Lax';
    setMenuOpen(false);
  };

  const nav = [
    { href: home + '#explore', label: ar ? 'الأدوات' : 'Tools' },
    { href: home + '#components', label: ar ? 'المكونات' : 'Components' },
    { href: home + '#studio', label: ar ? 'المحرر' : 'Studio' },
  ];

  return (
    <header className="rt-site-header">
      <div className="rt-container rt-site-header-inner">
        <Link href={home} className="rt-site-brand" aria-label="Rawnak Tools">
          <span className="rt-site-monogram" aria-hidden="true">R</span>
          <span className="rt-site-brand-words">RAWNAK <small>TOOLS</small></span>
        </Link>

        <nav aria-label={ar ? 'التنقل الرئيسي' : 'Main navigation'} className="rt-site-links">
          {nav.map(item => <Link key={item.href} href={item.href}>{item.label}</Link>)}
          <a href={'https://rawnakgroup.com/' + locale}>
            {ar ? 'رونق جروب' : 'Rawnak Group'} <ArrowUpRight size={11} style={{display:'inline'}} />
          </a>
        </nav>

        <div className="rt-site-actions">
          <Link
            href={langHref}
            onClick={switchLocale}
            className="rt-site-lang"
            hrefLang={nextLocale}
            aria-label={ar ? 'Switch to English' : 'الانتقال للعربية'}
          >
            <Globe2 size={14}/>{nextLocale.toUpperCase()}
          </Link>
          <Link className="rt-site-cta" href={home+'#explore'}>
            {ar ? 'ابدأ الآن' : 'Get Started'}
          </Link>
          <button
            type="button"
            className="rt-site-menu"
            aria-label={ar ? 'فتح القائمة' : 'Toggle navigation'}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen(value => !value)}
          >{menuOpen ? <X size={18}/> : <Menu size={18}/>}</button>
        </div>
      </div>
      {menuOpen && (
        <nav className="rt-site-mobile rt-container" aria-label={ar?'قائمة الهاتف':'Mobile navigation'}>
          {nav.map(item=><Link key={item.href} href={item.href} onClick={()=>setMenuOpen(false)}>{item.label}</Link>)}
          <a href={'https://rawnakgroup.com/'+locale}>{ar?'العودة لرونق جروب':'Back to Rawnak Group'}</a>
        </nav>
      )}
    </header>
  );
}

export function ToolsFooter({ locale }: { locale: Locale }) {
  return (
    <footer className="rt-site-footer">
      <div className="rt-container">
        <span>© {new Date().getFullYear()} RAWNAK TOOLS · BY RAWNAK GROUP</span>
        <span>{locale === 'ar' ? 'صُنعت للمبدعين، من رونق.' : 'Created for makers. Crafted by Rawnak.'}</span>
        <a href={'https://rawnakgroup.com/'+locale}>
          {locale === 'ar' ? 'الموقع الرئيسي' : 'Rawnak Group'}
        </a>
      </div>
    </footer>
  );
}

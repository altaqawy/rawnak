'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, ArrowRight, ArrowUpRight, Check, Code2, Copy, Download, Eye, Heart, MousePointer2 } from 'lucide-react';
import type { Locale } from '@/i18n/config';

type ComponentKind = 'text-reveal' | 'glass-navigation' | 'spotlight-card' | 'dot-grid' | 'floating-input';
type Format = 'html' | 'react';

type Item = {
  slug: ComponentKind;
  en: string;
  ar: string;
  descriptionEn: string;
  descriptionAr: string;
  category: string;
};

const collection: Item[] = [
  { slug: 'text-reveal', en: 'Text Reveal', ar: 'ظهور النص', descriptionEn: 'A soft, animated headline entrance.', descriptionAr: 'ظهور تدريجي أنيق للعناوين.', category: 'TEXT' },
  { slug: 'glass-navigation', en: 'Glass Navigation', ar: 'شريط تنقّل زجاجي', descriptionEn: 'Minimal navigation with a glass finish.', descriptionAr: 'شريط تنقل زجاجي بسيط وحديث.', category: 'NAVIGATION' },
  { slug: 'spotlight-card', en: 'Spotlight Card', ar: 'بطاقة مضيئة', descriptionEn: 'A luminous hover interaction.', descriptionAr: 'بطاقة بتوهّج عند المرور عليها.', category: 'CARDS' },
  { slug: 'dot-grid', en: 'Dot Grid', ar: 'خلفية نقطية', descriptionEn: 'A delicate, adjustable background.', descriptionAr: 'خلفية نقطية قابلة للتخصيص.', category: 'BACKGROUNDS' },
  { slug: 'floating-input', en: 'Floating Input', ar: 'حقل إدخال تفاعلي', descriptionEn: 'Accessible input with a floating label.', descriptionAr: 'حقل إدخال بتسمية متحركة وواضحة.', category: 'FORMS' },
];

function escapeHtml(input: string): string {
  return input.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

function sourceFor(kind: ComponentKind, text: string, accent: string, radius: number, duration: number, format: Format) {
  const htmlText = escapeHtml(text || 'Build something better.');
  const css: Record<ComponentKind, string> = {
    'text-reveal': '.rtx-reveal{display:inline-block;max-width:100%;color:#f5f5f5;font:700 clamp(32px,6vw,64px)/1.15 system-ui;letter-spacing:-.06em;animation:rtx-appear ' + duration + 's cubic-bezier(.2,.8,.2,1) both}@keyframes rtx-appear{from{transform:translateY(24px);opacity:0;filter:blur(8px)}to{transform:none;opacity:1;filter:none}}@media(prefers-reduced-motion:reduce){.rtx-reveal{animation:none}}',
    'glass-navigation': '.rtx-nav{display:flex;align-items:center;gap:22px;flex-wrap:wrap;width:max-content;max-width:100%;padding:14px 20px;background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.2);backdrop-filter:blur(18px);border-radius:' + radius + 'px}.rtx-nav a{color:#eee;text-decoration:none;font:500 13px system-ui;transition:opacity .15s}.rtx-nav a:hover{opacity:.65}.rtx-nav a:focus-visible{outline:2px solid ' + accent + ';outline-offset:4px}',
    'spotlight-card': '.rtx-card{background:radial-gradient(ellipse at 45% 0%,' + accent + '30,transparent 65%),linear-gradient(135deg,#202020,#090909);border:1px solid ' + accent + '55;border-radius:' + radius + 'px;color:#fff;padding:28px;max-width:320px;transition:transform .25s,box-shadow .25s}.rtx-card:hover{transform:translateY(-5px);box-shadow:0 13px 45px ' + accent + '25}.rtx-card h3{font:700 23px system-ui;margin:0 0 12px}.rtx-card p{font:14px/1.6 system-ui;opacity:.7;margin:0}@media(prefers-reduced-motion:reduce){.rtx-card{transition:none}.rtx-card:hover{transform:none}}',
    'dot-grid': '.rtx-dots{width:100%;min-height:250px;border:1px solid #363636;border-radius:' + radius + 'px;background-color:#090909;background-image:radial-gradient(' + accent + '80 1px,transparent 1px);background-size:23px 23px}',
    'floating-input': '.rtx-field{display:block;width:min(350px,100%);position:relative}.rtx-field input{width:100%;box-sizing:border-box;padding:20px 17px 9px;border-radius:' + radius + 'px;border:1px solid #555;background:#121212;color:#fff;font:14px system-ui;outline:none}.rtx-field span{position:absolute;left:17px;top:17px;color:#aaa;pointer-events:none;font:13px system-ui;transition:transform .17s,font-size .17s}.rtx-field input:focus{border-color:' + accent + '}.rtx-field input:focus+span,.rtx-field input:not(:placeholder-shown)+span{transform:translateY(-9px);font-size:10px}@media(prefers-reduced-motion:reduce){.rtx-field span{transition:none}}',
  };
  const styles = css[kind];
  const html: Record<ComponentKind, string> = {
    'text-reveal': '<h2 class="rtx-reveal">' + htmlText + '</h2>',
    'glass-navigation': '<nav class="rtx-nav" aria-label="Main"><a href="#home">Home</a><a href="#work">Work</a><a href="#about">About</a><a href="#contact">Contact</a></nav>',
    'spotlight-card': '<article class="rtx-card"><h3>' + htmlText + '</h3><p>Make every detail matter.</p></article>',
    'dot-grid': '<div class="rtx-dots" aria-hidden="true"></div>',
    'floating-input': '<label class="rtx-field"><input type="email" name="email" placeholder=" " autocomplete="email" required><span>Email address</span></label>',
  };
  if (format === 'html') return html[kind] + '\n<style>\n' + styles + '\n</style>';
  const safeText = '{' + JSON.stringify(text || 'Build something better.').replace(/</g, '\\u003c') + '}';
  const react: Record<ComponentKind, string> = {
    'text-reveal': '<h2 className="rtx-reveal">' + safeText + '</h2>',
    'glass-navigation': '<nav className="rtx-nav" aria-label="Main"><a href="#home">Home</a><a href="#work">Work</a><a href="#about">About</a><a href="#contact">Contact</a></nav>',
    'spotlight-card': '<article className="rtx-card"><h3>' + safeText + '</h3><p>Make every detail matter.</p></article>',
    'dot-grid': '<div className="rtx-dots" aria-hidden="true" />',
    'floating-input': '<label className="rtx-field"><input type="email" name="email" placeholder=" " autoComplete="email" required /><span>Email address</span></label>',
  };
  return 'export default function RawnakComponent() {\n  return (\n    <>\n      ' + react[kind] + '\n      <style>{' + JSON.stringify(styles) + '}</style>\n    </>\n  );\n}';
}

function LiveComponent({kind, text, accent, radius, duration}: {
  kind: ComponentKind;
  text: string;
  accent: string;
  radius: number;
  duration: number;
}) {
  if(kind === 'text-reveal') return <div className="rtc-text-reveal" key={text+duration} style={{animationDuration:duration+'s'}}>{text || 'Build something better.'}</div>;
  if(kind === 'glass-navigation') return <nav aria-label="Component example navigation" className="rtc-glass-nav" style={{borderRadius:radius}}>{['Home','Work','About','Contact'].map(label=><a key={label} href={'#'+label.toLowerCase()} onClick={e=>e.preventDefault()}>{label}</a>)}</nav>;
  if(kind === 'spotlight-card') return <article className="rtc-spotlight-card" style={{borderRadius:radius,boxShadow:'0 0 55px '+accent+'15',borderColor:accent+'55'}}><span className="rtc-sparkle">✳</span><h3>{text || 'Build something better.'}</h3><p>Make every detail matter.</p><ArrowUpRight size={17}/></article>;
  if(kind === 'dot-grid') return <div className="rtc-dot-preview" aria-label="Dot grid pattern" style={{borderRadius:radius,backgroundImage:'radial-gradient('+accent+'80 1px,transparent 1px)'}}><span>SEAMLESS / PATTERN</span></div>;
  return <label className="rtc-floating-input" style={{borderRadius:radius}}><input type="email" placeholder=" " autoComplete="email" required/><span>Email address</span></label>;
}

export default function ComponentLibrary({locale,baseHref}: {locale:Locale;baseHref:string}) {
  const ar=locale==='ar';
  const [active,setActive]=useState<ComponentKind>('text-reveal');
  const [text,setText]=useState('Build something better.');
  const [accent,setAccent]=useState('#dddddd');
  const [radius,setRadius]=useState(15);
  const [duration,setDuration]=useState(1.2);
  const [format,setFormat]=useState<Format>('html');
  const [status,setStatus]=useState('');
  const [favorites,setFavorites]=useState<ComponentKind[]>([]);
  const [favoritesReady,setFavoritesReady]=useState(false);
  useEffect(()=>{
    try {
      const raw=JSON.parse(localStorage.getItem('rawnak-tools-favorites-v1')||'[]');
      if(Array.isArray(raw)) setFavorites(raw.filter((v:unknown)=>typeof v==='string' && collection.some(item=>item.slug===v)) as ComponentKind[]);
    } catch { /* Private browsing may disable local storage. */ }
    setFavoritesReady(true);
  },[]);
  useEffect(()=>{
    if(!favoritesReady) return;
    try { localStorage.setItem('rawnak-tools-favorites-v1',JSON.stringify(favorites)); }
    catch { /* Browsing remains usable if storage is unavailable. */ }
  },[favorites,favoritesReady]);

  const toggleFavorite=()=>{
    setFavorites(prev=>prev.includes(active)?prev.filter(v=>v!==active):[...prev,active]);
    setStatus(ar?'تم تحديث المفضلة':'Favorites updated');
  };
  const item=collection.find(v=>v.slug===active)!;
  const source=useMemo(()=>sourceFor(active,text,accent,radius,duration,format),[active,text,accent,radius,duration,format]);

  function pick(slug:ComponentKind) {setActive(slug);setText('Build something better.');setAccent('#dddddd');setRadius(15);setDuration(1.2);setStatus('');}

  async function copy() {
    try {
      await navigator.clipboard.writeText(source);
      setStatus(ar?'تم نسخ الكود':'Code copied');
    } catch {
      setStatus(ar?'حدد الكود وانسخه يدويًا':'Clipboard unavailable; select the code to copy');
    }
  }
  function download(){
    const blob=new Blob([source],{type:'text/plain;charset=utf-8'});
    const url=URL.createObjectURL(blob);
    const a=document.createElement('a');
    a.href=url;
    a.download='rawnak-'+active+(format==='react'?'.jsx':'.html');
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    setStatus(ar?'تم تنزيل الملف':'File downloaded');
  }

  return <div className="rtc-library">
    <div className="rt-container rtc-library-head">
      <Link href={baseHref} className="rtc-back">{ar?<ArrowRight size={16}/>:<ArrowLeft size={16}/>} {ar?'الصفحة الرئيسية':'Back to all tools'}</Link>
      <div className="rt-eyebrow">RAWNAK / COMPONENT LAB · 001—005</div>
      <h1>{ar?'مكتبة المكونات':'Component Library'}<span>.</span></h1>
      <p>{ar?'خمسة مكونات أصلية قابلة للتجربة والتخصيص والنسخ. بدون تسجيل أو اشتراك.':'Five original UI components you can customize, preview and export. No accounts, no subscriptions.'}</p>
      <div className="rtc-count"><Check size={14}/>{ar?'٥ مكونات متاحة الآن':'5 components available now'} <span>·</span> HTML + CSS / React JSX</div>
    </div>

    <div className="rt-container rtc-library-grid">
      <aside className="rtc-sidebar" aria-label={ar?'المكونات':'Components'}>
        <div className="rtc-sidebar-caption">{ar?'المكتبة':'LIBRARY'} <span>05</span></div>
        {collection.map((v,i)=><button key={v.slug} type="button" aria-pressed={active===v.slug} className={'rtc-sidebar-item '+(active===v.slug?'is-active':'')} onClick={()=>pick(v.slug)}><span>{String(i+1).padStart(2,'0')}</span><strong>{ar?v.ar:v.en}</strong><ArrowUpRight size={14}/></button>)}
      </aside>

      <div className="rtc-content">
        <div className="rtc-component-title"><div><div className="rt-eyebrow">{item.category} / PREVIEW</div><h2>{ar?item.ar:item.en}</h2><p>{ar?item.descriptionAr:item.descriptionEn}</p></div><div className="rtc-title-actions"><span className="rtc-available"><Check size={14}/>{ar?'متاح':'Available'}</span><button type="button" onClick={toggleFavorite} aria-pressed={favorites.includes(active)} className="rtc-favorite" aria-label={favorites.includes(active)?(ar?'إزالة من المفضلة':'Remove from favorites'):(ar?'إضافة للمفضلة':'Add to favorites')}><Heart size={17} fill={favorites.includes(active)?'currentColor':'none'}/></button></div></div>
        <div className="rtc-preview-window">
          <div className="rtc-window-header"><span><Eye size={14}/>{ar?'معاينة مباشرة':'Live Preview'}</span><span className="rtc-window-dots">● ● ●</span></div>
          <div className="rtc-preview-surface"><LiveComponent kind={active} text={text} accent={accent} radius={radius} duration={duration}/></div>
        </div>

        <div className="rtc-controls-panel">
          <div className="rtc-controls-title"><MousePointer2 size={16}/>{ar?'تخصيص المكون':'Customize component'}</div>
          <div className="rtc-controls-grid">
            {(active==='text-reveal'||active==='spotlight-card')&&<label className="rtc-control"><span>{ar?'النص':'Text'}</span><input type="text" value={text} maxLength={100} onChange={e=>setText(e.target.value)}/></label>}
            <label className="rtc-control"><span>{ar?'اللون':'Accent color'}</span><input type="color" value={accent} onChange={e=>setAccent(e.target.value)}/></label>
            {active!=='text-reveal'&&<label className="rtc-control"><span>{ar?'استدارة الحواف':'Corner radius'} <em>{radius}px</em></span><input type="range" min={0} max={32} step={1} value={radius} onChange={e=>setRadius(Number(e.target.value))}/></label>}
            {active==='text-reveal'&&<label className="rtc-control"><span>{ar?'مدة التأثير':'Animation duration'} <em>{duration}s</em></span><input type="range" min={0.4} max={3} step={0.1} value={duration} onChange={e=>setDuration(Number(e.target.value))}/></label>}
          </div>
        </div>

        <div className="rtc-code-box">
          <div className="rtc-code-toolbar"><div className="rtc-format-tabs" role="tablist" aria-label="Export format">{(['html','react'] as const).map(f=><button role="tab" aria-selected={format===f} key={f} className={format===f?'active':''} onClick={()=>setFormat(f)}>{f==='html'?'HTML + CSS':'React JSX'}</button>)}</div><div className="rtc-code-actions"><button type="button" onClick={copy}><Copy size={14}/>{ar?'نسخ':'Copy'}</button><button type="button" onClick={download}><Download size={14}/>{ar?'تنزيل':'Download'}</button></div></div>
          <pre dir="ltr" className="rtc-code-preview"><code>{source}</code></pre>
          <div role="status" aria-live="polite" className="rtc-message"><Code2 size={13}/>{status||(ar?'الكود بيتحدّث مع كل تعديل.':'The source updates with every change.')}</div>
        </div>
      </div>
    </div>
  </div>;
}

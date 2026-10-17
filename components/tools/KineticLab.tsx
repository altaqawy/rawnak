'use client';

import { useEffect, useMemo, useState, type PointerEvent } from 'react';
import Link from 'next/link';
import { ArrowLeft, ArrowRight, ArrowUpRight, Check, ChevronLeft, ChevronRight, Code2, Copy, Download, Heart, RotateCcw, Search, SlidersHorizontal } from 'lucide-react';
import type { Locale } from '@/i18n/config';
import { galleryEntries, kineticCategories, kineticCount, kineticCSS, kineticExport, kineticPresets, type KineticCategory, type KineticPreset } from '@/lib/tools/kinetic-presets';

type Filter='all'|KineticCategory|'favorites';

export function LiveDemo({preset, label, amount, radius, version}:{preset:KineticPreset;label:string;amount:number;radius:number;version:number}) {
  const [slide,setSlide]=useState(0);
  const css=kineticCSS(preset,amount,radius);
  useEffect(()=>setSlide(0),[preset.id]);
  const className='rawnak-'+preset.id;
  const isGallery=preset.category==='galleries';
  const isCard=preset.category==='cards';
  const move=(e:PointerEvent<HTMLElement>)=>{
    if(window.matchMedia('(prefers-reduced-motion: reduce)').matches)return;
    const el=e.currentTarget;
    const rect=el.getBoundingClientRect();
    if(!rect.width||!rect.height)return;
    const x=Math.max(0,Math.min(1,(e.clientX-rect.left)/rect.width));
    const y=Math.max(0,Math.min(1,(e.clientY-rect.top)/rect.height));
    if(isCard){
      el.style.setProperty('--rx',((.5-y)*amount*1.4)+'deg');
      el.style.setProperty('--ry',((x-.5)*amount*1.4)+'deg');
      el.style.setProperty('--x',(x*100)+'%');
      el.style.setProperty('--y',(y*100)+'%');
    }else{
      el.style.setProperty('--tx',((x-.5)*amount*3)+'px');
      el.style.setProperty('--ty',((y-.5)*amount*3)+'px');
    }
  };
  const reset=(e:PointerEvent<HTMLElement>)=>{
    e.currentTarget.style.setProperty('--rx','0deg');e.currentTarget.style.setProperty('--ry','0deg');
    e.currentTarget.style.setProperty('--tx','0px');e.currentTarget.style.setProperty('--ty','0px');
    e.currentTarget.style.setProperty('--x','50%');e.currentTarget.style.setProperty('--y','50%');
  };
  const shift=(delta:number)=>setSlide(current=>(current+delta+galleryEntries.length)%galleryEntries.length);
  const galleryExtra='.rawnak-gallery-controls{position:absolute;bottom:8px;right:12px;display:flex;gap:8px;z-index:10}.rawnak-gallery-controls button{cursor:pointer;background:#111;border:1px solid #777;color:#fff;border-radius:50%;width:38px;height:38px;font-size:20px}';
  return <>
    <style>{css+(isGallery?galleryExtra:'')}</style>
    {isCard&&<article key={preset.id+'-'+version} className={className} tabIndex={0} onPointerMove={move} onPointerLeave={reset}>
      <div className="rkl-card-index">RAWNAK / CONCEPT 001</div>
      <h3>{label||'Build what is next'}</h3>
      <p>Build with intention.</p>
    </article>}
    {preset.category==='magnetic'&&<button key={preset.id+'-'+version} type="button" className={className} onPointerMove={move} onPointerLeave={reset}>
      {label||'Explore Rawnak'} <ArrowUpRight size={18}/>
    </button>}
    {isGallery&&<section key={preset.id+'-'+version} tabIndex={0} className={className} aria-label="Interactive gallery"
      onKeyDown={e=>{if(e.key==='ArrowRight'||e.key==='ArrowLeft'){e.preventDefault();shift(e.key==='ArrowRight'?1:-1)}}}>
      {galleryEntries.map((item,i)=><div key={item.title} data-pos={(i-slide+galleryEntries.length)%galleryEntries.length} className="rawnak-gallery-panel">
        <small>{item.eyebrow}</small><strong>{item.title}</strong>
      </div>)}
      <div className="rawnak-gallery-controls">
        <button type="button" onClick={()=>shift(-1)} aria-label="Previous slide">←</button>
        <button type="button" onClick={()=>shift(1)} aria-label="Next slide">→</button>
      </div>
    </section>}
  </>;
}

export default function KineticLab({locale,baseHref}:{locale:Locale;baseHref:string}){
  const ar=locale==='ar';
  const [filter,setFilter]=useState<Filter>('all');
  const [search,setSearch]=useState('');
  const [selected,setSelected]=useState(kineticPresets[0].id);
  const [amount,setAmount]=useState(16);
  const [radius,setRadius]=useState(18);
  const [label,setLabel]=useState('Build what is next');
  const [format,setFormat]=useState<'html'|'react'>('html');
  const [version,setVersion]=useState(0);
  const [favorites,setFavorites]=useState<string[]>([]);
  const [favoritesReady,setFavoritesReady]=useState(false);
  const [status,setStatus]=useState('');
  const active=kineticPresets.find(p=>p.id===selected)??kineticPresets[0];
  const isGallery=active.category==='galleries';

  useEffect(()=>{
    try {
      const data=JSON.parse(localStorage.getItem('rawnak-kinetic-favorites-v1')||'[]');
      if(Array.isArray(data))setFavorites(data.filter((v:unknown)=>typeof v==='string'&&kineticPresets.some(p=>p.id===v)) as string[]);
    }catch{/* Browser storage can be disabled. */}
    setFavoritesReady(true);
  },[]);
  useEffect(()=>{
    if(!favoritesReady)return;
    try{localStorage.setItem('rawnak-kinetic-favorites-v1',JSON.stringify(favorites));}
    catch{/* Session favorites still work. */}
  },[favorites,favoritesReady]);

  const results=useMemo(()=>kineticPresets.filter(p=>
    (filter==='all'||filter==='favorites'&&favorites.includes(p.id)||p.category===filter)&&
    (p.en.toLowerCase().includes(search.trim().toLowerCase())||
      p.ar.includes(search.trim())||p.id.includes(search.trim().toLowerCase()))
  ),[filter,search,favorites]);
  const code=useMemo(()=>kineticExport({preset:active,format,label,amount,radius}),[active,format,label,amount,radius]);

  function choose(p:KineticPreset){
    setSelected(p.id);setStatus('');setVersion(v=>v+1);
  }
  function toggleFavorite(id:string){
    setFavorites(old=>old.includes(id)?old.filter(v=>v!==id):[...old,id]);
  }
  async function copy(){
    try{await navigator.clipboard.writeText(code);setStatus(ar?'تم النسخ':'Copied to clipboard');}
    catch{setStatus(ar?'حدّد الكود وانسخه يدويًا':'Select and copy the source manually');}
  }
  function download(){
    const url=URL.createObjectURL(new Blob([code],{type:'text/plain;charset=utf-8'}));
    const a=document.createElement('a');
    a.download='rawnak-'+active.id+(format==='react'?'.jsx':'.html');
    a.href=url;document.body.appendChild(a);a.click();a.remove();URL.revokeObjectURL(url);
    setStatus(ar?'تم تنزيل الكود':'Source downloaded');
  }
  const filters:[Filter,string,string][]=[
    ['all','All','الكل'],
    ['cards','3D Cards','بطاقات 3D'],
    ['magnetic','Magnetic','مغناطيسية'],
    ['galleries','Galleries','معارض'],
    ['favorites','Saved','المفضلة'],
  ];
  return <main className="rkl-app">
    <section className="rt-container rkl-hero">
      <Link className="rkl-back" href={baseHref}>{ar?<ArrowRight size={15}/>:<ArrowLeft size={15}/>} {ar?'الرجوع للأدوات':'Back to tools'}</Link>
      <div className="rt-eyebrow">3D · MAGNETIC · EDITORIAL</div>
      <h1>{ar?'مختبر':'Kinetic'} <span>{ar?'التفاعل.':'Lab.'}</span></h1>
      <p>{ar?'اثنا عشر مكونًا أصليًا لتجارب ثلاثية الأبعاد، أزرار مغناطيسية، ومعارض تفاعلية. جرّب ثم خصّص وصدّر الكود.':'12 original interactive components: 3D cards, magnetic controls and editorial galleries. Preview, customize and export.'}</p>
      <div className="rkl-hero-facts"><span>{kineticCount} ORIGINAL PRESETS</span><span>HTML / CSS / JS</span><span>REACT JSX</span></div>
    </section>
    <div className="rt-container rkl-layout">
      <section className="rkl-catalog" aria-label={ar?'المكونات':'Preset catalog'}>
        <div className="rkl-catalog-head"><h2>{ar?'اكتشف التأثيرات':'Explore the collection'}</h2><span>{results.length} / {kineticCount}</span></div>
        <label className="rkl-search"><Search size={16}/><input value={search} onChange={e=>setSearch(e.target.value)}
          placeholder={ar?'بحث في المكونات...':'Search effects...'} aria-label={ar?'بحث في المكونات':'Search effects'}/></label>
        <div className="rkl-filters" role="group" aria-label={ar?'تصفية':'Filter components'}>
          {filters.map(([value,en,arabic])=><button key={value} type="button" aria-pressed={filter===value}
            onClick={()=>setFilter(value)} className={filter===value?'active':''}>{ar?arabic:en}</button>)}
        </div>
        <div className="rkl-grid">
          {results.map((p,index)=><article className={'rkl-catalog-card '+(active.id===p.id?'selected':'')} key={p.id}>
            <button type="button" className="rkl-card-launch" onClick={()=>choose(p)}>
              <div className={'rkl-thumbnail rkl-thumbnail-'+p.category}><span>{p.category==='cards'?'◧':p.category==='magnetic'?'◎':'▤'}</span></div>
              <span className="rkl-overline">{String(kineticPresets.indexOf(p)+1).padStart(2,'0')} / {p.category.toUpperCase()}</span>
              <strong>{ar?p.ar:p.en}</strong>
              <small>{ar?p.description.ar:p.description.en}</small>
              <span className="rkl-card-cta">{ar?'معاينة':'Preview'} <ArrowUpRight size={14}/></span>
            </button>
            <button className="rkl-card-heart" aria-pressed={favorites.includes(p.id)}
              aria-label={favorites.includes(p.id)?(ar?'إزالة من المفضلة':'Remove from favorites'):(ar?'إضافة للمفضلة':'Save favorite')}
              type="button" onClick={()=>toggleFavorite(p.id)}><Heart size={15} fill={favorites.includes(p.id)?'currentColor':'none'}/></button>
          </article>)}
        </div>
        {results.length===0&&<div className="rkl-empty">{ar?'لا توجد نتائج مطابقة.':'No matching effects.'} <button type="button" onClick={()=>{setSearch('');setFilter('all')}}>{ar?'عرض الكل':'Show all'}</button></div>}
      </section>
      <aside className="rkl-workbench">
        <div className="rkl-sticky">
          <div className="rkl-workbench-title"><div><span className="rt-eyebrow">LIVE / INTERACTION</span><h2>{ar?active.ar:active.en}</h2></div><span className="rkl-live">● LIVE</span></div>
          <div className="rkl-preview">
            <div className="rkl-preview-header"><span>{ar?'معاينة':'Preview'}</span><button type="button" onClick={()=>setVersion(v=>v+1)}><RotateCcw size={14}/>{ar?'إعادة':'Reset'}</button></div>
            <div className="rkl-preview-stage"><LiveDemo key={active.id+'-'+version} preset={active} amount={amount} radius={radius} label={label} version={version}/></div>
            <div className="rkl-preview-info">{isGallery?(ar?'استخدم الأسهم أو لوحة المفاتيح للتنقل':'Use arrows or keyboard to navigate'):(ar?'حرّك المؤشر فوق العنصر':'Move pointer over the element')}</div>
          </div>
          <div className="rkl-controls">
            <div className="rkl-controls-title"><SlidersHorizontal size={15}/>{ar?'الإعدادات':'CUSTOMIZE'}</div>
            {!isGallery&&<label>{ar?'النص':'Label'}<input value={label} maxLength={90} onChange={e=>setLabel(e.target.value)}/></label>}
            {!isGallery&&<label>{ar?'قوة التأثير':'Motion strength'} <strong>{amount}</strong><input type="range" min="0" max="25" value={amount} onChange={e=>setAmount(Number(e.target.value))}/></label>}
            <label>{ar?'استدارة الزوايا':'Corner radius'} <strong>{radius}px</strong><input type="range" min="0" max="35" value={radius} onChange={e=>setRadius(Number(e.target.value))}/></label>
          </div>
          <div className="rkl-codebox">
            <div className="rkl-codebar"><div role="tablist" aria-label={ar?'صيغة التصدير':'Export format'}>{(['html','react'] as const).map(f=><button type="button" role="tab" aria-selected={format===f} key={f} onClick={()=>setFormat(f)} className={format===f?'active':''}>{f==='html'?'HTML + CSS + JS':'React JSX'}</button>)}</div>
              <div className="rkl-actions"><button type="button" onClick={copy}><Copy size={14}/>{ar?'نسخ':'Copy'}</button><button type="button" onClick={download}><Download size={14}/>{ar?'تنزيل':'Save'}</button></div></div>
            <pre dir="ltr"><code>{code}</code></pre>
            <p className="rkl-feedback" role="status" aria-live="polite"><Code2 size={13}/>{status||(ar?'تصدير أصلي بلا مكتبات خارجية مدفوعة':'Original source. No premium dependency.')}</p>
          </div>
        </div>
      </aside>
    </div>
  </main>;
}

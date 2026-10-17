'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeft, ArrowRight, Check, Code2, Copy, Download, Heart,
  MousePointer2, Pause, Play, RotateCcw, Search, SlidersHorizontal,
} from 'lucide-react';
import type { Locale } from '@/i18n/config';
import {
  generateMotionExport, motionCategories, motionCount, motionPresets,
  type MotionCategory, type MotionPreset,
} from '@/lib/tools/original-motions';

type Filter = 'all' | MotionCategory | 'favorites';

const categoryLabel = (value: Filter, ar: boolean) =>
  value === 'all' ? (ar ? 'الكل' : 'All') :
  value === 'favorites' ? (ar ? 'المفضلة' : 'Favorites') :
  motionCategories.find(c=>c.id===value)?.[ar?'ar':'en'] ?? value;

function Preview({ preset, duration, playing, version, label, accent, loop }: {
  preset: MotionPreset;
  duration: number;
  playing: boolean;
  version: number;
  label: string;
  accent: string;
  loop: boolean;
  easing: string;
}) {
  const [interacting,setInteracting]=useState(false);
  const trigger=preset.interaction==='hover';
  const motionName='rtx-'+preset.slug+'-anim';
  const active=playing && (!trigger || interacting);
  const durationText=duration+'s';
  const bg=preset.content==='background';
  const background = preset.slug === 'grid-travel'
    ? { backgroundImage:'linear-gradient(#7777 1px,transparent 1px),linear-gradient(90deg,#7777 1px,transparent 1px)',backgroundSize:'45px 45px'}
    : preset.slug==='sheen-drift'
      ? {backgroundImage:'linear-gradient(110deg,#050505 5%,#222 35%,'+accent+'65 50%,#222 65%,#050505 95%)',backgroundSize:'300% 100%'}
      : preset.slug==='ambient-shift'
        ? {backgroundImage:'linear-gradient(120deg,#080808,'+accent+'75,#111)',backgroundSize:'250% 250%'}
        : {backgroundImage:'radial-gradient('+accent+'70 1px,transparent 1px)',backgroundSize:'26px 26px'};

  const style = {
    animationName: active?motionName:'none',
    animationDuration:durationText,
    animationTimingFunction:easing,
    animationIterationCount:loop?'infinite':1,
    animationFillMode:'both' as const,
    color:accent,
    ...(bg?background:{}),
  };

  if(bg) return <div key={preset.slug+version} className="rtm-background-preview" style={style} aria-label="Background animation example"><span>RAWNAK / MOTION</span></div>;
  return (
    <div className="rtm-preview-object-container">
      <button
        key={preset.slug+version}
        type="button"
        className={'rtm-demo-object'+(trigger?' rtm-demo-interactive':'')}
        style={style}
        onMouseEnter={()=>setInteracting(true)}
        onMouseLeave={()=>setInteracting(false)}
        onFocus={()=>setInteracting(true)}
        onBlur={()=>setInteracting(false)}
        aria-label={trigger?'Hover or focus to preview '+preset.en:'Replay animation'}
      >
        {label || 'Rawnak Motion'}
        {trigger && <MousePointer2 size={15} aria-hidden="true"/>}
      </button>
      {trigger && <p className="rtm-preview-hint">HOVER · FOCUS</p>}
    </div>
  );
}

function Thumb({preset}: {preset:MotionPreset}) {
  const isBg=preset.content==='background';
  return <div className={'rtm-thumb '+(isBg?'rtm-thumb-bg':'')}>
    <span className="rtm-thumb-grid" aria-hidden="true"/>
    <span className="rtm-thumb-target">{isBg?'◈':preset.category==='hover'?'→':preset.category==='loop'?'◎':preset.category==='text'?'Aa':'R'}</span>
  </div>;
}

export default function MotionLibrary({locale,baseHref}: {locale:Locale;baseHref:string}) {
  const ar=locale==='ar';
  const [category,setCategory]=useState<Filter>('all');
  const [query,setQuery]=useState('');
  const [selected,setSelected]=useState(motionPresets[0].slug);
  const [duration,setDuration]=useState(motionPresets[0].seconds??1.2);
  const [label,setLabel]=useState('Create something extraordinary.');
  const [accent,setAccent]=useState('#eeeeee');
  const [loop,setLoop]=useState(false);
  const [playing,setPlaying]=useState(true);
  const [version,setVersion]=useState(0);
  const [format,setFormat]=useState<'html'|'react'>('html');
  const [easing,setEasing]=useState('ease-in-out');
  const [feedback,setFeedback]=useState('');
  const [favorites,setFavorites]=useState<string[]>([]);
  const [loaded,setLoaded]=useState(false);
  const [limit,setLimit]=useState(15);

  useEffect(()=>{
    try {
      const saved=JSON.parse(localStorage.getItem('rawnak-motion-favorites-v1')||'[]');
      if(Array.isArray(saved))setFavorites(saved.filter((slug:unknown)=>typeof slug==='string'&&motionPresets.some(p=>p.slug===slug)) as string[]);
    }catch{/* Local storage can be disabled. */}
    setLoaded(true);
  },[]);
  useEffect(()=>{
    if(!loaded)return;
    try{localStorage.setItem('rawnak-motion-favorites-v1',JSON.stringify(favorites))}
    catch{/* Favorites remain usable during the session. */}
  },[favorites,loaded]);

  const active=motionPresets.find(x=>x.slug===selected)??motionPresets[0];
  const visible=useMemo(()=>motionPresets.filter(p=>
    (category==='all'||category==='favorites'&&favorites.includes(p.slug)||p.category===category) &&
    (p.en.toLowerCase().includes(query.trim().toLowerCase())||
     p.ar.includes(query.trim())||
     p.slug.includes(query.trim().toLowerCase()))
  ),[category,query,favorites]);
  const page=visible.slice(0,limit);
  const source=useMemo(()=>generateMotionExport({preset:active,label,accent,duration,repeat:loop,format,easing}),
    [active,label,accent,duration,loop,format,easing]);

  // Keyframes are exclusively curated in original-motions.ts, never user-injected CSS.
  const allFrames=useMemo(()=>motionPresets.map(p=>'@keyframes rtx-'+p.slug+'-anim{'+p.frames+'}').join('\n'),[]);

  function choose(p:MotionPreset) {
    setSelected(p.slug);
    setDuration(p.seconds??1.2);
    setLoop(p.category==='loop'||p.category==='background');
    setEasing(p.easing??'ease-in-out');
    setPlaying(true);
    setVersion(v=>v+1);
    setFeedback('');
  }
  function toggleFavorite(slug:string){
    setFavorites(prev=>prev.includes(slug)?prev.filter(x=>x!==slug):[...prev,slug]);
  }
  function replay(){
    setPlaying(true);
    setVersion(x=>x+1);
  }
  function updateFilter(value:Filter){
    setCategory(value);
    setLimit(15);
  }
  async function copy() {
    try {
      await navigator.clipboard.writeText(source);
      setFeedback(ar?'تم نسخ الكود':'Code copied');
    } catch {
      setFeedback(ar?'حدد الكود وانسخه يدويًا':'Select the source and copy manually');
    }
  }
  function download(){
    const blob=new Blob([source],{type:'text/plain;charset=utf-8'});
    const url=URL.createObjectURL(blob);
    const link=document.createElement('a');
    link.href=url;
    link.download='rawnak-'+active.slug+(format==='react'?'.jsx':'.html');
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
    setFeedback(ar?'تم تنزيل الكود':'Source downloaded');
  }

  return <main className="rtm-library" id="animation-library">
    <style>{allFrames}</style>
    <div className="rt-container rtm-hero">
      <Link href={baseHref} className="rtm-back">{ar?<ArrowRight size={15}/>:<ArrowLeft size={15}/>} {ar?'العودة إلى أدوات رونق':'Back to Rawnak Tools'}</Link>
      <div className="rtm-hero-overline">RAWNAK / ORIGINAL MOTIONS — 001</div>
      <h1>{ar?'مكتبة':'Motion'} <span>{ar?'الحركة.':'Library.'}</span></h1>
      <p>{ar?'تأثيرات حركة مجانية بكود أصلي. اختر التأثير، عدّل السرعة واللون، جرّبه فورًا، وصدّره لموقعك.':'An original free motion collection. Pick an effect, adjust its timing, preview it live and export clean source.'}</p>
      <div className="rtm-hero-facts"><span><Check size={13}/>{motionCount} {ar?'تأثير أصلي':'original effects'}</span><span>HTML / CSS / React JSX</span><span>{ar?'بدون تسجيل':'No account required'}</span></div>
    </div>

    <div className="rt-container rtm-workspace">
      <div className="rtm-browser-column">
        <div className="rtm-browser-header"><div><span className="rtm-eyebrow">{ar?'مكتبة التأثيرات':'EXPLORE THE COLLECTION'}</span><h2>{ar?'اختر أنيميشن':'Find your animation'}</h2></div><span className="rtm-count">{visible.length} / {motionCount}</span></div>
        <label className="rtm-search"><Search size={16}/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder={ar?'ابحث عن تأثير...':'Search animations...'} aria-label={ar?'بحث في تأثيرات الحركة':'Search animations'}/></label>
        <div className="rtm-filters" role="group" aria-label={ar?'تصفية المؤثرات':'Filter effects'}>
          {(['all',...motionCategories.map(c=>c.id),'favorites'] as Filter[]).map(cat=><button type="button" key={cat} onClick={()=>updateFilter(cat)} aria-pressed={category===cat} className={'rtm-filter '+(category===cat?'rtm-filter-active':'')}>{categoryLabel(cat,ar)}{cat==='favorites'?' ♡':''}</button>)}
        </div>
        <div className="rtm-cards">
          {page.map((p,i)=>(
            <div key={p.slug} className={'rtm-card '+(selected===p.slug?'rtm-card-selected':'')}>
              <button className="rtm-card-main" type="button" onClick={()=>choose(p)}>
                <Thumb preset={p}/>
                <span className="rtm-card-meta">{String(motionPresets.indexOf(p)+1).padStart(2,'0')} · {categoryLabel(p.category,ar)}</span>
                <strong>{ar?p.ar:p.en}</strong>
                <span className="rtm-card-link">{ar?'شاهد التأثير':'Preview'} <ArrowRight size={13}/></span>
              </button>
              <button className="rtm-card-fav" type="button" onClick={()=>toggleFavorite(p.slug)}
                aria-label={favorites.includes(p.slug)?(ar?'إزالة من المفضلة':'Remove from favorites'):(ar?'إضافة للمفضلة':'Save favorite')}
                aria-pressed={favorites.includes(p.slug)}><Heart size={15} fill={favorites.includes(p.slug)?'currentColor':'none'}/></button>
            </div>
          ))}
        </div>
        {visible.length===0&&<div className="rtm-empty"><p>{ar?'مفيش نتائج مطابقة.':'No matching effects.'}</p><button onClick={()=>{setQuery('');setCategory('all')}}>{ar?'عرض الكل':'Show all'}</button></div>}
        {visible.length>limit&&<button className="rtm-load" onClick={()=>setLimit(v=>v+15)}>{ar?'عرض المزيد':'Load more'} ({visible.length-limit})</button>}
      </div>

      <aside className="rtm-editor-column">
        <div className="rtm-editor-sticky">
          <div className="rtm-editor-heading"><div><span className="rtm-eyebrow">LIVE MOTION STUDIO</span><h2>{ar?active.ar:active.en}</h2></div><span className="rtm-ed-status">● LIVE</span></div>
          <div className="rtm-preview-window">
            <div className="rtm-preview-toolbar"><span><Play size={13}/>{ar?'المعاينة':'Preview'}</span><div><button type="button" onClick={replay} aria-label={ar?'إعادة تشغيل التأثير':'Replay'}><RotateCcw size={15}/></button><button type="button" onClick={()=>setPlaying(x=>!x)} aria-label={playing?(ar?'إيقاف':'Pause'):(ar?'تشغيل':'Play')}>{playing?<Pause size={15}/>:<Play size={15}/>}</button></div></div>
            <div className="rtm-preview-stage" onClick={replay}>
              <Preview preset={active} duration={duration} playing={playing} version={version} accent={accent} label={label} loop={loop} easing={easing}/>
            </div>
            <div className="rtm-preview-bottom">{active.interaction==='hover'?(ar?'مرّر المؤشر على العنصر أو ركّز عليه':'Hover or focus the element to trigger motion'):(ar?'اضغط على المعاينة لإعادة التشغيل':'Click preview to replay')}</div>
          </div>
          <div className="rtm-settings">
            <div className="rtm-settings-title"><SlidersHorizontal size={14}/>{ar?'تخصيص الحركة':'CUSTOMIZE'}</div>
            {active.content!=='background'&&<label className="rtm-field"><span>{ar?'النص':'Preview text'}</span><input value={label} onChange={e=>{setLabel(e.target.value);setVersion(n=>n+1)}} maxLength={65}/></label>}
            <div className="rtm-settings-pair">
              <label className="rtm-field"><span>{ar?'السرعة':'Duration'} <em>{duration.toFixed(1)}s</em></span><input type="range" min=".3" max="8" step=".1" value={duration} onChange={e=>{setDuration(Number(e.target.value));setVersion(v=>v+1)}}/></label>
              <label className="rtm-field"><span>{ar?'اللون':'Accent'}</span><input type="color" value={accent} onChange={e=>setAccent(e.target.value)}/></label>
            </div>
            <div className="rtm-settings-pair">
              <label className="rtm-field"><span>{ar?'منحنى التوقيت':'Easing'}</span><select value={easing} onChange={e=>setEasing(e.target.value)}><option value="ease-in-out">Ease in-out</option><option value="ease-out">Ease out</option><option value="linear">Linear</option><option value="ease-in">Ease in</option></select></label>
              <label className="rtm-loop"><input type="checkbox" checked={loop} onChange={e=>{setLoop(e.target.checked);setVersion(v=>v+1)}}/><span>{ar?'تكرار بلا توقف':'Infinite loop'}</span></label>
            </div>
          </div>
          <div className="rtm-code-area">
            <div className="rtm-code-bar">
              <div role="tablist" aria-label={ar?'تنسيق التصدير':'Export format'}>{(['html','react'] as const).map(f=><button key={f} role="tab" aria-selected={format===f} className={format===f?'is-active':''} onClick={()=>setFormat(f)}>{f==='html'?'HTML + CSS':'React JSX'}</button>)}</div>
              <div className="rtm-export-actions"><button onClick={copy} aria-label={ar?'نسخ الكود':'Copy code'}><Copy size={14}/>{ar?'نسخ':'Copy'}</button><button onClick={download} aria-label={ar?'تحميل الكود':'Download code'}><Download size={14}/>{ar?'تحميل':'Save'}</button></div>
            </div>
            <pre className="rtm-code" dir="ltr"><code>{source}</code></pre>
            <div className="rtm-feedback" role="status" aria-live="polite"><Code2 size={14}/>{feedback||(ar?'التصدير يعمل بدون إضافات خارجية':'Dependency-free exports, made by Rawnak.')}</div>
          </div>
        </div>
      </aside>
    </div>
    <section className="rt-container rtm-license-note">{ar?'كل تأثير في المجموعة الحالية مكتوب بصورة أصلية لـRawnak Tools، بدون إعادة نشر ملفات مكتبات أخرى.':'These effects are original to Rawnak Tools; no third-party premium or restricted source has been repackaged.'}</section>
  </main>;
}

'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeft, ArrowRight, Check, Code2, Copy, Download, Eye, Heart,
  MousePointer2, Play, RotateCcw, Search, SlidersHorizontal,
} from 'lucide-react';
import type { Locale } from '@/i18n/config';
import { exportInteraction, getInteractionStyle, interactionCount, interactionPresets, type InteractionKind } from '@/lib/tools/interaction-presets';

type Filter='all' | InteractionKind | 'favorites';

export default function InteractionLab({locale,baseHref}:{locale:Locale;baseHref:string}){
  const ar=locale==='ar';
  const [filter,setFilter]=useState<Filter>('all');
  const [query,setQuery]=useState('');
  const [chosen,setChosen]=useState(interactionPresets[0].id);
  const [duration,setDuration]=useState(1.1);
  const [label,setLabel]=useState('Design in motion');
  const [format,setFormat]=useState<'html'|'react'>('html');
  const [revision,setRevision]=useState(0);
  const [favorites,setFavorites]=useState<string[]>([]);
  const [favoriteReady,setFavoriteReady]=useState(false);
  const [feedback,setFeedback]=useState('');
  const [showLimit,setShowLimit]=useState(12);
  const previewRef=useRef<HTMLDivElement>(null);
  const preset=interactionPresets.find(x=>x.id===chosen)??interactionPresets[0];

  useEffect(()=>{
    try{
      const stored=JSON.parse(localStorage.getItem('rawnak-interactions-favorites-v1')||'[]');
      if(Array.isArray(stored))setFavorites(stored.filter((id:unknown)=>typeof id==='string'&&interactionPresets.some(x=>x.id===id)) as string[]);
    }catch{ /* Private browsing may disable storage. */ }
    setFavoriteReady(true);
  },[]);
  useEffect(()=>{
    if(!favoriteReady)return;
    try{localStorage.setItem('rawnak-interactions-favorites-v1',JSON.stringify(favorites))}
    catch{ /* Favorites still work within the current session. */ }
  },[favorites,favoriteReady]);

  useEffect(()=>{
    if(preset.kind!=='scroll')return;
    const el=previewRef.current;
    if(!el)return;
    if(window.matchMedia('(prefers-reduced-motion: reduce)').matches||!('IntersectionObserver' in window)){
      el.classList.add('rawnak-visible');
      return;
    }
    // The CSS is inserted before the class is toggled, avoiding a flash of motion.
    el.classList.add('rawnak-ready');
    const io=new IntersectionObserver(([entry])=>{
      if(entry?.isIntersecting){el.classList.add('rawnak-visible');io.disconnect();}
    },{threshold:.15});
    io.observe(el);
    const fallback=window.setTimeout(()=>{el.classList.add('rawnak-visible');io.disconnect();},8000);
    return ()=>{io.disconnect();window.clearTimeout(fallback);};
  },[chosen,revision,preset.kind]);

  const results=useMemo(()=>interactionPresets.filter(item=>
    (filter==='all'||filter==='favorites'&&favorites.includes(item.id)||item.kind===filter)&&
    (item.en.toLowerCase().includes(query.toLowerCase().trim())||
     item.ar.includes(query.trim())||
     item.id.includes(query.toLowerCase().trim()))
  ),[filter,query,favorites]);

  const css=getInteractionStyle(preset,duration);
  const source=useMemo(()=>exportInteraction({preset,duration,text:label,format}),[preset,duration,label,format]);

  function choose(id:string){setChosen(id);setRevision(n=>n+1);setFeedback('');}
  function toggleFavorite(id:string){setFavorites(xs=>xs.includes(id)?xs.filter(x=>x!==id):[...xs,id]);}
  function replay(){setRevision(x=>x+1);}
  function pointerMove(e:React.PointerEvent<HTMLDivElement>){
    if(preset.kind!=='pointer'||window.matchMedia('(prefers-reduced-motion: reduce)').matches)return;
    const r=e.currentTarget.getBoundingClientRect();
    if(r.width<=0||r.height<=0)return;
    e.currentTarget.style.setProperty('--x',Math.max(0,Math.min(100,(e.clientX-r.left)/r.width*100))+'%');
    e.currentTarget.style.setProperty('--y',Math.max(0,Math.min(100,(e.clientY-r.top)/r.height*100))+'%');
  }
  function pointerLeave(e:React.PointerEvent<HTMLDivElement>){
    e.currentTarget.style.setProperty('--x','50%');
    e.currentTarget.style.setProperty('--y','50%');
  }
  async function copyCode(){
    try{await navigator.clipboard.writeText(source);setFeedback(ar?'تم نسخ الكود':'Code copied');}
    catch{setFeedback(ar?'انسخ الكود يدويًا':'Select the code and copy manually');}
  }
  function downloadCode(){
    const url=URL.createObjectURL(new Blob([source],{type:'text/plain;charset=utf-8'}));
    const anchor=document.createElement('a');
    anchor.href=url;anchor.download='rawnak-'+preset.id+(format==='react'?'.jsx':'.html');
    document.body.appendChild(anchor);anchor.click();anchor.remove();URL.revokeObjectURL(url);
    setFeedback(ar?'تم تنزيل الملف':'Source downloaded');
  }
  const tabs:[Filter,string,string][]=[
    ['all','All effects','كل التأثيرات'],
    ['scroll','Scroll','التمرير'],
    ['pointer','Interactive BG','خلفيات تفاعلية'],
    ['favorites','Favorites','المفضلة'],
  ];

  return <main className="rti-lab">
    <div className="rt-container rti-hero">
      <Link href={baseHref} className="rti-back">{ar?<ArrowRight size={16}/>:<ArrowLeft size={16}/>} {ar?'أدوات رونق':'Back to Rawnak Tools'}</Link>
      <div className="rt-eyebrow">SCROLL · POINTER · INTERACTION</div>
      <h1>{ar?'تجربة':'Interaction'} <span>{ar?'الحركة.':'Lab.'}</span></h1>
      <p>{ar?'تأثيرات متقدمة بنسخة أصلية: حركة عند التمرير، وخلفيات تتجاوب مع المؤشر. جرّبها وصدّر الكود بدون مكتبات مدفوعة.':'Original scroll-triggered reveals and responsive cursor backgrounds. Customize them, test them, and export source without premium dependencies.'}</p>
      <div className="rti-stats"><span>{interactionCount} {ar?'تأثير':'effects'}</span><span>12 SCROLL</span><span>12 INTERACTIVE</span><span>HTML / REACT</span></div>
    </div>

    <div className="rt-container rti-workspace">
      <section className="rti-browser" aria-label={ar?'اختيار التأثير':'Choose an effect'}>
        <div className="rti-browser-heading"><h2>{ar?'اختار التأثير':'Explore effects'}</h2><span>{results.length} / {interactionCount}</span></div>
        <label className="rti-search"><Search size={16}/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder={ar?'ابحث عن تأثير...':'Search effects...'} aria-label={ar?'البحث في التأثيرات':'Search effects'}/></label>
        <div className="rti-tabs" role="group" aria-label={ar?'تصفية التأثيرات':'Filter effects'}>
          {tabs.map(([value,en,arabic])=><button key={value} type="button" aria-pressed={filter===value} className={filter===value?'is-selected':''} onClick={()=>{setFilter(value);setShowLimit(12);}}>{ar?arabic:en}</button>)}
        </div>
        <div className="rti-card-grid">
          {results.slice(0,showLimit).map((item,i)=>
            <div className={'rti-card '+(chosen===item.id?'is-selected':'')} key={item.id}>
              <button type="button" className="rti-card-main" onClick={()=>choose(item.id)}>
                <div className={'rti-card-visual '+(item.kind==='pointer'?'pointer':'scroll')}>
                  <span>{item.kind==='scroll'?'↗':'◎'}</span>
                </div>
                <span className="rti-card-number">{String(interactionPresets.indexOf(item)+1).padStart(2,'0')} / {item.kind.toUpperCase()}</span>
                <strong>{ar?item.ar:item.en}</strong>
                <span className="rti-card-open">{ar?'معاينة':'Preview'} <ArrowRight size={13}/></span>
              </button>
              <button type="button" className="rti-save" onClick={()=>toggleFavorite(item.id)} aria-pressed={favorites.includes(item.id)}
                aria-label={favorites.includes(item.id)?(ar?'إزالة من المفضلة':'Remove favorite'):(ar?'حفظ في المفضلة':'Add favorite')}>
                <Heart size={15} fill={favorites.includes(item.id)?'currentColor':'none'}/>
              </button>
            </div>
          )}
        </div>
        {results.length===0&&<div className="rti-empty">{ar?'لا توجد نتائج مطابقة.':'No matching effects.'} <button type="button" onClick={()=>{setFilter('all');setQuery('')}}>{ar?'عرض الكل':'Show all'}</button></div>}
        {results.length>showLimit&&<button type="button" className="rti-more" onClick={()=>setShowLimit(v=>v+12)}>{ar?'عرض المزيد':'Load more'} ({results.length-showLimit})</button>}
      </section>

      <aside className="rti-editor">
        <div className="rti-editor-inner">
          <div className="rti-editor-title"><div><div className="rt-eyebrow">INTERACTIVE / LIVE</div><h2>{ar?preset.ar:preset.en}</h2></div><span>● LIVE</span></div>
          <div className="rti-preview-frame">
            <div className="rti-preview-top"><span><Eye size={15}/>{ar?'معاينة مباشرة':'Live preview'}</span><button type="button" onClick={replay}><RotateCcw size={15}/> {ar?'إعادة':'Replay'}</button></div>
            <style>{css}</style>
            <div className="rti-preview-zone">
              {preset.kind==='scroll'?
                <div key={preset.id+'-'+revision} ref={previewRef} className={'rti-animated-label rawnak-'+preset.id}>{label||'Design in motion'}</div>:
                <div key={preset.id} className={'rti-interactive-bg rawnak-'+preset.id} role="img"
                  aria-label={ar?'خلفية متجاوبة مع المؤشر':'Pointer reactive background'}
                  onPointerMove={pointerMove} onPointerLeave={pointerLeave} />
              }
            </div>
            <p className="rti-preview-instructions">{preset.kind==='scroll'
              ?(ar?'التأثير يظهر عندما يدخل العنصر الشاشة — اضغط إعادة لتجربته.':'This effect triggers when its element enters the viewport. Use Replay to test.')
              :(ar?'حرّك الماوس أو المس الخلفية.':'Move your pointer or touch the background.')}</p>
          </div>

          <div className="rti-settings">
            <div className="rti-settings-header"><SlidersHorizontal size={16}/>{ar?'التحكم':'CUSTOMIZE'}</div>
            {preset.kind==='scroll'&&<>
              <label className="rti-field">{ar?'النص':'Preview text'}<input value={label} maxLength={90} onChange={e=>{setLabel(e.target.value);setRevision(v=>v+1);}}/></label>
              <label className="rti-field">{ar?'المدة':'Duration'} <span>{duration.toFixed(1)}s</span><input type="range" min={0.3} max={3} step={0.1} value={duration} onChange={e=>{setDuration(Number(e.target.value));setRevision(v=>v+1);}}/></label>
            </>}
            {preset.kind==='pointer'&&<p className="rti-field-note">{ar?'الخلفية بتستخدم إحداثيات المؤشر داخل العنصر، وترجع تلقائيًا للمنتصف بعد ما المؤشر يخرج.':'The pointer position drives CSS variables. The visual resets to center on pointer leave.'}</p>}
          </div>

          <div className="rti-code">
            <div className="rti-code-top"><div role="tablist" aria-label="Code export format">
              {(['html','react'] as const).map(f=><button key={f} role="tab" aria-selected={format===f} onClick={()=>setFormat(f)} className={format===f?'selected':''}>{f==='html'?'HTML + CSS + JS':'React JSX'}</button>)}
            </div><div className="rti-code-actions"><button type="button" onClick={copyCode}><Copy size={14}/>{ar?'نسخ':'Copy'}</button><button type="button" onClick={downloadCode}><Download size={14}/>{ar?'تنزيل':'Save'}</button></div></div>
            <pre dir="ltr"><code>{source}</code></pre>
            <div className="rti-code-feedback" role="status" aria-live="polite"><Code2 size={14}/>{feedback||(ar?'الكود أصلّي ومتاح للتصدير.':'Independent, editable source. No paid dependency.')}</div>
          </div>
        </div>
      </aside>
    </div>
  </main>;
}

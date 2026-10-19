'use client';

import { useEffect, useMemo, useRef, useState, type PointerEvent, type CSSProperties } from 'react';
import Link from 'next/link';
import {
  ArrowLeft, ArrowRight, ArrowUpRight, Check, Code2, Copy, Download,
  Heart, Play, RotateCcw, Save, Search, SlidersHorizontal, Sparkles,
} from 'lucide-react';
import type { Locale } from '@/i18n/config';
import { collection, LiveComponent, sourceFor, type ComponentKind } from '@/components/tools/ComponentLibrary';
import { LiveDemo } from '@/components/tools/KineticLab';
import { motionPresets, generateMotionExport, type MotionPreset } from '@/lib/tools/original-motions';
import { interactionPresets, exportInteraction, getInteractionStyle, type InteractionPreset } from '@/lib/tools/interaction-presets';
import { kineticPresets, kineticExport, type KineticPreset } from '@/lib/tools/kinetic-presets';
import { toolCatalog } from '@/lib/tools/catalog';
import { experimentShortcuts } from '@/lib/tools/experiment-shortcuts';

type Family='motion'|'interaction'|'kinetic'|'component'|'utility'|'experiment'|'timeline';
type Scope='all'|Family|'favorites';
type Format='html'|'react';
type Preset={id:string;name:{en:string;ar:string};family:Family;sub:string;summary:string};
type Config={label:string;accent:string;duration:number;radius:number;strength:number;loop:boolean;easing:string};
const defaultConfig:Config={label:'Build what is next',accent:'#eeeeee',duration:1.3,radius:18,strength:16,loop:false,easing:'ease-in-out'};

const unified:Preset[]=[
  ...motionPresets.map(p=>({id:'motion:'+p.slug,name:{en:p.en,ar:p.ar},family:'motion' as const,sub:p.category,summary:'CSS'})),
  ...interactionPresets.map(p=>({id:'interaction:'+p.id,name:{en:p.en,ar:p.ar},family:'interaction' as const,sub:p.kind,summary:'INTERACTION'})),
  ...kineticPresets.map(p=>({id:'kinetic:'+p.id,name:{en:p.en,ar:p.ar},family:'kinetic' as const,sub:p.category,summary:'3D / POINTER'})),
  ...collection.map(p=>({id:'component:'+p.slug,name:{en:p.en,ar:p.ar},family:'component' as const,sub:p.category.toLowerCase(),summary:'UI COMPONENT'})),
  ...toolCatalog.map(p=>({id:'utility:'+p.slug,name:{en:p.label.en,ar:p.label.ar},family:'utility' as const,sub:p.category.en.toLowerCase(),summary:'SPECIALIZED STUDIO'})),
  ...experimentShortcuts.map(p=>({id:'experiment:'+p.id,name:{en:p.en,ar:p.ar},family:'experiment' as const,sub:p.section.toLowerCase(),summary:'EXPERIMENTAL LAB'})),
  {id:'timeline:composer',name:{en:'Motion Timeline',ar:'خط الزمن للحركة'},family:'timeline' as const,sub:'multitrack editor',summary:'COMPOSER'},
];
const scopes:Scope[]=['all','motion','interaction','kinetic','component','experiment','timeline','utility','favorites'];
const groupLabels:Record<Scope,{en:string;ar:string}>={
  all:{en:'Everything',ar:'الكل'},
  motion:{en:'Animations',ar:'أنيميشن'},
  interaction:{en:'Scroll & Cursor',ar:'تمرير ومؤشر'},
  kinetic:{en:'3D & Galleries',ar:'ثلاثي الأبعاد'},
  component:{en:'UI Components',ar:'مكونات UI'},
  utility:{en:'Tools',ar:'الأدوات'},
  experiment:{en:'Advanced V7–V10',ar:'المتقدمة V7–V10'},
  timeline:{en:'Timeline',ar:'الخط الزمني'},
  favorites:{en:'Saved',ar:'المفضلة'},
};

function MotionPreview({preset,config,revision}:{preset:MotionPreset;config:Config;revision:number}){
  const [hover,setHover]=useState(false);
  const bg=preset.content==='background';
  const isHover=preset.interaction==='hover';
  const name='rtv-'+preset.slug.replace(/[^a-z-]/g,'')+'-motion';
  const background=preset.slug==='grid-travel'?
    'linear-gradient(#ffffff3b 1px,transparent 1px),linear-gradient(90deg,#ffffff3b 1px,transparent 1px)':
    preset.slug==='sheen-drift'?'linear-gradient(115deg,#080808,#333,'+config.accent+'75,#080808)':
    preset.slug==='ambient-shift'?'linear-gradient(135deg,#050505,'+config.accent+'65,#050505)':
    'radial-gradient('+config.accent+'8c 1px,transparent 1px)';
  const style:CSSProperties={
    animationName:isHover&&!hover?'none':name,
    animationDuration:config.duration+'s',
    animationIterationCount:isHover?1:config.loop?'infinite':1,
    animationFillMode:'both',
    animationTimingFunction:config.easing,
    color:config.accent,
    ...(bg?{backgroundImage:background,backgroundSize:preset.slug==='sheen-drift'?'300% 100%':preset.slug==='ambient-shift'?'260% 260%':'28px 28px'}:{}),
  };
  return <>
    <style>{'@keyframes '+name+'{'+preset.frames+'} @media(prefers-reduced-motion:reduce){.rtv-motion-preview{animation:none!important}}'}</style>
    {bg?<div key={revision+'-'+preset.slug} className="rtv-motion-preview rtv-background-sample" style={style}><span>RAWNAK / MOTION</span></div>:
      <button type="button" key={revision+'-'+preset.slug} className={'rtv-motion-preview rtv-motion-sample'+(isHover?' rtv-hover-sample':'')}
        onPointerEnter={()=>setHover(true)} onPointerLeave={()=>setHover(false)} onFocus={()=>setHover(true)} onBlur={()=>setHover(false)}
        style={style}>{config.label||'Rawnak'}{isHover&&<ArrowUpRight size={19}/>}</button>}
  </>;
}

function InteractionPreview({preset,config,revision}:{preset:InteractionPreset;config:Config;revision:number}){
  const node=useRef<HTMLDivElement>(null);
  useEffect(()=>{
    if(preset.kind!=='scroll')return;
    const el=node.current;if(!el)return;
    if(window.matchMedia('(prefers-reduced-motion: reduce)').matches||!('IntersectionObserver' in window))return;
    el.classList.add('rawnak-ready');
    const obs=new IntersectionObserver(([entry])=>{if(entry?.isIntersecting){el.classList.add('rawnak-visible');obs.disconnect();}},{threshold:.15});
    obs.observe(el);
    const fallback=window.setTimeout(()=>{el.classList.add('rawnak-visible');obs.disconnect()},6500);
    return()=>{obs.disconnect();clearTimeout(fallback)};
  },[preset.id,preset.kind,revision,config.duration]);
  const move=(e:PointerEvent<HTMLDivElement>)=>{
    if(preset.kind!=='pointer'||window.matchMedia('(prefers-reduced-motion: reduce)').matches)return;
    const r=e.currentTarget.getBoundingClientRect();if(!r.width||!r.height)return;
    e.currentTarget.style.setProperty('--x',Math.max(0,Math.min(100,(e.clientX-r.left)/r.width*100))+'%');
    e.currentTarget.style.setProperty('--y',Math.max(0,Math.min(100,(e.clientY-r.top)/r.height*100))+'%');
  };
  return <>
    <style>{getInteractionStyle(preset,config.duration)}</style>
    {preset.kind==='scroll'?
      <div key={preset.id+'-'+revision} ref={node} className={'rtv-scroll-sample rawnak-'+preset.id}>{config.label||'Rawnak'}</div>:
      <div key={preset.id+'-'+revision} onPointerMove={move}
        onPointerLeave={e=>{e.currentTarget.style.setProperty('--x','50%');e.currentTarget.style.setProperty('--y','50%')}}
        className={'rtv-pointer-sample rawnak-'+preset.id} role="img" aria-label="Pointer-responsive background"/>}
  </>;
}

function Preview({item,config,revision}:{item:Preset;config:Config;revision:number}){
  if(item.family==='motion'){
    const preset=motionPresets.find(x=>'motion:'+x.slug===item.id);
    return preset?<MotionPreview preset={preset} config={config} revision={revision}/>:null;
  }
  if(item.family==='interaction'){
    const preset=interactionPresets.find(x=>'interaction:'+x.id===item.id);
    return preset?<InteractionPreview preset={preset} config={config} revision={revision}/>:null;
  }
  if(item.family==='kinetic'){
    const preset=kineticPresets.find(x=>'kinetic:'+x.id===item.id);
    return preset?<LiveDemo key={item.id+'-'+revision} preset={preset} label={config.label}
      amount={config.strength} radius={config.radius} version={revision}/>:null;
  }
  if(item.family==='component'){
    const kind=item.id.split(':')[1] as ComponentKind;
    return <LiveComponent key={item.id+'-'+revision} kind={kind} text={config.label}
      accent={config.accent} radius={config.radius} duration={config.duration}/>;
  }
  return <div className="rtv-specialized"><Sparkles size={35}/><h3>{item.name.en}</h3>
    <p>This tool opens in its full-featured specialist editor.</p></div>;
}

export default function VisualStudio({locale,baseHref,toolsHost}:{locale:Locale;baseHref:string;toolsHost:boolean}){
  const ar=locale==='ar';
  const [scope,setScope]=useState<Scope>('all');
  const [search,setSearch]=useState('');
  const [chosen,setChosen]=useState(unified[0].id);
  const [config,setConfig]=useState<Config>(defaultConfig);
  const [format,setFormat]=useState<Format>('html');
  const [revision,setRevision]=useState(0);
  const [favorites,setFavorites]=useState<string[]>([]);
  const [saved,setSaved]=useState<Record<string,Config>>({});
  const [storageReady,setStorageReady]=useState(false);
  const [notice,setNotice]=useState('');
  const [limit,setLimit]=useState(30);
  const item=unified.find(x=>x.id===chosen)??unified[0];
  const needsText=item.family!=='interaction'||interactionPresets.find(p=>'interaction:'+p.id===chosen)?.kind==='scroll';
  const isUtility=item.family==='utility'||item.family==='experiment'||item.family==='timeline';
  const isKineticGallery=item.family==='kinetic'&&kineticPresets.find(p=>'kinetic:'+p.id===chosen)?.category==='galleries';
  const showDuration=item.family==='motion'||item.family==='interaction'&&interactionPresets.some(p=>'interaction:'+p.id===chosen&&p.kind==='scroll')||
    item.family==='component'&&chosen==='component:text-reveal';
  const showRadius=item.family==='kinetic'||item.family==='component';
  const showStrength=item.family==='kinetic'&&!isKineticGallery;
  const showAccent=item.family==='motion'||item.family==='component';
  const allowLoop=item.family==='motion';

  useEffect(()=>{
    try{
      const f=JSON.parse(localStorage.getItem('rawnak-vstudio-favorites-v1')||'[]');
      const c=JSON.parse(localStorage.getItem('rawnak-vstudio-presets-v1')||'{}');
      if(Array.isArray(f))setFavorites(f.filter((v:unknown)=>typeof v==='string'&&unified.some(p=>p.id===v)) as string[]);
      if(c&&typeof c==='object'&&!Array.isArray(c))setSaved(c as Record<string,Config>);
    }catch{/* Storage may be unavailable in private browsing. */}
    setStorageReady(true);
  },[]);
  useEffect(()=>{if(!storageReady)return;try{localStorage.setItem('rawnak-vstudio-favorites-v1',JSON.stringify(favorites));}catch{}},[favorites,storageReady]);
  useEffect(()=>{if(!storageReady)return;try{localStorage.setItem('rawnak-vstudio-presets-v1',JSON.stringify(saved));}catch{}},[saved,storageReady]);

  const results=useMemo(()=>unified.filter(p=>(scope==='all'||scope==='favorites'&&favorites.includes(p.id)||p.family===scope)&&
    (p.name.en.toLowerCase().includes(search.trim().toLowerCase())||
     p.name.ar.includes(search.trim())||
     p.sub.includes(search.trim().toLowerCase()))),[scope,search,favorites]);

  function select(p:Preset){
    setChosen(p.id);setConfig(saved[p.id]??(p.family==='motion'?{...defaultConfig,duration:motionPresets.find(x=>x.slug===p.id.slice(7))?.seconds??1.3,loop:motionPresets.some(x=>x.slug===p.id.slice(7)&&x.category==='loop')}:defaultConfig));
    setNotice('');setRevision(n=>n+1);
  }
  const update=<K extends keyof Config>(key:K,value:Config[K])=>setConfig(p=>({...p,[key]:value}));
  const source=useMemo(()=>{
    if(item.family==='motion'){
      const preset=motionPresets.find(p=>'motion:'+p.slug===item.id);
      return preset?generateMotionExport({preset,label:config.label,accent:config.accent,duration:config.duration,
        repeat:config.loop,format,easing:config.easing}):'';
    }
    if(item.family==='interaction'){
      const preset=interactionPresets.find(p=>'interaction:'+p.id===item.id);
      return preset?exportInteraction({preset,duration:config.duration,text:config.label,format}):'';
    }
    if(item.family==='kinetic'){
      const preset=kineticPresets.find(p=>'kinetic:'+p.id===item.id);
      return preset?kineticExport({preset,format,label:config.label,amount:config.strength,radius:config.radius}):'';
    }
    if(item.family==='component')return sourceFor(item.id.split(':')[1] as ComponentKind,
      config.label,config.accent,config.radius,config.duration,format);
    return '';
  },[item,config,format]);

  function toggleFavorite(id:string){setFavorites(old=>old.includes(id)?old.filter(v=>v!==id):[...old,id]);}
  function savePreset(){setSaved(old=>({...old,[item.id]:{...config}}));setNotice(ar?'تم حفظ إعدادات المكون':'Settings saved locally');}
  function resetPreset(){setConfig(defaultConfig);setRevision(n=>n+1);setNotice(ar?'إعادة ضبط':'Reset to defaults');}
  async function copy(){
    try{await navigator.clipboard.writeText(source);setNotice(ar?'تم نسخ الكود':'Source copied');}
    catch{setNotice(ar?'انسخ النص يدويًا':'Clipboard unavailable: select and copy the source');}
  }
  function download(){
    const blob=new Blob([source],{type:'text/plain;charset=utf-8'});
    const url=URL.createObjectURL(blob);
    const a=document.createElement('a');a.href=url;a.download='rawnak-'+item.id.replace(':','-')+(format==='react'?'.jsx':'.html');
    document.body.appendChild(a);a.click();a.remove();URL.revokeObjectURL(url);
    setNotice(ar?'الملف جاهز':'Source downloaded');
  }
  const destination= item.family==='experiment'
    ? experimentShortcuts.find(p=>'experiment:'+p.id===item.id)?.page
    : item.family==='timeline'?'timeline':item.id.slice('utility:'.length);
  const utilityHref=(toolsHost?'/'+locale+'/':'/'+locale+'/tools/')+(destination||'');

  return <main className="rtv-root">
    <div className="rtv-intro rt-container">
      <Link href={baseHref} className="rtv-back">{ar?<ArrowRight size={15}/>:<ArrowLeft size={15}/>} {ar?'العودة لرونق':'Back to Rawnak Tools'}</Link>
      <div className="rt-eyebrow">RAWNAK / VISUAL STUDIO</div>
      <h1>{ar?'مساحة':'Create'} <span>{ar?'الإبداع.':'without limits.'}</span></h1>
      <p>{ar?'اختار من مكتبة رونق كلها، جرّب الحركة والتفاعل مباشرة، وعدّل التفاصيل وصدّر الكود من مكان واحد.':'One workspace for every Rawnak effect. Explore, customize, preview, and export — all in one place.'}</p>
      <div className="rtv-metrics"><span><Check size={14}/>{unified.length} {ar?'عنصر متاح':'items available'}</span><span>HTML / CSS / REACT</span><span>{ar?'بدون حساب':'NO ACCOUNT REQUIRED'}</span></div>
    </div>

    <div className="rt-container rtv-workspace">
      <aside className="rtv-catalog">
        <div className="rtv-catalog-header"><strong>{ar?'مكتبة العناصر':'Component explorer'}</strong><span>{results.length} / {unified.length}</span></div>
        <label className="rtv-search"><Search size={16}/><input value={search} onChange={e=>setSearch(e.target.value)}
          placeholder={ar?'ابحث في المكتبة...':'Search everything...'} aria-label={ar?'بحث':'Search components'}/></label>
        <div className="rtv-filter-list" role="group" aria-label={ar?'تصنيفات':'Categories'}>
          {scopes.map(s=><button key={s} type="button" aria-pressed={scope===s}
            className={scope===s?'selected':''} onClick={()=>{setScope(s);setLimit(30)}}>{groupLabels[s][locale]} <span>{s==='all'?unified.length:s==='favorites'?favorites.length:unified.filter(p=>p.family===s).length}</span></button>)}
        </div>
        <div className="rtv-items">
          {results.slice(0,limit).map((p,i)=><div key={p.id} className={'rtv-item '+(p.id===item.id?'active':'')}>
            <button type="button" className="rtv-item-select" onClick={()=>select(p)}>
              <span className="rtv-item-icon">{p.family==='motion'?'◌':p.family==='interaction'?'◎':p.family==='kinetic'?'◇':p.family==='component'?'▣':'⌘'}</span>
              <span className="rtv-item-text"><strong>{p.name[locale]}</strong><small>{p.sub.toUpperCase()}</small></span>
              <ArrowUpRight size={14}/>
            </button>
            <button type="button" onClick={()=>toggleFavorite(p.id)}
              className="rtv-favorite" aria-pressed={favorites.includes(p.id)}
              aria-label={favorites.includes(p.id)?(ar?'إزالة من المفضلة':'Remove favorite'):(ar?'حفظ في المفضلة':'Save favorite')}>
              <Heart size={14} fill={favorites.includes(p.id)?'currentColor':'none'}/>
            </button>
          </div>)}
        </div>
        {results.length>limit&&<button className="rtv-load" onClick={()=>setLimit(v=>v+30)}>{ar?'عرض المزيد':'Show more'} ({results.length-limit})</button>}
        {results.length===0&&<div className="rtv-empty">{ar?'لا توجد نتائج':'No matching components'} <button onClick={()=>{setScope('all');setSearch('')}}>{ar?'عرض الكل':'Clear filters'}</button></div>}
      </aside>

      <section className="rtv-workarea">
        <div className="rtv-workarea-header"><div><div className="rt-eyebrow">LIVE / PREVIEW</div><h2>{item.name[locale]}</h2></div><span className="rtv-current">{item.family.toUpperCase()}</span></div>
        <div className="rtv-preview-frame">
          <div className="rtv-preview-toolbar"><span><Play size={13}/>{ar?'معاينة مباشرة':'Live preview'}</span>
            <button type="button" onClick={()=>setRevision(v=>v+1)}><RotateCcw size={14}/>{ar?'إعادة':'Replay'}</button>
          </div>
          <div className="rtv-preview-stage"><Preview key={item.id} item={item} config={config} revision={revision}/></div>
          <div className="rtv-preview-bottom">{ar?'جرّب المؤشر أو اللمس، وغيّر الإعدادات علشان تشوف الفرق.':'Interact with the canvas, or change settings to update the result.'}</div>
        </div>
        {isUtility?
          <div className="rtv-utility-link"><p>{ar?'التجربة دي لها معمل متخصص؛ افتحه علشان تجرب التأثير بإعداداته الكاملة.':'This experience opens in its dedicated interactive lab with the full controls.'}</p>
            <Link href={utilityHref} className="rtv-action-primary">{ar?'افتح المحرر':'Open editor'} <ArrowUpRight size={15}/></Link>
          </div>:
          <>
            <div className="rtv-controls">
              <div className="rtv-control-head"><span><SlidersHorizontal size={15}/>{ar?'تخصيص العنصر':'Customize'}</span><div><button type="button" onClick={resetPreset}><RotateCcw size={14}/>{ar?'ضبط':'Reset'}</button><button type="button" onClick={savePreset}><Save size={14}/>{ar?'حفظ':'Save preset'}</button></div></div>
              <div className="rtv-control-grid">
                {needsText&&!isKineticGallery&&<label className="rtv-control">{ar?'النص':'Label'}<input value={config.label} maxLength={100} onChange={e=>update('label',e.target.value)}/></label>}
                {showAccent&&<label className="rtv-control">{ar?'اللون':'Accent color'}<input type="color" value={config.accent} onChange={e=>update('accent',e.target.value)}/></label>}
                {showDuration&&<label className="rtv-control">{ar?'مدة التأثير':'Duration'} <em>{config.duration.toFixed(1)}s</em>
                  <input type="range" min=".3" max="8" step=".1" value={config.duration} onChange={e=>{update('duration',Number(e.target.value));setRevision(n=>n+1)}}/></label>}
                {showRadius&&<label className="rtv-control">{ar?'استدارة الحواف':'Corner radius'} <em>{config.radius}px</em>
                  <input type="range" min="0" max="36" value={config.radius} onChange={e=>update('radius',Number(e.target.value))}/></label>}
                {showStrength&&<label className="rtv-control">{ar?'قوة الحركة':'Motion strength'} <em>{config.strength}</em>
                  <input type="range" min="0" max="25" value={config.strength} onChange={e=>update('strength',Number(e.target.value))}/></label>}
                {allowLoop&&<label className="rtv-check"><input type="checkbox" checked={config.loop} onChange={e=>update('loop',e.target.checked)}/>{ar?'تكرار مستمر':'Infinite loop'}</label>}
                {item.family==='motion'&&<label className="rtv-control">{ar?'منحنى الحركة':'Easing'}<select value={config.easing} onChange={e=>update('easing',e.target.value)}>
                  <option value="ease-in-out">Ease in-out</option><option value="ease-out">Ease out</option><option value="ease-in">Ease in</option><option value="linear">Linear</option></select></label>}
              </div>
            </div>
            <div className="rtv-codebox">
              <div className="rtv-codebar"><div role="tablist" aria-label={ar?'صيغة التصدير':'Export code'}>
                {(['html','react'] as const).map(f=><button type="button" key={f} role="tab" aria-selected={format===f}
                  className={format===f?'selected':''} onClick={()=>setFormat(f)}>{f==='react'?'React JSX':'HTML / CSS / JS'}</button>)}</div>
                <div><button type="button" onClick={copy}><Copy size={14}/>{ar?'نسخ':'Copy'}</button><button type="button" onClick={download}><Download size={14}/>{ar?'تنزيل':'Download'}</button></div>
              </div>
              <pre dir="ltr"><code>{source}</code></pre>
              <p role="status" aria-live="polite" className="rtv-status"><Code2 size={13}/>{notice||(ar?'الكود يتحدث تلقائيًا مع الإعدادات.':'Generated code updates with your controls.')}</p>
            </div>
          </>
        }
      </section>
    </div>
  </main>;
}

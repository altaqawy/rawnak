'use client';

import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react';
import { ArrowLeft, ArrowRight, ArrowUpRight, Code2, Copy, Cpu, ExternalLink, MousePointer2, Pause, Play, RotateCcw, SlidersHorizontal, Sparkles } from 'lucide-react';
import type { Locale } from '@/i18n/config';
import type { GPUControls, GPUKind } from '@/components/tools/GpuScenes';

const SceneCanvas=dynamic(()=>import('@/components/tools/GpuCanvas'),{
  ssr:false,
  loading:()=> <div className="rgpu-loading" role="status">INITIALIZING / GPU</div>
});
const items:{id:GPUKind;en:string;ar:string;sub:string;summaryEn:string;summaryAr:string;source:string}[]=[
  {
    id:'atlas-globe',en:'Atlas Globe',ar:'الكرة المدارية',sub:'POINT CLOUD / GEOMETRY',
    summaryEn:'An interactive sphere with a Fibonacci point lattice, latitude lines and orbit markers.',
    summaryAr:'كرة تفاعلية من نقاط موزّعة رياضيًا وخطوط الطول والعرض وعلامات المدن.',
    source:'GlobeScene'
  },
  {
    id:'inside-dome',en:'Inside Dome',ar:'القبة الداخلية',sub:'PROCEDURAL / SHADER',
    summaryEn:'Stand inside an immersive procedural dome built with a custom GLSL shader.',
    summaryAr:'تجربة داخل قبة رقمية بخامة GLSL أصلية تتفاعل مع اتجاه النظر.',
    source:'DomeScene'
  },
  {
    id:'silk-ribbon',en:'Silk Ribbon',ar:'شريط حريري',sub:'LIVE MESH / PHYSICS',
    summaryEn:'A glowing mesh ribbon follows the pointer with spring-like inertia and a fading tail.',
    summaryAr:'شريط ثلاثي الأبعاد يتبع المؤشر بمرونة وتباطؤ وذيل متدرّج.',
    source:'RibbonScene'
  },
];

const initialPointer:GPUControls={x:0,y:0,dragX:0,dragY:0,pressed:false,active:false};

export default function GpuLab({locale,baseHref}:{locale:Locale;baseHref:string}){
  const ar=locale==='ar';
  const [kind,setKind]=useState<GPUKind>('atlas-globe');
  const [quality,setQuality]=useState<1|2|3>(2);
  const [strength,setStrength]=useState(16);
  const [playing,setPlaying]=useState(true);
  const [reduced,setReduced]=useState(false);
  const [dragging,setDragging]=useState(false);
  const [webgl,setWebgl]=useState<boolean|null>(null);
  const [notice,setNotice]=useState('');
  const [revision,setRevision]=useState(0);
  const pointer=useRef<GPUControls>({...initialPointer});
  const gesture=useRef<{x:number;y:number}|null>(null);
  const current=items.find(x=>x.id===kind)!;

  useEffect(()=>{
    const mq=window.matchMedia('(prefers-reduced-motion: reduce)');
    const update=()=>{setReduced(mq.matches);if(mq.matches)setPlaying(false)};
    update();mq.addEventListener('change',update);
    return()=>mq.removeEventListener('change',update);
  },[]);
  useEffect(()=>{
    try {
      const canvas=document.createElement('canvas');
      const context=canvas.getContext('webgl2',{failIfMajorPerformanceCaveat:true})||canvas.getContext('webgl',{failIfMajorPerformanceCaveat:true});
      setWebgl(Boolean(context));
      context?.getExtension('WEBGL_lose_context')?.loseContext();
    }catch{setWebgl(false)}
  },[]);
  useEffect(()=>{
    pointer.current={...initialPointer};
    gesture.current=null;
    setDragging(false);
  },[kind]);

  function down(e:ReactPointerEvent<HTMLDivElement>){
    gesture.current={x:e.clientX,y:e.clientY};
    pointer.current.pressed=true;
    setDragging(true);
    try{e.currentTarget.setPointerCapture(e.pointerId)}catch{/* Safely ignore unsupported capture. */}
  }
  function move(e:ReactPointerEvent<HTMLDivElement>){
    const rect=e.currentTarget.getBoundingClientRect();
    if(!rect.width||!rect.height)return;
    pointer.current.x=Math.max(-1,Math.min(1,((e.clientX-rect.left)/rect.width)*2-1));
    pointer.current.y=Math.max(-1,Math.min(1,((e.clientY-rect.top)/rect.height)*2-1));
    pointer.current.active=true;
    if(gesture.current){
      pointer.current.dragX+=e.clientX-gesture.current.x;
      pointer.current.dragY+=e.clientY-gesture.current.y;
      gesture.current={x:e.clientX,y:e.clientY};
    }
  }
  function finish(){
    gesture.current=null;
    pointer.current.pressed=false;
    setDragging(false);
  }
  function reset(){
    pointer.current={...initialPointer};
    gesture.current=null;
    setRevision(v=>v+1);
    setNotice(ar?'تمت إعادة الضبط':'Scene reset');
  }
  const fullSource='https://github.com/altaqawy/rawnak/blob/feat/rawnak-tools-mvp/components/tools/GpuScenes.tsx';
  const sourceWrapper='https://github.com/altaqawy/rawnak/blob/feat/rawnak-tools-mvp/components/tools/GpuCanvas.tsx';
  const snippet=(
    "import GpuCanvas from '@/components/tools/GpuCanvas';\n"+
    "// Copy GpuScenes.tsx too; provide a pointer ref and your controls.\n"+
    '<GpuCanvas kind="'+kind+'" pointer={pointer} running={true}\n'+
    '  quality={2} strength={16} dragging={false}\n'+
    '  onContextLost={() => {}} />'
  );
  async function copy(){
    try{await navigator.clipboard.writeText(snippet);setNotice(ar?'تم نسخ طريقة الاستخدام':'Usage snippet copied');}
    catch{setNotice(ar?'انسخ المثال يدويًا':'Please select and copy the usage example');}
  }

  return <main className="rgpu-page">
    <div className="rt-container rgpu-hero">
      <Link href={baseHref} className="rgpu-back">{ar?<ArrowRight size={15}/>:<ArrowLeft size={15}/>}
        {ar?'العودة لأدوات رونق':'Back to Rawnak Tools'}</Link>
      <div className="rt-eyebrow">GPU EXPERIMENTS / THREE.JS / ORIGINAL MOTION</div>
      <h1>{ar?'عالم':'Beyond'} <span>{ar?'ثلاثي الأبعاد.':'the canvas.'}</span></h1>
      <p>{ar?'ثلاث تجارب تفاعلية برسوميات WebGL حقيقية: الكرة المدارية، القبة الداخلية، والشريط الحريري. متاحة للمعاينة والتخصيص داخل المختبر.':'Three first-party WebGL experiments: a mathematical point globe, an immersive inverted dome, and a responsive ribbon mesh. Real 3D, not static GIFs.'}</p>
      <div className="rgpu-features"><span><Cpu size={14}/> GPU / WEBGL</span><span>3 EXPERIMENTS</span><span>AR + EN</span><span>NO NEW DEPENDENCIES</span></div>
    </div>
    <div className="rt-container rgpu-layout">
      <aside className="rgpu-sidebar">
        <div className="rgpu-sidebar-label">{ar?'اختار التجربة':'EXPERIMENTS'} <span>03</span></div>
        {items.map((item,i)=><button key={item.id} type="button"
          className={'rgpu-menu-item '+(item.id===kind?'selected':'')}
          aria-pressed={item.id===kind}
          onClick={()=>{setKind(item.id);setNotice('');setRevision(v=>v+1)}}>
          <span>{String(i+1).padStart(2,'0')}</span>
          <span><strong>{ar?item.ar:item.en}</strong><small>{item.sub}</small></span>
          <ArrowUpRight size={15}/>
        </button>)}
        <div className="rgpu-sidebar-note"><Sparkles size={18}/>
          <p>{ar?'التجارب دي تجريبية، وبنوازن بين جودة الرسوم والأداء على الأجهزة المختلفة.':'Experimental GPU research. Quality settings trade visual detail for device performance.'}</p>
        </div>
      </aside>
      <div className="rgpu-workspace">
        <div className="rgpu-title">
          <div><span className="rt-eyebrow">{current.sub}</span><h2>{ar?current.ar:current.en}</h2><p>{ar?current.summaryAr:current.summaryEn}</p></div>
          <span className="rgpu-status">{webgl===false?'FALLBACK':'● WEBGL'}</span>
        </div>
        <div className="rgpu-viewport">
          <div className="rgpu-viewport-header"><span><MousePointer2 size={14}/> {ar?'معاينة تفاعلية':'LIVE VIEWPORT'}</span>
            <div><button onClick={reset} type="button"><RotateCcw size={14}/>{ar?'إعادة':'Reset'}</button>
              <button onClick={()=>setPlaying(p=>!p)} disabled={webgl===false||reduced} type="button">
                {playing?<Pause size={14}/>:<Play size={14}/>} {playing?(ar?'إيقاف':'Pause'):(ar?'تشغيل':'Play')}
              </button>
            </div>
          </div>
          <div className="rgpu-canvas-outer" onPointerDown={down} onPointerMove={move} onPointerUp={finish}
            onPointerCancel={finish} onPointerLeave={()=>{pointer.current.active=false;finish()}}>
            {webgl===false?<div className="rgpu-fallback">
              <div className={'rgpu-fallback-art '+kind}><div/><div/><div/></div>
              <strong>{ar?'وضع العرض البديل':'Static fallback'}</strong>
              <p>{ar?'الجهاز أو المتصفح لا يدعم تشغيل WebGL هنا. جرّب متصفحًا مع تسريع الرسوميات.':'WebGL is unavailable here. Try a browser with graphics acceleration.'}</p>
            </div>:webgl===null?<div className="rgpu-loading" role="status">DETECTING / WEBGL</div>:
              <SceneCanvas key={kind+'-'+revision} kind={kind} pointer={pointer} running={playing&&!reduced}
                quality={quality} strength={strength} dragging={dragging} onContextLost={()=>setWebgl(false)}/>}
            <div className="rgpu-canvas-info" aria-hidden="true">
              <span>RAWNAK / GPU ENGINE</span><span>QUALITY 0{quality}</span>
            </div>
          </div>
          <div className="rgpu-viewport-foot">{kind==='atlas-globe'?(ar?'اسحب لتدوير الكرة.':'Drag to rotate the sphere.'):
            kind==='inside-dome'?(ar?'حرّك المؤشر لتغيير اتجاه النظر.':'Move the pointer to look around.'):
            (ar?'حرّك المؤشر وشاهد الشريط يتبعك.':'Move your pointer and watch the ribbon follow.')}</div>
        </div>
        <div className="rgpu-settings">
          <div className="rgpu-settings-heading"><SlidersHorizontal size={16}/>{ar?'التحكم في الأداء':'PERFORMANCE & MOTION'}</div>
          <div className="rgpu-settings-grid">
            <div><label>{ar?'الجودة':'Render quality'}</label><div className="rgpu-quality" role="group" aria-label={ar?'الجودة':'Render quality'}>
              {([1,2,3] as const).map(q=><button type="button" key={q} aria-pressed={quality===q}
                className={quality===q?'active':''} onClick={()=>setQuality(q)}>{q===1?'Low':q===2?'Balanced':'High'}</button>)}
            </div></div>
            <label className="rgpu-strength">{ar?'قوة التفاعل':'Interaction strength'} <strong>{strength}</strong>
              <input type="range" value={strength} onChange={e=>setStrength(Number(e.target.value))} min={4} max={25}/>
            </label>
          </div>
          {reduced&&<p className="rgpu-motion-note">{ar?'تفعيل تقليل الحركة في جهازك بيوقف التشغيل التلقائي.':'Your system prefers reduced motion; automatic animation is disabled.'}</p>}
        </div>
        <div className="rgpu-source">
          <div className="rgpu-source-bar"><strong><Code2 size={16}/>{ar?'كود React':'React usage'}</strong><button onClick={copy}><Copy size={14}/>{ar?'نسخ المثال':'Copy usage'}</button></div>
          <pre dir="ltr"><code>{snippet}</code></pre>
          <div className="rgpu-links"><a href={fullSource} target="_blank" rel="noopener noreferrer">Three.js Scenes <ExternalLink size={14}/></a>
            <a href={sourceWrapper} target="_blank" rel="noopener noreferrer">Canvas Wrapper <ExternalLink size={14}/></a></div>
          <p role="status" aria-live="polite">{notice||(ar?'المثال يحتاج ملفات المصدر وThree.js وReact Three Fiber.':'The snippet requires the linked source files and installed Three.js / React Three Fiber.')}</p>
        </div>
      </div>
    </div>
  </main>;
}

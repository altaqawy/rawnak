'use client';

import {useEffect,useMemo,useRef,useState} from 'react';
import Link from 'next/link';
import {ArrowLeft,ArrowRight,ArrowUpRight,Code2,Copy,Download,ExternalLink,
  Gauge,MousePointer2,Pause,Play,RotateCcw,Save,SlidersHorizontal,Sparkles,Upload} from 'lucide-react';
import type {Locale} from '@/i18n/config';
import {defaultSpectra,spectraCatalog,spectraRegistry,type SpectraConfig,type SpectraKind} from '@/components/tools/SpectraEffects';

const clamp=(n:number,a:number,b:number)=>Math.min(b,Math.max(a,n));
const numericKeys:Record<keyof Omit<SpectraConfig,'autoplay'>,[number,number]>={
  particles:[24,450],power:[.3,4],drag:[.90,.995],trail:[.05,.55],
  ribbonWidth:[4,60],spring:[.035,.6],layers:[1,5],speed:[1.5,10],perspective:[500,1500]
};
function sanitize(raw:unknown):SpectraConfig{
  if(!raw||typeof raw!=='object'||Array.isArray(raw))return {...defaultSpectra};
  const candidate=raw as Record<string,unknown>;
  const valid={...defaultSpectra};
  for(const [key,[min,max]] of Object.entries(numericKeys)){
    if(typeof candidate[key]==='number'&&Number.isFinite(candidate[key]))
      (valid as unknown as Record<string,number>)[key]=clamp(candidate[key],min,max);
  }
  valid.particles=Math.round(valid.particles);
  valid.layers=Math.round(valid.layers);
  valid.autoplay=typeof candidate.autoplay==='boolean'?candidate.autoplay:defaultSpectra.autoplay;
  return valid;
}

export default function SpectraLab({locale,baseHref}:{locale:Locale;baseHref:string}){
  const ar=locale==='ar';
  const [kind,setKind]=useState<SpectraKind>('star-burst');
  const [config,setConfig]=useState<SpectraConfig>(defaultSpectra);
  const [playing,setPlaying]=useState(true);
  const [resetKey,setResetKey]=useState(0);
  const [notice,setNotice]=useState('');
  const [reduced,setReduced]=useState(false);
  const [ready,setReady]=useState(false);
  const uploader=useRef<HTMLInputElement>(null);
  const current=spectraCatalog.find(x=>x.id===kind)!;
  const Demo=spectraRegistry[kind];

  useEffect(()=>{
    try{
      const saved=localStorage.getItem('rawnak-spectra-v10');
      if(saved){
        const parsed=JSON.parse(saved) as {kind?:SpectraKind;config?:unknown};
        if(spectraCatalog.some(x=>x.id===parsed.kind))setKind(parsed.kind!);
        setConfig(sanitize(parsed.config));
      }
    }catch{/* Private browsing can disable persistence. */}
    setReady(true);
  },[]);
  useEffect(()=>{
    if(!ready)return;
    try{localStorage.setItem('rawnak-spectra-v10',JSON.stringify({kind,config}))}catch{/* Keep state in memory. */}
  },[kind,config,ready]);
  useEffect(()=>{
    const mq=window.matchMedia('(prefers-reduced-motion: reduce)');
    const refresh=()=>{setReduced(mq.matches);if(mq.matches)setPlaying(false)};
    refresh();mq.addEventListener?.('change',refresh);
    return()=>mq.removeEventListener?.('change',refresh);
  },[]);

  const documentPreset=useMemo(()=>JSON.stringify({
    schema:'rawnak.spectra.v1',kind,config,source:'Rawnak Tools'
  },null,2),[kind,config]);
  const fileName='rawnak-'+kind+'-preset.json';
  function change<K extends keyof SpectraConfig>(key:K,value:SpectraConfig[K]){
    setConfig(previous=>({...previous,[key]:value}));
    setNotice('');
  }
  async function copy(){
    try{await navigator.clipboard.writeText(documentPreset);setNotice(ar?'تم نسخ الإعدادات':'Preset JSON copied')}
    catch{setNotice(ar?'النسخ غير متاح، يمكنك تنزيل الملف':'Clipboard unavailable. Download the preset instead.')}
  }
  function download(){
    const blob=new Blob([documentPreset],{type:'application/json'});
    const uri=URL.createObjectURL(blob);const a=document.createElement('a');
    a.href=uri;a.download=fileName;document.body.appendChild(a);a.click();a.remove();URL.revokeObjectURL(uri);
    setNotice(ar?'تم تنزيل الملف':'Preset downloaded');
  }
  async function importPreset(file?:File){
    if(!file)return;
    if(file.size>20_000){setNotice(ar?'ملف كبير جدًا':'Preset file is too large');return}
    try{
      const obj=JSON.parse(await file.text()) as {kind?:SpectraKind;config?:unknown;schema?:string};
      if(obj.schema!=='rawnak.spectra.v1'||!spectraCatalog.some(x=>x.id===obj.kind))throw new Error('Invalid');
      setKind(obj.kind!);setConfig(sanitize(obj.config));setResetKey(n=>n+1);
      setNotice(ar?'تم استيراد الإعدادات':'Preset loaded');
    }catch{setNotice(ar?'ملف إعدادات غير صالح':'Invalid or unsupported preset JSON')}
    if(uploader.current)uploader.current.value='';
  }
  function reset(){
    setConfig({...defaultSpectra});setResetKey(n=>n+1);
    setNotice(ar?'رجعنا للإعدادات الافتراضية':'Restored defaults');
  }
  function slider(key:keyof Omit<SpectraConfig,'autoplay'>,en:string,arabic:string,min:number,max:number,step:number){
    const value=config[key] as number;
    return <label className="rvs-setting" key={key}>
      <span>{ar?arabic:en}<strong>{value.toFixed(step<.1?3:step<1?2:step===1?0:1)}</strong></span>
      <input type="range" min={min} max={max} step={step} value={value}
        onChange={e=>change(key,Number(e.target.value))}/>
    </label>;
  }
  return <main className="rvs-page">
    <div className="rt-container rvs-hero">
      <Link href={baseHref} className="rvs-back">
        {ar?<ArrowRight size={15}/>:<ArrowLeft size={15}/>} {ar?'أدوات رونق':'Rawnak Tools'}
      </Link>
      <div className="rt-eyebrow">V10 / ADVANCED MOTION ENGINEERING</div>
      <h1>{ar?'حركة':'Motion'} <span>{ar?'بلا حدود.':'without limits.'}</span></h1>
      <p>{ar?'انفجارات جسيمات، شرائط متعددة بفيزياء مرنة، ومعرض منشوري ثلاثي الأبعاد. كل تجربة لها محرر إعدادات وتحميل Preset مستقل.':
        'Three original, interactive motion systems: particles, multi-layer ribbons, and a spatial prism gallery. Customize them, preview live, and export a portable preset.'}</p>
      <div className="rvs-hero-stats"><span>03 MOTION ENGINES</span><span>REAL-TIME CONTROLS</span><span>PORTABLE PRESETS</span></div>
    </div>
    <div className="rt-container rvs-layout">
      <aside className="rvs-menu" aria-label={ar?'اختيار الأنيميشن':'Motion effect selector'}>
        <div className="rvs-menu-title">EXPERIMENTS <span>03</span></div>
        {spectraCatalog.map((effect,i)=><button type="button" key={effect.id} className={effect.id===kind?'active':''}
          aria-pressed={effect.id===kind} onClick={()=>{setKind(effect.id);setNotice('');setResetKey(n=>n+1)}}>
          <span className="rvs-effect-index">{String(i+1).padStart(2,'0')}</span>
          <span><strong>{ar?effect.ar:effect.en}</strong><small>{effect.tag}</small></span><ArrowUpRight size={15}/>
        </button>)}
        <div className="rvs-menu-bottom"><Sparkles size={16}/>
          <p>{ar?'مكونات مكتوبة لرونق، مش منسوخة من مكتبات Pro.':'Independently built for Rawnak — not redistributed Pro library components.'}</p>
        </div>
      </aside>
      <section className="rvs-editor">
        <div className="rvs-editor-heading">
          <div><div className="rt-eyebrow">{current.tag} / 00{spectraCatalog.indexOf(current)+1}</div>
            <h2>{ar?current.ar:current.en}</h2><p>{current.info}</p></div>
          <span>● LIVE</span>
        </div>
        <div className="rvs-preview-frame">
          <div className="rvs-preview-top"><span><MousePointer2 size={14}/> {ar?'المعاينة التفاعلية':'INTERACTIVE PREVIEW'}</span>
            <div><button type="button" onClick={()=>setResetKey(v=>v+1)}><RotateCcw size={14}/>{ar?'إعادة':'Replay'}</button>
            <button type="button" onClick={()=>setPlaying(v=>!v)} disabled={reduced}>
              {playing?<Pause size={14}/>:<Play size={14}/>}
              {playing?(ar?'إيقاف':'Pause'):(ar?'تشغيل':'Play')}
            </button></div>
          </div>
          <div className="rvs-preview-stage"><Demo config={config} playing={playing&&!reduced} resetKey={resetKey}/></div>
          <div className="rvs-preview-bottom">
            {kind==='star-burst'?(ar?'اضغط أو المس اللوحة لإطلاق النجوم':'Click or tap the stage to burst particles'):
              kind==='ribbon-flow'?(ar?'حرك المؤشر لترسم مسار الشرائط':'Move your pointer to paint ribbon paths'):
              (ar?'اسحب أو استخدم الأسهم لتدوير المعرض':'Drag the prism or use its arrows to rotate')}
          </div>
        </div>
        <div className="rvs-controls">
          <div className="rvs-controls-head"><strong><SlidersHorizontal size={16}/>{ar?'تحكم في الحركة':'MOTION CONTROLS'}</strong>
            <button type="button" onClick={reset}><RotateCcw size={14}/>{ar?'الافتراضي':'Defaults'}</button>
          </div>
          <div className="rvs-control-grid">
            {kind==='star-burst'&&<>
              {slider('particles','Max particles','عدد الجسيمات',24,450,1)}
              {slider('power','Blast power','قوة الانفجار',.3,4,.1)}
              {slider('drag','Velocity retention','الاحتفاظ بالسرعة',.90,.995,.005)}
              {slider('trail','Trail fade','تلاشي الأثر',.05,.55,.01)}
            </>}
            {kind==='ribbon-flow'&&<>
              {slider('ribbonWidth','Ribbon width','سُمك الشرائط',4,60,1)}
              {slider('spring','Spring response','مرونة الاستجابة',.035,.6,.005)}
              {slider('layers','Ribbon layers','عدد الطبقات',1,5,1)}
            </>}
            {kind==='prism-carousel'&&<>
              {slider('perspective','Perspective','عمق المنظور',500,1500,50)}
              {slider('speed','Autoplay interval (s)','الفاصل الزمني',1.5,10,.5)}
              <label className="rvs-autoplay"><input type="checkbox" checked={config.autoplay} onChange={e=>change('autoplay',e.target.checked)}/>
                {ar?'تدوير تلقائي للمعرض':'Autoplay gallery'}</label>
            </>}
          </div>
          {reduced&&<p className="rvs-reduced"><Gauge size={14}/>{ar?'الجهاز طالب تقليل الحركة؛ التشغيل التلقائي متوقف.':'Reduced Motion is enabled on this device; autoplay is disabled.'}</p>}
        </div>
        <div className="rvs-preset">
          <div className="rvs-preset-top"><div><strong><Code2 size={15}/>{ar?'ملف إعدادات قابل للنقل':'PORTABLE PRESET JSON'}</strong>
            <small>{ar?'مناسب لنقل الإعدادات بين مشاريع رونق':'Carry the same configuration between projects'}</small></div>
            <div className="rvs-export-actions">
              <button type="button" onClick={copy}><Copy size={14}/>{ar?'نسخ':'Copy'}</button>
              <button type="button" onClick={download}><Download size={14}/>{ar?'تحميل':'Download'}</button>
              <button type="button" onClick={()=>uploader.current?.click()}><Upload size={14}/>{ar?'استيراد':'Import'}</button>
              <input ref={uploader} type="file" accept=".json,application/json" hidden onChange={e=>void importPreset(e.target.files?.[0])}/>
            </div>
          </div>
          <pre dir="ltr"><code>{documentPreset}</code></pre>
          <div className="rvs-preset-foot"><p role="status" aria-live="polite">{notice||(ar?'الإعدادات محفوظة محليًا أيضًا في متصفحك':'Settings also auto-save in your browser.')}</p>
            <a href="https://github.com/altaqawy/rawnak/blob/feat/rawnak-tools-mvp/components/tools/SpectraEffects.tsx" target="_blank" rel="noopener noreferrer">
              {ar?'كود المكونات':'Full component source'} <ArrowUpRight size={14}/>
            </a></div>
        </div>
      </section>
    </div>
  </main>;
}

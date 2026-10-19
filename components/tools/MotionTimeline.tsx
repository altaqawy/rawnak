'use client';

import {useEffect,useMemo,useRef,useState,type PointerEvent as RPointerEvent} from 'react';
import Link from 'next/link';
import {ArrowLeft,ArrowRight,Check,Copy,Download,FileCode2,FileJson,GripVertical,
  Pause,Play,Plus,RotateCcw,Save,SlidersHorizontal,Trash2,Upload,CopyPlus} from 'lucide-react';
import type {Locale} from '@/i18n/config';
import {clipFrame,exportTimelineHTML,timelineEffects,timelineStarter,validateTimeline,
  clampTimeline,type TimelineClip,type TimelineEffect,type TimelineProject} from '@/lib/tools/timeline';

function downloadFile(content:string,filename:string,type:string){
  const url=URL.createObjectURL(new Blob([content],{type}));
  const a=document.createElement('a');a.href=url;a.download=filename;document.body.appendChild(a);a.click();a.remove();
  window.setTimeout(()=>URL.revokeObjectURL(url),1500);
}
function newClip(project:TimelineProject):TimelineClip{
  const id='clip-'+Date.now().toString(36)+'-'+Math.floor(Math.random()*999).toString(36);
  const start=clampTimeline(Math.max(0,project.clips.reduce((mx,c)=>Math.max(mx,c.start+c.duration),0)-.5),0,project.length-.6);
  return {id,name:'NEW LAYER',effect:'zoom',start,duration:Math.min(1.25,project.length-start),layer:project.clips.length};
}
const formatTime=(s:number)=>s.toFixed(2)+'s';

export default function MotionTimeline({locale,baseHref}:{locale:Locale;baseHref:string}){
  const ar=locale==='ar';
  const [project,setProject]=useState<TimelineProject>(timelineStarter);
  const [active,setActive]=useState('intro');
  const [seconds,setSeconds]=useState(2.6);
  const [playing,setPlaying]=useState(false);
  const [saved,setSaved]=useState(false);
  const [notice,setNotice]=useState('');
  const [reduced,setReduced]=useState(false);
  const fileInput=useRef<HTMLInputElement>(null);
  const raf=useRef<number>(0);
  const last=useRef<number>(0);
  const drag=useRef<{id:string;start:number;x:number;width:number}|null>(null);
  const activeClip=project.clips.find(x=>x.id===active)??project.clips[0];

  useEffect(()=>{
    try{
      const json=localStorage.getItem('rawnak-timeline-v11');
      if(json){const p=validateTimeline(JSON.parse(json));setProject(p);setActive(p.clips[0]?.id??'');setSeconds(Math.min(2.6,p.length));}
    }catch{/* Invalid storage is ignored and starter restored. */}
    setSaved(true);
  },[]);
  useEffect(()=>{
    if(!saved)return;
    try{localStorage.setItem('rawnak-timeline-v11',JSON.stringify(project))}catch{/* Browser storage may be disabled. */}
  },[project,saved]);
  useEffect(()=>{
    const media=window.matchMedia('(prefers-reduced-motion: reduce)');
    const update=()=>{setReduced(media.matches);if(media.matches)setPlaying(false)};
    update();media.addEventListener?.('change',update);return()=>media.removeEventListener?.('change',update);
  },[]);
  useEffect(()=>{
    cancelAnimationFrame(raf.current);last.current=0;
    if(!playing||reduced)return;
    const tick=(now:number)=>{
      if(!last.current)last.current=now;
      const delta=Math.min((now-last.current)/1000,.10);
      last.current=now;
      setSeconds(s=>{
        const next=s+delta;
        if(next>=project.length){
          if(project.loop)return next%project.length;
          setPlaying(false);return project.length;
        }
        return next;
      });
      raf.current=requestAnimationFrame(tick);
    };
    raf.current=requestAnimationFrame(tick);
    return()=>{cancelAnimationFrame(raf.current);last.current=0};
  },[playing,project.length,project.loop,reduced]);
  useEffect(()=>{setSeconds(s=>Math.min(s,project.length))},[project.length]);

  const select=(clip:TimelineClip)=>{setActive(clip.id);setNotice('')};
  const update=(id:string,fields:Partial<TimelineClip>)=>{
    setProject(old=>({...old,clips:old.clips.map(c=>{
      if(c.id!==id)return c;
      const start=clampTimeline(fields.start??c.start,0,old.length-.1);
      const duration=clampTimeline(fields.duration??c.duration,.1,Math.max(.1,old.length-start));
      return {...c,...fields,start,duration};
    })}));
  };
  function add(){
    if(project.clips.length>=36){setNotice(ar?'الحد الأقصى 36 مسارًا':'Maximum 36 tracks');return}
    const c=newClip(project);
    setProject(old=>({...old,clips:[...old.clips,c]}));setActive(c.id);setNotice('');
  }
  function remove(){
    if(!activeClip)return;
    const remaining=project.clips.filter(c=>c.id!==activeClip.id).map((c,i)=>({...c,layer:i}));
    setProject(p=>({...p,clips:remaining}));setActive(remaining[0]?.id??'');
  }
  function duplicate(){
    if(!activeClip||project.clips.length>=36)return;
    const clip={...activeClip,id:'dup-'+Date.now().toString(36),name:activeClip.name+' COPY',
      start:Math.min(project.length-.1,activeClip.start+.4),layer:project.clips.length};
    clip.duration=Math.max(.1,Math.min(clip.duration,project.length-clip.start));
    setProject(p=>({...p,clips:[...p.clips,clip]}));setActive(clip.id);
  }
  function reset(){setProject(timelineStarter);setActive('intro');setSeconds(0);setPlaying(false);setNotice(ar?'تمت إعادة المشروع الافتراضي':'Starter composition restored')}
  function startDrag(e:RPointerEvent<HTMLButtonElement>,clip:TimelineClip){
    if(e.button!==0)return;
    const row=e.currentTarget.parentElement?.getBoundingClientRect();
    if(!row?.width)return;
    drag.current={id:clip.id,start:clip.start,x:e.clientX,width:row.width};
    setActive(clip.id);setPlaying(false);e.currentTarget.setPointerCapture(e.pointerId);
  }
  function moveDrag(e:RPointerEvent<HTMLButtonElement>){
    const d=drag.current;if(!d)return;
    const movement=(e.clientX-d.x)/d.width*project.length;
    const original=project.clips.find(x=>x.id===d.id);
    if(!original)return;
    update(d.id,{start:Math.round(clampTimeline(d.start+movement,0,project.length-original.duration)*20)/20});
  }
  function stopDrag(){drag.current=null}

  const html=useMemo(()=>exportTimelineHTML(project),[project]);
  const json=useMemo(()=>JSON.stringify(project,null,2),[project]);
  async function copy(){
    try{await navigator.clipboard.writeText(json);setNotice(ar?'تم نسخ إعدادات المشروع':'Composition JSON copied')}
    catch{setNotice(ar?'انسخ الإعدادات يدويًا':'Clipboard unavailable. Download JSON instead.')}
  }
  async function importFile(file?:File){
    if(!file)return;
    if(file.size>55_000){setNotice(ar?'الملف أكبر من الحد المسموح':'Import file exceeds 55 KB');return}
    try{
      const loaded=validateTimeline(JSON.parse(await file.text()));
      setProject(loaded);setActive(loaded.clips[0]?.id??'');setSeconds(0);setPlaying(false);
      setNotice(ar?'تم استيراد المشروع':'Composition imported');
    }catch{setNotice(ar?'صيغة المشروع غير صحيحة':'Invalid or unsupported timeline file')}
    if(fileInput.current)fileInput.current.value='';
  }
  function exportJson(){downloadFile(json,'rawnak-motion-timeline.json','application/json');setNotice(ar?'تم تنزيل JSON':'JSON preset downloaded')}
  function exportHtml(){downloadFile(html,'rawnak-motion-composition.html','text/html;charset=utf-8');setNotice(ar?'تم تنزيل ملف HTML قابل للتشغيل':'Standalone HTML composition downloaded')}

  return <main className="rtl11-page">
    <div className="rt-container rtl11-hero">
      <Link href={baseHref} className="rtl11-back">{ar?<ArrowRight size={15}/>:<ArrowLeft size={15}/>} {ar?'أدوات رونق':'Rawnak Tools'}</Link>
      <div className="rt-eyebrow">RAWNAK / V11 / MOTION TIMELINE</div>
      <h1>{ar?'حرّك':'Compose'} <span>{ar?'كل لحظة.':'every moment.'}</span></h1>
      <p>{ar?'ركّب مؤثرات حقيقية فوق بعض، ووزّعها على خط زمني، وجرب التوقيت إطارًا بإطار، ثم صدر النتيجة كصفحة HTML مستقلة.':
        'Layer motion effects on a real timeline, adjust starts and durations, scrub frame-by-frame, then export a working standalone HTML composition.'}</p>
      <div className="rtl11-summary"><span>12 MOTION EFFECTS</span><span>36 TRACKS MAX</span><span>SEEK + LOOP</span><span>HTML + JSON EXPORT</span></div>
    </div>
    <div className="rt-container rtl11-body">
      <section className="rtl11-workbench">
        <div className="rtl11-title"><div><span className="rt-eyebrow">EDITOR / LIVE COMPOSITION</span><h2>{ar?'محرر الحركة':'Motion Composer'}</h2></div>
          <span>● LOCAL PROJECT</span></div>
        <div className="rtl11-preview">
          <div className="rtl11-preview-top">
            <div className="rtl11-window-dots"><i/><i/><i/></div>
            <strong>{project.title||'Untitled'}</strong>
            <span>16:9 / PREVIEW</span>
          </div>
          <div className="rtl11-stage" role="img" aria-label={ar?'معاينة الحركة':'Layered animated composition preview'}>
            <div className="rtl11-stage-grid"/>
            <div className="rtl11-stage-orbit"/>
            {project.clips.map((clip,index)=>{
              const frame=clipFrame(clip,seconds,reduced);
              return <div key={clip.id} className={'rtl11-layer rtl11-layer-'+(index%5)}>
                <span style={{opacity:frame.opacity,transform:frame.transform,filter:frame.filter,clipPath:frame.clipPath}}>
                  {clip.name||'LAYER'}
                </span>
              </div>;
            })}
            <span className="rtl11-stage-watermark">RAWNAK / SEQUENCE 001</span>
          </div>
          <div className="rtl11-playback">
            <button type="button" disabled={reduced} aria-label={playing?(ar?'إيقاف':'Pause'):(ar?'تشغيل':'Play')}
              className="rtl11-play" onClick={()=>{if(seconds>=project.length)setSeconds(0);setPlaying(p=>!p)}}>
              {playing?<Pause size={19}/>:<Play size={19}/>}
            </button>
            <output>{formatTime(seconds)}</output>
            <input aria-label={ar?'تحريك مؤشر الوقت':'Scrub timeline'} type="range" min={0} max={project.length} step={.01}
              value={seconds} onChange={e=>{setSeconds(Number(e.target.value));setPlaying(false)}}/>
            <span>{formatTime(project.length)}</span>
            <label className="rtl11-loop"><input type="checkbox" checked={project.loop}
              onChange={e=>setProject(p=>({...p,loop:e.target.checked}))}/>{ar?'تكرار':'Loop'}</label>
          </div>
        </div>
        <div className="rtl11-timeline">
          <div className="rtl11-timeline-head"><strong>{ar?'المسارات':'TIMELINE / TRACKS'}</strong>
            <button type="button" onClick={add}><Plus size={15}/>{ar?'أضف مسار':'Add layer'}</button></div>
          <div className="rtl11-track-scroll">
            <div className="rtl11-time-ruler"><span>{ar?'المسار':'LAYER'}</span><div className="rtl11-ruler-marks">
              {Array.from({length:Math.floor(project.length)+1},(_,i)=><b key={i} style={{left:(i/project.length*100)+'%'}}>{i}s</b>)}
            </div></div>
            {project.clips.map((clip,index)=><div className={'rtl11-track '+(clip.id===active?'is-active':'')} key={clip.id}>
              <button type="button" className="rtl11-track-name" onClick={()=>select(clip)}>
                <GripVertical size={13}/><span>{String(index+1).padStart(2,'0')}</span><strong title={clip.name}>{clip.name||'LAYER'}</strong>
              </button>
              <div className="rtl11-track-bar">
                <div className="rtl11-track-progress" style={{left:(seconds/project.length*100)+'%'}}/>
                <button type="button" className="rtl11-clip" style={{left:(clip.start/project.length*100)+'%',width:(clip.duration/project.length*100)+'%'}}
                  aria-label={clip.name+', '+clip.effect+', start '+clip.start+' seconds; drag to move'}
                  onPointerDown={e=>startDrag(e,clip)} onPointerMove={moveDrag}
                  onPointerUp={stopDrag} onPointerCancel={stopDrag} onClick={()=>select(clip)}>
                  <span>{clip.effect.toUpperCase()}</span>
                </button>
              </div>
            </div>)}
            {project.clips.length===0&&<div className="rtl11-empty">{ar?'اضغط أضف مسار للبدء':'Add your first layer to begin'}</div>}
          </div>
          <div className="rtl11-timeline-tip">{ar?'اسحب شريط الحركة لتحريك بدايته، أو استخدم الحقول الدقيقة على اليمين.':'Drag an effect block to reposition it, or use the precise controls on the right.'}</div>
        </div>
      </section>
      <aside className="rtl11-inspector">
        <div className="rtl11-panel">
          <div className="rtl11-panel-title"><SlidersHorizontal size={16}/>{ar?'خصائص المشروع':'PROJECT SETTINGS'}</div>
          <label>{ar?'اسم العمل':'Composition title'}<input maxLength={90} value={project.title}
            onChange={e=>setProject(p=>({...p,title:e.target.value}))}/></label>
          <label>{ar?'مدة المشروع (ثانية)':'Total duration'}<input type="number" min={2} max={30} step={.5} value={project.length}
            onChange={e=>setProject(p=>{
              const length=clampTimeline(Number(e.target.value)||2,2,30);
              return {...p,length,clips:p.clips.map(c=>{
                const start=Math.min(c.start,length-.1);
                return {...c,start,duration:Math.max(.1,Math.min(c.duration,length-start))}
              })}
            })}/></label>
          <div className="rtl11-button-row"><button type="button" onClick={reset}><RotateCcw size={14}/>{ar?'بدء من جديد':'Reset'}</button>
            <button type="button" onClick={add}><Plus size={14}/>{ar?'مسار جديد':'New track'}</button></div>
        </div>
        <div className="rtl11-panel">
          <div className="rtl11-panel-title"><GripVertical size={16}/>{ar?'تعديل المسار':'SELECTED LAYER'}</div>
          {activeClip?<div className="rtl11-fields">
            <label>{ar?'النص':'Layer text'}<input maxLength={90} value={activeClip.name} onChange={e=>update(activeClip.id,{name:e.target.value})}/></label>
            <label>{ar?'نوع التأثير':'Motion effect'}
              <select value={activeClip.effect} onChange={e=>update(activeClip.id,{effect:e.target.value as TimelineEffect})}>
                {timelineEffects.map(effect=><option key={effect.id} value={effect.id}>{ar?effect.ar:effect.en}</option>)}
              </select></label>
            <div className="rtl11-fields-2">
              <label>{ar?'البداية':'Start (s)'}<input type="number" min={0} max={project.length-.1} step={.05} value={activeClip.start}
                onChange={e=>update(activeClip.id,{start:Number(e.target.value)})}/></label>
              <label>{ar?'المدة':'Duration (s)'}<input type="number" min={.1} max={project.length-activeClip.start} step={.05} value={activeClip.duration}
                onChange={e=>update(activeClip.id,{duration:Number(e.target.value)})}/></label>
            </div>
            <div className="rtl11-button-row">
              <button type="button" onClick={duplicate}><CopyPlus size={14}/>{ar?'تكرار':'Duplicate'}</button>
              <button type="button" onClick={remove} className="rtl11-delete"><Trash2 size={14}/>{ar?'حذف':'Delete'}</button>
            </div>
          </div>:<p className="rtl11-muted">{ar?'اختار أو أضف مسارًا أولًا.':'Select a layer or add a new one.'}</p>}
        </div>
        <div className="rtl11-panel rtl11-export">
          <div className="rtl11-panel-title"><FileCode2 size={16}/>{ar?'تصدير العمل':'EXPORT & REUSE'}</div>
          <p>{ar?'ملف HTML يحتوي على الأنيميشن وخط الزمن والتشغيل؛ وJSON يحتفظ بإعدادات المشروع.':'Download a working HTML animation with a seek bar, or save/edit your composition as JSON.'}</p>
          <div className="rtl11-export-actions">
            <button type="button" onClick={exportHtml}><Download size={15}/> HTML</button>
            <button type="button" onClick={exportJson}><FileJson size={15}/> JSON</button>
            <button type="button" onClick={copy}><Copy size={15}/>{ar?'نسخ':'Copy'}</button>
            <button type="button" onClick={()=>fileInput.current?.click()}><Upload size={15}/>{ar?'استيراد':'Import'}</button>
            <input ref={fileInput} type="file" hidden accept=".json,application/json" onChange={e=>void importFile(e.target.files?.[0])}/>
          </div>
          <p className="rtl11-feedback" role="status" aria-live="polite">{notice||(ar?'يتم حفظ التعديلات محليًا في المتصفح.':'Edits auto-save in your browser.')}</p>
        </div>
      </aside>
    </div>
  </main>;
}

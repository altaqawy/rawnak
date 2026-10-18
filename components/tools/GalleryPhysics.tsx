'use client';

import { useCallback, useEffect, useMemo, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react';
import { ChevronLeft, ChevronRight, ImagePlus, Pause, Play } from 'lucide-react';

export type GalleryPhysicsId='page-turn'|'endless-gallery'|'spring-reel'|'image-particles';
export const galleryPhysicsCatalog: {id:GalleryPhysicsId;en:string;ar:string;description:string;reference:string}[]=[
  {id:'page-turn',en:'Paperbound',ar:'كتاب بصفحات متقلبة',description:'Drag a page corner or use navigation buttons to turn a book in perspective.',reference:'Page Flip'},
  {id:'endless-gallery',en:'Infinity Corridor',ar:'ممر الصور اللانهائي',description:'A circular, perspective-based gallery with momentum and endless indexing.',reference:'Infinite Gallery'},
  {id:'spring-reel',en:'Spring Filmstrip',ar:'شريط صور مرن',description:'An elastic filmstrip with velocity-based momentum and responsive slide widths.',reference:'Elastic Reel / Passage Gallery'},
  {id:'image-particles',en:'Pixel Drift',ar:'تحويل الصور إلى جسيمات',description:'Choose two local images and morph between their sampled pixels on Canvas.',reference:'Particle Morph'},
];

const panels=[
  {id:'A01',title:'MONOLITH',eyebrow:'01 / FORM',bg:'radial-gradient(circle at 35% 24%,#d0d0d0,#585858 30%,#101010 67%)',shape:'sphere'},
  {id:'A02',title:'ORBIT',eyebrow:'02 / SPACE',bg:'linear-gradient(125deg,#141414,#777 52%,#121212)',shape:'ring'},
  {id:'A03',title:'RESONANCE',eyebrow:'03 / MOTION',bg:'radial-gradient(circle at 60% 38%,#f0f0f0,#333 38%,#090909 73%)',shape:'sphere'},
  {id:'A04',title:'REFRACTION',eyebrow:'04 / LIGHT',bg:'linear-gradient(135deg,#080808,#a1a1a1 43%,#222 65%,#080808)',shape:'prism'},
  {id:'A05',title:'SILENCE',eyebrow:'05 / DESIGN',bg:'radial-gradient(circle at 50% 15%,#777,#1a1a1a 58%,#060606)',shape:'ring'},
  {id:'A06',title:'ECLIPSE',eyebrow:'06 / FORM',bg:'linear-gradient(20deg,#121212,#818181 48%,#050505)',shape:'prism'},
] as const;

function useMotionPreference(){
  const [reduced,setReduced]=useState(false);
  useEffect(()=>{
    const q=window.matchMedia('(prefers-reduced-motion: reduce)');
    const refresh=()=>setReduced(q.matches);refresh();
    q.addEventListener('change',refresh);
    return()=>q.removeEventListener('change',refresh);
  },[]);
  return reduced;
}
function wrap(n:number,len:number){return ((n%len)+len)%len}
function clamp(n:number,min:number,max:number){return Math.max(min,Math.min(max,n))}
function Artwork({index,className=''}:{index:number;className?:string}){
  const p=panels[wrap(index,panels.length)];
  return <div className={'rag-art '+className} style={{background:p.bg}}>
    <div className={'rag-art-object '+p.shape}/><span className="rag-art-top">{p.eyebrow}</span>
    <div className="rag-art-bottom"><strong>{p.title}</strong><span>RAWNAK / EXPERIMENTAL</span></div>
  </div>;
}

const bookPages=[
  {eyebrow:'A NOTE ON CREATION',title:'Ideas deserve a second dimension.',paragraph:'A story about objects that move, react and feel a little more real.'},
  {eyebrow:'CHAPTER / 001',title:'The art of turning.',paragraph:'Geometry and human gestures meet on a clean piece of paper.'},
  {eyebrow:'CHAPTER / 002',title:'Light becomes form.',paragraph:'Subtle shadows make flat surfaces feel wonderfully tactile.'},
  {eyebrow:'CHAPTER / 003',title:'Motion with intention.',paragraph:'Each transition should carry meaning, rhythm and momentum.'},
  {eyebrow:'END NOTES',title:'The next page is yours.',paragraph:'Build something that makes someone curious enough to look closer.'},
] as const;

export function Paperbound(){
  const [page,setPage]=useState(0);
  const [drag,setDrag]=useState(0);
  const [turning,setTurning]=useState(false);
  const start=useRef<number|null>(null);
  const timeout=useRef<ReturnType<typeof setTimeout>|null>(null);
  const reduced=useMotionPreference();
  useEffect(()=>()=>{if(timeout.current)clearTimeout(timeout.current)},[]);
  const next=()=>{if(turning||page>=bookPages.length-1)return;setTurning(true);setDrag(1);timeout.current=setTimeout(()=>{setPage(p=>Math.min(bookPages.length-1,p+1));setTurning(false);setDrag(0)},reduced?0:600)};
  const previous=()=>{if(turning||page===0)return;setPage(p=>Math.max(0,p-1));setDrag(0)};
  function down(e:ReactPointerEvent<HTMLDivElement>){if(turning)return;start.current=e.clientX;e.currentTarget.setPointerCapture(e.pointerId)}
  function move(e:ReactPointerEvent<HTMLDivElement>){if(start.current===null||turning)return;const rtl=e.currentTarget.getBoundingClientRect();setDrag(clamp((start.current-e.clientX)/Math.max(rtl.width*.75,1),0,1))}
  function up(){if(start.current===null)return;start.current=null;if(drag>.25)next();else setDrag(0)}
  return <div className="rag-book-demo">
    <div className="rag-book-visual">
      <div className="rag-book-spine"/>
      <div className="rag-book-left"><span>RAWNAK / PAGES</span><strong>AN ATLAS<br/>OF MOTION</strong><div className="rag-book-ring"/></div>
      <div className="rag-book-right">
        <div className="rag-book-page-base"><span>RAWNAK / INDEX</span><strong>Keep exploring.</strong></div>
        <div className={'rag-book-turnable '+(turning?'is-turning':'')} role="button" tabIndex={0}
          aria-label="Swipe left to turn page" onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerCancel={()=>{start.current=null;setDrag(0)}}
          onKeyDown={e=>{if(e.key==='ArrowRight'||e.key==='Enter'||e.key===' '){e.preventDefault();next()}}}
          style={{transform:'rotateY('+(-179*drag)+'deg)'}}>
          <div className="rag-book-front"><small>{bookPages[page].eyebrow}</small><h3>{bookPages[page].title}</h3><p>{bookPages[page].paragraph}</p><span>PAGE {String(page+1).padStart(2,'0')} / {String(bookPages.length).padStart(2,'0')}</span></div>
          <div className="rag-book-back"><span>RAWNAK / NOTEBOOK</span><strong>TURN THE PAGE.</strong></div>
        </div>
      </div>
    </div>
    <div className="rag-navigation"><button onClick={previous} disabled={page===0||turning} aria-label="Previous page"><ChevronLeft size={18}/></button><span>{page+1} / {bookPages.length}</span><button onClick={next} disabled={page===bookPages.length-1||turning} aria-label="Next page"><ChevronRight size={18}/></button></div>
  </div>;
}

function useDragInertia(size:number,reduced:boolean){
  const [position,setPosition]=useState(0);
  const positionRef=useRef(0);
  const pointer=useRef<{id:number;lastX:number;lastT:number;velocity:number;moved:boolean}|null>(null);
  const raf=useRef<number>(0);
  const update=useCallback((v:number)=>{positionRef.current=v;setPosition(v)},[]);
  const cancel=useCallback(()=>cancelAnimationFrame(raf.current),[]);
  useEffect(()=>cancel, [cancel]);
  const step=useCallback((dir:number)=>{cancel();update(positionRef.current+dir)},[cancel,update]);
  const handlers={
    onPointerDown:(e:ReactPointerEvent<HTMLDivElement>)=>{cancel();pointer.current={id:e.pointerId,lastX:e.clientX,lastT:performance.now(),velocity:0,moved:false};e.currentTarget.setPointerCapture(e.pointerId)},
    onPointerMove:(e:ReactPointerEvent<HTMLDivElement>)=>{
      const p=pointer.current;if(!p||p.id!==e.pointerId)return;
      const now=performance.now(),dx=e.clientX-p.lastX;
      p.velocity=clamp(dx/Math.max(16,now-p.lastT)*16,-42,42);
      p.moved=p.moved||Math.abs(dx)>2;
      update(positionRef.current-dx/size);p.lastX=e.clientX;p.lastT=now;
    },
    onPointerUp:(e:ReactPointerEvent<HTMLDivElement>)=>{
      const p=pointer.current;if(!p||p.id!==e.pointerId)return;
      pointer.current=null;
      if(reduced){update(Math.round(positionRef.current));return}
      let velocity=-p.velocity/size;
      let last=performance.now();
      const frame=(now:number)=>{
        const dt=Math.min((now-last)/16.7,2);last=now;
        const target=Math.round(positionRef.current),spring=(target-positionRef.current)*.027;
        velocity=(velocity+spring*dt)*Math.pow(.93,dt);
        const next=positionRef.current+velocity*dt;update(next);
        if(Math.abs(velocity)>.002||Math.abs(next-target)>.006)raf.current=requestAnimationFrame(frame);
        else update(Math.round(next));
      };
      raf.current=requestAnimationFrame(frame);
    },
    onPointerCancel:()=>{pointer.current=null;cancel();update(Math.round(positionRef.current));},
  };
  return {position,step,handlers,moved:()=>pointer.current?.moved??false};
}

export function InfinityCorridor(){
  const reduced=useMotionPreference();
  const {position,step,handlers,moved}=useDragInertia(185,reduced);
  const wheelAcc=useRef(0);
  return <div className="rag-infinite">
    <div className="rag-endless-stage" tabIndex={0} aria-label="Infinite gallery. Drag, scroll, or use left and right arrows."
      onKeyDown={e=>{if(e.key==='ArrowRight'){e.preventDefault();step(1)}if(e.key==='ArrowLeft'){e.preventDefault();step(-1)}}}
      onWheel={e=>{e.stopPropagation();wheelAcc.current+=e.deltaY+e.deltaX;if(Math.abs(wheelAcc.current)>60){step(Math.sign(wheelAcc.current));wheelAcc.current=0}}}
      {...handlers}>
      {Array.from({length:11},(_,i)=>{
        const offset=i-5,logical=Math.round(position)+offset,delta=logical-position;
        if(Math.abs(delta)>5.6)return null;
        const index=wrap(logical,panels.length);
        const angle=delta*.39, x=Math.sin(angle)*295, z=(Math.cos(angle)-1)*250;
        const scale=clamp(1-Math.abs(delta)*.10,.53,1);
        return <div key={logical} className="rag-infinite-card" style={{transform:'translate3d('+x+'px,0,'+z+'px) rotateY('+(-delta*14)+'deg) scale('+scale+')',opacity:clamp(1-Math.abs(delta)*.19,0,1),zIndex:30-Math.abs(offset)}}><Artwork index={index}/></div>;
      })}
    </div>
    <div className="rag-navigation"><button onClick={()=>step(-1)} aria-label="Previous artwork"><ChevronLeft size={18}/></button><span>DRAG · SCROLL · ARROWS</span><button onClick={()=>step(1)} aria-label="Next artwork"><ChevronRight size={18}/></button></div>
  </div>;
}

export function SpringFilmstrip(){
  const reduced=useMotionPreference();
  const {position,step,handlers}=useDragInertia(240,reduced);
  const base=Math.round(position);
  return <div className="rag-spring">
    <div className="rag-filmstrip-stage" tabIndex={0} aria-label="Elastic filmstrip. Drag or use arrows."
      onKeyDown={e=>{if(e.key==='ArrowLeft')step(-1);if(e.key==='ArrowRight')step(1)}}
      {...handlers}>
      {Array.from({length:9},(_,i)=>{
        const logical=base+i-4,delta=logical-position;
        const scale=clamp(1-Math.abs(delta)*.16,.65,1);
        const x=delta*240;
        return <div key={logical} className={'rag-filmstrip-panel '+(Math.abs(delta)<.5?'is-center':'')}
          style={{transform:'translate3d('+x+'px,'+(Math.abs(delta)*12)+'px,0) rotate('+(-delta*3)+'deg) scale('+scale+')',zIndex:15-Math.abs(i-4),opacity:clamp(1-Math.abs(delta)*.19,.12,1)}}>
          <Artwork index={logical}/>
        </div>;
      })}
    </div>
    <div className="rag-navigation"><button aria-label="Previous slide" onClick={()=>step(-1)}><ChevronLeft size={18}/></button><span>ELASTIC / INFINITE</span><button aria-label="Next slide" onClick={()=>step(1)}><ChevronRight size={18}/></button></div>
  </div>;
}

type Pixel={x:number;y:number;r:number;g:number;b:number};
type Particle={x:number;y:number;vx:number;vy:number};
const SW=500,SH=280;
function poster(index:number):HTMLCanvasElement{
  const c=document.createElement('canvas');c.width=SW;c.height=SH;const g=c.getContext('2d')!;
  g.fillStyle='#050505';g.fillRect(0,0,SW,SH);
  if(index===0){g.beginPath();g.arc(SW/2,SH/2,88,0,Math.PI*2);g.fillStyle='#e5e5e5';g.fill();g.beginPath();g.arc(SW/2+15,SH/2,42,0,Math.PI*2);g.fillStyle='#111';g.fill();}
  else{g.save();g.translate(SW/2,SH/2);g.rotate(Math.PI/4);g.fillStyle='#eaeaea';g.fillRect(-78,-78,156,156);g.fillStyle='#222';g.fillRect(-43,-43,86,86);g.restore()}
  return c;
}
function imagePixels(source:CanvasImageSource,capacity:number):Pixel[]{
  const canvas=document.createElement('canvas');canvas.width=SW;canvas.height=SH;const context=canvas.getContext('2d',{willReadFrequently:true});
  if(!context)return [];
  context.fillStyle='#050505';context.fillRect(0,0,SW,SH);
  context.drawImage(source,0,0,SW,SH);
  const pixels=context.getImageData(0,0,SW,SH).data;const pool:Pixel[]=[];
  for(let y=4;y<SH-4;y+=5)for(let x=4;x<SW-4;x+=5){
    const i=(y*SW+x)*4;const r=pixels[i],g=pixels[i+1],b=pixels[i+2];
    if((r+g+b)/3>42)pool.push({x,y,r,g,b});
  }
  return Array.from({length:Math.min(capacity,pool.length)},(_,i)=>pool[Math.floor(i*pool.length/Math.min(capacity,pool.length))]);
}
export function PixelDrift(){
  const canvas=useRef<HTMLCanvasElement>(null);
  const [slot,setSlot]=useState(0);
  const [playing,setPlaying]=useState(true);
  const [userImages,setUserImages]=useState<[string|null,string|null]>([null,null]);
  const reduced=useMotionPreference();
  const data=useRef<[Pixel[],Pixel[]]>([[],[]]);
  const dots=useRef<Particle[]>([]);
  const cursor=useRef({x:-999,y:-999});
  useEffect(()=>{
    let cancelled=false;
    const images=userImages;
    (async()=>{
      const next:[Pixel[],Pixel[]]=[[],[]];
      for(let i=0;i<2;i++){
        let source:CanvasImageSource=poster(i);
        if(images[i]){
          const img=new Image();
          try{await new Promise<void>((resolve,reject)=>{img.onload=()=>resolve();img.onerror=()=>reject();img.src=images[i]!})}catch{/* Retain default poster */ }
          if(img.complete&&img.naturalWidth)source=img;
        }
        next[i]=imagePixels(source,1800);
      }
      if(!cancelled)data.current=next;
    })();
    return()=>{cancelled=true};
  },[userImages]);
  useEffect(()=>{
    const el=canvas.current,ctx=el?.getContext('2d');if(!el||!ctx)return;
    el.width=SW;el.height=SH;
    let raf=0;let last=0;
    const render=(now:number)=>{
      if(now-last<16&&!reduced){raf=requestAnimationFrame(render);return}
      last=now;
      const targets=data.current[slot],n=targets.length;
      if(!n){ctx.fillStyle='#050505';ctx.fillRect(0,0,SW,SH);raf=requestAnimationFrame(render);return}
      if(dots.current.length!==n)dots.current=targets.map(t=>({x:t.x,y:t.y,vx:0,vy:0}));
      ctx.fillStyle='#050505';ctx.fillRect(0,0,SW,SH);
      const pointer=cursor.current;
      for(let i=0;i<n;i++){
        const p=dots.current[i],t=targets[i];
        if(!reduced&&playing){
          const fx=(t.x-p.x)*.025,fy=(t.y-p.y)*.025;
          const dx=p.x-pointer.x,dy=p.y-pointer.y,d=Math.hypot(dx,dy);
          const force=d<65&&d>0?(65-d)/65*1.8:0;
          p.vx=(p.vx+fx+dx/Math.max(d,1)*force)*.81;
          p.vy=(p.vy+fy+dy/Math.max(d,1)*force)*.81;
          p.x+=p.vx;p.y+=p.vy;
        }else if(reduced){p.x=t.x;p.y=t.y;p.vx=0;p.vy=0}
        ctx.fillStyle='rgb('+t.r+','+t.g+','+t.b+')';ctx.fillRect(p.x,p.y,2,2);
      }
      if(!reduced)raf=requestAnimationFrame(render);
    };
    raf=requestAnimationFrame(render);
    return()=>cancelAnimationFrame(raf);
  },[slot,reduced,playing,userImages]);
  useEffect(()=>()=>{userImages.forEach(u=>{if(u)URL.revokeObjectURL(u)})},[userImages]);
  const chooseFile=(i:number,file?:File)=>{
    if(!file||!file.type.startsWith('image/'))return;
    if(file.size>8_000_000)return;
    const url=URL.createObjectURL(file);
    setUserImages(prev=>{const next:[string|null,string|null]=[...prev];next[i]=url;return next});
  };
  return <div className="rag-particles">
    <canvas ref={canvas} aria-label={'Particle morph preview '+(slot===0?'image A':'image B')}
      onPointerMove={e=>{const box=e.currentTarget.getBoundingClientRect();cursor.current={x:(e.clientX-box.left)/box.width*SW,y:(e.clientY-box.top)/box.height*SH}}}
      onPointerLeave={()=>{cursor.current={x:-999,y:-999}}}/>
    <div className="rag-particle-toolbar">
      <button type="button" className={slot===0?'active':''} onClick={()=>setSlot(0)}>IMAGE A</button>
      <button type="button" className={slot===1?'active':''} onClick={()=>setSlot(1)}>IMAGE B</button>
      <button type="button" onClick={()=>setPlaying(p=>!p)} aria-label={playing?'Pause':'Play'}>{playing?<Pause size={15}/>:<Play size={15}/>}</button>
    </div>
    <div className="rag-upload-row">{([0,1] as const).map(i=><label key={i} className="rag-upload"><ImagePlus size={16}/> {i===0?'Replace A':'Replace B'}<input type="file" accept="image/*" onChange={e=>chooseFile(i,e.target.files?.[0])}/></label>)}</div>
    <p>Images remain on your device. For best results, use high-contrast portraits or silhouettes.</p>
  </div>;
}

export const galleryPhysicsRegistry:Record<GalleryPhysicsId,()=>import('react').ReactElement>={
  'page-turn':Paperbound,'endless-gallery':InfinityCorridor,'spring-reel':SpringFilmstrip,'image-particles':PixelDrift,
};

'use client';

import { useCallback, useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react';
import Link from 'next/link';
import { ArrowLeft, ArrowRight, ArrowUpRight, Bell, Check, ChevronDown, ChevronLeft, ChevronRight, Code2, Copy, ExternalLink, GitBranch, Play, RotateCcw, Sparkles, Trash2, X } from 'lucide-react';
import type { Locale } from '@/i18n/config';

export type AdvancedId='paper-mill'|'tear-pass'|'folded-sheet'|'branch-nav'|'elastic-rail'|'swipe-notice'|'bell-pulse'|'dot-morph';

export const advancedCatalog:{id:AdvancedId;en:string;ar:string;description:string;category:string;reference:string}[]=[
  {id:'paper-mill',en:'Paper Mill',ar:'فرّامة الورق',description:'Drag the sheet into the machine. It becomes individual curling strips.',category:'PHYSICS',reference:'Shredder'},
  {id:'tear-pass',en:'Perforated Pass',ar:'تذكرة قابلة للتمزيق',description:'Grab and tear a perforated ticket with elastic resistance.',category:'GESTURES',reference:'Tear Ticket'},
  {id:'folded-sheet',en:'Folded Sheet',ar:'تجعيد الورق',description:'Press and drag to build creases, then compress into a paper ball.',category:'SIMULATION',reference:'Paper Crumple'},
  {id:'branch-nav',en:'Branch Navigator',ar:'القائمة المتفرعة',description:'An animated connected menu, with expandable branches and active path.',category:'NAVIGATION',reference:'Branched Menu'},
  {id:'elastic-rail',en:'Elastic Rail',ar:'معرض مرن',description:'Drag an expanding editorial image reel with depth and momentum.',category:'GALLERIES',reference:'Elastic Reel / Flex Carousel'},
  {id:'swipe-notice',en:'Swipe Notice',ar:'تنبيه بالسحب',description:'An action notification with a draining fuse and swipe-to-dismiss.',category:'MICRO',reference:'Swipe Toast'},
  {id:'bell-pulse',en:'Bell Pulse',ar:'جرس متفاعل',description:'A stateful notification switch with springy bell motion.',category:'MICRO',reference:'Bell Toggle'},
  {id:'dot-morph',en:'Glyph Cloud',ar:'سحابة جسيمات',description:'A real canvas particle field morphing between glyph shapes.',category:'PARTICLES',reference:'Particle Morph (concept only)'},
];

function useReducedMotion(){
  const [reduced,setReduced]=useState(false);
  useEffect(()=>{
    const mq=window.matchMedia('(prefers-reduced-motion: reduce)');
    const update=()=>setReduced(mq.matches);update();
    mq.addEventListener?.('change',update);
    return()=>mq.removeEventListener?.('change',update);
  },[]);
  return reduced;
}

export function PaperMill(){
  const [feed,setFeed]=useState(0);
  const [strips,setStrips]=useState(0);
  const [done,setDone]=useState(false);
  const origin=useRef<number|null>(null);
  const timer=useRef<ReturnType<typeof setTimeout>|null>(null);
  const reduced=useReducedMotion();
  useEffect(()=>()=>{if(timer.current)clearTimeout(timer.current)},[]);
  const reset=()=>{if(timer.current)clearTimeout(timer.current);setFeed(0);setStrips(0);setDone(false)};
  function down(e:ReactPointerEvent<HTMLDivElement>){if(done)return;origin.current=e.clientY;e.currentTarget.setPointerCapture(e.pointerId)}
  function move(e:ReactPointerEvent<HTMLDivElement>){if(origin.current===null||done)return;setFeed(Math.max(0,Math.min(135,e.clientY-origin.current)))}
  function up(){if(origin.current===null)return;origin.current=null;if(feed<72){setFeed(0);return}setFeed(135);setStrips(1);setDone(true);timer.current=setTimeout(()=>setStrips(2),reduced?0:900)}
  return <div className="rav-shred-scene">
    <div role="button" tabIndex={0} aria-label="Feed sheet into paper shredder" className={'rav-paper-sheet '+(done?'rav-sheet-fed':'')}
      onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerCancel={up}
      onKeyDown={e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();setFeed(135);setStrips(2);setDone(true)}}}
      style={{transform:'translateY('+feed+'px)',opacity:done?0:1}}>
      <small>RAWNAK / DOCUMENT 001</small><strong>CONFIDENTIAL</strong><span/><span/><span/><span/>
      <em>DRAG DOWN ↓</em>
    </div>
    <div className="rav-shred-machine"><span>RAWNAK · SHREDDER</span><div className="rav-shred-slot"/></div>
    <div className="rav-strips" aria-hidden="true">
      {strips>0&&Array.from({length:18},(_,i)=><span key={i} className="rav-strip" style={{left:(i*5.5)+'%',animationDelay:(i*0.035)+'s',height:(70+(i*13)%45)+'px',rotate:((i%5)-2)*3+'deg'}}/>)}
    </div>
    <button type="button" className="rav-reset" onClick={reset}><RotateCcw size={15}/> Reset sheet</button>
  </div>;
}

export function TearPass(){
  const [travel,setTravel]=useState({x:0,y:0});
  const [torn,setTorn]=useState(false);
  const start=useRef<{x:number;y:number}|null>(null);
  const reduced=useReducedMotion();
  const down=(e:ReactPointerEvent<HTMLDivElement>)=>{if(torn)return;start.current={x:e.clientX,y:e.clientY};e.currentTarget.setPointerCapture(e.pointerId)};
  const move=(e:ReactPointerEvent<HTMLDivElement>)=>{if(!start.current||torn)return;setTravel({x:Math.max(-10,Math.min(175,e.clientX-start.current.x)),y:Math.max(-80,Math.min(95,e.clientY-start.current.y))})};
  const up=()=>{if(!start.current)return;start.current=null;if(travel.x>68){setTorn(true)}else setTravel({x:0,y:0})};
  return <div className="rav-ticket-scene">
    <div className="rav-ticket">
      <div className="rav-ticket-body"><span>RAWNAK / ADMIT ONE</span><strong>DESIGN<br/>FUTURE</strong><small>OCT 2026 · ACCESS 01</small><div className="rav-ticket-circle"/></div>
      <div role="button" tabIndex={0} aria-label="Tear off the ticket stub" className={'rav-ticket-stub '+(torn?'torn':'')}
        onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerCancel={up}
        onKeyDown={e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();setTorn(true)}}}
        style={{transform:torn?(reduced?'translateX(180px)':'translate(195px,140px) rotate(38deg)'):'translate('+travel.x+'px,'+travel.y+'px) rotate('+travel.x*.11+'deg)'}}>
        <span>✳</span><small>NO. 00192</small><em>DRAG →</em>
      </div>
    </div>
    <p>{torn?'Ticket redeemed — stub removed':'Grab the right stub and pull to tear'}</p>
    <button className="rav-reset" onClick={()=>{setTorn(false);setTravel({x:0,y:0})}}><RotateCcw size={15}/> New ticket</button>
  </div>;
}

export function FoldedSheet(){
  const [pressure,setPressure]=useState(0);
  const [ball,setBall]=useState(false);
  const downY=useRef<number|null>(null);
  function move(e:ReactPointerEvent<HTMLDivElement>){
    if(downY.current===null||ball)return;
    setPressure(Math.min(100,Math.max(8,Math.abs(e.clientY-downY.current)*1.25+Math.abs(e.movementX)*1.4)));
  }
  function end(){if(downY.current===null)return;downY.current=null;if(pressure>60){setBall(true)}else setPressure(0)}
  return <div className="rav-crumple-scene">
    <div role="button" tabIndex={0} aria-label="Press and drag paper to crumple" className={'rav-fold-sheet '+(ball?'is-ball':'')}
      style={{'--pressure':pressure/100} as React.CSSProperties}
      onPointerDown={e=>{if(ball)return;downY.current=e.clientY;e.currentTarget.setPointerCapture(e.pointerId)}}
      onPointerMove={move} onPointerUp={end} onPointerCancel={end}
      onKeyDown={e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();setBall(true)}}}>
      <div className="rav-crumple-facets">{Array.from({length:25},(_,i)=><i key={i} style={{'--i':i,'--angle':((i*37)%110)-55+'deg'} as React.CSSProperties}/>)}</div>
      <div className="rav-paper-ink"><span>R / 001</span><strong>GOOD IDEAS<br/>TAKE SHAPE.</strong><p>Hold and drag to fold the surface</p></div>
    </div>
    <p>{ball?'Shape transformed':'Press, hold and drag to wrinkle the paper'}</p>
    <button className="rav-reset" onClick={()=>{setBall(false);setPressure(0)}}><RotateCcw size={15}/> Flatten</button>
  </div>;
}

const branchTree=[
  {name:'DESIGN',nodes:['Brand Identity','Interfaces','Motion Design']},
  {name:'ENGINEERING',nodes:['Web Apps','Automation','Robotics']},
  {name:'CREATIVE',nodes:['Art Direction','Experiences','Editorial']},
];
export function BranchNavigator(){
  const [expanded,setExpanded]=useState<number|null>(0);
  const [selected,setSelected]=useState('Interfaces');
  return <div className="rav-branch-scene">
    <div className="rav-branch-root"><GitBranch size={18}/> RAWNAK / WORLDS <span>● LIVE</span></div>
    <div className="rav-branch-tree">
      {branchTree.map((g,i)=><div className="rav-branch-group" key={g.name}>
        <button type="button" aria-expanded={expanded===i} className={'rav-branch-parent '+(expanded===i?'open':'')} onClick={()=>setExpanded(expanded===i?null:i)}>
          <span>{String(i+1).padStart(2,'0')}</span>{g.name}<ChevronDown size={16}/>
        </button>
        <div className={'rav-branch-children '+(expanded===i?'show':'')} style={{'--child-count':g.nodes.length} as React.CSSProperties}>
          {g.nodes.map(n=><button type="button" key={n} aria-pressed={selected===n} onClick={()=>setSelected(n)}>
            <span className="rav-branch-node"/>{n}{selected===n&&<Check size={13}/>}
          </button>)}
        </div>
      </div>)}
    </div>
    <div className="rav-branch-selected">SELECTED PATH <strong>RAWNAK / {selected.toUpperCase()}</strong></div>
  </div>;
}

const gallery=[
  {id:'01',title:'MONOLITH',sub:'Architecture of silence',gradient:'linear-gradient(140deg,#929292,#313131 43%,#050505 90%)'},
  {id:'02',title:'ARC',sub:'Form follows motion',gradient:'linear-gradient(35deg,#171717,#a0a0a0 43%,#262626 65%)'},
  {id:'03',title:'ECLIPSE',sub:'A study of contrast',gradient:'radial-gradient(circle at 30% 20%,#aaa,#222 38%,#000 75%)'},
  {id:'04',title:'ORBIT',sub:'Beyond the surface',gradient:'linear-gradient(165deg,#121212,#777 57%,#111)'},
];
export function ElasticRail(){
  const [selected,setSelected]=useState(1);
  const origin=useRef<number|null>(null);
  const [offset,setOffset]=useState(0);
  function up(){if(origin.current===null)return;origin.current=null;if(Math.abs(offset)>32)setSelected(i=>(i+(offset<0?1:-1)+gallery.length)%gallery.length);setOffset(0)}
  const step=(n:number)=>setSelected(i=>(i+n+gallery.length)%gallery.length);
  return <div className="rav-gallery-scene">
    <div className="rav-gallery-track" role="region" tabIndex={0} aria-label="Elastic gallery; use arrow keys"
      onKeyDown={e=>{if(e.key==='ArrowLeft')step(-1);if(e.key==='ArrowRight')step(1)}}
      onPointerDown={e=>{origin.current=e.clientX;e.currentTarget.setPointerCapture(e.pointerId)}}
      onPointerMove={e=>{if(origin.current!==null)setOffset(Math.max(-120,Math.min(120,e.clientX-origin.current)))}} onPointerUp={up} onPointerCancel={up}>
      {gallery.map((g,i)=>{
        const diff=(i-selected+gallery.length)%gallery.length;
        const pos=diff>2?diff-gallery.length:diff;
        return <button key={g.id} tabIndex={pos===0?0:-1} aria-label={'Select '+g.title} type="button"
          className={'rav-gallery-slide '+(pos===0?'active':'')}
          style={{'--pos':pos,'--drag':offset+'px','--scene':g.gradient} as React.CSSProperties}
          onClick={()=>{if(origin.current===null)setSelected(i)}}>
          <small>{g.id} / RAWNAK</small><div className="rav-gallery-orb"/><strong>{g.title}</strong><span>{g.sub}</span>
        </button>;
      })}
      </div>
      <div className="rav-gallery-controls"><button onClick={()=>step(-1)} aria-label="Previous slide"><ChevronLeft size={18}/></button><span>{selected+1} / {gallery.length}</span><button onClick={()=>step(1)} aria-label="Next slide"><ChevronRight size={18}/></button></div>
    </div>;
}

export function SwipeNotice(){
  const [visible,setVisible]=useState(false);
  const [id,setId]=useState(0);
  const [drag,setDrag]=useState(0);
  const [paused,setPaused]=useState(false);
  const origin=useRef<number|null>(null);
  const timeout=useRef<ReturnType<typeof setTimeout>|null>(null);
  useEffect(()=>{
    if(timeout.current)clearTimeout(timeout.current);
    if(!visible||paused)return;
    timeout.current=setTimeout(()=>setVisible(false),5200);
    return()=>{if(timeout.current)clearTimeout(timeout.current)};
  },[visible,id,paused]);
  const show=()=>{setVisible(true);setId(x=>x+1);setDrag(0)};
  return <div className="rav-notice-scene">
    <button type="button" className="rav-notice-launch" onClick={show}><Play size={15}/> Show notification</button>
    {visible&&<div className="rav-toast" role="status" onPointerEnter={()=>setPaused(true)} onPointerLeave={()=>setPaused(false)}
      onPointerDown={e=>{origin.current=e.clientY;e.currentTarget.setPointerCapture(e.pointerId)}}
      onPointerMove={e=>{if(origin.current!==null)setDrag(Math.max(-18,Math.min(180,e.clientY-origin.current)))}} onPointerUp={()=>{if(drag>46)setVisible(false);else setDrag(0);origin.current=null}}
      style={{transform:'translateY('+drag+'px)'}}>
      <div className="rav-toast-line"><div className="rav-toast-icon"><Check size={17}/></div><div><strong>Changes saved</strong><p>Your motion preset is ready.</p></div><button aria-label="Dismiss notice" onClick={()=>setVisible(false)}><X size={17}/></button></div>
      <div className={'rav-toast-fuse '+(paused?'paused':'')} key={id}/>
    </div>}
    {!visible&&<p>Show a notification, then swipe it down to dismiss.</p>}
  </div>;
}

export function BellPulse(){
  const [pressed,setPressed]=useState(false);
  const [ring,setRing]=useState(0);
  return <div className="rav-bell-scene">
    <button className={'rav-bell-btn '+(pressed?'pressed':'')} type="button" aria-pressed={pressed}
      onClick={()=>{setPressed(x=>!x);setRing(x=>x+1)}}>
      <span className="rav-bell-symbol" key={ring}><Bell size={26}/></span><span>{pressed?'NOTIFICATIONS ON':'NOTIFY ME'}</span><span className="rav-bell-count">{pressed?'1':'0'}</span>
    </button>
    <p>{pressed?'Notifications enabled':'Press to activate notifications'}</p>
  </div>;
}

type Particle={x:number;y:number;vx:number;vy:number;tx:number;ty:number};
export function GlyphCloud(){
  const canvas=useRef<HTMLCanvasElement>(null);
  const [index,setIndex]=useState(0);
  const words=['RAWNAK','CREATE','BEYOND'];
  const reduced=useReducedMotion();
  useEffect(()=>{
    const el=canvas.current;if(!el)return;
    const ctx=el.getContext('2d');if(!ctx)return;
    const W=640,H=250;
    el.width=W;el.height=H;
    const temp=document.createElement('canvas');temp.width=W;temp.height=H;
    const tc=temp.getContext('2d',{willReadFrequently:true});if(!tc)return;
    tc.clearRect(0,0,W,H);tc.fillStyle='#fff';tc.textAlign='center';tc.textBaseline='middle';tc.font='900 95px Arial, sans-serif';tc.fillText(words[index],W/2,H/2+5);
    const raw=tc.getImageData(0,0,W,H).data;
    const points:{x:number;y:number}[]=[];
    for(let y=20;y<H-20;y+=5)for(let x=12;x<W-12;x+=5)if(raw[(y*W+x)*4+3]>125)points.push({x,y});
    const total=Math.min(1450,points.length);
    const particles:Particle[]=Array.from({length:total},(_,i)=>{
      const target=points[Math.floor(i*points.length/Math.max(total,1))];
      return {x:index===0?target.x:W/2+(Math.random()-.5)*W,y:index===0?target.y:H/2+(Math.random()-.5)*H,vx:0,vy:0,tx:target.x,ty:target.y};
    });
    let frame=0,raf=0;const cursor={x:-100,y:-100};
    const move=(e:globalThis.PointerEvent)=>{const b=el.getBoundingClientRect();cursor.x=(e.clientX-b.left)*W/b.width;cursor.y=(e.clientY-b.top)*H/b.height};
    const leave=()=>{cursor.x=-100;cursor.y=-100};
    el.addEventListener('pointermove',move);el.addEventListener('pointerleave',leave);
    const render=()=>{
      ctx.fillStyle='#050505';ctx.fillRect(0,0,W,H);ctx.fillStyle='#eee';
      for(const p of particles){
        if(!reduced){
          const dx=p.tx-p.x,dy=p.ty-p.y;
          const cx=p.x-cursor.x,cy=p.y-cursor.y,d2=cx*cx+cy*cy;
          if(d2<4900&&d2>0){const n=(70-Math.sqrt(d2))/70;p.vx+=cx/Math.sqrt(d2)*n*2.3;p.vy+=cy/Math.sqrt(d2)*n*2.3}
          p.vx=(p.vx+dx*.023)*.84;p.vy=(p.vy+dy*.023)*.84;p.x+=p.vx;p.y+=p.vy;
        }else{p.x=p.tx;p.y=p.ty;}
        ctx.globalAlpha=.8;ctx.beginPath();ctx.arc(p.x,p.y,1.45,0,Math.PI*2);ctx.fill();
      }
      ctx.globalAlpha=1;
      if(!reduced){raf=requestAnimationFrame(render)}
    };
    render();
    return()=>{cancelAnimationFrame(raf);el.removeEventListener('pointermove',move);el.removeEventListener('pointerleave',leave)};
  },[index,reduced]);
  return <div className="rav-particles-scene"><canvas ref={canvas} aria-label={'Particle text '+words[index]}/><div className="rav-particles-controls"><button onClick={()=>setIndex(i=>(i+words.length-1)%words.length)} aria-label="Previous word"><ChevronLeft size={17}/></button><span>{words[index]}</span><button onClick={()=>setIndex(i=>(i+1)%words.length)} aria-label="Next word"><ChevronRight size={17}/></button></div></div>;
}

export const advancedRegistry:Record<AdvancedId,()=>React.JSX.Element>={
  'paper-mill':PaperMill,'tear-pass':TearPass,'folded-sheet':FoldedSheet,'branch-nav':BranchNavigator,
  'elastic-rail':ElasticRail,'swipe-notice':SwipeNotice,'bell-pulse':BellPulse,'dot-morph':GlyphCloud,
};

export default function AdvancedLab({locale,baseHref}:{locale:Locale;baseHref:string}){
  const ar=locale==='ar';
  const [active,setActive]=useState<AdvancedId>('paper-mill');
  const [notice,setNotice]=useState('');
  const item=advancedCatalog.find(x=>x.id===active)!;
  const Demo=advancedRegistry[active];
  const snippet="import { "+Demo.name+" } from '@/components/tools/AdvancedLab';\n\nexport default function Example(){\n  return <"+Demo.name+" />;\n}\n";
  const sourceUrl='https://github.com/altaqawy/rawnak/blob/feat/rawnak-tools-mvp/components/tools/AdvancedLab.tsx';
  async function copy(){try{await navigator.clipboard.writeText(snippet);setNotice(ar?'تم نسخ مثال الاستخدام':'Usage snippet copied');}catch{setNotice(ar?'انسخ المثال من الصندوق':'Select and copy the example manually');}}
  return <main className="rav-root">
    <div className="rt-container rav-hero">
      <Link className="rav-back" href={baseHref}>{ar?<ArrowRight size={15}/>:<ArrowLeft size={15}/>} {ar?'العودة إلى الأدوات':'Back to Rawnak Tools'}</Link>
      <div className="rt-eyebrow">PHYSICS · GESTURE · SIMULATION / EXPERIMENTAL</div>
      <h1>{ar?'ما وراء':'Beyond'} <span>{ar?'الحركة.':'motion.'}</span></h1>
      <p>{ar?'ثماني تجارب أصلية لحركات متقدمة تعتمد على السحب والتفاعل ومحاكاة الورق والجسيمات.':'Eight original experiments in gestures, paper simulation, interactive navigation, kinetic galleries, and canvas particles.'}</p>
      <div className="rav-hero-stats"><span>08 INTERACTIONS</span><span>FIRST-PARTY CODE</span><span>DESKTOP + TOUCH</span></div>
    </div>
    <div className="rt-container rav-workspace">
      <nav className="rav-selector" aria-label={ar?'اختيار تجربة':'Choose an experience'}>
        {advancedCatalog.map((p,i)=><button key={p.id} type="button" className={active===p.id?'active':''} onClick={()=>{setActive(p.id);setNotice('')}} aria-pressed={active===p.id}>
          <span>{String(i+1).padStart(2,'0')}</span><strong>{ar?p.ar:p.en}</strong><ArrowUpRight size={14}/>
        </button>)}
      </nav>
      <section className="rav-workbench">
        <div className="rav-heading"><div><div className="rt-eyebrow">{item.category} / INTERACTIVE</div><h2>{ar?item.ar:item.en}</h2><p>{item.description}</p></div><span className="rav-lab-indicator">● LIVE</span></div>
        <div className="rav-preview-frame"><div className="rav-preview-label"><span>LIVE INTERACTION</span><span>RA / 0{advancedCatalog.indexOf(item)+1}</span></div>
          <div className="rav-stage"><Demo key={active}/></div>
        </div>
        <div className="rav-source-panel">
          <div className="rav-source-head"><strong><Code2 size={15}/> React integration</strong><div><button onClick={copy}><Copy size={14}/>{ar?'نسخ مثال الاستخدام':'Copy usage'}</button><a href={sourceUrl} target="_blank" rel="noopener noreferrer">View complete source <ExternalLink size={13}/></a></div></div>
          <pre dir="ltr"><code>{snippet}</code></pre><p role="status" aria-live="polite">{notice||(ar?'انقل الملف الأصلي وملف CSS إلى مشروعك، ثم استخدم الاستيراد المعروض.':'Copy AdvancedLab.tsx and advanced-lab.css into your project before using this import.')}</p>
        </div>
        <p className="rav-legal">{ar?'هذه مكونات أصلية مستوحاة من أفكار التفاعل العامة وليست نسخًا من React Bits أو كود Pro.':'Independent original implementations inspired by general interaction patterns, not React Bits source or Pro code.'}</p>
      </section>
    </div>
  </main>;
}

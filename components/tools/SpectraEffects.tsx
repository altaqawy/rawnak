'use client';

import {useEffect,useRef,useState,type PointerEvent as RPointerEvent} from 'react';
import {ChevronLeft,ChevronRight,Play,Pause,RotateCcw} from 'lucide-react';

export type SpectraKind='star-burst'|'ribbon-flow'|'prism-carousel';
export type SpectraConfig={
  particles:number; power:number; drag:number; trail:number;
  ribbonWidth:number; spring:number; layers:number;
  speed:number; perspective:number; autoplay:boolean;
};
export const defaultSpectra:SpectraConfig={
  particles:180,power:1.2,drag:.972,trail:.18,
  ribbonWidth:23,spring:.19,layers:3,
  speed:4,perspective:850,autoplay:false,
};
export const spectraCatalog=[
  {id:'star-burst' as const,en:'Star Burst',ar:'انفجار النجوم',tag:'PARTICLE ENGINE',
    info:'Layered radial bursts with velocity, gravity, glow and a fading trajectory.'},
  {id:'ribbon-flow' as const,en:'Ribbon Flow',ar:'تدفق الشرائط',tag:'PHYSICS / CANVAS',
    info:'Multiple layered ribbons with independent spring response and fluid trailing.'},
  {id:'prism-carousel' as const,en:'Prism Carousel',ar:'المعرض المنشوري',tag:'3D / CAROUSEL',
    info:'A six-sided spatial carousel with gesture navigation, perspective and optional autoplay.'},
];

function useReduced(){
  const [reduced,setReduced]=useState(false);
  useEffect(()=>{
    const media=window.matchMedia('(prefers-reduced-motion: reduce)');
    const update=()=>setReduced(media.matches);update();
    media.addEventListener?.('change',update);
    return()=>media.removeEventListener?.('change',update);
  },[]);
  return reduced;
}

type Particle={x:number;y:number;vx:number;vy:number;age:number;life:number;size:number;shade:number};
function fit(canvas:HTMLCanvasElement,context:CanvasRenderingContext2D){
  const r=canvas.getBoundingClientRect();
  const dpr=Math.min(window.devicePixelRatio||1,2);
  const w=Math.max(1,r.width),h=Math.max(1,r.height);
  const width=Math.ceil(w*dpr),height=Math.ceil(h*dpr);
  if(canvas.width!==width||canvas.height!==height){
    canvas.width=width;canvas.height=height;
  }
  context.setTransform(dpr,0,0,dpr,0,0);
  return {w,h};
}

export function StarBurst({config,playing,resetKey=0}:{config:SpectraConfig;playing:boolean;resetKey?:number}){
  const canvas=useRef<HTMLCanvasElement>(null);
  const particles=useRef<Particle[]>([]);
  const cursor=useRef({x:0,y:0});
  const burst=useRef<(x:number,y:number)=>void>(()=>{});
  const reduced=useReduced();
  useEffect(()=>{
    const el=canvas.current,ctx=el?.getContext('2d',{alpha:false});
    if(!el||!ctx)return;
    let raf=0,alive=true,last=performance.now(),lastBurst=last-1400,frameIndex=0;
    const {w,h}=fit(el,ctx);
    cursor.current={x:w/2,y:h/2};
    const total=Math.min(450,Math.max(24,config.particles));
    particles.current=[];
    burst.current=(x,y)=>{
      if(!alive)return;
      const group=Math.min(total,Math.ceil(total*.58));
      for(let i=0;i<group;i++){
        const theta=(i/group)*Math.PI*2+(Math.random()-.5)*.13;
        const speed=(.6+Math.random()*3.2)*config.power;
        particles.current.push({
          x,y,vx:Math.cos(theta)*speed,vy:Math.sin(theta)*speed,
          age:0,life:55+Math.random()*90,size:.6+Math.random()*1.9,
          shade:140+Math.floor(Math.random()*115),
        });
      }
      if(particles.current.length>total*3)particles.current=particles.current.slice(-total*3);
    };
    const draw=(now:number)=>{
      const dt=Math.min(2.1,Math.max(.3,(now-last)/16.667));last=now;
      // Alpha feedback produces luminous trails without a heavy blur shader.
      ctx.fillStyle='rgba(4,4,5,'+Math.min(.9,config.trail)+')';
      ctx.fillRect(0,0,w,h);
      ctx.save();ctx.globalCompositeOperation='screen';
      const active=particles.current;
      for(let i=active.length-1;i>=0;i--){
        const p=active[i];const faded=1-p.age/p.life;
        if(faded<=0){active.splice(i,1);continue}
        if(!reduced && playing){
          p.vx*=Math.pow(config.drag,dt);
          p.vy=p.vy*Math.pow(config.drag,dt)+.018*dt;
          p.x+=p.vx*dt;p.y+=p.vy*dt;p.age+=dt;
        }
        ctx.globalAlpha=Math.max(0,faded)*.90;
        ctx.fillStyle='rgb('+p.shade+','+p.shade+','+p.shade+')';
        ctx.beginPath();ctx.arc(p.x,p.y,p.size*Math.max(.24,faded),0,Math.PI*2);ctx.fill();
        if(p.size>1.25){
          ctx.globalAlpha=faded*.13;
          ctx.beginPath();ctx.arc(p.x,p.y,p.size*3.3,0,Math.PI*2);ctx.fill();
        }
      }
      ctx.restore();
      // Tiny stationary field adds visual depth to the black canvas.
      ctx.fillStyle='rgba(255,255,255,.2)';
      for(let i=0;i<90;i++){
        const x=(Math.sin(i*17.33)*.5+.5)*w,y=(Math.cos(i*19.79)*.5+.5)*h;
        ctx.fillRect(x,y,1,1);
      }
      if(playing&&!reduced&&now-lastBurst>2000){
        burst.current(w*.3+Math.random()*w*.4,h*.26+Math.random()*h*.48);
        lastBurst=now;
      }
      frameIndex++;
      if(alive&&playing&&!reduced)raf=requestAnimationFrame(draw);
    };
    ctx.fillStyle='#040405';ctx.fillRect(0,0,w,h);
    burst.current(w/2,h/2);
    raf=requestAnimationFrame(draw);
    const obs=new ResizeObserver(()=>{fit(el,ctx)});
    obs.observe(el);
    return()=>{alive=false;cancelAnimationFrame(raf);obs.disconnect();particles.current=[]};
  },[config.particles,config.power,config.drag,config.trail,playing,reduced,resetKey]);
  return <div className="rvs-canvas-wrap" aria-label="Particle burst interactive canvas">
    <canvas ref={canvas} onPointerDown={e=>{const r=e.currentTarget.getBoundingClientRect();burst.current(e.clientX-r.left,e.clientY-r.top)}}/>
    <span className="rvs-canvas-caption">CLICK / TAP TO EMIT PARTICLES</span>
  </div>;
}

type Vec2={x:number;y:number};
export function RibbonFlow({config,playing,resetKey=0}:{config:SpectraConfig;playing:boolean;resetKey?:number}){
  const canvas=useRef<HTMLCanvasElement>(null);
  const pointer=useRef({x:0,y:0,active:false});
  const reduced=useReduced();
  useEffect(()=>{
    const el=canvas.current,ctx=el?.getContext('2d',{alpha:false});
    if(!el||!ctx)return;
    let raf=0,alive=true,last=performance.now(),clock=0;
    let {w,h}=fit(el,ctx);
    const trails:Vec2[][]=Array.from({length:Math.max(1,Math.min(5,config.layers))},()=>Array.from({length:68},()=>({x:w/2,y:h/2})));
    pointer.current={x:w/2,y:h/2,active:false};
    const paint=(now:number)=>{
      const dt=Math.min(2.3,Math.max(.3,(now-last)/16.667));last=now;
      if(playing&&!reduced)clock+=dt*.016;
      ctx.fillStyle='#050505';ctx.fillRect(0,0,w,h);
      const t=pointer.current;
      const x=t.active?t.x:w/2+Math.sin(clock*1.18)*w*.22;
      const y=t.active?t.y:h/2+Math.cos(clock*1.51)*h*.27;
      ctx.lineJoin='round';ctx.lineCap='round';
      trails.forEach((trail,layer)=>{
        const lag=(layer+1)*.18;
        const target={x:x+Math.sin(clock*2+layer*1.4)*w*.055,y:y+Math.cos(clock*1.7+layer)*h*.06};
        if(playing&&!reduced){
          const blend=1-Math.exp(-config.spring*dt*(1-lag*.4));
          trail[0].x+=(target.x-trail[0].x)*blend;
          trail[0].y+=(target.y-trail[0].y)*blend;
          for(let i=1;i<trail.length;i++){
            const fraction=1-Math.exp(-dt*(.24-i*.001)*(.94-layer*.045));
            trail[i].x+=(trail[i-1].x-trail[i].x)*fraction;
            trail[i].y+=(trail[i-1].y-trail[i].y)*fraction;
          }
        }else if(reduced){
          for(let i=0;i<trail.length;i++){
            trail[i].x=w/2+Math.cos(i*.05+layer*.32)*Math.min(110,w*.20);
            trail[i].y=h/2+Math.sin(i*.06+layer*.4)*h*.18;
          }
        }
        const lum=Math.floor(225-layer*28);
        const shade='rgb('+lum+','+lum+','+lum+')';
        for(let i=trail.length-1;i>1;i--){
          const fade=1-i/trail.length;
          ctx.beginPath();ctx.moveTo(trail[i].x,trail[i].y);
          ctx.lineTo(trail[i-1].x,trail[i-1].y);
          ctx.strokeStyle=shade;
          ctx.globalAlpha=.02+.6*fade*fade;
          ctx.lineWidth=Math.max(.35,(config.ribbonWidth/5)*fade*(1+layer*.15));
          ctx.stroke();
        }
        ctx.globalAlpha=1;
        ctx.beginPath();ctx.arc(trail[0].x,trail[0].y,Math.max(1.5,config.ribbonWidth*.1),0,Math.PI*2);
        ctx.fillStyle='#f5f5f5';ctx.fill();
      });
      ctx.globalAlpha=1;
      if(alive&&playing&&!reduced)raf=requestAnimationFrame(paint);
    };
    raf=requestAnimationFrame(paint);
    const observer=new ResizeObserver(()=>{const v=fit(el,ctx);w=v.w;h=v.h});observer.observe(el);
    return()=>{alive=false;cancelAnimationFrame(raf);observer.disconnect()};
  },[config.layers,config.ribbonWidth,config.spring,playing,reduced,resetKey]);
  return <div className="rvs-canvas-wrap"><canvas ref={canvas} aria-label="Animated multi-layer ribbon trails"
    onPointerMove={e=>{const r=e.currentTarget.getBoundingClientRect();pointer.current={x:e.clientX-r.left,y:e.clientY-r.top,active:true}}}
    onPointerLeave={()=>{pointer.current.active=false}}/>
    <span className="rvs-canvas-caption">MOVE POINTER / DRAW A PATH</span>
  </div>;
}

const slides=[
  {id:'01',title:'MONOLITH',subtitle:'Matter & form',shade:'linear-gradient(135deg,#575757,#171717 54%,#030303)'},
  {id:'02',title:'ORBIT',subtitle:'Motion & space',shade:'radial-gradient(circle at 35% 25%,#b5b5b5,#414141 39%,#090909)'},
  {id:'03',title:'ECLIPSE',subtitle:'Light & contrast',shade:'linear-gradient(25deg,#101010,#999 46%,#050505)'},
  {id:'04',title:'PRISM',subtitle:'Geometry & depth',shade:'radial-gradient(circle at 65% 50%,#777,#151515 61%,#050505)'},
  {id:'05',title:'SILENCE',subtitle:'Depth of quiet',shade:'linear-gradient(125deg,#070707,#666 45%,#181818)'},
  {id:'06',title:'FUTURE',subtitle:'Future of design',shade:'linear-gradient(155deg,#aaa,#323232 38%,#070707)'},
] as const;

export function PrismCarousel({config,playing,resetKey=0}:{config:SpectraConfig;playing:boolean;resetKey?:number}){
  const [active,setActive]=useState(0);
  const [drag,setDrag]=useState(0);
  const origin=useRef<number|null>(null);
  const reduced=useReduced();
  useEffect(()=>setActive(0),[resetKey]);
  useEffect(()=>{
    if(!playing||!config.autoplay||reduced)return;
    const timer=setInterval(()=>setActive(v=>(v+1)%slides.length),Math.max(1500,config.speed*1000));
    return()=>clearInterval(timer);
  },[playing,config.autoplay,config.speed,reduced]);
  function move(e:RPointerEvent<HTMLDivElement>){
    if(origin.current===null)return;
    setDrag(Math.max(-220,Math.min(220,e.clientX-origin.current)));
  }
  function release(){
    if(origin.current===null)return;origin.current=null;
    if(Math.abs(drag)>36)setActive(v=>(v+(drag<0?1:-1)+slides.length)%slides.length);
    setDrag(0);
  }
  function navigate(dir:number){setActive(v=>(v+dir+slides.length)%slides.length);setDrag(0)}
  return <div className="rvs-prism-root">
    <div className="rvs-prism-space" role="region" tabIndex={0} style={{perspective:config.perspective+"px"}}
      aria-label="Prism carousel, use arrow keys or drag to rotate"
      onKeyDown={e=>{if(e.key==='ArrowRight'){e.preventDefault();navigate(1)}if(e.key==='ArrowLeft'){e.preventDefault();navigate(-1)}}}
      onPointerDown={e=>{origin.current=e.clientX;try{e.currentTarget.setPointerCapture(e.pointerId)}catch{}}}
      onPointerMove={move} onPointerUp={release} onPointerCancel={()=>{origin.current=null;setDrag(0)}}>
      <div className="rvs-prism-shape"
        style={{transform:'rotateY('+(-active*60+drag*.14)+'deg)'}}>
        {slides.map((item,i)=><div className="rvs-prism-face" key={item.id}
          style={{transform:'rotateY('+(i*60)+'deg) translateZ(var(--prism-depth))',background:item.shade}}
          aria-hidden={active!==i}>
          <span>{item.id} / RAWNAK</span><div className="rvs-prism-orb"/><div className="rvs-prism-copy"><strong>{item.title}</strong><small>{item.subtitle}</small></div>
        </div>)}
      </div>
    </div>
    <div className="rvs-prism-nav">
      <button type="button" aria-label="Previous slide" onClick={()=>navigate(-1)}><ChevronLeft size={19}/></button>
      <span>{String(active+1).padStart(2,'0')} <i>/</i> 06</span>
      <button type="button" aria-label="Next slide" onClick={()=>navigate(1)}><ChevronRight size={19}/></button>
    </div>
    <div aria-live="polite" className="rvs-prism-sr">{slides[active].title}: {slides[active].subtitle}</div>
  </div>;
}

export const spectraRegistry={
  'star-burst':StarBurst,
  'ribbon-flow':RibbonFlow,
  'prism-carousel':PrismCarousel
} as const;

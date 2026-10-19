/** Original scroll & pointer effects for Rawnak Tools, not copied from third-party libraries. */
export type InteractionKind = 'scroll' | 'pointer';
export type InteractionPreset = {
  id: string; en: string; ar: string; kind: InteractionKind;
  from?: string; to?: string; background?: string;
};

export const interactionPresets: InteractionPreset[] = [
  {id:'scroll-rise',en:'Scroll Rise',ar:'صعود مع التمرير',kind:'scroll',from:'opacity:0;transform:translateY(70px)',to:'opacity:1;transform:translateY(0)'},
  {id:'scroll-fade',en:'Scroll Fade',ar:'ظهور تدريجي',kind:'scroll',from:'opacity:0',to:'opacity:1'},
  {id:'scroll-left',en:'Slide From Left',ar:'انزلاق من اليسار',kind:'scroll',from:'opacity:0;transform:translateX(-90px)',to:'opacity:1;transform:translateX(0)'},
  {id:'scroll-right',en:'Slide From Right',ar:'انزلاق من اليمين',kind:'scroll',from:'opacity:0;transform:translateX(90px)',to:'opacity:1;transform:translateX(0)'},
  {id:'scroll-scale',en:'Zoom Into View',ar:'تكبير عند الظهور',kind:'scroll',from:'opacity:0;transform:scale(.66)',to:'opacity:1;transform:scale(1)'},
  {id:'scroll-tilt',en:'Perspective Reveal',ar:'ظهور بمنظور',kind:'scroll',from:'opacity:0;transform:perspective(700px) rotateX(62deg) translateY(32px)',to:'opacity:1;transform:perspective(700px) rotateX(0) translateY(0)'},
  {id:'scroll-flip',en:'Flip Reveal',ar:'ظهور بانقلاب',kind:'scroll',from:'opacity:0;transform:perspective(700px) rotateY(-76deg)',to:'opacity:1;transform:perspective(700px) rotateY(0)'},
  {id:'scroll-blur',en:'Focus On Scroll',ar:'وضوح عند التمرير',kind:'scroll',from:'opacity:0;filter:blur(16px);transform:scale(1.12)',to:'opacity:1;filter:blur(0);transform:scale(1)'},
  {id:'scroll-clip',en:'Curtain Reveal',ar:'فتح الستارة',kind:'scroll',from:'clip-path:inset(0 100% 0 0);opacity:.2',to:'clip-path:inset(0 0 0 0);opacity:1'},
  {id:'scroll-stretch',en:'Stretch Reveal',ar:'ظهور بالتمدد',kind:'scroll',from:'opacity:0;transform:scaleX(.55) scaleY(1.3)',to:'opacity:1;transform:scaleX(1) scaleY(1)'},
  {id:'scroll-diagonal',en:'Diagonal Entrance',ar:'دخول قطري',kind:'scroll',from:'opacity:0;transform:translate(-50px,55px) rotate(-9deg)',to:'opacity:1;transform:translate(0,0) rotate(0)'},
  {id:'scroll-spring',en:'Spring Into View',ar:'ظهور بنابض',kind:'scroll',from:'opacity:0;transform:translateY(90px) scale(.85)',to:'opacity:1;transform:translateY(0) scale(1)'},
  {id:'pointer-spotlight',en:'Cursor Spotlight',ar:'كشاف المؤشر',kind:'pointer',background:'radial-gradient(circle 150px at var(--x,50%) var(--y,50%),#fff4,transparent 100%),#080808'},
  {id:'pointer-halo',en:'Orbiting Halo',ar:'هالة المؤشر',kind:'pointer',background:'radial-gradient(circle 95px at var(--x,50%) var(--y,50%),transparent 47%,#fff7 49%,transparent 52%),radial-gradient(circle 190px at var(--x,50%) var(--y,50%),transparent 70%,#fff3 71%,transparent 73%),#080808'},
  {id:'pointer-grid',en:'Living Grid',ar:'شبكة حيّة',kind:'pointer',background:'radial-gradient(circle 170px at var(--x,50%) var(--y,50%),#ffffff28,transparent 88%),linear-gradient(#ffffff12 1px,transparent 1px),linear-gradient(90deg,#ffffff12 1px,transparent 1px),#070707'},
  {id:'pointer-mesh',en:'Monochrome Mesh',ar:'شبكة تدرجات',kind:'pointer',background:'radial-gradient(ellipse 65% 65% at var(--x,50%) var(--y,50%),#ffffff45,transparent 75%),radial-gradient(ellipse at 10% 80%,#ffffff16,transparent 60%),#070707'},
  {id:'pointer-radar',en:'Radar Sweep',ar:'رادار المؤشر',kind:'pointer',background:'conic-gradient(from 35deg at var(--x,50%) var(--y,50%),transparent 0deg,#ffffff45 30deg,transparent 70deg,transparent 360deg),#080808'},
  {id:'pointer-beam',en:'Light Beam',ar:'شعاع ضوئي',kind:'pointer',background:'linear-gradient(90deg,transparent calc(var(--x,50%) - 70px),#ffffff3d var(--x,50%),transparent calc(var(--x,50%) + 70px)),#090909'},
  {id:'pointer-crosshair',en:'Cursor Crosshair',ar:'تقاطع المؤشر',kind:'pointer',background:'linear-gradient(90deg,transparent calc(var(--x,50%) - 1px),#ffffffaa var(--x,50%),transparent calc(var(--x,50%) + 1px)),linear-gradient(transparent calc(var(--y,50%) - 1px),#ffffffaa var(--y,50%),transparent calc(var(--y,50%) + 1px)),#090909'},
  {id:'pointer-dots',en:'Glowing Dot Field',ar:'حقل نقاط متوهجة',kind:'pointer',background:'radial-gradient(circle 120px at var(--x,50%) var(--y,50%),#ffffff35,transparent),radial-gradient(#ffffff48 1px,transparent 1px),#090909'},
  {id:'pointer-scan',en:'Scanner Line',ar:'خط الماسح',kind:'pointer',background:'linear-gradient(transparent calc(var(--y,50%) - 25px),#ffffff35 var(--y,50%),transparent calc(var(--y,50%) + 25px)),repeating-linear-gradient(0deg,#ffffff09 0 1px,transparent 1px 18px),#080808'},
  {id:'pointer-rings',en:'Concentric Rings',ar:'دوائر متحدة المركز',kind:'pointer',background:'repeating-radial-gradient(circle at var(--x,50%) var(--y,50%),transparent 0 22px,#ffffff3b 23px 24px,transparent 25px 46px),#090909'},
  {id:'pointer-diagonal',en:'Diagonal Glow',ar:'توهج قطري',kind:'pointer',background:'radial-gradient(circle 165px at var(--x,50%) var(--y,50%),#ffffff45,transparent),repeating-linear-gradient(125deg,transparent 0 19px,#ffffff16 20px,transparent 21px 42px),#080808'},
  {id:'pointer-prism',en:'Prism Focus',ar:'منشور الضوء',kind:'pointer',background:'conic-gradient(from 90deg at var(--x,50%) var(--y,50%),#ffffff18,#fff5,#ffffff06,#fff3,#ffffff18),#090909'},
];

export const interactionCount=interactionPresets.length;

export function getInteractionStyle(p:InteractionPreset,duration:number):string {
  const selector='rawnak-'+p.id;
  if(p.kind==='pointer'){
    const bg=p.background??'#090909';
    const sizes=p.id==='pointer-grid'?'background-size:auto,27px 27px,27px 27px,auto;':p.id==='pointer-dots'?'background-size:auto,23px 23px,auto;':'';
    return '.'+selector+'{min-height:250px;position:relative;--x:50%;--y:50%;background:'+bg+';'+sizes+'border:1px solid #494949;border-radius:20px;}\n';
  }
  return '.'+selector+'{opacity:1;}\n'+
    '@media(prefers-reduced-motion:no-preference){.'+selector+'.rawnak-ready{opacity:0;}'+
    '.'+selector+'.rawnak-ready.rawnak-visible{animation:'+selector+'-enter '+duration+'s cubic-bezier(.2,.8,.2,1) both;}'+
    '@keyframes '+selector+'-enter{from{'+(p.from??'opacity:0')+'}to{'+(p.to??'opacity:1')+'}}}\n';
}

function escapeHtml(s:string):string {
  return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');
}

export function exportInteraction(opts:{preset:InteractionPreset;duration:number;text:string;format:'html'|'react'}):string {
  const {preset,duration,text,format}=opts;
  const selector='rawnak-'+preset.id;
  const css=getInteractionStyle(preset,duration);
  const label=escapeHtml(text||'Design in motion');
  const scroll=preset.kind==='scroll';
  if(format==='html'){
    const tag=scroll?'<div class="'+selector+'">'+label+'</div>':
      '<div class="'+selector+'" role="img" aria-label="'+label+'"></div>';
    const js=scroll
      ? '(function(){const el=document.querySelector(".'+selector+'");if(!el)return;'+
        'if(window.matchMedia("(prefers-reduced-motion: reduce)").matches||!("IntersectionObserver" in window))return;'+
        'el.classList.add("rawnak-ready");'+
        'const io=new IntersectionObserver((entries)=>{if(entries.some(e=>e.isIntersecting)){el.classList.add("rawnak-visible");io.disconnect();}},{threshold:.15});io.observe(el);'+
        'setTimeout(()=>{el.classList.add("rawnak-visible");io.disconnect()},8000);})();'
      : '(function(){const el=document.querySelector(".'+selector+'");if(!el)return;'+
        'el.addEventListener("pointermove",e=>{const r=el.getBoundingClientRect();if(!r.width||!r.height)return;'+
        'el.style.setProperty("--x",Math.max(0,Math.min(100,(e.clientX-r.left)/r.width*100))+"%");'+
        'el.style.setProperty("--y",Math.max(0,Math.min(100,(e.clientY-r.top)/r.height*100))+"%");},{passive:true});'+
        'el.addEventListener("pointerleave",()=>{el.style.setProperty("--x","50%");el.style.setProperty("--y","50%");});})();';
    return tag+'\n<style>\n'+css+'</style>\n<script>\n'+js+'\n</script>';
  }
  const expr='{'+JSON.stringify(text||'Design in motion').replace(/</g,'\\u003c')+'}';
  if(scroll) return "'use client';\nimport { useEffect, useRef } from 'react';\n\nexport default function RawnakScroll() {\n"+
    "  const ref = useRef(null);\n  useEffect(() => {\n    const el = ref.current;\n    if (!el) return;\n"+
    "    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches || !('IntersectionObserver' in window)) return;\n"+
    "    el.classList.add('rawnak-ready');\n    const io = new IntersectionObserver(([entry]) => {\n"+
    "      if (entry?.isIntersecting) { el.classList.add('rawnak-visible'); io.disconnect(); }\n"+
    "    }, {threshold:0.15});\n    io.observe(el);\n"+
    "    const fallback = window.setTimeout(() => {el.classList.add('rawnak-visible');io.disconnect();}, 8000);\n"+
    "    return () => {io.disconnect();window.clearTimeout(fallback);};\n  }, []);\n  return <>\n"+
    '    <div ref={ref} className="'+selector+'">'+expr+'</div>\n'+
    '    <style>{'+JSON.stringify(css)+'}</style>\n  </>;\n}\n';
  return "'use client';\n\nexport default function RawnakBackground() {\n"+
    "  function move(e) {\n    const el=e.currentTarget;\n    const r=el.getBoundingClientRect();\n    if(!r.width||!r.height)return;\n"+
    "    el.style.setProperty('--x',Math.max(0,Math.min(100,(e.clientX-r.left)/r.width*100))+'%');\n"+
    "    el.style.setProperty('--y',Math.max(0,Math.min(100,(e.clientY-r.top)/r.height*100))+'%');\n  }\n"+
    "  function reset(e) {e.currentTarget.style.setProperty('--x','50%');e.currentTarget.style.setProperty('--y','50%');}\n"+
    '  return <>\n    <div className="'+selector+'" onPointerMove={move} onPointerLeave={reset} role="img" aria-label={'+JSON.stringify(text||'Interactive background')+'} />\n'+
    '    <style>{'+JSON.stringify(css)+'}</style>\n  </>;\n}\n';
}

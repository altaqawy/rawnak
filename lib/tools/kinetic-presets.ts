/**
 * Rawnak Kinetic Lab — independent first-party effects.
 * CSS/JS only, no copied paid/free competitor components.
 */
export type KineticCategory = 'cards' | 'magnetic' | 'galleries';
export type KineticPreset = {
  id: string;
  en: string;
  ar: string;
  category: KineticCategory;
  description: { en: string; ar: string };
  className: string;
};
export const kineticCategories: Array<{id: KineticCategory; en:string; ar:string}> = [
  {id:'cards',en:'3D Cards',ar:'بطاقات ثلاثية الأبعاد'},
  {id:'magnetic',en:'Magnetic',ar:'تأثيرات مغناطيسية'},
  {id:'galleries',en:'Galleries',ar:'معارض تفاعلية'},
];
export const kineticPresets: KineticPreset[] = [
  {id:'tilt-card',en:'Perspective Tilt',ar:'بطاقة بمنظور',category:'cards',className:'kl-tilt-card',description:{en:'Move your cursor to tilt in 3D.',ar:'حرّك المؤشر لتغيير منظور البطاقة.'}},
  {id:'glass-card',en:'Liquid Glass',ar:'زجاج لامع',category:'cards',className:'kl-glass-card',description:{en:'Frosted depth and a moving highlight.',ar:'شفافية وضوء يتبع المؤشر.'}},
  {id:'depth-card',en:'Layered Depth',ar:'طبقات متدرجة',category:'cards',className:'kl-depth-card',description:{en:'Multiple planes create parallax depth.',ar:'طبقات متباعدة بحركة بارالاكس.'}},
  {id:'border-card',en:'Border Glow',ar:'حدود مضيئة',category:'cards',className:'kl-border-card',description:{en:'A directional glow sweeps the border.',ar:'إضاءة على الأطراف تتبع المؤشر.'}},
  {id:'magnetic-button',en:'Magnetic Button',ar:'زر مغناطيسي',category:'magnetic',className:'kl-magnetic-button',description:{en:'A tactile button follows nearby motion.',ar:'زر يتحرك بمرونة نحو المؤشر.'}},
  {id:'magnetic-orb',en:'Magnetic Orb',ar:'كرة مغناطيسية',category:'magnetic',className:'kl-magnetic-orb',description:{en:'A floating control with soft attraction.',ar:'عنصر دائري ينجذب للمؤشر.'}},
  {id:'magnetic-pill',en:'Magnetic Pill',ar:'شارة مغناطيسية',category:'magnetic',className:'kl-magnetic-pill',description:{en:'A rounded pill with subtle attraction.',ar:'شارة مستديرة بانجذاب خفيف.'}},
  {id:'magnetic-square',en:'Magnetic Tile',ar:'بلاطة مغناطيسية',category:'magnetic',className:'kl-magnetic-square',description:{en:'A square tile with stronger travel.',ar:'بلاطة مربعة تتبع المؤشر.'}},
  {id:'gallery-rail',en:'Editorial Rail',ar:'معرض شريطي',category:'galleries',className:'kl-gallery-rail',description:{en:'A clean editorial carousel.',ar:'معرض صور أفقي بطابع تحريري.'}},
  {id:'gallery-stack',en:'Layer Stack',ar:'معرض الطبقات',category:'galleries',className:'kl-gallery-stack',description:{en:'Stacked panels with smooth transitions.',ar:'بطاقات فوق بعض تتبدل بسلاسة.'}},
  {id:'gallery-focus',en:'Focus Gallery',ar:'معرض التركيز',category:'galleries',className:'kl-gallery-focus',description:{en:'Center-stage slide with side previews.',ar:'تركيز على العنصر الرئيسي مع معاينة الجوانب.'}},
  {id:'gallery-arc',en:'Arc Gallery',ar:'معرض قوسي',category:'galleries',className:'kl-gallery-arc',description:{en:'Slides arc through perspective.',ar:'شرائح تتحرك في مسار منظور.'}},
];
export const kineticCount = kineticPresets.length;
export const galleryEntries = [
  {eyebrow:'01 / FORM',title:'Monolith',subtitle:'Minimal shapes, maximum presence.'},
  {eyebrow:'02 / MOTION',title:'Eclipse',subtitle:'A study in movement.'},
  {eyebrow:'03 / SPACE',title:'Orbit',subtitle:'Everything in its place.'},
  {eyebrow:'04 / LIGHT',title:'Refraction',subtitle:'Light is a design material.'},
] as const;
export function kineticCSS(p: KineticPreset, amount:number, radius:number):string {
  const selector='.rawnak-'+p.id;
  const shared='box-sizing:border-box;color:#fff;border-radius:'+radius+'px;transition:transform .22s cubic-bezier(.2,.8,.2,1);';
  if(p.category==='cards'){
    const base=selector+'{position:relative;isolation:isolate;width:min(100%,350px);min-height:245px;display:flex;flex-direction:column;justify-content:flex-end;padding:28px;'+shared+
      'background:linear-gradient(145deg,#252525,#080808);border:1px solid #555;transform:perspective(900px) rotateX(var(--rx,0deg)) rotateY(var(--ry,0deg));transform-style:preserve-3d;overflow:hidden;}';
    const highlight=selector+'::before{content:"";position:absolute;inset:0;pointer-events:none;background:radial-gradient(circle 130px at var(--x,50%) var(--y,50%),#ffffff50,transparent 100%);opacity:.65;z-index:-1;}';
    const heading=selector+' h3{position:relative;font:700 30px/1.1 system-ui;margin:0 0 10px;transform:translateZ(35px)}'+selector+' p{position:relative;color:#bdbdbd;font:13px/1.6 system-ui;margin:0;transform:translateZ(20px)}';
    const variants=p.id==='glass-card'?selector+'{background:linear-gradient(130deg,#ffffff24,#1118 54%,#5552);backdrop-filter:blur(13px);border-color:#ffffff66}':
      p.id==='depth-card'?selector+'::after{content:"◈";position:absolute;top:22px;right:22px;font-size:76px;color:#ffffff55;transform:translateZ(70px);text-shadow:0 0 26px #fff3}':
      p.id==='border-card'?selector+'{border-color:#ffffff8c;box-shadow:0 0 24px #ffffff1a,inset 0 0 35px #ffffff12}': '';
    return base+highlight+heading+variants+'@media(prefers-reduced-motion:reduce){'+selector+'{transition:none;transform:none!important}}';
  }
  if(p.category==='magnetic'){
    const isOrb=p.id==='magnetic-orb', isSquare=p.id==='magnetic-square';
    const size=isOrb?'width:135px;height:135px;border-radius:50%;':isSquare?'width:154px;height:154px;':'min-width:160px;padding:19px 29px;';
    return selector+'{display:inline-flex;align-items:center;justify-content:center;gap:9px;'+size+
      'font:650 14px system-ui;border:1px solid #858585;background:linear-gradient(140deg,#e8e8e8,#aaa);color:#111;'+shared.replace('color:#fff;','').replace('border-radius:'+radius+'px;','')+
      (isOrb||isSquare?'':'border-radius:'+ (p.id==='magnetic-pill'?60:radius)+'px;')+
      'transform:translate3d(var(--tx,0px),var(--ty,0px),0);cursor:pointer;box-shadow:0 13px 45px #fff2}'+
      '@media(prefers-reduced-motion:reduce){'+selector+'{transition:none;transform:none!important}}';
  }
  const card=selector+'{position:relative;width:min(100%,530px);min-height:300px;display:grid;place-items:center;overflow:hidden;border:1px solid #414141;border-radius:'+radius+'px;background:#080808;}';
  const pane=selector+' .rawnak-gallery-panel{position:absolute;width:66%;height:72%;border:1px solid #666;border-radius:15px;background:linear-gradient(150deg,#555,#171717 55%,#050505);display:flex;flex-direction:column;justify-content:flex-end;padding:24px;box-sizing:border-box;transition:transform .55s cubic-bezier(.2,.8,.2,1),opacity .5s;box-shadow:15px 20px 55px #000a;}';
  const labels=selector+' .rawnak-gallery-panel strong{font:700 clamp(20px,3vw,37px) system-ui;letter-spacing:-.05em}'+selector+' .rawnak-gallery-panel small{font:10px ui-monospace,monospace;color:#ccc;letter-spacing:.14em;margin-bottom:10px}';
  const positions = p.id==='gallery-stack' ?
    ['translate3d(0,0,50px) scale(1)','translate3d(13%,8%,0) scale(.89)','translate3d(22%,15%,-60px) scale(.79)','translate3d(-25%,19%,-120px) scale(.7)']:
    p.id==='gallery-focus' ?
    ['translate3d(0,0,60px) scale(1)','translate3d(76%,0,-30px) scale(.77)','translate3d(0,0,-100px) scale(.5)','translate3d(-76%,0,-30px) scale(.77)']:
    p.id==='gallery-arc'?
    ['translate3d(0,-7%,60px) rotate(0)','translate3d(55%,8%,-20px) rotate(19deg) scale(.75)','translate3d(0,20%,-100px) rotate(0deg) scale(.55)','translate3d(-55%,8%,-20px) rotate(-19deg) scale(.75)']:
    ['translate3d(0,0,50px) scale(1)','translate3d(85%,0,-20px) scale(.8)','translate3d(180%,0,-100px) scale(.65)','translate3d(-85%,0,-20px) scale(.8)'];
  const pos=positions.map((value,index)=>selector+' .rawnak-gallery-panel[data-pos="'+index+'"]{transform:'+value+';opacity:'+(index===2?'.3':index===0?'1':'.6')+';z-index:'+(4-index)+'}').join('');
  return card+pane+labels+pos+'@media(prefers-reduced-motion:reduce){'+selector+' .rawnak-gallery-panel{transition:none!important}}';
}
function escapeHTML(text:string) {return text.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&#39;');}
export function kineticExport(opts:{preset:KineticPreset;format:'html'|'react';label:string;amount:number;radius:number}):string{
  const {preset,format,label,amount,radius}=opts;
  const sel='rawnak-'+preset.id;
  const style=kineticCSS(preset,amount,radius);
  const text=label||'Build what is next';
  const safe=escapeHTML(text);
  const amountSafe=Math.max(0,Math.min(25,amount));
  const isCard=preset.category==='cards',isMagnetic=preset.category==='magnetic';
  const html = isCard?'<article class="'+sel+'" tabindex="0"><h3>'+safe+'</h3><p>Build with intention.</p></article>':
    isMagnetic?'<button type="button" class="'+sel+'">'+safe+'</button>':
    '<section class="'+sel+'" aria-label="Interactive gallery">'+galleryEntries.map((item,i)=>
      '<div class="rawnak-gallery-panel" data-index="'+i+'" data-pos="'+i+'"><small>'+item.eyebrow+'</small><strong>'+item.title+'</strong></div>').join('')+
    '<div class="rawnak-gallery-controls"><button type="button" data-dir="-1" aria-label="Previous slide">←</button><button type="button" data-dir="1" aria-label="Next slide">→</button></div></section>';
  const extra=preset.category==='galleries'?'.rawnak-gallery-controls{position:absolute;bottom:8px;right:12px;display:flex;gap:8px;z-index:10}.rawnak-gallery-controls button{cursor:pointer;background:#111;border:1px solid #777;color:#fff;border-radius:50%;width:38px;height:38px;font-size:20px}':'';
  const js=isCard?
    'const el=document.querySelector(".'+sel+'");if(!el)return;const move=(e)=>{if(matchMedia("(prefers-reduced-motion: reduce)").matches)return;const r=el.getBoundingClientRect();const x=Math.max(0,Math.min(1,(e.clientX-r.left)/r.width));const y=Math.max(0,Math.min(1,(e.clientY-r.top)/r.height));el.style.setProperty("--rx",((.5-y)*'+amountSafe*1.4+')+"deg");el.style.setProperty("--ry",((x-.5)*'+amountSafe*1.4+')+"deg");el.style.setProperty("--x",(x*100)+"%");el.style.setProperty("--y",(y*100)+"%")};el.addEventListener("pointermove",move);el.addEventListener("pointerleave",()=>{el.style.setProperty("--rx","0deg");el.style.setProperty("--ry","0deg");el.style.setProperty("--x","50%");el.style.setProperty("--y","50%")});':
    isMagnetic?
    'const el=document.querySelector(".'+sel+'");if(!el)return;el.addEventListener("pointermove",e=>{if(matchMedia("(prefers-reduced-motion: reduce)").matches)return;const r=el.getBoundingClientRect();const dx=(e.clientX-r.left-r.width/2)/Math.max(r.width,1);const dy=(e.clientY-r.top-r.height/2)/Math.max(r.height,1);el.style.setProperty("--tx",(dx*'+amountSafe*3+')+"px");el.style.setProperty("--ty",(dy*'+amountSafe*3+')+"px")});el.addEventListener("pointerleave",()=>{el.style.setProperty("--tx","0px");el.style.setProperty("--ty","0px")});':
    'const el=document.querySelector(".'+sel+'");if(!el)return;let index=0;const panels=[...el.querySelectorAll("[data-index]")];const render=()=>panels.forEach((p,i)=>p.dataset.pos=String((i-index+panels.length)%panels.length));el.querySelectorAll("[data-dir]").forEach(b=>b.addEventListener("click",()=>{index=(index+Number(b.dataset.dir)+panels.length)%panels.length;render()}));el.tabIndex=0;el.addEventListener("keydown",e=>{if(e.key==="ArrowRight"||e.key==="ArrowLeft"){e.preventDefault();index=(index+(e.key==="ArrowRight"?1:-1)+panels.length)%panels.length;render()}});';
  if(format==='html') return html+'\n<style>\n'+style+'\n'+extra+'\n</style>\n<script>\n(()=>{'+js+'})();\n</script>';
  const expression='{'+JSON.stringify(text).replace(/</g,'\\u003c')+'}';
  const motionHandler=isCard?
    '  function move(e){if(window.matchMedia("(prefers-reduced-motion: reduce)").matches)return;const el=e.currentTarget,r=el.getBoundingClientRect();const x=Math.max(0,Math.min(1,(e.clientX-r.left)/r.width)),y=Math.max(0,Math.min(1,(e.clientY-r.top)/r.height));el.style.setProperty("--rx",((.5-y)*'+amountSafe*1.4+')+"deg");el.style.setProperty("--ry",((x-.5)*'+amountSafe*1.4+')+"deg");el.style.setProperty("--x",x*100+"%");el.style.setProperty("--y",y*100+"%")}\n':
    '  function move(e){if(window.matchMedia("(prefers-reduced-motion: reduce)").matches)return;const el=e.currentTarget,r=el.getBoundingClientRect();el.style.setProperty("--tx",((e.clientX-r.left-r.width/2)/Math.max(1,r.width))*'+amountSafe*3+'+"px");el.style.setProperty("--ty",((e.clientY-r.top-r.height/2)/Math.max(1,r.height))*'+amountSafe*3+'+"px")}\n';
  const reset=isCard?
    '  function reset(e){const el=e.currentTarget;el.style.setProperty("--rx","0deg");el.style.setProperty("--ry","0deg");el.style.setProperty("--x","50%");el.style.setProperty("--y","50%")}\n':
    '  function reset(e){e.currentTarget.style.setProperty("--tx","0px");e.currentTarget.style.setProperty("--ty","0px")}\n';
  if(isCard||isMagnetic) return "'use client';\n\nexport default function RawnakKinetic(){\n"+
    motionHandler+reset+
    '  return <>\n    '+(isCard?'<article className="'+sel+'" tabIndex={0} onPointerMove={move} onPointerLeave={reset}><h3>'+expression+'</h3><p>Build with intention.</p></article>':
      '<button type="button" className="'+sel+'" onPointerMove={move} onPointerLeave={reset}>'+expression+'</button>')+
    '\n    <style>{'+JSON.stringify(style)+'}</style>\n  </>;\n}\n';
  return "'use client';\nimport { useState } from 'react';\n\nconst slides="+JSON.stringify(galleryEntries)+";\n"+
    'export default function RawnakGallery(){\n  const [index,setIndex]=useState(0);\n'+
    '  const shift=(n)=>setIndex(v=>(v+n+slides.length)%slides.length);\n'+
    '  return <>\n    <section className="'+sel+'" tabIndex={0} aria-label="Interactive gallery" onKeyDown={e=>{if(e.key==="ArrowRight"||e.key==="ArrowLeft"){e.preventDefault();shift(e.key==="ArrowRight"?1:-1)}}}>\n'+
    '      {slides.map((slide,i)=><div key={i} className="rawnak-gallery-panel" data-pos={(i-index+slides.length)%slides.length}><small>{slide.eyebrow}</small><strong>{slide.title}</strong></div>)}\n'+
    '      <div className="rawnak-gallery-controls"><button type="button" onClick={()=>shift(-1)} aria-label="Previous slide">←</button><button type="button" onClick={()=>shift(1)} aria-label="Next slide">→</button></div>\n'+
    '    </section>\n    <style>{'+JSON.stringify(style+extra)+'}</style>\n  </>;\n}\n';
}

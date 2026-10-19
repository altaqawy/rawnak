/**
 * Rawnak Motion Timeline V11 — standalone first-party composition engine.
 * Pure functions shared between the in-app preview and downloadable HTML export.
 * One clip = one independently animated layer; clips may overlap in time.
 */
export type TimelineEffect='fade'|'rise'|'slide-left'|'slide-right'|'zoom'|'spin'|'blur'|'flip'|'pop'|'wipe'|'swing'|'fade-out';
export type TimelineClip={id:string;name:string;effect:TimelineEffect;start:number;duration:number;layer:number;};
export type TimelineProject={schema:'rawnak.timeline.v1';title:string;length:number;loop:boolean;clips:TimelineClip[]};
export const timelineEffects:ReadonlyArray<{id:TimelineEffect;en:string;ar:string}>=[
  {id:'fade',en:'Soft Fade',ar:'ظهور تدريجي'},
  {id:'rise',en:'Rise',ar:'صعود'},
  {id:'slide-left',en:'Slide Left',ar:'دخول من اليمين'},
  {id:'slide-right',en:'Slide Right',ar:'دخول من اليسار'},
  {id:'zoom',en:'Zoom In',ar:'تكبير'},
  {id:'spin',en:'Spin Reveal',ar:'دوران'},
  {id:'blur',en:'Focus Blur',ar:'وضوح تدريجي'},
  {id:'flip',en:'3D Flip',ar:'قلب ثلاثي الأبعاد'},
  {id:'pop',en:'Elastic Pop',ar:'قفزة مرنة'},
  {id:'wipe',en:'Curtain Wipe',ar:'فتح الستارة'},
  {id:'swing',en:'Pendulum',ar:'تأرجح'},
  {id:'fade-out',en:'Fade Out',ar:'اختفاء'},
];
export const timelineStarter:TimelineProject={
  schema:'rawnak.timeline.v1',title:'The Rawnak Sequence',length:7,loop:true,
  clips:[
    {id:'intro',name:'RAWNAK',effect:'rise',start:0,duration:1.5,layer:0},
    {id:'halo',name:'✳',effect:'pop',start:.65,duration:1.25,layer:1},
    {id:'tagline',name:'DESIGN IN MOTION',effect:'wipe',start:1.7,duration:1.6,layer:2},
    {id:'ending',name:'BEYOND ORDINARY',effect:'flip',start:3.8,duration:1.35,layer:3},
  ],
};
export function clampTimeline(n:number,min:number,max:number):number{return Math.max(min,Math.min(max,n))}
function safeNumber(v:unknown,otherwise:number){return typeof v==='number'&&Number.isFinite(v)?v:otherwise}
function sanitizeText(v:unknown,otherwise:string,max=80):string{return typeof v==='string'?v.slice(0,max):otherwise}
export function validateTimeline(value:unknown):TimelineProject{
  if(!value||typeof value!=='object'||Array.isArray(value))throw Error('Invalid timeline data');
  const v=value as Record<string,unknown>;
  if(v.schema!=='rawnak.timeline.v1'||!Array.isArray(v.clips)||v.clips.length>36)throw Error('Unsupported timeline schema');
  const length=clampTimeline(safeNumber(v.length,7),2,30);
  const allowed=new Set<string>(timelineEffects.map(x=>x.id));
  const ids=new Set<string>();
  const clips:TimelineClip[]=v.clips.map((raw,i)=>{
    if(!raw||typeof raw!=='object'||Array.isArray(raw))throw Error('Invalid timeline clip');
    const c=raw as Record<string,unknown>;
    if(typeof c.effect!=='string'||!allowed.has(c.effect))throw Error('Unsupported effect');
    const id=sanitizeText(c.id,'clip-'+i,48).replace(/[^a-z0-9_-]/gi,'');
    if(!id||ids.has(id))throw Error('Duplicate or invalid clip id');
    ids.add(id);
    const start=clampTimeline(safeNumber(c.start,0),0,length-.1);
    const duration=clampTimeline(safeNumber(c.duration,1),.1,Math.max(.1,length-start));
    return {id,name:sanitizeText(c.name,'Layer '+(i+1),90),effect:c.effect as TimelineEffect,start,duration,layer:i};
  });
  return {schema:'rawnak.timeline.v1',title:sanitizeText(v.title,'Untitled composition',90),
    length,loop:v.loop===true,clips};
}
function easeOut(p:number):number{return 1-Math.pow(1-p,3)}
/**
 * Returns inline style values. No browser dependencies; embedded verbatim in standalone export.
 * One independent clip owns one DOM layer; overlaps combine visually, not as conflicting transforms.
 */
export function motionFrame(effect:TimelineEffect,progress:number):{opacity:number;transform:string;filter:string;clipPath:string}{
  const p=Math.max(0,Math.min(1,progress));
  const e=easeOut(p);
  const state={opacity:1,transform:'translate3d(0,0,0)',filter:'none',clipPath:'inset(0 0 0 0)'};
  if(effect==='fade'){state.opacity=e}
  else if(effect==='rise'){state.opacity=p;state.transform='translate3d(0,'+(70*(1-e)).toFixed(2)+'px,0)'}
  else if(effect==='slide-left'){state.opacity=p;state.transform='translate3d('+(100*(1-e)).toFixed(2)+'px,0,0)'}
  else if(effect==='slide-right'){state.opacity=p;state.transform='translate3d('+(-100*(1-e)).toFixed(2)+'px,0,0)'}
  else if(effect==='zoom'){state.opacity=p;state.transform='scale('+(0.55+.45*e).toFixed(4)+')'}
  else if(effect==='spin'){state.opacity=p;state.transform='rotate('+(-130*(1-e)).toFixed(2)+'deg) scale('+(0.7+.3*e).toFixed(4)+')'}
  else if(effect==='blur'){state.opacity=p;state.filter='blur('+(20*(1-e)).toFixed(2)+'px)'}
  else if(effect==='flip'){state.opacity=p;state.transform='perspective(800px) rotateY('+(-95*(1-e)).toFixed(2)+'deg)'}
  else if(effect==='pop'){state.opacity=p;const s=1-(Math.cos(p*3*Math.PI)*Math.exp(-p*6))*.45;state.transform='scale('+s.toFixed(4)+')'}
  else if(effect==='wipe'){state.opacity=1;state.clipPath='inset(0 '+(100*(1-e)).toFixed(2)+'% 0 0)'}
  else if(effect==='swing'){state.opacity=p;state.transform='rotate('+(Math.sin(p*5*Math.PI)*Math.pow(1-p,2)*26).toFixed(2)+'deg)'}
  else if(effect==='fade-out'){state.opacity=1-e;state.transform='scale('+(1-.12*e).toFixed(4)+')'}
  return state;
}
export function clipFrame(clip:TimelineClip,seconds:number,reduced=false){
  if(seconds<clip.start)return {...motionFrame(clip.effect,0),opacity:0};
  if(reduced)return motionFrame(clip.effect,1);
  return motionFrame(clip.effect,(seconds-clip.start)/Math.max(.1,clip.duration));
}
function escapeJson(value:unknown):string{return JSON.stringify(value).replace(/</g,'\\u003c').replace(/>/g,'\\u003e').replace(/&/g,'\\u0026')}
/** A complete file with working Play/Pause/Seek and the same motionFrame evaluator as React preview. */
export function exportTimelineHTML(project:TimelineProject):string{
  const safe=validateTimeline(project);
  const motionSource=motionFrame.toString().replace('easeOut(p)','(1-Math.pow(1-p,3))');
  const scene=escapeJson(safe);
  return '<!doctype html>\\n<html lang="en"><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width, initial-scale=1"/>'+
    '<title>Rawnak Motion Timeline</title><style>'+
    '*{box-sizing:border-box}body{background:#050505;color:white;margin:0;font:14px system-ui,sans-serif;min-height:100vh;display:grid;place-items:center;padding:24px}'+
    '.shell{width:min(880px,100%)}h1{font-size:clamp(28px,5vw,54px);letter-spacing:-.06em}'+
    '.stage{position:relative;overflow:hidden;border-radius:22px;border:1px solid #555;background:radial-gradient(circle at 50% 48%,#272727,#050505 65%);height:min(56vw,470px);min-height:270px;perspective:950px}'+
    '.layer{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;text-align:center;padding:32px;pointer-events:none}'+
    '.layer>span{display:block;color:white;font-weight:800;letter-spacing:-.065em;font-size:clamp(22px,5vw,63px);overflow-wrap:anywhere;text-shadow:0 0 32px #ffffff45}'+
    '.layer:nth-child(even)>span{color:#d0d0d0;font-size:clamp(18px,3.5vw,45px)}'+
    '.controls{margin-top:20px;display:flex;gap:12px;align-items:center}button{cursor:pointer;border:1px solid #666;border-radius:9px;padding:11px 18px;background:#eee;color:#111}input{flex:1;accent-color:white}'+
    'small{display:block;margin-top:15px;color:#aaa}@media(prefers-reduced-motion:reduce){.layer{transition:none!important}}'+
    '</style></head><body><div class="shell"><h1 id="title"></h1><div class="stage" id="stage"></div><div class="controls">'+
    '<button id="toggle">Play</button><input id="seek" type="range" min="0" step=".01" value="0"/><output id="clock">0.0s</output></div>'+
    '<small>Original Rawnak Motion Timeline composition. Use the Play button or seek manually.</small></div>'+
    '<script>const project='+scene+';const motionFrame='+motionSource+';'+
    'const stage=document.getElementById("stage"),seek=document.getElementById("seek"),toggle=document.getElementById("toggle"),clock=document.getElementById("clock");'+
    'document.getElementById("title").textContent=project.title;seek.max=project.length;'+
    'const reduced=matchMedia("(prefers-reduced-motion: reduce)");'+
    'const layers=project.clips.map(c=>{const outer=document.createElement("div"),inner=document.createElement("span");outer.className="layer";inner.textContent=c.name;outer.append(inner);stage.append(outer);return {outer,inner,c}});'+
    'let time=0,play=false,last=0,raf=0;function render(){layers.forEach(({outer,inner,c})=>{const f=time<c.start?{opacity:0,transform:"none",filter:"none",clipPath:"inset(0 0 0 0)"}:motionFrame(c.effect,reduced.matches?1:(time-c.start)/Math.max(.1,c.duration));'+
    'inner.style.opacity=String(f.opacity);inner.style.transform=f.transform;inner.style.filter=f.filter;inner.style.clipPath=f.clipPath});seek.value=String(time);clock.textContent=time.toFixed(2)+"s";toggle.textContent=play?"Pause":"Play"}'+
    'function step(now){if(!play)return;if(!last)last=now;time+=(now-last)/1000;last=now;if(time>=project.length){if(project.loop){time=time%project.length}else{time=project.length;play=false}}render();if(play)raf=requestAnimationFrame(step)}'+
    'toggle.onclick=()=>{play=!play;last=0;cancelAnimationFrame(raf);if(play){if(time>=project.length)time=0;raf=requestAnimationFrame(step)}render()};'+
    'seek.oninput=()=>{time=+seek.value;last=0;render()};render();'+
    '</script></body></html>';
}

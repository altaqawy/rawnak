/**
 * RAWNAK ORIGINAL MOTIONS
 * Independent CSS animations authored for Rawnak Tools.
 * No code imported from React Bits, Animate.css, Animista, or paid collections.
 */
export type MotionCategory = 'entrance' | 'text' | 'hover' | 'loop' | 'background';

export type MotionPreset = {
  slug: string;
  en: string;
  ar: string;
  category: MotionCategory;
  frames: string;
  setup?: string;
  interaction?: 'hover';
  content?: 'text' | 'button' | 'background';
  easing?: string;
  seconds?: number;
};

export const motionCategories: { id: MotionCategory; en: string; ar: string }[] = [
  { id: 'entrance', en: 'Entrance', ar: 'الدخول' },
  { id: 'text', en: 'Typography', ar: 'النصوص' },
  { id: 'hover', en: 'Hover', ar: 'عند المرور' },
  { id: 'loop', en: 'Continuous', ar: 'المستمرة' },
  { id: 'background', en: 'Backgrounds', ar: 'الخلفيات' },
];

export const motionPresets: MotionPreset[] = [
  // Entrance — transform + opacity for economical compositing
  { slug:'rise', en:'Soft Rise', ar:'صعود هادئ', category:'entrance', frames:'from{opacity:0;transform:translateY(35px)}to{opacity:1;transform:translateY(0)}' },
  { slug:'descent', en:'Soft Descent', ar:'نزول هادئ', category:'entrance', frames:'from{opacity:0;transform:translateY(-35px)}to{opacity:1;transform:translateY(0)}' },
  { slug:'slide-east', en:'Slide East', ar:'انزلاق لليمين', category:'entrance', frames:'from{opacity:0;transform:translateX(-60px)}to{opacity:1;transform:translateX(0)}' },
  { slug:'slide-west', en:'Slide West', ar:'انزلاق لليسار', category:'entrance', frames:'from{opacity:0;transform:translateX(60px)}to{opacity:1;transform:translateX(0)}' },
  { slug:'scale-bloom', en:'Scale Bloom', ar:'تكبير متدرج', category:'entrance', frames:'from{opacity:0;transform:scale(.65)}to{opacity:1;transform:scale(1)}' },
  { slug:'angular-enter', en:'Angular Enter', ar:'دخول بالدوران', category:'entrance', frames:'from{opacity:0;transform:rotate(-16deg) scale(.7)}to{opacity:1;transform:rotate(0) scale(1)}' },
  { slug:'soft-focus', en:'Soft Focus', ar:'تركيز تدريجي', category:'entrance', frames:'from{opacity:0;filter:blur(15px);transform:scale(1.08)}to{opacity:1;filter:blur(0);transform:scale(1)}' },
  { slug:'hinge-in', en:'Hinge In', ar:'دخول بالمفصلة', category:'entrance', frames:'from{opacity:0;transform:perspective(700px) rotateX(-75deg)}to{opacity:1;transform:perspective(700px) rotateX(0)}' },
  { slug:'spring-rise', en:'Spring Rise', ar:'ارتداد للأعلى', category:'entrance', frames:'0%{opacity:0;transform:translateY(70px) scale(.8)}65%{opacity:1;transform:translateY(-13px) scale(1.03)}85%{transform:translateY(6px)}100%{transform:translateY(0) scale(1)}' },
  { slug:'pop-drop', en:'Pop Drop', ar:'سقوط ناعم', category:'entrance', frames:'0%{opacity:0;transform:translateY(-90px) scale(1.15)}55%{opacity:1;transform:translateY(12px) scale(.96)}80%{transform:translateY(-6px)}100%{transform:translateY(0) scale(1)}' },
  // Typography
  { slug:'letter-spread', en:'Letter Spread', ar:'اتساع الحروف', category:'text', setup:'letter-spacing:0', frames:'from{opacity:0;letter-spacing:-.2em;filter:blur(4px)}to{opacity:1;letter-spacing:0;filter:blur(0)}' },
  { slug:'text-shutter', en:'Text Shutter', ar:'ستارة النص', category:'text', frames:'from{clip-path:inset(0 100% 0 0);opacity:.2}to{clip-path:inset(0 0 0 0);opacity:1}' },
  { slug:'word-ripple', en:'Word Ripple', ar:'تموج الكلمات', category:'text', frames:'0%{opacity:0;transform:skewX(-22deg) translateY(12px)}60%{opacity:1;transform:skewX(6deg) translateY(-2px)}100%{transform:skewX(0) translateY(0)}' },
  { slug:'neon-wake', en:'Neon Wake', ar:'إضاءة النص', category:'text', frames:'0%{opacity:.18;text-shadow:none}50%{opacity:1;text-shadow:0 0 22px currentColor}100%{opacity:1;text-shadow:0 0 0 transparent}' },
  { slug:'tracking-sweep', en:'Tracking Sweep', ar:'تمدد الأحرف', category:'text', frames:'from{opacity:0;letter-spacing:.3em;transform:scaleX(.8)}to{opacity:1;letter-spacing:0;transform:scaleX(1)}' },
  { slug:'text-tilt', en:'Text Tilt', ar:'ميل النص', category:'text', frames:'0%{opacity:0;transform:rotate(8deg) translateY(24px);filter:blur(4px)}70%{opacity:1;transform:rotate(-3deg)}100%{opacity:1;transform:rotate(0);filter:blur(0)}' },
  // Hover: user-initiated only
  { slug:'hover-lift', en:'Hover Lift', ar:'ارتفاع المؤشر', category:'hover', interaction:'hover', content:'button', frames:'from{transform:translateY(0)}to{transform:translateY(-12px)}' },
  { slug:'hover-tilt', en:'Hover Tilt', ar:'ميل ثلاثي', category:'hover', interaction:'hover', content:'button', frames:'from{transform:perspective(500px) rotateY(0)}to{transform:perspective(500px) rotateY(-16deg) rotateX(7deg)}' },
  { slug:'hover-grow', en:'Hover Grow', ar:'تكبير المؤشر', category:'hover', interaction:'hover', content:'button', frames:'from{transform:scale(1)}to{transform:scale(1.14)}' },
  { slug:'hover-push', en:'Hover Push', ar:'اندفاع للأمام', category:'hover', interaction:'hover', content:'button', frames:'from{transform:translateX(0)}to{transform:translateX(15px)}' },
  { slug:'hover-swing', en:'Hover Swing', ar:'اهتزاز جانبي', category:'hover', interaction:'hover', content:'button', frames:'0%,100%{transform:rotate(0)}25%{transform:rotate(5deg)}75%{transform:rotate(-5deg)}', seconds:.7 },
  { slug:'hover-glow', en:'Hover Glow', ar:'وهج المؤشر', category:'hover', interaction:'hover', content:'button', frames:'from{box-shadow:0 0 0 0 #ffffff00}to{box-shadow:0 0 36px 12px #ffffff50}' },
  { slug:'hover-squash', en:'Hover Squash', ar:'ضغط مطاطي', category:'hover', interaction:'hover', content:'button', frames:'0%{transform:scale(1)}40%{transform:scale(1.18,.85)}75%{transform:scale(.96,1.1)}100%{transform:scale(1.08,1.02)}', seconds:.7 },
  // Continuous: intended as a looping demonstration and opt-in export
  { slug:'levitation', en:'Levitation', ar:'طفو مستمر', category:'loop', frames:'0%,100%{transform:translateY(0)}50%{transform:translateY(-20px)}', seconds:2.8 },
  { slug:'breathing', en:'Breathing', ar:'تنفّس', category:'loop', frames:'0%,100%{transform:scale(1)}50%{transform:scale(1.10)}', seconds:2.5 },
  { slug:'pulse-light', en:'Pulse Light', ar:'نبض ضوئي', category:'loop', frames:'0%,100%{opacity:.65;text-shadow:0 0 0 transparent}50%{opacity:1;text-shadow:0 0 30px #fff9}', seconds:2.2 },
  { slug:'slow-turn', en:'Slow Turn', ar:'دوران بطيء', category:'loop', frames:'from{transform:rotate(0)}to{transform:rotate(360deg)}', easing:'linear', seconds:5 },
  { slug:'orbital-path', en:'Orbital Path', ar:'مسار مداري', category:'loop', frames:'0%{transform:translate(0,-20px)}25%{transform:translate(22px,0)}50%{transform:translate(0,20px)}75%{transform:translate(-22px,0)}100%{transform:translate(0,-20px)}', seconds:3.5 },
  { slug:'soft-shake', en:'Soft Shake', ar:'اهتزاز لطيف', category:'loop', frames:'0%,100%{transform:rotate(0)}20%{transform:rotate(2deg)}40%{transform:rotate(-2deg)}60%{transform:rotate(1deg)}80%{transform:rotate(-1deg)}', seconds:2.8 },
  { slug:'heartbeat', en:'Heartbeat', ar:'نبض القلب', category:'loop', frames:'0%,30%,100%{transform:scale(1)}12%{transform:scale(1.15)}22%{transform:scale(1.06)}', seconds:2.2 },
  // Background motifs
  { slug:'grid-travel', en:'Grid Travel', ar:'تحرك الشبكة', category:'background', content:'background', frames:'from{background-position:0 0}to{background-position:0 90px}', seconds:4, easing:'linear' },
  { slug:'sheen-drift', en:'Sheen Drift', ar:'انزلاق الضوء', category:'background', content:'background', frames:'from{background-position:200% 50%}to{background-position:-100% 50%}', seconds:3, easing:'linear' },
  { slug:'ambient-shift', en:'Ambient Shift', ar:'تغير الأجواء', category:'background', content:'background', frames:'0%,100%{background-position:0% 50%}50%{background-position:100% 50%}', seconds:5 },
  { slug:'horizon-drift', en:'Horizon Drift', ar:'حركة الأفق', category:'background', content:'background', frames:'0%,100%{background-position:0 0}50%{background-position:55px -30px}', seconds:4.5 },
];

export const motionCount = motionPresets.length;

function htmlEscape(value: string): string {
  return value.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');
}

/** Generates independent original HTML/CSS or dependency-free React JSX. */
export function generateMotionExport(options: {
  preset: MotionPreset;
  label: string;
  accent: string;
  duration: number;
  repeat: boolean;
  format: 'html' | 'react';
  easing: string;
}): string {
  const {preset,label,accent,duration,repeat,format,easing}=options;
  const name='rtx-'+preset.slug;
  const hasHover=preset.interaction==='hover';
  const isBackground=preset.content==='background';
  const base=isBackground
    ? 'min-height:200px;width:100%;border:1px solid #444;border-radius:18px;'+
      'background-color:#070707;background-size:90px 90px;'+
      (preset.slug==='grid-travel'?'background-image:linear-gradient(#5557 1px,transparent 1px),linear-gradient(90deg,#5557 1px,transparent 1px);':
       preset.slug==='sheen-drift'?'background-image:linear-gradient(115deg,#000 0%,#111 35%,'+accent+'65 50%,#111 65%,#000 100%);background-size:300% 100%;':
       preset.slug==='ambient-shift'?'background-image:linear-gradient(120deg,#090909,'+accent+'65,#080808);background-size:250% 250%;':
       'background-image:radial-gradient('+accent+'70 1px,transparent 1px);background-size:27px 27px;')
    : 'display:inline-flex;align-items:center;justify-content:center;text-align:center;'+
      'max-width:100%;padding:'+(hasHover?'18px 30px':'12px')+';'+
      'font:700 clamp(25px,4vw,48px)/1.2 system-ui;letter-spacing:-.045em;'+
      'color:'+accent+';'+(hasHover?'border:1px solid #666;border-radius:14px;background:#151515;cursor:pointer;':'');
  const playback=duration+'s '+easing+' '+(hasHover?'1':repeat?'infinite':'1')+' both';
  const css='.'+name+'{'+base+(preset.setup??'')+(!hasHover?'animation:'+name+'-anim '+playback+';':'')+'}\n'+
    (hasHover?'.'+name+':hover,.'+name+':focus-visible{animation:'+name+'-anim '+playback+';}\n':'')+
    '@keyframes '+name+'-anim{'+preset.frames+'}\n'+
    '@media(prefers-reduced-motion:reduce){.'+name+',.'+name+':hover,.'+name+':focus-visible{animation:none!important;transform:none!important;filter:none!important;}}';
  const content=htmlEscape(label || 'Rawnak Motion');
  const html=isBackground?'<div class="'+name+'" aria-label="Animated background"></div>':
    (hasHover?'<button type="button" class="'+name+'">'+content+'</button>':
      '<div class="'+name+'">'+content+'</div>');
  if(format==='html')return html+'\n<style>\n'+css+'\n</style>';
  const expr='{'+JSON.stringify(label||'Rawnak Motion').replace(/</g,'\\u003c')+'}';
  const jsx=isBackground?'<div className="'+name+'" aria-label="Animated background" />':
    hasHover?'<button type="button" className="'+name+'">'+expr+'</button>':
      '<div className="'+name+'">'+expr+'</div>';
  return 'export default function RawnakMotion() {\n  return (\n    <>\n      '+jsx+'\n      <style>{'+JSON.stringify(css)+'}</style>\n    </>\n  );\n}';
}

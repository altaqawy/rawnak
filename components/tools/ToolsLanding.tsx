'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import {
  ArrowUpRight, ArrowRight, Box, Check, ChevronDown, Code2,
  Component, Copy, Eye, Grid2X2, Layers3, MousePointer2, Palette, Play,
  Shapes, Sparkles, WandSparkles, Zap,
} from 'lucide-react';
import type { Locale } from '@/i18n/config';
import { toolCatalog, type ToolSlug } from '@/lib/tools/catalog';
import { motionCount } from '@/lib/tools/original-motions';
import { interactionCount } from '@/lib/tools/interaction-presets';
import { toolsPath } from '@/lib/tools/domain';

type Category = 'all' | 'developers' | 'designers' | 'business' | 'professionals';
const categoryMap: Record<ToolSlug, Category> = {
  'button-studio': 'developers',
  'motion-studio': 'developers',
  'theme-builder': 'designers',
  'svg-studio': 'designers',
  'hero-builder': 'developers',
};
const categoryNames: Record<Category, { en: string; ar: string }> = {
  all: { en: 'All tools', ar: 'كل الأدوات' },
  developers: { en: 'Developers', ar: 'للمبرمجين' },
  designers: { en: 'Designers', ar: 'للمصممين' },
  business: { en: 'Business', ar: 'للأعمال' },
  professionals: { en: 'Professionals', ar: 'للمحترفين' },
};
const categories: Category[] = ['all', 'developers', 'designers', 'business', 'professionals'];

function ToolVisual({ slug }: { slug: ToolSlug }) {
  if (slug === 'button-studio') return (
    <div className="rt-art rt-button-art"><span className="rt-glow-button">Explore <ArrowUpRight size={14}/></span><div className="rt-art-halo"/></div>
  );
  if (slug === 'motion-studio') return (
    <div className="rt-art rt-motion-art"><i/><i/><i/><i/><span className="rt-motion-dot"/></div>
  );
  if (slug === 'theme-builder') return (
    <div className="rt-art rt-theme-art"><strong>Aa</strong><div className="rt-palette"><i/><i/><i/><i/></div><div className="rt-theme-bars"><span/><span/><span/></div></div>
  );
  if (slug === 'svg-studio') return (
    <div className="rt-art rt-wave-art">{Array.from({length: 12},(_,i)=><i key={i} style={{transform:'rotate(' + ((i-6)*3) + 'deg) translateY(' + (i*2) + 'px)'}} />)}</div>
  );
  return <div className="rt-art rt-hero-art"><div className="rt-browser"><div className="rt-browser-dots">● ● ●</div><div className="rt-browser-hero"><span/><strong/><p/><p/><em/></div></div></div>;
}

function HeroArtwork() {
  return (
    <div className="rt-orbit-scene" aria-hidden="true">
      <div className="rt-orbit rt-orbit-one"/><div className="rt-orbit rt-orbit-two"/><div className="rt-orbit rt-orbit-three"/>
      <span className="rt-orbit-star rt-star-a"/><span className="rt-orbit-star rt-star-b"/><span className="rt-orbit-star rt-star-c"/><span className="rt-orbit-star rt-star-d"/>
      <div className="rt-central-glow"/>
      <div className="rt-float-tile rt-tile-back"/>
      <div className="rt-float-tile rt-tile-core"><span className="rt-logo-glyph">R</span><small>RAWNAK / ENGINE</small></div>
      <div className="rt-float-tile rt-tile-top"><Code2 size={19} strokeWidth={1.5}/><span><strong>Code</strong><small>Generate</small></span></div>
      <div className="rt-float-tile rt-tile-left"><Palette size={19} strokeWidth={1.5}/><span><strong>Design</strong><small>Customize</small></span></div>
      <div className="rt-float-tile rt-tile-right"><Zap size={19} strokeWidth={1.5}/><span><strong>Build</strong><small>Accelerate</small></span></div>
      <span className="rt-orbit-footnote">IDEAS · TOOLS · REAL SOLUTIONS</span>
    </div>
  );
}

function ComponentsPreview({ type }: { type: number }) {
  if (type === 0) return <div className="rt-component-visual rt-component-text"><strong>Hello<span>.</span></strong></div>;
  if (type === 1) return <div className="rt-component-visual"><div className="rt-mini-nav"><span>Home</span><span>About</span><span>Work</span><span>Contact</span></div></div>;
  if (type === 2) return <div className="rt-component-visual"><div className="rt-mini-card"><Layers3 size={33} strokeWidth={1}/></div></div>;
  if (type === 3) return <div className="rt-component-visual rt-component-planet"><div /></div>;
  return <div className="rt-component-visual"><div className="rt-component-input">your@email.com <ArrowRight size={15}/></div><div className="rt-component-toggle"><span/></div></div>;
}

const components = [
  {en:'Text Animations',ar:'حركات النصوص'},
  {en:'Navigation Bars',ar:'أشرطة التنقل'},
  {en:'Cards & UI',ar:'البطاقات والواجهات'},
  {en:'Backgrounds',ar:'الخلفيات'},
  {en:'Form Elements',ar:'عناصر النماذج'},
] as const;

export default function ToolsLanding({locale, toolsHost}: {locale:Locale;toolsHost:boolean}) {
  const ar=locale==='ar';
  const [category,setCategory]=useState<Category>('all');
  const [filterText,setFilterText]=useState('');
  const [previewText,setPreviewText]=useState(ar?'استكشف رونق':'Explore Rawnak');
  const [demoCopied,setDemoCopied]=useState(false);
  const visible=useMemo(()=>toolCatalog.filter(tool=>
    (category==='all'||categoryMap[tool.slug]===category) &&
    (tool.label[locale].toLowerCase().includes(filterText.trim().toLowerCase())||
     tool.subtitle[locale].toLowerCase().includes(filterText.trim().toLowerCase()))
  ),[category,filterText,locale]);
  const studioLink=(slug:ToolSlug)=>toolsPath(locale,slug,toolsHost);
  const componentsLink='/' + locale + (toolsHost ? '/components' : '/tools/components');

  const buttonCode='<button class="rawnak-button">'+previewText.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')+'</button>';

  async function copyDemo() {
    try{
      await navigator.clipboard.writeText(buttonCode);
      setDemoCopied(true);
    }catch{
      setDemoCopied(false);
    }
  }

  return <div className="rawnak-tools-page">
    <section className="rt-hero rt-container" aria-labelledby="rt-title">
      <div className="rt-hero-copy">
        <div className="rt-kicker"><span className="rt-kicker-line"/> BUILD · DESIGN · CREATE · FASTER</div>
        <h1 id="rt-title">Rawnak <span>Tools.</span></h1>
        <p className="rt-hero-description">{ar?'مساحة احترافية للمطورين والمصممين والمبدعين. مكونات جميلة، وأدوات قوية، وكود جاهز للاستخدام.':'A professional toolkit for developers, designers and creators. Beautiful components, powerful tools, ready to use.'}</p>
        <div className="rt-hero-buttons">
          <a className="rt-button rt-button-white" href="#explore">{ar?'استكشف الأدوات':'Explore Tools'}<ArrowUpRight size={17}/></a>
          <a className="rt-button rt-button-outline" href="#components">{ar?'شاهد المكونات':'View Components'}<ArrowRight size={16}/></a>
        </div>
        <div className="rt-metrics" aria-label={ar?'إحصائيات المنصة':'Platform facts'}>
          <div><strong>05</strong><span>{ar?'استوديوهات تعمل':'Working studios'}</span></div>
          <div><strong>∞</strong><span>{ar?'مجانية للاستخدام':'Free to use'}</span></div>
          <div><strong>02</strong><span>EN / AR</span></div>
          <div><strong>01</strong><span>{ar?'رؤية: أنجز بذكاء':'Vision: Work smarter'}</span></div>
        </div>
      </div>
      <HeroArtwork/>
    </section>

    <section className="rt-section rt-explore" id="explore" aria-labelledby="rt-tools-title">
      <div className="rt-container">
        <div className="rt-category-wrap" role="group" aria-label={ar?'تصفية الأدوات حسب المجال':'Filter tools by discipline'}>
          {categories.map((cat,i)=>{
            const icons=[Grid2X2,Code2,Palette,Box,Component];
            const Icon=icons[i];
            return <button key={cat} type="button" onClick={()=>setCategory(cat)} className={'rt-category ' + (category===cat?'rt-category-active':'')} aria-pressed={category===cat}><Icon size={15}/>{categoryNames[cat][locale]}</button>;
          })}
        </div>
        <div className="rt-section-heading">
          <div>
            <div className="rt-eyebrow">TOOLS / 001</div>
            <h2 id="rt-tools-title">{ar?'استكشف أدوات رونق':'Explore Our Tools'}</h2>
            <p>{ar?'أدوات عملية مصممة بعناية تساعدك تبني وتصمم وتنجز بشكل أسرع.':'A collection of beautifully crafted tools to help you build, design, and create faster.'}</p>
          </div>
          <label className="rt-search"><span className="sr-only">{ar?'البحث عن أداة':'Search tools'}</span><input value={filterText} onChange={e=>setFilterText(e.target.value)} placeholder={ar?'ابحث عن أداة...':'Search tools...'} aria-label={ar?'ابحث عن أداة':'Search tools'}/><ChevronDown size={15}/></label>
        </div>
        {visible.length>0 ?
          <div className="rt-tool-grid">{visible.map(tool=><Link href={studioLink(tool.slug)} key={tool.slug} className="rt-tool-card">
            <div className="rt-tool-card-top"><span className="rt-tool-symbol">{tool.slug==='motion-studio'?<Play size={15}/>:tool.slug==='theme-builder'?<Palette size={15}/>:tool.slug==='svg-studio'?<Shapes size={15}/>:tool.slug==='hero-builder'?<Layers3 size={15}/>:<MousePointer2 size={15}/>}</span><ArrowUpRight size={17}/></div>
            <div className="rt-tool-card-copy"><h3>{tool.label[locale]}</h3><p>{tool.subtitle[locale]}</p></div>
            <ToolVisual slug={tool.slug}/>
          </Link>)}</div>:
          <div className="rt-empty-state"><Sparkles size={27}/><h3>{ar?'هنضيف أدوات جديدة قريبًا':'More tools are coming'}</h3><p>{ar?'لم نجد أداة مناسبة في التصنيف ده حاليًا. جرب مجال تاني.':'Nothing available in this category yet. Explore a different category.'}</p><button className="rt-button rt-button-outline" onClick={()=>{setCategory('all');setFilterText('')}}>{ar?'كل الأدوات':'Show all tools'}</button></div>
        }
      </div>
    </section>

    <section className="rt-section rt-motion-teaser" aria-labelledby="rt-motions-title">
      <div className="rt-container rt-motion-teaser-inner">
        <div className="rt-motion-teaser-text">
          <div className="rt-eyebrow">ORIGINAL MOTIONS · {motionCount}</div>
          <h2 id="rt-motions-title">{ar?'الحركة تصنع':'Make it'} <span>{ar?'الفرق.':'move.'}</span></h2>
          <p>{ar?`${motionCount} أنيميشن أصلية مجانية، بخمس فئات، ومعاينة وتعديل وتصدير React أو CSS مباشرة.`:`${motionCount} original free animations in five categories — preview, customize, then export as React or CSS.`}</p>
          <Link className="rt-button rt-button-white" href={'/'+locale+(toolsHost?'/animations':'/tools/animations')}>
            {ar?'افتح مكتبة الأنيميشن':'Explore Motion Library'} <ArrowUpRight size={17}/>
          </Link>
        </div>
        <div className="rt-motion-teaser-art" aria-hidden="true">
          <div className="rt-motion-teaser-ring rt-motion-ring-1"/>
          <div className="rt-motion-teaser-ring rt-motion-ring-2"/>
          <div className="rt-motion-teaser-ring rt-motion-ring-3"/>
          <div className="rt-motion-teaser-core">M</div>
          <span className="rt-motion-teaser-star rt-motion-star-a"/>
          <span className="rt-motion-teaser-star rt-motion-star-b"/>
          <span className="rt-motion-teaser-star rt-motion-star-c"/>
        </div>
      </div>
    </section>


    <section className="rt-section rt-interaction-teaser" aria-labelledby="rt-interaction-title">
      <div className="rt-container rt-interaction-teaser-inner">
        <div className="rt-interaction-content">
          <div className="rt-eyebrow">SCROLL · CURSOR · BACKGROUNDS</div>
          <h2 id="rt-interaction-title">{ar?'كل حركة':'Every move'} <span>{ar?'بتفرق.':'matters.'}</span></h2>
          <p>{ar?interactionCount+' تأثير جديد: 12 حركة عند التمرير و12 خلفية متجاوبة مع الماوس واللمس، بمعاينة مباشرة وكود قابل للتصدير.':interactionCount+' new effects: 12 scroll-triggered animations and 12 pointer-reactive backgrounds, all customizable and exportable.'}</p>
          <Link href={'/'+locale+(toolsHost?'/interactions':'/tools/interactions')} className="rt-button rt-button-white">
            {ar?'استكشف التفاعلات':'Explore Interactions'} <ArrowUpRight size={17}/>
          </Link>
        </div>
        <div className="rt-interaction-demo" aria-hidden="true">
          <div className="rt-interaction-grid"/>
          <div className="rt-interaction-disc rt-disc-one"/>
          <div className="rt-interaction-disc rt-disc-two"/>
          <div className="rt-interaction-disc rt-disc-three"/>
          <span>INTERACTION / 024</span>
        </div>
      </div>
    </section>

    <section className="rt-section rt-showcase" id="studio" aria-labelledby="rt-showcase-title">
      <div className="rt-container rt-showcase-inner">
        <div className="rt-editor-scene">
          <div className="rt-editor-panel">
            <div className="rt-editor-top"><span><MousePointer2 size={15}/> Button Studio</span><span><Eye size={14}/> {ar?'معاينة':'Preview'}<Code2 size={14}/> Code</span></div>
            <div className="rt-editor-body">
              <div className="rt-editor-controls"><small>STYLE</small><div className="rt-editor-pills"><span className="active">Solid</span><span>Outline</span></div><small>COLOR</small><div className="rt-editor-swatch"><i/> #FFFFFF</div><small>RADIUS</small><div className="rt-slider"><i/></div><small>EXPORT</small><div className="rt-editor-pills"><span className="active">React</span><span>HTML</span></div></div>
              <div className="rt-editor-preview">
                <div className="rt-preview-grid">
                  <button type="button" className="rt-preview-btn" onClick={()=>setPreviewText(prev=>prev==='Explore Rawnak' || prev==='استكشف رونق'?(ar?'تم التفاعل!':'Clicked!'):(ar?'استكشف رونق':'Explore Rawnak'))}>{previewText}<ArrowUpRight size={16}/></button>
                </div>
                <div className="rt-editor-code-top"><span>&lt;/&gt; Button.jsx</span><button type="button" aria-label={ar?'نسخ المثال':'Copy demo'} onClick={copyDemo}>{demoCopied?<Check size={13}/>:<Copy size={13}/>} {ar?'نسخ':'Copy'}</button></div>
                <pre className="rt-editor-code" dir="ltr"><code><span>export default function Button() {'{'}</span>{'\n'}<span>  return (</span>{'\n'}<span>    </span><em>{buttonCode}</em>{'\n'}<span>  );</span>{'\n'}<span>{'}'}</span></code></pre>
              </div>
            </div>
          </div>
        </div>
        <div className="rt-showcase-content">
          <div className="rt-eyebrow">CREATE · CUSTOMIZE · EXPORT</div>
          <h2 id="rt-showcase-title">{ar?'من الفكرة':'From idea'}<br/><span>{ar?'إلى كود حقيقي':'to real code'}</span></h2>
          <p className="rt-showcase-summary">{ar?'غيّر التفاصيل، شاهد النتيجة مباشرة، وصدّر الكود الجاهز لمشروعك التالي.':'Customize every detail, preview in real time, and export ready-to-use code for your next project.'}</p>
          <div className="rt-feature-list">
            <div><span><Eye size={18}/></span><section><strong>{ar?'معاينة فورية':'Real-time Preview'}</strong><p>{ar?'التعديلات تظهر فورًا.':'See changes instantly.'}</p></section></div>
            <div><span><Code2 size={18}/></span><section><strong>{ar?'أكثر من صيغة للتصدير':'Multiple Export Formats'}</strong><p>React, HTML, CSS & SVG.</p></section></div>
            <div><span><WandSparkles size={18}/></span><section><strong>{ar?'كود قابل للتخصيص':'Customizable Source'}</strong><p>{ar?'كود واضح قابل للتعديل.':'Clean source you can adapt.'}</p></section></div>
          </div>
          <Link className="rt-text-link" href={studioLink('button-studio')}>{ar?'افتح Button Studio':'Open Button Studio'} <ArrowUpRight size={17}/></Link>
        </div>
      </div>
    </section>

    <section className="rt-section rt-components" id="components" aria-labelledby="rt-components-title">
      <div className="rt-container">
        <div className="rt-section-heading">
          <div><div className="rt-eyebrow">COMPONENTS · BLOCKS · TEMPLATES</div><h2 id="rt-components-title">{ar?'مكونات جاهزة للاستخدام':'Ready-Made Components'}</h2><p>{ar?'خمسة مكونات أصلية تقدر تجرّبها وتخصصها وتصدّر كودها دلوقتي.':'Five original component styles you can now preview, customize and export.'}</p></div>
          <Link href={componentsLink} className="rt-text-link">{ar?'تصفح المكونات':'Browse components'} <ArrowUpRight size={16}/></Link>
        </div>
        <div className="rt-components-grid">
          {components.map((item,i)=><Link href={componentsLink} className="rt-component-card rt-component-link" key={item.en}>
            <ComponentsPreview type={i}/>
            <div className="rt-component-card-bottom"><h3>{item[locale]}</h3><span>{ar?'جرّب':'Try it'} <ArrowUpRight size={14}/></span></div>
          </Link>)}
        </div>
      </div>
    </section>

    <section className="rt-final-cta rt-container"><div><div className="rt-eyebrow">RAWNAK / WHAT'S NEXT</div><h2>{ar?'ابدأ تصمم. ابدأ تنفّذ.':'Design faster. Build better.'}</h2><p>{ar?'خمس أدوات مجانية وجاهزة للاستخدام، والمكتبة هتكبر مع الوقت.':'Five free tools to get you moving. A bigger creative toolkit is on the way.'}</p></div><a href="#explore" className="rt-button rt-button-white">{ar?'ابدأ دلوقتي':'Start creating'} <ArrowUpRight size={17}/></a></section>
  </div>;
}

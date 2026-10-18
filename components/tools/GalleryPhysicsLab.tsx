'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, ArrowRight, ArrowUpRight, Code2, Copy, ExternalLink, Layers3, MousePointer2, ShieldCheck, Sparkles } from 'lucide-react';
import type { Locale } from '@/i18n/config';
import { galleryPhysicsCatalog, galleryPhysicsRegistry, type GalleryPhysicsId } from '@/components/tools/GalleryPhysics';

export default function GalleryPhysicsLab({locale,baseHref}:{locale:Locale;baseHref:string}) {
  const ar=locale==='ar';
  const [current,setCurrent]=useState<GalleryPhysicsId>('page-turn');
  const [message,setMessage]=useState('');
  const selected=galleryPhysicsCatalog.find(x=>x.id===current)!;
  const Component=galleryPhysicsRegistry[current];
  const snippet='import { '+Component.name+" } from '@/components/tools/GalleryPhysics';\n\n"+
    'export default function Example() {\n  return <'+Component.name+' />;\n}';
  const sourceUrl='https://github.com/altaqawy/rawnak/blob/feat/rawnak-tools-mvp/components/tools/GalleryPhysics.tsx';
  const cssUrl='https://github.com/altaqawy/rawnak/blob/feat/rawnak-tools-mvp/components/tools/gallery-physics.css';
  const copy=async()=>{try{await navigator.clipboard.writeText(snippet);setMessage(ar?'تم نسخ طريقة الاستخدام':'Usage copied');}catch{setMessage(ar?'النسخ غير متاح في هذا المتصفح':'Clipboard unavailable')}};

  return <main className="rag-page">
    <div className="rt-container rag-hero">
      <Link className="rag-back" href={baseHref}>{ar?<ArrowRight size={16}/>:<ArrowLeft size={16}/>}
        {ar?'العودة لأدوات رونق':'Back to Rawnak Tools'}</Link>
      <div className="rt-eyebrow">EXPERIMENTAL / MOTION ENGINEERING</div>
      <h1>{ar?'الحركة':'Beyond'} <span>{ar?'لها أبعاد.':'the surface.'}</span></h1>
      <p>{ar?'أربع تجارب جديدة لتحريك الورق والمعارض والجسيمات. مبنية بكود أصلي، وبتستجيب للمؤشر واللمس ولوحة المفاتيح حسب نوع المكون.':'Four original interactive experiments in paper physics, infinite perspective galleries, inertial dragging and image particles.'}</p>
      <div className="rag-meta"><span><Layers3 size={14}/> 04 NEW EXPERIENCES</span><span><ShieldCheck size={14}/> FIRST-PARTY SOURCE</span><span><MousePointer2 size={14}/> TOUCH & POINTER</span></div>
    </div>
    <div className="rt-container rag-layout">
      <nav className="rag-sidebar" aria-label={ar?'اختر التجربة':'Choose an experiment'}>
        <div className="rag-sidebar-head">{ar?'المكونات الجديدة':'NEW COMPONENTS'} <span>04</span></div>
        {galleryPhysicsCatalog.map((item,i)=><button type="button" aria-pressed={current===item.id}
          className={item.id===current?'is-selected':''} key={item.id}
          onClick={()=>{setCurrent(item.id);setMessage('')}}>
          <span>{String(i+1).padStart(2,'0')}</span><strong>{ar?item.ar:item.en}</strong><ArrowUpRight size={15}/>
        </button>)}
        <div className="rag-sidebar-footer">
          <Sparkles size={16}/>
          <p>{ar?'متاحة للتجربة — هنكمل تطوير الفيزياء وجودة الأداء.':'Experimental work. Physics and performance will be refined.'}</p>
        </div>
      </nav>
      <section className="rag-workspace">
        <div className="rag-workspace-title">
          <div><div className="rt-eyebrow">RAWNAK / EXPERIMENT {String(galleryPhysicsCatalog.indexOf(selected)+1).padStart(2,'0')}</div>
            <h2>{ar?selected.ar:selected.en}</h2>
            <p>{selected.description}</p></div>
          <span className="rag-live">● INTERACTIVE</span>
        </div>
        <div className="rag-demo-frame">
          <div className="rag-demo-top"><span><MousePointer2 size={14}/> INTERACTIVE CANVAS</span><span>RA / EXP 00{galleryPhysicsCatalog.indexOf(selected)+1}</span></div>
          <div className="rag-demo-stage"><Component key={current}/></div>
        </div>
        <div className="rag-detail-grid">
          <div><strong>{ar?'الفكرة':'Interaction concept'}</strong><p>{selected.description}</p></div>
          <div><strong>{ar?'الحقوق':'Original implementation'}</strong><p>{ar?'المكونات مكتوبة لرونق ولا تحتوي على كود أو أصول من React Bits Pro.':'Authored for Rawnak; no React Bits Pro source or assets included.'}</p></div>
        </div>
        <div className="rag-source">
          <div className="rag-source-head"><strong><Code2 size={16}/>{ar?'الدمج في React':'React Integration'}</strong>
            <button type="button" onClick={copy}><Copy size={14}/>{ar?'نسخ المثال':'Copy usage'}</button></div>
          <pre dir="ltr"><code>{snippet}</code></pre>
          <div className="rag-source-links">
            <a href={sourceUrl} target="_blank" rel="noopener noreferrer">{ar?'ملف React كامل':'React source'} <ExternalLink size={14}/></a>
            <a href={cssUrl} target="_blank" rel="noopener noreferrer">CSS <ExternalLink size={14}/></a>
          </div>
          <p className="rag-source-note" role="status" aria-live="polite">{message||(ar?'لتشغيل المثال، انسخ ملف المكون وملف CSS إلى مشروعك أولًا.':'Copy GalleryPhysics.tsx and gallery-physics.css into your project before using the snippet.')}</p>
        </div>
      </section>
    </div>
  </main>;
}

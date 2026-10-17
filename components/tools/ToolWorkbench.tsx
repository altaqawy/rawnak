'use client';

import { useMemo, useState } from 'react';
import { Check, Clipboard, Code2, Download, Eye, RotateCcw, Settings2, Sparkles } from 'lucide-react';
import type { Locale } from '@/i18n/config';
import type { ToolSlug } from '@/lib/tools/catalog';

type Props = { locale: Locale; tool: ToolSlug };
type MotionKind = 'float' | 'pulse' | 'spin';
type PatternKind = 'dots' | 'grid' | 'diagonal';

function escapeHtml(value: string) {
  return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

function patternSvg(kind: PatternKind, step: number, color: string) {
  const drawing = kind === 'dots'
    ? '<circle cx="' + step / 2 + '" cy="' + step / 2 + '" r="1.6" fill="' + color + '" />'
    : kind === 'grid'
    ? '<path d="M ' + step + ' 0 H 0 V ' + step + '" fill="none" stroke="' + color + '" stroke-width="0.8" />'
    : '<path d="M -' + step / 2 + ' ' + step / 2 + ' l ' + step + ' -' + step + ' M 0 ' + step + ' l ' + step + ' -' + step + '" fill="none" stroke="' + color + '" stroke-width="1" />';

  return '<svg xmlns="http://www.w3.org/2000/svg" width="' + step + '" height="' + step + '" viewBox="0 0 ' + step + ' ' + step + '"><title>Rawnak pattern</title>' + drawing + '</svg>';
}

function getMotionFrames(kind: MotionKind) {
  if (kind === 'pulse') return '0%, 100% { transform: scale(1); opacity: 1; } 50% { transform: scale(1.08); opacity: .74; }';
  if (kind === 'spin') return 'from { transform: rotate(0deg); } to { transform: rotate(360deg); }';
  return '0%, 100% { transform: translateY(0); } 50% { transform: translateY(-18px); }';
}

export default function ToolWorkbench({ tool, locale }: Props) {
  const ar = locale === 'ar';
  const [label, setLabel] = useState('Explore Rawnak');
  const [accent, setAccent] = useState('#4772f5');
  const [radius, setRadius] = useState(14);
  const [shadow, setShadow] = useState(true);
  const [motion, setMotion] = useState<MotionKind>('float');
  const [duration, setDuration] = useState(2.2);
  const [background, setBackground] = useState('#0a1020');
  const [foreground, setForeground] = useState('#ffffff');
  const [pattern, setPattern] = useState<PatternKind>('dots');
  const [step, setStep] = useState(24);
  const [heroTitle, setHeroTitle] = useState('Build what is next.');
  const [heroBody, setHeroBody] = useState('A powerful starting point for your next great idea.');
  const [copied, setCopied] = useState(false);
  const [notice, setNotice] = useState('');

  const frames = getMotionFrames(motion);
  const svg = patternSvg(pattern, step, accent);

  const snippet = useMemo(() => {
    if (tool === 'button-studio') {
      return '<button class="rawnak-button">' + escapeHtml(label) + '</button>\n<style>\n' +
        '.rawnak-button {\n  padding: 14px 26px;\n  border: 0;\n  border-radius: ' + radius + 'px;\n  color: #fff;\n  background: ' + accent + ';\n  font: 600 15px/1.4 system-ui, sans-serif;\n  cursor: pointer;\n  transition: transform 180ms ease, box-shadow 180ms ease;\n' +
        (shadow ? '  box-shadow: 0 12px 35px ' + accent + '55;\n' : '') +
        '}\n.rawnak-button:hover { transform: translateY(-3px);' + (shadow ? ' box-shadow: 0 16px 48px ' + accent + '77;' : '') + ' }\n.rawnak-button:focus-visible { outline: 3px solid ' + accent + '; outline-offset: 4px; }\n@media (prefers-reduced-motion: reduce) { .rawnak-button { transition: none; } .rawnak-button:hover { transform: none; } }\n</style>';
    }
    if (tool === 'motion-studio') {
      return '<div class="rawnak-motion">' + escapeHtml(label) + '</div>\n<style>\n.rawnak-motion {\n  display: inline-block;\n  padding: 18px 28px;\n  border-radius: ' + radius + 'px;\n  background: ' + accent + ';\n  color: white;\n  font: 600 18px system-ui, sans-serif;\n  animation: raw-' + motion + ' ' + duration + 's ease-in-out infinite;\n}\n@keyframes raw-' + motion + ' { ' + frames + ' }\n@media (prefers-reduced-motion: reduce) { .rawnak-motion { animation: none; } }\n</style>';
    }
    if (tool === 'theme-builder') {
      return '/* Rawnak theme tokens */\n:root {\n  --rawnak-primary: ' + accent + ';\n  --rawnak-background: ' + background + ';\n  --rawnak-text: ' + foreground + ';\n  --rawnak-radius: ' + radius + 'px;\n}\n\n.rawnak-surface {\n  color: var(--rawnak-text);\n  background: var(--rawnak-background);\n  border-radius: var(--rawnak-radius);\n}\n.rawnak-action { background: var(--rawnak-primary); color: #fff; }';
    }
    if (tool === 'svg-studio') return svg;
    return '<section class="rawnak-hero">\n  <div class="rawnak-hero-inner">\n    <p class="rawnak-eyebrow">RAWNAK / BUILDER</p>\n    <h1>' + escapeHtml(heroTitle) + '</h1>\n    <p>' + escapeHtml(heroBody) + '</p>\n    <a class="rawnak-hero-action" href="#next-section">' + escapeHtml(label) + '</a>\n  </div>\n</section>\n<style>\n.rawnak-hero { padding: clamp(64px, 12vw, 150px) 24px; background: ' + background + '; color: ' + foreground + '; }\n.rawnak-hero-inner { max-width: 1050px; margin: auto; }\n.rawnak-eyebrow { letter-spacing: .2em; font-size: 12px; opacity: .7; }\n.rawnak-hero h1 { font: 700 clamp(44px, 7vw, 90px)/1.06 system-ui, sans-serif; letter-spacing: -.05em; max-width: 760px; margin: 24px 0; }\n.rawnak-hero-inner > p:not(.rawnak-eyebrow) { max-width: 540px; font: 18px/1.7 system-ui, sans-serif; opacity: .8; margin-bottom: 32px; }\n.rawnak-hero-action { display: inline-block; padding: 15px 24px; border-radius: ' + radius + 'px; background: ' + accent + '; color: white; text-decoration: none; font: 600 15px system-ui, sans-serif; }\n</style>';
  }, [tool, label, accent, radius, shadow, motion, duration, frames, background, foreground, svg, heroTitle, heroBody]);

  const reset = () => {
    setLabel('Explore Rawnak');
    setAccent('#4772f5');
    setRadius(14);
    setShadow(true);
    setMotion('float');
    setDuration(2.2);
    setBackground('#0a1020');
    setForeground('#ffffff');
    setPattern('dots');
    setStep(24);
    setHeroTitle('Build what is next.');
    setHeroBody('A powerful starting point for your next great idea.');
    setCopied(false);
    setNotice('');
  };

  async function copyCode() {
    try {
      await navigator.clipboard.writeText(snippet);
      setCopied(true);
      setNotice(ar ? 'تم نسخ الكود' : 'Code copied');
    } catch {
      setNotice(ar ? 'تعذر النسخ تلقائيًا؛ انسخ النص من نافذة الكود.' : 'Clipboard unavailable; select the code and copy manually.');
    }
  }

  function downloadCode() {
    const extension = tool === 'svg-studio' ? 'svg' : tool === 'theme-builder' ? 'css' : 'html';
    const blob = new Blob([snippet], { type: extension === 'svg' ? 'image/svg+xml' : 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = 'rawnak-' + tool + '.' + extension;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);
    setNotice(ar ? 'الملف جاهز' : 'File downloaded');
  }

  function colorField(text: string, value: string, onChange: (value: string) => void) {
    return (
      <label className="flex items-center justify-between gap-4 rounded-xl border border-border/70 bg-background/50 px-3 py-3 text-sm">
        <span className="text-muted-foreground">{text}</span>
        <span className="flex items-center gap-2 font-mono text-xs">
          <span>{value.toUpperCase()}</span>
          <input aria-label={text} type="color" value={value} onChange={(e) => onChange(e.target.value)} className="size-8 cursor-pointer rounded-lg border-0 bg-transparent p-0" />
        </span>
      </label>
    );
  }

  function textField(text: string, value: string, onChange: (value: string) => void, multiline = false) {
    return (
      <label className="block space-y-2">
        <span className="text-xs font-medium text-muted-foreground">{text}</span>
        {multiline
          ? <textarea rows={3} maxLength={180} value={value} onChange={(e) => onChange(e.target.value)} className="w-full resize-y rounded-xl border border-border bg-background/70 px-3 py-2.5 text-sm outline-none focus-visible:ring-2 focus-visible:ring-blue-500" />
          : <input maxLength={90} value={value} onChange={(e) => onChange(e.target.value)} className="w-full rounded-xl border border-border bg-background/70 px-3 py-2.5 text-sm outline-none focus-visible:ring-2 focus-visible:ring-blue-500" />}
      </label>
    );
  }

  function rangeField(text: string, value: number, min: number, max: number, stepValue: number, unit: string, onChange: (value: number) => void) {
    return (
      <label className="block space-y-3">
        <span className="flex items-center justify-between text-xs text-muted-foreground"><span>{text}</span><span className="font-mono text-foreground">{value}{unit}</span></span>
        <input type="range" value={value} min={min} max={max} step={stepValue} onChange={(e) => onChange(Number(e.target.value))} className="w-full accent-blue-500" />
      </label>
    );
  }

  const selectClass = 'w-full rounded-xl border border-border bg-background/70 px-3 py-3 text-sm text-foreground outline-none focus-visible:ring-2 focus-visible:ring-blue-500';

  return (
    <div className="grid items-start gap-5 lg:grid-cols-[minmax(280px,350px)_minmax(0,1fr)]">
      <aside className="rounded-2xl border border-border/80 bg-card/80 p-5 sm:p-6">
        <div className="mb-6 flex items-center justify-between border-b border-border/70 pb-5">
          <h2 className="flex items-center gap-2 text-sm font-semibold"><Settings2 className="size-4" />{ar ? 'الإعدادات' : 'Customize'}</h2>
          <button type="button" onClick={reset} className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground"><RotateCcw className="size-3.5" />{ar ? 'إعادة ضبط' : 'Reset'}</button>
        </div>
        <div className="space-y-6">
          {(tool === 'button-studio' || tool === 'motion-studio') && textField(ar ? 'نص العنصر' : 'Element label', label, setLabel)}
          {tool === 'hero-builder' && (
            <>
              {textField(ar ? 'العنوان الرئيسي' : 'Headline', heroTitle, setHeroTitle)}
              {textField(ar ? 'النص التعريفي' : 'Description', heroBody, setHeroBody, true)}
              {textField(ar ? 'نص الزر' : 'Button label', label, setLabel)}
            </>
          )}
          {tool === 'svg-studio' && (
            <label className="block space-y-2 text-xs text-muted-foreground">
              <span>{ar ? 'نوع الزخرفة' : 'Pattern style'}</span>
              <select className={selectClass} value={pattern} onChange={(e) => setPattern(e.target.value as PatternKind)}>
                <option value="dots">{ar ? 'نقاط' : 'Dots'}</option>
                <option value="grid">{ar ? 'شبكة' : 'Grid'}</option>
                <option value="diagonal">{ar ? 'خطوط مائلة' : 'Diagonal'}</option>
              </select>
            </label>
          )}
          {tool === 'motion-studio' && (
            <label className="block space-y-2 text-xs text-muted-foreground">
              <span>{ar ? 'نوع الحركة' : 'Animation type'}</span>
              <select className={selectClass} value={motion} onChange={(e) => setMotion(e.target.value as MotionKind)}>
                <option value="float">{ar ? 'طفو' : 'Float'}</option>
                <option value="pulse">{ar ? 'نبض' : 'Pulse'}</option>
                <option value="spin">{ar ? 'دوران' : 'Spin'}</option>
              </select>
            </label>
          )}
          {colorField(ar ? 'اللون الرئيسي' : 'Accent', accent, setAccent)}
          {(tool === 'theme-builder' || tool === 'hero-builder') && (
            <>
              {colorField(ar ? 'الخلفية' : 'Background', background, setBackground)}
              {colorField(ar ? 'النص' : 'Text', foreground, setForeground)}
            </>
          )}
          {(tool === 'button-studio' || tool === 'motion-studio' || tool === 'theme-builder' || tool === 'hero-builder') && rangeField(ar ? 'استدارة الحواف' : 'Corner radius', radius, 0, 36, 2, 'px', setRadius)}
          {tool === 'motion-studio' && rangeField(ar ? 'مدة الحركة' : 'Duration', duration, 0.6, 6, 0.2, 's', setDuration)}
          {tool === 'svg-studio' && rangeField(ar ? 'حجم الشبكة' : 'Pattern spacing', step, 12, 80, 2, 'px', setStep)}
          {tool === 'button-studio' && (
            <label className="flex cursor-pointer items-center justify-between text-sm text-muted-foreground">
              <span>{ar ? 'توهج وظل' : 'Glow shadow'}</span>
              <input type="checkbox" checked={shadow} onChange={(e) => setShadow(e.target.checked)} className="size-4 accent-blue-500" />
            </label>
          )}
        </div>
        <p className="mt-9 border-t border-border/70 pt-5 text-xs leading-6 text-muted-foreground">
          {ar ? 'الأدوات تعمل محليًا داخل المتصفح؛ مش محتاج ترفع بيانات أو تنشئ حساب.' : 'All these tools run in your browser. No uploads or accounts required.'}
        </p>
      </aside>

      <div className="min-w-0 space-y-5">
        <section className="overflow-hidden rounded-2xl border border-border/80 bg-card/80">
          <div className="flex items-center justify-between gap-2 border-b border-border/80 px-5 py-4 text-sm font-medium">
            <span className="flex items-center gap-2"><Eye className="size-4" />{ar ? 'معاينة مباشرة' : 'Live preview'}</span>
            <span className="rounded-full border border-border px-2.5 py-1 font-mono text-[10px] tracking-widest text-muted-foreground">LIVE</span>
          </div>
          <div className="relative flex min-h-[345px] items-center justify-center overflow-hidden bg-[#080b12] p-6 sm:p-10" dir="ltr">
            <div aria-hidden className="pointer-events-none absolute inset-0 opacity-30" style={{backgroundImage:'linear-gradient(#65728a25 1px, transparent 1px), linear-gradient(90deg, #65728a25 1px, transparent 1px)',backgroundSize:'28px 28px'}} />
            {tool === 'button-studio' && (
              <button
                type="button"
                className="relative max-w-full break-words px-7 py-4 font-semibold text-white transition-transform duration-200 hover:-translate-y-1 focus-visible:outline-4 focus-visible:outline-offset-4 focus-visible:outline-blue-400"
                style={{ backgroundColor: accent, borderRadius: radius, boxShadow: shadow ? '0 12px 40px ' + accent + '70' : 'none' }}
              >{label || 'Button'}</button>
            )}
            {tool === 'motion-studio' && (
              <>
                <style>{'@keyframes raw-' + motion + ' { ' + frames + ' } @media (prefers-reduced-motion: reduce) { .rawnak-live-motion { animation: none !important; } }'}</style>
                <div className="rawnak-live-motion relative max-w-full break-words px-7 py-5 font-semibold text-white" style={{ backgroundColor: accent, borderRadius: radius, animation: 'raw-' + motion + ' ' + duration + 's ease-in-out infinite' }}>{label || 'Motion'}</div>
              </>
            )}
            {tool === 'theme-builder' && (
              <div className="relative w-full max-w-md border p-7 sm:p-9" style={{backgroundColor:background,color:foreground,borderRadius:radius,borderColor:accent + '55'}}>
                <span className="mb-6 block font-mono text-[10px] tracking-widest opacity-65">RAWNAK DESIGN SYSTEM</span>
                <h3 className="text-3xl font-semibold tracking-tight">Design with intention.</h3>
                <p className="mt-3 text-sm leading-6 opacity-75">Every surface, every color, one cohesive system.</p>
                <button type="button" className="mt-7 px-5 py-3 text-sm font-semibold text-white" style={{backgroundColor:accent,borderRadius:radius}}>Get started ↗</button>
              </div>
            )}
            {tool === 'svg-studio' && (
              <div className="relative min-h-[260px] w-full max-w-xl rounded-2xl border border-white/15 bg-[#0d1019]" style={{backgroundImage:'url("data:image/svg+xml,' + encodeURIComponent(svg) + '")'}}>
                <div className="absolute inset-0 flex items-center justify-center"><span className="rounded-full border border-white/25 bg-[#080b12]/90 px-5 py-3 font-mono text-sm text-white">SVG / PATTERN</span></div>
              </div>
            )}
            {tool === 'hero-builder' && (
              <div className="relative w-full max-w-3xl px-6 py-12 sm:px-12" style={{backgroundColor:background,color:foreground}}>
                <div className="mb-7 text-[10px] font-semibold tracking-[0.3em] opacity-65">RAWNAK / BUILDER</div>
                <h3 className="max-w-xl break-words text-4xl font-bold leading-[1.06] tracking-[-0.055em] sm:text-6xl">{heroTitle}</h3>
                <p className="mt-6 max-w-md break-words text-sm leading-7 opacity-75 sm:text-base">{heroBody}</p>
                <button type="button" className="mt-7 break-words px-5 py-3 text-sm font-semibold text-white" style={{backgroundColor:accent,borderRadius:radius}}>{label || 'Explore'}</button>
              </div>
            )}
          </div>
        </section>

        <section className="min-w-0 overflow-hidden rounded-2xl border border-border/80 bg-card/80">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/80 px-5 py-4">
            <span className="flex items-center gap-2 text-sm font-semibold"><Code2 className="size-4" />{ar ? 'كود جاهز للتصدير' : 'Exportable source'}</span>
            <div className="flex flex-wrap items-center gap-2">
              <button type="button" onClick={downloadCode} className="inline-flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-2 text-xs font-semibold hover:border-blue-500/50">
                <Download className="size-3.5" />{ar ? 'تنزيل' : 'Download'}
              </button>
              <button type="button" onClick={copyCode} className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-3 py-2 text-xs font-semibold text-white hover:bg-blue-500">
                {copied ? <Check className="size-3.5" /> : <Clipboard className="size-3.5" />}{ar ? 'نسخ الكود' : 'Copy code'}
              </button>
            </div>
          </div>
          <div className="border-b border-border/60 bg-background/40 px-5 py-3 font-mono text-xs text-muted-foreground" dir="ltr">{tool === 'svg-studio' ? 'pattern.svg' : tool === 'theme-builder' ? 'theme.css' : tool + '.html'}</div>
          <pre dir="ltr" className="max-h-[340px] overflow-auto whitespace-pre p-5 text-left font-mono text-[12px] leading-6 text-foreground/90 sm:p-6"><code>{snippet}</code></pre>
          <div role="status" aria-live="polite" className="flex min-h-10 items-center gap-2 border-t border-border/70 px-5 py-2 text-xs text-muted-foreground">
            <Sparkles className="size-3.5" />{notice || (ar ? 'أي تعديل في الإعدادات يُحدث المعاينة والكود فورًا.' : 'Every change updates the preview and code instantly.')}
          </div>
        </section>
      </div>
    </div>
  );
}

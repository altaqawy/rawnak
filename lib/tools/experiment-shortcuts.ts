/** Small, bundle-safe index for experimental labs. Heavy Canvas/GPU code is lazy on its own route. */
export type ExperimentShortcut={
  id:string;en:string;ar:string;section:string;page:'advanced'|'gallery-physics'|'gpu'|'spectra';
};
export const experimentShortcuts:ExperimentShortcut[]=[
  {id:'paper-mill',en:'Paper Mill',ar:'فرّامة الورق',section:'V7 / PHYSICS',page:'advanced'},
  {id:'tear-pass',en:'Perforated Pass',ar:'تذكرة قابلة للتمزيق',section:'V7 / GESTURES',page:'advanced'},
  {id:'folded-sheet',en:'Folded Sheet',ar:'تجعيد الورق',section:'V7 / SIMULATION',page:'advanced'},
  {id:'branch-nav',en:'Branch Navigator',ar:'القائمة المتفرعة',section:'V7 / NAVIGATION',page:'advanced'},
  {id:'elastic-rail',en:'Elastic Rail',ar:'معرض مرن',section:'V7 / GALLERIES',page:'advanced'},
  {id:'swipe-notice',en:'Swipe Notice',ar:'تنبيه بالسحب',section:'V7 / MICRO',page:'advanced'},
  {id:'bell-pulse',en:'Bell Pulse',ar:'جرس تفاعلي',section:'V7 / MICRO',page:'advanced'},
  {id:'dot-morph',en:'Glyph Cloud',ar:'سحابة جسيمات',section:'V7 / PARTICLES',page:'advanced'},
  {id:'page-turn',en:'Paperbound',ar:'كتاب الصفحات المتقلبة',section:'V8 / 3D',page:'gallery-physics'},
  {id:'endless-gallery',en:'Infinity Corridor',ar:'المعرض اللانهائي',section:'V8 / GALLERIES',page:'gallery-physics'},
  {id:'spring-reel',en:'Spring Filmstrip',ar:'شريط الصور المرن',section:'V8 / GALLERIES',page:'gallery-physics'},
  {id:'image-particles',en:'Pixel Drift',ar:'جسيمات الصور',section:'V8 / PARTICLES',page:'gallery-physics'},
  {id:'atlas-globe',en:'Atlas Globe',ar:'الكرة المدارية',section:'V9 / WEBGL',page:'gpu'},
  {id:'inside-dome',en:'Inside Dome',ar:'القبة الداخلية',section:'V9 / WEBGL',page:'gpu'},
  {id:'silk-ribbon',en:'Silk Ribbon',ar:'شريط حريري',section:'V9 / WEBGL',page:'gpu'},
  {id:'star-burst',en:'Star Burst',ar:'انفجار النجوم',section:'V10 / CANVAS',page:'spectra'},
  {id:'ribbon-flow',en:'Ribbon Flow',ar:'تدفق الشرائط',section:'V10 / PHYSICS',page:'spectra'},
  {id:'prism-carousel',en:'Prism Carousel',ar:'المعرض المنشوري',section:'V10 / 3D',page:'spectra'},
];

# RAWNAK TOOLS — ChatGPT Sites build handoff

**Project:** Rawnak Tools
**Owner brand:** Rawnak Group
**Platform target:** ChatGPT Sites (NOT Vercel)
**Intended public URLs after custom-domain setup:**
- English: https://tools.rawnakgroup.com/en/
- Arabic: https://tools.rawnakgroup.com/ar/
- Tool example: https://tools.rawnakgroup.com/en/button-studio

> The addresses above are requirements, **not** confirmation of publication. Do not change or disrupt the existing Rawnak Group site at raw nak group dot com.

## One-shot task for a ChatGPT Work / Sites agent

Use @Sites to create a **new** interactive ChatGPT Site named **Rawnak Tools**, separate from the existing Rawnak Group Site. The goal is a polished, professional, multilingual, browser-only toolbox for developers and designers. Produce a private preview and save a reviewable version. **Do not publish publicly or attach the custom domain until the owner reviews the preview.**

The GitHub repository `altaqawy/rawnak`, branch `feat/rawnak-tools-mvp`, has existing first-party implementations of five working studios. Use these as reference for behavior, content, and export semantics; port or reproduce the functionality in the ChatGPT Sites project rather than assuming that a Next.js repository automatically becomes a ChatGPT Site.

Source:
- `lib/tools/catalog.ts`: bilingual tool catalog and slugs.
- `components/tools/ToolWorkbench.tsx`: interactive editor controls, previews and code exports.
- `app/[locale]/tools/page.tsx`: landing page composition.
- `app/[locale]/tools/[tool]/page.tsx`: editor page composition.
- `components/tools/ToolsHeader.tsx`: dedicated branded product shell.
- `lib/tools/domain.ts`: intended external URL structure.
- `docs/RAWNAK_TOOLS.md`: technical notes for the previous Next.js implementation.

The prior `next.config.mjs` subdomain rewrites are for **Vercel/Next.js only**. They are **not** ChatGPT Sites deployment settings. Do not copy those platform-specific configuration steps into Sites.

## Design requirements

- Premium Framer-inspired cinematic interface matching the approved monochrome concept. Use true black #000000 for the background and ONLY white/charcoal/gray for the interface (NO blue accents). Dramatic oversized editorial typography, carefully crafted floating 3D-looking product cards/orbits rendered with CSS, subtle glow, hairline borders, responsive showcase sections and clean code-editor panels. Keep animations lightweight and honor reduced-motion.
- Full Arabic RTL / English LTR UI, accessible language switch that preserves the selected studio.
- Light and dark color modes if supported by the Sites runtime.
- Responsive from mobile through wide desktop; keyboard-focus states and reduced-motion support.
- Dedicated brand header: "RAWNAK TOOLS · BY RAWNAK GROUP".
- Dedicated footer with a link to https://rawnakgroup.com/.
- Landing page: cinematic hero with floating orbit illustration and REAL metrics (5 tools, 2 languages, free to use); working category filters/search; five distinctive studio cards; large realistic Button Studio showcase; roadmap component gallery clearly labeled Coming Soon; closing CTA. Do NOT pretend that the component gallery is already live.
- The public Site URL plan should be /en/ for English, /ar/ for Arabic and /en/<slug>, /ar/<slug> for tools. If ChatGPT Sites cannot provide this exact path layout, show the available URL behavior and ask before claiming it is implemented.

## Five actually-functional, completely free, client-side studios

1. **Button Studio** (`button-studio`): label, HEX accent color, corner radius, glow shadow. Interactive preview, copy/export usable HTML + CSS, focus styles.
2. **Motion Studio** (`motion-studio`): label, float/pulse/spin effect, animation duration, accent color; CSS keyframes preview and code, with `prefers-reduced-motion` opt-out.
3. **Theme Builder** (`theme-builder`): accent, background, foreground, radius; instant theme preview and export CSS custom properties.
4. **SVG Pattern Studio** (`svg-studio`): dots/grid/diagonal patterns, adjustable spacing and color, SVG code and .svg download.
5. **Hero Builder** (`hero-builder`): headline, description, CTA text, colors, radius; responsive section preview and safe escaped HTML + CSS export.

Shared behavior: no signup and no backend; live preview updates with settings; copy-to-clipboard and file download; explicit feedback for copy/download failures. Validate generated exported markup, encoding and accessibility. No fake buttons, counters, prices or subscription features.

## Product boundaries and licensing

- All code being redistributed to the public must be first-party or compliant with the exact source license.
- Do **not** copy or republish React Bits Pro components, branded screenshots, premium templates, or license-restricted competitor snippets.
- Rawnak Tools is a product **under Rawnak Group**, not a fourth top-level Rawnak world.
- No payment, account, external API keys, tracking or personal-data collection in this MVP.
- Build on reusable editing/preview/export architecture so future tools can share common primitives.
- Do not migrate, overwrite, unpublish, or modify the existing Rawnak Group Site.

## Acceptance checks before any public release

- Arabic and English landings render correctly, including RTL/LTR and language switching.
- All five studios work in preview on mobile and desktop with black, white and gray styling (no blue theme).
- Exported snippets are syntactically valid and reproduce the intended preview.
- No broken internal links, runtime exceptions or external secrets.
- Save a private reviewable version and present it for approval.

## Custom-domain setup — after approval

The intended host is `tools.rawnakgroup.com`. The DNS zone for `rawnakgroup.com` has been observed under Cloudflare nameservers. In Sites settings, select **Add domain** and obtain the exact DNS records displayed for this specific Site. Use only those values in Cloudflare. Never substitute Vercel's DNS values. Keep DNS for the root group website unchanged. Verify domain ownership, SSL and both language routes before marking it live.

## User decisions already supplied

- Name: **Rawnak Tools**.
- Brand: under **Rawnak Group**.
- Host: **tools.rawnakgroup.com**.
- Default requested URL format: **/en/** with matching **/ar/**.
- The owner prefers fast, low-cost delivery by using legally reusable free/open-source foundations.
- The existing GitHub implementation is a *reference* and can be improved; it is not the host of the final ChatGPT Site.

## Remaining explicit user action

Start a ChatGPT **Work** conversation and invoke `@Sites` on this handoff. The owner should inspect the private preview and approve publishing; later they may need to authorize DNS-provider access to complete the custom-domain setup. Do not ask for passwords, API keys, or tokens in chat.

## Approved reference design (2026-10-17)

The owner specifically approved the black-and-white React Bits / Framer-inspired landing concept: hero with floating dark glass tiles and orbits, tool categories and five cards, code editor showcase, components gallery, nearly pure-black background. The updated implementation is in `components/tools/ToolsLanding.tsx`, `components/tools/tools-theme.css`, and `components/tools/ToolsHeader.tsx` on the same feature branch. Preserve this visual direction in the ChatGPT Sites port.

## V4 Interaction Lab — added 2026-10-18

- New original `lib/tools/interaction-presets.ts` exports 24 effects: 12 IntersectionObserver-triggered scroll reveals, 12 pointer-reactive monochrome backgrounds.
- New live editor `components/tools/InteractionLab.tsx` and isolated CSS `components/tools/interaction-lab.css`; bilingual Next route `app/[locale]/tools/interactions/page.tsx`.
- Intended public routes: `/en/interactions`, `/ar/interactions`; language switch preserves the destination.
- Controls: animation duration/text for scroll effects, live pointer preview for backgrounds, filtering/search, local favorites, copy/download HTML + CSS + vanilla JS or React JSX.
- Accessibility: reduced-motion behavior for scroll previews and exports; pointer backgrounds remain visible without interaction; keyboard focus styles.
- All 24 presets are original. Alongside 50 previous original motion presets, the animation/interaction catalog now has 74 effects. Five interactive studios and five UI components are separate.
- Offline self-contained V4 review archive: `rawnak-tools-v4-interactions.zip`, generated as a local downloadable conversation artifact (not automatically stored in GitHub).
- Important: source is on a GitHub feature branch and not ported into the owner's actual ChatGPT Site yet. Do not claim the custom domain is active.

## V5 — Original Kinetic Lab (2026-10-18)

The owner approved the Framer-inspired pure-black aesthetic and requested the next phase of 3D cards, magnetic interactions, and interactive galleries.

Added 12 **new original** interactive presets grouped as:
- 3D Cards (4): Perspective Tilt, Liquid Glass, Layered Depth, Border Glow
- Magnetic (4): Magnetic Button, Magnetic Orb, Magnetic Pill, Magnetic Tile
- Galleries (4): Editorial Rail, Layer Stack, Focus Gallery, Arc Gallery

**Implementation**: \`lib/tools/kinetic-presets.ts\` (original effect registry, HTML/CSS/JS and React JSX exports), \`components/tools/KineticLab.tsx\` (editor, hover/pointer previews, controls, keyboard gallery navigation, search, local favorites), \`components/tools/kinetic-lab.css\`, \`app/[locale]/tools/kinetic/page.tsx\`, and nav/homepage changes.

**URLs after actual ChatGPT Sites publication**: \`https://tools.rawnakgroup.com/en/kinetic\` and \`/ar/kinetic\`. They are only planned at present.

**Catalog totals**: 50 original motion presets + 24 scroll/pointer presets + 12 kinetic presets = 86 distinct effect presets; the separate 5 original UI components and 5 utility studios are not included in the 86 count.

**Offline local review**: \`rawnak-tools-v5-kinetic.zip\`, a self-contained downloadable preview in the conversation (not a website release). Tested in Chromium for 3D pointer tilt, magnetic translation, gallery next/previous navigation, React export tab, favorites, and 390px mobile layout without JavaScript errors or horizontal overflow. This **does not** validate a future ChatGPT Sites port.

**Accessibility/security**: no external packages or personal-data collection; reduced-motion fallbacks; keyboard/focus affordances. Generated source should be visually reviewed and smoke-tested inside each target application before production deployment.

## V6 — Unified Visual Studio (2026-10-18)

- Implemented `components/tools/VisualStudio.tsx`, `components/tools/visual-studio.css`, and `/[locale]/tools/studio` route (intended domain routes `/en/studio` and `/ar/studio`).
- Aggregates 50 CSS animations + 24 scroll/pointer effects + 12 3D/magnetic/gallery effects + 5 live UI components = **91 directly editable/exportable items**. Adds links to 5 specialized utility studios = **96 searchable choices**.
- Reuses existing source generation (`generateMotionExport`, `exportInteraction`, `kineticExport`, `sourceFor`) and live preview (`LiveDemo`, `LiveComponent`) rather than duplicating the effects in Next.js.
- Features global search, category filters, favorites and per-item local settings, context-sensitive controls, replay, HTML/CSS/JS or React JSX code previews, copy and download, bilingual RTL/LTR, reduced-motion support.
- Header language switch preserves `/studio`; home showcase links to the actual unified studio. Existing tools and components remain accessible.
- **Offline V6 standalone demo:** `/mnt/data/rawnak-tools-v6-visual-studio.zip` in current conversation only. Built from prior V5 offline source; it is a browser-only reference and not a deployed ChatGPT Site. It offers live previews for all preset families; the Next.js branch is the canonical implementation.
- Automated Chromium smoke tests covered both languages, 96-item catalog, filtering 50/24/12/5/5, 3D tilt, gallery next, pointer spotlight, favorites/save, JSX tab, no horizontal overflow at 390px, no JS page errors. Nine representative exported JSX files parsed successfully with TypeScript. Passing syntax checks is not full integration testing of code in a consuming project.
- **Do not merge to published Rawnak Group site**. Move into a separate ChatGPT Sites project through Work and use Sites domain/DNS values only after owner reviews private preview.

## V7 — Advanced Physics and Gesture Interactions

- Eight new **experimental first-party components** built in `components/tools/AdvancedLab.tsx` and `components/tools/advanced-lab.css`: Paper Mill (drag-to-shred), Perforated Pass (ticket tear), Folded Sheet (faceted crumple), Branch Navigator, Elastic Rail, Swipe Notice, Bell Pulse, and Glyph Cloud (Canvas particle text morph).
- New bilingual page `app/[locale]/tools/advanced/page.tsx`, integrated in header and landing. Intended URLs `tools.rawnakgroup.com/en/advanced` and `/ar/advanced` are not live.
- This expands the previously documented 96 choices by eight **experimental** interactions, but these are maintained as a separate lab pending production validation. Do not relabel them as exact React Bits reproductions.
- No React Bits or React Bits Pro code or proprietary assets were embedded. Source comparison and roadmap: `docs/ADVANCED_MOTION_ROADMAP.md`.
- Offline browser-only reference ZIP: `rawnak-tools-v7-advanced-lab.zip` is a separate conversation artifact (not committed in GitHub); HTML/CSS/JS stand-in demo. The offline ZIP is **not a compiled export of the React components**. JS syntax and ZIP CRC passed, browser automation was blocked in the current environment and pointer events require manual verification.
- The actual public Rawnak Group website in ChatGPT Sites remains unchanged. Do not automatically merge this draft PR or claim deployment to tools.rawnakgroup.com.


## V8 — Gallery Physics Lab (2026-10-18)

**Why:** Following the approved monochrome V7 Advanced Lab, the owner asked to advance toward the concepts of Page Flip, Infinite Gallery, Elastic Reel and image-based Particle Morph, while avoiding reuse or redistribution of React Bits Pro implementation or assets.

### Added first-party React components
- \`components/tools/GalleryPhysics.tsx\`
  - **Paperbound:** responsive CSS 3D page turning by swipe/drag or buttons, with reduced-motion handling.
  - **Infinity Corridor:** circular/infinite index mapping with momentum, wheel/keyboard/drag navigation, perspective transforms and abstract first-party poster artworks.
  - **Spring Filmstrip:** original responsive elastic strip, drag inertia and carousel navigation.
  - **Pixel Drift:** Canvas-based 2-image particle morph with image files read from the visitor's device using local object URLs, no upload or API calls, particle budget capped around 1,800, reduced-motion handling and pause control.
- \`components/tools/GalleryPhysicsLab.tsx\`: bilingual experimental demo and GitHub source/CSS links.
- \`components/tools/gallery-physics.css\`: scoped black-white responsive styling.
- \`app/[locale]/tools/gallery-physics/page.tsx\`: bilingual route and SEO metadata; tools-host visible routes would be \`/en/gallery-physics\` or \`/ar/gallery-physics\` after **separate Sites publication**.
- Added main site teaser and dedicated product navigation with language switch.

### Quality status
- Latest implementation commit Vercel check passed after a fix to the one-slide navigation step for inertial galleries.
- Standalone V8 offline browser demo archived as \`rawnak-tools-v8-gallery-physics.zip\` in this conversation; it includes older V7 demo pages. The ZIP checks its JS syntax, relative assets and CRC successfully.
- The sandbox browser blocks local page navigation, so gestures and visual FPS have **not** been verified by automated Chromium test in this turn. Owners should test touch/mouse, mobile performance, accessibility and keyboard behavior before production publishing.
- The offline demo uses *standalone vanilla JS* — it is NOT an exact compiled representation of the React source. It is a behavior preview.
- Pixel Drift operates entirely in the browser; visitors' files are not submitted or persisted by this component. Built-in abstract images are original placeholders.
- Components are **experiments**, not pixel-perfect copies of the referenced Pro examples. Use an independent UI, source and images.

### Production gates
- Verify 3D page transitions and touch gesture cancellation on actual devices.
- Verify inertial gallery stability after rapid repeated swipes.
- Verify image morph quality on portrait/background photo pairs; check canvas allocation and clean up object URLs as controls change.
- Test real device memory/FPS and reduced-motion fallbacks.
- Integrate *full component source* export before advertising one-click standalone exports.
- Preview privately in a separate ChatGPT Site and obtain approval; do not mutate the live Rawnak Group ChatGPT Site.

## V9 — WebGL / Three.js Lab (2026-10-18)

Advanced original interaction direction: mathematical Globe, Inside Dome and Silk Ribbon, inspired by general 3D motion concepts but NOT copied from any React Bits or Pro code/asset.

### First-party implementation
- components/tools/GpuScenes.tsx: original Fibonacci sphere point geometry, geographic grid lines, procedural interior GLSL dome and continuously updated ribbon mesh with spring-following inertia.
- components/tools/GpuCanvas.tsx: lazily loaded R3F/Three.js canvas with resolution quality tiers, rendering pause support and WebGL-context loss handling.
- components/tools/GpuLab.tsx: bilingual editor with drag/pointer interactions, quality controls, play/pause, reduced-motion detection and graceful fallback if WebGL unavailable.
- components/tools/gpu-lab.css and app/[locale]/tools/gpu/page.tsx.
- Landing teaser + localized nav. Intended public URLs on dedicated tools hostname are /en/gpu and /ar/gpu. NOT currently published.

### Offline reviewer
- raw nak tools v9 webgl lab ZIP (file label: rawnak-tools-v9-webgl-lab.zip) is a conversation download. It includes the earlier demos plus a self-contained native WebGL GLSL example of all three interactions, without external dependencies. It is a separate browser preview, NOT an exact exported copy of the R3F source.
- Local HTML, JavaScript syntax and ZIP CRC check pass.
- Headless Chromium in the current environment could NOT initialize EGL/WebGL, so actual GPU rendering, gesture behavior, visual fidelity and frame rates have not been fully browser-verified.
- GitHub/Vercel CI build must be checked separately. Passing a build does not establish visual functionality.

### Mandatory QA gates
1. Test smoothness and context limits on desktop GPU and Android/iOS devices using low-quality mode.
2. Test pointer capture, touch, pause/resume and reduced-motion behavior.
3. Check WebGL context-loss handling and memory disposal across mount/unmount.
4. Upgrade usage snippet to a full verified portable exporter; currently GitHub source links are supplied for reuse.
5. Run real-device visual and accessibility regression checks.
6. Keep this in draft PR; do not publish to the active Rawnak Group ChatGPT Site or connect domain without explicit owner approval.

## V10 — Spectra Motion Lab (2026-10-18)

Approved continuation after V9: build three independent original, more complex interactive motion systems while retaining the monochrome Framer-inspired art direction. No React Bits or React Bits Pro source or assets have been copied.

### New React components / routes
- components/tools/SpectraEffects.tsx: first-party 2D Canvas particle starburst (click/tap bursts, velocity drag, fading trails, configurable particle budget), multi-layer spring ribbon flow with pointer interaction, and a six-sided CSS 3D prism carousel with pointer drag, arrow-key access, on-screen buttons and optional autoplay.
- components/tools/SpectraLab.tsx: context-specific sliders (burst count/power/drag/fade; ribbon width/spring/layers; prism perspective/speed/autoplay), replay/pause, localStorage persistence and portable JSON preset copy/download/import, validation/clamping, bilingual UI, reduced motion.
- components/tools/spectra-lab.css: responsive monochrome editor.
- app/[locale]/tools/spectra/page.tsx: bilingual page, canonical metadata.
- Updated language-switching navigation, Next.js shared CSS imports and Framer-inspired landing teaser.
- Intended public routes: tools.rawnakgroup.com/en/spectra and /ar/spectra **after** a separate ChatGPT Sites port. NOT currently live.

### Offline reviewer & verification
- Conversation artifact: rawnak-tools-v10-spectra-lab.zip (standalone self-contained HTML/CSS/JavaScript behavior preview, plus prior V9 assets/URLs; NOT a build/export of the React implementation).
- The ZIP passed CRC validation, and the standalone JavaScript passed node --check.
- Chromium navigation to file:// and 127.0.0.1 is blocked by the runtime administrator. However, **inline-page Chromium testing** succeeded using the same HTML, CSS and JavaScript loaded into the page in memory, with no JavaScript page errors. Verified starburst pixel changes after tapping the canvas; switching to Ribbon Flow and Prism Carousel; Next slide (01 → 02); actual CSS perspective update; JSON preset download/import roundtrip; pause toggle; mobile at 390px with 0px horizontal overflow.
- The standalone demo is separate from the Next app implementation. Vercel build is a source correctness check, not end-user motion/FPS verification.
- Real device performance, mobile gestures, React integrated browser/visual regression and memory stability remain **not yet fully verified**. Do not call V10 production-ready.
- The original editor from V6 still lists its 96 choices; these 3 advanced effects live in a separate lab until integrated into a shared portable exporter/catalog.

### Release gates
- Test quality and response on Android and desktop hardware and validate accessibility/reduced-motion with physical devices.
- Benchmark and cap particle updates to meet mobile FPS/power targets.
- Create a full standalone React component exporter (currently only source links and portable configuration JSON available).
- Review final visuals; port approved content into a **new ChatGPT Site** and receive explicit owner approval before DNS setup.
- Keep PR draft; do not alter public Rawnak Group ChatGPT Site or tools.rawnakgroup.com.

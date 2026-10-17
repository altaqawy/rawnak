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

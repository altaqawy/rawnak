# Rawnak Original Motions — provenance and expansion plan

## What's shipped in this branch

- **50** independently authored CSS keyframe effects
- **Five categories:** Entrance (16), Typography (10), Hover (11), Continuous (9), Backgrounds (4)
- 100% browser-local preview, search and category filters
- Speed (0.3–8s), easing, accent color, custom text, repeat, replay/pause
- HTML/CSS and React JSX exports
- Favorites persisted locally on the user's device (no server accounts)
- \`/en/tools/animations\` and \`/ar/tools/animations\` internal routes
- \`https://tools.rawnakgroup.com/en/animations\` / \`/ar/animations\` as the **intended** public paths after deployment to the correct platform
- Framer-inspired grayscale presentation, responsive mobile view, prefers-reduced-motion protection

## Original code vs third-party libraries

All 50 effects in \`lib/tools/original-motions.ts\` are original, authored for this project. The exported CSS is not copied from React Bits, Animista, Animate.css or Hover.css. Animation concepts such as sliding, rotating and fading are generic; no protected source or assets from restricted libraries are being redistributed.

Third-party license review (performed Oct 2026):

| Collection | License characteristics | Decision for our redistributable library |
|---|---|---|
| React Bits (free) | Modified MIT / Commons Clause prohibits competing component libraries and redistributed component collections | **Do not redistribute** |
| Motion (core) | MIT license | Potential future engine; keep attribution and check any Motion+ assets separately |
| Animista generated CSS | FreeBSD-style license; source redistributions require notices | Possible with full required notices, but **not copied** in this release |
| Animate.css (current) | Hippocratic License 2.1, not MIT | No code copied; review requirements before adoption |
| Hover.css | Personal/open source usage terms differ from commercial/OEM distribution | No code copied; no commercial repackaging without a suitable license |

Primary license references:
- https://github.com/epodak/reactbits/blob/main/LICENSE.md
- https://github.com/motiondivision/motion
- https://animista.net
- https://github.com/animate-css/animate.css/blob/main/LICENSE
- https://github.com/IanLunn/Hover/blob/master/license.txt

## QA before launch

- [ ] Run \`npm run build\` and \`npm run lint\`, check Next 16 routing on the tools hostname.
- [ ] Test 50 cards (not just the first 15), searches in English and Arabic, filters, keyboard triggers on hover effects, and favorites after reload.
- [ ] Test that changing settings updates **both** visible preview and exported HTML/React source.
- [ ] Run exported snippets in an isolated React demo and plain HTML page, and inspect console output.
- [ ] Check keyboard controls, accessible labels, mobile screens, reduced-motion mode and contrast.
- [ ] Test cross-language links and content on \`/en/animations\` and \`/ar/animations\`.
- [ ] Port the reviewed version to the approved ChatGPT Sites project; the GitHub/Vercel check is **not** equivalent to the Sites deployment.
- [ ] Attach \`tools.rawnakgroup.com\` only using DNS records provided by Sites, not Vercel.
- [ ] Do not merge this draft branch or publish before owner's review.

## Roadmap

1. Add accessibility score and performance badges based on measured tests.
2. Allow saving a named animation preset as JSON.
3. Offer a first-party registry for React components and CSS files.
4. Add scroll-triggered effects with graceful fallback and intersection observers.
5. Preserve quality and maintainability: new effects must be visually distinguishable, keyboard-testable when interactive, original or permissively redistributable, and free of required external commercial dependencies.

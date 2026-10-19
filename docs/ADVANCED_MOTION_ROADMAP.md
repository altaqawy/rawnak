# Advanced Interactions — Reference Audit and Roadmap

This document is for **Rawnak Tools** under Rawnak Group. Reference pages are used to learn generic interactions and motion design; we do not copy component source, assets, branded layouts or React Bits Pro deliverables.

## Source licensing
- Current free React Bits LICENSE: MIT with Commons Clause. Commercial application use is allowed, redistribution of the React Bits components themselves is restricted.
- React Bits Pro prohibits repackaging and exposing its components in a component library. Rawnak's public library therefore has only **independently authored source**, and should use Rawnak naming rather than claiming official React Bits ports.
- Visual comparison of demos is a target, not a claim of byte-for-byte or pixel-for-pixel identical implementation.

## Original prototypes implemented (V7)
| Rawnak prototype | Interaction reference | Current fidelity |
| --- | --- | --- |
| Paper Mill | Shredder | Editable paper dragged into device; individual falling strips; simplified physics |
| Perforated Pass | Tear Ticket | Elastic drag, threshold tear and falling stub; simplified perforation (no fiber simulation) |
| Folded Sheet | Paper Crumple | Pointer-pressure faceted folds and compact ball; not a full deformable 3D paper mesh |
| Branch Navigator | Branched Menu | Expandable hierarchy with active-path links; no custom Bézier connector tracing yet |
| Elastic Rail | Elastic Reel / Flex Carousel | Perspective carousel, swipe thresholds and keyboard controls; no WebGL glass distortion |
| Swipe Notice | Swipe Toast | Trigger, countdown bar, drag-to-dismiss and close; timer pause approximation |
| Bell Pulse | Bell Toggle | Press state, springy bell animation and count |
| Glyph Cloud | Particle Morph | Interactive 2D Canvas glyph-particle morphing; text-shaped targets, not image-based GPU particle morph |

These eight are **experimental first-party prototypes**, not exact clones.

Files:
- `components/tools/AdvancedLab.tsx`
- `components/tools/advanced-lab.css`
- `app/[locale]/tools/advanced/page.tsx`

Planned public URLs (not yet published): `tools.rawnakgroup.com/en/advanced`, `tools.rawnakgroup.com/ar/advanced`.

## Next wave — free React Bits behavior references
Study and independently implement: Thought Line, Prompt Bar, Status Mark, Code Slots, Peek Rating, Flex Carousel improvements, animated prompt workflow, Bell Toggle improvement. Each needs accessibility and accurate export features.

## Next wave — Pro concept references, *not* for copying
- **GPU / heavy simulation:** Particle Morph with image sampling, Infinite Gallery, Globe, Inverted Dome, Ribbon Trail, Star Burst, Particle / mesh physics.
- **Galleries / 3D:** Elastic Reel upgrade, Page Flip, Passage Gallery, Prism Carousel, Gradient Carousel, Spin Shutter, Tilted Tiles, Infinite Gallery.
- **Scroll choreography:** Scroll Portal, Scroll Mask, Scroll Stack, Tile Reveal.
- **Interfaces & data:** Animated List, Credit Card, Simple Graph, Magic Transform.
- **Other:** Inverted Dome, Scroll Portal, Spin Shutter, etc. should each be prototyped and load-tested on mobile, using user-owned images or generated neutral placeholders rather than third-party proprietary assets.

## Quality gates before declaring production-ready
1. Public demo and generated source implement the **same** interaction; code download must be a complete reusable component, not only an import statement.
2. Test mouse, touch, keyboard and pointer cancellation (Firefox / Chromium / Safari when accessible).
3. Test reduced motion, screen-reader accessible controls, timeouts, lifecycle cleanup.
4. Verify actual FPS, mobile power usage, and reduced device quality presets for WebGL/Canvas components.
5. Add visual and gesture regression checks; verify actual custom-domain publication only after migrating to ChatGPT Sites.
6. Keep all changes in GitHub draft PR until approved; no automatic merge to the published Rawnak Group Site.

## References
- https://www.reactbits.dev/c/micro
- https://www.reactbits.dev/components/flex-carousel
- https://github.com/DavidHDev/react-bits/blob/main/LICENSE.md
- https://pro.reactbits.dev/docs/components
- https://pro.reactbits.dev/license

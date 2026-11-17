# RAWNAK FIT AI — Live Virtual Mirror

A privacy-first **live camera + on-device AR tracking** proof of concept for desktop and mobile browsers. Part of the RAWNAK Tools roadmap.

## Open the project

- **App:** [index.html](./index.html)
- **JavaScript source:** [src/app.js](./src/app.js)
- **Responsive design:** [src/styles.css](./src/styles.css)
- **Camera-only troubleshooting:** [diagnostics/camera-only.html](./diagnostics/camera-only.html)
- **Incident log:** [docs/TROUBLESHOOTING.md](./docs/TROUBLESHOOTING.md)
- **Roadmap:** [docs/ROADMAP.md](./docs/ROADMAP.md)

This is a **standalone browser prototype** with no npm install or build required. GitHub won't execute its camera on the code viewer; serve this folder over HTTPS or localhost to try it.

### Run locally

```sh
cd projects/rawnak-fit-ai
python -m http.server 5173
```

Then open `http://localhost:5173` in Chrome/Edge/Safari. For testing on a phone, deploy the directory to an **HTTPS** host such as Cloudflare Pages. Plain `http://192.168.x.x:5173` is not a secure origin and may block camera access. GitHub Pages deployment is not yet enabled.

### What is implemented

- Camera runs independently from MediaPipe initialization. AI model failures **never intentionally shut down the stream**.
- Browser-only video preview, no video upload and no per-frame image generation/token API.
- On-demand **pose, hand, and face** tracking using MediaPipe Tasks Vision 0.10.22 and public model endpoints.
- Live illustrative 2D overlays for shirts, jackets, watches, bracelets, glasses, bags, shoes.
- Switch product without restarting camera; flip mirror, save snapshot, retry model.
- Camera-only diagnostic + CI static checks via GitHub Actions.

### Current limitations

- **This is not realistic photo-quality virtual try-on.** Garments and accessories are simple illustrative overlays with no cloth physics, size guarantees, accurate occlusion, or calibrated product assets.
- CDNs host the model/WASM files; if downloads fail (network, filters, blocking), the app should keep the webcam running.
- The MediaPipe model fetches may be heavy on some mobile devices. Physical device benchmarking is still pending.
- The new independent browser prototype does not import every UI detail from the earlier React ZIP. The GitHub branch is now the **source of truth for future changes**.

## Why the earlier camera shut down

In Alpha 0.1, the camera was coupled to `await tracker.ensure(...)`; failed model initialization stopped webcam tracks from the catch handler. Current code starts the video first, then runs `loadEngine(...)` asynchronously. See [incident analysis](./docs/TROUBLESHOOTING.md).

## Tests

GitHub Actions runs `node --check` and `tests/static-check.mjs`. These are **static checks only**. They do not prove camera reliability on real hardware.

Manual acceptance criteria:
1. Start camera on HTTPS or localhost; keep preview running 30 seconds with the model CDN deliberately blocked.
2. Switch products 20 times without stream interruption.
3. Stop and restart camera 10 times without leaving orphaned tracks.
4. Retry failed model downloads without requesting camera permission again.
5. Test mobile Chrome, Samsung Internet and Safari plus Windows Chrome/Edge.

## Branch and review

Current development branch: `feat/rawnak-fit-ai-alpha-02`. Changes can be proposed through [Pull Request #3](https://github.com/altaqawy/rawnak/pull/3). The primary RAWNAK website is not modified by this app directory unless the PR is merged and a route/deployment is configured.

## Next build priorities

Self-host pinned MediaPipe models, add proper segmentation/3D, garment-transfer engine evaluation, real product import, multi-merchant embed/SDK and performance instrumentation.

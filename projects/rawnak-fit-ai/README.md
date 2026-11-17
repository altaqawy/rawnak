# RAWNAK FIT AI — Live Virtual Try-On (Alpha 0.2)

**Status:** Browser-camera proof of concept · standalone app plan · mobile + desktop.

The goal is a privacy-first live virtual mirror that tracks movement on-device. This is **not** yet accurate garment sizing or realistic 3D cloth simulation.

## Confirmed camera defect in Alpha 0.1

Camera capture was incorrectly coupled to AI model initialization. The old `startCamera()` did this:

1. `getUserMedia()` opens the camera
2. `video.play()`
3. `await tracker.ensure(category)` fetches WASM/model assets
4. If the model fails, the catch block **stops the camera stream**

On some devices, this appears as a camera opening and closing within a second. This is a code-level failure mode; actual hardware reproduction remains pending.

## Fix implemented in the Alpha 0.2 source package

- Open the camera and set LIVE state **before** AI initialization
- Load model asynchronously; never stop healthy camera tracks if tracking fails
- Display clear loading/error states with a model-only retry button
- Cancel stale async operations when switching products or closing camera
- Close MediaPipe instances that finish loading after disposal
- Reset failed WASM resolver promises for recovery
- Handle camera permissions and track-ending events separately
- Throttle detection to roughly 12 Hz, while rendering video continuously
- Include independent `/diagnostics/camera-only.html` with no MediaPipe or React

> The full React Alpha 0.2 source is packaged separately as a downloadable ZIP in the originating ChatGPT conversation. This GitHub branch currently contains the architecture and troubleshooting tracker, not the full runnable React application. Do not treat these documents as a deployment.

## Proposed architecture

```
Browser camera (getUserMedia)
        |
        +--> Raw video preview (must be available immediately)
        |
        +--> MediaPipe model loading (async, optional, retryable)
                     |
                 landmarks
                     |
            2D AR garment overlays

Later:
Lens Studio / Snap Camera Kit for garment transfer and 3D cloth;
hand landmarks + 3D for watches/rings;
merchant product SDK + storefront integrations.
```

## Priorities

1. P0 Validate uninterrupted 30-second camera preview with models intentionally blocked
2. P0 Validate camera permission/device error handling on Android, iOS, Windows
3. P1 Test rapid item switching and asynchronous model disposal
4. P1 Self-host pinned WASM/model files; benchmark frame rates and memory
5. P2 Upgrade from indicative 2D overlays to realistic garment try-on
6. P2 Build reusable store integration SDK and per-store product catalog

See [camera incidents and test plan](./docs/TROUBLESHOOTING.md) and [product roadmap](./docs/ROADMAP.md).

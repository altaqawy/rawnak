# RAWNAK FIT AI — engineering roadmap

## Alpha 0.2: Stabilize camera lifecycle (current)

- Decouple getUserMedia/preview from model initialization
- Make tracking failure recoverable without stopping camera
- Make cleanup safe against asynchronous model completion
- Add independent camera diagnostic and hardware regression tests

## Alpha 0.3: Measurement and robust tracking

- Add hand landmarks for watches, bangles and rings
- Improve tracking jitter with adaptive smoothing and occlusion handling
- Add resolution/FPS telemetry visible to user without storing images
- Move model downloads to version-pinned same-origin assets
- Graceful fallback when AR tracking is unsupported

## Beta: Product fidelity

- Investigate Snap Camera Kit Web and Lens Studio Garment Transfer
- Build merchant asset pipeline for transparent 2D and appropriate 3D models
- Support live upper-body garments first, then bottoms, shoes and bags
- Product calibration by actual SKU and size; avoid inaccurate fit claims
- Benchmark performance on mid-range Android and older iOS devices

## Commercial integration

- Standalone embeddable shop widget and multi-tenant merchant SDK
- Strict browser camera consent and ephemeral, local-first processing
- Optional backend only for merchant catalog/configuration, not live video
- Paid quality mode as an **optional** image-generation step; never per-frame
- Plans, usage metering and merchant analytics only after reliable camera UX

## Acceptance gates

1. 30 seconds of continuous preview when AI model assets fail
2. 10 minutes with stable tracking on each supported device
3. Controlled model retry, with no new camera permission dialog
4. No frame upload; QA verifies network requests
5. Independently benchmark clothing accuracy before any fit-size claims

**Note:** Source ZIP shared separately; this GitHub feature branch is documentation/scoping until the standalone repository is created/imported.

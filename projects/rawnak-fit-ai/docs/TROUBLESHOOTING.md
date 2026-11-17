# Camera incident analysis and regression plan

## P0: camera opens briefly, then turns off

**Verified in old source:** the `startCamera` catch branch shut down tracks after model initialization failed. MediaPipe downloads and camera permission must be independent.

**Implemented in Alpha 0.2 ZIP:** show video immediately; initialize tracking asynchronously; on model failure show a retry button and leave video stream running.

**Test:** block `cdn.jsdelivr.net` or `storage.googleapis.com` in dev tools, start the camera, wait 30 seconds. Preview must continue. Restore connection, retry tracking without reopening camera.

## Other community-reported failure modes

| Failure | Evidence | Proposed mitigation |
| --- | --- | --- |
| Double effect setup/cleanup in React StrictMode | React docs | Request camera only on user action; independent cleanup and epoch tokens |
| Slow first model load | MediaPipe issue #5171 | Show video before model loading; cache model assets later |
| WASM/model request failures | MediaPipe issue #6119 | Distinct model error state, retry, self-host pinned files |
| Browser freezing on MediaPipe `close()` | MediaPipe issue #5718 | Dispose only when ending/switching; test each browser; minimize churn |
| VIDEO mode problems in Android WebView | MediaPipe issue #5618 | Prefer real Android Chrome; run WebView compatibility matrix |
| Camera permission/device busy | MDN getUserMedia | Specific error messages, secure origin, detect ended tracks |
| MediaPipe performance on mobile | MediaPipe pose docs | Use lite model, throttle inference, measure CPU/GPU usage |

## Local test matrix

- Windows 10/11: Chrome + Edge, built-in USB webcams
- Android: Chrome + Samsung Internet, front camera
- iOS: Safari, front camera, `playsInline` enabled
- Explicit permission denied, no camera, device in use
- Offline/blocked model downloads with video preview maintained
- Ten camera start/stop cycles
- Twenty rapid garment switches, including face/pose models
- Continuous 10-minute camera session

**Pass criteria (Alpha 0.2):** camera remains live with tracking disabled, can stop and restart without browser refresh, no orphaned camera track after explicit stop, meaningful errors.

## Diagnostic test

Load `/diagnostics/camera-only.html` over HTTPS from the full local Alpha 0.2 package. If that isolated page works but the main app does not, diagnose React/MediaPipe instead of blaming the webcam.

## References

- https://react.dev/learn/synchronizing-with-effects
- https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia
- https://github.com/google-ai-edge/mediapipe/issues/5171
- https://github.com/google-ai-edge/mediapipe/issues/6119
- https://github.com/google-ai-edge/mediapipe/issues/5718
- https://github.com/google-ai-edge/mediapipe/issues/5618
- https://docs.lensstudio.com/develop/capabilities/ar/try-on/garment-transfer

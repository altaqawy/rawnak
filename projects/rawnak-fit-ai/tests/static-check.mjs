import { readFileSync, existsSync } from 'node:fs';
import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..');
const app = readFileSync(path.join(root, 'src/app.js'), 'utf8');
const html = readFileSync(path.join(root, 'index.html'), 'utf8');
const css = readFileSync(path.join(root, 'src/styles.css'), 'utf8');
assert.ok(existsSync(path.join(root, 'diagnostics/camera-only.html')), 'camera-only diagnostic exists');
for (const marker of ['camera-video','ar-canvas','products','camera-toggle','retry-tracking','capture']) {
  assert.ok(html.includes('id="' + marker + '"'), 'HTML component exists: ' + marker);
}
assert.match(app, /getUserMedia/, 'camera input is requested on user action');
assert.match(app, /state\.stream\s*=\s*stream/, 'camera stream has its own lifecycle');
assert.match(app, /void loadEngine/, 'AI model loading is asynchronous and independent');
assert.match(app, /instance\.close\(\)/, 'late model is disposed after session cancellation');
assert.match(app, /state\.epoch/, 'camera session tokens protect stale requests');
assert.match(app, /requestAnimationFrame/, 'video overlay rendering uses frame loop');
assert.match(app, /pose_landmarker_lite/, 'lite pose model is configured');
assert.match(app, /hand_landmarker/, 'hand tracking is configured');
assert.match(app, /face_landmarker/, 'face tracking is configured');
assert.match(css, /\.camera-layers\.flipped/, 'video and AR overlay are mirrored consistently');
console.log('RAWNAK FIT AI static smoke tests passed (not a real-camera test).');

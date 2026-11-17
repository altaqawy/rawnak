(function fitApp() {
  'use strict';
  const $ = (selector) => document.querySelector(selector);
  const video = $('#camera-video');
  const canvas = $('#ar-canvas');
  const stage = $('#stage');
  const layers = $('#camera-layers');
  const indicator = $('#stream-indicator');
  const trackChip = $('#track-chip');
  const errorBox = $('#camera-error');
  const productsNode = $('#products');
  const cameraToggle = $('#camera-toggle');
  const mainStart = $('#start-main');
  const retryButton = $('#retry-tracking');
  const captureButton = $('#capture');

  const items = [
    { id: 'tee', name: 'تيشيرت كلاسيك', description: 'ملابس · جسم علوي', icon: '👕', engine: 'pose', color: '#c5ed99' },
    { id: 'jacket', name: 'جاكيت', description: 'ملابس · جسم علوي', icon: '🧥', engine: 'pose', color: '#90bfc0' },
    { id: 'watch', name: 'ساعة يد', description: 'إكسسوارات · معصم', icon: '⌚', engine: 'hand', color: '#e7d39d' },
    { id: 'bracelet', name: 'غويشة', description: 'إكسسوارات · معصم', icon: '💍', engine: 'hand', color: '#d9a86f' },
    { id: 'glasses', name: 'نظارة', description: 'إكسسوارات · وجه', icon: '🕶️', engine: 'face', color: '#c7dbea' },
    { id: 'bag', name: 'شنطة كتف', description: 'إكسسوارات · كتف', icon: '👜', engine: 'pose', color: '#cd956f' },
    { id: 'shoes', name: 'أحذية', description: 'ملابس · قدم', icon: '👟', engine: 'pose', color: '#e8e9df' }
  ];

  const state = {
    stream: null, starting: false, epoch: 0, engineRequest: 0,
    selected: items[0], engine: 'idle', models: {}, loading: {},
    vision: null, visionLoading: null, raf: 0, landmarks: null,
    fps: 0, frameCount: 0, lastFps: 0, lastInference: 0, detected: false,
    mirror: true, diagnostic: '', lastType: null, lastPoints: null
  };

  const showError = (message) => {
    errorBox.textContent = message;
    errorBox.classList.remove('hidden');
  };
  const clearError = () => {
    errorBox.textContent = '';
    errorBox.classList.add('hidden');
  };
  const drawCatalog = () => {
    productsNode.textContent = '';
    for (const item of items) {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'product' + (item.id === state.selected.id ? ' selected' : '');
      button.setAttribute('aria-pressed', String(item.id === state.selected.id));
      const icon = document.createElement('span');
      icon.className = 'product-icon';
      icon.textContent = item.icon;
      const info = document.createElement('span');
      const title = document.createElement('strong');
      title.textContent = item.name;
      const subtitle = document.createElement('small');
      subtitle.textContent = item.description;
      info.append(title, subtitle);
      const selectedMark = document.createElement('span');
      selectedMark.className = 'product-indicator';
      selectedMark.textContent = item.id === state.selected.id ? '✓' : '○';
      button.append(icon, info, selectedMark);
      button.addEventListener('click', () => {
        state.selected = item;
        state.landmarks = null;
        state.lastType = null;
        state.lastPoints = null;
        state.detected = false;
        drawCatalog();
        if (state.stream) void loadEngine(item.engine);
        updateUI();
      });
      productsNode.append(button);
    }
  };
  const updateUI = () => {
    const live = Boolean(state.stream);
    $('#stage-placeholder').classList.toggle('hidden', live);
    $('#live-chip').classList.toggle('hidden', !live);
    trackChip.classList.toggle('hidden', !live);
    captureButton.disabled = !live;
    mainStart.disabled = state.starting;
    mainStart.textContent = state.starting ? 'جاري فتح الكاميرا…' : 'فتح الكاميرا';
    cameraToggle.textContent = live ? 'إيقاف الكاميرا' : state.starting ? 'إلغاء التشغيل' : 'تشغيل الكاميرا';
    indicator.textContent = live ? '● CAMERA LIVE' : state.starting ? 'CONNECTING…' : 'CAMERA OFF';
    indicator.style.color = live ? '#c8ee9b' : '#a5bdac';
    if (live) {
      trackChip.textContent = state.engine === 'loading'
        ? 'الكاميرا مستمرة · جاري تحميل نموذج التتبع'
        : state.engine === 'error'
          ? 'الكاميرا مستمرة · نموذج التتبع غير متاح'
          : state.detected ? '✓ تم تتبع الجسم' : 'اظهر الجزء المطلوب من جسمك';
    }
    $('#tracking-status').textContent = 'Tracking ' + state.engine;
    $('#fps').textContent = live ? state.fps + ' FPS' : 'FPS —';
    retryButton.disabled = !live || state.engine === 'loading';
  };

  const sourceType = (category) => category;
  const modelURLs = {
    pose: 'https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task',
    face: 'https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task',
    hand: 'https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task'
  };

  async function getVision() {
    if (!state.visionLoading) {
      state.visionLoading = (async () => {
        const mod = await import('https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.22/+esm');
        const wasm = await mod.FilesetResolver.forVisionTasks('https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.22/wasm');
        return { mod, wasm };
      })().catch((error) => {
        state.visionLoading = null;
        throw error;
      });
    }
    return state.visionLoading;
  }

  async function loadEngine(type) {
    if (!state.stream) return;
    const epoch = state.epoch;
    const request = ++state.engineRequest;
    state.detected = false;
    state.landmarks = null;
    state.engine = 'loading';
    clearError();
    updateUI();
    if (state.models[type]) {
      if (epoch === state.epoch && request === state.engineRequest) state.engine = 'ready';
      updateUI();
      return;
    }
    if (!state.loading[type]) {
      state.loading[type] = (async () => {
        const { mod, wasm } = await getVision();
        const common = { baseOptions: { modelAssetPath: modelURLs[type], delegate: 'CPU' }, runningMode: 'VIDEO' };
        const klass = type === 'pose' ? mod.PoseLandmarker : type === 'face' ? mod.FaceLandmarker : mod.HandLandmarker;
        const options = type === 'pose' ? { ...common, numPoses: 1 }
          : type === 'face' ? { ...common, numFaces: 1 }
            : { ...common, numHands: 1 };
        const instance = await klass.createFromOptions(wasm, options);
        if (epoch !== state.epoch || !state.stream) {
          instance.close();
          return null;
        }
        state.models[type] = instance;
        return instance;
      })().finally(() => { delete state.loading[type]; });
    }
    try {
      const model = await state.loading[type];
      if (model && request === state.engineRequest && epoch === state.epoch) {
        state.engine = 'ready';
        state.lastInference = 0;
        state.lastPoints = null;
        clearError();
      }
    } catch (error) {
      console.error('[RAWNAK FIT] Tracking model error; camera is still running.', error);
      if (request === state.engineRequest && epoch === state.epoch) {
        state.engine = 'error';
        showError('الكاميرا شغالة، لكن تعذر تحميل التتبع. راجع الاتصال بالإنترنت أو مانع الإعلانات واضغط «إعادة التتبع».');
      }
    }
    updateUI();
  }

  function closeModels() {
    for (const model of Object.values(state.models)) {
      try { model.close(); } catch (error) { console.warn('Model disposal warning:', error); }
    }
    state.models = {};
    state.loading = {};
  }
  function stopCamera() {
    ++state.epoch;
    ++state.engineRequest;
    cancelAnimationFrame(state.raf);
    state.raf = 0;
    const stream = state.stream;
    state.stream = null;
    if (stream) stream.getTracks().forEach((track) => { track.onended = null; track.stop(); });
    video.pause();
    video.srcObject = null;
    closeModels();
    const ctx = canvas.getContext('2d');
    if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
    state.starting = false;
    state.engine = 'idle';
    state.landmarks = null;
    state.lastPoints = null;
    state.fps = 0;
    state.detected = false;
    clearError();
    updateUI();
  }

  function friendlyCameraError(error) {
    switch (error && error.name) {
      case 'NotAllowedError':
      case 'PermissionDeniedError': return 'إذن الكاميرا مرفوض. اسمح للموقع بالكاميرا من إعدادات المتصفح.';
      case 'NotReadableError':
      case 'TrackStartError': return 'الكاميرا مشغولة بواسطة تطبيق آخر، اقفله وحاول مرة ثانية.';
      case 'NotFoundError':
      case 'DevicesNotFoundError': return 'لا توجد كاميرا متاحة على هذا الجهاز.';
      case 'OverconstrainedError': return 'الكاميرا لا تدعم الإعدادات المطلوبة. جرّب إعادة تشغيلها.';
      case 'AbortError': return 'المتصفح ألغى فتح الكاميرا. حاول مرة ثانية.';
      default: return 'تعذر تشغيل الكاميرا. تأكد من HTTPS وصلاحيات المتصفح.';
    }
  }

  async function startCamera() {
    if (state.stream || state.starting) return;
    if (!window.isSecureContext || !navigator.mediaDevices?.getUserMedia) {
      showError('الكاميرا تحتاج HTTPS أو localhost، ومتصفح حديث.');
      return;
    }
    const epoch = ++state.epoch;
    state.starting = true;
    state.engine = 'idle';
    clearError();
    updateUI();
    let stream = null;
    try {
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 }, frameRate: { ideal: 24, max: 30 } },
          audio: false
        });
      } catch (error) {
        if (error.name !== 'OverconstrainedError') throw error;
        stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
      }
      if (epoch !== state.epoch) { stream.getTracks().forEach((t) => t.stop()); return; }
      state.stream = stream; // camera is independent of any AI model
      video.srcObject = stream;
      video.muted = true;
      video.playsInline = true;
      await video.play();
      if (epoch !== state.epoch) { stream.getTracks().forEach((t) => t.stop()); return; }
      state.starting = false;
      stream.getVideoTracks().forEach((track) => {
        track.onended = () => {
          if (epoch !== state.epoch) return;
          stopCamera();
          showError('الكاميرا اتفصلت من النظام أو تم استخدامها بواسطة تطبيق آخر.');
        };
      });
      state.lastFps = performance.now();
      state.frameCount = 0;
      state.lastInference = 0;
      updateUI();
      state.raf = requestAnimationFrame(renderLoop);
      void loadEngine(sourceType(state.selected.engine)); // model failures do not close stream
    } catch (error) {
      if (epoch !== state.epoch) return;
      console.error('[RAWNAK FIT] Camera error:', error);
      if (stream) stream.getTracks().forEach((t) => t.stop());
      state.stream = null;
      video.srcObject = null;
      state.starting = false;
      state.engine = 'error';
      showError(friendlyCameraError(error));
      updateUI();
    }
  }

  function smoothing(type, coords) {
    if (!coords) return null;
    if (state.lastType !== type || !state.lastPoints || state.lastPoints.length !== coords.length) {
      state.lastType = type;
      state.lastPoints = coords.map((p) => ({ x: p.x, y: p.y }));
    } else {
      coords.forEach((point, i) => {
        state.lastPoints[i].x += (point.x - state.lastPoints[i].x) * 0.40;
        state.lastPoints[i].y += (point.y - state.lastPoints[i].y) * 0.40;
      });
    }
    return state.lastPoints;
  }
  function detect(frameTime) {
    const type = state.selected.engine;
    const model = state.models[type];
    if (!model || state.engine !== 'ready' || video.readyState < 2 || frameTime - state.lastInference < 95) return;
    state.lastInference = frameTime;
    try {
      const result = model.detectForVideo(video, frameTime);
      const raw = result.landmarks?.[0] || null;
      state.landmarks = smoothing(type, raw);
      state.detected = !!state.landmarks;
    } catch (error) {
      console.error('[RAWNAK FIT] Inference error; preserving camera', error);
      state.engine = 'error';
      state.detected = false;
      state.landmarks = null;
      showError('تعطّل التتبع على هذا الجهاز، لكن الفيديو مستمر. جرّب إعادة التتبع.');
    }
  }

  function setupCanvas() {
    const ratio = Math.min(devicePixelRatio || 1, 2);
    const w = stage.clientWidth, h = stage.clientHeight;
    if (!w || !h) return null;
    const pixelW = Math.round(w * ratio), pixelH = Math.round(h * ratio);
    if (canvas.width !== pixelW || canvas.height !== pixelH) {
      canvas.width = pixelW;
      canvas.height = pixelH;
    }
    const ctx = canvas.getContext('2d');
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    ctx.clearRect(0, 0, w, h);
    return { ctx, w, h };
  }
  function project(point, width, height) {
    if (!point || !video.videoWidth || !video.videoHeight) return null;
    const scale = Math.max(width / video.videoWidth, height / video.videoHeight);
    return {
      x: (width - video.videoWidth * scale) / 2 + point.x * video.videoWidth * scale,
      y: (height - video.videoHeight * scale) / 2 + point.y * video.videoHeight * scale
    };
  }
  function polygon(ctx, points, fill, outline) {
    if (points.some((p) => !p)) return;
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    for (const p of points.slice(1)) ctx.lineTo(p.x, p.y);
    ctx.closePath();
    ctx.fillStyle = fill;
    ctx.strokeStyle = outline;
    ctx.lineWidth = 3;
    ctx.lineJoin = 'round';
    ctx.fill();
    ctx.stroke();
  }
  function drawGarment(ctx, pose, w, h, item) {
    const a = project(pose[11], w, h), b = project(pose[12], w, h);
    const hipA = project(pose[23], w, h), hipB = project(pose[24], w, h);
    if (![a, b, hipA, hipB].every(Boolean)) return;
    const width = Math.hypot(b.x - a.x, b.y - a.y);
    if (width < 30) return;
    const shoulderY = (a.y + b.y) / 2;
    const hipY = (hipA.y + hipB.y) / 2;
    const left = Math.min(a.x, b.x), right = Math.max(a.x, b.x);
    const extra = item.id === 'jacket' ? .19 : .12;
    const fill = item.color + 'd9';
    const points = [
      { x: left, y: shoulderY - width * .12 },
      { x: left - width * .25, y: shoulderY + width * .12 },
      { x: left - width * .22, y: shoulderY + width * .45 },
      { x: left - width * .07, y: shoulderY + width * .44 },
      { x: left - width * extra, y: hipY },
      { x: right + width * extra, y: hipY },
      { x: right + width * .07, y: shoulderY + width * .44 },
      { x: right + width * .22, y: shoulderY + width * .45 },
      { x: right + width * .25, y: shoulderY + width * .12 },
      { x: right, y: shoulderY - width * .12 }
    ];
    ctx.save();
    ctx.shadowColor = '#0008'; ctx.shadowBlur = 16;
    polygon(ctx, points, fill, '#173b2ddd');
    ctx.restore();
    ctx.strokeStyle = '#173b2d';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo((left + right) / 2, shoulderY + 9);
    ctx.lineTo((left + right) / 2, hipY - 4);
    if (item.id === 'jacket') ctx.stroke();
    ctx.fillStyle = '#233828cc';
    ctx.font = '600 ' + Math.max(9, width / 11) + 'px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('RAWNAK FIT', (left + right) / 2, hipY - 17);
  }
  function drawGlasses(ctx, face, w, h) {
    const leftEye = project(face[33], w, h), rightEye = project(face[263], w, h);
    if (!leftEye || !rightEye) return;
    const eyeDistance = Math.hypot(rightEye.x - leftEye.x, rightEye.y - leftEye.y);
    if (eyeDistance < 14) return;
    ctx.save();
    ctx.translate((leftEye.x + rightEye.x) / 2, (leftEye.y + rightEye.y) / 2);
    ctx.rotate(Math.atan2(rightEye.y - leftEye.y, rightEye.x - leftEye.x));
    ctx.strokeStyle = '#222b30'; ctx.fillStyle = '#253b48b9'; ctx.lineWidth = Math.max(2, eyeDistance * .07);
    const radius = eyeDistance * .40;
    for (const side of [-1, 1]) {
      ctx.beginPath();
      ctx.ellipse(side * eyeDistance * .48, 0, radius, radius * .62, 0, 0, 2 * Math.PI);
      ctx.fill(); ctx.stroke();
    }
    ctx.beginPath(); ctx.moveTo(-eyeDistance * .13, -radius * .15);
    ctx.quadraticCurveTo(0, -radius * .55, eyeDistance * .13, -radius * .15); ctx.stroke();
    ctx.restore();
  }
  function drawWrist(ctx, hand, w, h, item) {
    const wrist = project(hand[0], w, h), middle = project(hand[9], w, h);
    if (!wrist || !middle) return;
    const dist = Math.max(16, Math.hypot(wrist.x - middle.x, wrist.y - middle.y));
    ctx.save();
    ctx.translate(wrist.x, wrist.y);
    ctx.rotate(Math.atan2(middle.y - wrist.y, middle.x - wrist.x) - Math.PI / 2);
    ctx.lineWidth = Math.max(3, dist * .17);
    ctx.strokeStyle = item.id === 'watch' ? '#3d4c46' : '#e3b664';
    ctx.beginPath(); ctx.moveTo(-dist * .36, 0); ctx.lineTo(dist * .36, 0); ctx.stroke();
    if (item.id === 'watch') {
      ctx.fillStyle = '#202e2a'; ctx.strokeStyle = '#e7d39d'; ctx.lineWidth = Math.max(2, dist * .05);
      const radius = dist * .28;
      ctx.beginPath(); ctx.arc(0, 0, radius, 0, 2 * Math.PI); ctx.fill(); ctx.stroke();
      ctx.strokeStyle = '#c9f198'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, -radius * .6); ctx.moveTo(0, 0); ctx.lineTo(radius * .5, radius * .15); ctx.stroke();
    } else {
      ctx.lineWidth = Math.max(4, dist * .11);
      ctx.strokeStyle = '#f4d08c'; ctx.beginPath(); ctx.ellipse(0, 0, dist * .33, dist * .19, 0, 0, 2 * Math.PI); ctx.stroke();
    }
    ctx.restore();
  }
  function drawBag(ctx, pose, w, h) {
    const shoulder = project(pose[12], w, h), hip = project(pose[24], w, h), other = project(pose[11], w, h);
    if (!shoulder || !hip || !other) return;
    const width = Math.hypot(other.x - shoulder.x, other.y - shoulder.y);
    const bagW = width * .53, bagH = width * .57;
    const centerX = shoulder.x + (shoulder.x - other.x) * .40;
    const centerY = hip.y - bagH * .25;
    ctx.save();
    ctx.strokeStyle = '#d4ac87'; ctx.lineWidth = Math.max(3, width * .05);
    ctx.beginPath(); ctx.moveTo(shoulder.x, shoulder.y); ctx.lineTo(centerX, centerY - bagH / 2); ctx.stroke();
    ctx.fillStyle = '#b77e55ec'; ctx.strokeStyle = '#f0c594'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.roundRect(centerX - bagW / 2, centerY - bagH / 2, bagW, bagH, bagW * .13); ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#e8cd9a'; ctx.fillRect(centerX - bagW * .08, centerY - bagH * .45, bagW * .16, bagH * .11);
    ctx.restore();
  }
  function drawShoes(ctx, pose, w, h) {
    for (const index of [27, 28]) {
      const ankle = project(pose[index], w, h);
      if (!ankle) continue;
      const width = Math.max(30, w * .075), height = width * .42;
      ctx.fillStyle = '#e4e9e2ef'; ctx.strokeStyle = '#45574a'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.roundRect(ankle.x - width * .5, ankle.y - height * .1, width, height, height / 2); ctx.fill(); ctx.stroke();
      ctx.strokeStyle = '#9aac9b'; ctx.beginPath(); ctx.moveTo(ankle.x - width * .21, ankle.y + height * .12); ctx.lineTo(ankle.x + width * .16, ankle.y + height * .12); ctx.stroke();
    }
  }
  function drawOverlay() {
    const canvasInfo = setupCanvas();
    if (!canvasInfo || !state.detected || !state.landmarks) return;
    const { ctx, w, h } = canvasInfo;
    try {
      if (state.selected.id === 'tee' || state.selected.id === 'jacket') drawGarment(ctx, state.landmarks, w, h, state.selected);
      else if (state.selected.id === 'glasses') drawGlasses(ctx, state.landmarks, w, h);
      else if (state.selected.id === 'watch' || state.selected.id === 'bracelet') drawWrist(ctx, state.landmarks, w, h, state.selected);
      else if (state.selected.id === 'bag') drawBag(ctx, state.landmarks, w, h);
      else if (state.selected.id === 'shoes') drawShoes(ctx, state.landmarks, w, h);
    } catch (error) {
      console.warn('[RAWNAK FIT] AR overlay skipped this frame', error);
    }
  }
  function renderLoop(now) {
    if (!state.stream) return;
    detect(now);
    drawOverlay();
    state.frameCount++;
    if (now - state.lastFps > 1000) {
      state.fps = Math.round(state.frameCount * 1000 / Math.max(1, now - state.lastFps));
      state.frameCount = 0;
      state.lastFps = now;
      updateUI();
    }
    state.raf = requestAnimationFrame(renderLoop);
  }
  function saveSnapshot() {
    if (!state.stream || !video.videoWidth || !video.videoHeight) return;
    const result = document.createElement('canvas');
    result.width = canvas.width || stage.clientWidth;
    result.height = canvas.height || stage.clientHeight;
    const ctx = result.getContext('2d');
    const scale = Math.max(result.width / video.videoWidth, result.height / video.videoHeight);
    const width = video.videoWidth * scale, height = video.videoHeight * scale;
    if (state.mirror) { ctx.translate(result.width, 0); ctx.scale(-1, 1); }
    ctx.drawImage(video, (result.width - width) / 2, (result.height - height) / 2, width, height);
    ctx.drawImage(canvas, 0, 0, result.width, result.height);
    const link = document.createElement('a');
    link.download = 'rawnak-fit-' + Date.now() + '.png';
    link.href = result.toDataURL('image/png');
    link.click();
  }

  mainStart.addEventListener('click', startCamera);
  cameraToggle.addEventListener('click', () => { if (state.stream || state.starting) stopCamera(); else void startCamera(); });
  retryButton.addEventListener('click', () => { if (state.stream) { state.engine = 'idle'; void loadEngine(state.selected.engine); } });
  captureButton.addEventListener('click', saveSnapshot);
  $('#mirror-toggle').addEventListener('click', () => {
    state.mirror = !state.mirror;
    layers.classList.toggle('flipped', state.mirror);
  });
  window.addEventListener('pagehide', stopCamera);
  drawCatalog();
  updateUI();
})();

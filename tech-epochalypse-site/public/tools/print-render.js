(function () {
  'use strict';

  // ── Artwork file mapping ──
  const ARTWORK_FILES = {
    'elon-musk': '/artworks/elon-musk.html',
    'mark-zuckerberg': '/artworks/mark-zuckerberg.html',
    'sam-altman': '/artworks/sam-altman.html',
    'jeff-bezos': '/artworks/jeff-bezos.html',
    'jensen-huang': '/artworks/jensen-huang.html',
    'combined': '/artworks/combined.html',
  };

  // ── Size presets (width x height in portrait) ──
  const SIZE_PRESETS = {
    '1500x2100': [1500, 2100],
    '2400x3000': [2400, 3000],
    '3300x4200': [3300, 4200],
    '4800x6000': [4800, 6000],
  };

  // ── DOM refs ──
  const overlordSelect = document.getElementById('overlord-select');
  const jsonInput = document.getElementById('json-input');
  const jsonBtn = document.getElementById('json-btn');
  const jsonFilename = document.getElementById('json-filename');
  const sizeSelect = document.getElementById('size-select');
  const customSizeRow = document.getElementById('custom-size-row');
  const customWidth = document.getElementById('custom-width');
  const customHeight = document.getElementById('custom-height');
  const orientationRadios = document.querySelectorAll('input[name="orientation"]');
  const resolutionText = document.getElementById('resolution-text');
  const renderBtn = document.getElementById('render-btn');
  const downloadBtn = document.getElementById('download-btn');
  const warning = document.getElementById('warning');
  const previewContainer = document.getElementById('preview-container');
  const previewPlaceholder = document.getElementById('preview-placeholder');
  const previewCanvas = document.getElementById('preview-canvas');
  const statusEl = document.getElementById('status');
  const artworkFrame = document.getElementById('artwork-frame');

  // ── State ──
  let compositionData = null;
  let compositionFilename = '';
  let lastRenderedCanvas = null;
  let lastRenderedFilename = '';

  // ── Helpers ──

  /**
   * Normalize composition JSON from any of the three artwork save formats
   * into the canonical format expected by applyComposition().
   *
   * Format 1 (combined/studio): { version: 1, meshStates, removedAssets, effectControls, camera: { position, target } }
   * Format 2 (elon-musk-print): { version: 'elon-musk-print-v1', pieces, removedAssets, effectControls, camera: { position, rotation } }
   * Format 3 (alpha/v2):        { version: 2, m, rm, fx, cam: { p, t }, i }
   */
  function normalizeComposition(raw) {
    if (!raw || typeof raw !== 'object') {
      throw new Error('Invalid composition: not an object');
    }

    // Already in canonical format (combined/studio)
    if (raw.meshStates) {
      return raw;
    }

    // Format 2: elon-musk-print — uses "pieces" instead of "meshStates"
    if (raw.pieces) {
      return {
        version: 1,
        timestamp: raw.timestamp,
        meshStates: raw.pieces.map(function (p) {
          return {
            id: p.id,
            position: p.position,
            rotation: p.rotation,
            scale: p.scale,
            visible: p.visible,
            currentLayer: p.currentLayer,
            userScale: p.scale ? p.scale.x : 1.0,
            opacity: 1,
            transparent: false,
            isUploaded: false,
          };
        }),
        removedAssets: raw.removedAssets || [],
        effectControls: raw.effectControls || {},
        camera: raw.camera ? {
          position: raw.camera.position,
          target: raw.camera.target || { x: 0, y: 0, z: 0 },
        } : undefined,
      };
    }

    // Format 3: alpha/v2 — compressed keys (m, rm, fx, cam)
    if (raw.version === 2 && raw.m) {
      return {
        version: 1,
        timestamp: raw.t,
        meshStates: raw.m.map(function (s) {
          return {
            id: s.id,
            position: s.p || { x: 0, y: 0, z: 0 },
            rotation: s.r || { x: 0, y: 0, z: 0 },
            visible: s.v !== undefined ? s.v : true,
            userScale: s.s || 1.0,
            currentLayer: s.l,
            opacity: s.o !== undefined ? s.o : 1,
            transparent: s.o !== undefined && s.o < 1,
            isUploaded: !!s.u,
            uploadedImageData: s.img && raw.i ? raw.i[s.img] : undefined,
            initialScale: (s.iw && s.ih) ? { width: s.iw, height: s.ih } : undefined,
          };
        }),
        removedAssets: raw.rm || [],
        effectControls: raw.fx || {},
        camera: raw.cam ? {
          position: raw.cam.p,
          target: raw.cam.t || { x: 0, y: 0, z: 0 },
        } : undefined,
      };
    }

    throw new Error('Unrecognized composition format — missing meshStates, pieces, or m[]');
  }

  function setStatus(text, type) {
    statusEl.textContent = text;
    statusEl.className = type || '';
  }

  function getOrientation() {
    for (const r of orientationRadios) {
      if (r.checked) return r.value;
    }
    return 'portrait';
  }

  function getTargetSize() {
    const val = sizeSelect.value;
    let w, h;
    if (val === 'custom') {
      w = parseInt(customWidth.value, 10) || 3000;
      h = parseInt(customHeight.value, 10) || 4000;
    } else {
      [w, h] = SIZE_PRESETS[val];
    }
    // In portrait, height > width. In landscape, swap.
    if (getOrientation() === 'landscape') {
      return [Math.max(w, h), Math.min(w, h)];
    }
    return [Math.min(w, h), Math.max(w, h)];
  }

  function updateResolutionDisplay() {
    const [w, h] = getTargetSize();
    resolutionText.textContent = w + ' \u00D7 ' + h + ' px';
    // Show warning for very large renders
    warning.style.display = (w * h > 12000000) ? 'block' : 'none';
  }

  function updateRenderBtnState() {
    renderBtn.disabled = !compositionData;
    downloadBtn.disabled = !lastRenderedCanvas;
  }

  function generateFilename(overlord, w, h) {
    const date = new Date().toISOString().slice(0, 10);
    return overlord + '_print_' + date + '_' + w + 'x' + h + '.png';
  }

  // ── Effect application ──
  // The artwork uses <script type="module"> so internal variables (effectControls,
  // controls, pass objects) are NOT accessible on window. Only scene, camera,
  // renderer, and composer are exposed. We access effect passes via composer.passes
  // (by known index order) and overlay meshes via scene.children (by userData.id).

  /**
   * Apply the full composition state to the artwork loaded in the iframe.
   * This mirrors the restoreComposition logic from the studio version.
   */
  function applyComposition(win, data) {
    const scene = win.scene;
    const camera = win.camera;
    const renderer = win.renderer;
    const composer = win.composer;

    if (!scene || !camera || !renderer) {
      throw new Error('Artwork scene not ready — scene, camera, or renderer not found.');
    }

    // 1. Remove assets listed in removedAssets
    if (data.removedAssets && data.removedAssets.length > 0) {
      data.removedAssets.forEach(function (id) {
        const mesh = scene.children.find(function (c) {
          return c.userData && c.userData.id === id;
        });
        if (mesh) {
          scene.remove(mesh);
        }
      });
    }

    // 2. Apply mesh states (position, rotation, visibility, scale, opacity, layer)
    if (data.meshStates) {
      data.meshStates.forEach(function (state) {
        if (state.isUploaded) return; // Skip uploaded assets (custom user images)
        const mesh = scene.children.find(function (c) {
          return c.userData && c.userData.id === state.id;
        });
        if (!mesh) return;

        mesh.position.set(state.position.x, state.position.y, state.position.z);
        mesh.rotation.set(state.rotation.x, state.rotation.y, state.rotation.z);
        mesh.visible = state.visible;
        mesh.userData.currentLayer = state.currentLayer;

        if (state.opacity !== undefined && mesh.material) {
          mesh.material.opacity = state.opacity;
          mesh.material.transparent = state.transparent !== undefined ? state.transparent : (state.opacity < 1);
          mesh.material.needsUpdate = true;
        }

        // Apply user scale via mesh.scale (simpler than replacing geometry
        // and doesn't require access to the iframe's THREE constructor)
        if (state.userScale && state.userScale !== 1.0) {
          mesh.scale.set(state.userScale, state.userScale, 1);
          mesh.userData.userScale = state.userScale;
        }
      });
    }

    // 3. Apply effect controls
    applyEffects(win, data.effectControls || {});

    // 4. Set camera position and target
    // Note: OrbitControls is module-scoped and not accessible from outside.
    // We set camera.position and camera.lookAt directly. For a static single-frame
    // render this is sufficient — we don't need OrbitControls' damping/limits.
    if (data.camera) {
      if (data.camera.position) {
        camera.position.set(data.camera.position.x, data.camera.position.y, data.camera.position.z);
      }
      if (data.camera.target) {
        camera.lookAt(data.camera.target.x, data.camera.target.y, data.camera.target.z);
      }
      camera.updateProjectionMatrix();
    }
  }

  /**
   * Apply effect controls by enabling/disabling the correct passes and overlay meshes.
   * This replicates the complex button-toggle logic from the artwork code.
   */
  function applyEffects(win, ec) {
    const composer = win.composer;
    const renderer = win.renderer;
    const scene = win.scene;

    // Simple pass-based effects mapped to composer pass indices.
    // The artwork adds passes in this order after the RenderPass (index 0):
    // 1: greyscale, 2: threshold, 3: shadow(dark), 4: pixelation,
    // 5: glitch, 6: matrix, 7: ascii, 8: xray, 9: heatmap, 10: blood, 11: cctvFeed
    const simplePassEffects = [
      'greyscale', 'threshold', 'shadow', 'pixelation',
      'glitch', 'matrix', 'ascii', 'xray',
      'heatmap', 'blood', 'cctvFeed'
    ];

    // First, reset all post-processing passes to disabled
    if (composer && composer.passes) {
      composer.passes.forEach(function (pass, i) {
        if (i > 0) pass.enabled = false;
      });
    }

    // Enable each simple pass that's true in the saved effectControls.
    // The JSON saves the "final" state including compound effects already expanded
    // (e.g., surveillance: true will also have heatmap: true, glitch: true, etc.)
    simplePassEffects.forEach(function (name) {
      if (!ec[name]) return;
      const pass = getPassFromComposer(composer, name);
      if (pass) {
        pass.enabled = true;
        // Set uniforms for parameterized effects
        if (name === 'threshold' && pass.uniforms && pass.uniforms.threshold) {
          pass.uniforms.threshold.value = ec.thresholdValue !== undefined ? ec.thresholdValue : 0.4;
        }
        if (name === 'shadow' && pass.uniforms) {
          if (pass.uniforms.threshold) pass.uniforms.threshold.value = ec.thresholdValue !== undefined ? ec.thresholdValue : 0.4;
          if (pass.uniforms.brightnessMultiplier) pass.uniforms.brightnessMultiplier.value = ec.shadowBrightness !== undefined ? ec.shadowBrightness : 0.033;
        }
        if (name === 'pixelation' && pass.uniforms && pass.uniforms.pixelSize) {
          pass.uniforms.pixelSize.value = ec.pixelSize !== undefined ? ec.pixelSize : 8.0;
        }
        if (name === 'ascii' && pass.uniforms && pass.uniforms.pixelSize) {
          pass.uniforms.pixelSize.value = ec.pixelSize !== undefined ? ec.pixelSize : 8.0;
        }
      }
    });

    // Overlay meshes visibility (these are scene children, not composer passes)
    setMeshVisibility(scene, 'marqueeTextMesh', !!(ec.xray || ec.marqueeText));
    setMeshVisibility(scene, 'biometricMarqueeTextMesh',
      !!(ec.biometricMarquee || ec.og || ec.hacker || ec.surveillance || ec.greed));
    setMeshVisibility(scene, 'bloodTextMesh', !!(ec.bloodText || ec.greed));
    setMeshVisibility(scene, 'redactedGlitchTextMesh', !!ec.redactedGlitch);

    // Redaction rectangles
    setMeshVisibility(scene, 'rightEyeRedactionRect', !!(ec.redacted || ec.redactedGlitch));
    setMeshVisibility(scene, 'leftEyeRedactionRect', !!(ec.redacted || ec.redactedGlitch));

    // Background color based on active effects
    var needsBlack = ec.shadow || ec.threshold || ec.anon || ec.matrix || ec.ascii || ec.og;
    if (ec.redactedGlitch) {
      renderer.setClearColor(0xFFAC1C); // Orange
    } else if (needsBlack) {
      renderer.setClearColor(0x000000); // Black
    } else {
      renderer.setClearColor(0x1e1e1e); // Default dark gray
    }
  }

  /**
   * Find a specific effect pass in the composer by matching known pass order.
   * The artwork adds passes in a specific order after the RenderPass:
   * 1: greyscale, 2: threshold, 3: shadow(dark), 4: pixelation,
   * 5: glitch, 6: matrix, 7: ascii, 8: xray, 9: heatmap, 10: blood, 11: cctvFeed
   */
  function getPassFromComposer(composer, effectName) {
    if (!composer || !composer.passes) return null;

    const passOrder = [
      'greyscale', 'threshold', 'shadow', 'pixelation',
      'glitch', 'matrix', 'ascii', 'xray',
      'heatmap', 'blood', 'cctvFeed'
    ];

    const index = passOrder.indexOf(effectName);
    if (index === -1) return null;

    // Pass index is offset by 1 because index 0 is RenderPass
    const passIndex = index + 1;
    if (passIndex < composer.passes.length) {
      return composer.passes[passIndex];
    }
    return null;
  }

  /**
   * Set visibility on a scene mesh found by its userData.id
   */
  function setMeshVisibility(scene, meshId, visible) {
    if (!scene) return;
    const mesh = scene.children.find(function (c) {
      return c.userData && c.userData.id === meshId;
    });
    if (mesh) {
      mesh.visible = visible;
    }
  }

  // ── Render pipeline ──

  /**
   * Load the artwork in the iframe and wait for it to be fully initialized.
   * Returns a promise that resolves with the iframe's contentWindow.
   */
  function loadArtwork(overlord) {
    return new Promise(function (resolve, reject) {
      const artworkPath = ARTWORK_FILES[overlord];
      if (!artworkPath) {
        reject(new Error('Unknown overlord: ' + overlord));
        return;
      }

      // Set iframe to a reasonable size for initial loading
      artworkFrame.style.width = '800px';
      artworkFrame.style.height = '600px';

      artworkFrame.onload = function () {
        // The artwork exposes globals via setTimeout(..., 1000).
        // We poll until scene/camera/renderer are available.
        let attempts = 0;
        const maxAttempts = 30; // 15 seconds max wait

        function checkReady() {
          attempts++;
          const win = artworkFrame.contentWindow;
          if (win && win.scene && win.camera && win.renderer && win.composer) {
            // Give textures a moment to finish loading
            setTimeout(function () { resolve(win); }, 2000);
            return;
          }
          if (attempts >= maxAttempts) {
            reject(new Error('Artwork failed to initialize after ' + (maxAttempts / 2) + ' seconds.'));
            return;
          }
          setTimeout(checkReady, 500);
        }

        checkReady();
      };

      artworkFrame.onerror = function () {
        reject(new Error('Failed to load artwork page.'));
      };

      artworkFrame.src = artworkPath;
    });
  }

  /**
   * Perform the high-resolution render and show preview.
   */
  async function performRender() {
    const overlord = overlordSelect.value;
    const [targetW, targetH] = getTargetSize();

    renderBtn.disabled = true;
    renderBtn.classList.add('rendering');
    renderBtn.textContent = 'RENDERING...';
    lastRenderedCanvas = null;
    lastRenderedFilename = '';
    downloadBtn.disabled = true;

    try {
      // Step 1: Load artwork
      setStatus('Loading ' + overlord + ' artwork...', 'loading');
      const win = await loadArtwork(overlord);

      // Stop the artwork's animation loop to prevent it from rendering over our
      // print frame. Override requestAnimationFrame so no new frames get scheduled.
      // The current frame may still execute once, but after that the loop halts.
      win.requestAnimationFrame = function () { return 0; };
      // Wait one frame for the loop to stop
      await new Promise(function (r) { setTimeout(r, 100); });

      // Step 2: Apply composition
      setStatus('Applying composition...', 'loading');
      applyComposition(win, compositionData);

      // Step 2b: Sync the artwork's internal effectControls and run one animation
      // frame so that canvas-based text textures (bloodText, biometricMarquee,
      // redactedGlitch, marquee) get drawn. The create*Texture() functions only
      // allocate empty canvases — the actual text is rendered by update*Texture()
      // which runs inside animate() gated on effectControls flags.
      var ec = compositionData.effectControls || {};
      if (win.effectControls) {
        for (var key in ec) {
          if (ec.hasOwnProperty(key)) {
            win.effectControls[key] = ec[key];
          }
        }
      }
      if (typeof win.animate === 'function') {
        win.animate(performance.now());
      }

      // Step 3: Resize renderer to target resolution
      setStatus('Rendering at ' + targetW + '×' + targetH + '...', 'loading');

      const renderer = win.renderer;
      const camera = win.camera;
      const composer = win.composer;

      // Update renderer size
      renderer.setSize(targetW, targetH);
      renderer.setPixelRatio(1);

      // Update camera aspect ratio
      camera.aspect = targetW / targetH;
      camera.updateProjectionMatrix();

      // Update composer size
      if (composer) {
        composer.setSize(targetW, targetH);
      }

      // Update resolution-dependent shader uniforms
      if (composer && composer.passes) {
        composer.passes.forEach(function (pass) {
          if (pass.uniforms && pass.uniforms.resolution) {
            pass.uniforms.resolution.value.set(targetW, targetH);
          }
        });
      }

      // Step 4: Render one frame
      // Give a small delay for any pending texture updates
      await new Promise(function (r) { setTimeout(r, 500); });

      if (composer) {
        composer.render();
      } else {
        renderer.render(win.scene, camera);
      }

      // Step 5: Show preview
      const canvas = renderer.domElement;
      const filename = generateFilename(overlord, targetW, targetH);

      showPreview(canvas);

      // Store for download
      lastRenderedCanvas = canvas;
      lastRenderedFilename = filename;

      setStatus('Render complete — click Download PNG to save', 'success');

    } catch (err) {
      console.error('Render failed:', err);
      setStatus('Error: ' + err.message, 'error');
    } finally {
      renderBtn.disabled = false;
      renderBtn.classList.remove('rendering');
      renderBtn.textContent = 'RENDER';
      updateRenderBtnState();
    }
  }

  /**
   * Download the last rendered canvas as PNG.
   */
  async function performDownload() {
    if (!lastRenderedCanvas) return;

    downloadBtn.disabled = true;
    downloadBtn.textContent = 'EXPORTING...';

    try {
      setStatus('Exporting PNG...', 'loading');

      const blob = await new Promise(function (resolve, reject) {
        try {
          lastRenderedCanvas.toBlob(function (b) {
            if (b) resolve(b);
            else reject(new Error('Canvas toBlob returned null — the render may have exceeded GPU memory.'));
          }, 'image/png');
        } catch (e) {
          reject(e);
        }
      });

      // Trigger download
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = lastRenderedFilename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setStatus('Download ready: ' + lastRenderedFilename, 'success');

    } catch (err) {
      console.error('Download failed:', err);
      setStatus('Error: ' + err.message, 'error');
    } finally {
      downloadBtn.disabled = false;
      downloadBtn.textContent = 'DOWNLOAD PNG';
    }
  }

  /**
   * Show a scaled-down preview of the rendered canvas.
   */
  function showPreview(sourceCanvas) {
    previewPlaceholder.style.display = 'none';
    previewCanvas.style.display = 'block';

    // Scale to fit the preview container
    const maxW = previewContainer.clientWidth - 20;
    const maxH = 500;
    const scale = Math.min(maxW / sourceCanvas.width, maxH / sourceCanvas.height, 1);

    previewCanvas.width = Math.round(sourceCanvas.width * scale);
    previewCanvas.height = Math.round(sourceCanvas.height * scale);

    const ctx = previewCanvas.getContext('2d');
    ctx.drawImage(sourceCanvas, 0, 0, previewCanvas.width, previewCanvas.height);
  }

  // ── Event listeners ──

  jsonBtn.addEventListener('click', function () {
    jsonInput.click();
  });

  jsonInput.addEventListener('change', function (e) {
    const file = e.target.files[0];
    if (!file) return;

    compositionFilename = file.name;
    jsonFilename.textContent = file.name;
    jsonFilename.classList.add('has-file');

    const reader = new FileReader();
    reader.onload = function (evt) {
      try {
        var raw = JSON.parse(evt.target.result);
        compositionData = normalizeComposition(raw);
        setStatus('Composition loaded: ' + compositionData.meshStates.length + ' layers', '');
        updateRenderBtnState();
      } catch (err) {
        compositionData = null;
        setStatus('Error: Invalid JSON — ' + err.message, 'error');
        updateRenderBtnState();
      }
    };
    reader.readAsText(file);
  });

  sizeSelect.addEventListener('change', function () {
    customSizeRow.style.display = sizeSelect.value === 'custom' ? 'flex' : 'none';
    updateResolutionDisplay();
  });

  customWidth.addEventListener('input', updateResolutionDisplay);
  customHeight.addEventListener('input', updateResolutionDisplay);

  orientationRadios.forEach(function (r) {
    r.addEventListener('change', updateResolutionDisplay);
  });

  renderBtn.addEventListener('click', function () {
    if (!compositionData) return;
    performRender();
  });

  downloadBtn.addEventListener('click', function () {
    if (!lastRenderedCanvas) return;
    performDownload();
  });

  // ── Init ──
  updateResolutionDisplay();
  updateRenderBtnState();

})();

/* =========================================================================
   The mark, in the round (v3.102, Oct 2026)
   Harsh, with the 98 as a 3D model: "use the 3D logo on the top - let people
   spin it around it's axis".

   The landing's big 98 (.hero-mark > img.mark98) becomes the model in
   assets/98-3d.glb, drawn on a canvas laid over the flat mark and exactly
   its size at rest. Drag it sideways and it turns about its upright axis; let
   go and it coasts, slows, and comes back round to face front, so the mark is
   never left edge-on or reading backwards. Left alone it sways a few degrees.

   No library: one mesh, one shader, plain WebGL. The flat PNG stays in the
   page and stays the mark wherever this cannot run (no WebGL, the file does
   not arrive, the context is lost): it is only hidden once a frame of the
   model is on screen.

   The model is white over the film. While a hover has a light picture up
   (#top.previewing.pv-light, Marketing's tiny people) it turns to ink, as
   the flat mark did through its difference blend.

   Loaded async from the <head>, so the model is asked for while the page is
   still arriving and is usually there when the preloader lifts; nothing is
   fetched where there is no WebGL to draw it with.

   To change the model: run the new export through Workshop/build_mesh.py and
   replace assets/98-3d.glb with what it writes. The loader is small on
   purpose. It reads an uncompressed .glb of triangles with positions, normals
   and indices, centres it and fits it to the mark's box, and takes COLOR_0's
   red as baked occlusion; it does not read sparse accessors, and it expects
   transforms applied (a rotated node is fitted loosely, a mirrored or
   unevenly scaled one shades wrong). A file it cannot draw leaves the flat
   mark up. On the script tag, data-glb names another file and
   data-sway="off" stops the idle sway ("on" keeps it whatever the frame rate).
   ========================================================================= */
(function () {
  'use strict';
  if (!window.fetch || !window.requestAnimationFrame || !window.Float32Array) return;

  var me = document.currentScript;
  var SRC = (me && me.getAttribute('data-glb')) || 'assets/98-3d.glb';
  var SWAYS = (me && me.getAttribute('data-sway')) || 'auto';     /* auto | on | off */
  var mq = window.matchMedia ? window.matchMedia('(prefers-reduced-motion: reduce)') : null;
  var reduce = !!(mq && mq.matches);

  /* ---- the stage ----
     The canvas is larger than the flat mark's box (the page's CSS, .mark98-gl)
     so the near end of the mark has room as it swings toward the camera, and
     so there is something to get hold of on a phone. */
  var DIST = 6.2;            /* camera distance, in half-widths of the mark */

  /* ---- the turn ---- */
  var FRICTION = 1.5;        /* 1/s: how quickly a flick dies away */
  var HOME_BELOW = 1.1;      /* rad/s: let go slower than this, it is not a throw */
  var LANDING = 0.6;         /* rad: this close to front, a spin is handed to the spring */
  var SPRING = 26, DAMP = 2 * Math.sqrt(SPRING) * 0.92;   /* the pull to front, a touch under critical */
  var MAX_SPIN = 24;         /* rad/s: a ceiling on a wild flick (under four turns a second) */
  var SWAY = 0.19, SWAY_T = 8.5;                         /* rad, seconds: the idle sway */
  var INTRO_TURNS = 1, INTRO_T = 1.9;                    /* the entrance: one turn in */
  var REVEAL = 1100;         /* ms: the hero's own fade-up (.rev is 1s), which a late model waits out */
  var TAU = Math.PI * 2;

  var cv = document.createElement('canvas');
  var GLOPT = { alpha: true, antialias: true, premultipliedAlpha: true, depth: true, stencil: false, powerPreference: 'low-power' };
  var gl = null;
  try { gl = cv.getContext('webgl', GLOPT) || cv.getContext('experimental-webgl', GLOPT); } catch (e) { gl = null; }
  if (!gl) return;            /* the flat mark stays, and the model is never asked for */

  /* ---------------------------------------------------------------- shaders */
  var VS = [
    'attribute vec3 aP; attribute vec3 aN; attribute vec4 aC;',
    'uniform mat4 uM; uniform vec2 uTurn; uniform vec3 uProj; uniform vec2 uZ;',   /* uProj: x scale, y scale, camera distance */
    'varying vec3 vN; varying vec3 vV; varying float vA;',
    'void main(){',
    '  vec4 p = uM * vec4(aP, 1.0);',
    '  vec3 n = mat3(uM[0].xyz, uM[1].xyz, uM[2].xyz) * aN;',          /* uniform scale only: no inverse-transpose */
    '  float c = uTurn.x, s = uTurn.y;',
    '  p.xz = vec2(p.x * c + p.z * s, p.z * c - p.x * s);',            /* about the upright axis */
    '  n.xz = vec2(n.x * c + n.z * s, n.z * c - n.x * s);',
    '  vN = n; vA = aC.r;',
    '  vV = vec3(p.xy, p.z - uProj.z);',                                /* eye space: the camera sits at +z */
    '  float w = uProj.z - p.z;',
    '  gl_Position = vec4(p.x * uProj.x * uProj.z, p.y * uProj.y * uProj.z, uZ.x * w + uZ.y, w);',
    '}'
  ].join('\n');

  var FS = [
    '#ifdef GL_FRAGMENT_PRECISION_HIGH',
    'precision highp float;',
    '#else',
    'precision mediump float;',
    '#endif',
    'uniform float uTone;',                                             /* 0 white over the film, 1 ink on a light ground */
    'varying vec3 vN; varying vec3 vV; varying float vA;',
    /* a small studio to reflect: a broad soft light overhead, a strip to the
       left, a faint kick from behind on the right, a dim floor */
    'float studio(vec3 r){',
    '  float over = smoothstep(0.05, 0.95, r.y);',
    '  float strip = smoothstep(0.62, 0.97, dot(r, normalize(vec3(-0.78, 0.36, 0.52))));',
    '  float kick = smoothstep(0.70, 1.0, dot(r, normalize(vec3(0.86, 0.22, -0.46))));',
    '  return 0.05 + 0.62 * over + 0.95 * strip + 0.5 * kick;',
    '}',
    'void main(){',
    '  vec3 n = normalize(vN); vec3 v = normalize(-vV);',
    '  float nv = clamp(dot(n, v), 0.0, 1.0);',
    '  float ao = mix(1.0, vA, 0.9);',                                  /* baked: the folds where the stroke crosses itself */
    '  vec3 key = normalize(vec3(-0.46, 0.74, 0.50));',
    '  float kd = clamp((dot(n, key) + 0.32) / 1.32, 0.0, 1.0);',
    '  float fill = clamp(dot(n, normalize(vec3(0.72, -0.10, 0.68))), 0.0, 1.0);',
    '  float hemi = mix(0.24, 0.80, n.y * 0.5 + 0.5);',
    '  float light = (hemi * 0.60 + kd * 0.64 + fill * 0.08 + nv * nv * 0.14) * ao;',
    '  float fr = pow(1.0 - nv, 5.0);',
    '  float gloss = studio(reflect(-v, n));',
    /* white: almost all diffuse, a breath of sheen */
    '  vec3 white = vec3(0.905, 0.905, 0.885) * light + vec3(gloss) * (0.035 + 0.20 * fr) * ao;',
    /* ink: carbon, read through what it reflects */
    '  vec3 ink = vec3(0.0042, 0.0042, 0.0046) * (0.6 + light) + vec3(gloss) * (0.050 + 0.42 * fr) * mix(0.55, 1.0, ao);',
    '  vec3 col = mix(white, ink, uTone);',
    '  col = pow(clamp(col, 0.0, 1.0), vec3(0.4545));',
    '  gl_FragColor = vec4(col, 1.0);',
    '}'
  ].join('\n');

  /* ------------------------------------------------------------------- glb */
  function mul(a, b) {          /* 4x4, column-major: a * b */
    var o = new Float32Array(16), i, j, k, s;
    for (i = 0; i < 4; i++) for (j = 0; j < 4; j++) { s = 0; for (k = 0; k < 4; k++) s += a[k * 4 + j] * b[i * 4 + k]; o[i * 4 + j] = s; }
    return o;
  }
  function nodeMatrix(n) {
    if (n.matrix) return new Float32Array(n.matrix);
    var t = n.translation || [0, 0, 0], q = n.rotation || [0, 0, 0, 1], s = n.scale || [1, 1, 1];
    var x = q[0], y = q[1], z = q[2], w = q[3];
    return new Float32Array([
      (1 - 2 * (y * y + z * z)) * s[0], (2 * (x * y + z * w)) * s[0], (2 * (x * z - y * w)) * s[0], 0,
      (2 * (x * y - z * w)) * s[1], (1 - 2 * (x * x + z * z)) * s[1], (2 * (y * z + x * w)) * s[1], 0,
      (2 * (x * z + y * w)) * s[2], (2 * (y * z - x * w)) * s[2], (1 - 2 * (x * x + y * y)) * s[2], 0,
      t[0], t[1], t[2], 1]);
  }
  var COMPS = { SCALAR: 1, VEC2: 2, VEC3: 3, VEC4: 4 };
  var NORM = { 5120: 127, 5121: 255, 5122: 32767, 5123: 65535 };

  function parse(buf) {
    var dv = new DataView(buf);
    if (dv.byteLength < 28 || dv.getUint32(0, true) !== 0x46546C67 || dv.getUint32(4, true) !== 2) throw new Error('not a glb');
    var jl = dv.getUint32(12, true);
    if (dv.getUint32(16, true) !== 0x4E4F534A || 20 + jl + 8 > dv.byteLength) throw new Error('glb: no JSON');
    var bytes = new Uint8Array(buf, 20, jl), txt, i;
    if (window.TextDecoder) txt = new TextDecoder('utf-8').decode(bytes);
    else { txt = ''; for (i = 0; i < bytes.length; i++) txt += String.fromCharCode(bytes[i]); }
    var g = JSON.parse(txt), binAt = 20 + jl + 8;
    if (dv.getUint32(20 + jl + 4, true) !== 0x004E4942) throw new Error('glb: no BIN');
    var binLen = dv.getUint32(20 + jl, true);
    if (binAt + binLen > dv.byteLength) throw new Error('glb: cut short');
    (g.extensionsRequired || []).forEach(function (x) { if (x !== 'KHR_mesh_quantization') throw new Error('glb: needs ' + x); });

    var parts = [], lo = [1e9, 1e9, 1e9], hi = [-1e9, -1e9, -1e9];
    function view(ai) {
      var a = g.accessors[ai], b = a && g.bufferViews[a.bufferView];
      if (!a || !b || b.buffer) throw new Error('glb: data outside the file');
      if (a.sparse) throw new Error('glb: sparse accessors are not read');
      if ((b.byteOffset || 0) + b.byteLength > binLen) throw new Error('glb: cut short');
      return { a: a, b: b, at: binAt + (b.byteOffset || 0) };
    }
    function walk(ni, parent) {
      var n = g.nodes[ni], m = mul(parent, nodeMatrix(n));
      if (n.mesh != null) g.meshes[n.mesh].primitives.forEach(function (pr) {
        if (pr.mode != null && pr.mode !== 4) return;
        var at = pr.attributes;
        if (at.POSITION == null || at.NORMAL == null || pr.indices == null) throw new Error('glb: needs positions, normals and indices');
        var P = view(at.POSITION), k = P.a.normalized ? 1 / NORM[P.a.componentType] : 1, c, d, x, y, z, e;
        if (!P.a.min || !P.a.max) throw new Error('glb: positions without bounds');
        for (c = 0; c < 8; c++) {                 /* the eight corners of its box, through the node */
          x = (c & 1 ? P.a.max[0] : P.a.min[0]) * k; y = (c & 2 ? P.a.max[1] : P.a.min[1]) * k; z = (c & 4 ? P.a.max[2] : P.a.min[2]) * k;
          e = [m[0] * x + m[4] * y + m[8] * z + m[12], m[1] * x + m[5] * y + m[9] * z + m[13], m[2] * x + m[6] * y + m[10] * z + m[14]];
          for (d = 0; d < 3; d++) { if (e[d] < lo[d]) lo[d] = e[d]; if (e[d] > hi[d]) hi[d] = e[d]; }
        }
        parts.push({ m: m, P: P, N: view(at.NORMAL), C: at.COLOR_0 != null ? view(at.COLOR_0) : null, I: view(pr.indices) });
      });
      (n.children || []).forEach(function (c) { walk(c, m); });
    }
    var id = new Float32Array([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]);
    ((g.scenes && g.scenes[g.scene || 0]) || { nodes: [] }).nodes.forEach(function (ni) { walk(ni, id); });
    if (!parts.length || !(hi[0] > lo[0]) || !(hi[1] > lo[1])) throw new Error('glb: nothing to draw');
    return { buf: buf, parts: parts, lo: lo, hi: hi };
  }

  /* -------------------------------------------------------------------- gl */
  var host = null, flat = null, top = null;        /* .hero-mark, its img, #top: found when the page has them */
  var model = null, prog = null, loc = null, bufs = [], lost = false, ready = false, dead = false;   /* dead: it failed, and is not tried again */

  function compile(type, src) {
    var s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s) || 'shader');
    return s;
  }
  function build() {
    prog = gl.createProgram();
    gl.attachShader(prog, compile(gl.VERTEX_SHADER, VS)); gl.attachShader(prog, compile(gl.FRAGMENT_SHADER, FS));
    gl.bindAttribLocation(prog, 0, 'aP'); gl.bindAttribLocation(prog, 1, 'aN'); gl.bindAttribLocation(prog, 2, 'aC');
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(prog) || 'link');
    gl.useProgram(prog);
    loc = { M: gl.getUniformLocation(prog, 'uM'), turn: gl.getUniformLocation(prog, 'uTurn'), proj: gl.getUniformLocation(prog, 'uProj'),
      z: gl.getUniformLocation(prog, 'uZ'), tone: gl.getUniformLocation(prog, 'uTone') };

    /* centre the model and fit it: its width is the flat mark's width, unless
       it is taller than the mark's box, in which case its height is. One unit
       of the fitted model is then half the flat mark's width. */
    var w = model.hi[0] - model.lo[0], h = model.hi[1] - model.lo[1];
    var box = (flat.naturalHeight && flat.naturalWidth) ? flat.naturalHeight / flat.naturalWidth : (host.clientHeight / host.clientWidth) || 0.634;
    var k = Math.min(2 / w, 2 * box / h);
    var fit = new Float32Array([k, 0, 0, 0, 0, k, 0, 0, 0, 0, k, 0,
      -k * (model.lo[0] + model.hi[0]) / 2, -k * (model.lo[1] + model.hi[1]) / 2, -k * (model.lo[2] + model.hi[2]) / 2, 1]);

    var cache = {};
    function buffer(v, target) {                  /* one GL buffer per bufferView and use */
      var key = target + ':' + v.a.bufferView;
      if (!cache[key]) {
        cache[key] = gl.createBuffer(); gl.bindBuffer(target, cache[key]);
        gl.bufferData(target, new Uint8Array(model.buf, v.at, v.b.byteLength), gl.STATIC_DRAW);
      }
      return cache[key];
    }
    bufs = model.parts.map(function (p) {
      var it = p.I.a.componentType;
      if (it !== 5121 && it !== 5123 && !(it === 5125 && gl.getExtension('OES_element_index_uint'))) throw new Error('index type ' + it + ' cannot be drawn here');
      function attr(v) {
        return { buf: buffer(v, gl.ARRAY_BUFFER), size: COMPS[v.a.type], type: v.a.componentType, norm: !!v.a.normalized,
          stride: v.b.byteStride || 0, off: v.a.byteOffset || 0 };
      }
      return { M: mul(fit, p.m), P: attr(p.P), N: attr(p.N), C: p.C ? attr(p.C) : null,
        I: buffer(p.I, gl.ELEMENT_ARRAY_BUFFER), itype: it, ioff: p.I.a.byteOffset || 0, count: p.I.a.count };
    });
    gl.enable(gl.DEPTH_TEST); gl.enable(gl.CULL_FACE); gl.cullFace(gl.BACK); gl.frontFace(gl.CCW);
    gl.clearColor(0, 0, 0, 0);
  }

  /* --------------------------------------------------------------- the turn */
  var a = 0, w = 0;                 /* angle (rad), angular speed (rad/s) */
  var mode = 'wait';                /* wait (drawn, not yet revealed) | intro | rest | drag | coast */
  var drag = null, introAt = 0, swayAt = 0, swayOn = 0, homeA = 0, drift = FRICTION;
  var tone = 0, toneTo = 0;
  var visible = true, running = false, last = 0, dirty = true, shown = false;
  var cw = 0, ch = 0, hw = 0, stale = true;        /* the canvas and the mark in CSS px; stale: measure again */
  var calm = SWAYS === 'off', pace = 16, slow = 0, drawnAt = 0;   /* calm: no idle sway; pace: frame interval, smoothed (ms) */

  /* to rest: front is the nearest full turn, looking a little way along the
     direction of travel so a turn that is nearly round finishes rather than
     doubling back */
  function rest(now) { mode = 'rest'; homeA = Math.round((a + w * 0.30) / TAU) * TAU; swayAt = now; swayOn = 0; }
  /* let go at speed v. Left to plain friction a spin stops wherever it stops
     and then has to be hauled round to front, sometimes backwards. So the
     front it would stop nearest is chosen now, and the friction eased or
     firmed (never by much) so the spin runs down exactly onto it: one slowing
     turn that ends facing front. A throw too weak to reach a front in its own
     direction is left to the spring. */
  function thrown(v, now) {
    w = v;
    var home = Math.round((a + w / FRICTION) / TAU) * TAU, gap = home - a, k = gap ? w / gap : 0;
    if (Math.abs(w) >= HOME_BELOW && k > FRICTION * 0.55 && k < FRICTION * 2) { mode = 'coast'; drift = k; homeA = home; }
    else rest(now);
  }

  function measure() {
    cw = cv.clientWidth; ch = cv.clientHeight; hw = host.clientWidth || cw / 1.4;
    if (!cw || !ch) return false;
    /* at least two samples a CSS pixel, so the edge is clean on an ordinary screen too */
    var k = Math.min(3, Math.max(2, window.devicePixelRatio || 1));
    var W = Math.max(2, Math.round(cw * k)), H = Math.max(2, Math.round(ch * k));
    if (cv.width !== W || cv.height !== H) { cv.width = W; cv.height = H; }
    stale = false;
    return true;
  }

  function draw() {
    if (lost || !ready) return;
    if (stale && !measure()) return;
    var near = DIST - 1.4, far = DIST + 1.4, i, b;
    gl.viewport(0, 0, cv.width, cv.height);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.useProgram(prog);
    gl.uniform2f(loc.turn, Math.cos(a), Math.sin(a));
    gl.uniform3f(loc.proj, hw / cw, hw / ch, DIST);
    gl.uniform2f(loc.z, (far + near) / (far - near), -2 * far * near / (far - near));
    gl.uniform1f(loc.tone, tone);
    for (i = 0; i < bufs.length; i++) {
      b = bufs[i];
      gl.uniformMatrix4fv(loc.M, false, b.M);
      gl.bindBuffer(gl.ARRAY_BUFFER, b.P.buf); gl.enableVertexAttribArray(0); gl.vertexAttribPointer(0, b.P.size, b.P.type, b.P.norm, b.P.stride, b.P.off);
      gl.bindBuffer(gl.ARRAY_BUFFER, b.N.buf); gl.enableVertexAttribArray(1); gl.vertexAttribPointer(1, b.N.size, b.N.type, b.N.norm, b.N.stride, b.N.off);
      if (b.C) { gl.bindBuffer(gl.ARRAY_BUFFER, b.C.buf); gl.enableVertexAttribArray(2); gl.vertexAttribPointer(2, b.C.size, b.C.type, b.C.norm, b.C.stride, b.C.off); }
      else { gl.disableVertexAttribArray(2); gl.vertexAttrib4f(2, 1, 1, 1, 1); }
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, b.I);
      gl.drawElements(gl.TRIANGLES, b.count, b.itype, b.ioff);
    }
    dirty = false;
    /* the flat mark steps aside only once a frame of the model is up, and a
       file that parsed but would not draw (indices past their buffer, say)
       must not take the mark away with it */
    if (!shown) {
      var err = gl.getError();
      if (err !== gl.NO_ERROR && err !== gl.CONTEXT_LOST_WEBGL) { fail(new Error('the model would not draw, GL error ' + err)); return; }
      shown = true; requestAnimationFrame(function () { if (!lost && ready) host.classList.add('gl-on'); });
    }
  }

  function step(now) {
    running = false;
    var gap = now - last, dt = Math.min(0.05, Math.max(0, gap / 1000)); last = now;
    var moving = false, idle = false, p, e, target, d;

    if (mode === 'intro') {
      p = Math.max(0, Math.min(1, (now - introAt) / (INTRO_T * 1000)));   /* a frame's timestamp can predate the call that asked for it */
      e = 1 - Math.pow(1 - p, 4);
      a = -INTRO_TURNS * TAU * (1 - e); w = 0; dirty = true; moving = true;
      if (p >= 1) { a = 0; rest(now); }
    } else if (mode === 'coast') {
      a += w * dt; w *= Math.exp(-drift * dt); dirty = true; moving = true;
      if (Math.abs(homeA - a) < LANDING || Math.abs(w) < 0.2) { mode = 'rest'; swayAt = now; swayOn = 0; }   /* the spring takes the last of it, the same way round */
    } else if (mode === 'rest') {
      /* a spring to front; the idle sway rides on its target and fades in */
      target = homeA;
      if (!reduce && !calm) {
        swayOn = Math.min(1, swayOn + dt / 2.4); target += SWAY * swayOn * Math.sin((now - swayAt) / 1000 * TAU / SWAY_T);
        /* The sway is an ornament and must not cost the page its frame rate. If
           frames have been coming slower than about 28 a second for a couple of
           seconds while it is all that is moving (a software renderer, a
           struggling machine), it stops for good; the mark still turns in the
           hand. A phone in Low Power Mode runs at 30 and keeps it. */
        if (SWAYS === 'auto' && swayOn >= 1 && gap > 0 && gap < 250) {
          pace += (gap - pace) * 0.05;
          slow = pace > 36 ? slow + gap : Math.max(0, slow - gap);
          if (slow > 2500) calm = true;
        }
      }
      w += (-SPRING * (a - target) - DAMP * w) * dt; a += w * dt;
      if ((reduce || calm) && Math.abs(a - target) < 0.0015 && Math.abs(w) < 0.004) { a = target; w = 0; dirty = true; }
      else { dirty = true; moving = true; idle = Math.abs(w) < 0.3; }
    } else if (mode === 'drag') {
      moving = true;                 /* keep the clock running so dt stays small */
    }

    if (tone !== toneTo) {
      d = Math.min(250, Math.max(0, gap)) / 320;     /* by the clock, not the clamped step: on a slow machine the mark must not sit white on white */
      tone = toneTo > tone ? Math.min(toneTo, tone + d) : Math.max(toneTo, tone - d);
      dirty = true; moving = true;
    }
    /* the sway alone is slow enough to draw on every other frame (every third at 120 Hz) */
    if (dirty && !(idle && tone === toneTo && now - drawnAt < 24)) { draw(); drawnAt = now; }
    if (moving && visible && !document.hidden && !lost) wake();
  }
  function wake() { if (!running && ready && !lost) { running = true; requestAnimationFrame(step); } }
  function resume() { if (!running) last = performance.now(); wake(); }   /* not while it runs: a stream of resize events would hold dt at nothing */

  /* ----------------------------------------------------------------- hands */
  function radius() { return Math.max(24, hw / 2); }   /* px of drag per radian: the surface follows the finger */

  cv.addEventListener('pointerdown', function (e) {
    if (!ready || lost || drag || e.button !== 0 || e.ctrlKey) return;   /* the main button, a finger, a pen's tip; not ctrl-click, which is a Mac's menu */
    drag = { id: e.pointerId, x: e.clientX, trail: [[e.timeStamp, a]] };
    mode = 'drag'; w = 0;
    try { cv.setPointerCapture(e.pointerId); } catch (err) {}
    cv.classList.add('is-held');
    e.preventDefault();
    resume();
  });
  cv.addEventListener('pointermove', function (e) {
    if (!drag || e.pointerId !== drag.id) return;
    /* a mouse moving with its button up is a release that was never delivered (a menu took it) */
    if (e.pointerType === 'mouse' && e.buttons !== undefined && !(e.buttons & 1)) { release(e); return; }
    a += (e.clientX - drag.x) / radius(); drag.x = e.clientX; dirty = true;
    drag.trail.push([e.timeStamp, a]);
    if (drag.trail.length > 12) drag.trail.shift();
    wake();
  });
  /* The throw is the hand's speed over its last tenth of a second, read from
     the events' own timestamps: a busy page delivers moves late and in
     bunches, and timing them on arrival makes a flick read as a crawl. Held
     still before letting go, there is no throw. */
  function release(e) {
    if (!drag || (e && e.pointerId !== drag.id)) return;
    var tr = drag.trail, end = tr[tr.length - 1], i = tr.length - 1;
    while (i > 0 && end[0] - tr[i - 1][0] <= 110) i--;
    var span = (end[0] - tr[i][0]) / 1000, still = e && e.timeStamp ? e.timeStamp - end[0] : 0;
    var v = (span > 0.012 && still < 90) ? Math.max(-MAX_SPIN, Math.min(MAX_SPIN, (end[1] - tr[i][1]) / span)) : 0;
    drag = null; cv.classList.remove('is-held');
    thrown(v, performance.now());
    resume();
  }
  cv.addEventListener('pointerup', release);
  cv.addEventListener('pointercancel', release);
  cv.addEventListener('lostpointercapture', release);
  cv.addEventListener('dragstart', function (e) { e.preventDefault(); });

  /* ------------------------------------------------------------- the ground */
  function readTone() {
    var t = top && top.classList.contains('previewing') && top.classList.contains('pv-light') ? 1 : 0, pv, m;
    if (t) {
      /* ink only if the ground really did go light: forced colours (Windows
         high contrast) or a dark-mode extension can keep it dark */
      pv = document.getElementById('preview');
      m = pv && window.getComputedStyle && /rgba?\((\d+)[,\s]+(\d+)[,\s]+(\d+)/.exec(getComputedStyle(pv).backgroundColor);
      if (m && 0.2126 * m[1] + 0.7152 * m[2] + 0.0722 * m[3] < 128) t = 0;
    }
    if (t !== toneTo) { toneTo = t; if (reduce) { tone = t; dirty = true; } resume(); }
  }

  /* ------------------------------------------------------------ on and off */
  var inAt = null;                  /* when #top took .in (the hero's reveal); null until it has */
  function intro() {
    if (reduce) { a = 0; w = 0; rest(performance.now()); dirty = true; resume(); return; }
    mode = 'intro'; introAt = performance.now(); a = -INTRO_TURNS * TAU; resume();
  }
  function start() {
    if (ready || dead || !model || !host) return;
    if (lost || gl.isContextLost()) return;       /* the restore will call this again */
    try { build(); } catch (e) { fail(e); return; }
    ready = true;
    readTone();
    if (inAt === null) {
      /* before the reveal: the model is what fades up, turning in as it comes */
      host.appendChild(cv);
      a = reduce ? 0 : -INTRO_TURNS * TAU; draw();
    } else {
      /* after it: wait out the fade if it is still running, then take over from
         the flat mark where it stands. No fade-up of its own (.late). */
      setTimeout(function () {
        if (!ready) return;
        cv.classList.add('late'); host.appendChild(cv);
        a = 0; draw(); intro();
      }, Math.max(0, inAt + REVEAL - performance.now()));
    }
    if (window.IntersectionObserver) new IntersectionObserver(function (es) { visible = es[es.length - 1].isIntersecting; if (visible) resume(); }, { rootMargin: '80px' }).observe(host);
    document.addEventListener('visibilitychange', function () { if (!document.hidden) resume(); });
    var again = function () { stale = true; dirty = true; resume(); };
    if (window.ResizeObserver) new ResizeObserver(again).observe(host);
    window.addEventListener('resize', again);
    if (mq) { var onmq = function () { reduce = mq.matches; resume(); }; if (mq.addEventListener) mq.addEventListener('change', onmq); else if (mq.addListener) mq.addListener(onmq); }
  }
  function fail(e) {
    ready = false; dead = true;
    if (host) host.classList.remove('gl-on');
    if (cv.parentNode) cv.parentNode.removeChild(cv);
    if (window.console && console.warn) console.warn('98: the 3D mark is off, the flat one stays' + (e && e.message ? ' (' + e.message + ')' : ''));
  }
  cv.addEventListener('webglcontextlost', function (e) { e.preventDefault(); lost = true; if (host) host.classList.remove('gl-on'); });
  cv.addEventListener('webglcontextrestored', function () {
    lost = false;
    if (dead) return;
    if (!ready) { if (model && flat && flat.complete) start(); return; }   /* lost before it was ever built: build it now */
    try { build(); shown = false; stale = true; dirty = true; resume(); } catch (e) { fail(e); }
  });

  /* the model is asked for now; the page may still be arriving */
  var got = fetch(SRC).then(function (r) { if (!r.ok) throw new Error(SRC + ' ' + r.status); return r.arrayBuffer(); }).then(parse);
  got.then(null, function () {});   /* a failure is reported once, below */

  function page() {
    host = document.querySelector('.hero-mark');
    flat = host && host.querySelector('img.mark98');
    top = document.getElementById('top');
    if (!host || !flat) return;     /* not the landing */
    cv.className = 'mark98-gl' + (flat.classList.contains('rev') ? ' rev' : '');
    cv.setAttribute('role', 'img');
    cv.setAttribute('aria-label', flat.getAttribute('alt') || 'Ninety-Eight');
    if (top && window.MutationObserver) {
      var seen = function () {
        if (inAt === null && top.classList.contains('in')) { inAt = performance.now(); if (ready && cv.parentNode) intro(); }
        readTone();
      };
      if (top.classList.contains('in')) inAt = -1e9;      /* revealed before this ran: long ago, as far as the fade goes */
      new MutationObserver(seen).observe(top, { attributes: true, attributeFilter: ['class'] });
    } else inAt = -1e9;
    got.then(function (m) {
      model = m;
      if (flat.complete) start(); else { flat.addEventListener('load', start); flat.addEventListener('error', start); }
    }, fail);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', page); else page();

  /* for the Workshop's checks: read-only peeks at the state */
  window.__mark98 = { get angle() { return a; }, get speed() { return w; }, get mode() { return mode; }, get tone() { return tone; }, get ready() { return ready && !lost; }, get calm() { return calm; }, canvas: cv };
})();

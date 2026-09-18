/* =========================================================================
   FIELD 98 — the breathing ground (v3.43, Sep 2026)

   One full-viewport WebGL canvas behind everything. Domain-warped fractal
   noise, sampled very low and advanced very slowly, mixing a bloom of one
   brand colour into carbon. It is not a video and not a loop — it never
   repeats — but it moves at roughly the rate of a slow breath, which is the
   only thing the eye reads.

   The point of it: the flywheel used to be five rooms you hovered. Here the
   room you are in IS the weather. Field98.to(i) crossfades the bloom from
   one room's colour to the next over four seconds, so scrolling from The
   Opening to The Night is a slow blue-to-red sunrise you never quite catch
   happening.

   Costs, because a background that drops frames is worse than no background:
     · DPR capped at 1.5, canvas at 0.75 scale — the noise is so low
       frequency that nobody can tell, and it quarters the fill rate
     · 30fps, not 60 — time is advanced by real elapsed seconds, so the
       motion is identical either way
     · paused when the tab is hidden or the canvas is scrolled out of reach
     · ordered dither at the end: on a #0B0B0C ground an 8-bit gradient
       bands into visible steps, and the dither is what hides them
     · no WebGL, or prefers-reduced-motion, or a lost context → a static
       CSS gradient stack takes over and nothing else on the page changes

   Usage:
     Field98.mount({ colors:['#5278C2','#00933C','#FCCC0A','#FF6319','#EE352E'] });
     Field98.to(2);            // crossfade to the third colour
     Field98.pointer(x, y);    // -1..1, optional parallax
   ========================================================================= */
(function (global) {
  'use strict';

  var VERT = [
    'attribute vec2 a;',
    'void main(){ gl_Position = vec4(a, 0.0, 1.0); }'
  ].join('\n');

  /* Ashima's simplex, trimmed to 2D — the standard implementation, kept
     verbatim because a hand-rolled value noise shows its grid on a field
     this large and this dark. */
  var FRAG = [
    'precision highp float;',
    'uniform vec2  u_res;',
    'uniform float u_time;',
    'uniform vec3  u_base;',
    'uniform vec3  u_from;',
    'uniform vec3  u_to;',
    'uniform float u_mix;',
    'uniform vec2  u_ptr;',
    'uniform float u_amt;',
    'uniform float u_light;',

    'vec3 mod289(vec3 x){ return x - floor(x * (1.0/289.0)) * 289.0; }',
    'vec2 mod289(vec2 x){ return x - floor(x * (1.0/289.0)) * 289.0; }',
    'vec3 permute(vec3 x){ return mod289(((x*34.0)+1.0)*x); }',
    'float snoise(vec2 v){',
    '  const vec4 C = vec4(0.211324865405187, 0.366025403784439, -0.577350269189626, 0.024390243902439);',
    '  vec2 i  = floor(v + dot(v, C.yy));',
    '  vec2 x0 = v - i + dot(i, C.xx);',
    '  vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);',
    '  vec4 x12 = x0.xyxy + C.xxzz; x12.xy -= i1;',
    '  i = mod289(i);',
    '  vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0)) + i.x + vec3(0.0, i1.x, 1.0));',
    '  vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);',
    '  m = m*m; m = m*m;',
    '  vec3 x = 2.0 * fract(p * C.www) - 1.0;',
    '  vec3 h = abs(x) - 0.5;',
    '  vec3 ox = floor(x + 0.5);',
    '  vec3 a0 = x - ox;',
    '  m *= 1.79284291400159 - 0.85373472095314 * (a0*a0 + h*h);',
    '  vec3 g;',
    '  g.x  = a0.x  * x0.x  + h.x  * x0.y;',
    '  g.yz = a0.yz * x12.xz + h.yz * x12.yw;',
    '  return 130.0 * dot(m, g);',
    '}',

    'float fbm(vec2 p){',
    '  float s = 0.0, a = 0.5;',
    '  for(int i = 0; i < 2; i++){ s += a * snoise(p); p *= 2.03; a *= 0.5; }',
    '  return s;',
    '}',

    'void main(){',
    '  vec2 p = (gl_FragCoord.xy - 0.5 * u_res) / min(u_res.x, u_res.y);',
    '  float t = u_time * 0.05;',

    /* The noise does NOT draw anything. It only bends the space the two
       blooms live in, by about a fifth of a screen — which is what turns two
       circles into two soft organic clouds without ever reading as a
       pattern. Bend it any harder and you get marbled paper. */
    '  vec2 w = p + 0.22 * vec2(fbm(p * 0.52 + vec2(0.0, t)),',
    '                           fbm(p * 0.52 + vec2(4.7, -t)));',

    /* two blooms on out-of-phase drifts, so the field never retraces */
    '  vec2 c1 = vec2(sin(t * 0.53) * 0.46, cos(t * 0.41) * 0.34) + u_ptr * 0.10;',
    '  vec2 c2 = vec2(cos(t * 0.31) * 0.62, sin(t * 0.27) * 0.48) - u_ptr * 0.05;',
    '  float b1 = exp(-dot(w - c1, w - c1) * 1.15);',
    '  float b2 = exp(-dot(w - c2, w - c2) * 2.30);',

    /* a very low-frequency grade so the two blooms are never equally lit */
    '  float g = fbm(p * 0.34 - vec2(t * 0.22, t * 0.11)) * 0.5 + 0.5;',

    '  float energy = clamp(b1 * (0.60 + 0.40 * g) + b2 * 0.38 * (1.25 - g), 0.0, 1.0);',

    '  vec3 hue = mix(u_from, u_to, u_mix);',
    '  float vig = smoothstep(0.16, 1.18, length(p));',

    /* carbon: the bloom adds its colour to the dark, and the corners fall
       back to carbon — without that the whole screen tints */
    '  vec3 dark = (u_base + hue * energy * u_amt) * (1.0 - 0.70 * vig);',

    /* white (v3.53): the same bloom laid into paper as a tint of its own
       hue at full brightness, so it reads as a pastel of the room's colour,
       never as grey; the corners fall back to white the same way */
    '  vec3 vivid = hue / max(max(hue.r, hue.g), max(hue.b, 0.001));',
    '  vec3 light = mix(vec3(1.0), vivid, clamp(energy * u_amt * 0.30, 0.0, 1.0));',
    '  light = mix(light, vec3(1.0), 0.70 * vig);',
    '  vec3 col = mix(dark, light, u_light);',

    /* ordered dither — without this a dark ramp bands into stripes */
    '  float dth = fract(sin(dot(gl_FragCoord.xy, vec2(12.9898, 78.233))) * 43758.5453);',
    '  col += (dth - 0.5) * (1.7 / 255.0);',

    '  gl_FragColor = vec4(col, 1.0);',
    '}'
  ].join('\n');

  function hex2rgb(h) {
    h = (h || '').replace('#', '');
    if (h.length === 3) h = h[0] + h[0] + h[1] + h[1] + h[2] + h[2];
    var n = parseInt(h, 16);
    if (isNaN(n)) return [0, 0, 0];
    return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
  }

  function compile(gl, type, src) {
    var s = gl.createShader(type);
    gl.shaderSource(s, src);
    gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) { gl.deleteShader(s); return null; }
    return s;
  }

  var F = {
    ok: false, _raf: 0, _gl: null, _cv: null, _u: {}, _t: 0, _last: 0,
    _colors: [], _from: [0, 0, 0], _to: [0, 0, 0], _mix: 1, _fadeT: 0, _fadeD: 7.0,   /* Sep 10 call: "changing themes way faster than it should" */
    _ptr: [0, 0], _ptrTo: [0, 0], _amt: 1, _idx: -1, _running: false,

    mount: function (opt) {
      opt = opt || {};
      var reduce = global.matchMedia && global.matchMedia('(prefers-reduced-motion:reduce)').matches;
      var host = opt.target || document.body;

      var cv = document.createElement('canvas');
      cv.className = 'field98';
      cv.setAttribute('aria-hidden', 'true');
      host.insertBefore(cv, host.firstChild);
      this._cv = cv;

      this._colors = (opt.colors || ['#5278C2']).map(hex2rgb);
      this._from = this._colors[0];
      this._to = this._colors[0];
      this._idx = 0;
      this._amt = opt.intensity == null ? 1 : opt.intensity;
      var base = hex2rgb(opt.base || '#0B0B0C');

      if (reduce) { document.documentElement.classList.add('field-static'); return false; }

      var gl = null;
      try {
        gl = cv.getContext('webgl', { alpha: false, antialias: false, depth: false,
                                      stencil: false, powerPreference: 'low-power',
                                      preserveDrawingBuffer: false });
      } catch (e) { gl = null; }
      if (!gl) { document.documentElement.classList.add('field-static'); return false; }

      var vs = compile(gl, gl.VERTEX_SHADER, VERT);
      var fs = compile(gl, gl.FRAGMENT_SHADER, FRAG);
      if (!vs || !fs) { document.documentElement.classList.add('field-static'); return false; }

      var pr = gl.createProgram();
      gl.attachShader(pr, vs); gl.attachShader(pr, fs); gl.linkProgram(pr);
      if (!gl.getProgramParameter(pr, gl.LINK_STATUS)) {
        document.documentElement.classList.add('field-static'); return false;
      }
      gl.useProgram(pr);

      var buf = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, buf);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1, 3,-1, -1,3]), gl.STATIC_DRAW);
      var loc = gl.getAttribLocation(pr, 'a');
      gl.enableVertexAttribArray(loc);
      gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

      this._gl = gl;
      this._u = {
        res:  gl.getUniformLocation(pr, 'u_res'),
        time: gl.getUniformLocation(pr, 'u_time'),
        base: gl.getUniformLocation(pr, 'u_base'),
        from: gl.getUniformLocation(pr, 'u_from'),
        to:   gl.getUniformLocation(pr, 'u_to'),
        mix:  gl.getUniformLocation(pr, 'u_mix'),
        ptr:  gl.getUniformLocation(pr, 'u_ptr'),
        amt:  gl.getUniformLocation(pr, 'u_amt'),
        light: gl.getUniformLocation(pr, 'u_light')
      };
      gl.uniform3fv(this._u.base, base);
      gl.uniform1f(this._u.amt, this._amt);
      /* the site's ground (v3.53): white eases the field into paper over half a second */
      this._lightTo = this._light = document.documentElement.getAttribute('data-ground') === 'white' ? 1 : 0;
      gl.uniform1f(this._u.light, this._light);

      var self = this;
      global.addEventListener('s98:ground', function (e) { self._lightTo = e.detail === 'white' ? 1 : 0; });
      cv.addEventListener('webglcontextlost', function (e) {
        e.preventDefault(); self.stop();
        document.documentElement.classList.add('field-static');
      }, false);

      this.ok = true;
      document.documentElement.classList.add('field-on');
      this._resize();

      var rt;
      global.addEventListener('resize', function () {
        clearTimeout(rt); rt = setTimeout(function () { self._resize(); }, 180);
      }, { passive: true });

      document.addEventListener('visibilitychange', function () {
        if (document.hidden) self.stop(); else self.start();
      });

      this._t = Math.random() * 900;   /* never open on the same frame twice */
      this.start();
      return true;
    },

    _resize: function () {
      if (!this._gl) return;
      var dpr = Math.min(global.devicePixelRatio || 1, 1.5) * 0.75;
      var w = Math.max(2, Math.round(global.innerWidth  * dpr));
      var h = Math.max(2, Math.round(global.innerHeight * dpr));
      this._cv.width = w; this._cv.height = h;
      this._gl.viewport(0, 0, w, h);
      this._gl.uniform2f(this._u.res, w, h);
    },

    /* crossfade the bloom to colour i */
    to: function (i) {
      if (!this._colors.length) return;
      i = Math.max(0, Math.min(this._colors.length - 1, i | 0));
      if (i === this._idx) return;
      /* start the new fade from wherever the last one had got to */
      var m = this._mix, a = this._from, b = this._to;
      this._from = [a[0] + (b[0] - a[0]) * m, a[1] + (b[1] - a[1]) * m, a[2] + (b[2] - a[2]) * m];
      this._to = this._colors[i];
      this._mix = 0; this._fadeT = 0; this._idx = i;
    },

    pointer: function (x, y) { this._ptrTo[0] = x; this._ptrTo[1] = y; },

    start: function () {
      if (!this.ok || this._running) return;
      this._running = true; this._last = 0;
      var self = this;
      var STEP = 1 / 30;
      var acc = 0;
      (function frame(now) {
        if (!self._running) return;
        self._raf = requestAnimationFrame(frame);
        if (!self._last) { self._last = now; return; }
        var dt = Math.min(0.25, (now - self._last) / 1000);
        self._last = now;
        acc += dt;
        if (acc < STEP) return;
        self._draw(acc);
        acc = 0;
      })(0);
    },

    stop: function () {
      this._running = false;
      if (this._raf) cancelAnimationFrame(this._raf);
      this._raf = 0;
    },

    _draw: function (dt) {
      var gl = this._gl; if (!gl) return;
      this._t += dt;

      if (this._mix < 1) {
        this._fadeT += dt;
        var k = Math.min(1, this._fadeT / this._fadeD);
        this._mix = k * k * (3 - 2 * k);          /* smoothstep, no library */
      }
      /* the pointer eases in over about a second, so a flicked cursor
         doesn't yank the whole field */
      this._ptr[0] += (this._ptrTo[0] - this._ptr[0]) * Math.min(1, dt * 1.6);
      this._ptr[1] += (this._ptrTo[1] - this._ptr[1]) * Math.min(1, dt * 1.6);

      gl.uniform1f(this._u.time, this._t);
      gl.uniform3fv(this._u.from, this._from);
      gl.uniform3fv(this._u.to, this._to);
      gl.uniform1f(this._u.mix, this._mix);
      gl.uniform2f(this._u.ptr, this._ptr[0], this._ptr[1]);
      if (this._light !== this._lightTo) {
        this._light += (this._lightTo - this._light) * Math.min(1, dt * 5);
        if (Math.abs(this._lightTo - this._light) < 0.004) this._light = this._lightTo;
      }
      gl.uniform1f(this._u.light, this._light);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    }
  };

  global.Field98 = F;
})(window);

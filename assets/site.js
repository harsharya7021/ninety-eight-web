/* =========================================================================
   SITE 98 — the shared frame's behaviour (v3.53, Sep 2026)
   Pairs with assets/site.css. Loaded last on every page, after GSAP where
   the page has it. Five things:
     1. the ground — Carbon (default) / White, remembered across the site
     2. Delhi time in the header and the footer
     3. the header's frosted layer once the page moves under it, and, on the
        landing, its small mark waiting while the hero's big one is on screen
     4. the nudges (a room's Scroll or Drag cue), held back until the page
        has been still for six seconds
     5. the curtain menu (effect 035 + the word, effect 093), moved here from
        the landing with its numbers intact, so the dots open it on every page
   Hooks a page may provide (the landing does): window.__scrollLock(on),
   window.__lenis, window.__jumpTo(hash) for in-page rows, [data-film].
   ========================================================================= */
(function(){
  var doc = document.documentElement;
  var KEY = '98-ground';
  var head = document.getElementById('s98-head');

  /* ---- 1. the ground ---- */
  var sw = [].slice.call(document.querySelectorAll('[data-s98-ground]'));
  function ground(){ return doc.getAttribute('data-ground') === 'white' ? 'white' : 'carbon'; }
  function mark(){
    var g = ground();
    sw.forEach(function(b){ var on = b.getAttribute('data-s98-ground') === g; b.classList.toggle('on', on); b.setAttribute('aria-pressed', on ? 'true' : 'false'); });
    var tc = document.querySelector('meta[name="theme-color"]'); if (tc) tc.setAttribute('content', g === 'white' ? '#FFFFFF' : '#0B0B0C');
  }
  function announce(){ try { window.dispatchEvent(new CustomEvent('s98:ground', { detail: ground() })); } catch (e) {} }
  function setGround(g){
    g = g === 'white' ? 'white' : 'carbon';
    doc.setAttribute('data-ground', g);
    try { localStorage.setItem(KEY, g); } catch (e) {}
    mark(); announce();
  }
  if (!doc.getAttribute('data-ground')) doc.setAttribute('data-ground', 'carbon');
  sw.forEach(function(b){ b.addEventListener('click', function(){ setGround(b.getAttribute('data-s98-ground')); }); });
  mark();
  /* another tab changed it: follow */
  window.addEventListener('storage', function(e){
    if (e.key !== KEY || !e.newValue) return;
    doc.setAttribute('data-ground', e.newValue === 'white' ? 'white' : 'carbon'); mark(); announce();
  });
  window.S98 = { ground: ground, setGround: setGround };

  /* ---- 2. Delhi time ---- */
  var clocks = [].slice.call(document.querySelectorAll('[data-s98-clock]'));
  function tick(){
    try {
      var t = 'IST ' + new Intl.DateTimeFormat('en-US', { timeZone: 'Asia/Kolkata', hour: 'numeric', minute: '2-digit', hour12: true }).format(new Date());
      clocks.forEach(function(c){ c.textContent = t; });
    } catch (e) {}
  }
  if (clocks.length){ tick(); setInterval(tick, 15000); }

  /* the mail line copies itself on click, then goes back to being a link */
  [].forEach.call(document.querySelectorAll('[data-s98-mail]'), function(a){
    a.addEventListener('click', function(e){
      if (!navigator.clipboard) return;
      e.preventDefault();
      navigator.clipboard.writeText(a.getAttribute('data-s98-mail')).then(function(){
        var t = a.textContent; a.textContent = 'Copied'; setTimeout(function(){ a.textContent = t; }, 1400);
      }, function(){ location.href = a.href; });
    });
  });

  /* ---- 3. the header's layer, and the landing's mark ---- */
  if (head){
    var glass = function(){ head.classList.toggle('s98-glass', (window.pageYOffset || doc.scrollTop || 0) > 8); };
    window.addEventListener('scroll', glass, { passive: true });
    window.addEventListener('load', function(){ if (window.__lenis && window.__lenis.on) window.__lenis.on('scroll', glass); glass(); });
    glass();
    var big = document.querySelector('.hero-mark');
    if (big && 'IntersectionObserver' in window){
      new IntersectionObserver(function(es){ head.classList.toggle('s98-nomark', es[0].isIntersecting); },
        { rootMargin: '-40px 0px 0px 0px' }).observe(big);
    }
    /* in-page links in the header (the landing's Contact) land the way the menu does */
    [].forEach.call(head.querySelectorAll('a[href^="#"]'), function(a){
      a.addEventListener('click', function(e){
        var h = a.getAttribute('href');
        if (typeof window.__jumpTo === 'function'){ e.preventDefault(); e.stopImmediatePropagation(); window.__jumpTo(h); }
      }, true);
    });
  }

  /* ---- 4. the nudges wait for a stillness (v3.63) ----
     A room's Scroll or Drag cue is for someone who has stopped, not a label
     that sits on the screen: html[data-cues] is "wait" while the page is
     being moved or worked and turns "still" after six seconds without a
     scroll, a press or a key; the first move sets it back. A page still has
     its own say over whether its cue is due at all — each fades its own away
     once its scene has started — and this only decides whether a due one is
     on screen. Without JS the attribute is never set and the cues behave as
     they always did (assets/site.css holds the rule). */
  var STILL = 6000, stillTimer = 0;
  function stirred(){
    doc.setAttribute('data-cues', 'wait');
    clearTimeout(stillTimer);
    stillTimer = setTimeout(function(){ doc.setAttribute('data-cues', 'still'); }, STILL);
  }
  ['scroll', 'wheel', 'touchstart', 'touchmove', 'pointerdown', 'keydown'].forEach(function(t){
    window.addEventListener(t, stirred, { passive: true, capture: true });
  });
  stirred();

  /* ---- 5. the menu: effect 035, hung as a curtain ----
     The reference's category list, hired as the site's table of contents.
     Numbers kept exactly: 0.04s random stagger, 0.4s power4.out rise, the
     previous row reversed at 3x speed, rows tweened between 45px and 122px
     of flex basis. It drops from the top edge; while it is down a scroll
     gesture lifts it away again (past halfway it lets go and the page is
     where it was); the dots carry over it and read Close. A row that points
     at this page jumps under the closing fade; any other row is a link. */
  var root = document.getElementById('nav035');
  var btn = document.getElementById('s98-menu');
  if (!root || !btn) return;
  var items = root.querySelectorAll('ul li');
  var txt = btn.querySelector('.md-txt');
  var fx = (typeof gsap !== 'undefined') && !matchMedia('(prefers-reduced-motion:reduce)').matches;
  if (!fx) root.classList.add('nofx');

  var expanded = function(){ return window.innerWidth > 768 ? 122 : 90; };
  var lastIndexEntered = 0, tls = [], isOpen = false;

  if (fx){
    [].forEach.call(items, function(item, index){
      var medias = item.querySelectorAll('.n35-media');
      var tl = gsap.timeline({ paused: true });
      tl.to(medias, { y: 0, stagger: { each: 0.04, from: 'random' }, duration: 0.4, ease: 'power4.out' });
      tls.push(tl);
      item.addEventListener('mouseenter', function(){
        tls[lastIndexEntered].timeScale(3).reverse();
        lastIndexEntered = index;
        tls[index].timeScale(1).play();
        gsap.to(items, { flex: '1 1 45px', duration: 0.2, ease: 'power2.inOut' });
        gsap.to(item, { flex: '1 1 ' + expanded() + 'px', duration: 0.2, ease: 'power2.inOut' });
      });
    });
  }

  /* effect 093, the word: hover a letter and a photograph from the site takes
     its place (xPercent/yPercent -50, from a random +-10deg roll at 1.05 on
     back.out(2)), the neighbours pushed aside by half its overflow on
     back.out(3); 1.2s later the letter pops back with the same roll. */
  var word = root.querySelector('.n35-word');
  var wletters = [], woverflows = [], wsrcs = [], wIndex = 0, wcalls = [];
  if (word && fx){
    wsrcs = [].map.call(root.querySelectorAll('.n35-wmedia'), function(el){ return el.getAttribute('src'); });
    word.innerHTML = word.textContent.split('').map(function(ch){ return ch === ' ' ? '<span>&nbsp;</span>' : '<span class="letter">' + ch + '</span>'; }).join('');
    wletters = [].slice.call(word.querySelectorAll('.letter'));
    woverflows = wletters.map(function(){ return 0; });
    var mediaWidth = function(){ return Math.max(64, 0.095 * window.innerWidth); };
    var applyOffsets = function(){
      var sumLeft = 0, targets = woverflows.map(function(ov, i){
        var sumRight = 0; for (var j = i + 1; j < woverflows.length; j++) sumRight += woverflows[j];
        var x = sumLeft - sumRight; sumLeft += ov; return x;
      });
      gsap.to(wletters, { x: function(i){ return targets[i]; }, duration: 0.3, ease: 'back.out(3)', overwrite: 'auto' });
    };
    var createMedia = function(letter){
      if (!wsrcs.length) return;
      var img = document.createElement('img');
      img.src = wsrcs[wIndex]; img.className = 'n35-cm'; img.alt = ''; letter.appendChild(img);
      gsap.set(img, { yPercent: -50, xPercent: -50 });
      gsap.from(img, { rotation: (Math.random() - 0.5) * 20, scale: 1.05, duration: 0.3, ease: 'back.out(2)' });
      wIndex = (wIndex + 1) % wsrcs.length;
      var index = wletters.indexOf(letter);
      woverflows[index] = Math.max(woverflows[index], Math.max(0, (mediaWidth() - letter.getBoundingClientRect().width) / 2));
      applyOffsets();
      var dc = gsap.delayedCall(1.2, function(){
        var idx = wletters.indexOf(img.parentElement);
        if (idx !== -1) woverflows[idx] = 0;
        img.remove(); applyOffsets();
        gsap.from(letter, { rotation: (Math.random() - 0.5) * 20, scale: 1.05, duration: 0.3, ease: 'back.out(2)' });
      });
      wcalls.push(dc);
    };
    wletters.forEach(function(letter){
      letter.addEventListener('mouseenter', function(){ if (letter.children.length === 0) createMedia(letter); });
    });
  }
  function resetWord(){
    if (!wletters.length) return;
    wcalls.forEach(function(dc){ dc.kill(); }); wcalls = [];
    wletters.forEach(function(l, i){ woverflows[i] = 0; var im = l.querySelector('.n35-cm'); if (im) im.remove(); });
    gsap.set(wletters, { x: 0, rotation: 0, scale: 1, clearProps: 'transform' });
  }

  /* scrolling is held while the curtain is down — by the page's own lock
     where it has one (the landing's snaps Lenis's target first), by Lenis
     where a page only has Lenis, and by the body everywhere */
  function lock(on){
    document.body.style.overflow = on ? 'hidden' : '';
    if (window.__scrollLock) { window.__scrollLock(on); return; }
    var l = window.__lenis;
    if (l){ if (on){ try { l.scrollTo(l.scroll, { immediate: true, force: true }); } catch (e) {} l.stop(); } else l.start(); }
  }

  /* the curtain's motion: one number, eased. `lift` is 0 fully down, 1 gone.
     Gestures move a target and a Lenis-style lerp on the GSAP ticker chases
     it (0.11 a frame), so wheel notches read as one glide; when the gesture
     stops a power3.out tween carries it the rest of the way; open and close
     are expo.inOut tweens on the same number. */
  var lift = 0, target = 0, ticking = false, settleT = null, curtainTween = null;
  var RUN = function(){ return window.innerHeight * 0.5; };
  var proxy = { v: 0 };
  function paint(){
    var v = lift;
    root.style.transform = 'translate3d(0,' + (-v * 100) + '%,0)';
    root.style.opacity = String(1 - v * 0.85);
    btn.style.opacity = String(Math.max(0, 1 - v * 2.5));     /* the dots step aside while rows pass under them */
  }
  function resetPaint(){ root.style.transform = ''; root.style.opacity = ''; btn.style.opacity = ''; root.classList.remove('dragging'); }
  function tick2(){
    var d = target - lift;
    if (Math.abs(d) < 0.002){ lift = target; paint(); stopTick(); if (isOpen && lift >= 1) closeMenu(true); return; }
    lift += d * (fx ? 0.11 : 1);
    paint();
  }
  function startTick(){ if (ticking) return; ticking = true; if (fx) gsap.ticker.add(tick2); else { lift = target; paint(); ticking = false; } }
  function stopTick(){ if (!ticking) return; ticking = false; if (fx) gsap.ticker.remove(tick2); }
  function killTween(){ if (curtainTween){ curtainTween.kill(); curtainTween = null; } }
  function settle(){
    var to = (target > 0.5 || lift > 0.5) ? 1 : 0;
    slide(to, 0.7, 'power3.out', function(){ if (to >= 1 && isOpen) closeMenu(true); });
  }
  function nudge(dy){
    if (!isOpen) return;
    if (dy <= 0 && target <= 0 && lift <= 0) return;
    clearTimeout(settleT); killTween();
    root.classList.add('dragging');
    target = Math.max(0, Math.min(1, target + dy / RUN()));
    startTick();
    settleT = setTimeout(settle, 380);
  }
  function slide(to, dur, ease, done){
    stopTick(); killTween(); clearTimeout(settleT);
    if (!fx){ lift = target = to; paint(); if (done) done(); return; }
    proxy.v = lift; target = to;
    curtainTween = gsap.to(proxy, { v: to, duration: dur, ease: ease, overwrite: true,
      onUpdate: function(){ lift = proxy.v; paint(); },
      onComplete: function(){ curtainTween = null; lift = to; paint(); if (done) done(); } });
  }
  /* on the window, not the curtain: once it has risen the pointer is over the
     page beneath it and the curtain would never hear the next notch */
  window.addEventListener('wheel', function(e){ if (!isOpen) return; e.preventDefault(); nudge(e.deltaY); }, { passive: false });
  var ty = null;
  window.addEventListener('touchstart', function(e){ if (isOpen) ty = e.touches[0].clientY; }, { passive: true });
  window.addEventListener('touchmove', function(e){
    if (!isOpen || ty === null) return;
    var y = e.touches[0].clientY, dy = ty - y; ty = y;
    if (dy > 0 || lift > 0){ e.preventDefault(); nudge(dy * 1.4); }
  }, { passive: false });
  window.addEventListener('touchend', function(){ ty = null; }, { passive: true });
  document.addEventListener('keydown', function(e){
    if (!isOpen) return;
    if (e.key === 'Escape'){ closeMenu(); return; }
    if (e.key === 'ArrowDown' || e.key === 'PageDown' || e.key === ' '){ e.preventDefault(); closeMenu(); }
  });

  function openMenu(){
    if (isOpen) return; isOpen = true;
    clearTimeout(settleT);
    lock(true);
    root.classList.add('open');
    if (lift <= 0 || lift > 1) lift = 1;
    paint();
    slide(0, 0.9, 'expo.inOut');
    root.setAttribute('aria-hidden', 'false');
    btn.setAttribute('aria-expanded', 'true');
    btn.setAttribute('aria-label', 'Close menu');
    if (txt) txt.textContent = 'Close';
    doc.classList.add('s98-menu-open');
    if (fx){
      /* the reference's load moment, replayed per open: first row expanded, its media rising */
      lastIndexEntered = 0;
      for (var i = 0; i < tls.length; i++) tls[i].pause(0);
      gsap.set(items, { flex: '1 1 45px' });
      gsap.set(items[0], { flex: '1 1 ' + expanded() + 'px' });
      if (tls[0]) tls[0].timeScale(1).play();
    }
    try { btn.focus({ preventScroll: true }); } catch (e) { btn.focus(); }
  }
  function closeMenu(viaScroll){
    if (!isOpen) return; isOpen = false;
    clearTimeout(settleT);
    root.classList.remove('dragging');
    var finish = function(){
      root.classList.remove('open'); lift = 1; resetPaint();
      root.setAttribute('aria-hidden', 'true');
      btn.setAttribute('aria-expanded', 'false');
      btn.setAttribute('aria-label', 'Menu');
      if (txt) txt.textContent = 'Menu';
      doc.classList.remove('s98-menu-open');
      if (fx) resetWord();
    };
    lock(false);
    if (viaScroll){ stopTick(); lift = 1; paint(); finish(); }
    else slide(1, 0.8, 'expo.inOut', finish);
  }
  window.__closeMenu = closeMenu;

  /* rows: a row that points at this page lands by jump under the closing
     fade (an animated glide would replay every pinned scene on the way);
     rows that point at other pages are ordinary links. Capture phase, so the
     landing's own handlers for #contact never see a menu click. */
  [].forEach.call(root.querySelectorAll('ul li a'), function(a){
    a.addEventListener('click', function(e){
      var href = a.getAttribute('href') || '', act = a.getAttribute('data-action');
      if (href.charAt(0) !== '#') return;
      e.preventDefault(); e.stopImmediatePropagation();
      closeMenu();
      if (act === 'film'){ var f = document.querySelector('[data-film]'); if (f) setTimeout(function(){ f.click(); }, 80); return; }
      if (typeof window.__jumpTo === 'function') window.__jumpTo(href);
      else { var el = document.querySelector(href); if (el) el.scrollIntoView(); }
    }, true);
  });

  btn.addEventListener('click', function(){ if (isOpen) closeMenu(); else openMenu(); });
})();

NINETY-EIGHT · Website v2.4
===========================
Hand-coded. No Figma. Real motion, real interaction.
v2.4 turns the pinned train stage into a clean section breaker.

WHAT CHANGED IN v2.4
--------------------
1. TRAIN IS A SECTION BREAKER NOW
   The pinned stage is no longer a content section. It's a
   transitional band between hero and services — short
   (160vh pinned, ~520px visible), cream-colored, quiet.

2. NO DARK BOX
   Removed the radial-gradient dark stage, the border, and
   the drop shadow. The train canvas is transparent and the
   train itself floats directly on the cream paper. Lighting
   was rebalanced (more ambient, less rim) and the PBR
   material dropped its self-emissive glow so the paint reads
   correctly on a bright backdrop.

3. CHIPS + DIAL + COPY-SWAP REMOVED
   The 3-column layout (left copy / center train / right
   chips) is gone. The chips duplicated the main nav anyway.
   Replaced with a minimal ticket-stub layout: small kicker
   top-left ("Platform 98 · Northbound"), route top-right
   ("Zigzag · Express"), rail lines across the middle, and
   a Vignelli-esque italic line at the bottom ("Culture is
   the track. Talent is the train.")

4. WIDER SLIDE
   Train amplitude raised from 4.6 to 7.2 world units and
   start pushed further off the left edge so it actually
   enters and exits the viewport. Camera pulled back slightly
   (z=7.2, fov=32) to frame the wider travel range.

v2.3 · FORK REMOVED, SLIDE (still in)
-------------------------------------
1. TRAIN: SLIDE, DON'T SPIN
   The train glides laterally across the stage — enters from
   the left at prog=0, exits right at prog=1. No rotation, no
   tilt, no OrbitControls. Model orientation is locked so it
   reads as a train on a track.

2. FORK: REMOVED
   The draggable 3D fork in the footer is out. In its place is a
   dark TERMINUS panel — same carbon background, same gold
   accent, but flat HTML/CSS. Less novelty, more directness.
   ~200 lines of Three.js and an entire GLTF/OrbitControls
   import went with it.

3. HERO MARK TIGHTER
   Reduced clamp from 13vw→11.8vw max 220→196 and dropped
   letter spacing one tick so the mark sits comfortably within
   the column on wide viewports.

FILES
-----
  index.html   → the homepage (single file, embedded CSS + JS)
  train.glb    → Meshy AI "Blue Zigzag High Speed" model (hero)
  logo.glb     → Meshy AI Ninety-Eight 3D logo (bonus asset — not yet placed in layout)
  run.sh       → double-click to launch server + open in browser
  README.txt   → this file

RUN IT
------
macOS:
  Double-click run.sh → opens http://localhost:8098

Any OS:
  In Terminal, inside this folder:
    python3 -m http.server 8098
  Then open http://localhost:8098

A local server is required because browsers block .glb loading over file://.

WHAT'S IN v2.2 · APPLE-FEEL SCROLL (still in)
--------------------------------------
A. LENIS SMOOTH SCROLL
   Global inertial scroll via Lenis (pinned wheel + touch).
   Duration 1.15 s, exponential ease. Anchor links (<a href="#x">)
   are hijacked to use lenis.scrollTo with a longer 1.4 s ease
   so in-page jumps glide instead of snapping.

B. HERO PARALLAX
   As the viewport leaves the hero, three layers move at
   different rates:
     · NYC aerial map sinks at 0.18× scroll + grows subtly
     · "NINETY EIGHT" mark drifts up at 0.04× scroll
     · Right column (Vignelli quote + timeline) lifts at 0.12×
   The result: the mark feels like it's rising off a moving map.
   Parallax is only computed while the hero is in the viewport,
   so it doesn't cost frames later down the page.

C. PINNED SCROLL-SCRUB TRAIN STAGE
   The 3D train moved OUT of the hero into its own pinned section
   (.pin-train, 260vh tall, sticky inner). As you scroll through,
   the train:
     · rotates TWO full turns (scrubbed to scroll progress)
     · drifts along its travel axis
     · tilts gently on the X-axis with a sine curve
   Left column morphs through 7 stops — the H2, copy, kicker
   ticker ("NOW APPROACHING · SERVICES") and degree dial all
   update. Right column is a chip list (Board → Services →
   Roster → Work → Culture → About → Terminus); the active stop
   brightens while others dim and drift right.
   Progress read from getBoundingClientRect, piped through
   smoothProg (lerp 0.08) so nothing ever snaps.

D. ONE rAF BUDGET
   All scroll work (top bar, nav state, parallax, pin-train)
   is batched into a single requestAnimationFrame tick so we
   never do layout reads twice in one frame. Lenis.on('scroll')
   also pumps the same tick for safety.

WHAT'S NEW IN v2.1
------------------
1. AERIAL NYC BACKGROUND (hero)
   Denser map with Manhattan landmass, street grid, avenue grid,
   Broadway diagonal, Central Park with reservoir + trails,
   Hudson + East rivers, downtown crooked streets, three East-River
   bridges, Broadway station dots, district labels (HARLEM, MIDTOWN,
   SOHO, TRIBECA). Subtle opacity so the mark reads on top.

2. THREADING LINES
   Six colored strands originate from the base of the first six
   hero letters (N, I, N, E, T, Y). The JS measures each letter's
   bottom-centre at load + on resize, then draws bezier paths
   through every section's own SVG overlay. Lines are solid in
   HERO, SERVICES, WORK; deliberately "hidden" (10% opacity +
   dotted) in ROSTER and ABOUT, then emerge again. They carry
   forward — the end-point of one section becomes the start-point
   of the next, so the thread is one continuous river. Each path
   draws itself in with stroke-dashoffset when its section enters
   the viewport.

3. 3D FORK (footer · terminus)
   Full Three.js scene with a matte-black fork built from
   primitives: handle + gold cap + neck + crossbar + four tines
   with conical tips. Six colored tube-geometry strands swoop in
   from off-screen, wrap around the tines, and dangle as short
   "pasta tails". You can drag the fork:
     · horizontal drag → rotates it
     · vertical drag   → pulls the strands (tails lift, handle
                         dips, spring-back on release)
   Strands rebuild every frame so they physically respond.

4. REAL BRAND CONTENT
   From the Mar 2023 Ninety-Eight brand deck:
     Founding year:     2019 (corrected from 2018 placeholder)
     Tagline:           Culture is the track, talent is the train
     Real clients:      Ishant Sharma · Singh Sisters basketball
                        · Arjun Bhati · Avani Prashanth · Himanshu Nagar
     Brand partners:    WOW, Decathlon, BSC, Happydent, Chaayos,
                        Biotique, DW, Healthvit, Fast & Up, Kama,
                        ONE Champ., Dot & Key, Dyson, Clove, SockSoho
     Hospitality / IM:  Mai Bao, 1OAK, Junkyard, Vietnom, Romeo Lane,
                        Cafe Delhi Hts, Snackstar.in, Grenade, Dublr,
                        Thai Mama, Iskate, ADDA
     Contact:           +91 97111 84674 · contact@ninety-eight.in
     Studios:           GF-16 Omaxe Arcade, Greater Noida
                        A-59 Sector-63, Noida
                        Bandra West, Mumbai (by appointment)
     Founder:           Harsh Arya (ISB MBA · Georgia Tech)

5. SUBWAY-BULLET SECTION MARKERS
   Each section tag uses a 2-letter subway bullet — 98's own brand
   language from the deck:
     SV · Services  (red)
     TM · Talent    (purple)
     WK · Work      (gold)
     AU · About     (pink)
   Matches the 98 deck's "AU / BD / OP" bullet system.

STILL IN (from v2.0)
--------------------
HERO
  · "NINETY EIGHT" stacked in 11 brand colors; each letter falls
    up with 100 ms stagger, pinning a colored node dot to its base
  · Tagline + meta fade in after the mark lands
  · Right column: Vignelli quote + milestone timeline
  · 3D train stage with auto-orbit-until-grab
  · Scroll cue

3D TRAIN
  · Three.js r160 + GLTFLoader + OrbitControls
  · Three-point lighting, gold ground disk, idle bob
  · Real download progress bar (27 MB asset)
  · Fallback geometry if GLB fails

SCROLL INTERACTIONS
  · Top progress bar, frosted-glass nav on scroll
  · IntersectionObserver reveal-in-view on every section
  · Count-up stats (00 → 35+, 00 → 12K+, 0 → 6×, 0 → 3)
  · Active-section nav-link underline

CUSTOM CURSOR
  · Black dot + white ring with mix-blend-mode: difference
  · Grows to a gold 72 px pill on any clickable element
  · Auto-disabled on touch / < 820 px

CULTURE STRIP
  · Infinite marquee, Olimpia-italic display, seamless loop

TYPOGRAPHY
  · Inter Tight · Instrument Serif Italic · IBM Plex Mono

RESPONSIVE
  · ≥ 1080 px full · tablet collapses columns · mobile nav hides
  · Fork stage keeps 620 px height at all widths

BRAND PALETTE (in the CSS as :root custom props)
  Royal  #1F4D8C   Cream  #F5F0E1
  Red    #DD3D38   Paper  #F4EFE0
  Gold   #F5B015   Carbon #0E0E10
  Green  #2F9E5E   Ink    #1F2330
  Purple #7E4DA5   Slate  #4B4F5C
  Orange #E87722
  Brown  #7B5D3F
  Pink   #E7497C   (added in v2.1 — matches the deck)

NOTES
  · logo.glb is saved and served but not yet placed in the layout.
    Next move: drop it into the hero's top-right as a rotating
    sculpture, or replace the SVG mark in the nav with it.
  · Swap NYC → Delhi Metro whenever you want — 2-min change.
  · Work tiles are representative; replace headlines with real
    case-study copy when ready.

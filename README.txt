NINETY-EIGHT · Website v2.10
============================
Hand-coded. No Figma. Real motion, real interaction.
v2.10 brings the actual proof of work onto the page — the 57
Instagram highlight covers 98 designed for clients are now live
in the Roster section, organized as Hospitality (72 brands) and
Brand Partners (26 brands). Brands without a cover get a placeholder
circle with their initials in a brand color, ready to swap.

WHAT CHANGED IN v2.10
---------------------
1. WORK SHOWCASE — REAL DELIVERABLES, NOT PILL LISTS
   Replaced the small "Brand Partners" / "Hospitality & IM" pill
   blocks (15 + 12 placeholder names) with a proper showcase:
     · Hospitality — 72 brands, 44 with the actual highlight
       covers we designed (Adda, Andreas, Baoji, Baris GK,
       Bayroute, Boccon Cheeni, Butter Room, Crusty Culture,
       Deja Brew, Duty Free, Farzi, Fig, Flaunt, Gastronomica,
       Getafix, Hard Rock Cafe, Hook, Iskate by Roseate, Kleo,
       La Roca, Limitless Cookhouse, Local, Madam Chutney,
       Mai Bao, Molecule, Monet, Nao by Bercos, Ophelia,
       Pa Pa Ya, Poetry, Pot Pot, Rang Punjab, Rizq, Sizzling
       Shack, Sky Lantern, Slay Coffee, Slique, TBSP, Thai Mama,
       The Weekend, UCH Rewind, Unplugged Courtyard, Vietnom,
       Wheaty)
     · Brand Partners — 26 brands across D2C / FMCG / ed-tech /
       collabs, 3 with covers (Betway, Indian Sneaker Fest,
       RD Accessories). Rest sit as initial-on-color placeholder
       circles until cover work or logos arrive.

2. HIGHLIGHTS FOLDER COPIED INTO PROJECT
   The 57 PNGs from the user's Insta Highlights folder are now
   at website-v2/highlights/ (~6.2 MB). They load lazily on
   scroll and are cropped to 78px circles (64px on mobile) so
   the page stays light.

3. SECTION HEADER UPDATED FOR THE NEW SCOPE
   "Talent · Proof of Work" → "Talent & Brands · Proof of Work."
   "People we've spoken for" → "People and brands we've spoken
   for." Note rewritten to acknowledge the 90+ brand showcase
   sitting below the 5-talent carousel.

4. PLACEHOLDER SYSTEM
   Brands without a cover get a circle with 1–3 letter initials
   on one of the brand-palette colors (deterministic by name
   hash). When you send the missing covers / logos later, drop
   the file in website-v2/highlights/ and replace one line in
   the Python brand-list to point at it — easy retrofit.

DATA SOURCE
   Brand list compiled from "98 Entertainment.xlsx" Sheet 1
   (77 rows of brand × service × creative-format × IG/PR/YT
   links). Founder-page data from Sheet 2 (podcasts, talks,
   college lectures, press) is parked for the founder-page
   build, which is on hold until Harsh shares richer bio,
   photos, school logos and article URLs.

WHAT CHANGED IN v2.9
--------------------
1. CO-FOUNDER FRAMING — REMOVED EVERYWHERE
   The "partner" Harsh referred to is romantic, not business.
   Stripped from the founder bio, the timeline (2024 + 2026
   entries), and the README. Title remains "Founder" (singular).

2. STUDIO NOTES — PROFESSIONALIZED
   The right-column hero timeline is now institutional and
   credentialed instead of personal-narrative. Out: "age 20",
   "cold-calling", "therapy", "unlearning", "first stable client:
   a cloud kitchen", "250 sq ft office". In: "Founded in Delhi
   NCR. The practice takes shape...", "Founder pauses operations
   to complete the ISB MBA", "A year of structured rebuilding.
   Frameworks before scale." Position: art + science, well-read,
   well-traveled, credentialed, stable.

3. ROSTER — SLIDING CAROUSEL
   Replaced the 5-card vertical grid with a horizontal scroll-
   snap carousel — one slide per talent (Ishant Sharma, Singh
   Sisters, Arjun Bhati, Avani Prashanth, Himanshu Nagar). Each
   slide is wider, with a stat block (Tests/Wickets/Followers
   for Ishant, Sisters/Captaincy/Awards for Singh Sisters, etc.)
   and tags. Native trackpad/swipe scrolling, plus prev/next
   arrow buttons, click-on-dot navigation, and arrow-key support
   when the rail has focus. Active dot + button-disabled state
   are kept in sync via a rAF-throttled scroll observer.

4. ABOUT — CLICK-TO-EXPAND BIO (native <dialog>)
   The visible founder bio is now short and credentials-forward:
   "Engineer by training, operator by trade. Built and ran 98 from
   2020-2023... paused for ISB MBA... now leads v2.0." A "Read
   more about Harsh →" pill opens a native <dialog> modal with
   the longer professional narrative — Background, Writing &
   Thought Leadership (The Economic Times column, Gen Z Economics
   blog with Prof. Tantri, documentary, playbook), and the three
   stories of "98". Closes on backdrop click, on the close button,
   or on Escape.

5. BRANDS-BLOCK LAYOUT FIX
   The Roster carousel sits full-width above. Brand Partners and
   Hospitality & IM brand pills now sit side-by-side in a
   2-column grid below it (.brands-block). Stacks on mobile.

NOTE
   The hospitality client list (Mai Bao, 1OAK, Junkyard, etc.)
   and the six work tiles ("Stories on the map") are flagged
   for content updates from Harsh — kept as-is until he provides
   the new copy.

WHAT CHANGED IN v2.8
--------------------
1. POSITIONING — "CREATIVE POWERHOUSE · BUSINESS PARTNERS FOR HIRE"
   Title and meta description updated. The site is no longer
   "a marketing & advertising studio" — it's a creative
   powerhouse. Strategy, marketing, advertising, execution,
   financial modeling, market research — explicitly NOT
   operational consulting.

2. SERVICES — REPLACED 6 PR-ERA ROWS WITH THE V2.0 SEVEN
   01 Strategy
   02 Consulting
   03 Marketing
   04 Advertising
   05 Execution
   06 Financial Modeling
   07 Market Research
   Section header note updated from "Six lines" to "Seven lines."
   The "we don't do operational consulting" boundary is stated
   in the section intro.

3. TIMELINE — REWRITTEN WITH THE REAL ARC
   Removed fabricated entries (2024 "Bombay studio opens" /
   2025 "Bangalore studio opens"). New arc:
     2020 — Founded by Harsh Arya, age 20. Cloud kitchen first.
     2021 — Pratima Singh joins as first talent client.
     2022 — Ishant Sharma signs exclusive. Restaurants on
            retainer across Delhi NCR, Bombay, Bangalore.
     2023 — 55+ brands. Founder pauses agency for ISB.
     2024 — ISB MBA. Met co-founder.
     2025 — Year of unlearning. Therapy, frameworks, structure.
     2026 — 98 v2.0, co-founded. Same conviction. Better
            scaffolding.

4. ROSTER — REFRAMED AS PROOF OF WORK
   Section header changes from "People we speak for" to
   "People we've spoken for." Talent management isn't a v2.0
   offering — but the deal-making muscle is, and the names
   (Ishant Sharma, Singh Sisters, Arjun Bhati, Avani
   Prashanth, Himanshu Nagar) are the receipts.

5. FOUNDER BIO — REWRITTEN
   New copy reflects the actual story: founded at 20, scaled
   to 55+ brands and a Test-cricketer roster by 2023, paused
   for ISB, met co-founder there, writes on Gen Z economics
   for The Economic Times. Co-founder card is stubbed in the
   HTML as a comment — uncomment + fill in when ready.

6. STATS — VERTICALS → SERVICE LINES
   "6× Verticals we run" → "7× Service lines we ship."
   "12K+ Media placements" left in but is a v1 PR-era number
   — flag to confirm or replace.

WHAT CHANGED IN v2.7
--------------------
1. STATION CHIP · "NOW APPROACHING"
   Bottom-right chip slides in when you scroll into a section,
   shows the line bullet (SV / TM / WK / AU / TR) and the
   section name, holds 2.2 s, then slides back out. Driven by
   IntersectionObserver — fires only on transition (last
   announced ID is cached), no per-frame work. The "best
   match" entry in each batch wins so adjacent sections
   don't fight each other.

2. MAGNETIC CTAs
   Three element classes pull toward the cursor when it gets
   within 110 px: nav .cta ("Let's Talk"), footer .cta-big
   (the email button), and every .svc-row .arrow ("Board →").
   Pull strength 0.32 of the offset. Throttled through one rAF
   tick per mousemove batch and skips offscreen elements, so
   the loop costs almost nothing. .pulling toggles the
   transition off while engaged (instant tracking) and back on
   when leaving the radius (smooth return to rest).
   Disabled on touch + small viewports.

3. STATION RAIL · RIGHT-EDGE WAYFINDING
   Fixed bullet stack on the right (SV / TM / WK / AU). The
   bullet for the section currently in view is full-size and
   ringed; the others sit dim and slightly smaller. A vertical
   1px track connects them. Each bullet is a clickable anchor
   to its section, with the section name revealing on hover.
   Hidden on the hero (fades in once you scroll past it).
   Hidden under 1080 px (uses the existing nav for mobile).

NOTE
   The IntersectionObserver picks the entry with the highest
   intersectionRatio in each batch, so adjacent sections don't
   announce-fight. Only one chip animation runs at a time.

WHAT CHANGED IN v2.6
--------------------
1. TRAIN — REMOVED ENTIRELY
   The pinned section breaker (`.pin-train`), the train canvas,
   the 27 MB `train.glb` payload, all the Three.js + GLTFLoader
   code, the importmap, and the 60-fps render loop are gone.
   `train.glb` and `logo.glb` still sit in the folder but the
   page no longer fetches them. The ticket-stub layout
   (Platform 98, Zigzag Express, Vignelli quote) goes with it
   — services now follows the hero directly.

2. LENIS — REMOVED
   The biggest cause of "laggy". Lenis hijacked every wheel
   event and rolled it through a 1.15 s easing curve, which
   feels heavy on a Mac trackpad where users expect native
   instant scroll. We're back on browser-native scroll.
   Anchor links use window.scrollTo({behavior:'smooth'}) —
   smooth on jumps, snappy on the wheel.

3. SCRIPT BLOCK SIMPLIFIED
   With three.js + Lenis gone, there is no more ES module
   block — single classic <script>, no importmap, no
   third-party JS at all (lucide / lenis / three are all out).
   File size 62.8 KB → 53.3 KB. Lines 1199 → 998.

4. DEAD FORK COMMENTS REMOVED
   The thread-builder no longer stashes window.__forkEntry
   (the v2.3 fork is long gone; this was a stale handoff).

WHAT CHANGED IN v2.5
--------------------
1. FOUNDED 2020 (not 2019)
   Year corrected everywhere: <title>, meta description, nav small
   text, hero meta strip, services PR copy, footer copyright,
   and the entire timeline (each year shifted forward by one).

2. THREE CITIES — DELHI NCR, BOMBAY, BANGALORE
   Replaced "Delhi · Noida · Mumbai" everywhere with the real
   operating footprint. Hero kicker, hero meta, About stat,
   and footer studio block all updated. The Greater Noida +
   Sector-63 addresses now live under one "Studio — Delhi NCR"
   block. Bombay (Bandra) by appointment. Bangalore by
   appointment — drop in a real street address when ready.

3. 55+ BRANDS (not 35+)
   Hero meta, About count-up stat (data-count="55"), meta
   description, and timeline all updated.

4. POSITIONING — MARKETING & ADVERTISING
   Primary positioning is now "Marketing & Advertising" instead
   of "PR & Talent Management". Title, meta description, hero
   kicker, hero meta strip, and footer service line all reframed.
   The six-row services list (PR / Talent Mgmt / Influencer /
   Brand Dev / Content / Partnerships) is unchanged — those are
   the lines on the platform.

5. NAV LOGO — PLACEHOLDER FLAGGED
   The generic arrow mark in the top-left has been swapped for
   an italic "98" so it at least references the brand. This is
   STILL a placeholder. Drop a real logo file into website-v2/
   as logo.svg (preferred) or logo.png and swap the .logo-mark
   span for an <img>.

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

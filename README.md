# Gokul Krishana — My Journey

A cinematic, scroll-driven 3D portfolio: one continuous road from a sunrise
hill-station down through school, college, a technology highway, projects,
achievements, and into a night-time city centre. One world. One car. One journey.

## Run it

```bash
npm install
npm run dev        # http://localhost:3000
npm run build      # production build
npm start          # serve the production build
```

## How it works

- **One continuous 3D world** — the road is a single canonical curve
  (`src/data/journey.ts`). Car, camera, landmarks, lighting, fog and sky are all
  keyed to a journey position `t` (0..1) along that same curve.
- **Scroll is the engine** — the page is a long runway; scrolling maps to `t`
  with critically-damped smoothing (`src/lib/useScrollDriver.ts`), so the car
  glides cinematically instead of jumping.
- **Story beats** — every landmark (school, college, tech billboards, project
  facilities, milestones, achievements, contact terminal) has a
  `positionAlongRoad` value in `src/data/content.ts`.
- **Day → night** — sky, sun, fog and neon intensity are graded continuously
  from sunrise (hills) to night (city) in `src/lib/environment.ts`.

## Replace the placeholder assets

Everything editable lives in **`src/data/content.ts`** — names, links, metrics,
projects, road positions. Drop your files into `public/` using these exact
paths (no code changes needed):

| Asset | Path | Status |
| --- | --- | --- |
| Personal photo (hero + hologram billboard) | `public/images/profile.png` | ✅ added |
| School photo — central staircase | `public/images/school-stairs.png` | ✅ added |
| School photo — courtyard | `public/images/school-courtyard.webp` | ✅ added |
| School name | edit `school.name` in `src/data/content.ts` | ✅ Crescent Castle |
| SRM building photo | `public/images/college.jpg` | ✅ added |
| SRM logo | `public/images/srm-logo.jpg` | ✅ added |
| Event photo (speaking) | `public/images/events/speaking.jpg` | ✅ added |
| Project screenshots | `public/images/projects/*.jpg` | placeholder |
| Certificate images | `public/images/certificates/*.jpg` | placeholder |
| Resume loading video | `public/video/hero.mp4` | ✅ added |
| Resume PDF | `public/resume/Gokul_Krishana_Resume.pdf` | ✅ added |

3D models are optional: drop `car.glb`, `mountains.glb`, `trees.glb`,
`city.glb` into `public/models/` to replace the stylized primitives later.

### Real landmarks built from your photos

- **Crescent Castle Public School** (t ≈ 0.105) — white wings with terracotta
  roof bands, twin red central staircases, courtyard lawn with the reading
  statue under its umbrella, trimmed topiary, lamp posts and the blue
  "CRESCENT CASTLE / PUBLIC SCHOOL" signage board on twin poles.
- **SRM IST** (t ≈ 0.20–0.26) — the pink/white classical gateway with columns,
  gold-trimmed pediment, name signage and the tree emblem that the car drives
  through, then the modern white tower with dark-glass grid and terracotta
  vertical fins, lawn, flag and campus info board.

### Project links

Each project's `github` / `demo` fields in `src/data/content.ts` currently
point at your GitHub profile — replace them with the real repo URLs.

### Move a landmark along the road

Every beat's position is data, not code: tweak `positionAlongRoad`
(`0..1` along the journey) or the `BEATS` map and the landmark, its content
panel and camera choreography all follow.

## Controls

- **Scroll / swipe** — drive the journey
- **Nav dots (right edge)** — smooth-scroll to any beat of the same road
- **DOWNLOAD RESUME** — plays the hero video, then downloads the PDF
  (re-click is blocked while active; `Esc` skips the cinematic)
- **prefers-reduced-motion** — calmer camera, shorter runway, same content

## Tech

Next.js 15 · React 19 · TypeScript · React Three Fiber · drei · three.js ·
Tailwind CSS · zero-ops journey store (no state library needed)

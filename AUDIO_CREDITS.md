# AUDIO CREDITS — Background Music Provenance

Every audio file used by this portfolio is documented here. All four tracks were
**downloaded from Mixkit** and are used under the
[Mixkit Stock Music Free License](https://mixkit.co/license/#musicFree), which
permits use in commercial and non-commercial projects, including websites, with
**no attribution required** (attribution is appreciated and is given here anyway).

Nothing else is used: no commercial recordings, no streamed third-party URLs, no
copyrighted artist releases. Every file is self-hosted from `public/audio/`, which
also keeps the site inside its own strict `Content-Security-Policy`
(`media-src 'self' blob:`) — no third-party audio host is contacted at runtime.

- **Source website:** https://mixkit.co/free-stock-music/
- **License:** Mixkit Stock Music Free License — https://mixkit.co/license/#musicFree
- **License summary:** free for use in commercial and personal projects, no
  attribution required, cannot be redistributed as-is / resold as stock, cannot be
  used to train generative models.
- **Date downloaded:** 2026-10-04
- **Processing:** trimmed, loudness-normalised (`loudnorm` to −20 LUFS, true peak
  −2.5 dBTP), 3–4 s fade in / 6–8 s fade out, encoded to 96 kbps 44.1 kHz stereo
  MP3. Only the optimised derivatives are committed to the repository.

---

## TRACK 01 — MAIN JOURNEY

| Field       | Value                                                                                    |
| ----------- | ---------------------------------------------------------------------------------------- |
| Track       | Dreaming Big                                                                             |
| Artist      | Ahjay Stelino                                                                            |
| Genre       | Film Score                                                                               |
| Source      | Mixkit — https://mixkit.co/free-stock-music/                                             |
| Source page | https://mixkit.co/free-stock-music/discover/dreaming-big-31/                            |
| License     | Mixkit Stock Music Free License — https://mixkit.co/license/#musicFree                   |
| Downloaded  | 2026-10-04                                                                               |
| Local file  | `public/audio/main-journey.mp3` (82.1 s, 96 kbps CBR, 44.1 kHz stereo)                   |
| Used in     | Hero, About, Journey Map, School                                                          |

## TRACK 02 — TECHNOLOGY

| Field       | Value                                                                                    |
| ----------- | ---------------------------------------------------------------------------------------- |
| Track       | Other World                                                                              |
| Artist      | Lily J                                                                                   |
| Genre       | Electronica                                                                              |
| Source      | Mixkit — https://mixkit.co/free-stock-music/                                             |
| Source page | https://mixkit.co/free-stock-music/discover/other-world-723/                             |
| License     | Mixkit Stock Music Free License — https://mixkit.co/license/#musicFree                   |
| Downloaded  | 2026-10-04                                                                               |
| Local file  | `public/audio/technology.mp3` (78.0 s, 96 kbps CBR, 44.1 kHz stereo)                     |
| Used in     | College, Technical Universe, Projects, FaceRecognition AI, SecureClip, Experience, Certifications |

## TRACK 03 — MOMENTS OF JOY

| Field       | Value                                                                                    |
| ----------- | ---------------------------------------------------------------------------------------- |
| Track       | Slow Pop                                                                                 |
| Artist      | Arulo                                                                                    |
| Genre       | Dream Pop                                                                                |
| Source      | Mixkit — https://mixkit.co/free-stock-music/                                             |
| Source page | https://mixkit.co/free-stock-music/discover/slow-pop-351/                                |
| License     | Mixkit Stock Music Free License — https://mixkit.co/license/#musicFree                   |
| Downloaded  | 2026-10-04                                                                               |
| Local file  | `public/audio/moments-of-joy.mp3` (80.0 s, 96 kbps CBR, 44.1 kHz stereo)                 |
| Used in     | Beyond Code, How I Think, Philosophy, Gallery, off-platform / social links               |

## TRACK 04 — FINAL JOURNEY

| Field       | Value                                                                                    |
| ----------- | ---------------------------------------------------------------------------------------- |
| Track       | Possible Dreams                                                                         |
| Artist      | Eugenio Mininni                                                                          |
| Genre       | Classical                                                                                |
| Source      | Mixkit — https://mixkit.co/free-stock-music/                                             |
| Source page | https://mixkit.co/free-stock-music/discover/possible-dreams-599/                         |
| License     | Mixkit Stock Music Free License — https://mixkit.co/license/#musicFree                   |
| Downloaded  | 2026-10-04                                                                               |
| Local file  | `public/audio/final-journey.mp3` (84.0 s, 96 kbps CBR, 44.1 kHz stereo)                  |
| Used in     | Contact, Final CTA                                                                       |

---

## Section → track map (as implemented)

| Section                                     | Track         | Scene            |
| ------------------------------------------- | ------------- | ---------------- |
| Hero                                        | Main Journey  | `hero` (≈15 %)   |
| About / Journey Map / School                | Main Journey  | `warm`           |
| College                                     | Technology    | `tech`           |
| Technical Universe / Projects               | Technology    | `tech`           |
| FaceRecognition AI                          | Technology    | `tech` (lifted)  |
| SecureClip                                  | Technology    | `tech` (darkened)|
| Experience / Certifications                 | Technology    | `tech`           |
| Beyond Code / How I Think / Philosophy      | Moments Joy   | `calm`           |
| Contact / Final CTA                         | Final Journey | `ending`         |

`hero` sits deliberately low so the background video and the hero copy
(GOKUL KRISHANA / Cybersecurity Student / Full-Stack Developer / AI-ML Builder)
stay the primary experience. Audio is pure enhancement: the site is fully
functional with sound off, which is the default until the visitor asks for it.

## Files not used / removed

The repository contains **no other** audio assets. All music lives under
`public/audio/`; there are no stray MP3s, temporary downloads, duplicate tracks or
third-party audio URLs anywhere in the project.
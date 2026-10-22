# Filmiq

A complete browser-based soccer film-room demo, rebuilt for ADV 332. Includes the supplied Filmiq brand, a public landing page, coach workspace, real video import, and connected player and parent previews.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fvishanthashok%2Fadv-332-project)

## Deploy without writing code

1. Click **Deploy with Vercel** above, or import this repository at https://vercel.com/new.
2. Select the **main** branch and leave the root directory blank.
3. Vercel detects **Vite**. Build: `npm run build`. Output: `dist`.
4. Click **Deploy**. No environment variables, database, API keys, or paid AI service are required.

`vercel.json` includes route fallbacks, so opening or refreshing a film-room URL works after deployment.

## A two-minute presentation

1. Open the homepage and select **Step into your film room**.
2. Select **Pick up the review**. The included five-minute Utrecht–Ajax video starts at the first curated moment, 2:00.
3. Select **Play moment**, add an arrow or circle to a paused frame, and **Keep for Maya**.
4. Select **Publish**, then **Publish feedback**. This publishes within the browser workspace.
5. Open **Player view**, watch the clip, mark it reviewed, and complete a training task.
6. Open **Parent view** for the plain-language family summary, or **Development** for actual review and training counts.
7. To demonstrate upload, import any MP4/WebM, or download the bundled demo video using the link in its film room. Imported footage starts with an empty queue; use **Mark a new moment** to create a time-coded coaching clip.

The six curated demo moments also have **downloadable MP4 excerpts**. Download links remain available only while the original curated start/end ranges are unchanged.

## What works

- Real video file import, browser codec validation, native playback, seeking, playback of timestamped ranges.
- Local IndexedDB storage of videos, match metadata, roster, notes, annotations, review decisions, and training completion.
- Searchable match library and moment queue, category tagging, player assignment, editable start/end times, notes, cues, and drills.
- Arrow and ellipse annotations on paused footage, annotation undo, Keep/Skip decisions, decision undo, and batch publication.
- Player selection, coach-published feedback, review acknowledgement, and training checklist.
- Parent summaries, printable summary, and development activity counts.
- Player creation/editing, club settings, and coaching CSV exports with formula-injection protection.
- Original Filmiq logo, responsive layouts, accessible form labels, keyboard focus handling, reduced-motion support, and mobile navigation.

## Deliberate demo boundaries

- **No machine learning.** The demo video has curated, labeled film-study prompts. New uploads require manual tagging; no analysis is silently fabricated.
- **No accounts or cloud storage.** Data remains in the current browser on the current origin. Player/parent views are same-browser previews, not authenticated portals. Publication sends no messages.
- Clearing site data or moving to another browser/device loses access to locally stored work. Keep original video files and export notes as a backup. Persistent-storage permission depends on the browser.
- Supports videos up to 1 GB, subject to available browser quota. H.264 MP4 and WebM are recommended; MOV/HEVC compatibility varies by browser. Long videos need adequate local disk space.
- Manual clips are stored as start/end ranges over the original video, not rendered new files. Six fixed demo clips are supplied as downloadable MP4s; arbitrary uploaded-clip rendering is not implemented.
- No billing, camera-platform integrations, voice recording, AI chat, or player performance scoring.

## Demo video

[Utrecht v Ajax, December 2018 — source and download](https://commons.wikimedia.org/wiki/File:Utrecht_v_Ajax_Dec_2018.webm)

Video by FCUFAN, CC BY 3.0. Bundled video is re-encoded; six excerpts and a poster are included. All credits and transformation details are in [ATTRIBUTION.md](ATTRIBUTION.md). Roster identities and training assignments are fictional and are not identities of athletes in the footage.

## Local development

Node 22.12+ (Node 24 also supported).

```sh
npm ci
npm run dev
```

## Validation

```sh
npm test
npm run build
npm run preview
```

Automated tests cover stored video persistence, match/media cleanup, review and training persistence, range validation, time conversion, safe CSV exports, and prevention of stale demo-clip downloads. GitHub Actions runs tests and a production build.

Built with React, TypeScript, Vite, IndexedDB, and Lucide.

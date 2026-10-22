# Filmiq

A complete browser-based soccer film-room demo, rebuilt for ADV 332. Includes the supplied Filmiq brand, a public landing page, coach workspace, real video import, and connected player and parent previews.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fvishanthashok%2Fadv-332-project)

## Deploy without writing code

1. Click **Deploy with Vercel** above, or import this repository at https://vercel.com/new.
2. Select the **main** branch and leave the root directory blank.
3. Vercel detects **Vite**. Build: `npm run build`. Output: `dist`.
4. Click **Deploy**. No environment variables, database, API keys, or paid AI service are required.

`vercel.json` includes route fallbacks, so opening or refreshing a film-room URL works after deployment.

## A five-minute presentation

1. Enter the workspace and select **Match intelligence** under **DEMO ANALYSIS** in the left navigation. Show the match summary, three strengths and three development focuses.
2. Click **0:37–0:50 Watch evidence**. The existing clip viewer plays that passage of the bundled PSG–Barcelona video. Close the viewer.
3. Open **Player heatmaps**. Select Hakimi, switch between first and second half, then select Safonov and toggle sample points. The coordinates are deterministic positional examples, not tracking data.
4. Open **Development radar**. Select a player, compare the five previous/current demo values and click a dimension for its coaching explanation and video reference. Both profiles are fictional; no previous match has been analyzed.
5. Return to **Match intelligence** and choose **Build a training drill** under a development focus. Generate a drill, then generate its alternate variation. Each plan includes duration, setup, instructions and coaching cues.
6. Select **Assign & publish feedback**, choose a roster player and drill, and edit the coaching cue. Publish, then select **Open player inbox**. The correct player is selected automatically.
7. Watch the published source clip, mark it reviewed and complete the drill checklist. Refresh to demonstrate persistence. The parent view and existing development activity counts also use the same published feedback.
8. The original film room, annotations, Keep/Skip, roster management, video import and CSV export remain available. Imported videos require manual tagging.

The six curated demo moments also have **downloadable MP4 excerpts** (13–21 seconds each), with individual thumbnails. Download links remain available only while the original curated start/end ranges are unchanged.

## What works

- AI Match Intelligence demo: curated summary, three strengths, three weaknesses, six timestamped video references.
- Interactive SVG player heatmaps with seeded role-based coordinates, starting-player selection, half toggle and sample-point toggle.
- Five-axis player development radar with fictional previous/current comparison, accessible numeric table and evidence explanations.
- Template-based drill generation: two variations per weakness, downloadable plan, coach-edited feedback publishing into the existing player inbox.

- Real video file import, browser codec validation, native playback, seeking, playback of timestamped ranges.
- Local IndexedDB storage of videos, match metadata, roster, notes, annotations, review decisions, and training completion. Workspace metadata also has a localStorage backup/fallback; video blobs remain in IndexedDB.
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
- No billing, camera-platform integrations, voice recording, AI chat, or measured player performance scoring. Heatmaps and radar values are explicitly labeled DEMO DATA; drill generation uses seeded templates. Radar references are team-level teaching examples, not verified individual performance evidence.

## Demo video

[PSG–Barcelona — compressed demo MP4](https://raw.githubusercontent.com/vishanthashok/adv-332-project/main/public/psg-barcelona-demo.mp4)

User-supplied CBS Sports Golazo footage. The 1080p original is compressed to a 540p H.264/AAC full video, with six 720p excerpts and individual thumbnails. Broadcaster watermarks remain visible. Credits and transformation details are in [ATTRIBUTION.md](ATTRIBUTION.md). The roster includes both confirmed matchday squads (46 players), with club, shirt number, and starter/bench status. Analysis and drills are curated demo suggestions, not statements from club staff. No Creative Commons license is claimed for this source.

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

Automated tests cover seeded heatmap determinism and bounds, complete training templates, radar dimensions, publication into the persisted player inbox, stored video persistence, match/media cleanup, review and training persistence, range validation, time conversion, safe CSV exports, and prevention of stale demo-clip downloads. GitHub Actions runs tests and a production build.

Built with React, TypeScript, Vite, IndexedDB, and Lucide.

## Architecture and new demo modules

The existing React/TypeScript/Vite single-page app uses a small pathname router in `src/App.tsx`, shared workspace context in `src/context.tsx`, and IndexedDB data/media stores in `src/data.ts`. Existing routes and data models remain compatible; no backend or additional dependency was introduced.

`src/demoAnalysis.ts` contains deterministic demo coordinates, comparison profiles, curated coaching themes, six drill templates and the feedback factory. `src/AnalysisViews.tsx` provides `/app/intelligence`, `/app/heatmaps`, `/app/radar` and `/app/drills` (optionally `/app/drills/:weakness`). It reuses the existing `ClipModal`, workspace update/save flow and `Moment` model. `/app/player/:playerId` opens the existing inbox for the assigned player. Scoped styling is in `src/analysis.css`.

Feedback is stored as an ordinary published `Moment`, so it participates in existing player/parent views, review acknowledgement, training completion, film-room editing and CSV export. The source timestamp remains attached to the current video; generated feedback does not replace the original curated moment.

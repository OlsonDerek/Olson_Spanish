# System Improvement Suggestions (Prioritized Roadmap)

Legend:
- P0: Immediate / foundational (unblocks other work, high leverage)
- P1: High value (user impact or risk reduction soon)
- P2: Medium (quality / scalability / nice-to-have now)
- P3: Future / strategic enhancements

---
## P0 – Immediate Foundations
1. Centralize Progress Logic
   - Create a ProgressContext (merge ever + session progress) to replace duplicated completion logic in `SideNav`, `FullNavView`, ad‑hoc localStorage reads.
   - Single schema: `progress.{type}Reviewed.{weekId}` + `progress.schemaVersion`.
   - Provide API: `startSession(weekIds)`, `stopSession()`, `resetSession()`, `toggleReviewed(weekId, itemId, kind)`.
2. Deduplicate Completion & Date Formatting Utilities
   - Extract `isWeekFullyReviewed`, `isUnitFullyReviewed`, `isCourseFullyReviewed`, and `formatWeekRange` into `/src/utils/progress.js` + `/src/utils/date.js`.
3. LocalStorage Wrapper & Migration
   - Wrapper with try/catch + in‑memory fallback (Safari private mode resilience).
   - Migrate old `session.*` keys into new unified progress keys.
4. Add Basic Test Harness
   - Introduce `vitest` + `@testing-library/preact`.
   - Tests: `useStudySession` (start/stop/merge), phrase highlighting, progress calculations.
5. Introduce Prettier + Husky + lint-staged
   - Enforce formatting + prevent committing failing lint/tests.

## P1 – High Value Enhancements
6. Accessibility & Focus Management
   - Modal focus trap (VoiceSelector, CalendarNav) + restore focus on close.
   - Verify all icon buttons have `aria-label`; enlarge tap targets for selection bubbles.
7. Performance Optimizations
   - Memoize per-week filtered arrays in `WeekView` (avoid repeated `filter` inside maps).
   - Batch localStorage writes (debounced) when toggling many items.
   - Dynamic import rarely used components (VoiceSelector, CalendarNav) to reduce initial bundle.
8. Analytics Hardening
   - Add `initAnalytics()` early + inject app version (define at build via Vite `define`).
   - Add consent flow: default to pending until accepted.
   - Standardize event shape: include `selected_week_count`, `session_active` flag.
9. Security / HTML Safety
   - Sanitize `highlightedPhrase` output (tokenize instead of regex replace with `dangerouslySetInnerHTML`).
10. PWA Scaffold
   - Add `vite-plugin-pwa`, manifest, offline caching for config + week JSON + static assets.

## P2 – Medium Priority Quality & UX
11. Keyboard Shortcuts / Power Study Mode
   - Shortcuts: Space/Enter cycle, P play audio, R mark reviewed, S start/stop session.
   - Full-screen "Study Mode" (hides nav, focuses cards, dim background).
12. Progress Visualization Page
   - Daily streak, minutes studied, items learned per week (line/bar charts; simple SVG first).
13. Enhanced Audio Controls
   - VoiceSelector: rate & pitch sliders (persist to `prefs.tts.rate/pitch`).
   - Preload voices list on idle to reduce modal latency.
14. Virtualized Lists
   - Introduce virtualization for large multi-week selections (e.g., `preact-virtual-list`).
15. Config Schema Validation
   - Use a lightweight validator (e.g., `zod` optional) or manual runtime checks; surface user-friendly error if malformed.
16. Export / Import Progress
   - JSON download & restore to allow user backups.
17. Unified Date & Time Utilities
   - Centralize date formatting; avoid multiple inline `new Date()` + `Intl.DateTimeFormat` patterns.
18. Content Index Build Step
   - Precompute week metadata (counts, date ranges) at build for faster runtime rendering.

## P3 – Strategic / Future Features
19. Spaced Repetition (SRS) Layer
   - Per item: `nextReview`, `easeFactor`, `streak`; separate review queue.
20. Difficulty & Mastery States
   - Distinguish "reviewed" vs "mastered" (e.g., 3 successful cycles) and filter study sets.
21. Adaptive Session Goals
   - Suggest daily minute / item target based on rolling 7‑day average.
22. Multi-Language UI / i18n Foundation
   - Externalize UI strings; minimal translation loader.
23. Search & Filtering
   - Global search bar (filter by part of speech, difficulty, status).
24. Audio Queue & History
   - Queue multiple cards; show last played history.
25. Advanced Analytics Dashboard
   - Cohort retention (days active after first session), item distribution by part of speech.
26. SSO / User Accounts (if moving beyond local-only)
   - Abstract storage to allow remote sync; add anonymous ID hashing.
27. Theming / Dark Mode
   - CSS variables + user preference detection.
28. Gamification Elements
   - Badges for streaks, mastery counts, session milestones.

## Technical Debt / Watchlist
- Multiple regex passes in phrase highlighting (optimize when scaling content).
- Potential memory growth with large in-memory Sets (monitor if weeks grow dramatically).
- Duplicate logic for reviewed state (addressed by P0 changes).

## Suggested Implementation Order (Condensed)
1. P0 (centralize progress + tests + migration) → baseline stability.
2. Accessibility & performance batch (P1 items 6–8 + 7 partial) → user experience.
3. PWA + sanitization + analytics enrichment.
4. UX & visualization (shortcuts, study mode, progress page).
5. Virtualization + audio enhancements + export/import.
6. Strategic feature wave: SRS + mastery + adaptive goals.
7. i18n & theming → broader audience.

## Minimal Initial Task Breakdown (for P0 #1 Centralize Progress)
- Create `src/context/ProgressContext.jsx`.
- Move `useStudySession` logic inside or adapt it to use context provider.
- Replace local completion calculations in `SideNav` & `FullNavView` with context selectors.
- Write tests verifying merge semantics.
- Migrate old keys (one-time function executed in context init).

---
Generated: 2025-08-10

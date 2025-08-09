# Mobile-First Spanish Class App - System Requirements PRD

## 1) Summary & Goals

A super-simple, mobile-first web app for a once-a-week high school elective. The app shows the current week's vocabulary and example phrases, lets students tap to reveal meanings and conjugations, and allows quick "reviewed this session" check-offs. No login, no backend — just a static deploy with one editable config file you can update weekly.

**Core goals**
* Be fast, dead simple, and delightful on phones.
* One tap reveals meaning; another tap shows conjugations; another returns to Spanish.
* Press-to-play audio for phrases.
* Per-session review checkmarks with an easy reset.
* "Single source of truth" via a weekly config file (JSON).

**Non-goals**
* Accounts, grades, or analytics.
* Teacher dashboard or per-student tracking beyond a local device session.

## 2) Users & Constraints

**Primary users:** 13–18 year-old students using personal phones.
**Environment:** School Wi-Fi/cellular, mixed iOS/Android, short sessions (5–15 min).
**Constraint:** App must run entirely client-side (static hosting). No database.

## 3) Scope of Features

### 3.1 Must-Haves

1. **Weekly Vocab Browser**
   * Display only the current week by default (from config).
   * Each vocab item is a tappable card that cycles states:
     * **State A:** Spanish (default)
     * **State B:** English translation
     * **State C:** Conjugations/Forms (if present)
     * **State A again**
   * Cards show a subtle "reviewed" check when the student marks them during the session.

2. **Phrases/Sentences with Audio**
   * List of example phrases that use this week's vocab (highlight matched words).
   * **Play button**: speak phrase in Spanish.
   * Tap to mark a phrase as reviewed (per session).

3. **Session Review Tracking**
   * A floating **"Session progress"** bar with counts (e.g., "Words: 6/20 · Phrases: 3/8").
   * **Reset Session** button clears current checkmarks.
   * Session state persists in **localStorage** and auto-expires after 24 hours or manual reset.

4. **One Config File Update**
   * All content controlled by a single `config.json` checked into the repo and deployed with the site.

### 3.2 Nice-to-Haves (V1.1+)

* **Week Picker** to revisit prior weeks (hidden by default, toggleable).
* **PWA** install + offline cache (static assets + current week config).
* **Dark mode** toggle.
* **Speed control** for audio playback (0.75x, 1x, 1.25x).
* **Shuffle mode** for vocab drilling.

## 4) Accessibility & UX Principles

* **Mobile-first** layout; target comfortable tap areas (44×44 px).
* **WCAG 2.1 AA**: color contrast, focus states, screen reader labels (ARIA), logical heading order.
* **Tap cycle** must be obvious (micro-animation + helper text "tap to cycle" on first use).
* **Audio**: Play only on user gesture; show **Play/Stop** and a minimal progress bar; provide **phonetic hint** or slow speak option if feasible.

## 5) Information Architecture

* **Home / Week View**
  * Header: Week title + info (e.g., "Week 6: La Comida")
  * Side nav for week browsing + Calendar nav for easy week selection
  * Tabs or segmented buttons: **Vocabulary** | **Phrases**
  * Content grid/list:
    * Vocabulary cards
    * Phrase list with play buttons
  * Footer / floating bar: Session progress + Reset

* **Week Selector** (side nav + calendar nav)
  * Side navigation with list of weeks (title + date range)
  * Calendar view showing weeks with content available

## 6) Technical Requirements

### 6.1 Stack & Architecture
* **Frontend**: Preact + Vite for small bundle size (<150KB gzipped)
* **Styling**: CSS modules or styled-components for component isolation
* **State Management**: Simple state + localStorage for session persistence
* **Audio**: Web Speech API (speechSynthesis) with MP3 fallback
* **Deployment**: Static hosting (Vercel, Netlify, GitHub Pages)

### 6.2 Config System
* Single `config.json` file controls all content
* Weekly configs easily addable with consistent schema
* Automatic current week detection via `current_week_id`
* Schema validation to prevent deployment issues

### 6.3 Navigation Requirements
* **Side Navigation**: Collapsible sidebar with week list
* **Calendar Navigation**: Monthly calendar view showing available weeks
* **Mobile-first**: Touch-friendly navigation with proper gesture support
* **Week Switching**: Seamless transitions between weeks

### 6.4 Performance Requirements
* Time to interactive < 2s on mid-range phones
* Bundle size < 150KB gzipped
* Lazy loading for non-current week content
* Efficient caching strategy

## 7) Content Model

**File:** `/config.json`

```json
{
  "app": {
    "title": "Spanish Weekly",
    "current_week_id": "2025-09-01",
    "audio": {
      "tts": { "enabled": true, "voiceHint": "es-ES" },
      "preferMp3": false
    }
  },
  "weeks": [
    {
      "id": "2025-09-01",
      "title": "Week 1: Saludos",
      "dateRange": "Sep 1–7, 2025",
      "vocab": [
        {
          "id": "hola",
          "spanish": "hola",
          "english": "hello",
          "type": "interjection"
        },
        {
          "id": "ser",
          "spanish": "ser",
          "english": "to be (essential)",
          "type": "verb",
          "conjugations": {
            "present": {
              "yo": "soy", "tú": "eres", "él/ella": "es",
              "nosotros": "somos", "vosotros": "sois", "ellos": "son"
            }
          }
        }
      ],
      "phrases": [
        {
          "id": "p1",
          "spanish": "Hola, ¿cómo estás?",
          "english": "Hi, how are you?",
          "audioUrl": ""
        }
      ]
    }
  ]
}
```

## 8) Acceptance Criteria

* [ ] Load on iOS Safari and Android Chrome without install prompts
* [ ] Vocab tap cycles A → B → C → A (C only when conjugations exist)
* [ ] Phrases play on tap with visible play/stop state
* [ ] Side nav allows easy week browsing
* [ ] Calendar nav shows available weeks clearly
* [ ] Checkmarks persist across page reloads during the same day
* [ ] Reset Session clears all checkmarks for the current week
* [ ] Changing `current_week_id` in `config.json` changes the default view
* [ ] All interactive targets pass 44×44 px size check
* [ ] Screen reader announces card state and navigation elements

## 9) Teacher Operations

* Edit `/config.json`:
  * Change `current_week_id` to this week
  * Add/update a `weeks[]` entry with new `vocab[]` and `phrases[]`
  * Optionally add `audioUrl` MP3s to `/audio/week-XXXX/`
* Commit and deploy
* Schema validation prevents broken deployments
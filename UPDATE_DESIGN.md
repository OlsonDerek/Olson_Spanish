# top priorities (do these first)

1. **Kill redundancy on item pills.** The gray “Week 1: Saludos” badge on each vocab row is noisy. Show it **only when multiple weeks are selected**; otherwise hide.

   * Pill bg `#22304A`, text `#D1D5DB`, border `#27324A`.

2. **Differentiate vocab vs phrases.** The blue play button on vocab rows implies audio. Reserve **play** for phrases only.

   * Vocab rows: no right control; tap anywhere to cycle.
   * Phrase rows: right-side play button `#3B82F6` (hover `#2563EB`), icon `#0B1020`.

3. **Make “2 weeks selected” obvious + actionable.** Replace the vague header line with a compact filter chip group:

   * “Selected:” \[Week 1] \[Week 2] · **Clear**
   * Chip bg `#22304A`, text `#D1D5DB`; “Clear” link `#9CA3AF` → hover `#D1D5DB`.

4. **Reduce checkmark dominance.** The green checks pull focus. Scale to 18–20px, align right (after play on phrases; far right on vocab).

   * Check fg `#22C55E`; subtle circle bg `#12231A`; border `#1E3A28`.

5. **Progress footer: show counts, not prose.**

   * Two counters: **Words 3/7** · **Phrases 0/5** with a 8px mini bar under each.
   * Footer bg `#0F1420`, top border `#27324A`, text `#D1D5DB`, bar track `#27324A`, fill `#3B82F6`.

6. **Hero section: fewer ornaments, clearer CTA.**

   * H1 “Week 1: Saludos”, tabs below, then 1 primary button **Study Week 1**. Remove rounded “0% COMPLETE” tile; show linear progress (8px) + counts (e.g., **0/7 words · 0/5 phrases**).
   * Button bg `#3B82F6` → hover `#2563EB`, text `#0B1020`.

7. **Typography & spacing.**

   * H1 22/28 `#F3F4F6`; H2 18/24 `#D1D5DB`; body 16/24 `#D1D5DB`; meta 13/18 `#9CA3AF`.
   * Remove italics on part-of-speech; use **small-caps** or caps: “INTERJECTION” in `#9CA3AF`.
   * 16px page padding; 16–20px card padding; 12–16px vertical gaps; card radius 16px.

8. **Tabs styling.** Current tabs look clicky but low-contrast. Use pill tabs on a rail.

   * Rail bg `#22304A`; active tab bg `#3B82F6`, text `#0B1020`; inactive tab text `#D1D5DB`; focus ring `#BFDBFE`.

# component tweaks

**Navigation drawer**

* Selected row bg `#1B2332`, 2px left bar `#3B82F6`.
* Title `#F3F4F6`, meta `#9CA3AF`.
* Shrink green completion check to 16px; place at far right; use same success colors as above.
* Divider `#27324A`. Minimum row height 48px.

**List rows (vocab/phrases)**

* Row bg `#161C28`, hover `#1B2332`, border `#27324A`.
* Word (strong) `#F3F4F6`; part-of-speech `#9CA3AF`.
* On tap cycle, animate 150–200ms fade/slide; show tiny helper text once: “tap to cycle”.

**Focus & a11y**

* All interactive elements get a **2px** focus ring `#BFDBFE` on outside; hit areas ≥44px.
* Contrast: keep text ≥ `#D1D5DB` on `#161C28`.

# color tokens (finalize)

* **Backgrounds:** page `#0F1420`, card `#161C28`, elevated `#1B2332`, border `#27324A`
* **Text:** strong `#F3F4F6`, body `#D1D5DB`, muted `#9CA3AF`, inverse `#0B1020`
* **Brand:** primary `#3B82F6`, hover `#2563EB`, focus `#BFDBFE`
* **Semantic:** success `#22C55E`, warning `#F59E0B`, danger `#EF4444`, info `#38BDF8`
* **Chips/rails:** `#22304A`

# microcopy

* Replace “Words reviewed · Phrases reviewed” with compact counters: **Words 3/7 · Phrases 0/5**.
* Replace “2 weeks selected” with **“Selected: Week 1, Week 2”** + **Clear**.

Tighten those and it’ll feel purpose-built, obvious, and quick for thumbs.

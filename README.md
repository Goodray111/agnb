# Yinuo Fan Site

A fan site for Yinuo (Xu Bicheng), marksman for Chengdu AG Super Play. A pure static single-page website — no server required, just open in a browser.

## Structure

```
my-website/
├─ index.html          Single-page entry (12 chapters + navigation + footer)
├─ css/
│  └─ style.css        All styles (theme variables / components / responsive)
├─ js/
│  └─ main.js          Interactions (theme toggle / view switching / games / gallery / message board)
├─ assets/             Images and videos
└─ README.md
```

## Navigation

The home page is a directory: below the hero are 12 entry cards (About / Story / Timeline / Highlights / Stats / Schedule / Quotes / Play / Gallery / Message / Watch / Back Cover). Click a card to jump to that chapter. The top navigation bar also switches directly, with hash routing (e.g. `#stats`) for sharing.

## Chapters

1. **About Yinuo** — name / birthday / hometown / team / role / signature heroes + intro
2. **Growth Story** — from a police-academy boy to the "old man marksman"
3. **Career Timeline** — a clickable year timeline (2017–2026)
4. **Highlights** — iconic plays, pentakills, FMVP moments
5. **Career Stats** — 7 titles / 6 runner-up, milestones, season-by-season data, hexagon chart
6. **Schedule** — 2026 calendar + recent matches
7. **Quotes** — words from The People interview
8. **Play** — quiz, guess-the-hero, matching, trivia
9. **Gallery** — trophies, debut, finals posters (click to enlarge)
10. **Message Board** — local demo
11. **Watch** — official live streaming + replays
12. **Back Cover**

## Sources

- Baidu Baike — "Xu Bicheng"
- Zhibo8
- Hupu — The People interview
- Tencent Honor of Kings / KPL
- Moegirl Commons (CC BY-NC-SA 4.0)

> Used for non-commercial fan display. Contact to remove if needed.

## Design

- Primary: AG red `#d81e2c` + dark gray + white, gold accents
- Fixed top navigation, home banner, card layout, vertical timeline, gallery lightbox
- Dark / light theme (toggle button, saved in localStorage)
- Responsive for mobile

## Deployed

- GitHub Pages: https://goodray111.github.io/agnb/

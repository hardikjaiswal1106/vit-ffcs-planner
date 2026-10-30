# FFCS Planner — 4th Sem, VIT Vellore

Offline timetable planner for FFCS registration. No backend, no login — open `index.html`.

## Courses

| Code | Course | Credits | Type |
|------|--------|---------|------|
| BACSE201 | Models of Computation | 4 | Theory |
| BACSE204 | Software Engineering | 4 | Theory + Lab |
| BACSE205 | Fundamentals of AIML | 4 | Theory + Lab |
| BACSE325 | Full Stack | 4 | Theory + Lab |
| BAHUM103 | Ethics and Values | 2 | Theory |
| BASTS102 | Skills Practice II | 1 | Theory, pick a vendor |
| — | HSM Elective | 3 | Theory, pick a course |

## How it works

Rank the faculty you want for each course. Generate builds up to 50 clash-free
combinations, using **only** the names you ranked. Leave a course unranked and any
faculty may fill it. Courses that can't fit are still shown, with what blocked them.

A day counts as lab-free when it has no lab, even if it has theory.

## Interactions

| | |
|---|---|
| Hover any class | Highlights that course across the whole week |
| Click a class or legend chip | Locks the highlight on |
| Hover a "doesn't fit" flag | Knocks the cells standing in its way |
| `←` `→` | Previous / next combination |
| `G` | Generate |
| `T` | Light / dark |
| `⌘K` or `/` | Find a faculty across every course |
| `Esc` | Close, or release a locked highlight |

Priorities, elective picks and theme are saved in the browser.

## Files

- `index.html` — page shell
- `style.css` — design system and layout
- `data.js` — slot grid, clash engine, course and faculty data
- `app.js` — generator and interface

# Sports Performance Analytics Dashboard

> F1. MotoGP. Tennis. Real Madrid. San Jose Sharks. Equestrian. One dashboard, live.
> Live at: https://ria0304.github.io/Sports-performance-analytics-dashboard/

![TypeScript](https://img.shields.io/badge/TypeScript-React-blue)
![Static](https://img.shields.io/badge/Backend-None%20needed-green)
![License](https://img.shields.io/badge/License-MIT-green)

## What it does
A single-page dashboard with 6 tabs, each polling live data every 30s —
**directly from the browser**, with no backend of its own:

| Tab | Source | Data |
|---|---|---|
| F1 | Jolpica-F1 (Ergast-compatible, free) | Driver standings, next race, last race results |
| MotoGP | TheSportsDB | Upcoming & recent races |
| Tennis | TheSportsDB (ATP) | Upcoming & recent tournaments |
| Real Madrid | TheSportsDB | Fixtures, results, La Liga table |
| San Jose Sharks | TheSportsDB | Games, results, NHL standings |
| Equestrian | TheSportsDB | Upcoming & recent events |

Every tab shows a status badge — **Live**, **Live (cached)**, **Stale cache**, or
**Offline fallback** — so you always know how fresh the data is. If a public
API is briefly down, the last good response (persisted to `localStorage`)
is shown instead of a blank tab.

## Why this works on GitHub Pages with no server
GitHub Pages only serves static files, so this dashboard calls the free
public sports APIs **straight from the user's browser** instead of
routing through a backend Claude would have to host separately. Nothing
to deploy, nothing to pay for, nothing to keep running — push to `main`
and GitHub Actions builds + publishes automatically.

## Project structure
```
├── src/
│   ├── pages/
│   │   ├── Dashboard.tsx    # 6-tab shell
│   │   ├── Login.tsx        # local-only demo login (no real backend auth)
│   │   └── panels/          # one panel component per sport
│   ├── hooks/useLiveData.ts # polling hook (pauses on hidden tab)
│   ├── lib/
│   │   ├── api.ts           # per-sport live fetchers — the core of the app
│   │   ├── sportsdb.ts      # TheSportsDB helper (team/league id resolution)
│   │   └── cache.ts         # localStorage cache + live/stale/fallback logic
│   └── components/          # shared UI (LiveBadge, card, tabs)
├── server/                  # OPTIONAL legacy Express backend — not used by
│                             # the deployed site, kept only if you'd rather
│                             # proxy these APIs through your own server later
└── .github/workflows/main.yml  # auto-builds & deploys to GitHub Pages on push
```

## Run locally
```bash
npm install
npm run dev
```
Open http://localhost:3000 — it talks to the live public APIs immediately,
no `.env` or backend setup required.

## Deploy
Already wired up: `.github/workflows/main.yml` builds and publishes to
GitHub Pages on every push to `main`. Base path is set to
`/Sports-performance-analytics-dashboard/` in `vite.config.ts` and
`src/App.tsx` to match the repo name — keep those in sync if you rename
the repo.

## Tech stack
`TypeScript` `React 19` `Tailwind CSS v4` `Vite`

## Notes
- TheSportsDB's free tier has thin coverage for MotoGP/Tennis/Equestrian
  (event listings only, no rankings) — that's an upstream data limit, not
  a bug in this app.
- The demo login (`src/pages/Login.tsx`) accepts any email/password — it's
  a UI flow, not real auth. Swap in real auth if you ever need it.
- `server/` is dead code as far as the deployed site is concerned. Delete
  it if you don't want it around, or keep it if you'd rather run your own
  proxy later (e.g. to add a paid TheSportsDB key without exposing it to
  the browser).

## License
MIT — by [ria0304](https://github.com/ria0304)

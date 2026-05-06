# CLAUDE.md

## Project

Louie — civic memory for Canadian municipalities. This repo is the home for
**all** Louie work: the web app, the embedded Negation Game tool, sales
notes, product docs, pitch material, and transcription scripts.

## Read first

- [`docs/SPEC.md`](./docs/SPEC.md) — full product brief, page architecture,
  design principles, and the demo happy paths that must work.
- [`docs/POSITIONING.md`](./docs/POSITIONING.md) — what Louie is, what it
  isn't, and how to handle the recurring objections.
- [`docs/PRICING.md`](./docs/PRICING.md) — canonical pricing.
- [`docs/ROADMAP.md`](./docs/ROADMAP.md) — what's next, in rough order.

## Repository layout

```
/                  Top-level config + this file
/docs/             Product spec, pricing, positioning, roadmap
/meetings/         Sales call notes, debriefs, follow-up tracking
/sales/            Outreach templates and campaign artifacts
/decks/            Pitch material, prototypes, sample data
/transcribe/       Python transcription / call-summary scripts
/scripts/          Repo automation
/ui/               Vite + React 19 + TypeScript SPA (the demo)
```

## Branch

All demo work happens on the `demo` branch. Cloudflare Pages auto-deploys
`demo` to `louie.networkgoods.institute`.

## Tech stack (web app)

- **Framework:** React 19 + Vite 7 + TypeScript 5.9 (SPA, hash routing)
- **Styling:** plain CSS (`ui/style.css`)
- **Package manager:** npm
- **Hosting:** Cloudflare Pages

## Build and run

```bash
cd ui
npm install
npm run dev    # local dev server
npm run build  # production build (TS + Vite)
```

## Key product constraints

- Design feels civic/institutional, not startup-flashy. Reference
  mississauga.ca for tone.
- Narrow column layout for the feed; mobile-compatible by default.
- Chat UI is a clean, replaceable component so a real AI backend can
  swap in. Front-end currently uses mock responses for the demo.
- Negation Game lives in a separate repo and embeds via iframe URLs.
  Ensure feed topics match the Negation Game URLs we have available.
- Search bar: default placeholder content → mock response on Enter.

## Demo happy paths (must work)

1. **Road Safety Budget**:
   `/#/mississauga` → sidebar link → home feed → Road Safety headline →
   topic detail with Negation Game embed + chat
2. **Institutional Memory Search**:
   `/#/mississauga` → sidebar link → home → search bar → type a question
   about institutional memory → Enter → chat with mock response

## Outreach + sales

- Locked email template: [`sales/outreach-template.md`](./sales/outreach-template.md)
- Live status of the 42-clerk Ontario campaign lives in **Coda**
  (doc `ldRwls061F`, table `grid-BmimipSofx`). Coda is canonical for
  status; the repo is canonical for the template.
- Meeting notes: [`meetings/`](./meetings/) — see the README in that
  folder for naming and template conventions.

# AfyaPulse — the heartbeat Kenya's health supply chain never had

Built for **Build with Gemma: GDG Pwani Hackathon** (31 July 2026, Mombasa) — Track 3: Smart Health.

> "Kenya lacks a logistics management information system that can serve as the heartbeat for all its
> supply chains." — DHIS2 Kenya implementation study, 2025

> "Medicine rots in KEMSA warehouses while hospitals run dry." — Kenyan news headline, May 2026

Those two facts describe the same failure: Kenya's health system isn't blind, it's **fragmented**. DHIS2
collects data. eCHIS gets community health workers reporting. KEMSA has its own LMIS. None of them talk to
each other, so a facility can sit on medicine it doesn't need while another, an hour away, runs out of the
same item. Meanwhile SHA has given hospitals a 90-day deadline to digitize or be de-contracted — the
pressure to fix this is now regulatory, not just operational.

**AfyaPulse doesn't replace those systems. It's the reasoning layer that sits on top of them** — turning
scattered stock counts, bed status, staffing, and diagnostics data into forecasts, redistribution decisions,
and a natural-language copilot a District Health Officer can actually act on today.

## Architecture

Three tiers, one metaphor:

- **Sense** — field intake. CHVs/nurses capture stock counts and facility notes by photo or voice
  (`/intake`), read directly by Gemma 4's multimodal vision/audio — no forms, no retyping paper registers.
- **Reason** — the district brain. A real forecasting model (not an LLM guessing numbers) predicts
  stock-outs; a real optimization solver (not a lookup table) proposes minimum-distance cross-facility
  transfers; Gemma 4 wraps both with natural-language explanation and a conversational copilot with native
  function calling.
- **Trust** — every AI output is explainable (you can see exactly which numbers drove it) and every
  redistribution requires a human "Approve & Dispatch" click. Nothing moves stock autonomously.

```
┌─────────────────────────────────────────────────────────────────────┐
│  Next.js app (afyapulse/)                                           │
│                                                                       │
│  District Command Center → Facility Detail → Redistribution → Copilot│
│                                                    ↑         ↑        │
│                                              Field Intake (Gemma 4    │
│                                              vision + audio)          │
│                                                                       │
│  Mock district data layer (src/lib/data) ──────┐                    │
│  Gemma 4 client + function-calling tools ───────┼──► Gemma 4 API     │
│  (src/lib/gemma)                                │    (Google AI      │
└──────────────────────────────────────────────────    Studio)────────┘
                     │ forecast / redistribution requests
                     ▼
┌─────────────────────────────────────────────────────────────────────┐
│  Python FastAPI service (services/forecasting/)                     │
│  Holt's linear trend forecasting · SciPy transportation-problem LP  │
└─────────────────────────────────────────────────────────────────────┘
```

## What's actually built and working (not a mockup)

- **District Command Center** — live health score, alerts, and status across 8 Kilifi County facilities
  (stock, beds, doctor attendance, diagnostics), computed from a seeded 60-day dataset with a deliberate
  crisis scenario baked in (Ganze Dispensary stocked out of antimalarials while Kilifi County Referral
  Hospital sits on surplus).
- **Stock-out forecasting** — Holt's linear trend exponential smoothing on real consumption data (not
  Croston's method — that's for sparse/intermittent demand, which daily medicine dispensing isn't; see
  `services/forecasting/forecasting.py` for the reasoning).
- **Smart redistribution** — solved as an actual transportation-problem linear program
  (`scipy.optimize.linprog`), minimizing transit distance while respecting every facility's own 10-day
  safety buffer. Not a rule-of-thumb.
- **Gemma 4 DHO Copilot** (`/copilot`) — agentic chat with native function calling over four tools
  (facility status, forecasts, at-risk list, redistribution proposals) reading the same live data as the
  dashboard.
- **Gemma 4 dispatch briefs** — one click on a redistribution proposal turns the raw numbers into a
  human-readable authorization brief.
- **Gemma 4 multimodal field intake** (`/intake`) — photo of a stock shelf/register or a voice note in
  English/Swahili, structured into JSON by Gemma 4 vision/audio.
- Every Gemma-backed feature has a clearly-labeled offline fallback, so the whole app runs end-to-end with
  zero API key, and upgrades to live Gemma the moment one is added.

## Explicitly roadmap, not faked in the demo

- **On-device Gemma E2B/E4B inference** at facilities for true offline capture. The Gemma client
  (`src/lib/gemma/client.ts`) is already abstracted behind one interface for this — today it calls the
  cloud API because that's what the hackathon judging period needs, but nothing else would need to change.
- **Real DHIS2 / KEMSA LMIS / eCHIS integration.** Today's data layer (`src/lib/data`) is a realistic mock
  standing in for those feeds, shaped like a real integration adapter would be.

## Running it

Two processes.

**1. Forecasting & redistribution service (Python)**

```bash
cd services/forecasting
py -m venv .venv
.venv\Scripts\pip install -r requirements.txt
.venv\Scripts\python -m uvicorn main:app --port 8010
```

**2. The app (Next.js, Node 18+)**

```bash
cd afyapulse
npm install
cp .env.local.example .env.local
npm run dev
```

Open http://localhost:3000. It works immediately with mock data and mock Gemma responses. To light up real
Gemma 4:

1. Get a key at https://aistudio.google.com/apikey
2. Set `GEMINI_API_KEY` in `afyapulse/.env.local`
3. Confirm `GEMMA_MODEL` matches the exact model id available on your key/hackathon credentials in Google AI
   Studio (Gemma 4 is primarily distributed as open weights; the exact Generative Language API model string
   should be confirmed against your access, not assumed)

No code changes needed either way — every Gemma call already falls back gracefully.

## Why this wins the track

Track 3 asks for stock monitoring, footfall, beds, doctor attendance, test availability, stock-out
forecasting, demand forecasting, and smart redistribution recommendations that flag underperforming
facilities to district administrators. AfyaPulse has all of it, and the one thing most stock-monitoring
dashboards don't: an optimizer that actually **moves stock, not just displays it**, explained in plain
English by the model the hackathon is built around.

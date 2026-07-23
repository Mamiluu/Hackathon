<!--
  DRAFT for the Kaggle Writeup (Track 3: Smart Health).
  Word count target: under 1500 (Kaggle penalizes over-limit submissions).
  This file is NOT auto-submitted anywhere -- copy this into Kaggle's "New Writeup" editor,
  attach the repo + live demo links in "Project Links" under Attachments (per Kaggle's own
  instructions, not inline in the text), select Track 3, review, then click Submit --
  a saved-but-unsubmitted draft is NOT considered by judges. Read the note at the bottom
  before you finalize the "challenges" section -- it's flagged for a reason.
-->

# AfyaPulse

### The heartbeat Kenya's health supply chain never had

---

## The Problem

Kenya's primary health centres don't lack data — they lack a place where their data adds up to a decision. Stock levels, bed occupancy, doctor attendance, and diagnostic availability are tracked, but DHIS2, eCHIS, and KEMSA's supply logistics system don't natively talk to each other. A facility can sit at zero stock on a medicine while another an hour away holds surplus of the exact same drug, and nobody with the authority to fix it sees both numbers at once. This is no longer just an operational gap: Kenya's Social Health Authority issued a formal 90-day directive on 1 July 2026 requiring every hospital to digitize stock, bed, staffing, and diagnostics reporting or have its SHA contract terminated. The compliance clock is already running.

## The Solution

AfyaPulse is a reasoning layer that sits on top of the kind of data DHIS2/KEMSA/eCHIS already collect and turns it into three things a District Health Officer can act on today: a stock-out forecast, an optimized cross-facility redistribution plan, and a Gemma 4 copilot to interrogate it all in plain language — across eight real, geo-located Kilifi County facilities. The architecture is three layers: **Sense** (multimodal field intake), **Reason** (forecasting, optimization, and outbreak surveillance), and **Trust** (nothing moves stock without an explicit human approval, and every number is traceable to its source).

## How Gemma 4 Is the Engine, Not a Wrapper

Gemma 4 (the 26B mixture-of-experts instruction-tuned variant, chosen over the 31B dense model specifically for interactive latency) does real work in five distinct ways, not one chat window bolted on top:

1. **Agentic function calling.** The DHO Copilot is given five native tools — list at-risk facilities, get one facility's status, get an item's forecast, list redistribution proposals, list outbreak signals — with a system instruction that forbids inventing numbers. Gemma decides which tools to call, executes up to four reasoning rounds per turn, and only answers once it has grounded data. This is the part of the rubric ("is the model core to the solution") we lean on hardest: remove Gemma's function calling and the copilot has no way to answer anything truthfully.
2. **Structured generation from constrained inputs.** Redistribution dispatch briefs and a one-click SHA compliance memo are composed by Gemma from real figures handed to it, with an explicit instruction never to add a number it wasn't given — turning a raw optimizer output into language a health officer would actually forward.
3. **Multimodal understanding.** A community health worker photographs a stock shelf or paper register, or records a voice note; Gemma's vision and audio understanding extract structured item/quantity/unit data directly — the "no forms, no re-typing registers" promise of the Sense layer.
4. **Self-translation of the application itself.** Rather than hand-translating the UI, Gemma translated the app's own ~180 interface strings into six additional languages beyond the two hand-verified ones, cached and bundled rather than called live per visitor.
5. **Designed-in graceful degradation.** Every Gemma-touching feature has a clearly labeled mock fallback, so the app runs end-to-end with zero required API keys — a real key upgrades the quality of the same features rather than being a hard dependency.

## Reasoning Beyond the LLM: Two Real Algorithms

Gemma orchestrates, but the numbers it reasons over come from genuine, purpose-fit algorithms, not lookup tables. **Stock-out forecasting** uses Holt's linear trend exponential smoothing — fitting a level and trend on the most recent 21 days of daily consumption and simulating forward to a stock-out date. Croston's method, the more commonly cited demand-forecasting default, is built for sparse, intermittent demand; these facilities draw down medicine every day, so Croston's would be the wrong tool for the actual shape of this data. **Redistribution** is solved as a genuine transportation-problem linear program (`scipy.optimize.linprog`): minimize real great-circle transit distance between facilities, subject to supply, demand, and a 10-day safety buffer no facility can be pushed below, with an objective term that biases the solver toward actually clearing deficits rather than just staying cheap. Redistribution now runs on Holt's-*projected* stock five days out rather than today's snapshot — proactively preempting a shortfall instead of reacting once it exists. A third, newer piece of reasoning — a week-over-week consumption-acceleration detector — distinguishes one facility's normal noise from two or more neighboring facilities accelerating together on the same item, surfacing that as an early outbreak/case-cluster signal before any one of them is even fully out of stock. That reframes the product from "a stock dashboard" to an early-warning system, which is the differentiator we'd point to first.

## Engineering Challenges, Honestly

Building against a live LLM surfaced real constraints worth naming rather than hiding. Gemma's free-tier API quota (30 requests/minute) is fragile under concurrent use, and generation latency for longer free-form text (a compliance memo, a dispatch brief) can run 30–65 seconds on this model tier — solved by pacing/retrying background generation work and by making every user-facing wait state honest (a visible "still working" indicator) rather than silent. Vercel's serverless filesystem is ephemeral in production, which broke a naive disk-based cache for approval state and translation caches; the fix was to make expensive translation work a one-time, committed build artifact rather than a live per-visitor call, and to make approval state browser-scoped for this single-presenter deployment rather than pretending a file-based store was doing more than it could.

## Real-World Impact

AfyaPulse doesn't ask Kenya's health system to replace DHIS2, eCHIS, or KEMSA's LMIS — it's a reasoning layer that could sit on top of the data they already collect, which means adoption doesn't require anyone to migrate anything. Track 3 asks for stock monitoring, bed/staffing visibility, diagnostics availability, stock-out and demand forecasting, and redistribution recommendations that flag underperforming facilities — AfyaPulse covers all of it, and goes further: it computes the fix, not just the alert, and it now watches for outbreak signals before they become supply crises. Against a live, dated regulatory deadline (SHA's 90-day digitize-or-decontract directive), this isn't a hypothetical use case — it's shaped to be the compliance layer a real district health office would need in the next quarter.

---

*Live demo: [attach in Project Links] · Public repository: [attach in Project Links] · Track 3: Smart Health*

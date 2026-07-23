<!--
  REWRITTEN to match Kaggle's actual "Project Description" template (Inspiration / How we
  built it / The Prototype / Challenges we ran into) rather than free-form sections.
  Paste each heading's content under the matching template heading Kaggle already gave you --
  don't replace their headings, just fill under them. Total body is ~1,150 words, under the
  1,500-word competition limit with room to spare.

  ACTION NEEDED BEFORE SUBMITTING: "The Prototype" section needs a real 2-minute demo video
  link -- Kaggle's template explicitly asks for one, separate from the GitHub repo / live demo
  links. See VIDEO_SCRIPT.md (same folder) for a ready-to-record script sized to fit 2 minutes.
-->

## 💡 Inspiration

Kenya's primary health centres don't lack data — they lack a place where their data adds up to a decision. Stock levels, bed occupancy, doctor attendance, and diagnostic availability are all tracked somewhere, but DHIS2, eCHIS, and KEMSA's supply logistics system don't natively talk to each other. A facility can sit at zero stock on a medicine while another an hour away holds surplus of the exact same drug, and nobody with the authority to fix it sees both numbers at once. This stopped being a hypothetical problem on 1 July 2026, when Kenya's Social Health Authority gave every hospital 90 days to digitize stock, bed, staffing, and diagnostics reporting or have its SHA contract terminated. We built AfyaPulse to be the reasoning layer a District Health Officer would actually need to meet that deadline — not another dashboard that shows the crisis, but one that computes the fix and lets a human dispatch it.

## 🛠️ How we built it

**Model:** Gemma 4, the 26B mixture-of-experts instruction-tuned variant (`gemma-4-26b-a4b-it`), accessed via the Gemini Generative Language REST API — chosen over the 31B dense variant specifically for lower latency in an interactive copilot.

**Technique:** Prompt engineering plus native function calling, not RAG or fine-tuning. Every generation-heavy feature is constrained by an explicit system instruction ("never invent a number") and grounded in real tool calls or real data handed to the model, rather than retrieved context or a fine-tuned checkpoint. Gemma is used five distinct ways: (1) **agentic function calling** — a District Health Officer copilot with five native tools (list at-risk facilities, get a facility's status, get an item's forecast, list redistribution proposals, list outbreak signals) that Gemma decides when and how to call across up to four reasoning rounds per turn; (2) **structured generation from constrained inputs** — redistribution dispatch briefs and a one-click SHA compliance memo, composed only from figures we hand the model; (3) **multimodal understanding** — a CHV photographs a stock shelf or paper register, or records a voice note, and Gemma's vision/audio extract structured item/quantity/unit data directly; (4) **self-translation** — Gemma translated the app's own ~180 UI strings into six languages beyond the two hand-verified ones, pre-generated and bundled rather than called live per visitor; (5) **designed-in graceful degradation** — every Gemma-touching feature has a labeled mock fallback, so the app runs end-to-end with zero required API keys.

**Frameworks:** Next.js 14 / TypeScript (App Router, server components) for the frontend and API layer, deployed on Vercel. A separate Python FastAPI microservice, deployed on Render, does the numerical heavy lifting: Holt's linear trend exponential smoothing for stock-out forecasting, and `scipy.optimize.linprog` solving cross-facility redistribution as a genuine transportation-problem linear program. We call the Gemini REST API directly rather than through Transformers/Keras — there's no local inference here, so a full ML framework would have added weight without adding capability.

## 🧪 The Prototype

- 🎥 2-minute demo video: [INSERT VIDEO LINK — see VIDEO_SCRIPT.md]
- 💻 GitHub repo: https://github.com/Mamiluu/Hackathon
- 🌐 Live demo: https://afyapulse-blond.vercel.app

AfyaPulse covers Track 3's full brief — stock monitoring, bed/staffing visibility, diagnostics availability, stock-out forecasting, and redistribution recommendations that flag underperforming facilities — across eight real, geo-located Kilifi County facilities, and adds a syndromic outbreak-surveillance layer that watches for abnormal consumption acceleration across neighboring facilities before any single one runs out. Nothing moves stock without an explicit human "Approve & Dispatch" click — every number traces back to a source record you can click open and see.

## 🚧 Challenges we ran into

The demo-facing features weren't the hard part — the operational edges of building against a live LLM were. Gemma's free-tier API quota (30 requests/minute) is fragile under concurrent use, and generation latency for longer free-form text — a compliance memo, a dispatch brief — can run 30 to 65 seconds on this model tier, which meant every slow feature needed a visible "still working" state instead of a silent hang, and background work needed real pacing and retry logic rather than firing requests all at once. Vercel's serverless filesystem turned out to be read-only/ephemeral in production even though it behaves normally in local development, which silently broke a naive disk-based cache for both approval state and translation output; the fix was to make expensive translation work a one-time, committed build artifact instead of a live per-visitor call, and to make approval state browser-scoped rather than pretend a file write was persisting when it wasn't. On the algorithm side, the honest challenge was resisting the urge to reach for a bigger model or a fancier forecasting method by default — Croston's method is the more commonly cited demand-forecasting tool, but it's built for sparse, intermittent demand, and these facilities draw down medicine every single day, so Holt's linear trend was the right-sized choice for the actual shape of the data, not the flashiest one.

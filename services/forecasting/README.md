# AfyaPulse forecasting & redistribution service

FastAPI microservice used by the Next.js app in `../../afyapulse`. See the top-level README for the full
picture — this is just the numerical core:

- `forecasting.py` — Holt's linear trend exponential smoothing for stock-out prediction.
- `redistribution.py` — cross-facility stock transfers solved as a transportation-problem linear program
  (`scipy.optimize.linprog`).
- `main.py` — the two endpoints (`/forecast`, `/redistribution/propose`) that expose them.

## Run

```bash
py -m venv .venv
.venv\Scripts\pip install -r requirements.txt
.venv\Scripts\python -m uvicorn main:app --port 8010
```

Docs at http://localhost:8010/docs once running.

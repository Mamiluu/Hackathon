"""
Stock-out forecasting.

Medicine consumption at these facilities is a smooth, continuous daily draw
(not sparse/intermittent demand with many zero days), so Holt's linear trend
exponential smoothing is the right tool here -- Croston's method is built for
intermittent demand and would be the wrong fit for this data shape.

Holt's method:
    level_t = alpha * y_t + (1 - alpha) * (level_{t-1} + trend_{t-1})
    trend_t = beta * (level_t - level_{t-1}) + (1 - beta) * trend_{t-1}
    forecast(h) = level_T + h * trend_T

We fit it on the recent daily-consumption series, then simulate the on-hand
quantity forward day by day until it crosses zero.

Alongside the point forecast we also track the model's own one-step-ahead
residuals (actual vs. what Holt's would have predicted the day before) and use
their standard deviation to widen a confidence band the further out we
project -- a stockout call 20 days out is not equally certain as one 2 days
out, and downstream consumers (the redistribution LP) need that distinction
to avoid treating a point estimate as ground truth.
"""

from dataclasses import dataclass
from statistics import pstdev


ALPHA = 0.35  # level smoothing
BETA = 0.25  # trend smoothing
RECENT_WINDOW = 21  # days of history most relevant to "where is this trending now"
Z_CONSERVATIVE = 0.84  # ~80% one-sided confidence bound on the projected band


@dataclass
class HistoryPoint:
    date: str
    quantity_on_hand: float
    daily_consumption: float


@dataclass
class ForecastPoint:
    date: str
    projected_quantity_on_hand: float
    projected_daily_consumption: float
    projected_quantity_on_hand_low: float
    projected_quantity_on_hand_high: float


@dataclass
class ForecastResult:
    forecast: list[ForecastPoint]
    days_to_stockout: float | None
    method: str
    confidence: str


def _next_dates(last_date: str, horizon_days: int) -> list[str]:
    from datetime import date, timedelta

    y, m, d = (int(x) for x in last_date.split("-"))
    start = date(y, m, d)
    return [(start + timedelta(days=i)).isoformat() for i in range(1, horizon_days + 1)]


def holt_linear_forecast(consumption: list[float]) -> tuple[float, float, float]:
    """Fit Holt's linear trend model, return (level, trend, residual_std) at the end of the series.

    residual_std is the std of one-step-ahead errors (actual y vs. what the model
    would have predicted the day before, using only information available at the
    time) -- the model's own track record of being wrong, used to size the
    confidence band on future projections.
    """
    series = consumption[-max(RECENT_WINDOW, 2) :]
    level = series[0]
    trend = series[1] - series[0] if len(series) > 1 else 0.0
    residuals: list[float] = []

    for y in series[1:]:
        predicted = level + trend
        residuals.append(y - predicted)
        prev_level = level
        level = ALPHA * y + (1 - ALPHA) * (level + trend)
        trend = BETA * (level - prev_level) + (1 - BETA) * trend

    sigma = pstdev(residuals) if len(residuals) >= 2 else 0.0
    return level, trend, sigma


def forecast_stockout(history: list[HistoryPoint], horizon_days: int = 21) -> ForecastResult:
    if not history:
        return ForecastResult(forecast=[], days_to_stockout=None, method="holt_linear", confidence="low")

    consumption = [max(0.0, h.daily_consumption) for h in history]
    level, trend, sigma = holt_linear_forecast(consumption)

    last = history[-1]
    qty = last.quantity_on_hand
    dates = _next_dates(last.date, horizon_days)

    points: list[ForecastPoint] = []
    days_to_stockout: float | None = None

    for i, date in enumerate(dates, start=1):
        projected_consumption = max(0.0, level + i * trend)
        prev_qty = qty
        qty = max(0.0, qty - projected_consumption)

        # Cumulative consumption error over i days grows like sigma * sqrt(i)
        # under an i.i.d.-error random-walk assumption -- the same reasoning
        # that justifies Holt's own additive trend structure.
        band = Z_CONSERVATIVE * sigma * (i**0.5)
        points.append(
            ForecastPoint(
                date=date,
                projected_quantity_on_hand=round(qty, 1),
                projected_daily_consumption=round(projected_consumption, 2),
                projected_quantity_on_hand_low=round(max(0.0, qty - band), 1),
                projected_quantity_on_hand_high=round(qty + band, 1),
            )
        )
        if days_to_stockout is None and qty <= 0 and projected_consumption > 0:
            # Linear-interpolate within the day for a smoother estimate.
            fraction = prev_qty / projected_consumption if projected_consumption > 0 else 0
            days_to_stockout = round((i - 1) + fraction, 1)

    # Confidence reflects how much history actually informed the fit.
    confidence = "high" if len(history) >= 45 else "medium" if len(history) >= 21 else "low"

    return ForecastResult(forecast=points, days_to_stockout=days_to_stockout, method="holt_linear", confidence=confidence)

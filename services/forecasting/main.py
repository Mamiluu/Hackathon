from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, ConfigDict, Field

from forecasting import HistoryPoint, forecast_stockout
from redistribution import FacilityPosition, solve_transfers

app = FastAPI(title="AfyaPulse Forecasting & Redistribution Service")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "https://afyapulse-blond.vercel.app"],
    allow_origin_regex=r"https://afyapulse.*\.vercel\.app",
    allow_methods=["*"],
    allow_headers=["*"],
)


def camel(field_name: str) -> str:
    parts = field_name.split("_")
    return parts[0] + "".join(p.title() for p in parts[1:])


class CamelModel(BaseModel):
    model_config = ConfigDict(alias_generator=camel, populate_by_name=True)


# ---------- /forecast ----------


class HistoryPointIn(CamelModel):
    date: str
    quantity_on_hand: float
    daily_consumption: float


class ForecastRequest(CamelModel):
    history: list[HistoryPointIn]
    horizon_days: int = 21


class ForecastPointOut(CamelModel):
    date: str
    projected_quantity_on_hand: float
    projected_daily_consumption: float


class ForecastResponse(CamelModel):
    forecast: list[ForecastPointOut]
    days_to_stockout: float | None
    method: str
    confidence: str


@app.post("/forecast", response_model=ForecastResponse, response_model_by_alias=True)
def forecast(req: ForecastRequest) -> ForecastResponse:
    history = [HistoryPoint(date=h.date, quantity_on_hand=h.quantity_on_hand, daily_consumption=h.daily_consumption) for h in req.history]
    result = forecast_stockout(history, horizon_days=req.horizon_days)
    return ForecastResponse(
        forecast=[
            ForecastPointOut(
                date=p.date,
                projected_quantity_on_hand=p.projected_quantity_on_hand,
                projected_daily_consumption=p.projected_daily_consumption,
            )
            for p in result.forecast
        ],
        days_to_stockout=result.days_to_stockout,
        method=result.method,
        confidence=result.confidence,
    )


# ---------- /redistribution/propose ----------


class FacilityPositionIn(CamelModel):
    facility_id: str
    lat: float
    lng: float
    quantity_on_hand: float
    daily_consumption: float
    safety_days: float = 10.0


class RedistributionRequest(CamelModel):
    positions: list[FacilityPositionIn]


class TransferOut(CamelModel):
    source_facility_id: str
    dest_facility_id: str
    quantity: float
    distance_km: float
    est_transit_minutes: float


class RedistributionResponse(CamelModel):
    transfers: list[TransferOut]


@app.post("/redistribution/propose", response_model=RedistributionResponse, response_model_by_alias=True)
def propose_redistribution(req: RedistributionRequest) -> RedistributionResponse:
    positions = [
        FacilityPosition(
            facility_id=p.facility_id,
            lat=p.lat,
            lng=p.lng,
            quantity_on_hand=p.quantity_on_hand,
            daily_consumption=p.daily_consumption,
            safety_days=p.safety_days,
        )
        for p in req.positions
    ]
    transfers = solve_transfers(positions)
    return RedistributionResponse(
        transfers=[
            TransferOut(
                source_facility_id=t.source_facility_id,
                dest_facility_id=t.dest_facility_id,
                quantity=t.quantity,
                distance_km=t.distance_km,
                est_transit_minutes=t.est_transit_minutes,
            )
            for t in transfers
        ]
    )


@app.get("/health")
def health():
    return {"status": "ok"}

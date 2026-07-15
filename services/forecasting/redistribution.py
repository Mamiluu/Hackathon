"""
Cross-facility stock redistribution as a transportation problem.

Given facilities with a surplus of an item and facilities with a deficit,
find the minimum-cost set of transfers (cost = distance, a proxy for
transit time/fuel) that clears as much deficit as possible without
draining any facility below its own safety buffer.

This is solved as a genuine LP transportation problem via
scipy.optimize.linprog, not a lookup table:

    minimize   sum(cost_ij * x_ij)
    subject to sum_j x_ij <= supply_i      (can't ship more than the surplus)
               sum_i x_ij <= demand_j      (won't overfill a deficit)
               x_ij >= 0

We solve it per item, since transferring "stock" across different medicines
isn't meaningful.
"""

import math
from dataclasses import dataclass

import numpy as np
from scipy.optimize import linprog

AVG_ROAD_SPEED_KMPH = 35  # rural Kilifi County road/boda-boda courier speed


@dataclass
class FacilityPosition:
    facility_id: str
    lat: float
    lng: float
    quantity_on_hand: float
    daily_consumption: float
    safety_days: float = 10.0  # never transfer a facility below this many days of buffer


@dataclass
class Transfer:
    source_facility_id: str
    dest_facility_id: str
    quantity: float
    distance_km: float
    est_transit_minutes: float


def haversine_km(lat1: float, lng1: float, lat2: float, lng2: float) -> float:
    r = 6371.0
    p1, p2 = math.radians(lat1), math.radians(lat2)
    dp = math.radians(lat2 - lat1)
    dl = math.radians(lng2 - lng1)
    a = math.sin(dp / 2) ** 2 + math.cos(p1) * math.cos(p2) * math.sin(dl / 2) ** 2
    return 2 * r * math.asin(math.sqrt(a))


def solve_transfers(positions: list[FacilityPosition]) -> list[Transfer]:
    supply: list[tuple[FacilityPosition, float]] = []
    demand: list[tuple[FacilityPosition, float]] = []

    for p in positions:
        buffer_qty = p.safety_days * p.daily_consumption
        surplus = p.quantity_on_hand - buffer_qty
        days_remaining = (p.quantity_on_hand / p.daily_consumption) if p.daily_consumption > 0 else math.inf

        if surplus > 0 and days_remaining > p.safety_days:
            supply.append((p, surplus))
        elif p.quantity_on_hand < p.daily_consumption * 3:  # under 3 days: real deficit
            need = max(0.0, buffer_qty - p.quantity_on_hand)
            if need > 0:
                demand.append((p, need))

    if not supply or not demand:
        return []

    n_supply, n_demand = len(supply), len(demand)
    cost = np.zeros((n_supply, n_demand))
    for i, (s, _) in enumerate(supply):
        for j, (d, _) in enumerate(demand):
            cost[i, j] = haversine_km(s.lat, s.lng, d.lat, d.lng)

    c = cost.flatten()
    n = n_supply * n_demand

    # Supply constraints: sum_j x_ij <= supply_i
    a_ub = []
    b_ub = []
    for i in range(n_supply):
        row = np.zeros(n)
        row[i * n_demand : (i + 1) * n_demand] = 1
        a_ub.append(row)
        b_ub.append(supply[i][1])

    # Demand constraints: sum_i x_ij <= demand_j  (LP tries to minimize cost while
    # a bonus term pushes it to actually move stock -- see objective below)
    for j in range(n_demand):
        row = np.zeros(n)
        for i in range(n_supply):
            row[i * n_demand + j] = 1
        a_ub.append(row)
        b_ub.append(demand[j][1])

    # linprog minimizes; we want to both minimize distance AND maximize quantity
    # moved, so we bias the objective to strongly reward clearing deficits (a large
    # negative weight per unit shipped) while distance breaks ties between
    # otherwise-equal shipments.
    max_cost = float(cost.max()) if cost.size else 1.0
    objective = c - (max_cost * 50)  # large constant reward per unit transferred

    result = linprog(objective, A_ub=np.array(a_ub), b_ub=np.array(b_ub), bounds=(0, None), method="highs")

    transfers: list[Transfer] = []
    if not result.success:
        return transfers

    x = result.x.reshape(n_supply, n_demand)
    for i in range(n_supply):
        for j in range(n_demand):
            qty = x[i, j]
            if qty >= 1:  # ignore sub-unit noise
                s_pos, _ = supply[i]
                d_pos, _ = demand[j]
                dist = cost[i, j]
                transfers.append(
                    Transfer(
                        source_facility_id=s_pos.facility_id,
                        dest_facility_id=d_pos.facility_id,
                        quantity=round(qty),
                        distance_km=round(dist, 1),
                        est_transit_minutes=round((dist / AVG_ROAD_SPEED_KMPH) * 60),
                    )
                )

    return transfers

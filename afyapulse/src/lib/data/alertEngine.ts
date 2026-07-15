import { STOCK_ITEMS, TODAY, getDoctorHistory, getFacility, getFootfallHistory, getLatestStock, getTestAvailabilityToday, getBedsHistory, FACILITIES } from "./store";
import type { Alert, AlertSeverity, FacilitySnapshot } from "./types";

const ESSENTIAL_CATEGORIES = new Set(["antimalarial", "antibiotic", "maternal"]);

export function daysOfStockRemaining(facilityId: string, itemId: string): number {
  const latest = getLatestStock(facilityId, itemId);
  if (!latest || latest.dailyConsumption <= 0) return Infinity;
  return latest.quantityOnHand / latest.dailyConsumption;
}

function stockRiskLevel(days: number): "ok" | "low" | "critical" {
  if (days < 3) return "critical";
  if (days < 7) return "low";
  return "ok";
}

export function computeFacilitySnapshot(facilityId: string): FacilitySnapshot {
  const facility = getFacility(facilityId)!;
  const essentialItems = STOCK_ITEMS.filter((i) => ESSENTIAL_CATEGORIES.has(i.category));

  let minDays = Infinity;
  let worstItemId = "";
  for (const item of essentialItems) {
    const days = daysOfStockRemaining(facilityId, item.id);
    if (days < minDays) {
      minDays = days;
      worstItemId = item.id;
    }
  }
  const stockRisk = stockRiskLevel(minDays);
  const stockScore = Math.min(1, minDays / 14) * 100;

  const doctorHist = getDoctorHistory(facilityId);
  const doctorToday = doctorHist.find((d) => d.date === TODAY) ?? doctorHist[doctorHist.length - 1];
  const doctorAttendancePct = doctorToday ? (doctorToday.presentStaff / doctorToday.scheduledStaff) * 100 : 100;

  const bedsHist = getBedsHistory(facilityId);
  const bedsToday = bedsHist.find((b) => b.date === TODAY) ?? bedsHist[bedsHist.length - 1];
  const bedOccupancyPct = bedsToday ? (bedsToday.occupiedBeds / facility.totalBeds) * 100 : 0;
  const bedScore = Math.max(0, 100 - Math.max(0, bedOccupancyPct - 85) * 3);

  const testsToday = getTestAvailabilityToday(facilityId);
  const testKitsMissing = testsToday.filter((t) => !t.available).length;
  const testScore = testsToday.length > 0 ? ((testsToday.length - testKitsMissing) / testsToday.length) * 100 : 100;

  const healthScore = Math.round(0.4 * stockScore + 0.25 * doctorAttendancePct + 0.2 * bedScore + 0.15 * testScore);

  const alerts: Alert[] = [];
  if (stockRisk !== "ok") {
    const worstItem = essentialItems.find((i) => i.id === worstItemId);
    alerts.push({
      id: `alert-${facilityId}-stockout-${worstItemId}`,
      facilityId,
      type: "stockout_risk",
      severity: stockRisk === "critical" ? "critical" : "warning",
      message: `${worstItem?.name ?? "Essential stock"} at ${facility.name}: ${minDays === Infinity ? "no consumption data" : `${minDays.toFixed(1)} days remaining`}`,
      createdAt: new Date().toISOString(),
    });
  }
  if (bedOccupancyPct > 90) {
    alerts.push({
      id: `alert-${facilityId}-beds`,
      facilityId,
      type: "bed_pressure",
      severity: bedOccupancyPct > 100 ? "critical" : "warning",
      message: `${facility.name} beds at ${Math.round(bedOccupancyPct)}% occupancy`,
      createdAt: new Date().toISOString(),
    });
  }
  if (doctorAttendancePct < 70) {
    alerts.push({
      id: `alert-${facilityId}-doctors`,
      facilityId,
      type: "doctor_absence",
      severity: doctorAttendancePct < 50 ? "critical" : "warning",
      message: `${facility.name}: only ${doctorToday?.presentStaff ?? 0}/${doctorToday?.scheduledStaff ?? 0} scheduled staff present today`,
      createdAt: new Date().toISOString(),
    });
  }
  if (testKitsMissing > 0) {
    alerts.push({
      id: `alert-${facilityId}-tests`,
      facilityId,
      type: "test_unavailable",
      severity: "info",
      message: `${facility.name}: ${testKitsMissing} test kit type(s) unavailable today`,
      createdAt: new Date().toISOString(),
    });
  }

  const footfallHist = getFootfallHistory(facilityId);
  const footfallToday = (footfallHist.find((f) => f.date === TODAY) ?? footfallHist[footfallHist.length - 1])?.patientCount ?? 0;

  return {
    facility,
    healthScore,
    stockRisk,
    bedOccupancyPct: Math.round(bedOccupancyPct),
    doctorAttendancePct: Math.round(doctorAttendancePct),
    footfallToday,
    testKitsMissing,
    alerts,
  };
}

export function getAllSnapshots(): FacilitySnapshot[] {
  return FACILITIES.map((f) => computeFacilitySnapshot(f.id));
}

export function getAllAlerts(): Alert[] {
  const severityOrder: Record<AlertSeverity, number> = { critical: 0, warning: 1, info: 2 };
  return getAllSnapshots()
    .flatMap((s) => s.alerts)
    .sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity]);
}

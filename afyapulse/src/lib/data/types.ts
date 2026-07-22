export type FacilityType = "dispensary" | "health_centre" | "district_hospital";

export interface Facility {
  id: string;
  name: string;
  type: FacilityType;
  ward: string;
  lat: number;
  lng: number;
  totalBeds: number;
  scheduledStaff: number;
}

export interface StockItem {
  id: string;
  name: string;
  category: "antimalarial" | "antibiotic" | "maternal" | "chronic" | "test_kit" | "supplies";
  unit: string;
}

export interface StockRecord {
  facilityId: string;
  itemId: string;
  date: string; // ISO date
  quantityOnHand: number;
  dailyConsumption: number;
}

export interface FootfallRecord {
  facilityId: string;
  date: string;
  patientCount: number;
}

export interface BedStatusRecord {
  facilityId: string;
  date: string;
  occupiedBeds: number;
}

export interface DoctorAttendanceRecord {
  facilityId: string;
  date: string;
  scheduledStaff: number;
  presentStaff: number;
}

export interface TestAvailabilityRecord {
  facilityId: string;
  date: string;
  itemId: string; // references a StockItem with category "test_kit"
  available: boolean;
}

export type AlertSeverity = "critical" | "warning" | "info";

export interface Alert {
  id: string;
  facilityId: string;
  type: "stockout_risk" | "bed_pressure" | "doctor_absence" | "test_unavailable" | "redistribution" | "outbreak_signal";
  severity: AlertSeverity;
  message: string;
  createdAt: string;
}

/**
 * A cluster-level signal: multiple nearby facilities showing abnormal week-over-week
 * consumption growth on the same item at the same time. Distinct from a single facility's
 * stockout_risk alert -- one facility spiking is normal variance, two or more spiking
 * together is the early shape of an outbreak, not just a supply problem.
 */
export interface OutbreakSignal {
  id: string;
  itemId: string;
  facilityIds: string[];
  weekOverWeekGrowthPct: number;
  severity: AlertSeverity;
  message: string;
  createdAt: string;
}

export type RedistributionStatus = "proposed" | "approved" | "dispatched";

export interface RedistributionProposal {
  id: string;
  sourceFacilityId: string;
  destFacilityId: string;
  itemId: string;
  quantity: number;
  urgency: AlertSeverity;
  estTransitMinutes: number;
  distanceKm: number;
  status: RedistributionStatus;
  reasoning: string;
  brief?: string; // Gemma-generated dispatch brief
  createdAt: string;
}

export interface ScoreTraceRow {
  label: string;
  value: string;
}

export interface FacilitySnapshot {
  facility: Facility;
  healthScore: number; // 0-100
  stockRisk: "ok" | "low" | "critical";
  bedOccupancyPct: number;
  doctorAttendancePct: number;
  footfallToday: number;
  testKitsMissing: number;
  alerts: Alert[];
  /** The literal weighted breakdown behind healthScore -- the "show your work" trust trace. */
  scoreTrace: ScoreTraceRow[];
}

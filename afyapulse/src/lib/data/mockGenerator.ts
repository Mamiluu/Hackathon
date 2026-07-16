import type {
  BedStatusRecord,
  DoctorAttendanceRecord,
  Facility,
  FootfallRecord,
  StockItem,
  StockRecord,
  TestAvailabilityRecord,
} from "./types";

// Deterministic PRNG so the demo dataset is stable across restarts.
function mulberry32(seed: number) {
  let a = seed;
  return function rand() {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const rand = mulberry32(20260731); 

export const FACILITIES: Facility[] = [
  { id: "fac-kilifi-crh", name: "Kilifi County Referral Hospital", type: "district_hospital", ward: "Kilifi Town", lat: -3.6305, lng: 39.8499, totalBeds: 180, scheduledStaff: 42 },
  { id: "fac-malindi-sch", name: "Malindi Sub-County Hospital", type: "district_hospital", ward: "Malindi Town", lat: -3.2192, lng: 40.1169, totalBeds: 140, scheduledStaff: 34 },
  { id: "fac-mariakani-hc", name: "Mariakani Health Centre", type: "health_centre", ward: "Mariakani", lat: -3.8667, lng: 39.4667, totalBeds: 24, scheduledStaff: 11 },
  { id: "fac-kaloleni-hc", name: "Kaloleni Health Centre", type: "health_centre", ward: "Kaloleni", lat: -3.7783, lng: 39.6853, totalBeds: 20, scheduledStaff: 9 },
  { id: "fac-rabai-hc", name: "Rabai Health Centre", type: "health_centre", ward: "Rabai", lat: -3.9167, lng: 39.5833, totalBeds: 18, scheduledStaff: 8 },
  { id: "fac-ganze-disp", name: "Ganze Dispensary", type: "dispensary", ward: "Ganze", lat: -3.4167, lng: 39.6833, totalBeds: 6, scheduledStaff: 4 },
  { id: "fac-bamba-disp", name: "Bamba Dispensary", type: "dispensary", ward: "Bamba", lat: -3.3833, lng: 39.7667, totalBeds: 6, scheduledStaff: 3 },
  { id: "fac-chonyi-disp", name: "Chonyi Dispensary", type: "dispensary", ward: "Chonyi", lat: -3.8333, lng: 39.6167, totalBeds: 4, scheduledStaff: 3 },
];

export const STOCK_ITEMS: StockItem[] = [
  { id: "item-al", name: "Artemether-Lumefantrine 20/120mg", category: "antimalarial", unit: "tablets" },
  { id: "item-quinine", name: "Quinine Injection", category: "antimalarial", unit: "vials" },
  { id: "item-amoxicillin", name: "Amoxicillin 250mg", category: "antibiotic", unit: "capsules" },
  { id: "item-ceftriaxone", name: "Ceftriaxone Injection", category: "antibiotic", unit: "vials" },
  { id: "item-oxytocin", name: "Oxytocin Injection", category: "maternal", unit: "ampoules" },
  { id: "item-metformin", name: "Metformin 500mg", category: "chronic", unit: "tablets" },
  { id: "item-malaria-rdt", name: "Malaria RDT Kit", category: "test_kit", unit: "kits" },
  { id: "item-hiv-test", name: "HIV Test Kit", category: "test_kit", unit: "kits" },
];

const HISTORY_DAYS = 60;

function dateNDaysAgo(n: number): string {
  const d = new Date();
  d.setUTCHours(0, 0, 0, 0);
  d.setUTCDate(d.getUTCDate() - n);
  return d.toISOString().slice(0, 10);
}

export const DATES: string[] = Array.from({ length: HISTORY_DAYS }, (_, i) => dateNDaysAgo(HISTORY_DAYS - 1 - i));

// Coastal Kenya: long rains ~Apr-Jun drive a malaria case bump that lingers into July.
function seasonalMalariaFactor(date: string): number {
  const dayOfYear = Math.floor(
    (new Date(date).getTime() - new Date(`${date.slice(0, 4)}-01-01`).getTime()) / 86400000
  );
  const peak = 165; // mid-June
  const distance = Math.abs(dayOfYear - peak);
  return 1 + Math.max(0, 1 - distance / 90) * 0.9; // up to +90% near peak, decaying over ~3 months
}

function baseFacilitySize(f: Facility): number {
  if (f.type === "district_hospital") return 3.2;
  if (f.type === "health_centre") return 1.6;
  return 1.0;
}

interface GeneratedData {
  stock: StockRecord[];
  footfall: FootfallRecord[];
  beds: BedStatusRecord[];
  doctorAttendance: DoctorAttendanceRecord[];
  testAvailability: TestAvailabilityRecord[];
}

export function generateMockData(): GeneratedData {
  const stock: StockRecord[] = [];
  const footfall: FootfallRecord[] = [];
  const beds: BedStatusRecord[] = [];
  const doctorAttendance: DoctorAttendanceRecord[] = [];
  const testAvailability: TestAvailabilityRecord[] = [];

  for (const facility of FACILITIES) {
    const size = baseFacilitySize(facility);
    const isCrisisFacility = facility.id === "fac-ganze-disp";
    const isSurplusFacility = facility.id === "fac-kilifi-crh";

    // Stock
    for (const item of STOCK_ITEMS) {
      const isMalariaItem = item.category === "antimalarial";
      const baseDailyConsumption = isMalariaItem ? size * 14 : size * 6;
      const startingStock = isMalariaItem ? baseDailyConsumption * 21 : baseDailyConsumption * 30;

      let qty =
        isCrisisFacility && isMalariaItem
          ? baseDailyConsumption * 8 // starts already thin
          : isSurplusFacility && isMalariaItem
          ? startingStock * 2.4 // sits on surplus
          : startingStock;

      for (const date of DATES) {
        const seasonal = isMalariaItem ? seasonalMalariaFactor(date) : 1;
        const noise = 0.8 + rand() * 0.4;
        let consumption = baseDailyConsumption * seasonal * noise;

        if (isCrisisFacility && isMalariaItem) {
          // Ganze: consumption climbing, restocks stopped coming ~3 weeks ago.
          consumption *= 1.6;
        }

        qty = Math.max(0, qty - consumption);

        // Periodic resupply, EXCEPT the crisis facility for this item in the final 3 weeks
        // (that's the whole point of the redistribution story). The surplus facility still
        // gets resupplied, but oversized — a delayed KEMSA drop that overshot demand.
        const daysFromEnd = DATES.length - 1 - DATES.indexOf(date);
        const resupplyDue = DATES.indexOf(date) % 10 === 0 && DATES.indexOf(date) !== 0;
        const crisisLockout = isCrisisFacility && isMalariaItem && daysFromEnd <= 21;
        if (resupplyDue && !crisisLockout) {
          const resupplyMultiplier = isSurplusFacility && isMalariaItem ? 2.6 : 1;
          qty += startingStock * (0.9 + rand() * 0.3) * resupplyMultiplier;
        }

        stock.push({
          facilityId: facility.id,
          itemId: item.id,
          date,
          quantityOnHand: Math.round(qty),
          dailyConsumption: Math.round(consumption * 10) / 10,
        });
      }
    }

    // Footfall
    const baseFootfall = size * 28;
    for (const date of DATES) {
      const seasonal = seasonalMalariaFactor(date);
      const dow = new Date(date).getUTCDay();
      const weekendDip = dow === 0 ? 0.55 : dow === 6 ? 0.8 : 1;
      const noise = 0.85 + rand() * 0.3;
      footfall.push({
        facilityId: facility.id,
        date,
        patientCount: Math.round(baseFootfall * seasonal * weekendDip * noise),
      });
    }

    // Beds
    for (const date of DATES) {
      const occPct = isSurplusFacility ? 0.55 + rand() * 0.15 : 0.4 + rand() * 0.35;
      beds.push({
        facilityId: facility.id,
        date,
        occupiedBeds: Math.min(facility.totalBeds, Math.round(facility.totalBeds * occPct)),
      });
    }

    // Doctor attendance
    for (const date of DATES) {
      const dow = new Date(date).getUTCDay();
      const isWeekend = dow === 0 || dow === 6;
      const attritionRisk = facility.type === "dispensary" ? 0.22 : facility.type === "health_centre" ? 0.12 : 0.05;
      const present = Math.round(
        facility.scheduledStaff * (1 - attritionRisk * (isWeekend ? 1.4 : 1) * rand())
      );
      doctorAttendance.push({
        facilityId: facility.id,
        date,
        scheduledStaff: facility.scheduledStaff,
        presentStaff: Math.max(1, Math.min(facility.scheduledStaff, present)),
      });
    }

    // ---- Test availability ----
    for (const date of DATES) {
      for (const item of STOCK_ITEMS.filter((i) => i.category === "test_kit")) {
        const shortageChance = facility.type === "dispensary" ? 0.18 : 0.06;
        testAvailability.push({
          facilityId: facility.id,
          date,
          itemId: item.id,
          available: rand() > shortageChance,
        });
      }
    }
  }

  return { stock, footfall, beds, doctorAttendance, testAvailability };
}

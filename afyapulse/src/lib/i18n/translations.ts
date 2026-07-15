export type Lang = "en" | "sw";

export const LANGUAGE_LABEL: Record<Lang, string> = { en: "English", sw: "Kiswahili" };

/** Full name used inside Gemma system instructions so generated content matches the UI language. */
export const LANGUAGE_NAME: Record<Lang, string> = { en: "English", sw: "Swahili" };

const dict = {
  // Sidebar / nav
  appName: { en: "AfyaPulse", sw: "AfyaPulse" },
  appTagline: { en: "Kilifi County · District Health", sw: "Kaunti ya Kilifi · Afya ya Wilaya" },
  navCommandCenter: { en: "Command Center", sw: "Kituo cha Uongozi" },
  navRedistribution: { en: "Redistribution", sw: "Ugawaji Upya" },
  navCopilot: { en: "DHO Copilot", sw: "Msaidizi wa Afisa Afya" },
  navIntake: { en: "Field Intake", sw: "Uwekaji Data Ushaani" },
  builtWithGemma: { en: "Built with Gemma 4", sw: "Imejengwa na Gemma 4" },
  builtWithGemmaDesc: {
    en: "Multimodal intake, agentic redistribution, and the district copilot are powered by Gemma 4's native function calling.",
    sw: "Uwekaji data wa aina nyingi, ugawaji upya wa kiotomatiki, na msaidizi wa wilaya vinaendeshwa na uwezo wa Gemma 4 wa kuita vitendaji moja kwa moja.",
  },

  // Dashboard
  dashboardEyebrow: { en: "District Command Center", sw: "Kituo cha Uongozi wa Wilaya" },
  dashboardSubtitle: {
    en: "Live status across {count} primary health facilities — stock, beds, staffing, and diagnostics in one view, with AI-flagged risks below.",
    sw: "Hali ya moja kwa moja ya vituo {count} vya afya ya msingi — akiba ya dawa, vitanda, wafanyakazi, na uchunguzi mahali pamoja, hatari zilizoainishwa na AI hapa chini.",
  },
  statFacilities: { en: "Facilities monitored", sw: "Vituo vinavyofuatiliwa" },
  statCriticalAlerts: { en: "Critical alerts", sw: "Tahadhari za dharura" },
  statNeedsAction: { en: "Needs action", sw: "Inahitaji hatua" },
  statAtRisk: { en: "At stockout risk", sw: "Hatari ya kukosa dawa" },
  statOfEssential: { en: "of essential medicines", sw: "za dawa muhimu" },
  statAvgBeds: { en: "Avg bed occupancy", sw: "Wastani wa matumizi ya vitanda" },
  statHealthScore: { en: "County health score", sw: "Alama ya afya ya kaunti" },
  statPatientsToday: { en: "{count} patients today", sw: "Wagonjwa {count} leo" },
  priorityAlerts: { en: "Priority alerts", sw: "Tahadhari za kipaumbele" },
  facilitiesWorstFirst: { en: "Facilities, worst health score first", sw: "Vituo, alama duni ya afya kwanza" },
  districtMap: { en: "District map", sw: "Ramani ya Wilaya" },
  noActiveAlerts: { en: "No active alerts", sw: "Hakuna tahadhari zinazoendelea" },
  noActiveAlertsDesc: {
    en: "Every facility in Kilifi County is within normal operating range.",
    sw: "Kila kituo katika Kaunti ya Kilifi kiko katika hali ya kawaida ya uendeshaji.",
  },

  // Story banner
  storyEyebrow: { en: "Live scenario", sw: "Hali Halisi ya Sasa" },
  storyTitle: {
    en: "Right now: {facility} is out of {item}",
    sw: "Sasa hivi: {facility} imeishiwa na {item}",
  },
  storyBody: {
    en: "{facility} has 0 days of stock remaining while {source} sits on surplus {distance}km away. AfyaPulse caught it, forecast it, and proposed the fix — follow the chain below.",
    sw: "{facility} haina akiba ya dawa iliyobaki huku {source} ikiwa na ziada umbali wa kilomita {distance}. AfyaPulse iligundua, ikatabiri, na kupendekeza suluhisho — fuata mfululizo hapa chini.",
  },
  storyStep1: { en: "Alert detected", sw: "Tahadhari Imegunduliwa" },
  storyStep1Desc: { en: "AI flags the stockout automatically", sw: "AI inaainisha ukosefu wa dawa kiotomatiki" },
  storyStep2: { en: "Forecast confirms", sw: "Utabiri Umethibitisha" },
  storyStep2Desc: { en: "Holt's linear trend model projects the trajectory", sw: "Mfumo wa Holt unatabiri mwelekeo" },
  storyStep3: { en: "Redistribution proposed", sw: "Ugawaji Umependekezwa" },
  storyStep3Desc: { en: "A real optimizer finds the nearest surplus", sw: "Kikokotoo halisi kinapata ziada iliyo karibu" },
  storyStep4: { en: "Gemma explains", sw: "Gemma Inaeleza" },
  storyStep4Desc: { en: "Plain-English brief for the district officer", sw: "Ufafanuzi rahisi kwa afisa wa wilaya" },
  storySeeForecast: { en: "See the forecast", sw: "Ona Utabiri" },
  storySeeFix: { en: "See the fix", sw: "Ona Suluhisho" },

  // Facility detail
  backToCommandCenter: { en: "Command Center", sw: "Kituo cha Uongozi" },
  bedsLabel: { en: "beds", sw: "vitanda" },
  scheduledStaffLabel: { en: "scheduled staff", sw: "wafanyakazi waliopangwa" },
  asOf: { en: "as of", sw: "kufikia" },
  bedOccupancy: { en: "Bed occupancy", sw: "Matumizi ya Vitanda" },
  doctorAttendance: { en: "Doctor attendance", sw: "Mahudhurio ya Daktari" },
  footfallToday: { en: "Patient footfall today", sw: "Wagonjwa Waliofika Leo" },
  testKitsUnavailable: { en: "Test kits unavailable", sw: "Vifaa vya Uchunguzi Visivyopatikana" },
  fullStockPosition: { en: "Full stock position", sw: "Hali Kamili ya Akiba" },
  itemCol: { en: "Item", sw: "Bidhaa" },
  daysLeftCol: { en: "Days left", sw: "Siku Zilizobaki" },
  statusCol: { en: "Status", sw: "Hali" },
  diagnosticsToday: { en: "Diagnostics availability today", sw: "Upatikanaji wa Vifaa vya Uchunguzi Leo" },
  activeAlerts: { en: "Active alerts", sw: "Tahadhari Zinazoendelea" },
  available: { en: "Available", sw: "Inapatikana" },
  unavailable: { en: "Unavailable", sw: "Haipatikani" },

  // Redistribution
  redistributionEyebrow: { en: "Redistribution", sw: "Ugawaji Upya" },
  redistributionTitle: { en: "Move stock, not just data", sw: "Sogeza Akiba, Sio Data Tu" },
  redistributionSubtitle: {
    en: "Solved as a transportation problem (SciPy linear programming) across every facility's live stock position — proposing the minimum-distance transfers that clear deficits without breaching any source facility's own safety buffer.",
    sw: "Imetatuliwa kama tatizo la usafirishaji (SciPy linear programming) katika hali ya akiba ya kila kituo — ikipendekeza uhamishaji wa umbali mfupi zaidi unaoziba upungufu bila kuathiri akiba ya dharura ya kituo chochote.",
  },
  statProposed: { en: "Proposed transfers", sw: "Uhamishaji Uliopendekezwa" },
  statCritical: { en: "Critical", sw: "Dharura" },
  statUnitsInMotion: { en: "Total units in motion", sw: "Jumla ya Vipimo Vinavyohamishwa" },
  noRedistributionNeeded: {
    en: "No redistribution needed right now — every facility holds adequate stock relative to its neighbors.",
    sw: "Hakuna ugawaji unaohitajika sasa — kila kituo kina akiba ya kutosha ikilinganishwa na vituo jirani.",
  },
  quantity: { en: "Quantity", sw: "Kiasi" },
  estTransit: { en: "Est. transit", sw: "Muda wa Usafiri" },
  minutes: { en: "min", sw: "dak" },
  statusLabel: { en: "Status", sw: "Hali" },
  statusProposed: { en: "Proposed", sw: "Imependekezwa" },
  statusApproved: { en: "Approved", sw: "Imeidhinishwa" },
  statusDispatched: { en: "Dispatched", sw: "Imetumwa" },
  approveDispatch: { en: "Approve & Dispatch", sw: "Idhinisha na Tuma" },
  dispatching: { en: "Dispatching…", sw: "Inatuma…" },
  dispatchedCheck: { en: "✓ Dispatched", sw: "✓ Imetumwa" },
  generateBrief: { en: "Generate AI brief", sw: "Tengeneza Ufafanuzi wa AI" },
  regenerateBrief: { en: "Regenerate brief", sw: "Tengeneza Ufafanuzi Upya" },
  writingBrief: { en: "Writing brief…", sw: "Inaandika Ufafanuzi…" },
  gemmaBrief: { en: "Gemma dispatch brief", sw: "Ufafanuzi wa Gemma" },
  serviceUnavailable: {
    en: "The forecasting/optimization service isn't reachable right now — start it with",
    sw: "Huduma ya utabiri/uboreshaji haipatikani sasa — ianzishe kwa",
  },

  // Copilot
  copilotEyebrow: { en: "DHO Copilot", sw: "Msaidizi wa Afisa Afya" },
  copilotTitle: { en: "Ask AfyaPulse", sw: "Uliza AfyaPulse" },
  copilotSubtitle: {
    en: "Gemma 4 with native function calling, reading live facility data through the same tools this dashboard uses.",
    sw: "Gemma 4 ikiwa na uwezo wa kuita vitendaji moja kwa moja, ikisoma data halisi ya vituo kupitia zana zilezile zinazotumiwa na dashibodi hii.",
  },
  copilotWelcome: {
    en: "I'm the AfyaPulse Copilot. Ask me about facility status, stock forecasts, or redistribution proposals across Kilifi County — I'll pull live data via function calls to answer.",
    sw: "Mimi ni Msaidizi wa AfyaPulse. Niulize kuhusu hali ya vituo, utabiri wa akiba, au mapendekezo ya ugawaji katika Kaunti ya Kilifi — nitatumia data halisi kujibu.",
  },
  copilotPlaceholder: {
    en: "Ask about a facility, a medicine, or redistribution…",
    sw: "Uliza kuhusu kituo, dawa, au ugawaji…",
  },
  send: { en: "Send", sw: "Tuma" },
  thinking: { en: "Thinking…", sw: "Inafikiri…" },
  offlineDraft: { en: "Offline draft — no GEMINI_API_KEY configured", sw: "Rasimu ya Nje ya Mtandao — GEMINI_API_KEY haijawekwa" },

  // Intake
  intakeEyebrow: { en: "Field Intake", sw: "Uwekaji Data Ushaani" },
  intakeTitle: { en: "Turn paper and voice into data", sw: "Geuza Karatasi na Sauti kuwa Data" },
  intakeSubtitle: {
    en: "The capture step a community health worker or nurse would use on a phone at the facility — no forms, no retyping paper registers. This simulates the on-device intake layer; in production it runs against the edge-sized Gemma 4 models (E2B/E4B) for offline capture at low-connectivity facilities.",
    sw: "Hatua ya kunasa data ambayo mhudumu wa afya wa jamii au muuguzi angetumia kwenye simu kituoni — hakuna fomu, hakuna kuandika upya rejista za karatasi. Hii inaonyesha uwekaji data kwenye kifaa moja kwa moja; katika matumizi halisi inatumia miundo midogo ya Gemma 4 (E2B/E4B) kwa unasaji nje ya mtandao.",
  },
  photoIntake: { en: "Photo intake", sw: "Uwekaji kwa Picha" },
  photoIntakeDesc: {
    en: "Upload a photo of a stock shelf, a paper register page, or a handwritten count — Gemma 4's vision reads it directly, no manual data entry.",
    sw: "Pakia picha ya rafu ya akiba, ukurasa wa rejista ya karatasi, au hesabu ya mkono — uwezo wa kuona wa Gemma 4 unasoma moja kwa moja, hakuna uwekaji data wa mkono.",
  },
  choosePhoto: { en: "Choose photo", sw: "Chagua Picha" },
  changePhoto: { en: "Change photo", sw: "Badilisha Picha" },
  clickToChoosePhoto: { en: "Click to choose a photo", sw: "Bofya Kuchagua Picha" },
  extractWithGemma: { en: "Extract with Gemma", sw: "Toa Data kwa Gemma" },
  reading: { en: "Reading…", sw: "Inasoma…" },
  voiceIntake: { en: "Voice note intake", sw: "Uwekaji kwa Sauti" },
  voiceIntakeDesc: {
    en: "Record a spoken report in English or Swahili — Gemma 4 transcribes and structures it, no typing required in the field.",
    sw: "Rekodi ripoti ya sauti kwa Kiingereza au Kiswahili — Gemma 4 inaandika na kupanga data, hakuna uandishi unaohitajika ushaani.",
  },
  startRecording: { en: "Start recording", sw: "Anza Kurekodi" },
  recordAgain: { en: "Record again", sw: "Rekodi Tena" },
  stopRecording: { en: "Stop recording", sw: "Simamisha Kurekodi" },
  recording: { en: "Recording…", sw: "Inarekodi…" },
  noRecordingYet: { en: "No recording yet", sw: "Bado Hakuna Rekodi" },
  listening: { en: "Listening…", sw: "Inasikiliza…" },
  micDenied: {
    en: "Microphone access was denied or is unavailable in this browser.",
    sw: "Ufikiaji wa maikrofoni umekataliwa au haupatikani kwenye kivinjari hiki.",
  },
  gemmaExtraction: { en: "Gemma extraction", sw: "Data Iliyotolewa na Gemma" },
  confidenceHigh: { en: "high confidence", sw: "uhakika wa juu" },
  confidenceMedium: { en: "medium confidence", sw: "uhakika wa kati" },
  confidenceLow: { en: "low confidence", sw: "uhakika wa chini" },

  // Alert message templates
  alertStockoutDays: {
    en: "{item} at {facility}: {days} days remaining",
    sw: "{item} katika {facility}: siku {days} zimebaki",
  },
  alertStockoutUnknown: {
    en: "{item} at {facility}: no consumption data",
    sw: "{item} katika {facility}: hakuna data ya matumizi",
  },
  alertBedPressure: { en: "{facility} beds at {pct}% occupancy", sw: "Vitanda vya {facility} vimejaa {pct}%" },
  alertDoctorAbsence: {
    en: "{facility}: only {present}/{scheduled} scheduled staff present today",
    sw: "{facility}: wafanyakazi {present}/{scheduled} tu waliopangwa wapo leo",
  },
  alertTestUnavailable: {
    en: "{facility}: {count} test kit type(s) unavailable today",
    sw: "{facility}: aina {count} za vifaa vya uchunguzi hazipatikani leo",
  },

  // Facility card / type labels
  typeDispensary: { en: "Dispensary", sw: "Zahanati" },
  typeHealthCentre: { en: "Health Centre", sw: "Kituo cha Afya" },
  typeDistrictHospital: { en: "District Hospital", sw: "Hospitali ya Wilaya" },
  wardSuffix: { en: "Ward", sw: "Kata" },
  bedsShort: { en: "Beds", sw: "Vitanda" },
  staffPresent: { en: "Staff present", sw: "Wafanyakazi Waliopo" },
  footfallTodayShort: { en: "Footfall today", sw: "Wagonjwa Leo" },
  riskLow: { en: "Low", sw: "Chini" },
  riskCritical: { en: "Critical", sw: "Dharura" },

  redistReasoning: {
    en: "{dest} has {days} days of {item} remaining. {source} holds surplus {unit} above its own 10-day safety buffer, {distance}km away (~{minutes} min by road).",
    sw: "{dest} ina siku {days} za {item} zilizobaki. {source} ina ziada ya {unit} zaidi ya akiba yake ya dharura ya siku 10, umbali wa kilomita {distance} (~dakika {minutes} kwa barabara).",
  },
} as const;

export type TranslationKey = keyof typeof dict;

export function t(key: TranslationKey, lang: Lang, vars?: Record<string, string | number>): string {
  let str: string = dict[key]?.[lang] ?? dict[key]?.en ?? key;
  if (vars) {
    for (const [k, v] of Object.entries(vars)) {
      str = str.replace(`{${k}}`, String(v));
    }
  }
  return str;
}

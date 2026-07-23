export type Lang =
  | "en"
  | "sw"
  | "fr"
  | "es"
  | "de"
  | "ar"
  | "zh"
  | "hi"
  | "pt"
  | "ru"
  | "ur"
  | "id"
  | "ja"
  | "ko";

export const ALL_LANGS: Lang[] = ["en", "sw", "fr", "es", "de", "ar", "zh", "hi", "pt", "ru", "ur", "id", "ja", "ko"];

/** Statically translated (hand-verified) — always available with zero latency and no Gemma call. */
const STATIC_LANGS: Lang[] = ["en", "sw"];

/** Native self-name, used in the language picker. */
export const LANGUAGE_LABEL: Record<Lang, string> = {
  en: "English",
  sw: "Kiswahili",
  fr: "Français",
  es: "Español",
  de: "Deutsch",
  ar: "العربية",
  zh: "中文",
  hi: "हिन्दी",
  pt: "Português",
  ru: "Русский",
  ur: "اردو",
  id: "Bahasa Indonesia",
  ja: "日本語",
  ko: "한국어",
};

/** Full English name used inside Gemma system instructions so generated content matches the UI language. */
export const LANGUAGE_NAME: Record<Lang, string> = {
  en: "English",
  sw: "Swahili",
  fr: "French",
  es: "Spanish",
  de: "German",
  ar: "Arabic",
  zh: "Chinese",
  hi: "Hindi",
  pt: "Portuguese",
  ru: "Russian",
  ur: "Urdu",
  id: "Indonesian",
  ja: "Japanese",
  ko: "Korean",
};

export function parseLang(value: string | undefined | null): Lang {
  return value && (ALL_LANGS as string[]).includes(value) ? (value as Lang) : "en";
}

const dict = {
  // Sidebar / nav
  appName: { en: "AfyaPulse", sw: "AfyaPulse" },
  appTagline: { en: "Kilifi County · District Health", sw: "Kaunti ya Kilifi · Afya ya Wilaya" },
  navCommandCenter: { en: "Command Center", sw: "Kituo cha Uongozi" },
  navRedistribution: { en: "Redistribution", sw: "Ugawaji Upya" },
  navCopilot: { en: "DHO Copilot", sw: "Msaidizi wa Afisa Afya" },
  navIntake: { en: "Field Intake", sw: "Uwekaji Data Ushaani" },
  navCompliance: { en: "SHA Compliance", sw: "Uzingatiaji wa SHA" },
  builtWithGemma: { en: "Built with Gemma 4", sw: "Imejengwa na Gemma 4" },
  builtWithGemmaDesc: {
    en: "Multimodal intake, agentic redistribution, and the district copilot are powered by Gemma 4's native function calling.",
    sw: "Uwekaji data wa aina nyingi, ugawaji upya wa kiotomatiki, na msaidizi wa wilaya vinaendeshwa na uwezo wa Gemma 4 wa kuita vitendaji moja kwa moja.",
  },
  copyrightNotice: {
    en: "© {year} Asya Hafidh. All rights reserved.",
    sw: "© {year} Asya Hafidh. Haki zote zimehifadhiwa.",
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
    en: "Proactive, not reactive: solved as a transportation problem (SciPy linear programming) across every facility's Holt's-projected stock position 5 days out — proposing the minimum-distance transfers that preempt a deficit before it happens, without breaching any source facility's own safety buffer.",
    sw: "Ni ya kuzuia kabla, si kujibu baada: imetatuliwa kama tatizo la usafirishaji (SciPy linear programming) kwa kutumia utabiri wa Holt wa hali ya akiba ya kila kituo baada ya siku 5 — ikipendekeza uhamishaji wa umbali mfupi zaidi unaozuia upungufu kabla haujatokea, bila kuathiri akiba ya dharura ya kituo chochote.",
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
    en: "Record a spoken report in your language — Gemma 4 transcribes and structures it into any of {count} supported languages, no typing required in the field.",
    sw: "Rekodi ripoti ya sauti kwa lugha yako — Gemma 4 inaandika na kupanga data katika lugha yoyote kati ya {count} zinazotumika, hakuna uandishi unaohitajika ushaani.",
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
  outbreakClusterMessage: {
    en: "Outbreak signal: {item} consumption up {growth}% week-over-week across {count} facilities ({facilities})",
    sw: "Dalili ya Mlipuko: matumizi ya {item} yameongezeka {growth}% wiki hadi wiki katika vituo {count} ({facilities})",
  },
  outbreakWatchMessage: {
    en: "Watch: {item} consumption up {growth}% week-over-week at {facility}",
    sw: "Fuatilia: matumizi ya {item} yameongezeka {growth}% wiki hadi wiki katika {facility}",
  },
  outbreakWatchTitle: { en: "Outbreak Watch", sw: "Ufuatiliaji wa Mlipuko" },
  outbreakWatchSubtitle: {
    en: "Syndromic surveillance, not just stock monitoring — flags case-cluster patterns from consumption acceleration across nearby facilities, before any one of them runs out.",
    sw: "Ufuatiliaji wa dalili za magonjwa, sio ufuatiliaji wa akiba tu — huainisha mifumo ya makundi ya visa kutokana na kuongezeka kwa matumizi katika vituo jirani, kabla ya kituo chochote kuishiwa.",
  },
  outbreakWatchClear: {
    en: "No cluster signals detected — consumption growth is within normal week-over-week range everywhere.",
    sw: "Hakuna dalili za makundi zilizogunduliwa — ongezeko la matumizi liko ndani ya kiwango cha kawaida cha wiki hadi wiki kila mahali.",
  },
  outbreakClusterBadge: { en: "Cluster", sw: "Kundi" },
  outbreakWatchBadge: { en: "Watch", sw: "Fuatilia" },

  // Trust / explainability trace panels
  traceShowWork: { en: "Show your work — why this score?", sw: "Onyesha Hesabu — kwa nini alama hii?" },
  traceStockScore: { en: "Stock score (40% weight)", sw: "Alama ya Akiba (uzito 40%)" },
  traceDoctorScore: { en: "Doctor attendance (25% weight)", sw: "Mahudhurio ya Daktari (uzito 25%)" },
  traceBedScore: { en: "Bed pressure score (20% weight)", sw: "Alama ya Msongamano wa Vitanda (uzito 20%)" },
  traceTestScore: { en: "Diagnostics availability (15% weight)", sw: "Upatikanaji wa Uchunguzi (uzito 15%)" },
  traceDaysOfLabel: { en: "days of", sw: "siku za" },
  traceOccupiedLabel: { en: "occupied", sw: "imejaa" },
  traceScoreFootnote: {
    en: "healthScore = 0.40×stock + 0.25×doctors + 0.20×beds + 0.15×diagnostics, recomputed live from today's source records — nothing here is cached or estimated.",
    sw: "healthScore = 0.40×akiba + 0.25×madaktari + 0.20×vitanda + 0.15×uchunguzi, inahesabiwa upya moja kwa moja kutoka kwa rekodi za leo — hakuna kinachohifadhiwa au kukisiwa hapa.",
  },
  traceShowForecastWork: { en: "Show your work — how was this forecast?", sw: "Onyesha Hesabu — utabiri huu ulifikiwaje?" },
  traceForecastMethod: { en: "Method", sw: "Mbinu" },
  traceForecastWindow: { en: "Fit window", sw: "Dirisha la Kufaa" },
  traceForecastParams: { en: "Smoothing params", sw: "Vigezo vya Kulainisha" },
  traceForecastConfidence: { en: "Confidence", sw: "Uhakika" },
  traceForecastHistoryDays: { en: "History available", sw: "Historia Iliyopo" },
  traceForecastFootnote: {
    en: "Holt's linear trend exponential smoothing fits level + trend on the most recent 21 days of recorded daily consumption, then simulates on-hand quantity forward day by day until it crosses zero.",
    sw: "Mbinu ya Holt inafaa kiwango + mwelekeo kwa siku 21 za hivi karibuni za matumizi ya kila siku yaliyorekodiwa, kisha inaiga kiasi kilichopo mbele siku baada ya siku hadi kifikie sifuri.",
  },
  traceShowTransferWork: { en: "Show your work — why this transfer?", sw: "Onyesha Hesabu — kwa nini uhamishaji huu?" },
  traceTransferMethod: { en: "Method", sw: "Mbinu" },
  traceTransferMethodValue: { en: "Transportation-problem LP (SciPy linprog)", sw: "LP ya Tatizo la Usafirishaji (SciPy linprog)" },
  traceTransferDistance: { en: "Cost proxy (distance)", sw: "Kigezo cha Gharama (Umbali)" },
  traceTransferSafetyBuffer: { en: "Source safety buffer", sw: "Akiba ya Dharura ya Chanzo" },
  traceTransferSafetyBufferValue: { en: "10 days — never breached", sw: "Siku 10 — haivunjwi kamwe" },
  traceTransferHorizon: { en: "Projection horizon", sw: "Upeo wa Utabiri" },
  traceTransferHorizonValue: { en: "{horizon} days ahead (Holt's-projected, not today's snapshot)", sw: "Siku {horizon} zijazo (utabiri wa Holt, si hali ya leo)" },
  traceTransferFootnote: {
    en: "Objective minimizes distance while a large constant reward per unit shipped biases the solver toward actually clearing deficits, not just staying cheap.",
    sw: "Lengo linapunguza umbali huku zawadi kubwa ya kila kipimo kinachosafirishwa ikielekeza kikokotoo kuziba upungufu, si kubaki nafuu tu.",
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

  redistReasoningProactive: {
    en: "Projected {horizon} days ahead: {dest} will have {days} days of {item} remaining. {source} is projected to still hold surplus {unit} above its own 10-day safety buffer at that point, {distance}km away (~{minutes} min by road) — moving it now preempts the shortfall before it happens.",
    sw: "Utabiri wa siku {horizon} zijazo: {dest} itakuwa na siku {days} za {item} zilizobaki. {source} inatabiriwa kuwa na ziada ya {unit} zaidi ya akiba yake ya dharura ya siku 10 wakati huo, umbali wa kilomita {distance} (~dakika {minutes} kwa barabara) — kuihamisha sasa kunazuia upungufu kabla haujatokea.",
  },

  riskOk: { en: "Ok", sw: "Sawa" },

  // Facility detail extras
  facilityBedsScheduled: {
    en: "{beds} beds · {staff} scheduled staff · as of {date}",
    sw: "vitanda {beds} · wafanyakazi {staff} waliopangwa · kufikia {date}",
  },

  // Stock forecast chart
  loadingForecast: { en: "Loading forecast…", sw: "Inapakia Utabiri…" },
  daysToStockoutLabel: { en: "{days} days to stockout", sw: "siku {days} hadi kuishiwa" },
  noStockoutProjected: { en: "No stockout projected in 21 days", sw: "Hakuna ukosefu unaotabiriwa ndani ya siku 21" },
  solidRecorded: {
    en: "Solid = recorded stock on hand. Lighter continuation = AI-projected trajectory.",
    sw: "Mstari mzito = akiba iliyorekodiwa. Mstari hafifu = mwelekeo uliotabiriwa na AI.",
  },
  stockTrajectory: { en: "{item} — stock trajectory", sw: "{item} — mwelekeo wa akiba" },
  forecastMethodLabel: {
    en: "Forecast method: Holt's linear trend exponential smoothing · {confidence}",
    sw: "Mbinu ya utabiri: Holt's linear trend exponential smoothing · {confidence}",
  },
  onHandLabel: { en: "on hand", sw: "iliyopo" },
  projectedLabel: { en: "projected", sw: "iliyotabiriwa" },
  todayLabel: { en: "Today", sw: "Leo" },

  suggestion1: { en: "Which facilities are at stockout risk?", sw: "Ni vituo gani viko hatarini kuishiwa na dawa?" },
  suggestion2: { en: "What's Ganze Dispensary's status right now?", sw: "Hali ya Zahanati ya Ganze ikoje sasa hivi?" },
  suggestion3: {
    en: "Get the forecast for Artemether-Lumefantrine at Ganze Dispensary",
    sw: "Nipe utabiri wa Artemether-Lumefantrine katika Zahanati ya Ganze",
  },
  suggestion4: { en: "Summarize the current redistribution proposals", sw: "Fupisha mapendekezo ya sasa ya ugawaji" },
  suggestion5: { en: "Any outbreak or cluster signals right now?", sw: "Kuna dalili za mlipuko au kundi sasa hivi?" },

  // SHA compliance report
  complianceEyebrow: { en: "SHA Compliance", sw: "Uzingatiaji wa SHA" },
  complianceTitle: { en: "Digitization compliance, on demand", sw: "Uzingatiaji wa Uwekaji Data Kidijitali, Papo Hapo" },
  complianceSubtitle: {
    en: "SHA requires every facility to digitize stock, bed, staffing, and diagnostics reporting within 90 days or be de-contracted. Generate a Gemma-drafted compliance memo from today's real numbers — the same data every other page reads, never invented.",
    sw: "SHA inahitaji kila kituo kuweka data ya akiba, vitanda, wafanyakazi, na uchunguzi kidijitali ndani ya siku 90 au kufutiwa mkataba. Tengeneza ripoti ya uzingatiaji iliyoandikwa na Gemma kutoka kwa data halisi ya leo — data ileile inayosomwa na kurasa nyingine, haijawahi kubuniwa.",
  },
  complianceDigitized: { en: "Facilities digitized", sw: "Vituo Vilivyowekwa Kidijitali" },
  complianceDispatched: { en: "Transfers dispatched / proposed", sw: "Uhamishaji Uliotumwa / Uliopendekezwa" },
  complianceGenerate: { en: "Generate SHA compliance report", sw: "Tengeneza Ripoti ya Uzingatiaji wa SHA" },
  complianceRegenerate: { en: "Regenerate report", sw: "Tengeneza Ripoti Upya" },
  complianceGenerating: { en: "Drafting…", sw: "Inaandika…" },
  complianceGeneratingSlow: {
    en: "Still drafting — Gemma generation can take up to a minute, thanks for waiting…",
    sw: "Bado inaandika — utengenezaji wa Gemma unaweza kuchukua hadi dakika moja, asante kwa kusubiri…",
  },
  complianceError: {
    en: "Couldn't generate the report just now — please try again.",
    sw: "Imeshindwa kutengeneza ripoti sasa hivi — tafadhali jaribu tena.",
  },
} as const;

export type TranslationKey = keyof typeof dict;

/** English source strings, keyed the same as `dict` — what gets sent to Gemma for auto-translation. */
export const ENGLISH_SOURCE: Record<TranslationKey, string> = Object.fromEntries(
  (Object.keys(dict) as TranslationKey[]).map((k) => [k, dict[k].en])
) as Record<TranslationKey, string>;

/**
 * In-memory cache for Gemma-auto-translated languages (everything beyond the hand-verified
 * `en`/`sw` pairs above). Populated by `ensureAutoTranslated()` in autoTranslate.server.ts on the
 * server, and mirrored into the browser's copy of this module by <AutoTranslationSync> on hydration
 * so client components hitting `t()` after a re-render (not just the initial SSR pass) still see it.
 */
const autoCache: Partial<Record<Lang, Partial<Record<TranslationKey, string>>>> = {};

export function setAutoTranslation(lang: Lang, map: Partial<Record<TranslationKey, string>>): void {
  autoCache[lang] = { ...autoCache[lang], ...map };
}

export function hasAutoTranslation(lang: Lang): boolean {
  return Boolean(autoCache[lang]);
}

export function t(key: TranslationKey, lang: Lang, vars?: Record<string, string | number>): string {
  let str: string;
  if (STATIC_LANGS.includes(lang)) {
    str = dict[key]?.[lang as "en" | "sw"] ?? dict[key]?.en ?? key;
  } else {
    str = autoCache[lang]?.[key] ?? dict[key]?.en ?? key;
  }
  if (vars) {
    for (const [k, v] of Object.entries(vars)) {
      str = str.replace(`{${k}}`, String(v));
    }
  }
  return str;
}

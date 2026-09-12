// ─────────────────────────────────────────────────────────────────────────────
// bessOptimizer.js — 72-hour BESS look-ahead dispatch optimizer
//
// Strategy (per user spec):
//   • Night hours (gen ≈ 0): use BESS to cover shortfall first
//   • Day surplus: charge BESS only up to what's needed for upcoming night
//     shortfall. If surplus exceeds that need → curtail instead of overfilling.
//   • Two-pass greedy: Pass 1 scans ahead to quantify future night shortfall;
//     Pass 2 simulates dispatch hour-by-hour respecting capacity bounds.
//
// Units: all MW / MWh throughout (kW inputs are converted on entry)
// ─────────────────────────────────────────────────────────────────────────────

const CHARGE_CEIL_PCT    = 95;   // stop charging above this SOC %
const DISCHARGE_FLOOR_PCT = 15;  // stop discharging below this SOC %
const NIGHT_GEN_THRESHOLD = 0.5; // MW — anything below this is "dark / no generation"

/**
 * Run the two-pass look-ahead BESS optimizer.
 *
 * @param {Array}  forecastData  — 72 rows from apiClient (MW units)
 * @param {number} bessCapMwh    — total BESS capacity in MWh (0 = no BESS)
 * @param {number} bessInitSoc   — initial SOC percentage (0–100)
 * @returns {{ schedule: Array, summary: Object }}
 */
export function runBessOptimizer(forecastData, bessCapMwh, bessInitSoc) {
  if (!bessCapMwh || bessCapMwh <= 0) {
    return buildNoBessResult(forecastData);
  }

  const n            = forecastData.length;
  const bessFloorMwh = (DISCHARGE_FLOOR_PCT / 100) * bessCapMwh;
  const bessCeilMwh  = (CHARGE_CEIL_PCT     / 100) * bessCapMwh;
  const bessInitMwh  = Math.min(bessCeilMwh, Math.max(bessFloorMwh,
                          (bessInitSoc / 100) * bessCapMwh));

  // ── Pass 1: compute cumulative FUTURE night shortfall from each hour ────────
  // nightShortfallAhead[t] = total MWh of raw shortfall in all night hours after t
  // "night" = gen < NIGHT_GEN_THRESHOLD

  const rawShortfall = forecastData.map(r =>
    Math.max(0, r.demand - r.totalGen)
  );
  const isNight = forecastData.map(r => r.totalGen < NIGHT_GEN_THRESHOLD);

  const nightShortfallAhead = new Array(n).fill(0);
  let cumNightShortfall = 0;
  for (let t = n - 1; t >= 0; t--) {
    nightShortfallAhead[t] = cumNightShortfall;
    if (isNight[t]) cumNightShortfall += rawShortfall[t];
  }

  // ── Pass 2: simulate hour-by-hour dispatch ─────────────────────────────────
  let bessKwh = bessInitMwh;
  const schedule = [];

  for (let t = 0; t < n; t++) {
    const row    = forecastData[t];
    const genMw  = row.totalGen;
    const demMw  = row.demand;
    const rawNet = genMw - demMw; // positive = surplus, negative = shortfall

    let chargeMw    = 0;
    let dischargeMw = 0;
    let dispatchMode = 'balanced';

    if (rawNet > 0) {
      // ── SURPLUS: charge BESS only up to what's needed for future nights ──
      // Reserve = enough to cover all upcoming night shortfall (capped at usable cap)
      const futureNightNeed = nightShortfallAhead[t];
      const targetBessKwh   = Math.min(bessCeilMwh, bessFloorMwh + futureNightNeed);
      const roomToCharge    = Math.max(0, targetBessKwh - bessKwh);

      if (roomToCharge > 0.001) {
        chargeMw     = Math.min(rawNet, roomToCharge);
        dispatchMode = 'charge';
        bessKwh      = Math.min(bessCeilMwh, bessKwh + chargeMw);
      } else {
        // BESS pre-charged for all upcoming nights → curtail the surplus
        dispatchMode = 'curtail';
      }

    } else if (rawNet < 0) {
      // ── SHORTFALL: discharge BESS ─────────────────────────────────────────
      const usable      = Math.max(0, bessKwh - bessFloorMwh);
      const needed      = Math.abs(rawNet);
      dischargeMw       = Math.min(needed, usable);
      dispatchMode      = dischargeMw > 0.001 ? 'discharge' : 'backup';
      bessKwh           = Math.max(bessFloorMwh, bessKwh - dischargeMw);
    }
    // balanced: no action, SOC unchanged

    const socPctAfter   = round1((bessKwh / bessCapMwh) * 100);
    const netAfterBess  = round1(rawNet + dischargeMw - chargeMw);
    const unservedMw    = round1(Math.max(0, -netAfterBess));
    const curtailMw     = dispatchMode === 'curtail' ? round1(rawNet) : round1(Math.max(0, rawNet - chargeMw));

    schedule.push({
      hourOffset:      row.hourOffset,
      timeLabel:       row.timeLabel,
      dayLabel:        row.dayLabel,
      hourOfDay:       row.hourOfDay,
      genMw:           round1(genMw),
      demMw:           round1(demMw),
      rawNetMw:        round1(rawNet),
      bessChargeMw:    round1(chargeMw),
      bessDischargeMw: round1(dischargeMw),
      bessAfterSocPct: socPctAfter,
      netAfterBessMw:  netAfterBess,
      unservedMw,
      curtailMw,
      dispatchMode,   // 'charge' | 'discharge' | 'curtail' | 'balanced' | 'backup'
      isNight:         isNight[t],
    });
  }

  // ── Summary statistics ─────────────────────────────────────────────────────
  const totalRawShortfallMwh     = schedule.reduce((s, r) => s + Math.max(0, r.demMw - r.genMw), 0);
  const totalSurplusAbsorbedMwh  = schedule.reduce((s, r) => s + r.bessChargeMw,    0);
  const totalShortfallCoveredMwh = schedule.reduce((s, r) => s + r.bessDischargeMw, 0);
  const totalUnservedMwh         = schedule.reduce((s, r) => s + r.unservedMw,      0);
  const totalCurtailMwh          = schedule.reduce((s, r) => s + r.curtailMw,       0);

  const shortfallReductionPct = totalRawShortfallMwh > 0.001
    ? round1((totalShortfallCoveredMwh / totalRawShortfallMwh) * 100)
    : 100;

  const socValues  = schedule.map(r => r.bessAfterSocPct);
  const peakSOC    = round1(Math.max(...socValues));
  const minSOC     = round1(Math.min(...socValues));
  const chargeCycles = round1(totalSurplusAbsorbedMwh / bessCapMwh);

  return {
    schedule,
    summary: {
      totalSurplusAbsorbedMwh:  round1(totalSurplusAbsorbedMwh),
      totalShortfallCoveredMwh: round1(totalShortfallCoveredMwh),
      totalUnservedMwh:         round1(totalUnservedMwh),
      totalCurtailMwh:          round1(totalCurtailMwh),
      shortfallReductionPct,
      totalRawShortfallMwh:     round1(totalRawShortfallMwh),
      peakSOC,
      minSOC,
      chargeCycles,
      bessCapMwh,
      bessInitSoc,
    },
  };
}

// ── No-BESS fallback ────────────────────────────────────────────────────────
function buildNoBessResult(forecastData) {
  const schedule = forecastData.map(r => ({
    hourOffset:      r.hourOffset,
    timeLabel:       r.timeLabel,
    dayLabel:        r.dayLabel,
    hourOfDay:       r.hourOfDay,
    genMw:           round1(r.totalGen),
    demMw:           round1(r.demand),
    rawNetMw:        round1(r.totalGen - r.demand),
    bessChargeMw:    0,
    bessDischargeMw: 0,
    bessAfterSocPct: 0,
    netAfterBessMw:  round1(r.totalGen - r.demand),
    unservedMw:      round1(Math.max(0, r.demand - r.totalGen)),
    curtailMw:       round1(Math.max(0, r.totalGen - r.demand)),
    dispatchMode:    r.totalGen >= r.demand ? 'balanced' : 'backup',
    isNight:         r.totalGen < NIGHT_GEN_THRESHOLD,
  }));
  const totalUnservedMwh = schedule.reduce((s, r) => s + r.unservedMw, 0);
  return {
    schedule,
    summary: {
      totalSurplusAbsorbedMwh: 0, totalShortfallCoveredMwh: 0,
      totalUnservedMwh: round1(totalUnservedMwh),
      totalCurtailMwh: 0, shortfallReductionPct: 0,
      totalRawShortfallMwh: round1(totalUnservedMwh),
      peakSOC: 0, minSOC: 0, chargeCycles: 0,
      bessCapMwh: 0, bessInitSoc: 0,
    },
  };
}

// ── CSV export ──────────────────────────────────────────────────────────────
/**
 * Generate a CSV string from the dispatch schedule.
 * @param {Array}  schedule  — output of runBessOptimizer().schedule
 * @param {Object} summary   — output of runBessOptimizer().summary
 * @returns {string} CSV text
 */
export function generateCSV(schedule, summary) {
  const headers = [
    'Hour', 'Time', 'Day',
    'Gen (MW)', 'Demand (MW)', 'Raw Net (MW)',
    'BESS Charge (MW)', 'BESS Discharge (MW)',
    'SOC After (%)', 'Net After BESS (MW)',
    'Unserved (MW)', 'Curtailed (MW)', 'Mode',
  ];

  const rows = schedule.map(r => [
    r.hourOffset,
    r.timeLabel,
    r.dayLabel,
    r.genMw,
    r.demMw,
    r.rawNetMw,
    r.bessChargeMw,
    r.bessDischargeMw,
    r.bessAfterSocPct,
    r.netAfterBessMw,
    r.unservedMw,
    r.curtailMw,
    r.dispatchMode,
  ]);

  const summaryLines = [
    '',
    '# SUMMARY',
    `# BESS Capacity (MWh),${summary.bessCapMwh}`,
    `# Initial SOC (%),${summary.bessInitSoc}`,
    `# Energy Absorbed (MWh),${summary.totalSurplusAbsorbedMwh}`,
    `# Shortfall Covered (MWh),${summary.totalShortfallCoveredMwh}`,
    `# Shortfall Reduction (%),${summary.shortfallReductionPct}`,
    `# Unserved Load (MWh),${summary.totalUnservedMwh}`,
    `# Curtailed (MWh),${summary.totalCurtailMwh}`,
    `# Charge Cycles,${summary.chargeCycles}`,
    `# Peak SOC (%),${summary.peakSOC}`,
    `# Min SOC (%),${summary.minSOC}`,
  ];

  return [
    headers.join(','),
    ...rows.map(r => r.join(',')),
    ...summaryLines,
  ].join('\n');
}

/**
 * Trigger a browser download of the CSV.
 * @param {string} csvText
 * @param {string} [filename]
 */
export function downloadCSV(csvText, filename = 'bess_72h_dispatch.csv') {
  const blob = new Blob([csvText], { type: 'text/csv;charset=utf-8;' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href     = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

/**
 * Auto-generate a plain-English narrative from the schedule & summary.
 * @param {Object} summary
 * @param {Array}  schedule
 * @returns {string}
 */
export function generateNarrative(summary, schedule) {
  const { bessCapMwh, bessInitSoc, totalSurplusAbsorbedMwh, totalShortfallCoveredMwh,
          shortfallReductionPct, totalUnservedMwh, totalCurtailMwh, chargeCycles } = summary;

  const initMwh  = round1((bessInitSoc / 100) * bessCapMwh);
  const usablePct = CHARGE_CEIL_PCT - DISCHARGE_FLOOR_PCT;
  const usableMwh = round1((usablePct / 100) * bessCapMwh);

  const chargeHours    = schedule.filter(r => r.dispatchMode === 'charge');
  const dischargeHours = schedule.filter(r => r.dispatchMode === 'discharge');
  const backupHours    = schedule.filter(r => r.dispatchMode === 'backup');
  const curtailHours   = schedule.filter(r => r.dispatchMode === 'curtail');

  const firstCharge    = chargeHours[0];
  const firstDischarge = dischargeHours[0];

  let parts = [];

  // BESS intro
  parts.push(
    `The ${bessCapMwh.toFixed(0)} MWh BESS starts at ${bessInitSoc.toFixed(0)}% SOC ` +
    `(${initMwh} MWh stored, ${usableMwh} MWh usable between ${DISCHARGE_FLOOR_PCT}%–${CHARGE_CEIL_PCT}%).`
  );

  // Charging
  if (chargeHours.length > 0 && firstCharge) {
    parts.push(
      `Charging begins at ${firstCharge.timeLabel} and runs for ${chargeHours.length} surplus hour${chargeHours.length !== 1 ? 's' : ''}, ` +
      `absorbing ${totalSurplusAbsorbedMwh} MWh of renewable over-generation into the battery bank.`
    );
  }

  // Discharging / shortfall coverage
  if (dischargeHours.length > 0 && firstDischarge) {
    parts.push(
      `BESS discharges across ${dischargeHours.length} night/shortfall hour${dischargeHours.length !== 1 ? 's' : ''} ` +
      `(first at ${firstDischarge.timeLabel}), covering ${totalShortfallCoveredMwh} MWh — ` +
      `eliminating ${shortfallReductionPct}% of the raw generation shortfall.`
    );
  }

  // Unserved
  if (totalUnservedMwh > 0.05) {
    parts.push(
      `⚠ ${totalUnservedMwh} MWh of demand remains unserved across ${backupHours.length} hour${backupHours.length !== 1 ? 's' : ''} — ` +
      `backup generation or load curtailment is required.`
    );
  } else {
    parts.push('✓ Zero unserved demand — the BESS fully bridges all shortfall windows across the 72-hour horizon.');
  }

  // Curtailment
  if (totalCurtailMwh > 0.05) {
    parts.push(
      `${totalCurtailMwh} MWh of surplus is curtailed via inverter clip after the BESS is pre-charged for upcoming night needs.`
    );
  }

  // Cycle count
  if (chargeCycles > 0) {
    parts.push(`Total equivalent charge cycles used: ${chargeCycles}.`);
  }

  return parts.join(' ');
}

// ── Helpers ─────────────────────────────────────────────────────────────────
function round1(v) {
  return Math.round(v * 10) / 10;
}

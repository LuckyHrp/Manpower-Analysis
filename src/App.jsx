import React, { useState } from 'react';

export default function App() {
  const [data, setData] = useState({
    name: '', area: '', code: '', pic: '', month: '', year: 2025,
    sessions: 0, duration: 90, students: 0, peak: 0, peakStart: '15:00', peakEnd: '20:00',
    revenueType: 'avg', avgPrice: 0, totalRevenue: 0,
    opsDays: 0, cancel: 0, resched: 0, noshow: 0, gap: 0,
    prep: 0, assess: 0, admin: 0, meeting: 0,
    ftHrs: 0, ftDays: 0, ftMax: 0, ftEff: 0,
    flHrs: 0, flDays: 0, flMax: 0, flEff: 0, flIdle: 0,
    ptHrs: 0, ptDays: 0, ptMax: 0, ptEff: 0, ptPeakOnly: true,
    targetMargin: 40, overhead: 20
  });

  const [ft, setFt] = useState([]);
  const [flCount, setFlCount] = useState(0);
  const [flRate, setFlRate] = useState({ r60: 150000, r90: 200000 });
  const [ptCount, setPtCount] = useState(0);
  const [ptRate, setPtRate] = useState({ daily: 0, hrsPerDay: 4 });
  const [sim, setSim] = useState({ ft: 0, fl: 0, pt: 0, minSal: 5000000, maxSal: 8000000 });
  const [result, setResult] = useState(null);
  const [showGuide, setShowGuide] = useState(false);
  const [hints, setHints] = useState({});

  const areas = ['Jabodetabek', 'West Java', 'Central Java', 'East Java', 'Sumatra', 'Kalimantan', 'Other'];
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  const hintTexts = {
    name: 'Nama cabang/outlet',
    area: 'Wilayah untuk grouping report',
    code: 'Kode unik cabang. Cth: GE-BKS-001',
    pic: 'Person In Charge / Manager',
    sessions: 'Total sesi kelas per bulan dari scheduling',
    duration: 'Durasi per sesi (menit). Standar: 60/90',
    students: 'Rata-rata siswa per kelas',
    peak: 'Persentase sesi di jam sibuk (15:00-20:00). Biasa 60-70%',
    peakTime: 'Jam prime time. Standar: 15:00-20:00',
    avgPrice: 'Harga rata-rata per siswa/bulan',
    totalRevenue: 'Total pendapatan kotor cabang/bulan',
    opsDays: 'Hari operasional/bulan. Sen-Sab=26',
    cancel: '% pembatalan kelas',
    resched: '% reschedule (kerja 2x)',
    noshow: '% no-show siswa',
    gap: '% waktu kosong antar kelas. 10-20%',
    overhead: 'Biaya non-teacher (sewa, listrik). 15-25%',
    prep: 'Waktu persiapan/sesi (menit). 15-30',
    assess: 'Waktu koreksi/sesi (menit). 10-20',
    admin: '% waktu admin. 5-15%',
    meeting: 'Jam meeting/training per bulan',
    targetMargin: 'Target gross margin. Standar: 35-45%',
    ftHrs: 'Jam kerja FT/hari. Standar: 8',
    ftDays: 'Hari kerja FT/bulan. 22-26',
    ftMax: 'Max jam mengajar FT/hari. 5-6',
    ftEff: 'Efektivitas FT. 75-85%',
    flHrs: 'Jam available FL/hari. 4-6',
    flDays: 'Hari aktif FL/bulan. 15-20',
    flMax: 'Max jam mengajar FL/hari. 3-4',
    flEff: 'Efektivitas FL. 60-70%',
    flIdle: 'Idle time FL. 20-30%',
    ptHrs: 'Jam available PT/hari. 2-4 (peak only)',
    ptDays: 'Hari aktif PT/bulan. 20-26',
    ptMax: 'Max jam mengajar PT/hari. 2-3',
    ptEff: 'Efektivitas PT. 70-80%',
    ptPeakOnly: 'PT hanya di jam prime time untuk max utilization',
    flRate: 'Rate FL/sesi. Lebih tinggi karena fleksibel',
    ptDaily: 'Rate PT per hari (misal 125rb/hari untuk 4-5 jam di prime time)',
    ptHrsDay: 'Jam kerja PT per hari. Standar: 4-5 jam di prime time'
  };

  const set = (k, v) => setData(p => ({ ...p, [k]: v }));
  const n = v => parseFloat(v) || 0;
  const rp = x => 'Rp ' + Math.round(x || 0).toLocaleString('id-ID');
  const pct = x => (x || 0).toFixed(1) + '%';
  const toggleHint = k => setHints(p => ({ ...p, [k]: !p[k] }));

  const calcFtCost = t => {
    const sal = n(t.salary) + n(t.allow) + n(t.trans) + n(t.meal) + n(t.comm);
    const non = n(t.bpjs) + n(t.tools) + n(t.uniform) + n(t.train);
    return sal + non + n(t.extRate) * n(t.extQty) + n(t.bonus);
  };

  const addFt = () => {
    const id = ft.length > 0 ? Math.max(...ft.map(x => x.id)) + 1 : 1;
    setFt([...ft, { id, name: 'Teacher ' + id, salary: 6000000, allow: 1000000, trans: 400000, meal: 400000, comm: 150000, bpjs: 350000, tools: 150000, uniform: 100000, train: 200000, extRate: 100000, extQty: 0, bonus: 400000 }]);
  };

  const updFt = (id, k, v) => setFt(ft.map(t => t.id === id ? { ...t, [k]: v } : t));
  const delFt = id => setFt(ft.filter(t => t.id !== id));

  const loadExample = () => {
    setData({
      name: 'Golden English Bekasi', area: 'Jabodetabek', code: 'GE-BKS-001', pic: 'Budi', month: 'Jan', year: 2025,
      sessions: 400, duration: 90, students: 8, peak: 65, peakStart: '15:00', peakEnd: '20:00',
      revenueType: 'avg', avgPrice: 500000, totalRevenue: 0,
      opsDays: 26, cancel: 5, resched: 12, noshow: 8, gap: 15,
      prep: 30, assess: 15, admin: 10, meeting: 10,
      ftHrs: 8, ftDays: 26, ftMax: 6, ftEff: 80,
      flHrs: 5, flDays: 20, flMax: 4, flEff: 65, flIdle: 25,
      ptHrs: 4, ptDays: 22, ptMax: 3, ptEff: 85, ptPeakOnly: true,
      targetMargin: 40, overhead: 20
    });
    setFt([
      { id: 1, name: 'Rina', salary: 6500000, allow: 1500000, trans: 500000, meal: 500000, comm: 200000, bpjs: 400000, tools: 200000, uniform: 100000, train: 300000, extRate: 100000, extQty: 5, bonus: 500000 },
      { id: 2, name: 'Andi', salary: 6000000, allow: 1200000, trans: 450000, meal: 450000, comm: 180000, bpjs: 380000, tools: 180000, uniform: 100000, train: 250000, extRate: 100000, extQty: 3, bonus: 450000 }
    ]);
    setFlCount(4);
    setPtCount(0);
    setSim({ ft: 2, fl: 1, pt: 3, minSal: 5500000, maxSal: 7500000 });
    setResult(null);
  };

  const reset = () => {
    setData({ name: '', area: '', code: '', pic: '', month: '', year: 2025, sessions: 0, duration: 90, students: 0, peak: 0, peakStart: '15:00', peakEnd: '20:00', revenueType: 'avg', avgPrice: 0, totalRevenue: 0, opsDays: 0, cancel: 0, resched: 0, noshow: 0, gap: 0, prep: 0, assess: 0, admin: 0, meeting: 0, ftHrs: 0, ftDays: 0, ftMax: 0, ftEff: 0, flHrs: 0, flDays: 0, flMax: 0, flEff: 0, flIdle: 0, ptHrs: 0, ptDays: 0, ptMax: 0, ptEff: 0, ptPeakOnly: true, targetMargin: 40, overhead: 20 });
    setFt([]);
    setFlCount(0);
    setPtCount(0);
    setResult(null);
  };

  const calculate = () => {
    const d = data;
    const r = {};
    
    // Basic info
    r.name = d.name || 'Branch';
    r.period = d.month + ' ' + d.year;
    
    // Teacher counts & costs
    r.ftCount = ft.length;
    r.ftTotal = ft.reduce((s, t) => s + calcFtCost(t), 0);
    r.ftAvg = r.ftCount > 0 ? r.ftTotal / r.ftCount : 0;
    r.flCount = flCount;
    r.ptCount = ptCount;
    
    const dur = n(d.duration);
    r.flRateSess = dur === 60 ? flRate.r60 : flRate.r90;
    
    // PT daily rate calculation
    r.ptDailyRate = n(ptRate.daily);
    r.ptHrsPerDay = n(ptRate.hrsPerDay) || 4;
    r.ptCostHrCalc = r.ptHrsPerDay > 0 ? r.ptDailyRate / r.ptHrsPerDay : 0;
    r.ptSessPerDay = dur > 0 ? Math.floor(r.ptHrsPerDay / (dur / 60)) : 0;
    r.ptRateSess = r.ptSessPerDay > 0 ? r.ptDailyRate / r.ptSessPerDay : 0;

    // Revenue
    r.totalStudents = n(d.sessions) * n(d.students);
    r.avgPrice = d.revenueType === 'total' && r.totalStudents > 0 ? n(d.totalRevenue) / r.totalStudents : n(d.avgPrice);
    r.grossRev = d.revenueType === 'total' ? n(d.totalRevenue) : r.totalStudents * r.avgPrice;
    r.lostRev = r.grossRev * (n(d.cancel) + n(d.noshow)) / 100;
    r.effectiveRev = r.grossRev - r.lostRev;

    // Workload
    r.baseHrs = (n(d.sessions) * dur) / 60;
    r.peakHrs = r.baseHrs * n(d.peak) / 100;
    r.offPeakHrs = r.baseHrs - r.peakHrs;
    r.effectivePeakHrs = r.peakHrs * (1 - n(d.cancel)/100 - n(d.noshow)/100);
    
    const adj = -r.baseHrs * n(d.cancel) / 100 + r.baseHrs * n(d.resched) / 100 * 0.5 - r.baseHrs * n(d.noshow) / 100 - r.baseHrs * n(d.gap) / 100;
    r.prepHrs = n(d.sessions) * n(d.prep) / 60;
    r.assessHrs = n(d.sessions) * n(d.assess) / 60;
    r.adminHrs = r.baseHrs * n(d.admin) / 100;
    r.effectiveHrs = r.baseHrs + adj;
    r.workload = r.effectiveHrs + r.prepHrs + r.assessHrs + r.adminHrs;

    // Capacity per person
    r.ftCap = n(d.ftEff) > 0 ? Math.min(n(d.ftHrs) * n(d.ftDays) * n(d.ftEff) / 100, n(d.ftMax) * n(d.ftDays)) - n(d.meeting) : 0;
    r.ftSess = dur > 0 ? Math.floor(r.ftCap / (dur / 60)) : 0;

    r.flCap = n(d.flEff) > 0 ? Math.min(n(d.flHrs) * n(d.flDays) * n(d.flEff) / 100 * (1 - n(d.flIdle) / 100), n(d.flMax) * n(d.flDays)) : 0;
    r.flSess = dur > 0 ? Math.floor(r.flCap / (dur / 60)) : 0;

    r.ptCapRaw = n(d.ptEff) > 0 ? Math.min(n(d.ptHrs) * n(d.ptDays) * n(d.ptEff) / 100, n(d.ptMax) * n(d.ptDays)) : 0;
    r.ptCap = d.ptPeakOnly ? Math.min(r.ptCapRaw, 5 * n(d.opsDays) * 0.8) : r.ptCapRaw;
    r.ptSess = dur > 0 ? Math.floor(r.ptCap / (dur / 60)) : 0;

    // Total capacity
    r.capFT = r.ftCount * r.ftCap;
    r.capFL = r.flCount * r.flCap;
    r.capPT = r.ptCount * r.ptCap;
    r.capTotal = r.capFT + r.capFL + r.capPT;
    r.capGap = r.workload - r.capTotal;
    r.status = r.capGap > 5 ? 'UNDERSTAFFED' : r.capGap < -r.ftCap * 0.5 ? 'OVERSTAFFED' : 'OPTIMAL';

    // Costs
    r.flCostTotal = r.flCount * r.flSess * r.flRateSess;
    // PT cost = daily rate × days active
    r.ptCostTotal = r.ptCount * r.ptDailyRate * n(d.ptDays);
    r.teacherCost = r.ftTotal + r.flCostTotal + r.ptCostTotal;

    // Cost per hour
    r.ftCostHr = r.ftCap > 0 && r.ftCount > 0 ? r.ftTotal / (r.ftCount * r.ftCap) : 0;
    r.flCostHr = dur > 0 ? r.flRateSess / (dur / 60) : 0;
    r.ptCostHr = r.ptCostHrCalc;

    // Peak coverage
    r.ftPeakCov = r.capFT * 0.5;
    r.flPeakCov = r.capFL * 0.6;
    r.ptPeakCov = d.ptPeakOnly ? r.capPT : r.capPT * 0.7;
    r.totalPeakCov = r.ftPeakCov + r.flPeakCov + r.ptPeakCov;
    r.peakGap = r.effectivePeakHrs - r.totalPeakCov;
    r.peakStatus = r.peakGap <= 5 ? 'COVERED' : 'GAP';

    // FL Analysis
    r.flPctWorkload = r.workload > 0 ? (Math.min(Math.max(0, r.effectiveHrs - r.capFT), r.capFL) / r.workload) * 100 : 0;
    r.flPremiumPct = r.ptCostHr > 0 ? ((r.flCostHr - r.ptCostHr) / r.ptCostHr) * 100 : 0;
    r.maxEfficientFL = r.flCap > 0 ? Math.floor(r.workload * 0.25 / r.flCap) : 0;
    r.flOverload = r.flCount > r.maxEfficientFL && r.flCount > 0;
    r.excessFL = Math.max(0, r.flCount - r.maxEfficientFL);
    r.excessFLCost = r.excessFL * r.flSess * r.flRateSess;
    r.ptNeeded = r.ptCap > 0 ? Math.ceil(r.excessFL * r.flCap / r.ptCap) : 0;
    r.ptReplaceCost = r.ptNeeded * r.ptDailyRate * n(d.ptDays);
    r.flSavings = r.excessFLCost - r.ptReplaceCost;

    // PT Prime Time Strategy
    r.flPeakHrs = r.flPeakCov;
    r.flPeakCost = r.flCostHr * r.flPeakHrs;
    r.ptToReplaceFl = r.ptCap > 0 ? Math.ceil(r.flPeakHrs / r.ptCap) : 0;
    r.ptReplaceCostPeak = r.ptToReplaceFl * r.ptDailyRate * n(d.ptDays);
    r.ptSavingsPeak = r.flPeakCost - r.ptReplaceCostPeak;
    r.ptEfficiencyGain = r.flCostHr > 0 ? ((r.flCostHr - r.ptCostHr) / r.flCostHr) * 100 : 0;

    // Optimal Mix
    const avgSal = ((n(sim.minSal) + n(sim.maxSal)) / 2) * 1.35;
    r.optFT = r.ftCap > 0 ? Math.ceil(r.workload * 0.65 / r.ftCap) : 0;
    r.optPT = r.ptCap > 0 ? Math.ceil(r.effectivePeakHrs * 0.6 / r.ptCap) : 0;
    r.optFL = r.flCap > 0 ? Math.max(0, Math.ceil((r.workload - r.optFT * r.ftCap - r.optPT * r.ptCap * 0.5) * 0.2 / r.flCap)) : 0;
    r.optCost = r.optFT * (r.ftAvg || avgSal) + r.optFL * r.flSess * r.flRateSess + r.optPT * r.ptDailyRate * n(d.ptDays);
    r.optSavings = r.teacherCost - r.optCost;

    // Profitability
    r.grossProfit = r.effectiveRev - r.teacherCost;
    r.grossMargin = r.effectiveRev > 0 ? r.grossProfit / r.effectiveRev * 100 : 0;
    r.laborRatio = r.effectiveRev > 0 ? r.teacherCost / r.effectiveRev * 100 : 0;

    // Efficiency ranking
    const eff = [
      { t: 'FT', c: r.ftCostHr, ok: r.ftCount > 0 },
      { t: 'FL', c: r.flCostHr, ok: r.flRateSess > 0 },
      { t: 'PT', c: r.ptCostHr, ok: r.ptRateSess > 0 }
    ].filter(e => e.ok).sort((a, b) => a.c - b.c);
    r.mostEff = eff[0]?.t || '-';
    r.leastEff = eff[eff.length - 1]?.t || '-';

    // Health Score
    let score = 50;
    if (r.grossMargin >= n(d.targetMargin)) score += 15;
    if (r.status === 'OPTIMAL') score += 10;
    if (r.laborRatio <= 50) score += 10;
    if (!r.flOverload) score += 10;
    if (r.peakStatus === 'COVERED') score += 5;
    r.healthScore = Math.min(100, Math.max(0, score));
    r.healthLabel = r.healthScore >= 80 ? 'EXCELLENT' : r.healthScore >= 60 ? 'GOOD' : r.healthScore >= 40 ? 'WARNING' : 'CRITICAL';

    // Scenarios
    const mkScen = (name, nft, nfl, npt, desc) => {
      const cap = nft * r.ftCap + nfl * r.flCap + npt * r.ptCap;
      const cost = nft * (r.ftAvg || avgSal) + nfl * r.flSess * r.flRateSess + npt * r.ptDailyRate * n(d.ptDays);
      const marg = r.effectiveRev > 0 ? (r.effectiveRev - cost) / r.effectiveRev * 100 : 0;
      const peakCov = nft * r.ftCap * 0.5 + nfl * r.flCap * 0.6 + npt * r.ptCap;
      return { name, desc, ft: nft, fl: nfl, pt: npt, cap, gap: r.workload - cap, ok: (r.workload - cap) <= 5, cost, marg, peakCov, peakOk: peakCov >= r.effectivePeakHrs * 0.9 };
    };

    r.scenarios = [
      { ...mkScen('CURRENT', r.ftCount, r.flCount, r.ptCount, 'Kondisi saat ini'), current: true, cost: r.teacherCost, marg: r.grossMargin },
      mkScen('OPTIMAL', r.optFT, r.optFL, r.optPT, 'FT 65% + PT peak + FL min'),
      mkScen('PT PRIME', r.ftCount, Math.max(0, r.flCount - 2), r.ptToReplaceFl, 'Ganti FL dengan PT di peak'),
      mkScen('NO FL', Math.ceil(r.workload * 0.75 / r.ftCap) || r.ftCount, 0, Math.ceil(r.effectivePeakHrs / r.ptCap) || 0, 'Tanpa FL'),
      mkScen('MAX PT', r.ftCount, 0, Math.ceil((r.workload - r.capFT) / r.ptCap) || 0, 'Ganti semua FL → PT')
    ];
    r.best = r.scenarios.filter(s => s.ok && s.peakOk && !s.current).sort((a, b) => b.marg - a.marg)[0];

    // Simulation
    const simCap = n(sim.ft) * r.ftCap + n(sim.fl) * r.flCap + n(sim.pt) * r.ptCap;
    const simCost = n(sim.ft) * (r.ftAvg || avgSal) + n(sim.fl) * r.flSess * r.flRateSess + n(sim.pt) * r.ptDailyRate * n(d.ptDays);
    const simPeak = n(sim.ft) * r.ftCap * 0.5 + n(sim.fl) * r.flCap * 0.6 + n(sim.pt) * r.ptCap;
    r.sim = {
      ft: n(sim.ft), fl: n(sim.fl), pt: n(sim.pt),
      cap: simCap, gap: r.workload - simCap, cost: simCost,
      peakCov: simPeak, peakGap: r.effectivePeakHrs - simPeak,
      marg: r.effectiveRev > 0 ? (r.effectiveRev - simCost) / r.effectiveRev * 100 : 0,
      savings: r.teacherCost - simCost,
      ok: (r.workload - simCap) <= 5,
      peakOk: simPeak >= r.effectivePeakHrs * 0.9
    };

    r.d = d;
    setResult(r);
  };

  const downloadReport = () => {
    if (!result) return;
    const r = result;
    const d = data;
    const lines = [];
    const add = x => lines.push(x);
    const div = () => add('='.repeat(60));
    
    div();
    add('  MANPOWER & EFFICIENCY ANALYSIS REPORT');
    div();
    add('Generated: ' + new Date().toLocaleString('id-ID'));
    add('');
    
    add('--- BRANCH INFO ---');
    add('Name: ' + r.name);
    add('Period: ' + r.period);
    add('Target Margin: ' + pct(n(d.targetMargin)));
    add('');
    
    add('--- HEALTH SCORE ---');
    add('Score: ' + r.healthScore + '/100 [' + r.healthLabel + ']');
    add('Gross Margin: ' + pct(r.grossMargin));
    add('Labor Ratio: ' + pct(r.laborRatio));
    add('');
    
    add('--- REVENUE ---');
    add('Gross Revenue: ' + rp(r.grossRev));
    add('Lost Revenue (cancel/noshow): ' + rp(r.lostRev));
    add('Effective Revenue: ' + rp(r.effectiveRev));
    add('Avg Price/Student: ' + rp(r.avgPrice));
    add('');
    
    add('--- WORKLOAD ---');
    add('Base Hours: ' + r.baseHrs.toFixed(1) + ' hrs');
    add('Peak Hours (' + d.peakStart + '-' + d.peakEnd + '): ' + r.peakHrs.toFixed(1) + ' hrs (' + pct(n(d.peak)) + ')');
    add('Effective Peak Hours: ' + r.effectivePeakHrs.toFixed(1) + ' hrs');
    add('Total Workload: ' + r.workload.toFixed(1) + ' hrs');
    add('');
    
    add('--- CURRENT STAFFING ---');
    add('Full-Time (FT): ' + r.ftCount + ' orang');
    add('  - Capacity/person: ' + r.ftCap.toFixed(1) + ' hrs/mo');
    add('  - Total Capacity: ' + r.capFT.toFixed(1) + ' hrs');
    add('  - Total Cost: ' + rp(r.ftTotal));
    add('  - Cost/Hour: ' + rp(r.ftCostHr));
    add('');
    add('Freelance (FL): ' + r.flCount + ' orang');
    add('  - Capacity/person: ' + r.flCap.toFixed(1) + ' hrs/mo');
    add('  - Total Capacity: ' + r.capFL.toFixed(1) + ' hrs');
    add('  - Total Cost: ' + rp(r.flCostTotal));
    add('  - Cost/Hour: ' + rp(r.flCostHr));
    add('');
    add('Part-Time (PT): ' + r.ptCount + ' orang');
    add('  - Daily Rate: ' + rp(r.ptDailyRate) + ' (' + r.ptHrsPerDay + ' hrs/day)');
    add('  - Capacity/person: ' + r.ptCap.toFixed(1) + ' hrs/mo');
    add('  - Total Capacity: ' + r.capPT.toFixed(1) + ' hrs');
    add('  - Total Cost: ' + rp(r.ptCostTotal));
    add('  - Cost/Hour: ' + rp(r.ptCostHr));
    add('');
    add('TOTAL CAPACITY: ' + r.capTotal.toFixed(1) + ' hrs');
    add('CAPACITY GAP: ' + r.capGap.toFixed(1) + ' hrs [' + r.status + ']');
    add('');
    
    add('--- COST EFFICIENCY ---');
    add('Most Efficient: ' + r.mostEff);
    add('Least Efficient: ' + r.leastEff);
    add('FT/Hour: ' + rp(r.ftCostHr));
    add('FL/Hour: ' + rp(r.flCostHr));
    add('PT/Hour: ' + rp(r.ptCostHr));
    add('FL Premium vs PT: +' + pct(r.flPremiumPct));
    add('');
    
    add('--- PRIME TIME ANALYSIS (' + d.peakStart + '-' + d.peakEnd + ') ---');
    add('Peak Demand: ' + r.effectivePeakHrs.toFixed(1) + ' hrs');
    add('FT Coverage: ' + r.ftPeakCov.toFixed(1) + ' hrs');
    add('FL Coverage: ' + r.flPeakCov.toFixed(1) + ' hrs');
    add('PT Coverage: ' + r.ptPeakCov.toFixed(1) + ' hrs');
    add('Total Coverage: ' + r.totalPeakCov.toFixed(1) + ' hrs');
    add('Peak Gap: ' + r.peakGap.toFixed(1) + ' hrs [' + r.peakStatus + ']');
    add('');
    
    if (r.flOverload) {
      add('--- ⚠️ FL OVERLOAD ALERT ---');
      add('Current FL: ' + r.flCount);
      add('Max Efficient FL: ' + r.maxEfficientFL);
      add('Excess FL: ' + r.excessFL);
      add('Excess FL Cost: ' + rp(r.excessFLCost));
      add('PT Needed to Replace: ' + r.ptNeeded);
      add('PT Replacement Cost: ' + rp(r.ptReplaceCost));
      add('POTENTIAL SAVINGS: ' + rp(r.flSavings) + '/month');
      add('');
    }
    
    add('--- PT PRIME TIME STRATEGY ---');
    add('FL Hours at Peak: ' + r.flPeakHrs.toFixed(1) + ' hrs');
    add('FL Cost at Peak: ' + rp(r.flPeakCost));
    add('PT Needed to Replace FL: ' + r.ptToReplaceFl + ' orang');
    add('PT Replacement Cost: ' + rp(r.ptReplaceCostPeak));
    add('PT Efficiency Gain: ' + pct(r.ptEfficiencyGain));
    add('SAVINGS FROM PT STRATEGY: ' + rp(r.ptSavingsPeak) + '/month');
    add('');
    
    add('--- OPTIMAL MIX RECOMMENDATION ---');
    add('Recommended: ' + r.optFT + ' FT + ' + r.optFL + ' FL + ' + r.optPT + ' PT');
    add('Optimal Cost: ' + rp(r.optCost));
    add('Current Cost: ' + rp(r.teacherCost));
    add('POTENTIAL SAVINGS: ' + rp(r.optSavings) + '/month');
    add('');
    
    add('--- SCENARIO COMPARISON ---');
    r.scenarios.forEach(s => {
      add(s.name + (s.current ? ' [CURRENT]' : '') + (s === r.best ? ' [BEST]' : ''));
      add('  Mix: ' + s.ft + 'FT + ' + s.fl + 'FL + ' + s.pt + 'PT');
      add('  Cost: ' + rp(s.cost) + ' | Margin: ' + pct(s.marg));
      add('  Workload: ' + (s.ok ? 'OK' : 'GAP') + ' | Peak: ' + (s.peakOk ? 'OK' : 'GAP'));
      add('');
    });
    
    if (r.best) {
      add('BEST SCENARIO: ' + r.best.name);
      add('SAVINGS vs CURRENT: ' + rp(r.teacherCost - r.best.cost) + '/month');
      add('');
    }
    
    add('--- YOUR SIMULATION ---');
    add('Mix: ' + r.sim.ft + 'FT + ' + r.sim.fl + 'FL + ' + r.sim.pt + 'PT');
    add('Capacity: ' + r.sim.cap.toFixed(1) + ' hrs');
    add('Workload Gap: ' + r.sim.gap.toFixed(1) + ' hrs [' + (r.sim.ok ? 'OK' : 'GAP') + ']');
    add('Peak Coverage: ' + r.sim.peakCov.toFixed(1) + ' hrs [' + (r.sim.peakOk ? 'OK' : 'GAP') + ']');
    add('Cost: ' + rp(r.sim.cost));
    add('Margin: ' + pct(r.sim.marg));
    add('Savings vs Current: ' + rp(r.sim.savings));
    add('');
    
    add('--- FINANCIAL SUMMARY ---');
    add('Effective Revenue: ' + rp(r.effectiveRev));
    add('Total Teacher Cost: ' + rp(r.teacherCost));
    add('  - FT Cost: ' + rp(r.ftTotal));
    add('  - FL Cost: ' + rp(r.flCostTotal));
    add('  - PT Cost: ' + rp(r.ptCostTotal));
    add('Gross Profit: ' + rp(r.grossProfit));
    add('Gross Margin: ' + pct(r.grossMargin));
    add('Labor Ratio: ' + pct(r.laborRatio));
    add('');
    
    div();
    add('  Generated by Manpower Calculator v2');
    div();

    const content = lines.join('\n');
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'Manpower_' + (r.name || 'Report').replace(/[^a-zA-Z0-9]/g, '_') + '_' + r.period.replace(' ', '_') + '.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const Hint = ({ k }) => hintTexts[k] ? (
    <button onClick={() => toggleHint(k)} className={`ml-1 w-5 h-5 rounded-full text-xs font-bold flex-shrink-0 ${hints[k] ? 'bg-blue-600 text-white' : 'bg-gray-200 hover:bg-blue-500 hover:text-white'}`}>?</button>
  ) : null;

  const HintBox = ({ k }) => hints[k] && hintTexts[k] ? (
    <div className="text-xs text-blue-700 bg-blue-50 p-2 rounded mb-2">{hintTexts[k]}</div>
  ) : null;

  const Input = ({ label, k, unit, type = 'number', opts, val, onCh, hint }) => (
    <div className="mb-2">
      <div className="flex items-center"><label className="text-xs text-gray-600">{label}</label>{hint && <Hint k={hint} />}</div>
      {hint && <HintBox k={hint} />}
      {type === 'select' ? (
        <select value={val ?? data[k]} onChange={e => onCh ? onCh(e.target.value) : set(k, e.target.value)} className="w-full p-2 border border-gray-300 rounded text-sm bg-white">
          <option value="">--</option>
          {opts.map(o => <option key={o} value={o}>{o}</option>)}
        </select>
      ) : (
        <div className="flex gap-1">
          <input type="text" inputMode="numeric" value={val ?? data[k]} onChange={e => onCh ? onCh(e.target.value) : set(k, e.target.value)} className="flex-1 p-2 border border-gray-300 rounded text-sm text-right bg-white" />
          {unit && <span className="p-2 bg-gray-100 rounded text-xs flex items-center">{unit}</span>}
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-100 pb-10">
      <div className="bg-gray-800 text-white p-3 sticky top-0" style={{zIndex: 50}}>
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <div className="font-bold">📊 MANPOWER v2</div>
          <div className="flex gap-2">
            <button onClick={() => setShowGuide(true)} className="bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded text-xs">Guide</button>
            <button onClick={loadExample} className="bg-green-600 hover:bg-green-700 px-3 py-1 rounded text-xs">Example</button>
            <button onClick={reset} className="bg-red-600 hover:bg-red-700 px-3 py-1 rounded text-xs">Reset</button>
          </div>
        </div>
      </div>

      {showGuide && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4" style={{zIndex: 100}} onClick={() => setShowGuide(false)}>
          <div className="bg-white rounded-lg max-w-md w-full p-5 overflow-auto" style={{maxHeight: '80vh'}} onClick={e => e.stopPropagation()}>
            <h2 className="font-bold text-lg mb-3">📖 Panduan</h2>
            <div className="space-y-3 text-sm">
              <div className="bg-red-50 p-3 rounded"><strong>❌ Problem:</strong> FL untuk reduce FT cost, tapi malah BONCOS (rate tinggi, idle time)</div>
              <div className="bg-green-50 p-3 rounded"><strong>✅ Solution:</strong> PT Prime Time - fokus jam 15:00-20:00, rate murah, utilization tinggi</div>
              <div className="bg-blue-50 p-3 rounded"><strong>🎯 Strategi:</strong> FT 65% (base) + PT 25% (peak) + FL 10% (flex)</div>
              <div className="bg-yellow-50 p-3 rounded"><strong>💡 Tips:</strong> Klik ? untuk penjelasan setiap field</div>
            </div>
            <button onClick={() => setShowGuide(false)} className="mt-4 w-full bg-gray-800 text-white p-2 rounded hover:bg-gray-700">Tutup</button>
          </div>
        </div>
      )}

      <div className="max-w-4xl mx-auto p-4 space-y-4">
        {/* Branch */}
        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="font-bold mb-3">🏢 Branch & Revenue</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            <Input label="Name" k="name" type="text" hint="name" />
            <Input label="Area" k="area" type="select" opts={areas} hint="area" />
            <Input label="Month" k="month" type="select" opts={months} />
            <Input label="Year" k="year" />
          </div>
          <div className="grid grid-cols-2 gap-2 mt-2">
            <Input label="Target Margin" k="targetMargin" unit="%" hint="targetMargin" />
            <Input label="Overhead" k="overhead" unit="%" hint="overhead" />
          </div>
          <div className="bg-blue-50 rounded p-3 mt-3">
            <div className="flex gap-2 mb-2">
              <button onClick={() => set('revenueType', 'avg')} className={`flex-1 p-2 rounded text-sm ${data.revenueType === 'avg' ? 'bg-blue-600 text-white' : 'bg-white border'}`}>Per Student</button>
              <button onClick={() => set('revenueType', 'total')} className={`flex-1 p-2 rounded text-sm ${data.revenueType === 'total' ? 'bg-blue-600 text-white' : 'bg-white border'}`}>Total</button>
            </div>
            {data.revenueType === 'avg' ? <Input label="Avg Price/Student" k="avgPrice" unit="Rp" hint="avgPrice" /> : <Input label="Total Revenue" k="totalRevenue" unit="Rp" hint="totalRevenue" />}
          </div>
        </div>

        {/* Operational */}
        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="font-bold mb-3">⚙️ Operational</h3>
          <div className="grid grid-cols-3 gap-2">
            <Input label="Sessions" k="sessions" hint="sessions" />
            <Input label="Duration" k="duration" unit="min" hint="duration" />
            <Input label="Students" k="students" hint="students" />
            <Input label="Peak %" k="peak" unit="%" hint="peak" />
            <Input label="Ops Days" k="opsDays" hint="opsDays" />
          </div>
          <div className="bg-orange-50 rounded p-3 mt-3">
            <div className="flex items-center gap-2 mb-2"><span className="font-bold text-sm">🕐 Prime Time</span><Hint k="peakTime" /></div>
            <HintBox k="peakTime" />
            <div className="grid grid-cols-2 gap-2">
              <Input label="Start" k="peakStart" type="text" />
              <Input label="End" k="peakEnd" type="text" />
            </div>
          </div>
          <div className="grid grid-cols-4 gap-2 mt-3">
            <Input label="Cancel%" k="cancel" unit="%" hint="cancel" />
            <Input label="Resched%" k="resched" unit="%" hint="resched" />
            <Input label="NoShow%" k="noshow" unit="%" hint="noshow" />
            <Input label="Gap%" k="gap" unit="%" hint="gap" />
          </div>
          <div className="grid grid-cols-4 gap-2 mt-2">
            <Input label="Prep" k="prep" unit="min" hint="prep" />
            <Input label="Assess" k="assess" unit="min" hint="assess" />
            <Input label="Admin%" k="admin" unit="%" hint="admin" />
            <Input label="Meeting" k="meeting" unit="hr" hint="meeting" />
          </div>
        </div>

        {/* Capacity */}
        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="font-bold mb-3">📏 Capacity Standards</h3>
          <div className="bg-blue-50 rounded p-3 mb-3">
            <p className="text-xs font-bold text-blue-700 mb-2">🔵 FULL-TIME (FT)</p>
            <div className="grid grid-cols-4 gap-2">
              <Input label="Hrs/Day" k="ftHrs" hint="ftHrs" />
              <Input label="Days/Mo" k="ftDays" hint="ftDays" />
              <Input label="MaxTeach" k="ftMax" hint="ftMax" />
              <Input label="Eff%" k="ftEff" unit="%" hint="ftEff" />
            </div>
          </div>
          <div className="bg-orange-50 rounded p-3 mb-3">
            <p className="text-xs font-bold text-orange-700 mb-2">🟠 FREELANCE (FL) - ❌ Often Overused</p>
            <div className="grid grid-cols-3 gap-2">
              <Input label="Hrs/Day" k="flHrs" hint="flHrs" />
              <Input label="Days/Mo" k="flDays" hint="flDays" />
              <Input label="MaxTeach" k="flMax" hint="flMax" />
              <Input label="Eff%" k="flEff" unit="%" hint="flEff" />
              <Input label="Idle%" k="flIdle" unit="%" hint="flIdle" />
            </div>
          </div>
          <div className="bg-green-50 rounded p-3">
            <p className="text-xs font-bold text-green-700 mb-2">🟢 PART-TIME (PT) - ✅ Recommended</p>
            <div className="grid grid-cols-4 gap-2">
              <Input label="Hrs/Day" k="ptHrs" hint="ptHrs" />
              <Input label="Days/Mo" k="ptDays" hint="ptDays" />
              <Input label="MaxTeach" k="ptMax" hint="ptMax" />
              <Input label="Eff%" k="ptEff" unit="%" hint="ptEff" />
            </div>
                          <div className="flex items-center gap-2 mt-2 bg-green-100 p-2 rounded">
              <input type="checkbox" checked={data.ptPeakOnly} onChange={e => set('ptPeakOnly', e.target.checked)} style={{width: '20px', height: '20px'}} />
              <span className="text-sm font-bold text-green-700">🎯 PT Peak Only (15:00-20:00)</span>
              <Hint k="ptPeakOnly" />
            </div>
            <HintBox k="ptPeakOnly" />
          </div>
        </div>

        {/* FT Teachers */}
        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="font-bold mb-3">👨‍🏫 Full-Time ({ft.length})</h3>
          <button onClick={addFt} className="w-full bg-blue-600 text-white p-2 rounded mb-3">+ Add FT</button>
          {ft.map(t => (
            <div key={t.id} className="bg-blue-50 rounded p-3 mb-2">
              <div className="flex justify-between mb-2">
                <input value={t.name} onChange={e => updFt(t.id, 'name', e.target.value)} className="font-bold bg-transparent border-b" />
                <button onClick={() => delFt(t.id)} className="text-red-500 text-xs">✕</button>
              </div>
              <div className="grid grid-cols-4 md:grid-cols-6 gap-1 text-xs">
                {[['Salary','salary'],['Allow','allow'],['Trans','trans'],['Meal','meal'],['Comm','comm'],['BPJS','bpjs'],['Tools','tools'],['Uniform','uniform'],['Train','train'],['OT Rate','extRate'],['OT Qty','extQty'],['Bonus','bonus']].map(([l,k]) => (
                  <div key={k}><label className="text-gray-500">{l}</label><input type="text" inputMode="numeric" value={t[k]} onChange={e => updFt(t.id, k, e.target.value)} className="w-full p-1 border rounded text-right text-xs" /></div>
                ))}
              </div>
              <div className="mt-2 text-right font-bold text-blue-700">{rp(calcFtCost(t))}</div>
            </div>
          ))}
          {ft.length > 0 && <div className="bg-blue-600 text-white rounded p-3 flex justify-between"><span>Total FT</span><span>{rp(ft.reduce((s, t) => s + calcFtCost(t), 0))}</span></div>}
        </div>

        {/* FL & PT Rates */}
        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="font-bold mb-3">👥 FL & PT</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-orange-50 rounded p-3">
              <p className="font-bold text-sm text-orange-700 mb-2">🟠 Freelance</p>
              <Input label="Count" val={flCount} onCh={v => setFlCount(n(v))} />
              <Input label="Rate/60m" val={flRate.r60} onCh={v => setFlRate({...flRate, r60: n(v)})} unit="Rp" hint="flRate" />
              <Input label="Rate/90m" val={flRate.r90} onCh={v => setFlRate({...flRate, r90: n(v)})} unit="Rp" />
            </div>
            <div className="bg-green-50 rounded p-3">
              <p className="font-bold text-sm text-green-700 mb-2">🟢 Part-Time ⭐ (Daily Rate)</p>
              <Input label="Count" val={ptCount} onCh={v => setPtCount(n(v))} />
              <Input label="Rate/Hari" val={ptRate.daily} onCh={v => setPtRate({...ptRate, daily: n(v)})} unit="Rp" hint="ptDaily" />
              <Input label="Jam/Hari" val={ptRate.hrsPerDay} onCh={v => setPtRate({...ptRate, hrsPerDay: n(v)})} unit="jam" hint="ptHrsDay" />
              {ptRate.daily > 0 && ptRate.hrsPerDay > 0 && (
                <div className="bg-green-100 rounded p-2 mt-2 text-sm">
                  <p>💡 Cost/jam: <b>{rp(ptRate.daily / ptRate.hrsPerDay)}</b></p>
                  <p>💡 Sesi/hari ({data.duration}m): <b>{Math.floor(ptRate.hrsPerDay / (n(data.duration) / 60))}</b></p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Simulation */}
        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="font-bold mb-3">🎯 Simulation</h3>
          <div className="grid grid-cols-3 gap-2">
            <Input label="FT" val={sim.ft} onCh={v => setSim({...sim, ft: n(v)})} />
            <Input label="FL" val={sim.fl} onCh={v => setSim({...sim, fl: n(v)})} />
            <Input label="PT" val={sim.pt} onCh={v => setSim({...sim, pt: n(v)})} />
            <Input label="Sal Min" val={sim.minSal} onCh={v => setSim({...sim, minSal: n(v)})} />
            <Input label="Sal Max" val={sim.maxSal} onCh={v => setSim({...sim, maxSal: n(v)})} />
          </div>
        </div>

        <button onClick={calculate} className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 rounded-lg font-bold text-lg">🚀 CALCULATE</button>

        {/* Results */}
        {result && (
          <div className="space-y-4">
            {/* Health */}
            <div className={`rounded-xl p-4 border-2 ${result.healthScore >= 60 ? 'bg-green-50 border-green-400' : 'bg-red-50 border-red-400'}`}>
              <div className="flex justify-between">
                <div>
                  <p className="text-gray-600 text-sm">{result.name} | {result.period}</p>
                  <p className={`text-4xl font-bold ${result.healthScore >= 60 ? 'text-green-600' : 'text-red-600'}`}>{result.healthScore}/100</p>
                  <p className="font-bold">{result.healthLabel}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-500">Margin</p>
                  <p className={`text-3xl font-bold ${result.grossMargin >= n(data.targetMargin) ? 'text-green-600' : 'text-red-600'}`}>{pct(result.grossMargin)}</p>
                </div>
              </div>
              <button onClick={downloadReport} className="w-full mt-3 bg-gray-800 text-white py-2 rounded-lg font-bold text-sm hover:bg-gray-700">📥 Download Report (TXT)</button>
            </div>

            {/* FL Alert */}
            {result.flOverload && (
              <div className="bg-red-100 border-2 border-red-500 rounded-xl p-4">
                <p className="font-bold text-red-700 text-lg mb-2">⚠️ FL OVERLOAD!</p>
                <div className="grid grid-cols-4 gap-2 mb-3">
                  <div className="bg-white rounded p-2 text-center"><p className="text-xs">Current</p><p className="font-bold text-xl text-red-600">{result.flCount}</p></div>
                  <div className="bg-white rounded p-2 text-center"><p className="text-xs">Max Efficient</p><p className="font-bold text-xl text-green-600">{result.maxEfficientFL}</p></div>
                  <div className="bg-white rounded p-2 text-center"><p className="text-xs">Excess</p><p className="font-bold text-xl text-red-600">{result.excessFL}</p></div>
                  <div className="bg-white rounded p-2 text-center"><p className="text-xs">FL vs PT</p><p className="font-bold text-lg text-red-600">+{pct(result.flPremiumPct)}</p></div>
                </div>
                <div className="bg-green-100 rounded p-3 text-center">
                  <p>💡 Ganti {result.excessFL} FL → {result.ptNeeded} PT</p>
                  <p className="font-bold text-xl text-green-700">Hemat {rp(result.flSavings)}/bln</p>
                </div>
              </div>
            )}

            {/* Peak Analysis */}
            <div className="bg-orange-50 border-2 border-orange-300 rounded-xl p-4">
              <p className="font-bold text-orange-800 mb-2">🕐 Prime Time ({data.peakStart}-{data.peakEnd})</p>
              <div className="grid grid-cols-5 gap-2">
                <div className="bg-white rounded p-2 text-center"><p className="text-xs">Demand</p><p className="font-bold">{result.effectivePeakHrs.toFixed(0)}h</p></div>
                <div className="bg-blue-100 rounded p-2 text-center"><p className="text-xs">FT</p><p className="font-bold">{result.ftPeakCov.toFixed(0)}h</p></div>
                <div className="bg-orange-100 rounded p-2 text-center"><p className="text-xs">FL</p><p className="font-bold">{result.flPeakCov.toFixed(0)}h</p></div>
                <div className="bg-green-100 rounded p-2 text-center"><p className="text-xs">PT</p><p className="font-bold">{result.ptPeakCov.toFixed(0)}h</p></div>
                <div className={`rounded p-2 text-center ${result.peakStatus === 'COVERED' ? 'bg-green-200' : 'bg-red-200'}`}><p className="text-xs">Status</p><p className="font-bold">{result.peakStatus}</p></div>
              </div>
            </div>

            {/* PT Strategy */}
            <div className="bg-green-50 border-2 border-green-400 rounded-xl p-4">
              <p className="font-bold text-green-800 mb-2">🎯 PT Prime Time Strategy</p>
              <div className="grid grid-cols-2 gap-3 mb-3">
                <div className="bg-orange-100 rounded p-3">
                  <p className="text-sm font-bold text-orange-700">❌ FL di Peak</p>
                  <p>{result.flPeakHrs.toFixed(0)} hrs × {rp(result.flCostHr)}/hr</p>
                  <p className="font-bold text-lg">{rp(result.flPeakCost)}</p>
                </div>
                <div className="bg-green-100 rounded p-3">
                  <p className="text-sm font-bold text-green-700">✅ PT di Peak</p>
                  <p>{result.ptToReplaceFl} PT × {rp(result.ptCostHr)}/hr</p>
                  <p className="font-bold text-lg">{rp(result.ptReplaceCostPeak)}</p>
                </div>
              </div>
              <div className="bg-white rounded p-3 text-center">
                <p>PT {pct(result.ptEfficiencyGain)} lebih efisien</p>
                <p className="font-bold text-2xl text-green-600">💰 {rp(result.ptSavingsPeak)}/bln</p>
              </div>
            </div>

            {/* Cost/Hour */}
            <div className="bg-white rounded-lg shadow p-4">
              <p className="font-bold mb-2">💰 Cost/Hour</p>
              <div className="grid grid-cols-3 gap-3">
                <div className={`p-3 rounded text-center ${result.mostEff === 'FT' ? 'bg-green-100 ring-2 ring-green-500' : 'bg-blue-50'}`}>
                  <p className="text-xs">FT</p><p className="font-bold">{rp(result.ftCostHr)}</p>
                  {result.mostEff === 'FT' && <p className="text-xs text-green-600">⭐ BEST</p>}
                </div>
                <div className={`p-3 rounded text-center ${result.leastEff === 'FL' ? 'bg-red-100 ring-2 ring-red-500' : 'bg-orange-50'}`}>
                  <p className="text-xs">FL</p><p className="font-bold">{rp(result.flCostHr)}</p>
                  {result.leastEff === 'FL' && <p className="text-xs text-red-600">❌ WORST</p>}
                </div>
                <div className={`p-3 rounded text-center ${result.mostEff === 'PT' ? 'bg-green-100 ring-2 ring-green-500' : 'bg-green-50'}`}>
                  <p className="text-xs">PT</p><p className="font-bold">{rp(result.ptCostHr)}</p>
                  {result.mostEff === 'PT' && <p className="text-xs text-green-600">⭐ BEST</p>}
                </div>
              </div>
            </div>

            {/* Optimal Mix */}
            <div className="bg-blue-50 border-2 border-blue-400 rounded-xl p-4">
              <p className="font-bold text-blue-800 mb-2">💡 Optimal Mix</p>
              <div className="grid grid-cols-3 gap-3 mb-3">
                <div className="bg-white rounded p-3 text-center"><p className="text-xs">FT (65%)</p><p className="font-bold text-2xl text-blue-600">{result.optFT}</p></div>
                <div className="bg-white rounded p-3 text-center"><p className="text-xs">FL (10%)</p><p className="font-bold text-2xl text-orange-600">{result.optFL}</p></div>
                <div className="bg-white rounded p-3 text-center"><p className="text-xs">PT (25%)</p><p className="font-bold text-2xl text-green-600">{result.optPT}</p></div>
              </div>
              <div className="bg-white rounded p-3 flex justify-between">
                <div><p className="text-sm">Current: {rp(result.teacherCost)}</p><p className="text-sm">Optimal: {rp(result.optCost)}</p></div>
                <div className="text-right"><p className="text-sm text-gray-500">Savings</p><p className={`font-bold text-xl ${result.optSavings > 0 ? 'text-green-600' : 'text-red-600'}`}>{rp(result.optSavings)}</p></div>
              </div>
            </div>

            {/* Scenarios */}
            <div className="bg-white rounded-lg shadow p-4 overflow-x-auto">
              <p className="font-bold mb-2">📊 Scenarios</p>
              <table className="w-full text-sm">
                <thead><tr className="bg-gray-100"><th className="p-2 text-left">Scenario</th><th className="p-2">FT</th><th className="p-2">FL</th><th className="p-2">PT</th><th className="p-2 text-right">Cost</th><th className="p-2 text-right">Margin</th><th className="p-2">Peak</th></tr></thead>
                <tbody>
                  {result.scenarios.map((s, i) => (
                    <tr key={i} className={`border-b ${s.current ? 'bg-blue-50' : s === result.best ? 'bg-green-50' : ''}`}>
                      <td className="p-2"><span className="font-bold">{s.name}</span>{s.current && ' 📍'}{s === result.best && ' ⭐'}<br/><span className="text-xs text-gray-500">{s.desc}</span></td>
                      <td className="p-2 text-center">{s.ft}</td>
                      <td className="p-2 text-center">{s.fl}</td>
                      <td className="p-2 text-center">{s.pt}</td>
                      <td className="p-2 text-right text-xs">{rp(s.cost)}</td>
                      <td className="p-2 text-right font-bold">{pct(s.marg)}</td>
                      <td className={`p-2 text-center ${s.peakOk ? 'text-green-600' : 'text-red-600'}`}>{s.peakOk ? '✓' : '✗'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {result.best && <p className="mt-2 text-green-700 font-bold text-center">⭐ Best: {result.best.name} saves {rp(result.teacherCost - result.best.cost)}/bln</p>}
            </div>

            {/* Simulation */}
            <div className="bg-purple-50 border-2 border-purple-300 rounded-xl p-4">
              <p className="font-bold text-purple-800 mb-2">🎯 Simulation: {result.sim.ft}FT + {result.sim.fl}FL + {result.sim.pt}PT</p>
              <div className="grid grid-cols-4 gap-2">
                <div className="bg-white rounded p-2 text-center"><p className="text-xs">Capacity</p><p className="font-bold">{result.sim.cap.toFixed(0)}h</p></div>
                <div className={`rounded p-2 text-center ${result.sim.ok ? 'bg-green-100' : 'bg-red-100'}`}><p className="text-xs">Workload</p><p className="font-bold">{result.sim.ok ? '✓' : '✗'}</p></div>
                <div className={`rounded p-2 text-center ${result.sim.peakOk ? 'bg-green-100' : 'bg-red-100'}`}><p className="text-xs">Peak</p><p className="font-bold">{result.sim.peakOk ? '✓' : '✗'}</p></div>
                <div className={`rounded p-2 text-center ${result.sim.savings > 0 ? 'bg-green-100' : 'bg-red-100'}`}><p className="text-xs">Savings</p><p className={`font-bold ${result.sim.savings > 0 ? 'text-green-600' : 'text-red-600'}`}>{rp(result.sim.savings)}</p></div>
              </div>
              <div className="mt-2 bg-white rounded p-2 flex justify-between text-sm">
                <span>Cost: {rp(result.sim.cost)}</span>
                <span>Margin: <b className={result.sim.marg >= n(data.targetMargin) ? 'text-green-600' : 'text-red-600'}>{pct(result.sim.marg)}</b></span>
              </div>
            </div>

            {/* Summary */}
            <div className="bg-white rounded-lg shadow p-4">
              <p className="font-bold mb-2">💵 Summary</p>
              <div className="grid grid-cols-4 gap-2">
                <div className="bg-gray-50 rounded p-2"><p className="text-xs">Revenue</p><p className="font-bold text-sm">{rp(result.effectiveRev)}</p></div>
                <div className="bg-gray-50 rounded p-2"><p className="text-xs">Teacher Cost</p><p className="font-bold text-sm">{rp(result.teacherCost)}</p></div>
                <div className="bg-gray-50 rounded p-2"><p className="text-xs">Profit</p><p className={`font-bold text-sm ${result.grossProfit > 0 ? 'text-green-600' : 'text-red-600'}`}>{rp(result.grossProfit)}</p></div>
                <div className="bg-gray-50 rounded p-2"><p className="text-xs">Labor Ratio</p><p className={`font-bold text-sm ${result.laborRatio <= 50 ? 'text-green-600' : 'text-red-600'}`}>{pct(result.laborRatio)}</p></div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
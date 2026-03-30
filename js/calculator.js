/* ===== Calculator — all formulas and metrics ===== */

var CHECK_MIDS = {
  'До 20 000 ₽': 15000,
  '20 000 – 40 000 ₽': 30000,
  '40 000 – 70 000 ₽': 55000,
  '70 000 – 100 000 ₽': 85000,
  'Более 100 000 ₽': 120000
};

function calculate(answers) {
  var checkMid = CHECK_MIDS[answers.avgCheckRange] || 35000;
  var clients = answers.clients || 0;
  var hoursPerClient = answers.hoursPerClient || 20;
  var manualWorkPct = answers.manualWorkPct !== undefined ? answers.manualWorkPct : 50;
  var targetIncome = answers.targetIncome || 500000;

  var currentIncome = clients * checkMid;
  var hourlyRate = hoursPerClient > 0 ? Math.round(checkMid / hoursPerClient) : 0;
  var totalHours = clients * hoursPerClient;
  var routineHours = Math.round(totalHours * manualWorkPct / 100);
  var incomeGap = Math.max(0, targetIncome - currentIncome);
  var routineFreedHours = Math.round(totalHours * Math.max(0, manualWorkPct - 20) / 100);

  // Benchmark: median CFO-rate for freelance financial directors in Russia, 2025-2026
  // Sources: hh.ru salary data, FinDir community surveys
  var benchmarkRate = 1500;
  var lostPotential = Math.max(0, (benchmarkRate - hourlyRate)) * totalHours;

  // Indices (0-100)
  var rateEfficiency = Math.min(100, Math.round(hourlyRate / benchmarkRate * 100));

  var stabilityMap = [0, 15, 30, 50, 65, 78, 88, 95];
  var portfolioStability = stabilityMap[Math.min(clients, 7)] || 95;

  var automationLevel = 100 - manualWorkPct;

  var scalabilityIndex = hourlyRate < 600 ? 20 :
                          hourlyRate < 1000 ? 35 :
                          hourlyRate < 1500 ? 55 :
                          hourlyRate < 2500 ? 75 : 90;

  var clientSources = answers.clientSources || [];
  var sourceCount = clientSources.length;
  var hasPartnerChannel = clientSources.some(function(s) { return s.indexOf('Партнёрск') >= 0; });
  var sourceStability = Math.min(95, sourceCount * 25 + (hasPartnerChannel ? 20 : 0));

  // Practice type
  var practiceType;
  if (currentIncome < 100000 || clients < 3) {
    practiceType = 'Стартовый консультант';
  } else if (clients >= 5 && manualWorkPct > 60) {
    practiceType = 'Перегруженный эксперт';
  } else if (currentIncome >= 200000 && incomeGap < 100000) {
    practiceType = 'В шаге от цели';
  } else if (hourlyRate > 1500 && sourceCount >= 2 && clients >= 4) {
    practiceType = 'Системный CFO-партнёр';
  } else {
    practiceType = 'Застрявшее плато';
  }

  // Scenarios
  var scenarioA = Math.round(currentIncome * 1.25);
  var scenarioB_bonus = Math.round(2 * checkMid * 0.5);
  var newClientsNeeded = checkMid > 0 ? Math.ceil(Math.max(0, incomeGap) / checkMid) : 0;

  var checkGrowthPct = hourlyRate < 500 ? 120 :
                        hourlyRate < 1000 ? 80 :
                        hourlyRate < 1500 ? 45 : 20;

  return {
    checkMid: checkMid,
    currentIncome: currentIncome,
    hourlyRate: hourlyRate,
    totalHours: totalHours,
    routineHours: routineHours,
    incomeGap: incomeGap,
    routineFreedHours: routineFreedHours,
    lostPotential: lostPotential,
    targetIncome: targetIncome,
    benchmarkRate: benchmarkRate,
    rateEfficiency: rateEfficiency,
    portfolioStability: portfolioStability,
    automationLevel: automationLevel,
    scalabilityIndex: scalabilityIndex,
    sourceStability: sourceStability,
    practiceType: practiceType,
    scenarioA: scenarioA,
    scenarioB_bonus: scenarioB_bonus,
    newClientsNeeded: newClientsNeeded,
    checkGrowthPct: checkGrowthPct,
    clients: clients,
    hoursPerClient: hoursPerClient,
    manualWorkPct: manualWorkPct,
    sourceCount: sourceCount,
    hasPartnerChannel: hasPartnerChannel
  };
}

function formatMoney(n) {
  if (n >= 1000000) return (n / 1000000).toFixed(1).replace('.0', '') + ' млн';
  return Math.round(n).toLocaleString('ru-RU');
}

function formatMoneyShort(n) {
  if (n >= 1000000) return (n / 1000000).toFixed(1).replace('.0', '') + ' млн';
  if (n >= 1000) return Math.round(n / 1000) + 'к';
  return String(n);
}

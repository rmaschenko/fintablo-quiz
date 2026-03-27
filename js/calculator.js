const CHECK_MIDS = {
  'До 20 000 ₽': 15000,
  '20 000 – 40 000 ₽': 30000,
  '40 000 – 70 000 ₽': 55000,
  '70 000 – 100 000 ₽': 85000,
  'Более 100 000 ₽': 120000
};

function calculate(answers) {
  const checkMid = CHECK_MIDS[answers.avgCheckRange] || 35000;
  const clients = answers.clients || 0;
  const hoursPerClient = answers.hoursPerClient || 15;
  const manualWorkPct = answers.manualWorkPct || 50;
  const targetIncome = answers.targetIncome || 300000;

  const currentIncome = clients * checkMid;
  const hourlyRate = hoursPerClient > 0 ? Math.round(checkMid / hoursPerClient) : 0;
  const totalHours = clients * hoursPerClient;
  const routineHours = Math.round(totalHours * manualWorkPct / 100);
  const incomeGap = Math.max(0, targetIncome - currentIncome);
  const routineFreedHours = Math.round(totalHours * Math.max(0, manualWorkPct - 20) / 100);
  const lostPotential = Math.max(0, (1200 - hourlyRate)) * totalHours;

  const rateEfficiency = Math.min(100, Math.round(hourlyRate / 1200 * 100));
  const stabilityMap = [0, 15, 30, 50, 65, 78, 88, 95];
  const portfolioStability = stabilityMap[Math.min(clients, 7)] || 95;
  const automationLevel = 100 - manualWorkPct;
  const scalabilityIndex = hourlyRate < 600 ? 20 : hourlyRate < 1000 ? 40 : hourlyRate < 1800 ? 65 : 88;

  const clientSources = answers.clientSources || [];
  const sourceCount = clientSources.length;
  const hasPartnerChannel = clientSources.some(s => s.includes('Партнёрские'));
  const sourceStability = Math.min(95, sourceCount * 25 + (hasPartnerChannel ? 20 : 0));

  let practiceType;
  if (currentIncome < 100000 || clients < 3) {
    practiceType = 'Стартовый консультант';
  } else if (clients >= 5 && manualWorkPct > 60) {
    practiceType = 'Перегруженный эксперт';
  } else if (currentIncome >= 180000 && incomeGap < 100000) {
    practiceType = 'В шаге от цели';
  } else if (hourlyRate > 1500 && sourceCount >= 2 && clients >= 4) {
    practiceType = 'Системный CFO-партнёр';
  } else {
    practiceType = 'Застрявшее плато';
  }

  const scenarioA = Math.round(currentIncome * 1.25);
  const scenarioB_bonus = Math.round(2 * checkMid * 0.5);
  const newClientsNeeded = checkMid > 0 ? Math.ceil(incomeGap / checkMid) : 0;

  const checkGrowthPct = hourlyRate < 500 ? 120 :
                          hourlyRate < 1000 ? 80 :
                          hourlyRate < 1500 ? 40 : 20;

  return {
    checkMid, currentIncome, hourlyRate, totalHours, routineHours,
    incomeGap, routineFreedHours, lostPotential, targetIncome,
    rateEfficiency, portfolioStability, automationLevel,
    scalabilityIndex, sourceStability, practiceType,
    scenarioA, scenarioB_bonus, newClientsNeeded, checkGrowthPct,
    clients, hoursPerClient, manualWorkPct, sourceCount, hasPartnerChannel
  };
}

function formatMoney(n) {
  if (n >= 1000000) return (n / 1000000).toFixed(1).replace('.0', '') + ' млн';
  if (n >= 1000) return Math.round(n).toLocaleString('ru-RU');
  return String(n);
}

function formatMoneyShort(n) {
  if (n >= 1000000) return (n / 1000000).toFixed(1).replace('.0', '') + ' млн';
  if (n >= 1000) return Math.round(n / 1000) + 'к';
  return String(n);
}

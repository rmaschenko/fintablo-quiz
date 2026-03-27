const KEY = 'fintablo_quiz';

function saveAnswer(field, value) {
  const data = JSON.parse(localStorage.getItem(KEY) || '{}');
  data[field] = value;
  localStorage.setItem(KEY, JSON.stringify(data));
}

function getAllAnswers() {
  return JSON.parse(localStorage.getItem(KEY) || '{}');
}

function loadDemoData() {
  const demo = {
    name: 'Алексей',
    experience: '5–10 лет',
    status: 'Фриланс/аутсорс 1–3 года',
    clients: 5,
    avgCheckRange: '20 000 – 40 000 ₽',
    avgCheckMid: 30000,
    hoursPerClient: 15,
    manualWorkPct: 65,
    clientSources: ['Сарафанное радио от текущих клиентов'],
    barriers: ['Нет стабильного потока новых клиентов', 'Много рутины — нет времени на рост'],
    targetIncome: 300000,
    isDemo: true
  };
  localStorage.setItem(KEY, JSON.stringify(demo));
  window.location.href = 'report.html';
}

function clearAll() {
  localStorage.removeItem(KEY);
  localStorage.removeItem('fintablo_leads');
}

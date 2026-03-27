function saveLead(data) {
  const leads = JSON.parse(localStorage.getItem('fintablo_leads') || '[]');
  leads.push({ ...data, timestamp: new Date().toISOString() });
  localStorage.setItem('fintablo_leads', JSON.stringify(leads));
}

function sendEmailLead(answers, contact) {
  const metrics = calculate(answers);
  const subject = encodeURIComponent(
    'Новый лид FinTablo: ' + answers.name + ', ' + formatMoney(metrics.currentIncome) + ' ₽/мес'
  );

  const lines = [
    'НОВЫЙ ЛИД — ДИАГНОСТИКА ФИНАНСИСТА',
    '',
    'Имя: ' + answers.name,
    'Телефон: ' + contact.phone,
    'Email: ' + (contact.email || 'не указан'),
    'Хочет разбор с экспертом: ' + (contact.wantExpert ? 'ДА' : 'нет'),
    'Время: ' + new Date().toLocaleString('ru-RU'),
    '',
    '--- РЕЗУЛЬТАТЫ ДИАГНОСТИКИ ---',
    'Опыт: ' + answers.experience,
    'Статус: ' + answers.status,
    'Клиентов: ' + answers.clients,
    'Средний чек: ' + answers.avgCheckRange,
    'Часов/клиент: ' + answers.hoursPerClient,
    'Доля рутины: ' + answers.manualWorkPct + '%',
    'Источники клиентов: ' + (answers.clientSources || []).join(', '),
    'Барьеры: ' + (answers.barriers || []).join(', '),
    'Целевой доход: ' + answers.targetIncome + ' ₽/мес',
    '',
    '--- РАСЧЁТНЫЕ МЕТРИКИ ---',
    'Текущий доход: ' + metrics.currentIncome + ' ₽/мес',
    'Ставка: ' + metrics.hourlyRate + ' ₽/час',
    'Тип практики: ' + metrics.practiceType,
    'Разрыв до цели: ' + metrics.incomeGap + ' ₽/мес'
  ];

  const body = encodeURIComponent(lines.join('\n'));
  window.location.href = 'mailto:maschenko@icloud.com?subject=' + subject + '&body=' + body;
}

function submitLead() {
  var phone = document.getElementById('phone').value;
  var email = document.getElementById('email').value;
  var wantExpert = document.getElementById('want-expert').checked;

  var answers = getAllAnswers();
  var metrics = calculate(answers);

  answers.currentIncome = metrics.currentIncome;
  answers.hourlyRate = metrics.hourlyRate;
  answers.practiceType = metrics.practiceType;
  answers.incomeGap = metrics.incomeGap;

  var contact = { phone: phone, email: email, wantExpert: wantExpert };

  saveLead(Object.assign({}, answers, contact));
  sendEmailLead(answers, contact);

  setTimeout(function() {
    window.location.href = 'report.html';
  }, 800);
}

function showReportWithoutContact() {
  var answers = getAllAnswers();
  answers.skippedContact = true;
  localStorage.setItem('fintablo_quiz', JSON.stringify(answers));
  window.location.href = 'report.html';
}

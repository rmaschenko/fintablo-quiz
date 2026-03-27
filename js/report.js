document.addEventListener('DOMContentLoaded', function() {
  var logoImg = document.querySelector('.logo img');
  if (logoImg) {
    logoImg.onerror = function() {
      this.style.display = 'none';
      var fb = this.parentElement.querySelector('.logo-fallback');
      if (fb) fb.style.display = 'block';
    };
  }

  var answers = getAllAnswers();
  if (!answers.name) {
    window.location.href = 'index.html';
    return;
  }

  var m = calculate(answers);

  // Header
  document.getElementById('report-name').textContent = answers.name;
  document.getElementById('report-date').textContent = new Date().toLocaleDateString('ru-RU');

  renderDashboard(answers, m);
  renderMetrics(answers, m);
  renderProfile(answers, m);
  renderLostPotential(answers, m);
  renderScenarios(answers, m);
  renderRoadmap(answers, m);
  renderFinTablo(answers, m);
  renderCTA(answers, m);
  renderShareCard(answers, m);

  // Show persistent banner if skipped contact
  if (answers.skippedContact) {
    var banner = document.getElementById('persistent-banner');
    if (banner) banner.classList.add('visible');
  }

  // Animate gauges on scroll
  setTimeout(function() {
    document.querySelectorAll('.gauge-fill').forEach(function(el) {
      el.style.width = el.dataset.target + '%';
    });
  }, 300);
});

function renderDashboard(a, m) {
  var el = document.getElementById('dashboard');

  var clientsColor = m.clients < 3 ? 'red' : m.clients <= 5 ? 'yellow' : 'green';
  var incomeColor = m.currentIncome < 100000 ? 'red' : m.currentIncome <= 250000 ? 'yellow' : 'green';
  var rateColor = m.hourlyRate < 500 ? 'red' : m.hourlyRate < 1200 ? 'yellow' : 'green';
  var routineColor = m.routineHours < 20 ? 'green' : m.routineHours <= 40 ? 'yellow' : 'red';

  el.innerHTML =
    '<div class="dashboard-grid">' +
      '<div class="dash-card ' + clientsColor + '"><div class="dash-label">Клиентов</div><div class="dash-value">' + m.clients + '</div></div>' +
      '<div class="dash-card ' + incomeColor + '"><div class="dash-label">Расч. доход</div><div class="dash-value">' + formatMoneyShort(m.currentIncome) + '</div><div class="dash-bench">₽/мес</div></div>' +
      '<div class="dash-card ' + rateColor + '"><div class="dash-label">Ставка</div><div class="dash-value">' + formatMoney(m.hourlyRate) + '</div><div class="dash-bench">₽/ч · медиана 1 200</div></div>' +
      '<div class="dash-card ' + routineColor + '"><div class="dash-label">Часов рутины</div><div class="dash-value">' + m.routineHours + '</div><div class="dash-bench">ч/мес</div></div>' +
    '</div>';

  // Main insight
  var insight = getMainInsight(a, m);
  el.innerHTML += '<div class="report-insight">' + a.name + ', вот главное, что показала ваша диагностика:<br><br>' + insight + '</div>';
}

function getMainInsight(a, m) {
  if (m.hourlyRate < 500 && m.clients > 5) return 'Тревожная ситуация: вы работаете много, но зарабатываете как начинающий специалист. При ставке ' + formatMoney(m.hourlyRate) + ' ₽/ч и ' + m.clients + ' клиентах вы в зоне выгорания. Приоритет №1 — не новые клиенты, а радикальное повышение ставки через переупаковку оффера и автоматизацию.';
  if (m.currentIncome < 100000) return 'Ваша практика пока в стартовой фазе. При ' + m.clients + ' клиентах и доходе ' + formatMoneyShort(m.currentIncome) + '/мес главный приоритет — выстроить стабильный поток и поднять средний чек. Хорошая новость: финансисты с вашим опытом, изменившие подход, выходят на 200к+ за 3–4 месяца.';
  if (m.automationLevel < 40 && m.clients >= 4) return 'Вы зарабатываете ' + formatMoneyShort(m.currentIncome) + '/мес, но ' + a.manualWorkPct + '% времени уходит на рутину. Это ' + m.routineHours + ' часов в месяц, которые можно сократить. Автоматизация высвободит время на ' + Math.floor(m.routineFreedHours / m.hoursPerClient) + ' дополнительных клиентов без увеличения нагрузки.';
  if (m.incomeGap < 100000 && m.currentIncome >= 180000) return 'Вы в шаге от цели. Разрыв всего ' + formatMoneyShort(m.incomeGap) + '/мес — это 1–2 клиента или повышение чека на 20% у текущих. При ставке ' + formatMoney(m.hourlyRate) + ' ₽/ч у вас сильная позиция для переговоров.';
  return 'Ваша практика генерирует ' + formatMoneyShort(m.currentIncome) + '/мес при ставке ' + formatMoney(m.hourlyRate) + ' ₽/ч. Разрыв до цели — ' + formatMoneyShort(m.incomeGap) + '. Диагностика показывает конкретные точки роста: оптимизация ставки, автоматизация рутины и расширение каналов привлечения клиентов.';
}

function renderMetrics(a, m) {
  var el = document.getElementById('metrics');
  var gauges = [
    { title: 'Эффективность ставки', value: m.rateEfficiency, bench: 'Бенчмарк: 1 200 ₽/ч — медиана CFO-уровня', rec: getMetricRec('rate', m) },
    { title: 'Устойчивость портфеля', value: m.portfolioStability, bench: 'Устойчивый портфель — 5+ клиентов', rec: getMetricRec('portfolio', m) },
    { title: 'Степень автоматизации', value: m.automationLevel, bench: 'Топ-20% финансистов: < 25% рутины', rec: getMetricRec('automation', m) },
    { title: 'Масштабируемость модели', value: m.scalabilityIndex, bench: 'Масштабируемая модель — ставка > 1500 ₽/ч', rec: getMetricRec('scale', m) },
    { title: 'Предсказуемость потока', value: m.sourceStability, bench: 'Предсказуемый поток — 2+ канала', rec: getMetricRec('source', m) }
  ];

  var html = '';
  gauges.forEach(function(g) {
    var color = g.value >= 70 ? 'green' : g.value >= 40 ? 'yellow' : 'red';
    var badge = g.value >= 70 ? '<span class="bench-badge green">Хороший уровень</span>' :
                g.value >= 40 ? '<span class="bench-badge yellow">Есть потенциал</span>' :
                '<span class="bench-badge red">Требует внимания</span>';
    html +=
      '<div class="gauge-item">' +
        '<div class="gauge-header"><span class="gauge-title">' + g.title + '</span><span class="gauge-value">' + g.value + '%</span></div>' +
        '<div class="gauge-bar"><div class="gauge-fill ' + color + '" data-target="' + g.value + '"></div></div>' +
        '<div class="gauge-bench">' + g.bench + ' ' + badge + '</div>' +
        '<div class="gauge-rec">' + g.rec + '</div>' +
      '</div>';
  });
  el.innerHTML = html;
}

function getMetricRec(type, m) {
  switch (type) {
    case 'rate':
      if (m.rateEfficiency < 50) return 'Переупакуйте оффер: вместо "веду учёт" — "нахожу, где бизнес теряет деньги". Это позволит поднять ставку на 50–100% без потери клиентов.';
      if (m.rateEfficiency < 80) return 'Ваша ставка близка к рыночной. Для перехода в топ-сегмент добавьте проектную составляющую: аудит, оптимизация, внедрение систем.';
      return 'Отличная ставка. Фокусируйтесь на удержании и масштабировании через автоматизацию.';
    case 'portfolio':
      if (m.portfolioStability < 50) return 'Критически важно: добавьте 2–3 клиента через партнёрский канал для устойчивости. Потеря одного клиента сейчас — удар по доходу в ' + Math.round(100 / Math.max(1, m.clients)) + '%.';
      if (m.portfolioStability < 80) return 'Хорошая база. Для полной устойчивости диверсифицируйте по размеру и отрасли клиентов.';
      return 'Устойчивый портфель. Фокус на качество: оставляйте самых прибыльных, повышайте чек.';
    case 'automation':
      if (m.automationLevel < 40) return 'Автоматизация рутины высвободит ~' + m.routineFreedHours + ' часов/мес. Начните с одного процесса: сбор данных или формирование отчётов.';
      if (m.automationLevel < 70) return 'Умеренная автоматизация. Следующий шаг — шаблонизация типовых операций и автоимпорт данных.';
      return 'Высокая автоматизация. Вы в топ-20% по эффективности. Поддерживайте и оптимизируйте.';
    case 'scale':
      if (m.scalabilityIndex < 40) return 'При текущей ставке рост возможен только через увеличение часов — а это путь к выгоранию. Приоритет — повышение стоимости часа.';
      if (m.scalabilityIndex < 70) return 'Модель масштабируется умеренно. Для следующего уровня: автоматизация + повышение чека.';
      return 'Высокая масштабируемость. Вы можете расти без пропорционального увеличения нагрузки.';
    case 'source':
      if (m.sourceStability < 40) return 'Зависимость от одного канала — главный риск. Подключите партнёрский канал для предсказуемого потока лидов.';
      if (m.sourceStability < 70) return 'Два канала — хорошо, но добавьте партнёрский для стабильности: он даёт поток без вашего активного участия.';
      return 'Диверсифицированный поток. Оптимизируйте: какой канал даёт лучший ROI?';
  }
}

function renderProfile(a, m) {
  var el = document.getElementById('profile');
  var icons = {
    'Стартовый консультант': '🚀',
    'Перегруженный эксперт': '⚡',
    'Застрявшее плато': '📊',
    'В шаге от цели': '🎯',
    'Системный CFO-партнёр': '👑'
  };

  var descs = {
    'Стартовый консультант': 'Ваша практика находится на начальном этапе. Навыки есть, но модель монетизации ещё не выстроена. Ключевая задача — быстро набрать первых 3–5 клиентов через проверенные каналы и сформировать базовый оффер с измеримой ценностью для бизнеса.',
    'Перегруженный эксперт': 'Вы работаете много, но основная часть времени уходит на операционную рутину. При ' + a.manualWorkPct + '% рутины и ' + m.clients + ' клиентах вы физически не можете расти без изменения инструментов. Автоматизация — не "было бы неплохо", а критическая необходимость.',
    'Застрявшее плато': 'Клиенты есть, доход стабилен, но рост заблокирован. Это самая коварная фаза: кажется, что "всё нормально", но на самом деле вы теряете ' + formatMoney(m.lostPotential) + ' ₽/мес на неоптимальной ставке. Нужны системные изменения, а не "ещё один клиент".',
    'В шаге от цели': 'Вы близки к целевому доходу ' + formatMoneyShort(m.targetIncome) + '/мес. Разрыв всего ' + formatMoneyShort(m.incomeGap) + ' — это точечные улучшения: повышение чека, один новый клиент, оптимизация процессов. Не нужна трансформация — нужна точная настройка.',
    'Системный CFO-партнёр': 'Вы построили масштабируемую практику: высокая ставка, диверсифицированные каналы, автоматизация. Ваш следующий шаг — либо делегирование и команда, либо упаковка методологии в продукт.'
  };

  var points = {
    'Стартовый консультант': ['Подключить партнёрский канал для быстрого старта', 'Переупаковать оффер под конкретный результат', 'Набрать 3–5 клиентов за 2–3 месяца'],
    'Перегруженный эксперт': ['Автоматизировать ' + Math.round(m.routineFreedHours) + ' часов рутины в месяц', 'Повысить чек на 25% у лояльных клиентов', 'Отказаться от клиентов с низким ROI времени'],
    'Застрявшее плато': ['Переупаковать оффер из "учёт" в "CFO-результат"', 'Добавить второй источник клиентов', 'Поднять средний чек через расширение scope'],
    'В шаге от цели': ['Повысить чек у 1–2 текущих клиентов', 'Добавить одного клиента через партнёрский канал', 'Оптимизировать самый рутинный процесс'],
    'Системный CFO-партнёр': ['Делегировать операционный учёт помощнику', 'Масштабировать через партнёрскую программу', 'Упаковать методологию для тиражирования']
  };

  var icon = icons[m.practiceType] || '📊';
  var desc = descs[m.practiceType] || '';
  var pts = points[m.practiceType] || [];

  var potential = m.currentIncome > 0 ? Math.round(m.incomeGap / m.currentIncome * 100) : 100;

  el.innerHTML =
    '<div class="profile-card" id="share-card">' +
      '<div class="profile-icon">' + icon + '</div>' +
      '<div class="profile-type">' + m.practiceType + '</div>' +
      '<div class="profile-desc">' + desc + '</div>' +
      '<div class="profile-stats"><span>' + m.clients + ' клиентов</span><span>' + formatMoney(m.hourlyRate) + ' ₽/ч</span><span>Автоматизация ' + m.automationLevel + '%</span></div>' +
      '<div class="profile-potential">Потенциал: +' + potential + '% к доходу</div>' +
    '</div>' +
    '<div class="profile-points">' +
      '<h4>Что это означает для вашего роста:</h4>' +
      '<ul>' + pts.map(function(p) { return '<li>' + p + '</li>'; }).join('') + '</ul>' +
    '</div>';
}

function renderLostPotential(a, m) {
  var el = document.getElementById('lost-potential');
  if (m.hourlyRate >= 1200) {
    el.innerHTML = '<div class="report-insight">Ваша ставка ' + formatMoney(m.hourlyRate) + ' ₽/ч уже на уровне или выше рыночного CFO-бенчмарка. Отличный результат!</div>';
    return;
  }

  var monthly = m.lostPotential;
  var yearly = monthly * 12;

  el.innerHTML =
    '<div class="lost-counter">' +
      '<div class="lost-label">Недополученная прибыль за 12 месяцев</div>' +
      '<div class="lost-value" id="lost-counter-value">0 ₽</div>' +
      '<div class="lost-sub">при вашей ставке vs. рыночной CFO-ставки 1 200 ₽/ч</div>' +
    '</div>' +
    '<div class="lost-details">' +
      '<div class="row"><span>Ваша ставка</span><span>' + formatMoney(m.hourlyRate) + ' ₽/ч</span></div>' +
      '<div class="row"><span>Рыночный уровень</span><span>1 200 ₽/ч</span></div>' +
      '<div class="row"><span>Разница</span><span>' + formatMoney(1200 - m.hourlyRate) + ' ₽/ч</span></div>' +
      '<div class="row"><span>Часов в месяц</span><span>' + m.totalHours + '</span></div>' +
      '<div class="row"><span>Ежемесячно</span><span>' + formatMoney(monthly) + ' ₽</span></div>' +
      '<div class="row highlight"><span>За 12 месяцев</span><span>' + formatMoney(yearly) + ' ₽</span></div>' +
    '</div>';

  // Animate counter
  animateCounter('lost-counter-value', yearly, ' ₽');
}

function animateCounter(elId, target, suffix) {
  var el = document.getElementById(elId);
  if (!el) return;
  var start = 0;
  var duration = 1500;
  var startTime = null;

  function step(timestamp) {
    if (!startTime) startTime = timestamp;
    var progress = Math.min((timestamp - startTime) / duration, 1);
    var eased = 1 - Math.pow(1 - progress, 3);
    var current = Math.round(start + (target - start) * eased);
    el.textContent = formatMoney(current) + suffix;
    if (progress < 1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}

function renderScenarios(a, m) {
  var el = document.getElementById('scenarios');
  var checkMid = m.checkMid;

  el.innerHTML =
    // Scenario A
    '<div class="scenario-card">' +
      '<h3>Сценарий A — Оптимизация</h3>' +
      '<div class="scenario-time">2–3 месяца · средний риск</div>' +
      '<div class="scenario-actions">• Переупаковать оффер под измеримый результат<br>• Поднять чек у 1–2 клиентов на 25%<br>• Сократить рутину на 30% через инструменты</div>' +
      '<div class="scenario-forecast"><strong>Прогноз:</strong> ' + formatMoney(m.scenarioA) + ' ₽/мес<br>Дополнительно в год: +' + formatMoney(Math.round(m.currentIncome * 0.25 * 12)) + ' ₽</div>' +
    '</div>' +

    // Scenario B — recommended
    '<div class="scenario-card recommended">' +
      '<div class="scenario-badge">Рекомендован</div>' +
      '<h3>Сценарий B — Партнёрский канал</h3>' +
      '<div class="scenario-time">3–5 месяцев · низкий риск</div>' +
      '<div class="scenario-actions">• Подключить партнёрскую программу FinTablo<br>• Получить 2–3 готовых клиента через поток лидов<br>• Автоматизировать операционку для масштаба</div>' +
      '<div class="scenario-forecast"><strong>Прогноз:</strong><br>Регулярный доход: ' + formatMoney(m.targetIncome) + ' ₽/мес<br>Партнёрская комиссия: ' + formatMoney(m.scenarioB_bonus) + ' ₽ разово<br>Итого за 6 мес: ' + formatMoney(m.targetIncome * 3 + m.scenarioB_bonus) + ' ₽</div>' +
      '<div class="scenario-why">Не нужно искать клиентов самому. FinTablo генерирует входящий поток, вы ведёте клиентов и получаете 50% с первого чека каждого.</div>' +
    '</div>' +

    // Scenario C
    '<div class="scenario-card">' +
      '<h3>Сценарий C — CFO-трансформация</h3>' +
      '<div class="scenario-time">6–12 месяцев · высокий риск</div>' +
      '<div class="scenario-actions">• Перейти на чек 120к+ через репозиционирование<br>• Делегировать операционный учёт помощнику<br>• Строить личный бренд через кейсы</div>' +
      '<div class="scenario-forecast"><strong>Прогноз:</strong> ' + formatMoney(Math.max(m.targetIncome, 450000)) + ' ₽/мес<br>Срок: 8–12 месяцев</div>' +
    '</div>';
}

function renderRoadmap(a, m) {
  var el = document.getElementById('roadmap');
  var minRate = Math.round(m.hourlyRate * 0.7);

  el.innerHTML =
    '<div class="roadmap-month">' +
      '<h3>Месяц 1 — Фундамент</h3>' +
      '<div class="roadmap-week"><h4>Неделя 1–2: Аудит экономики клиентов</h4>' +
        '<p>Создайте таблицу: клиент × чек × часы/мес × ставка × сложность. Вычеркните клиентов со ставкой ниже ' + formatMoney(minRate) + ' ₽/ч — они тянут вниз среднее. Цель: увидеть, кто реально "делает" ваш доход.</p></div>' +
      '<div class="roadmap-week"><h4>Неделя 2–3: Переупаковка оффера</h4>' +
        '<p>Текущий: «веду управленческий учёт». Новый: «помогаю [тип компании] понять, где бизнес теряет деньги, и сократить потери на X% за N недель». Конкретизируйте под ваш опыт.</p></div>' +
      '<div class="roadmap-week"><h4>Неделя 3–4: Первая автоматизация</h4>' +
        '<p>Выберите ОДИН самый рутинный процесс у 2 клиентов. Настройте: шаблон сбора данных, автоимпорт или визуализацию вместо ручных таблиц. Цель: −2–3 ч/мес с клиента.</p></div>' +
    '</div>' +

    '<div class="roadmap-month">' +
      '<h3>Месяц 2 — Первые изменения</h3>' +
      '<div class="roadmap-week"><h4>Активация нового источника клиентов</h4>' +
        '<p>' + (a.barriers && a.barriers.includes('Нет стабильного потока новых клиентов') ? 'Ваш главный барьер — нет потока. Партнёрский канал — самый быстрый старт: заявки уже есть, нужно только подключиться.' : 'Выберите ОДИН канал из тех, которые вы не используете. Партнёрский канал даёт самый предсказуемый результат.') + '</p></div>' +
      '<div class="roadmap-week"><h4>Первый разговор о повышении чека</h4>' +
        '<p>Выберите 1 клиента с самой высокой лояльностью. Сценарий: «В последние месяцы я добавил [X]. Планирую расширить работу. Это потребует пересмотра формата с ' + formatMoney(m.checkMid) + ' до ' + formatMoney(Math.round(m.checkMid * 1.25)) + ' ₽». Статистика: 70–80% соглашаются.</p></div>' +
    '</div>' +

    '<div class="roadmap-month">' +
      '<h3>Месяц 3 — Масштаб</h3>' +
      '<div class="roadmap-week"><h4>Выход на целевой доход</h4>' +
        '<p>Цель: ' + formatMoney(m.targetIncome) + ' ₽/мес через ' + m.newClientsNeeded + ' новых клиентов × ' + formatMoney(Math.round(m.checkMid * 1.15)) + ' ₽. Инструмент: партнёрский канал с готовым потоком. Страховка: 2–3 разных источника клиентов активны одновременно.</p></div>' +
    '</div>';
}

function renderFinTablo(a, m) {
  var el = document.getElementById('fintablo');
  var freedClients = m.hoursPerClient > 0 ? Math.floor(m.routineFreedHours / m.hoursPerClient) : 0;
  var commissionQuarter = Math.round(2 * m.checkMid * 0.5);
  var newIncome = m.currentIncome + 2 * m.checkMid;
  var growthPct = m.currentIncome > 0 ? Math.round(2 * m.checkMid / m.currentIncome * 100) : 100;

  el.innerHTML =
    '<div class="benefit-card"><div class="benefit-icon">📉</div><h4>Рутина</h4>' +
      '<p>Сейчас: ' + a.manualWorkPct + '% → После: ~20%<br>Высвобождается: ' + m.routineFreedHours + ' ч/мес<br>Это время на ' + freedClients + ' дополнительных клиентов</p></div>' +
    '<div class="benefit-card"><div class="benefit-icon">💰</div><h4>Партнёрская комиссия</h4>' +
      '<p>50% от первого чека каждого клиента<br>При 2 новых в квартал: ' + formatMoney(commissionQuarter) + ' ₽ разово</p></div>' +
    '<div class="benefit-card"><div class="benefit-icon">📥</div><h4>Поток лидов</h4>' +
      '<p>Входящие заявки от бизнеса, ищущего внешнего CFO. Не нужно продавать — нужно выбрать, с кем работать.</p></div>' +
    '<div class="benefit-card"><div class="benefit-icon">🤝</div><h4>Экспертное сообщество</h4>' +
      '<p>Закрытый Telegram с финдиректорами-партнёрами. Разбор кейсов, менторство, нетворкинг.</p></div>' +
    '<div class="benefit-card"><div class="benefit-icon">📋</div><h4>Готовый инструментарий</h4>' +
      '<p>Шаблоны КП, типовой договор, SLA, примеры кейсов «до/после» — всё готово.</p></div>' +

    '<div class="fintablo-calc">' +
      '<h4>Расчёт для ' + a.name + '</h4>' +
      '<p style="font-size:13px;color:var(--text-secondary);margin-bottom:12px">Если за 3 месяца вы привлечёте 2 клиента через FinTablo:</p>' +
      '<div class="calc-row"><span>Комиссия (единовременно)</span><span>' + formatMoney(commissionQuarter) + ' ₽</span></div>' +
      '<div class="calc-row"><span>+Доход от ведения</span><span>+' + formatMoney(2 * m.checkMid) + ' ₽/мес</span></div>' +
      '<div class="calc-row total"><span>Итог через 3 мес</span><span>' + formatMoney(newIncome) + ' ₽/мес</span></div>' +
      '<div class="calc-growth">Это на ' + growthPct + '% выше текущего дохода</div>' +
    '</div>';
}

function renderCTA(a, m) {
  var el = document.getElementById('report-cta');
  el.innerHTML =
    '<div class="report-cta">' +
      '<h3>Следующий шаг: разбор с экспертом FinTablo</h3>' +
      '<p>Эксперт изучит ваш отчёт до звонка и предложит конкретный план, а не стандартную презентацию. 20–30 минут. Бесплатно.</p>' +
      '<button class="btn-primary" onclick="window.location.href=\'thankyou.html\'">Получить звонок от эксперта</button>' +
      '<p class="small">Или позвоните сами: <a href="tel:+74951234567">+7 (495) 123-45-67</a></p>' +
    '</div>';
}

function renderShareCard(a, m) {
  var potential = m.currentIncome > 0 ? Math.round(m.incomeGap / m.currentIncome * 100) : 100;
  var el = document.getElementById('share-section');
  el.innerHTML =
    '<button class="btn-share" onclick="shareResult()">Поделиться результатом</button>';

  window.shareResult = function() {
    var text = 'Прошёл диагностику практики финансиста на FinTablo.\n' +
      'Мой тип: ' + m.practiceType + '\n' +
      'Потенциал роста: +' + potential + '%';

    if (navigator.share) {
      navigator.share({ text: text });
    } else if (navigator.clipboard) {
      navigator.clipboard.writeText(text).then(function() {
        alert('Текст скопирован!');
      });
    }
  };
}

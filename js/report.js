/* ===== Report v2 — hybrid preview/full mode ===== */

document.addEventListener('DOMContentLoaded', function() {
  // Logo fallback
  var logoImg = document.querySelector('.logo img');
  if (logoImg) {
    logoImg.onerror = function() {
      this.style.display = 'none';
      var fb = this.parentElement.querySelector('.logo-fallback');
      if (fb) fb.style.display = 'block';
    };
  }

  var answers = getAllAnswers();
  if (!answers.name) { window.location.href = 'index.html'; return; }

  var m = calculate(answers);
  var isPreview = !!answers.skippedContact;

  // Header
  document.getElementById('report-name').textContent = answers.name;
  document.getElementById('report-date').textContent = new Date().toLocaleDateString('ru-RU');

  // Render all sections
  renderDashboard(answers, m);
  renderMetrics(answers, m);
  renderProfile(answers, m);
  renderLostPotential(answers, m);

  if (isPreview) {
    // Preview mode: hide full report, show locked CTA and banner
    document.getElementById('full-report').classList.add('hidden');
    document.getElementById('locked-section').classList.remove('hidden');
    document.getElementById('persistent-banner').classList.add('visible');
    // Hide some nav items
    document.querySelectorAll('#report-nav a').forEach(function(a) {
      if (['#sec-scenarios', '#sec-roadmap', '#sec-fintablo'].indexOf(a.getAttribute('href')) >= 0) {
        a.style.display = 'none';
      }
    });
    if (typeof ym === 'function') ym(61131877, 'reachGoal', 'report_preview_viewed');
  } else {
    renderScenarios(answers, m);
    renderRoadmap(answers, m);
    renderFinTablo(answers, m);
    renderCTA(answers, m);
    renderShareCard(answers, m);
    if (typeof ym === 'function') ym(61131877, 'reachGoal', 'report_full_viewed');
  }

  // Animate gauges
  setTimeout(function() {
    document.querySelectorAll('.gauge-fill').forEach(function(el) {
      el.style.width = el.dataset.target + '%';
    });
  }, 400);

  // Active nav on scroll
  initNavScroll();
});

/* ===== Navigation scroll highlight ===== */
function initNavScroll() {
  var sections = document.querySelectorAll('.report-section');
  var navLinks = document.querySelectorAll('#report-nav a');

  window.addEventListener('scroll', function() {
    var scrollPos = window.scrollY + 130;
    sections.forEach(function(sec) {
      if (sec.offsetTop <= scrollPos && (sec.offsetTop + sec.offsetHeight) > scrollPos) {
        navLinks.forEach(function(a) { a.classList.remove('active'); });
        var active = document.querySelector('#report-nav a[href="#' + sec.id + '"]');
        if (active) active.classList.add('active');
      }
    });
  });
}

/* ===== DASHBOARD ===== */
function renderDashboard(a, m) {
  var el = document.getElementById('dashboard');

  var clientsColor = m.clients < 3 ? 'red' : m.clients <= 5 ? 'yellow' : 'green';
  var incomeColor = m.currentIncome < 100000 ? 'red' : m.currentIncome <= 250000 ? 'yellow' : 'green';
  var rateColor = m.hourlyRate < 500 ? 'red' : m.hourlyRate < 1500 ? 'yellow' : 'green';
  var routineColor = m.routineHours < 20 ? 'green' : m.routineHours <= 40 ? 'yellow' : 'red';

  el.innerHTML =
    '<div class="dashboard-grid">' +
      '<div class="dash-card ' + clientsColor + '"><div class="dash-label">Клиентов</div><div class="dash-value">' + m.clients + '</div><div class="dash-bench">' + (m.clients < 3 ? 'Зона уязвимости' : m.clients <= 5 ? 'Растущая база' : 'Устойчивый портфель') + '</div></div>' +
      '<div class="dash-card ' + incomeColor + '"><div class="dash-label">Расч. доход</div><div class="dash-value">' + formatMoneyShort(m.currentIncome) + '</div><div class="dash-bench">₽/мес</div></div>' +
      '<div class="dash-card ' + rateColor + '"><div class="dash-label">Ставка</div><div class="dash-value">' + formatMoney(m.hourlyRate) + '</div><div class="dash-bench">₽/ч · медиана рынка ' + formatMoney(m.benchmarkRate) + '</div></div>' +
      '<div class="dash-card ' + routineColor + '"><div class="dash-label">Часов рутины</div><div class="dash-value">' + m.routineHours + '</div><div class="dash-bench">ч/мес из ' + m.totalHours + ' общих</div></div>' +
    '</div>';

  el.innerHTML += '<div class="report-insight"><strong>' + a.name + '</strong>, вот главное, что показала ваша диагностика:<br><br>' + getMainInsight(a, m) + '</div>';
}

function getMainInsight(a, m) {
  if (m.hourlyRate < 500 && m.clients > 5) return 'Тревожная ситуация: вы работаете много, но ваша ставка — ' + formatMoney(m.hourlyRate) + ' ₽/ч — значительно ниже рыночного уровня для финансового директора. При ' + m.clients + ' клиентах вы рискуете выгореть, не увеличив доход. Приоритет №1 — не новые клиенты, а радикальное повышение ставки через переупаковку вашего предложения и внедрение автоматизации.';
  if (m.currentIncome < 100000) return 'Ваша практика пока в стартовой фазе. При ' + m.clients + ' клиентах и доходе ' + formatMoneyShort(m.currentIncome) + '/мес главный приоритет — выстроить стабильный поток и поднять средний чек. Финансисты с вашим опытом, изменившие подход, выходят на 200 тыс.+ за 3–4 месяца. Ниже — конкретный план, как этого достичь.';
  if (m.automationLevel < 40 && m.clients >= 4) return 'Вы зарабатываете ' + formatMoneyShort(m.currentIncome) + '/мес, но ' + a.manualWorkPct + '% вашего времени уходит на рутину — это ' + m.routineHours + ' часов в месяц. Автоматизация высвободит время на ' + Math.floor(m.routineFreedHours / m.hoursPerClient) + ' дополнительных клиентов без увеличения нагрузки. Это ваш главный рычаг роста прямо сейчас.';
  if (m.incomeGap < 100000 && m.currentIncome >= 200000) return 'Вы в шаге от цели. Разрыв всего ' + formatMoneyShort(m.incomeGap) + '/мес — это 1–2 новых клиента или повышение чека на 20% у текущих. При ставке ' + formatMoney(m.hourlyRate) + ' ₽/ч у вас сильная позиция для переговоров. Ваш план ниже показывает, как закрыть этот разрыв за 2–3 месяца.';
  return 'Ваша практика генерирует ' + formatMoneyShort(m.currentIncome) + '/мес при ставке ' + formatMoney(m.hourlyRate) + ' ₽/ч. До цели — ' + formatMoneyShort(m.incomeGap) + '. Диагностика выявила конкретные точки роста: оптимизация ставки, снижение рутины и расширение каналов привлечения клиентов. Подробный план — в каждом разделе ниже.';
}

/* ===== 5 METRICS ===== */
function renderMetrics(a, m) {
  var el = document.getElementById('metrics');
  var gauges = [
    { title: 'Эффективность ставки', value: m.rateEfficiency, bench: 'Рыночный уровень: ' + formatMoney(m.benchmarkRate) + ' ₽/ч (медиана для финдиректоров на аутсорсе)', rec: getMetricRec('rate', m) },
    { title: 'Устойчивость портфеля', value: m.portfolioStability, bench: 'Устойчивый портфель — 5+ клиентов с разными сроками договоров', rec: getMetricRec('portfolio', m) },
    { title: 'Степень автоматизации', value: m.automationLevel, bench: 'Лучшие 20% финансистов: менее 25% времени на рутину', rec: getMetricRec('automation', m) },
    { title: 'Масштабируемость модели', value: m.scalabilityIndex, bench: 'Масштабируемая модель — ставка от 1 500 ₽/ч + автоматизация от 70%', rec: getMetricRec('scale', m) },
    { title: 'Предсказуемость потока', value: m.sourceStability, bench: 'Предсказуемый поток — 2+ независимых канала привлечения', rec: getMetricRec('source', m) }
  ];

  var html = '';
  gauges.forEach(function(g) {
    var color = g.value >= 70 ? 'green' : g.value >= 40 ? 'yellow' : 'red';
    var badge = g.value >= 70 ? '<span class="bench-badge green">Хороший уровень</span>' :
                g.value >= 40 ? '<span class="bench-badge yellow">Есть потенциал роста</span>' :
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
      if (m.rateEfficiency < 40) return 'Переупакуйте предложение: вместо «веду учёт» — «нахожу, где бизнес теряет деньги, и помогаю это исправить». Такой подход позволяет поднять ставку на 50–100% без потери клиентов. Конкретный сценарий — в карте пути ниже.';
      if (m.rateEfficiency < 70) return 'Ваша ставка близка к рыночному уровню. Для выхода в верхний сегмент добавьте проектную составляющую: аудиты, оптимизация процессов, внедрение систем учёта.';
      return 'Отличная ставка — вы в верхнем сегменте рынка. Фокусируйтесь на удержании и масштабировании через автоматизацию.';
    case 'portfolio':
      if (m.portfolioStability < 50) return 'Критически важно: добавьте 2–3 клиента для устойчивости. Сейчас потеря одного клиента — это удар по доходу в ' + Math.round(100 / Math.max(1, m.clients)) + '%. Партнёрский канал — самый быстрый способ расширить базу.';
      if (m.portfolioStability < 80) return 'Хорошая база. Для полной устойчивости диверсифицируйте клиентов по размеру бизнеса и отрасли — это защитит от сезонности.';
      return 'Устойчивый портфель. Фокус — на качество: оставляйте самых прибыльных клиентов, повышайте средний чек.';
    case 'automation':
      if (m.automationLevel < 40) return 'Автоматизация рутины высвободит ~' + m.routineFreedHours + ' часов/мес. Начните с одного процесса: автоматический сбор данных или шаблонизация отчётов. FinTablo сокращает рутину в среднем на 60% у партнёров.';
      if (m.automationLevel < 70) return 'Умеренная автоматизация. Следующий шаг — шаблонизация типовых операций и автоматический импорт данных из источников клиента.';
      return 'Высокая степень автоматизации — вы в числе лучших 20%. Поддерживайте и оптимизируйте процессы.';
    case 'scale':
      if (m.scalabilityIndex < 40) return 'При текущей ставке рост возможен только через увеличение рабочих часов — а это прямой путь к выгоранию. Приоритет — повышение стоимости часа через переупаковку и автоматизацию.';
      if (m.scalabilityIndex < 70) return 'Модель масштабируется, но с ограничениями. Для следующего уровня нужна комбинация: автоматизация + повышение среднего чека.';
      return 'Высокая масштабируемость — вы можете расти без пропорционального увеличения нагрузки. Рассмотрите делегирование операционных задач.';
    case 'source':
      if (m.sourceStability < 40) return 'Зависимость от одного канала — главный риск для стабильности дохода. Партнёрский канал даёт предсказуемый поток заявок без вашего активного участия в продажах.';
      if (m.sourceStability < 70) return 'Два канала — хороший старт. Добавьте партнёрский канал для стабильности: он генерирует входящие заявки, а вы выбираете, с кем работать.';
      return 'Диверсифицированный поток. Оптимизируйте: определите, какой канал даёт лучшее соотношение качества клиентов и затрат вашего времени.';
  }
}

/* ===== PROFILE ===== */
function renderProfile(a, m) {
  var el = document.getElementById('profile');
  var icons = { 'Стартовый консультант': '🚀', 'Перегруженный эксперт': '⚡', 'Застрявшее плато': '📊', 'В шаге от цели': '🎯', 'Системный CFO-партнёр': '👑' };

  var descs = {
    'Стартовый консультант': 'Ваша практика в начальной фазе. Навыки есть, но модель монетизации ещё не выстроена. Ключевая задача — быстро набрать первых 3–5 клиентов через проверенные каналы и сформировать предложение с измеримой ценностью для бизнеса. Это достижимо за 2–3 месяца при правильном подходе.',
    'Перегруженный эксперт': 'Вы работаете много, но основная часть времени — ' + a.manualWorkPct + '% — уходит на операционную рутину. При ' + m.clients + ' клиентах вы не можете расти без изменения инструментов. Автоматизация для вас — не «было бы неплохо», а необходимость, без которой выгорание неизбежно.',
    'Застрявшее плато': 'Клиенты есть, доход стабилен, но рост заблокирован. Самая коварная фаза: кажется, что «всё нормально», но вы теряете ' + formatMoney(m.lostPotential) + ' ₽/мес на неоптимальной ставке. Нужны системные изменения — повышение чека, автоматизация, новый канал привлечения.',
    'В шаге от цели': 'Вы близки к целевому доходу ' + formatMoneyShort(m.targetIncome) + '/мес. Разрыв ' + formatMoneyShort(m.incomeGap) + ' — это точечные улучшения: повышение чека, один новый клиент, оптимизация процессов. Не нужна трансформация — нужна точная настройка.',
    'Системный CFO-партнёр': 'Вы построили масштабируемую практику: высокая ставка, несколько каналов привлечения, автоматизация. Следующий шаг — делегирование операционных задач и упаковка методологии. Или масштабирование через партнёрскую сеть.'
  };

  var points = {
    'Стартовый консультант': ['Подключить партнёрский канал для быстрого набора клиентов', 'Переупаковать предложение под конкретный измеримый результат', 'Набрать 3–5 клиентов за 2–3 месяца и выйти на стабильный доход'],
    'Перегруженный эксперт': ['Автоматизировать ~' + m.routineFreedHours + ' часов рутины в месяц', 'Повысить чек на 25% у наиболее лояльных клиентов', 'Отказаться от клиентов с самой низкой отдачей на ваше время'],
    'Застрявшее плато': ['Переупаковать предложение из «веду учёт» в «результат для бизнеса»', 'Добавить второй независимый источник клиентов', 'Поднять средний чек через расширение объёма работ'],
    'В шаге от цели': ['Повысить чек у 1–2 текущих клиентов на 20–25%', 'Добавить одного клиента через партнёрский канал', 'Оптимизировать самый трудоёмкий рутинный процесс'],
    'Системный CFO-партнёр': ['Делегировать операционный учёт помощнику или через инструменты', 'Масштабировать практику через партнёрскую программу', 'Упаковать методологию для тиражирования']
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
      '<div class="profile-potential">Потенциал роста: +' + potential + '%</div>' +
    '</div>' +
    '<div class="profile-points">' +
      '<h4>Ваши ключевые шаги:</h4>' +
      '<ul>' + pts.map(function(p) { return '<li>' + p + '</li>'; }).join('') + '</ul>' +
    '</div>';
}

/* ===== LOST POTENTIAL ===== */
function renderLostPotential(a, m) {
  var el = document.getElementById('lost-potential');
  if (m.hourlyRate >= m.benchmarkRate) {
    el.innerHTML = '<div class="report-insight">Ваша ставка ' + formatMoney(m.hourlyRate) + ' ₽/ч уже на уровне или выше рыночного уровня для финансовых директоров на аутсорсе (' + formatMoney(m.benchmarkRate) + ' ₽/ч). Отличный результат — фокусируйтесь на масштабировании.</div>';
    return;
  }

  var monthly = m.lostPotential;
  var yearly = monthly * 12;

  el.innerHTML =
    '<div class="lost-counter">' +
      '<div class="lost-label">Разница в доходе за 12 месяцев при вашей ставке vs. рыночного уровня</div>' +
      '<div class="lost-value" id="lost-counter-value">0 ₽</div>' +
      '<div class="lost-sub">Это не «потерянные деньги» — это ваш потенциал роста при правильном позиционировании</div>' +
    '</div>' +
    '<div class="lost-details">' +
      '<div class="row"><span>Ваша ставка</span><span>' + formatMoney(m.hourlyRate) + ' ₽/ч</span></div>' +
      '<div class="row"><span>Рыночный уровень (медиана)</span><span>' + formatMoney(m.benchmarkRate) + ' ₽/ч</span></div>' +
      '<div class="row"><span>Разница</span><span>' + formatMoney(m.benchmarkRate - m.hourlyRate) + ' ₽/ч</span></div>' +
      '<div class="row"><span>Ваших часов в месяц</span><span>' + m.totalHours + '</span></div>' +
      '<div class="row"><span>Потенциал роста в месяц</span><span>+' + formatMoney(monthly) + ' ₽</span></div>' +
      '<div class="row highlight"><span>Потенциал за 12 месяцев</span><span>+' + formatMoney(yearly) + ' ₽</span></div>' +
    '</div>';

  animateCounter('lost-counter-value', yearly, ' ₽');
}

function animateCounter(elId, target, suffix) {
  var el = document.getElementById(elId);
  if (!el) return;
  var duration = 1500;
  var startTime = null;
  function step(ts) {
    if (!startTime) startTime = ts;
    var progress = Math.min((ts - startTime) / duration, 1);
    var eased = 1 - Math.pow(1 - progress, 3);
    el.textContent = formatMoney(Math.round(target * eased)) + suffix;
    if (progress < 1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}

/* ===== 3 SCENARIOS ===== */
function renderScenarios(a, m) {
  var el = document.getElementById('scenarios');

  el.innerHTML =
    '<div class="scenario-card">' +
      '<h3>Сценарий А — Оптимизация текущей модели</h3>' +
      '<div class="scenario-time">2–3 месяца · умеренные усилия</div>' +
      '<div class="scenario-actions">• Переупаковать предложение: от «веду учёт» к «нахожу потери и увеличиваю прибыль»<br>• Повысить чек у 1–2 лояльных клиентов на 25%<br>• Сократить рутину на 30% через шаблонизацию и автоматизацию</div>' +
      '<div class="scenario-forecast"><strong>Прогноз дохода:</strong> ' + formatMoney(m.scenarioA) + ' ₽/мес<br>Дополнительно за год: +' + formatMoney(Math.round(m.currentIncome * 0.25 * 12)) + ' ₽</div>' +
    '</div>' +

    '<div class="scenario-card recommended">' +
      '<div class="scenario-badge">Рекомендован</div>' +
      '<h3>Сценарий Б — Рост через партнёрский канал</h3>' +
      '<div class="scenario-time">3–5 месяцев · минимальные риски</div>' +
      '<div class="scenario-actions">• Подключиться к партнёрской программе FinTablo<br>• Получить 2–3 клиентов через входящий поток заявок<br>• Автоматизировать операционные процессы для масштабирования</div>' +
      '<div class="scenario-forecast"><strong>Прогноз:</strong><br>Регулярный доход: ' + formatMoney(m.targetIncome) + ' ₽/мес<br>Партнёрская комиссия: ' + formatMoney(m.scenarioB_bonus) + ' ₽ (единовременно за каждого клиента)<br>Итого за 6 мес: ' + formatMoney(m.targetIncome * 3 + m.scenarioB_bonus) + ' ₽</div>' +
      '<div class="scenario-why">Не нужно искать клиентов самому — FinTablo генерирует входящий поток заявок от бизнеса. Вы выбираете, с кем работать, и получаете 50% от первого чека каждого клиента.</div>' +
    '</div>' +

    '<div class="scenario-card">' +
      '<h3>Сценарий В — Полная трансформация практики</h3>' +
      '<div class="scenario-time">6–12 месяцев · системные изменения</div>' +
      '<div class="scenario-actions">• Перейти на чек от 120 тыс. через репозиционирование<br>• Делегировать операционный учёт помощнику<br>• Развивать личный бренд через экспертный контент и кейсы</div>' +
      '<div class="scenario-forecast"><strong>Прогноз:</strong> ' + formatMoney(Math.max(m.targetIncome, 450000)) + ' ₽/мес<br>Срок выхода: 8–12 месяцев</div>' +
    '</div>';
}

/* ===== 90-DAY ROADMAP ===== */
function renderRoadmap(a, m) {
  var el = document.getElementById('roadmap');
  var minRate = Math.round(m.hourlyRate * 0.7);
  var barrierIsFlow = a.barriers && a.barriers.some(function(b) { return b.indexOf('поток') >= 0; });

  el.innerHTML =
    '<div class="roadmap-month">' +
      '<h3>Месяц 1 — Фундамент</h3>' +
      '<div class="roadmap-week"><h4>Неделя 1–2: Аудит экономики клиентов</h4>' +
        '<p>Создайте таблицу: клиент × чек × часы/мес × ставка × сложность. Определите клиентов со ставкой ниже ' + formatMoney(minRate) + ' ₽/ч — они тянут ваше среднее вниз. Цель: увидеть, кто реально «делает» ваш доход, а кто создаёт нагрузку без отдачи.</p></div>' +
      '<div class="roadmap-week"><h4>Неделя 2–3: Переупаковка предложения</h4>' +
        '<p>Текущий формат: «веду управленческий учёт». Новый: «помогаю [тип компании] понять, где бизнес теряет деньги, и сократить потери на конкретную сумму за определённый срок». Конкретизируйте под ваш опыт — какие типы бизнеса, какие типичные потери вы находили.</p></div>' +
      '<div class="roadmap-week"><h4>Неделя 3–4: Первая автоматизация</h4>' +
        '<p>Выберите один самый рутинный процесс у 2 клиентов. Настройте шаблон сбора данных, автоматический импорт или визуализацию вместо ручных таблиц. Цель: сократить рутину на 2–3 часа в месяц на каждого клиента.</p></div>' +
    '</div>' +

    '<div class="roadmap-month">' +
      '<h3>Месяц 2 — Первые результаты</h3>' +
      '<div class="roadmap-week"><h4>Новый источник клиентов</h4>' +
        '<p>' + (barrierIsFlow ? 'Ваш главный барьер — отсутствие потока. Партнёрский канал — самый быстрый старт: заявки уже есть, вам нужно только подключиться и выбрать подходящих клиентов.' : 'Добавьте один канал из тех, которые вы пока не используете. Партнёрский канал даёт самый предсказуемый результат с минимальными затратами вашего времени.') + '</p></div>' +
      '<div class="roadmap-week"><h4>Первое повышение чека</h4>' +
        '<p>Выберите одного клиента с самой высокой лояльностью. Сценарий разговора: «За последние месяцы я расширил работу, добавил [конкретные улучшения]. Планирую развивать это направление, что потребует пересмотра условий с ' + formatMoney(m.checkMid) + ' до ' + formatMoney(Math.round(m.checkMid * 1.25)) + ' ₽». По статистике, 70–80% лояльных клиентов принимают такое повышение.</p></div>' +
    '</div>' +

    '<div class="roadmap-month">' +
      '<h3>Месяц 3 — Масштабирование</h3>' +
      '<div class="roadmap-week"><h4>Выход на целевой доход</h4>' +
        '<p>Цель: ' + formatMoney(m.targetIncome) + ' ₽/мес. Для этого нужно ' + m.newClientsNeeded + ' новых клиентов × ' + formatMoney(Math.round(m.checkMid * 1.15)) + ' ₽ или повышение чека у текущих. Используйте партнёрский канал с готовым потоком для предсказуемого результата. Активируйте 2–3 источника клиентов одновременно.</p></div>' +
    '</div>';
}

/* ===== FINTABLO BENEFITS ===== */
function renderFinTablo(a, m) {
  var el = document.getElementById('fintablo');
  var freedClients = m.hoursPerClient > 0 ? Math.floor(m.routineFreedHours / m.hoursPerClient) : 0;
  var commissionQuarter = Math.round(2 * m.checkMid * 0.5);
  var newIncome = m.currentIncome + 2 * m.checkMid;
  var growthPct = m.currentIncome > 0 ? Math.round(2 * m.checkMid / m.currentIncome * 100) : 100;

  el.innerHTML =
    '<p style="font-size:15px;color:var(--text-secondary);margin-bottom:20px;line-height:1.6">Вот что конкретно меняется в вашей ситуации при подключении к партнёрской программе FinTablo, ' + a.name + ':</p>' +

    '<div class="benefit-card"><div class="benefit-icon">📉</div><h4>Снижение рутины</h4>' +
      '<p>Сейчас: ' + a.manualWorkPct + '% времени на рутину → С FinTablo: ~20%<br>Высвобождается: ' + m.routineFreedHours + ' часов в месяц<br>Это время на ' + freedClients + ' дополнительных клиентов или на повышение качества работы с текущими</p></div>' +

    '<div class="benefit-card"><div class="benefit-icon">💰</div><h4>Партнёрская комиссия</h4>' +
      '<p>50% от первого чека каждого привлечённого клиента<br>При 2 новых клиентах в квартал: ' + formatMoney(commissionQuarter) + ' ₽ единовременно<br>Макс. выплата с одного клиента: до 170 000 ₽</p></div>' +

    '<div class="benefit-card"><div class="benefit-icon">📥</div><h4>Входящий поток заявок</h4>' +
      '<p>Активные партнёры получают входящие заявки от бизнеса, который ищет внешнего финансового директора. Вам не нужно продавать — вы выбираете, с кем работать.</p></div>' +

    '<div class="benefit-card"><div class="benefit-icon">🤝</div><h4>Экспертное сообщество</h4>' +
      '<p>Закрытый чат с финансовыми директорами-партнёрами. Разбор сложных кейсов, менторство при первом внедрении, профессиональная поддержка. Решение проблемы изоляции, о которой говорят 67% фрилансеров.</p></div>' +

    '<div class="benefit-card"><div class="benefit-icon">📋</div><h4>Готовые инструменты</h4>' +
      '<p>Шаблоны коммерческого предложения, типовой договор с клиентом, SLA, примеры кейсов «до/после» без нарушения NDA — всё готово с первого дня.</p></div>' +

    '<div class="fintablo-calc">' +
      '<h4>Расчёт для ' + a.name + '</h4>' +
      '<p style="font-size:13px;color:var(--text-secondary);margin-bottom:12px">Прогноз: вы привлекаете 2 клиентов через FinTablo за 3 месяца</p>' +
      '<div class="calc-row"><span>Комиссия (единовременно)</span><span>' + formatMoney(commissionQuarter) + ' ₽</span></div>' +
      '<div class="calc-row"><span>Дополнительный регулярный доход</span><span>+' + formatMoney(2 * m.checkMid) + ' ₽/мес</span></div>' +
      '<div class="calc-row total"><span>Ваш доход через 3 мес</span><span>' + formatMoney(newIncome) + ' ₽/мес</span></div>' +
      '<div class="calc-growth">Это на ' + growthPct + '% выше текущего дохода</div>' +
    '</div>';
}

/* ===== CTA ===== */
function renderCTA(a, m) {
  var el = document.getElementById('report-cta');
  el.innerHTML =
    '<div class="report-cta">' +
      '<h3>Следующий шаг: персональный разбор с экспертом</h3>' +
      '<p>Эксперт FinTablo изучит ваш отчёт до разговора и подготовит индивидуальные рекомендации, которых нет в автоматическом отчёте. 20–30 минут. Бесплатно. Без обязательств.</p>' +
      '<button class="btn-primary" onclick="goToThankYou()">Записаться на разбор →</button>' +
    '</div>';

  window.goToThankYou = function() {
    if (typeof ym === 'function') ym(61131877, 'reachGoal', 'report_cta_clicked');
    window.location.href = 'thankyou.html';
  };
}

/* ===== SHARE ===== */
function renderShareCard(a, m) {
  var potential = m.currentIncome > 0 ? Math.round(m.incomeGap / m.currentIncome * 100) : 100;
  var el = document.getElementById('share-section');
  el.innerHTML = '<button class="btn-share" onclick="shareResult()">Поделиться результатом</button>';

  window.shareResult = function() {
    var text = 'Прошёл диагностику практики финансиста на FinTablo.\n' +
      'Мой профиль: ' + m.practiceType + '\nПотенциал роста: +' + potential + '%';
    if (navigator.share) {
      navigator.share({ text: text });
    } else if (navigator.clipboard) {
      navigator.clipboard.writeText(text).then(function() { alert('Текст скопирован!'); });
    }
  };
}

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
  renderHero(answers, m);
  renderDashboard(answers, m);
  renderFindings(answers, m);
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
    renderInlineCTA(answers, m);
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

/* ===== HERO ===== */
function renderHero(a, m) {
  var el = document.getElementById('report-hero');
  if (!el) return;

  var icons = { 'Стартовый консультант': '🚀', 'Перегруженный эксперт': '⚡', 'Застрявшее плато': '📊', 'В шаге от цели': '🎯', 'Системный CFO-партнёр': '👑' };
  var icon = icons[m.practiceType] || '📊';
  var potential = m.currentIncome > 0 ? Math.round(m.incomeGap / m.currentIncome * 100) : 0;

  el.innerHTML =
    '<div class="rh-type">' + icon + ' ' + m.practiceType + '</div>' +
    '<h1>Персональный план роста для ' + a.name + '</h1>' +
    '<div class="rh-subtitle">На основе ваших ответов мы рассчитали ключевые метрики, определили точки роста и составили пошаговый план</div>' +
    '<div class="rh-stats">' +
      '<div class="rh-stat"><div class="rh-stat-value">' + formatMoneyShort(m.currentIncome) + '</div><div class="rh-stat-label">Доход сейчас</div></div>' +
      '<div class="rh-stat"><div class="rh-stat-value" style="color:#10B981">' + formatMoneyShort(m.targetIncome) + '</div><div class="rh-stat-label">Цель</div></div>' +
      '<div class="rh-stat"><div class="rh-stat-value">' + formatMoney(m.hourlyRate) + '₽</div><div class="rh-stat-label">Ставка/час</div></div>' +
      (potential > 0 ? '<div class="rh-stat"><div class="rh-stat-value" style="color:#F59E0B">+' + potential + '%</div><div class="rh-stat-label">Потенциал</div></div>' : '') +
    '</div>';
}

/* ===== FINDINGS — personalized insights from quiz answers ===== */
function renderFindings(a, m) {
  var el = document.getElementById('findings');
  if (!el) return;

  var findings = [];

  // Rate finding
  if (m.hourlyRate < 500) {
    findings.push({ icon: '⚠️', title: 'Ваша ставка значительно ниже рынка', type: 'danger',
      body: 'При ' + formatMoney(m.hourlyRate) + ' ₽/ч вы работаете на уровне начинающего бухгалтера, а не финансового директора. Медиана для финдиректоров на аутсорсе в 2026 году — ' + formatMoney(m.benchmarkRate) + ' ₽/ч.',
      action: 'Решение: переупаковка предложения под измеримый результат для бизнеса позволяет поднять ставку в 2–3 раза' });
  } else if (m.hourlyRate < 1000) {
    findings.push({ icon: '📊', title: 'Есть потенциал роста ставки', type: 'warning',
      body: 'Ваша ставка ' + formatMoney(m.hourlyRate) + ' ₽/ч — это средний рынок. До уровня ' + formatMoney(m.benchmarkRate) + ' ₽/ч вам не хватает правильного позиционирования.',
      action: 'Решение: переход от формата «веду учёт» к формату «нахожу, где бизнес теряет деньги»' });
  } else {
    findings.push({ icon: '✅', title: 'Ваша ставка на хорошем уровне', type: 'success',
      body: formatMoney(m.hourlyRate) + ' ₽/ч — это уровень CFO-консалтинга. Фокусируйтесь на масштабировании через автоматизацию.',
      action: '' });
  }

  // Routine finding
  if (m.automationLevel < 40) {
    findings.push({ icon: '🔄', title: 'Критический уровень рутины: ' + a.manualWorkPct + '%', type: 'danger',
      body: 'Вы тратите ' + m.routineHours + ' часов в месяц на операционные задачи. Это ' + m.routineFreedHours + ' часов, которые можно высвободить для роста.',
      action: 'Решение: автоматизация через инструменты Финтабло сокращает рутину до 20%' });
  } else if (m.automationLevel < 70) {
    findings.push({ icon: '🔄', title: 'Рутина занимает ' + a.manualWorkPct + '% времени', type: 'warning',
      body: 'Каждые 10% снижения рутины высвобождают ~' + Math.round(m.totalHours * 0.1) + ' часов в месяц. Это время на нового клиента или повышение качества работы.',
      action: 'Решение: шаблонизация отчётов и автоматический сбор данных — первые шаги' });
  }

  // Client source finding
  if (m.sourceCount <= 1) {
    findings.push({ icon: '📥', title: 'Зависимость от одного источника клиентов', type: 'danger',
      body: 'Один канал — одна точка отказа. Если он ослабнет, вы останетесь без новых клиентов. Финансисты с высоким доходом используют 2–3 независимых канала.',
      action: 'Решение: партнёрский канал Финтабло даёт входящий поток без затрат вашего времени на продажи' });
  }

  // Barrier-specific finding
  if (a.barriers && a.barriers.length > 0) {
    var barrier = a.barriers[0];
    var barrierFindings = {
      'Нет стабильного потока новых клиентов': { icon: '📥', title: 'Главный барьер — отсутствие потока', type: 'warning',
        body: 'Это барьер номер один среди финансистов на аутсорсе. Партнёрские каналы решают эту проблему системно.',
        action: 'Решение: подключение к партнёрской программе даёт первого клиента за 3–5 недель' },
      'Не умею / не хочу активно продавать': { icon: '🎤', title: 'Барьер — нежелание продавать', type: 'warning',
        body: 'Финансовый директор не продаёт — он диагностирует проблемы бизнеса. Это другой подход, и он работает.',
        action: 'Решение: через партнёрский канал клиенты приходят сами — вам остаётся только подтвердить экспертизу' },
      'Много рутины — нет времени на рост': { icon: '⏰', title: 'Рутина блокирует рост', type: 'warning',
        body: 'При ' + a.manualWorkPct + '% рутины у вас физически нет ресурса на развитие практики.',
        action: 'Решение: автоматизация операционных процессов высвободит ' + m.routineFreedHours + ' часов в месяц' }
    };
    var bf = barrierFindings[barrier];
    if (bf && !findings.some(function(f) { return f.title === bf.title; })) {
      findings.push(bf);
    }
  }

  // Income gap
  if (m.incomeGap > 100000) {
    findings.push({ icon: '🎯', title: 'Разрыв до цели: ' + formatMoney(m.incomeGap) + ' ₽/мес', type: 'warning',
      body: 'Для достижения ' + formatMoneyShort(m.targetIncome) + '/мес нужно ' + (m.newClientsNeeded <= 3 ? m.newClientsNeeded + ' новых клиента + повышение чека у текущих' : 'системное изменение модели работы') + '.',
      action: 'Ваш персональный план на 90 дней — в разделе ниже' });
  }

  // Render
  var html = '<p style="font-size:15px;color:var(--text-secondary);margin-bottom:16px;line-height:1.6">' + a.name + ', на основе ваших ответов мы выявили ' + findings.length + ' ключевых моментов, которые влияют на ваш доход:</p>';

  findings.forEach(function(f) {
    html +=
      '<div class="finding-card ' + f.type + '">' +
        '<div class="fc-header"><span class="fc-icon">' + f.icon + '</span><span class="fc-title">' + f.title + '</span></div>' +
        '<div class="fc-body">' + f.body + '</div>' +
        (f.action ? '<div class="fc-action">→ ' + f.action + '</div>' : '') +
      '</div>';
  });

  el.innerHTML = html;
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
      if (m.automationLevel < 40) return 'Автоматизация рутины высвободит ~' + m.routineFreedHours + ' часов/мес. Начните с одного процесса: автоматический сбор данных или шаблонизация отчётов. Финтабло сокращает рутину в среднем на 60% у партнёров.';
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
  var newCheck = Math.round(m.checkMid * 1.25);
  var freedClients = m.hoursPerClient > 0 ? Math.floor(m.routineFreedHours / m.hoursPerClient) : 0;
  var scenarioBIncome = m.currentIncome + 2 * m.checkMid;

  el.innerHTML =
    '<p style="font-size:15px;color:var(--text-secondary);margin-bottom:20px;line-height:1.6">' + a.name + ', на основе ваших данных мы рассчитали три сценария роста — от консервативного до амбициозного. Каждый сценарий включает конкретные действия и прогноз дохода.</p>' +

    '<div class="scenario-card">' +
      '<h3>Сценарий А — Оптимизация текущей модели</h3>' +
      '<div class="scenario-time">2–3 месяца · без новых клиентов</div>' +
      '<div class="scenario-actions">' +
        '• Переупаковать предложение: от «веду учёт за ' + formatMoney(m.checkMid) + ' ₽» к «нахожу, где бизнес теряет деньги» за ' + formatMoney(newCheck) + ' ₽<br>' +
        '• Повысить чек у ' + Math.min(2, m.clients) + ' лояльных клиентов на 25% (сценарий разговора — в плане ниже)<br>' +
        '• Сократить рутину на 30% через шаблонизацию — высвободить ~' + Math.round(m.routineHours * 0.3) + ' ч/мес</div>' +
      '<div class="scenario-forecast"><strong>Прогноз дохода:</strong> ' + formatMoney(m.scenarioA) + ' ₽/мес (сейчас ' + formatMoneyShort(m.currentIncome) + ')<br>Дополнительно за год: <strong>+' + formatMoney(Math.round(m.currentIncome * 0.25 * 12)) + ' ₽</strong><br><span style="font-size:13px;color:var(--text-muted)">Уровень риска: умеренный — нужны переговоры с текущими клиентами</span></div>' +
    '</div>' +

    '<div class="scenario-card recommended">' +
      '<div class="scenario-badge">Рекомендован</div>' +
      '<h3>Сценарий Б — Рост через партнёрский канал Финтабло</h3>' +
      '<div class="scenario-time">3–5 месяцев · минимальные риски</div>' +
      '<div class="scenario-actions">' +
        '• Подключиться к партнёрской программе Финтабло — получить менеджера и готовые инструменты<br>' +
        '• Получить 2–3 клиентов через входящий поток заявок (без самостоятельного поиска)<br>' +
        '• Автоматизировать рутину: с ' + a.manualWorkPct + '% до ~20% — высвободить ' + m.routineFreedHours + ' ч/мес<br>' +
        '• Использовать высвободившееся время на ' + freedClients + ' дополнительных клиентов</div>' +
      '<div class="scenario-forecast">' +
        '<strong>Прогноз через 3 месяца:</strong><br>' +
        'Регулярный доход: <strong>' + formatMoney(scenarioBIncome) + ' ₽/мес</strong> (сейчас ' + formatMoneyShort(m.currentIncome) + ')<br>' +
        'Партнёрская комиссия: ' + formatMoney(m.scenarioB_bonus) + ' ₽ единовременно (50% от первого чека каждого клиента)<br>' +
        'Итого за первые 6 мес: <strong>' + formatMoney(scenarioBIncome * 3 + m.scenarioB_bonus) + ' ₽</strong><br>' +
        '<span style="font-size:13px;color:var(--text-muted)">Уровень риска: минимальный — клиенты приходят через готовый поток</span></div>' +
      '<div class="scenario-why">Почему это лучший сценарий: вам не нужно искать клиентов, продавать или придумывать инструменты с нуля. Финтабло даёт входящий поток, готовые материалы и экспертное сообщество. Вы сосредоточены на том, что умеете лучше всего — на финансовой экспертизе.</div>' +
    '</div>' +

    '<div class="scenario-card">' +
      '<h3>Сценарий В — Полная трансформация практики</h3>' +
      '<div class="scenario-time">6–12 месяцев · системные изменения</div>' +
      '<div class="scenario-actions">' +
        '• Перейти на чек от 120 тыс. через позиционирование «финансовый партнёр бизнеса»<br>' +
        '• Делегировать операционный учёт помощнику (от ' + formatMoney(Math.round(m.routineHours * 500)) + ' ₽/мес)<br>' +
        '• Развивать экспертный контент и личный бренд для притяжения крупных клиентов<br>' +
        '• Создать команду из 1–2 специалистов для тиражирования методологии</div>' +
      '<div class="scenario-forecast"><strong>Прогноз:</strong> ' + formatMoney(Math.max(m.targetIncome, 450000)) + ' ₽/мес<br>Срок выхода на целевой доход: 8–12 месяцев<br><span style="font-size:13px;color:var(--text-muted)">Уровень риска: высокий — требует инвестиций времени и пересмотра всей модели</span></div>' +
    '</div>' +

    '<div class="report-insight" style="margin-top:8px"><strong>Рекомендация для ' + a.name + ':</strong> Начните со сценария Б — он даёт результат быстрее всего при минимальных рисках. Элементы сценария А (повышение чека, оптимизация) можно внедрять параллельно. Сценарий В — ваш горизонт на год, когда база и процессы уже выстроены.</div>';
}

/* ===== 90-DAY ROADMAP ===== */
function renderRoadmap(a, m) {
  var el = document.getElementById('roadmap');
  var minRate = Math.round(m.hourlyRate * 0.7);
  var barrierIsFlow = a.barriers && a.barriers.some(function(b) { return b.indexOf('поток') >= 0; });
  var barrierIsRoutine = a.barriers && a.barriers.some(function(b) { return b.indexOf('рутин') >= 0; });
  var barrierIsSell = a.barriers && a.barriers.some(function(b) { return b.indexOf('продавать') >= 0; });
  var barrierIsCheck = a.barriers && a.barriers.some(function(b) { return b.indexOf('чек') >= 0; });
  var newCheck = Math.round(m.checkMid * 1.25);

  // Personalized barrier action for month 2
  var barrierAction = '';
  if (barrierIsFlow) {
    barrierAction = '<h4>Решение вашего главного барьера: поток клиентов</h4><p>Вы указали отсутствие стабильного потока как главную проблему. Партнёрский канал Финтабло решает её напрямую: входящие заявки от бизнеса, который ищет внешнего финансового директора. Вам не нужно продавать — вы выбираете, с кем работать. Первый клиент через партнёрский канал появляется в среднем за 3–5 недель после подключения.</p>';
  } else if (barrierIsRoutine) {
    barrierAction = '<h4>Решение вашего главного барьера: рутина</h4><p>При ' + a.manualWorkPct + '% рутины вы тратите ' + m.routineHours + ' часов в месяц на задачи, которые можно автоматизировать. Внедрите один инструмент автоматизации для 2–3 клиентов: автоматический сбор данных, шаблоны отчётов, визуальные дашборды вместо ручных таблиц. Цель: сократить рутину до 30% за первый месяц.</p>';
  } else if (barrierIsSell) {
    barrierAction = '<h4>Решение вашего главного барьера: продажи</h4><p>Финансовый директор не «продаёт» — он диагностирует. Вместо «я предлагаю услугу» скажите: «Судя по тому, что я вижу в вашем бизнесе, вы теряете примерно [сумму] ежемесячно — давайте я покажу, где именно и как это исправить». Партнёрский канал снимает эту проблему: клиенты уже ищут финансовую экспертизу, вам остаётся только подтвердить свою компетентность.</p>';
  } else if (barrierIsCheck) {
    barrierAction = '<h4>Решение вашего главного барьера: повышение чека</h4><p>Сценарий разговора: «За последние месяцы я значительно расширил работу — [перечислите конкретные улучшения]. Я планирую развивать это направление, что потребует пересмотра условий с ' + formatMoney(m.checkMid) + ' до ' + formatMoney(newCheck) + ' ₽». По данным финансового сообщества, 70–80% лояльных клиентов принимают обоснованное повышение.</p>';
  } else {
    barrierAction = '<h4>Новый источник клиентов</h4><p>Добавьте партнёрский канал — он даёт самый предсказуемый результат с минимальными затратами вашего времени. Первый клиент через Финтабло появляется в среднем за 3–5 недель.</p>';
  }

  el.innerHTML =
    '<p style="font-size:15px;color:var(--text-secondary);margin-bottom:20px;line-height:1.6">Этот план составлен на основе ваших данных: ' + m.clients + ' клиентов, ставка ' + formatMoney(m.hourlyRate) + ' ₽/ч, ' + a.manualWorkPct + '% рутины. Каждый шаг — конкретное действие с измеримым результатом.</p>' +

    '<div class="roadmap-month">' +
      '<h3>Месяц 1 — Фундамент</h3>' +
      '<div class="roadmap-week"><h4>Неделя 1–2: Аудит экономики клиентов</h4>' +
        '<p>Создайте таблицу для каждого клиента: название × ежемесячный чек × часы/мес × фактическая ставка × сложность (1–5). Ваш текущий средний чек — ' + formatMoney(m.checkMid) + ' ₽. Определите клиентов со ставкой ниже ' + formatMoney(minRate) + ' ₽/ч — они тянут ваш доход вниз. <strong>Результат:</strong> чёткое понимание, кто из клиентов приносит доход, а кто создаёт нагрузку.</p></div>' +
      '<div class="roadmap-week"><h4>Неделя 2–3: Переупаковка предложения</h4>' +
        '<p>Ваш текущий формат: «веду управленческий учёт за ' + formatMoney(m.checkMid) + ' ₽/мес». Новый: «помогаю [тип компании] увидеть, где бизнес теряет деньги, и сократить потери — обычно на 15–30% за первые 2 месяца». Конкретизируйте под ваш опыт: какие отрасли, какие типичные потери вы находили. <strong>Результат:</strong> готовое предложение, которое продаёт результат, а не часы.</p></div>' +
      '<div class="roadmap-week"><h4>Неделя 3–4: Первая автоматизация</h4>' +
        '<p>Сейчас вы тратите ~' + m.routineHours + ' ч/мес на рутину. Выберите один процесс, который повторяется у 2+ клиентов (обычно это сбор данных или формирование типовых отчётов). Настройте шаблон или автоматизацию. <strong>Результат:</strong> −2–3 часа на каждого клиента, итого −' + Math.min(m.routineHours, Math.round(m.clients * 2.5)) + ' ч/мес.</p></div>' +
    '</div>' +

    '<div class="roadmap-month">' +
      '<h3>Месяц 2 — Первые результаты</h3>' +
      '<div class="roadmap-week">' + barrierAction + '</div>' +
      '<div class="roadmap-week"><h4>Повышение чека у текущего клиента</h4>' +
        '<p>Выберите 1 клиента с самой высокой лояльностью. Используйте сценарий из переупакованного предложения. Целевой новый чек: ' + formatMoney(newCheck) + ' ₽/мес (+' + formatMoney(newCheck - m.checkMid) + ' ₽). Если у вас ' + m.clients + ' клиентов и вы поднимете чек у двух — это +' + formatMoney(2 * (newCheck - m.checkMid)) + ' ₽/мес к вашему доходу. <strong>Результат:</strong> рост дохода без единого нового клиента.</p></div>' +
    '</div>' +

    '<div class="roadmap-month">' +
      '<h3>Месяц 3 — Масштабирование</h3>' +
      '<div class="roadmap-week"><h4>Выход на траекторию целевого дохода</h4>' +
        '<p>Ваша цель: ' + formatMoney(m.targetIncome) + ' ₽/мес. Разрыв с текущим доходом: ' + formatMoney(m.incomeGap) + ' ₽. ' +
        (m.newClientsNeeded <= 2
          ? 'Для закрытия разрыва достаточно ' + m.newClientsNeeded + ' новых клиентов с чеком ' + formatMoney(Math.round(m.checkMid * 1.15)) + ' ₽ + повышение чека у текущих.'
          : 'Для закрытия нужно ' + m.newClientsNeeded + ' новых клиентов. Это реалистично за 3–5 месяцев через партнёрский канал + повышение чека у текущих.') +
        ' Активируйте 2–3 источника одновременно для стабильности потока. <strong>Результат к концу 3-го месяца:</strong> выстроенная система привлечения, повышенные чеки, сниженная рутина.</p></div>' +
    '</div>' +

    '<div class="report-insight">' +
      '<strong>Почему с Финтабло этот план реалистичен:</strong><br><br>' +
      '• <strong>Поток клиентов</strong> — вам не нужно искать и продавать. Финтабло направляет входящие заявки от бизнеса, который уже ищет финансового директора на аутсорсе.<br>' +
      '• <strong>Автоматизация</strong> — инструменты Финтабло сокращают рутину с ' + a.manualWorkPct + '% до ~20%, высвобождая ' + m.routineFreedHours + ' часов в месяц.<br>' +
      '• <strong>Поддержка</strong> — персональный менеджер, готовые шаблоны, сообщество финдиректоров. Вы не один.<br><br>' +
      'Без этих инструментов план выполним, но займёт в 2–3 раза больше времени. С Финтабло — это реалистичные 90 дней.' +
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
    '<p style="font-size:15px;color:var(--text-secondary);margin-bottom:20px;line-height:1.6">Вот что конкретно меняется в вашей ситуации при подключении к партнёрской программе Финтабло, ' + a.name + ':</p>' +

    '<div class="benefit-card"><div class="benefit-icon">📉</div><h4>Снижение рутины</h4>' +
      '<p>Сейчас: ' + a.manualWorkPct + '% времени на рутину → С Финтабло: ~20%<br>Высвобождается: ' + m.routineFreedHours + ' часов в месяц<br>Это время на ' + freedClients + ' дополнительных клиентов или на повышение качества работы с текущими</p></div>' +

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
      '<p style="font-size:13px;color:var(--text-secondary);margin-bottom:12px">Прогноз: вы привлекаете 2 клиентов через Финтабло за 3 месяца</p>' +
      '<div class="calc-row"><span>Комиссия (единовременно)</span><span>' + formatMoney(commissionQuarter) + ' ₽</span></div>' +
      '<div class="calc-row"><span>Дополнительный регулярный доход</span><span>+' + formatMoney(2 * m.checkMid) + ' ₽/мес</span></div>' +
      '<div class="calc-row total"><span>Ваш доход через 3 мес</span><span>' + formatMoney(newIncome) + ' ₽/мес</span></div>' +
      '<div class="calc-growth">Это на ' + growthPct + '% выше текущего дохода</div>' +
    '</div>';
}

/* ===== INLINE CTA (after scenarios) ===== */
function renderInlineCTA(a, m) {
  var el = document.getElementById('inline-cta-1');
  if (!el) return;
  el.innerHTML =
    '<div class="inline-cta">' +
      '<h4>Хотите понять, какой сценарий подходит именно вам?</h4>' +
      '<p>Эксперт Финтабло уже видит ваши данные и подготовит индивидуальный разбор: какой из сценариев реалистичен, с чего начать и каких результатов ожидать. 20–30 минут, бесплатно.</p>' +
      '<button class="btn-primary" onclick="goToThankYou()">Обсудить с экспертом →</button>' +
    '</div>';
}

/* ===== FINAL CTA ===== */
function renderCTA(a, m) {
  var el = document.getElementById('report-cta');
  var incomeWithFT = m.currentIncome + 2 * m.checkMid;
  el.innerHTML =
    '<div class="report-cta">' +
      '<h3>' + a.name + ', вы видите свой потенциал. Давайте реализуем его вместе.</h3>' +
      '<p>Эксперт Финтабло уже видит ваш профиль «' + m.practiceType + '» и подготовит персональные рекомендации: какой сценарий выбрать, с чего начать, как выйти на ' + formatMoneyShort(m.targetIncome) + '/мес. Это не презентация — это разбор конкретно вашей ситуации.</p>' +
      '<button class="btn-primary" onclick="goToThankYou()">Получить персональный разбор — бесплатно →</button>' +
      '<p style="font-size:12px;opacity:0.6;margin-top:10px">20–30 минут · без обязательств</p>' +
    '</div>';

  window.goToThankYou = function() {
    if (typeof ym === 'function') ym(61131877, 'reachGoal', 'report_cta_clicked');
    window.location.href = 'thankyou.html';
  };

  // Sticky CTA — show after user scrolls past first section
  initStickyCTA();
}

function initStickyCTA() {
  var sticky = document.getElementById('sticky-report-cta');
  if (!sticky) return;
  var scenariosSection = document.getElementById('sec-scenarios');
  if (!scenariosSection) return;

  window.addEventListener('scroll', function() {
    var triggerPoint = scenariosSection.offsetTop;
    var reportCta = document.getElementById('report-cta');
    var bottomHide = reportCta ? reportCta.offsetTop - window.innerHeight : 99999;

    if (window.scrollY > triggerPoint && window.scrollY < bottomHide) {
      sticky.style.display = 'block';
      setTimeout(function() { sticky.classList.add('visible'); }, 10);
    } else {
      sticky.classList.remove('visible');
    }
  });
}

/* ===== SHARE ===== */
function renderShareCard(a, m) {
  var potential = m.currentIncome > 0 ? Math.round(m.incomeGap / m.currentIncome * 100) : 100;
  var el = document.getElementById('share-section');
  el.innerHTML = '<button class="btn-share" onclick="shareResult()">Поделиться результатом</button>';

  window.shareResult = function() {
    var text = 'Прошёл диагностику практики финансиста на Финтабло.\n' +
      'Мой профиль: ' + m.practiceType + '\nПотенциал роста: +' + potential + '%';
    if (navigator.share) {
      navigator.share({ text: text });
    } else if (navigator.clipboard) {
      navigator.clipboard.writeText(text).then(function() { alert('Текст скопирован!'); });
    }
  };
}

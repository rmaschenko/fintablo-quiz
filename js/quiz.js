/* ===== Quiz Logic v2 ===== */
/* Step order: 0(start) 1(name) 2(experience) 3(workFormat) 4(clients) 5(avgCheck)
   6(hours) 65(intermediate) 7(manual%) 8(sources) 9(barriers) 10(targetIncome) 11(capture) */

var currentStep = 0;
var STEP_ORDER = [0, 1, 2, 3, 4, 5, 6, 65, 7, 8, 9, 10, 11];
var TOTAL_QUESTION_STEPS = 10; // steps 1-10 are questions

/* ============ INSIGHTS ============ */
var INSIGHTS = {
  experience: {
    'До 3 лет': 'Начальный этап карьеры в финансах. На этом уровне ключевое преимущество — свежий взгляд и готовность к новым подходам. 74% финансистов, начавших фриланс на раннем этапе, быстрее адаптируют современные инструменты.',
    '3–5 лет': 'Хороший фундамент. Вы уже понимаете типовые задачи бизнеса и можете решать их самостоятельно. На этом уровне важно правильно упаковать опыт, чтобы клиент видел не количество лет, а конкретный результат.',
    '5–10 лет': 'Уверенный профессионал. На этом уровне опыта финансист способен видеть системные проблемы бизнеса, а не только отдельные операции. Это и есть ваше конкурентное преимущество.',
    'Более 10 лет': 'Глубокая экспертиза. Финансисты с таким стажем часто недооценивают свой опыт и занижают стоимость услуг. Ваши знания — это актив, который при правильной упаковке стоит значительно дороже, чем привычный вам ценник.'
  },
  workFormat: {
    'В найме (рассматриваю фриланс)': '73% финансистов, планирующих уйти во фриланс, откладывают переход на 1–2 года. Чаще всего не из-за отсутствия навыков, а из-за отсутствия понятной модели, гарантирующей замену дохода в первые 3 месяца.',
    'Фриланс/аутсорс до 1 года': 'Первый год — самый сложный этап: 68% финансистов-фрилансеров зарабатывают меньше ожиданий. Причина не в квалификации, а в неправильной модели монетизации опыта.',
    'Фриланс/аутсорс 1–3 года': 'Период функционального плато: клиенты есть, навыков достаточно, но доход не растёт пропорционально усилиям. В 90% случаев причина — не в качестве работы, а в модели ценообразования и источниках клиентов.',
    'Фриланс/аутсорс более 3 лет': 'Три года фриланса — это уже полноценная практика. Но большинство финансистов с таким опытом застревают на одном и том же доходе. Причина — в структуре практики, а не в количестве клиентов.'
  },
  clients: function(n) {
    if (n === 0) return 'Нулевая точка — но не нулевой потенциал. Финансисты с опытом от 3 лет находят первого клиента через правильный канал в среднем за 3–5 недель. Ключевое — выбор правильного канала.';
    if (n <= 2) return '1–2 клиента — зона финансовой уязвимости: потеря одного клиента — это падение дохода на 50–100%. Устойчивый минимум начинается с 4–5 клиентов с разными сроками договоров.';
    if (n <= 4) return '3–4 клиента — переходная зона. У вас есть база, но она ещё хрупкая. На этом этапе важнее не искать новых, а повышать средний чек у текущих и выстраивать предсказуемый поток новых.';
    if (n <= 7) return 'Работающая база. Вопрос меняется: не как найти клиентов, а как обслуживать больше без пропорционального роста нагрузки. Это уже про автоматизацию и систему, а не про личное усилие.';
    if (n <= 10) return 'Серьёзный портфель. При 8+ клиентах без систематизации неизбежно выгорание. Главные вопросы: какие клиенты дают лучшую отдачу на ваше время, и как повысить средний чек без потери текущих.';
    return 'Масштабная практика. На этом уровне единственный путь к росту дохода — не больше клиентов, а выше чек и меньше времени на каждого. Нужна глубокая автоматизация и, возможно, команда.';
  },
  avgCheck: {
    'До 20 000 ₽': '20 000 ₽ — это ставка помощника бухгалтера, не финансового директора на аутсорсе. Финансисты с аналогичным опытом, переупаковавшие предложение под конкретный результат для бизнеса, выходят на 40–60 тыс. с теми же задачами. Разница — в формулировке ценности.',
    '20 000 – 40 000 ₽': 'Самый распространённый диапазон — более 40% финансистов-фрилансеров работают в нём. Хорошая новость: переход с 30–35 тыс. на 55–60 тыс. часто не требует новых клиентов — достаточно переупаковать предложение под измеримый результат.',
    '40 000 – 70 000 ₽': 'Верхняя треть рынка. Вы уже продаёте экспертизу финансового директора. Главный вопрос — как перейти за 100 тыс. с одного клиента: через проектную составляющую или расширение объёма работ.',
    '70 000 – 100 000 ₽': 'Верхний сегмент рынка аутсорс-финдиректоров. Вы продаёте стратегическую ценность, а не часы. Дальнейший рост — через расширение модели: долгосрочные контракты, привязка к результату клиента.',
    'Более 100 000 ₽': 'Уровень финансового партнёра крупного бизнеса. Масштабирование — через делегирование операционного учёта и фокус на стратегических решениях. Или через упаковку собственной методологии в продукт.'
  },
  hourlyRate: function(rate) {
    if (rate < 500) return 'Тревожный сигнал. Хороший бухгалтер на фрилансе берёт 600–800 ₽/ч. Финансовый директор с вашим опытом должен стоить от 1 500 ₽/ч. Разрыв — это стоимость неправильного позиционирования.';
    if (rate < 1000) return 'Средний рынок для финансовых специалистов уровня просто веду учёт. При переходе к позиционированию результат для бизнеса ставка вырастает до 1 500–2 500 ₽/ч с теми же клиентами.';
    if (rate < 2000) return 'Хорошая ставка — вы уже в зоне финансового консалтинга. Главный вопрос следующего уровня: как снизить количество часов на клиента через автоматизацию, сохраняя или повышая чек.';
    return 'Высокая ставка — вы монетизируете стратегическую ценность, а не время. На этом уровне важно выстраивать работу на основе результата, а не почасовой оплаты.';
  },
  manualWork: function(pct, hours, clients) {
    var totalH = hours * clients;
    if (pct < 25) return 'Отличная автоматизация — вы уже в числе лучших 20% по этому показателю. У большинства финансистов-фрилансеров с аналогичным портфелем этот показатель 50–70%.';
    if (pct < 45) return 'Умеренная рутинность. Каждые 10% снижения рутины при ' + clients + ' клиентах = +' + Math.round(totalH * 0.1) + ' свободных часов в месяц. Это время на нового клиента или повышение ценности для текущих.';
    if (pct < 65) return 'Половина рабочего времени уходит на операционные задачи, за которые клиент платит как за экспертизу финансового директора. Вы теряете ' + Math.round(totalH * (pct/100) - totalH * 0.20) + ' часов в месяц, которые могли бы идти на развитие.';
    return 'Критический уровень рутины. При таком соотношении каждый новый клиент = ещё +' + hours + ' часов рутины. Масштабироваться без изменения инструментов невозможно — это математический тупик.';
  },
  sources: function(sources) {
    if (sources.some(function(s) { return s.indexOf('Пока клиентов') >= 0; })) return 'Честная точка старта. Первый клиент через рекомендации появляется в среднем через 2–4 месяца. Через партнёрский канал с готовым потоком — за 3–6 недель. Выбор источника определяет скорость старта.';
    if (sources.some(function(s) { return s.indexOf('Партнёрск') >= 0; })) return 'Партнёрский канал — единственный, который можно подключить в нужный момент и получить поток заявок. Вы уже понимаете эту логику — это ценно.';
    if (sources.length >= 3) return 'Сильная диверсификация источников. Главный вопрос — не количество каналов, а их качество: какой даёт клиентов с лучшим соотношением чека и ваших трудозатрат?';
    if (sources.length === 2) return 'Два канала — хорошее начало. Для устойчивого потока добавьте хотя бы один канал, который даёт заявки без вашего активного участия в продажах.';
    if (sources.length === 1 && sources[0].indexOf('Рекомендации') >= 0) return 'Рекомендации — это признание вашей прошлой работы. Но этот канал не масштабируется: вы не можете получить больше заявок в нужный момент. Большинство финансистов с нестабильным доходом зависят только от этого источника.';
    return 'Один канал — одна точка отказа. Если он ослабнет — месяц без новых клиентов неизбежен. Финансисты с высоким доходом используют 2–3 независимых источника.';
  },
  barriers: {
    'Нет стабильного потока новых клиентов': 'Это барьер №1 у 71% финансистов на аутсорсе. Ключевое наблюдение: финансисты, работающие через партнёрские каналы с готовым потоком, тратят на поиск клиентов в 4 раза меньше времени.',
    'Не умею / не хочу активно продавать': 'Финансисты редко продают в классическом смысле — они диагностируют. Не «я предлагаю услугу», а «ваш бизнес, по моим наблюдениям, теряет конкретную сумму ежемесячно — давайте покажу, где именно». Это язык собственника, а не продавца.',
    'Перегружен — некогда заниматься развитием': 'Парадокс успеха: вы заняты, но не зарабатываете на уровне своей квалификации. Если более 60% времени — рутина, рост дохода заблокирован. Выход — не работать больше, а автоматизировать операционное ядро.',
    'Не знаю, как повысить чек без потери клиентов': 'Самый распространённый страх, у которого нет реальных оснований. 80% лояльных клиентов принимают повышение чека на 20–30%, если оно обосновано дополнительной ценностью. Ключ — не «я прошу больше», а «теперь я даю результат, а не просто отчёт».',
    'Много рутины — нет времени на рост': 'При 50%+ рутины вы не можете брать больше клиентов без выгорания. Это системная проблема инструментов, а не вопрос дисциплины. Автоматизация 30% рутины = возможность взять ещё 1–2 клиентов без роста нагрузки.',
    'Нет кейсов и портфолио под NDA': 'Ограничение по NDA — реальное, но решаемое. Кейсы без названия компании работают так же убедительно: «помог проектной компании в строительстве выявить убыточные контракты — экономия 2,3 млн в год» — сильнее, чем «ООО "Ромашка"».',
    'Одиночество — не к кому обратиться': 'Это не мягкая боль — это реальный профессиональный риск. Финансист без экспертного сообщества принимает сложные решения в условиях информационной изоляции. Это влияет и на качество работы, и на уверенность в себе.',
    'Страх потерять стабильный доход': 'Самый честный барьер. Хорошая новость: партнёрская модель позволяет наращивать доход параллельно с текущим источником — без разрыва, без прыжка в пропасть. Первый клиент через партнёрский канал не требует ухода из найма.'
  },
  incomeGap: function(gap) {
    if (gap <= 0) return 'Вы уже на уровне или выше своей цели. Следующий шаг — закрепить этот результат и вывести практику на новый уровень стабильности и масштабируемости.';
    if (gap < 50000) return 'Вы в шаге от цели. Точечные изменения — повышение чека у 1–2 клиентов или один новый контракт — закроют этот разрыв за 1–2 месяца.';
    if (gap < 150000) return 'Достижимо за 3–5 месяцев при правильной стратегии. Обычно это комбинация: один новый клиент через партнёрский канал + повышение чека у текущих на 15–20%.';
    if (gap < 300000) return 'Требует изменения модели, а не просто ещё клиентов. Переход к такому доходу занимает 4–7 месяцев при наличии правильного потока и инструментов.';
    return 'Трансформация практики. Это смена подхода: от «делаю учёт» к «управляю финансами как партнёр бизнеса». Достижимо, но требует системного плана и поддержки.';
  }
};

/* ============ MOTIVATIONS — why we ask this question ============ */
var MOTIVATIONS = {
  1: { icon: '👤', text: 'Имя нужно для персонализации вашего отчёта' },
  2: { icon: '📊', text: 'Опыт влияет на вашу рыночную стоимость и стратегию роста' },
  3: { icon: '💼', text: 'Формат работы определяет стратегию: в найме и на фрилансе — разные пути к цели' },
  4: { icon: '👥', text: 'Количество клиентов определяет устойчивость и потенциал вашей практики' },
  5: { icon: '💰', text: 'Средний чек — ключевая метрика, от которой зависит ваш расчётный доход' },
  6: { icon: '⏱', text: 'Время на клиента определяет вашу реальную ставку — результат может удивить' },
  7: { icon: '🔄', text: 'Доля рутины показывает, есть ли у вас ресурс для роста без выгорания' },
  8: { icon: '📥', text: 'Источники клиентов — основа предсказуемости вашего дохода' },
  9: { icon: '🚧', text: 'Понимание ваших барьеров позволит дать точные рекомендации именно для вашей ситуации' },
  10: { icon: '🎯', text: 'Целевой доход определяет сценарий роста и конкретные шаги в вашем плане' }
};

/* ============ NAVIGATION ============ */
function getCurrentStep() { return currentStep; }
function getName() { return getAllAnswers().name || ''; }

function updateProgress() {
  var wrapper = document.querySelector('.progress-wrapper');
  var fill = document.querySelector('.progress-fill');
  var label = document.querySelector('.progress-label');
  if (!wrapper || !fill || !label) return;

  if (currentStep === 0) {
    wrapper.classList.remove('visible');
    return;
  }

  wrapper.classList.add('visible');

  var idx = STEP_ORDER.indexOf(currentStep);
  var pct = Math.min(100, Math.round((idx / (STEP_ORDER.length - 1)) * 100));
  fill.style.width = pct + '%';

  if (currentStep === 11) {
    label.innerHTML = '<span>Почти готово!</span>';
  } else if (currentStep === 65) {
    label.innerHTML = '<span>Промежуточный результат</span>';
  } else if (currentStep >= 9) {
    label.innerHTML = '<span>Почти готово</span>';
  } else if (idx >= 7) {
    label.innerHTML = '<span>Осталось совсем немного</span>';
  } else {
    label.innerHTML = '<span>Шаг ' + idx + '</span>';
  }
}

function goToStep(step) {
  var activeEl = document.querySelector('.step.active');
  var targetEl = document.getElementById('step-' + step);
  if (!targetEl) return;

  if (activeEl) {
    activeEl.classList.remove('active');
    activeEl.classList.add('leaving');
    setTimeout(function() { activeEl.classList.remove('leaving'); }, 220);
  }

  setTimeout(function() { targetEl.classList.add('active'); }, activeEl ? 50 : 0);

  currentStep = step;
  updateProgress();
  updateNavButtons();
  window.scrollTo(0, 0);

  // Special renders
  if (step === 65) renderIntermediate();
  if (step === 11) renderCapturePreview();
  if (step >= 2) updateStepNames();
  if (step >= 1) restoreStepState(step);

  // Show motivation
  showMotivation(step);

  // Yandex.Metrika
  if (typeof ym === 'function' && step > 0) {
    if (step === 65) ym(61131877, 'reachGoal', 'quiz_intermediate');
    else if (step === 11) ym(61131877, 'reachGoal', 'quiz_capture_screen');
    else ym(61131877, 'reachGoal', 'quiz_step_' + step);
  }
}

function showMotivation(step) {
  var el = document.getElementById('motivation-' + step);
  if (!el || !MOTIVATIONS[step]) return;
  el.innerHTML = '<span class="motiv-icon">' + MOTIVATIONS[step].icon + '</span><span>' + MOTIVATIONS[step].text + '</span>';
}

function updateNavButtons() {
  var nav = document.querySelector('.step-nav');
  var backBtn = document.getElementById('btn-back');
  var nextBtn = document.getElementById('btn-next');
  if (!nav) return;

  if (currentStep === 0) { nav.style.display = 'none'; return; }

  nav.style.display = 'block';
  backBtn.style.display = currentStep >= 2 ? 'flex' : 'none';

  if (currentStep === 11) {
    nextBtn.style.display = 'none';
  } else {
    nextBtn.style.display = 'block';
    nextBtn.disabled = !isStepValid(currentStep);
  }

  if (currentStep === 65) {
    nextBtn.textContent = 'Продолжить → Что мешает расти';
  } else if (currentStep === 10) {
    nextBtn.textContent = 'Завершить →';
  } else {
    nextBtn.textContent = 'Далее →';
  }
}

function isStepValid(step) {
  var a = getAllAnswers();
  switch (step) {
    case 1: return a.name && a.name.trim().length >= 2 && !/\d/.test(a.name);
    case 2: return !!a.experience;
    case 3: return !!a.workFormat;
    case 4: return a.clients !== undefined;
    case 5: return !!a.avgCheckRange;
    case 6: return a.hoursPerClient !== undefined;
    case 65: return true;
    case 7: return a.manualWorkPct !== undefined;
    case 8: return a.clientSources && a.clientSources.length > 0;
    case 9: return a.barriers && a.barriers.length >= 1 && a.barriers.length <= 2;
    case 10: return a.targetIncome !== undefined;
    default: return true;
  }
}

function nextStep() {
  if (!isStepValid(currentStep)) return;
  var idx = STEP_ORDER.indexOf(currentStep);
  if (idx < STEP_ORDER.length - 1) {
    goToStep(STEP_ORDER[idx + 1]);
  }
}

function prevStep() {
  var idx = STEP_ORDER.indexOf(currentStep);
  if (idx > 0) {
    goToStep(STEP_ORDER[idx - 1]);
  }
}

function startQuiz() {
  if (typeof ym === 'function') ym(61131877, 'reachGoal', 'quiz_started');
  goToStep(1);
}

function showInsight(containerId, text) {
  var el = document.getElementById(containerId);
  if (!el || !text) return;
  el.innerHTML = '<div class="insight-box">' + text + '</div>';
}

/* ============ STEP HANDLERS ============ */

// Step 1 — Name
function onNameInput(input) {
  var val = input.value.trim();
  saveAnswer('name', val);
  var valid = val.length >= 2 && !/\d/.test(val);
  document.getElementById('btn-next').disabled = !valid;
  if (valid) {
    showInsight('insight-1', 'Отлично, ' + val + '. Следующие 4 минуты дадут вам больше ясности о вашей практике, чем большинство коллег получают за месяц самоанализа.');
  } else {
    document.getElementById('insight-1').innerHTML = '';
  }
}

// Step 2 — Experience
function selectExperience(value, el) {
  var cards = document.querySelectorAll('#step-2 .option-card');
  cards.forEach(function(c) { c.classList.remove('selected'); });
  el.classList.add('selected');
  saveAnswer('experience', value);
  showInsight('insight-2', INSIGHTS.experience[value]);
  document.getElementById('btn-next').disabled = false;
}

// Step 3 — Work format
function selectWorkFormat(value, el) {
  var cards = document.querySelectorAll('#step-3 .option-card');
  cards.forEach(function(c) { c.classList.remove('selected'); });
  el.classList.add('selected');
  saveAnswer('workFormat', value);
  showInsight('insight-3', INSIGHTS.workFormat[value]);
  document.getElementById('btn-next').disabled = false;
}

// Step 4 — Clients slider
function onClientsChange(input) {
  var val = parseInt(input.value);
  saveAnswer('clients', val);
  document.getElementById('clients-value').textContent = val >= 15 ? '15+' : val;
  document.getElementById('clients-label').textContent = declension(val, 'клиент', 'клиента', 'клиентов');
  input.style.setProperty('--pct', ((val / 15) * 100) + '%');

  updateSliderBadge('clients-badge', val,
    [3, 5, 8],
    ['Старт', 'Переходная зона', 'Устойчивая база', 'Масштаб'],
    ['red', 'yellow', 'blue', 'green']
  );

  var hint4 = document.getElementById('slider-hint-4');
  if (hint4) hint4.classList.add('hidden-hint');
  showInsight('insight-4', INSIGHTS.clients(val));
  document.getElementById('btn-next').disabled = false;
}

// Step 5 — Avg check
function selectCheck(value, el) {
  var cards = document.querySelectorAll('#step-5 .option-card');
  cards.forEach(function(c) { c.classList.remove('selected'); });
  el.classList.add('selected');
  saveAnswer('avgCheckRange', value);
  saveAnswer('avgCheckMid', CHECK_MIDS[value]);
  showInsight('insight-5', INSIGHTS.avgCheck[value]);
  document.getElementById('btn-next').disabled = false;
}

// Step 6 — Hours per client
function onHoursChange(input) {
  var val = parseInt(input.value);
  saveAnswer('hoursPerClient', val);
  document.getElementById('hours-value').textContent = val;

  var a = getAllAnswers();
  var checkMid = CHECK_MIDS[a.avgCheckRange] || 35000;
  var rate = Math.round(checkMid / val);
  document.getElementById('rate-display').textContent = formatMoney(rate) + ' ₽/час';

  updateSliderBadge('rate-badge', rate,
    [500, 1000, 2000],
    ['Ниже рынка', 'Есть куда расти', 'Хороший уровень', 'Верхний сегмент'],
    ['red', 'yellow', 'blue', 'green']
  );

  input.style.setProperty('--pct', (((val - 4) / 76) * 100) + '%');
  showInsight('insight-6', INSIGHTS.hourlyRate(rate));
  document.getElementById('btn-next').disabled = false;
}

// Step 7 — Manual work %
function onManualChange(input) {
  var val = parseInt(input.value);
  saveAnswer('manualWorkPct', val);
  document.getElementById('manual-value').textContent = val + '%';

  var a = getAllAnswers();
  var totalH = (a.clients || 0) * (a.hoursPerClient || 20);
  var routineH = Math.round(totalH * val / 100);
  document.getElementById('manual-hours').textContent = routineH + ' ч/мес уходит на рутину, которую можно автоматизировать';

  input.style.setProperty('--pct', val + '%');

  // Color indicator
  var fill = document.getElementById('manual-color-fill');
  if (fill) {
    if (val < 25) fill.style.background = '#10B981';
    else if (val < 45) fill.style.background = '#F59E0B';
    else if (val < 65) fill.style.background = '#F97316';
    else fill.style.background = '#EF4444';
    fill.style.width = val + '%';
  }

  updateSliderBadge('manual-badge', val,
    [25, 45, 65],
    ['Высокая автоматизация', 'Умеренная рутина', 'Много рутины', 'Критический уровень'],
    ['green', 'blue', 'yellow', 'red']
  );

  showInsight('insight-7', INSIGHTS.manualWork(val, a.hoursPerClient || 20, a.clients || 0));
  document.getElementById('btn-next').disabled = false;
}

// Step 8 — Sources (multi-select)
function toggleSource(value, el) {
  var a = getAllAnswers();
  var sources = a.clientSources || [];
  var idx = sources.indexOf(value);

  if (idx >= 0) {
    sources.splice(idx, 1);
    el.classList.remove('selected');
  } else {
    sources.push(value);
    el.classList.add('selected');
  }

  saveAnswer('clientSources', sources);
  if (sources.length > 0) showInsight('insight-8', INSIGHTS.sources(sources));
  document.getElementById('btn-next').disabled = sources.length === 0;
}

// Step 9 — Barriers (multi-select, max 2)
function toggleBarrier(value, el) {
  var a = getAllAnswers();
  var barriers = a.barriers || [];
  var idx = barriers.indexOf(value);

  if (idx >= 0) {
    barriers.splice(idx, 1);
    el.classList.remove('selected');
  } else {
    if (barriers.length >= 2) return;
    barriers.push(value);
    el.classList.add('selected');
  }

  saveAnswer('barriers', barriers);

  var cards = document.querySelectorAll('#step-9 .option-card');
  cards.forEach(function(c) {
    if (!c.classList.contains('selected') && barriers.length >= 2) {
      c.classList.add('disabled');
    } else {
      c.classList.remove('disabled');
    }
  });

  if (barriers.length > 0) showInsight('insight-9', INSIGHTS.barriers[barriers[0]] || '');
  document.getElementById('btn-next').disabled = barriers.length === 0;
}

// Step 10 — Target income slider
function onTargetChange(input) {
  var val = parseInt(input.value);
  saveAnswer('targetIncome', val);
  document.getElementById('target-value').textContent = formatMoney(val) + ' ₽/мес';

  var a = getAllAnswers();
  var checkMid = CHECK_MIDS[a.avgCheckRange] || 35000;
  var currentIncome = (a.clients || 0) * checkMid;
  var gap = Math.max(0, val - currentIncome);
  document.getElementById('target-gap').textContent = 'Разрыв с текущим: +' + formatMoney(gap) + ' ₽/мес';

  input.style.setProperty('--pct', (((val - 50000) / 950000) * 100) + '%');

  updateSliderBadge('target-badge', gap,
    [50000, 150000, 300000],
    ['Почти на месте', 'Достижимо за 3–5 мес', 'Нужна новая модель', 'Трансформация'],
    ['green', 'blue', 'yellow', 'red']
  );

  showInsight('insight-10', INSIGHTS.incomeGap(gap));
  document.getElementById('btn-next').disabled = false;
}

/* ============ INTERMEDIATE SCREEN (enriched) ============ */
function renderIntermediate() {
  var a = getAllAnswers();
  var checkMid = CHECK_MIDS[a.avgCheckRange] || 35000;
  var clients = a.clients || 0;
  var hpc = a.hoursPerClient || 20;
  var income = clients * checkMid;
  var rate = hpc > 0 ? Math.round(checkMid / hpc) : 0;
  var totalH = clients * hpc;
  var benchRate = 1500;

  // Basic metrics
  document.getElementById('inter-name').textContent = a.name || '';
  document.getElementById('inter-clients').textContent = clients;
  document.getElementById('inter-income').textContent = formatMoneyShort(income) + '/мес';
  document.getElementById('inter-rate').textContent = formatMoney(rate) + ' ₽/ч';
  document.getElementById('inter-hours').textContent = totalH + ' ч';

  // Color coding
  setMetricSub('inter-clients-sub', clients, [3, 5], ['Зона уязвимости', 'Растущая база', 'Устойчивый портфель'], ['red', 'yellow', 'green']);
  setMetricSub('inter-income-sub', income, [100000, 250000], ['Ниже 100к', 'Средний уровень', 'Хороший уровень'], ['red', 'yellow', 'green']);
  setMetricSub('inter-rate-sub', rate, [500, 1500], ['Ниже рынка', 'Есть потенциал', 'Верхний уровень'], ['red', 'yellow', 'green']);
  setMetricSub('inter-hours-sub', totalH, [80, 120], ['Комфортно', 'Умеренно', 'Высокая нагрузка'], ['green', 'yellow', 'red']);

  // === Benchmark comparison ===
  var benchEl = document.getElementById('inter-benchmark');
  if (benchEl) {
    var ratePercent = Math.min(100, Math.round(rate / benchRate * 100));
    var incomeTarget = 500000;
    var incomePct = Math.min(100, Math.round(income / incomeTarget * 100));
    benchEl.innerHTML =
      '<div style="font-size:13px;font-weight:600;color:var(--brand-navy);margin-bottom:8px">Сравнение с рынком</div>' +
      '<div class="bench-row"><span class="bench-label">Ваша ставка</span><span class="bench-you">' + formatMoney(rate) + ' ₽/ч</span></div>' +
      '<div class="bench-row"><span class="bench-label">Медиана финдиректоров на аутсорсе</span><span class="bench-market">' + formatMoney(benchRate) + ' ₽/ч</span></div>' +
      '<div class="bench-row"><span class="bench-label">Ваша ставка vs. рынок</span><span class="bench-you" style="color:' + (ratePercent >= 80 ? 'var(--accent-green)' : ratePercent >= 50 ? 'var(--warning)' : 'var(--danger)') + '">' + ratePercent + '%</span></div>' +
      '<div class="bench-row"><span class="bench-label">Ваш доход vs. цель 500к/мес</span><span class="bench-you" style="color:' + (incomePct >= 80 ? 'var(--accent-green)' : incomePct >= 40 ? 'var(--warning)' : 'var(--danger)') + '">' + incomePct + '%</span></div>';
  }

  // === Expert insight ===
  var insightText;
  if (rate < 500 && clients > 5) {
    insightText = '<strong>Тревожная комбинация.</strong> Вы работаете с ' + clients + ' клиентами, но ставка ' + formatMoney(rate) + ' ₽/ч — это уровень начинающего специалиста, а не финансового директора с вашим опытом. При такой модели каждый новый клиент приближает вас к выгоранию, а не к росту дохода. Приоритет №1 — не ещё больше клиентов, а радикальное изменение ценообразования. Финансисты в аналогичной ситуации, переупаковавшие своё предложение, удваивали ставку за 2–3 месяца без потери клиентов.';
  } else if (income < 100000) {
    insightText = '<strong>Стартовая фаза практики.</strong> При доходе ' + formatMoneyShort(income) + '/мес вы пока в зоне, где фриланс не оправдывает ожиданий. Это не вопрос квалификации — это вопрос модели. Финансисты с вашим опытом, которые выстроили правильный поток клиентов и переупаковали предложение, выходят на 200–250 тыс. за 3–4 месяца. Ваш полный отчёт покажет конкретные шаги, как это сделать.';
  } else if (income < 180000) {
    insightText = '<strong>Ловушка нормального дохода.</strong> ' + formatMoneyShort(income) + '/мес — это уровень, на котором кажется, что всё работает. Но это самый коварный коридор: чтобы вырасти дальше, нужно не больше работать, а менять структуру практики. При ставке ' + formatMoney(rate) + ' ₽/ч и ' + totalH + ' часах в месяц у вас есть конкретный потенциал роста — диагностика покажет, где именно.';
  } else if (income < 280000) {
    insightText = '<strong>Верхняя треть рынка.</strong> Доход ' + formatMoneyShort(income) + '/мес подтверждает, что ваша модель работает. Следующий уровень — 350–450 тыс. — достигается не через увеличение количества клиентов, а через повышение среднего чека, автоматизацию и подключение партнёрских каналов. Ваш полный отчёт покажет конкретный сценарий.';
  } else {
    insightText = '<strong>Сильная позиция.</strong> При доходе ' + formatMoneyShort(income) + '/мес ваша ключевая задача — устойчивость. Главный риск на этом уровне — зависимость от 1–2 крупных клиентов. Диверсификация источников и автоматизация рутины — ваши рычаги для следующего рывка.';
  }

  document.getElementById('inter-insight').innerHTML = insightText;

  // === Key finding ===
  var findEl = document.getElementById('inter-finding');
  if (findEl) {
    var monthlyPotential = Math.max(0, (benchRate - rate)) * totalH;
    var findClass = '';
    var findText = '';

    if (rate >= benchRate) {
      findClass = 'positive';
      findText = '💪 <strong>Ваша ставка выше рыночной медианы</strong> — это сильный показатель. Следующие вопросы помогут определить, как масштабировать практику без увеличения нагрузки.';
    } else if (monthlyPotential > 50000) {
      findClass = 'negative';
      findText = '⚡ <strong>Ключевая находка:</strong> разница между вашей ставкой и рыночным уровнем = <strong>' + formatMoney(monthlyPotential) + ' ₽/мес</strong> потенциального роста дохода. Это ' + formatMoney(monthlyPotential * 12) + ' ₽ в год — без единого нового клиента, только через правильное позиционирование.';
    } else {
      findClass = '';
      findText = '📊 <strong>Промежуточный вывод:</strong> ваша модель работает, но есть конкретные точки роста. Следующие вопросы покажут, где именно вы можете увеличить доход с наименьшими усилиями.';
    }

    findEl.className = 'inter-finding ' + findClass;
    findEl.innerHTML = findText;
  }

  // === Live cost counter ===
  var costEl = document.getElementById('inter-live-cost');
  if (costEl && rate < benchRate) {
    var dailyLoss = Math.round(monthlyPotential / 22);
    costEl.innerHTML =
      '<div class="cost-label">Каждый рабочий день при текущей ставке вы недополучаете</div>' +
      '<div class="cost-value">~' + formatMoney(dailyLoss) + ' ₽</div>' +
      '<div class="cost-sub">Это разница между вашей текущей и рыночной ставкой финдиректора</div>';
  } else if (costEl) {
    costEl.style.display = 'none';
  }

  // === What's next — visual block ===
  var nextHint = document.getElementById('inter-next-hint');
  if (nextHint) {
    nextHint.innerHTML =
      '<div class="inb-title">Блок 2: ещё 4 вопроса — и ваш персональный план готов</div>' +
      '<div class="inter-next-items">' +
        '<div class="inter-next-item"><span class="ini-icon">🔄</span><div><strong>Доля рутины</strong> — сколько времени вы теряете</div></div>' +
        '<div class="inter-next-item"><span class="ini-icon">📥</span><div><strong>Источники клиентов</strong> — насколько предсказуем поток</div></div>' +
        '<div class="inter-next-item"><span class="ini-icon">🚧</span><div><strong>Барьеры роста</strong> — что конкретно мешает</div></div>' +
        '<div class="inter-next-item"><span class="ini-icon">🎯</span><div><strong>Целевой доход</strong> — рассчитаем сценарии достижения</div></div>' +
      '</div>';
  }
}

/* ============ CAPTURE SCREEN (enriched) ============ */
function renderCapturePreview() {
  var a = getAllAnswers();
  var m = calculate(a);

  // Title
  var el = document.getElementById('capture-name');
  if (el) el.textContent = (a.name || '') + ', ваш персональный план роста готов';

  // Personalized hook
  var hookEl = document.getElementById('capture-hook');
  if (hookEl) {
    var hookText = '';
    if (m.hourlyRate < 1500 && m.lostPotential > 0) {
      hookText = 'При вашей ставке <strong>' + formatMoney(m.hourlyRate) + ' ₽/ч</strong> и <strong>' + m.clients + '</strong> клиентах ваш потенциал роста дохода — <strong>+' + formatMoney(m.lostPotential) + ' ₽/мес</strong>. Полный отчёт покажет, как этого достичь.';
    } else {
      hookText = 'При <strong>' + m.clients + '</strong> клиентах и доходе <strong>' + formatMoneyShort(m.currentIncome) + '/мес</strong> у вас сильная позиция. Полный отчёт покажет, как выйти на <strong>' + formatMoneyShort(m.targetIncome) + '/мес</strong>.';
    }
    hookEl.innerHTML = hookText;
  }

  // Visual gauge preview (2 visible + locked)
  var gaugesEl = document.getElementById('capture-gauges');
  if (gaugesEl) {
    var rateColor = m.rateEfficiency >= 70 ? 'green' : m.rateEfficiency >= 40 ? 'yellow' : 'red';
    var portColor = m.portfolioStability >= 70 ? 'green' : m.portfolioStability >= 40 ? 'yellow' : 'red';

    var autoColor = m.automationLevel >= 70 ? 'green' : m.automationLevel >= 40 ? 'yellow' : 'red';

    gaugesEl.innerHTML =
      '<div class="capture-gauge-item">' +
        '<div class="cg-header"><span class="cg-title">Эффективность ставки</span><span class="cg-value">' + m.rateEfficiency + '%</span></div>' +
        '<div class="cg-bar"><div class="cg-fill ' + rateColor + '" style="width:' + m.rateEfficiency + '%"></div></div>' +
      '</div>' +
      '<div class="capture-gauge-item">' +
        '<div class="cg-header"><span class="cg-title">Устойчивость портфеля</span><span class="cg-value">' + m.portfolioStability + '%</span></div>' +
        '<div class="cg-bar"><div class="cg-fill ' + portColor + '" style="width:' + m.portfolioStability + '%"></div></div>' +
      '</div>' +
      '<div class="capture-gauge-item" style="opacity:0.4">' +
        '<div class="cg-header"><span class="cg-title">🔒 Автоматизация</span><span class="cg-value" style="filter:blur(4px)">' + m.automationLevel + '%</span></div>' +
        '<div class="cg-bar"><div class="cg-fill ' + autoColor + '" style="width:' + m.automationLevel + '%;filter:blur(3px)"></div></div>' +
      '</div>' +
      '<div class="capture-gauge-item" style="opacity:0.35">' +
        '<div class="cg-header"><span class="cg-title">🔒 Масштабируемость</span><span class="cg-value" style="filter:blur(4px)">—</span></div>' +
        '<div class="cg-bar"><div class="cg-fill blue" style="width:55%;filter:blur(3px)"></div></div>' +
      '</div>' +
      '<div class="capture-gauge-item" style="opacity:0.3">' +
        '<div class="cg-header"><span class="cg-title">🔒 Предсказуемость потока</span><span class="cg-value" style="filter:blur(4px)">—</span></div>' +
        '<div class="cg-bar"><div class="cg-fill yellow" style="width:40%;filter:blur(3px)"></div></div>' +
      '</div>';
  }

  // Personalize FinTablo value line
  var ftLine = document.getElementById('capture-value-fintablo');
  if (ftLine && m.scenarioB_bonus > 0) {
    ftLine.textContent = 'Расчёт: +' + formatMoney(2 * m.checkMid) + ' ₽/мес дополнительно через партнёрскую программу Финтабло';
  }
}

/* ============ PHONE FORMATTING + CONSENT ============ */
function formatPhone(input) {
  var val = input.value.replace(/\D/g, '');
  if (val.startsWith('7') || val.startsWith('8')) val = val.slice(1);
  var formatted = '+7 ';
  if (val.length > 0) formatted += '(' + val.substring(0, 3);
  if (val.length >= 4) formatted += ') ' + val.substring(3, 6);
  if (val.length >= 7) formatted += '-' + val.substring(6, 8);
  if (val.length >= 9) formatted += '-' + val.substring(8, 10);
  input.value = formatted;
  updateSubmitButton();
}

function updateSubmitButton() {
  var phoneVal = (document.getElementById('phone').value || '').replace(/\D/g, '');
  var phoneValid = phoneVal.length === 11 || (phoneVal.length === 10 && !phoneVal.startsWith('7') && !phoneVal.startsWith('8'));
  // Accept 10 digits (without leading 7/8) or 11 digits (with)
  var rawDigits = document.getElementById('phone').value.replace(/\D/g, '');
  if (rawDigits.startsWith('7') || rawDigits.startsWith('8')) rawDigits = rawDigits.slice(1);
  var isPhoneValid = rawDigits.length === 10;

  var consentEl = document.getElementById('consent-pd');
  var isConsent = consentEl ? consentEl.checked : true;

  var submitBtn = document.getElementById('btn-submit-lead');
  if (submitBtn) submitBtn.disabled = !(isPhoneValid && isConsent);
}

/* ============ HELPERS ============ */
function declension(n, one, two, five) {
  var abs = Math.abs(n) % 100;
  var n1 = abs % 10;
  if (abs > 10 && abs < 20) return five;
  if (n1 > 1 && n1 < 5) return two;
  if (n1 === 1) return one;
  return five;
}

function updateStepNames() {
  var name = getName();
  ['q2-name', 'q3-name', 'q4-name', 'q6-name', 'q10-name'].forEach(function(id) {
    var el = document.getElementById(id);
    if (el) el.textContent = name;
  });
}

function updateSliderBadge(badgeId, value, thresholds, labels, colors) {
  var badge = document.getElementById(badgeId);
  if (!badge) return;
  var idx = 0;
  for (var i = 0; i < thresholds.length; i++) {
    if (value >= thresholds[i]) idx = i + 1;
  }
  badge.textContent = labels[idx];
  badge.className = 'rate-badge ' + colors[idx];
}

function setMetricSub(elId, value, thresholds, labels, colors) {
  var el = document.getElementById(elId);
  if (!el) return;
  var idx = 0;
  for (var i = 0; i < thresholds.length; i++) {
    if (value >= thresholds[i]) idx = i + 1;
  }
  el.textContent = labels[idx];
  el.className = 'metric-sub ' + colors[idx];
}

/* ============ STATE RESTORATION (back navigation) ============ */
function restoreStepState(step) {
  var a = getAllAnswers();

  if (step === 1 && a.name) {
    var nameInput = document.getElementById('name-input');
    if (nameInput && !nameInput.value) nameInput.value = a.name;
  }

  if (step === 2 && a.experience) {
    document.querySelectorAll('#step-2 .option-card').forEach(function(c) {
      var onclick = c.getAttribute('onclick') || '';
      if (onclick.indexOf(a.experience) >= 0) c.classList.add('selected');
    });
  }

  if (step === 3 && a.workFormat) {
    document.querySelectorAll('#step-3 .option-card').forEach(function(c) {
      var onclick = c.getAttribute('onclick') || '';
      if (onclick.indexOf(a.workFormat) >= 0) c.classList.add('selected');
    });
  }

  // Sliders: only restore and run onChange if user previously saved a value
  if (step === 4 && a.clients !== undefined) {
    var cSlider = document.getElementById('clients-slider');
    if (cSlider) { cSlider.value = a.clients; onClientsChange(cSlider); }
  }

  if (step === 5 && a.avgCheckRange) {
    document.querySelectorAll('#step-5 .option-card').forEach(function(c) {
      var onclick = c.getAttribute('onclick') || '';
      if (onclick.indexOf(a.avgCheckRange) >= 0) c.classList.add('selected');
    });
  }

  if (step === 6 && a.hoursPerClient !== undefined) {
    var hSlider = document.getElementById('hours-slider');
    if (hSlider) { hSlider.value = a.hoursPerClient; onHoursChange(hSlider); }
  }

  if (step === 7 && a.manualWorkPct !== undefined) {
    var mSlider = document.getElementById('manual-slider');
    if (mSlider) { mSlider.value = a.manualWorkPct; onManualChange(mSlider); }
  }

  if (step === 8 && a.clientSources && a.clientSources.length > 0) {
    document.querySelectorAll('#step-8 .option-card').forEach(function(c) {
      var onclick = c.getAttribute('onclick') || '';
      a.clientSources.forEach(function(src) {
        if (onclick.indexOf(src) >= 0) c.classList.add('selected');
      });
    });
  }

  if (step === 9 && a.barriers && a.barriers.length > 0) {
    var barCards = document.querySelectorAll('#step-9 .option-card');
    barCards.forEach(function(c) {
      var onclick = c.getAttribute('onclick') || '';
      a.barriers.forEach(function(b) {
        if (onclick.indexOf(b) >= 0) c.classList.add('selected');
      });
    });
    if (a.barriers.length >= 2) {
      barCards.forEach(function(c) {
        if (!c.classList.contains('selected')) c.classList.add('disabled');
      });
    }
  }

  if (step === 10 && a.targetIncome !== undefined) {
    var tSlider = document.getElementById('target-slider');
    if (tSlider) { tSlider.value = a.targetIncome; onTargetChange(tSlider); }
  }
}

/* ============ BEFOREUNLOAD ============ */
var isNavigatingAway = false;
window.addEventListener('beforeunload', function(e) {
  if (currentStep >= 4 && !isNavigatingAway) {
    e.preventDefault();
    e.returnValue = '';
  }
});

/* ============ INIT ============ */
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

  // Check if returning from report preview to fill contact form
  var params = new URLSearchParams(window.location.search);
  if (params.get('go') === 'capture' && getAllAnswers().name) {
    goToStep(11);
  } else {
    goToStep(0);
  }
});

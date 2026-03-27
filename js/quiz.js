var currentStep = 0;
var totalSteps = 11; // 0=start, 1-9=questions, 10=capture, plus intermediate=5.5

var INSIGHTS = {
  status: {
    'В найме (рассматриваю фриланс)': '73% финансистов, планирующих уйти во фриланс, откладывают переход на 1–2 года. Чаще всего не из-за отсутствия навыков, а из-за отсутствия модели, гарантирующей замену дохода в первые 3 месяца.',
    'Фриланс/аутсорс до 1 года': 'Первый год — statistically самый сложный: 68% фрилансеров-финансистов зарабатывают меньше ожиданий. Не из-за некомпетентности — из-за неправильной модели монетизации опыта.',
    'Фриланс/аутсорс 1–3 года': 'Период "функционального плато": клиенты есть, навыков достаточно, но доход не растёт пропорционально усилиям. Причина в 90% случаев — не в качестве работы, а в модели ценообразования и источниках клиентов.',
    'Фриланс/аутсорс более 3 лет': 'Три года фриланса — это уже "маленький бизнес". Но большинство финансистов с таким опытом застревают на одном и том же доходе. Причина — в структуре практики, а не в количестве клиентов.'
  },
  clients: function(n) {
    if (n <= 1) return 'Первый клиент — самый трудный психологически. Статистика: финансисты с опытом 3+ лет находят первого клиента через правильный канал в среднем за 3–5 недель. Ключевое слово — "правильный канал".';
    if (n <= 3) return '2–3 клиента — зона финансовой уязвимости: уход одного клиента = падение дохода на 33–50%. Устойчивый минимум начинается с 4–5 клиентов с разными сроками договоров.';
    if (n <= 6) return 'Работающая база. На этом уровне вопрос меняется: не "как найти клиентов", а "как обслуживать больше без пропорционального роста нагрузки". Это про автоматизацию, а не про усилие.';
    if (n <= 10) return 'Серьёзный портфель. При 7+ клиентах без систематизации неизбежно выгорание. Главные вопросы: какие клиенты дают лучший ROI вашего времени, и как повысить средний чек без потери текущих.';
    return 'Масштаб. На этом уровне единственный путь к росту дохода — не "больше клиентов", а "дороже каждый клиент" и "меньше времени на каждого". Нужна глубокая автоматизация и команда.';
  },
  avgCheck: {
    'До 20 000 ₽': '20 000 ₽ — это чек бухгалтера на удалёнке, не CFO-консультанта. Финансисты с аналогичным опытом, переупаковавшие оффер под конкретный результат для бизнеса, выходят на 40–60к с теми же задачами. Разница — в формулировке ценности, не в объёме работы.',
    '20 000 – 40 000 ₽': 'Самый распространённый диапазон (42% финансистов-фрилансеров). Хорошая новость: переход с 30–35к на 55–60к часто не требует новых клиентов — только переупаковки оффера под измеримый результат для бизнеса и разговора о повышении с текущими.',
    '40 000 – 70 000 ₽': 'Верхняя треть рынка. Вы уже монетизируете CFO-экспертизу. На этом уровне главный вопрос — как перейти за черту 100к с одного клиента, не теряя существующих.',
    '70 000 – 100 000 ₽': 'Топ-сегмент аутсорс-CFO. Вы продаёте стратегическую ценность, а не часы. Дальнейший рост — через расширение модели: ретейнеры на год вперёд, доля в росте результата клиента.',
    'Более 100 000 ₽': 'CFO-партнёр уровня крупного бизнеса. Здесь масштаб — через делегирование операционного учёта и фокус на стратегических решениях. Или через упаковку собственной методологии в продукт.'
  },
  hourlyRate: function(rate) {
    if (rate < 500) return 'Тревожный сигнал. Хороший бухгалтер на фрилансе берёт 600–800 ₽/ч. Финансовый директор с вашим опытом должен стоить 1 500–3 000 ₽/ч. Разрыв — это стоимость неправильного позиционирования.';
    if (rate < 1000) return 'Средний рынок для финансовых специалистов уровня "просто делаю учёт". При переходе к позиционированию "CFO-результат" ставка вырастает до 1 500–2 500 ₽/ч с теми же клиентами.';
    if (rate < 2000) return 'Хорошая ставка. Вы уже в зоне CFO-консалтинга. Главный вопрос следующего уровня: как снизить количество часов на клиента через автоматизацию, сохраняя или повышая чек.';
    return 'Топовая ставка — вы монетизируете стратегическую ценность, а не время. Риск на этом уровне: если клиент видит много "времени" — он начнёт торговаться. Ключ — billing by outcome, не by hour.';
  },
  manualWork: function(pct, hours, clients) {
    var totalH = hours * clients;
    if (pct < 25) return 'Отличная автоматизация — вы уже в топ-20% по этому показателю. У большинства финансистов с аналогичным портфелем этот показатель 50–70%.';
    if (pct < 45) return 'Умеренная рутинность. Каждые 10% снижения рутины при ' + clients + ' клиентах = +' + Math.round(totalH * 0.1) + ' свободных часов в месяц. Это время на нового клиента или на повышение ценности для текущих.';
    if (pct < 65) return 'Половина вашего рабочего времени — это операционная рутина, за которую клиент платит как за CFO-экспертизу. Вы теряете ' + Math.round(totalH * 0.55 - totalH * 0.20) + ' часов в месяц, которые могли бы идти на стратегическую работу или развитие.';
    return 'Критическая рутинность. При таком соотношении каждый новый клиент = ещё +' + hours + ' часов рутины в месяц. Масштабироваться без изменения инструментов невозможно — это математически верный тупик.';
  },
  sources: function(sources) {
    if (sources.includes('Пока клиентов нет / ищу первых')) return 'Это самая честная точка старта. Первый клиент за сарафан занимает в среднем 2–4 месяца. Через правильный партнёрский канал — 3–6 недель. Выбор источника определяет скорость старта.';
    if (sources.some(function(s) { return s.includes('Партнёрские'); })) return 'Партнёрский канал — единственный, который можно "включить" в нужный момент и получить квалифицированный поток. Вы уже понимаете эту логику — это ценно.';
    if (sources.length >= 2) return 'Хорошая диверсификация. Вопрос не в количестве каналов, а в их качестве: какой из них даёт клиентов с лучшим соотношением чека и трудозатрат?';
    if (sources.length === 1 && sources[0].includes('Сарафан')) return 'Сарафан — это "успех прошлого": он работает на репутации того, что вы уже сделали. Проблема — он не масштабируется: вы не можете "нажать кнопку" и получить больше заявок в нужный момент. 80% финансистов с нестабильным доходом зависят только от этого канала.';
    return 'Один канал = одна точка отказа. Если он просядет — пустой месяц неизбежен. Финансисты с доходом 300к+ в среднем используют 2–3 независимых источника клиентов.';
  },
  barriers: {
    'Нет стабильного потока новых клиентов': 'Это барьер №1 у 71% финансистов-фрилансеров. Ключевое наблюдение: финансисты, работающие через партнёрские каналы с готовым потоком лидов, тратят на поиск клиентов в 4 раза меньше времени, чем те, кто полагается только на сарафан.',
    'Не умею / не хочу активно продавать': 'Финансисты редко "продают" — они диагностируют. Разница в подходе: не "я предлагаю услугу управленческого учёта", а "ваш бизнес теряет [конкретную сумму] ежемесячно — давайте я покажу где". Это разговор на языке владельца.',
    'Перегружен — некогда заниматься развитием': 'Paradox of success в чистом виде: вы заняты, но не богаты. Математика простая: если 60% времени — рутина, то рост дохода заблокирован. Выход — не в "больше работать", а в автоматизации операционного ядра.',
    'Не знаю, как повысить чек без потери клиентов': 'Самый распространённый страх без реальных оснований. 80% клиентов финансистов-фрилансеров не меняются при повышении чека на 20–30%, если повышение обосновано дополнительной ценностью.',
    'Много рутины — нет времени на рост': 'При >50% рутины вы физически не можете брать больше клиентов без выгорания. Это не проблема дисциплины — это системная проблема инструментов. Автоматизация 30% рутины = возможность взять ещё 1–2 клиентов без роста часов.',
    'Нет кейсов и портфолио под NDA': 'NDA — реальное ограничение. Но кейсы без имени работают так же хорошо: "помог проектной компании выявить убыточные контракты — сэкономили 2,3 млн в год" убеждает лучше, чем "ООО Ромашка". Нужна правильная упаковка.',
    'Одиночество — не к кому обратиться': 'Это не "мягкая" боль — это реальный профессиональный риск. Финансист без экспертного сообщества принимает сложные решения в условиях информационной изоляции. Это влияет и на качество работы, и на психологическое состояние.',
    'Страх потерять стабильный доход': 'Самый честный барьер из всех. Хорошая новость: партнёрская модель позволяет наращивать доход параллельно с текущим источником — без разрыва, без "прыжка в пропасть".'
  },
  incomeGap: function(gap) {
    if (gap < 50000) return 'Вы в шаге от цели. Небольшие точечные изменения — повышение чека у 1–2 клиентов или добавление одного нового — закроют этот разрыв за 1–2 месяца.';
    if (gap < 150000) return 'Достижимо за 3–5 месяцев при правильной стратегии. Обычно это комбинация: +1 клиент через партнёрский канал + повышение чека у текущих на 15–20%.';
    if (gap < 300000) return 'Требует изменения модели, а не просто "больше клиентов". Переход к такому доходу обычно занимает 4–7 месяцев при наличии правильного потока и инструментов.';
    return 'Трансформация практики. Такой скачок — это смена типа работы: от "делаю учёт" к "управляю финансами как CFO-партнёр". Достижимо, но требует системного плана.';
  }
};

function getCurrentStep() { return currentStep; }

function getName() {
  return getAllAnswers().name || '';
}

function updateProgress() {
  var wrapper = document.querySelector('.progress-wrapper');
  var fill = document.querySelector('.progress-fill');
  var label = document.querySelector('.progress-label');

  if (currentStep === 0) {
    wrapper.classList.remove('visible');
    return;
  }

  wrapper.classList.add('visible');

  // Map step IDs to sequential positions for progress
  var stepPositions = {1:1, 2:2, 3:3, 4:4, 5:5, 55:6, 6:7, 7:8, 8:9, 9:10, 10:11};
  var pos = stepPositions[currentStep] || 1;

  var pct = Math.min(100, Math.round((pos / 11) * 100));
  fill.style.width = pct + '%';

  if (pos >= 10) {
    label.textContent = 'Почти готово';
  } else if (currentStep === 55) {
    label.textContent = 'Промежуточный результат';
  } else {
    label.textContent = 'Шаг ' + Math.min(currentStep, 9);
  }
}

function goToStep(step) {
  var activeEl = document.querySelector('.step.active');
  var targetEl = document.getElementById('step-' + step);

  if (!targetEl) return;

  if (activeEl) {
    activeEl.classList.remove('active');
    activeEl.classList.add('leaving');
    setTimeout(function() {
      activeEl.classList.remove('leaving');
    }, 220);
  }

  setTimeout(function() {
    targetEl.classList.add('active');
  }, activeEl ? 50 : 0);

  currentStep = step;
  updateProgress();
  updateNavButtons();
  window.scrollTo(0, 0);
}

function updateNavButtons() {
  var nav = document.querySelector('.step-nav');
  var backBtn = document.getElementById('btn-back');
  var nextBtn = document.getElementById('btn-next');

  if (currentStep === 0) {
    nav.style.display = 'none';
    return;
  }

  nav.style.display = 'block';
  backBtn.style.display = currentStep >= 2 ? 'flex' : 'none';

  // Steps where next is managed differently
  if (currentStep === 10) { // capture screen
    nextBtn.style.display = 'none';
  } else {
    nextBtn.style.display = 'block';
    nextBtn.disabled = !isStepValid(currentStep);
  }

  if (currentStep >= 9) {
    nextBtn.textContent = 'Далее →';
  } else if (currentStep === 55) { // intermediate
    nextBtn.textContent = 'Продолжить → Блок 2: Что мешает расти';
  } else {
    nextBtn.textContent = 'Далее →';
  }
}

function isStepValid(step) {
  var answers = getAllAnswers();
  switch (step) {
    case 1: return answers.name && answers.name.trim().length >= 2 && !/\d/.test(answers.name);
    case 2: return answers.experience && answers.status;
    case 3: return answers.clients !== undefined;
    case 4: return !!answers.avgCheckRange;
    case 5: return answers.hoursPerClient !== undefined;
    case 55: return true; // intermediate
    case 6: return answers.manualWorkPct !== undefined;
    case 7: return answers.clientSources && answers.clientSources.length > 0;
    case 8: return answers.barriers && answers.barriers.length >= 1 && answers.barriers.length <= 2;
    case 9: return answers.targetIncome !== undefined;
    default: return true;
  }
}

function nextStep() {
  if (!isStepValid(currentStep)) return;

  var order = [0, 1, 2, 3, 4, 5, 55, 6, 7, 8, 9, 10];
  var idx = order.indexOf(currentStep);
  if (idx < order.length - 1) {
    goToStep(order[idx + 1]);
  }
}

function prevStep() {
  var order = [0, 1, 2, 3, 4, 5, 55, 6, 7, 8, 9, 10];
  var idx = order.indexOf(currentStep);
  if (idx > 0) {
    goToStep(order[idx - 1]);
  }
}

function startQuiz() {
  goToStep(1);
}

function showInsight(containerId, text) {
  var el = document.getElementById(containerId);
  if (!el) return;
  el.innerHTML = '<div class="insight-box">' + text + '</div>';
}

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

// Step 2 — Experience & Status
function selectOption(group, value, el) {
  var cards = el.parentElement.querySelectorAll('.option-card');
  cards.forEach(function(c) { c.classList.remove('selected'); });
  el.classList.add('selected');
  saveAnswer(group, value);

  if (group === 'status' && INSIGHTS.status[value]) {
    showInsight('insight-2', INSIGHTS.status[value]);
  }

  document.getElementById('btn-next').disabled = !isStepValid(currentStep);
}

// Step 3 — Clients slider
function onClientsChange(input) {
  var val = parseInt(input.value);
  saveAnswer('clients', val);
  document.getElementById('clients-value').textContent = val >= 15 ? '15+' : val;
  document.getElementById('clients-label').textContent = declension(val, 'клиент', 'клиента', 'клиентов');
  input.style.setProperty('--pct', ((val / 15) * 100) + '%');
  showInsight('insight-3', INSIGHTS.clients(val));
  document.getElementById('btn-next').disabled = false;
}

// Step 4 — Avg check
function selectCheck(value, el) {
  var cards = document.querySelectorAll('#step-4 .option-card');
  cards.forEach(function(c) { c.classList.remove('selected'); });
  el.classList.add('selected');
  saveAnswer('avgCheckRange', value);
  saveAnswer('avgCheckMid', CHECK_MIDS[value]);
  showInsight('insight-4', INSIGHTS.avgCheck[value]);
  document.getElementById('btn-next').disabled = false;
}

// Step 5 — Hours per client
function onHoursChange(input) {
  var val = parseInt(input.value);
  saveAnswer('hoursPerClient', val);
  document.getElementById('hours-value').textContent = val;

  var answers = getAllAnswers();
  var checkMid = CHECK_MIDS[answers.avgCheckRange] || 35000;
  var rate = Math.round(checkMid / val);
  document.getElementById('rate-display').textContent = formatMoney(rate) + ' ₽/час';

  var badge = document.getElementById('rate-badge');
  if (rate >= 2000) { badge.textContent = 'Топ-сегмент'; badge.className = 'rate-badge green'; }
  else if (rate >= 1000) { badge.textContent = 'Хороший уровень'; badge.className = 'rate-badge blue'; }
  else if (rate >= 500) { badge.textContent = 'Есть куда расти'; badge.className = 'rate-badge yellow'; }
  else { badge.textContent = 'Ниже рынка'; badge.className = 'rate-badge red'; }

  input.style.setProperty('--pct', (((val - 4) / 76) * 100) + '%');
  showInsight('insight-5', INSIGHTS.hourlyRate(rate));
  document.getElementById('btn-next').disabled = false;
}

// Intermediate screen
function renderIntermediate() {
  var a = getAllAnswers();
  var checkMid = CHECK_MIDS[a.avgCheckRange] || 35000;
  var income = a.clients * checkMid;
  var rate = Math.round(checkMid / (a.hoursPerClient || 15));
  var totalH = a.clients * (a.hoursPerClient || 15);

  document.getElementById('inter-name').textContent = a.name || '';
  document.getElementById('inter-clients').textContent = a.clients;
  document.getElementById('inter-income').textContent = formatMoney(income) + ' ₽/мес';
  document.getElementById('inter-rate').textContent = formatMoney(rate) + ' ₽/ч';
  document.getElementById('inter-hours').textContent = totalH + ' ч/мес';

  // Color coding
  var incomeEl = document.getElementById('inter-income-sub');
  if (income < 100000) { incomeEl.textContent = 'Ниже 100к'; incomeEl.className = 'metric-sub red'; }
  else if (income < 250000) { incomeEl.textContent = 'Средний уровень'; incomeEl.className = 'metric-sub yellow'; }
  else { incomeEl.textContent = 'Хороший уровень'; incomeEl.className = 'metric-sub green'; }

  var rateEl = document.getElementById('inter-rate-sub');
  if (rate < 500) { rateEl.textContent = 'Ниже рынка'; rateEl.className = 'metric-sub red'; }
  else if (rate < 1200) { rateEl.textContent = 'Есть потенциал'; rateEl.className = 'metric-sub yellow'; }
  else { rateEl.textContent = 'Топ-уровень'; rateEl.className = 'metric-sub green'; }

  var hoursEl = document.getElementById('inter-hours-sub');
  if (totalH > 120) { hoursEl.textContent = 'Высокая нагрузка'; hoursEl.className = 'metric-sub red'; }
  else if (totalH > 80) { hoursEl.textContent = 'Умеренно'; hoursEl.className = 'metric-sub yellow'; }
  else { hoursEl.textContent = 'Комфортно'; hoursEl.className = 'metric-sub green'; }

  // Insight
  var insightText;
  if (rate < 500 && a.clients > 5) {
    insightText = 'Тревожная комбинация: много работы, низкая ставка. Рост через "ещё больше клиентов" приведёт к выгоранию за 6–12 месяцев. Нужна другая модель, не другие клиенты.';
  } else if (income < 100000) {
    insightText = 'Ваша практика сейчас работает в зоне выживания — дохода едва хватает на замену найма. Это не проблема навыков: финансисты с вашим опытом, изменившие модель работы, выходят на 200–250к за 3–4 месяца.';
  } else if (income < 180000) {
    insightText = 'Вы перешли психологический барьер "я зарабатываю как в найме". Но ' + formatMoneyShort(income) + ' — это ловушка: кажется, что всё нормально, но рост требует непропорционального роста нагрузки. Здесь большинство застревает на годы.';
  } else if (income < 280000) {
    insightText = 'Верхняя треть рынка. Вы уже доказали, что модель работает. Следующий уровень — 350–450к — требует не "больше клиентов", а другой структуры: другие чеки, другая автоматизация, другие каналы.';
  } else {
    insightText = 'Сильная позиция. При таком доходе главный риск — концентрация: 1–2 крупных клиента могут держать вас в заложниках. Диверсификация и автоматизация — ключи к следующему уровню.';
  }
  document.getElementById('inter-insight').textContent = a.name + ', вот что диагностика уже знает: ' + insightText;
}

// Step 6 — Manual work %
function onManualChange(input) {
  var val = parseInt(input.value);
  saveAnswer('manualWorkPct', val);
  document.getElementById('manual-value').textContent = val + '%';

  var a = getAllAnswers();
  var totalH = (a.clients || 0) * (a.hoursPerClient || 15);
  var routineH = Math.round(totalH * val / 100);
  document.getElementById('manual-hours').textContent = routineH + ' ч/мес уходит на рутину, которую можно автоматизировать';

  input.style.setProperty('--pct', val + '%');

  // Color indicator
  var fill = document.getElementById('manual-color-fill');
  if (val < 25) { fill.style.background = '#10B981'; }
  else if (val < 45) { fill.style.background = '#F59E0B'; }
  else if (val < 65) { fill.style.background = '#F97316'; }
  else { fill.style.background = '#EF4444'; }
  fill.style.width = val + '%';

  showInsight('insight-6', INSIGHTS.manualWork(val, a.hoursPerClient || 15, a.clients || 0));
  document.getElementById('btn-next').disabled = false;
}

// Step 7 — Sources (multi-select)
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
  if (sources.length > 0) {
    showInsight('insight-7', INSIGHTS.sources(sources));
  }
  document.getElementById('btn-next').disabled = sources.length === 0;
}

// Step 8 — Barriers (multi-select, max 2)
function toggleBarrier(value, el) {
  var a = getAllAnswers();
  var barriers = a.barriers || [];
  var idx = barriers.indexOf(value);

  if (idx >= 0) {
    barriers.splice(idx, 1);
    el.classList.remove('selected');
  } else {
    if (barriers.length >= 2) return; // max 2
    barriers.push(value);
    el.classList.add('selected');
  }

  saveAnswer('barriers', barriers);

  // Disable unselected if 2 selected
  var cards = document.querySelectorAll('#step-8 .option-card');
  cards.forEach(function(c) {
    if (!c.classList.contains('selected') && barriers.length >= 2) {
      c.classList.add('disabled');
    } else {
      c.classList.remove('disabled');
    }
  });

  if (barriers.length > 0) {
    showInsight('insight-8', INSIGHTS.barriers[barriers[0]] || '');
  }
  document.getElementById('btn-next').disabled = barriers.length === 0;
}

// Step 9 — Target income slider
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
  showInsight('insight-9', INSIGHTS.incomeGap(gap));
  document.getElementById('btn-next').disabled = false;
}

// Capture screen
function renderCapturePreview() {
  var a = getAllAnswers();
  var m = calculate(a);

  document.getElementById('capture-name').textContent = a.name + ', ваш персональный план готов';
  document.getElementById('preview-rate').textContent = formatMoney(m.hourlyRate) + ' ₽/час';
  document.getElementById('preview-type').textContent = m.practiceType;
  document.getElementById('preview-barrier').textContent = (a.barriers && a.barriers[0]) || '—';
  document.getElementById('preview-growth').textContent = '+' + m.checkGrowthPct + '%';
}

// Phone formatting
function formatPhone(input) {
  var val = input.value.replace(/\D/g, '');
  if (val.startsWith('7') || val.startsWith('8')) val = val.slice(1);
  var formatted = '+7 ';
  if (val.length > 0) formatted += '(' + val.substring(0, 3);
  if (val.length >= 4) formatted += ') ' + val.substring(3, 6);
  if (val.length >= 7) formatted += '-' + val.substring(6, 8);
  if (val.length >= 9) formatted += '-' + val.substring(8, 10);
  input.value = formatted;
  var isValid = val.length === 10;
  var submitBtn = document.getElementById('btn-submit-lead');
  if (submitBtn) submitBtn.disabled = !isValid;
}

// Helpers
function declension(n, one, two, five) {
  var abs = Math.abs(n) % 100;
  var n1 = abs % 10;
  if (abs > 10 && abs < 20) return five;
  if (n1 > 1 && n1 < 5) return two;
  if (n1 === 1) return one;
  return five;
}

// Step rendering with names
function updateStepNames() {
  var name = getName();
  var el2 = document.getElementById('q2-name');
  if (el2) el2.textContent = name;
}

// beforeunload
window.addEventListener('beforeunload', function(e) {
  if (currentStep >= 3) {
    e.preventDefault();
    e.returnValue = 'Вы прошли ' + currentStep + ' шагов. Результаты уже рассчитываются — вернитесь, чтобы получить план!';
  }
});

// Logo fallback
document.addEventListener('DOMContentLoaded', function() {
  var logoImg = document.querySelector('.logo img');
  if (logoImg) {
    logoImg.onerror = function() {
      this.style.display = 'none';
      var fallback = this.parentElement.querySelector('.logo-fallback');
      if (fallback) fallback.style.display = 'block';
    };
  }

  goToStep(0);
});

// Override goToStep to handle special cases
var _origGoToStep = goToStep;
goToStep = function(step) {
  _origGoToStep(step);

  if (step === 55) renderIntermediate();
  if (step === 10) renderCapturePreview();
  if (step >= 2) updateStepNames();

  // Restore saved selections on back
  if (step >= 1) restoreStepState(step);
};

function restoreStepState(step) {
  var a = getAllAnswers();

  if (step === 1 && a.name) {
    var nameInput = document.getElementById('name-input');
    if (nameInput) nameInput.value = a.name;
  }

  if (step === 2) {
    if (a.experience) {
      var expCards = document.querySelectorAll('#step-2 .options-group:first-of-type .option-card');
      expCards.forEach(function(c) { if (c.textContent.trim() === a.experience) c.classList.add('selected'); });
    }
    if (a.status) {
      var statCards = document.querySelectorAll('#step-2 .options-group:last-of-type .option-card');
      statCards.forEach(function(c) { if (c.textContent.trim() === a.status) c.classList.add('selected'); });
    }
  }

  if (step === 3) {
    var slider = document.getElementById('clients-slider');
    if (slider) {
      if (a.clients !== undefined) slider.value = a.clients;
      onClientsChange(slider);
    }
  }

  if (step === 4 && a.avgCheckRange) {
    var checkCards = document.querySelectorAll('#step-4 .option-card');
    checkCards.forEach(function(c) { if (c.textContent.trim() === a.avgCheckRange) c.classList.add('selected'); });
  }

  if (step === 5) {
    var hSlider = document.getElementById('hours-slider');
    if (hSlider) {
      if (a.hoursPerClient !== undefined) hSlider.value = a.hoursPerClient;
      onHoursChange(hSlider);
    }
  }

  if (step === 6) {
    var mSlider = document.getElementById('manual-slider');
    if (mSlider) {
      if (a.manualWorkPct !== undefined) mSlider.value = a.manualWorkPct;
      onManualChange(mSlider);
    }
  }

  if (step === 7 && a.clientSources && a.clientSources.length > 0) {
    var srcCards = document.querySelectorAll('#step-7 .option-card');
    srcCards.forEach(function(c) {
      var onclick = c.getAttribute('onclick') || '';
      a.clientSources.forEach(function(src) {
        if (onclick.includes(src)) c.classList.add('selected');
      });
    });
  }

  if (step === 8 && a.barriers && a.barriers.length > 0) {
    var barCards = document.querySelectorAll('#step-8 .option-card');
    barCards.forEach(function(c) {
      var onclick = c.getAttribute('onclick') || '';
      a.barriers.forEach(function(b) {
        if (onclick.includes(b)) c.classList.add('selected');
      });
    });
    // Disable unselected if 2 selected
    if (a.barriers.length >= 2) {
      barCards.forEach(function(c) {
        if (!c.classList.contains('selected')) c.classList.add('disabled');
      });
    }
  }

  if (step === 9) {
    var tSlider = document.getElementById('target-slider');
    if (tSlider) {
      if (a.targetIncome !== undefined) tSlider.value = a.targetIncome;
      onTargetChange(tSlider);
    }
  }
}

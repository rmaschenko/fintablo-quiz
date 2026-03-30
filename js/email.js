/* ===== Lead handling ===== */
/* mailto removed. Leads go to localStorage.
   AmoCRM integration: add webhook POST here when ready. */

function submitLead() {
  var phone = document.getElementById('phone').value;
  var email = document.getElementById('email').value;
  var wantExpert = document.getElementById('want-expert').checked;

  var answers = getAllAnswers();
  var metrics = calculate(answers);

  // Clear preview flag and enrich with computed metrics
  delete answers.skippedContact;
  answers.currentIncome = metrics.currentIncome;
  answers.hourlyRate = metrics.hourlyRate;
  answers.practiceType = metrics.practiceType;
  answers.incomeGap = metrics.incomeGap;
  answers.checkGrowthPct = metrics.checkGrowthPct;

  var contact = { phone: phone, email: email, wantExpert: wantExpert };
  var leadData = {};
  for (var k in answers) { leadData[k] = answers[k]; }
  for (var j in contact) { leadData[j] = contact[j]; }

  // Save locally
  saveLead(leadData);

  // Save enriched answers back so report.html can use them
  localStorage.setItem(QUIZ_KEY, JSON.stringify(answers));

  // Yandex.Metrika goal
  if (typeof ym === 'function') {
    ym(61131877, 'reachGoal', 'lead_submitted', {
      practiceType: metrics.practiceType,
      currentIncome: metrics.currentIncome,
      hourlyRate: metrics.hourlyRate
    });
  }

  /* === AmoCRM webhook (uncomment when ready) ===
  fetch('YOUR_AMOCRM_WEBHOOK_URL', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: answers.name,
      phone: phone,
      email: email,
      wantExpert: wantExpert,
      // Quiz data
      experience: answers.experience,
      status: answers.workFormat,
      clients: answers.clients,
      avgCheck: answers.avgCheckRange,
      hoursPerClient: answers.hoursPerClient,
      manualWorkPct: answers.manualWorkPct,
      clientSources: (answers.clientSources || []).join(', '),
      barriers: (answers.barriers || []).join(', '),
      targetIncome: answers.targetIncome,
      // Computed
      currentIncome: metrics.currentIncome,
      hourlyRate: metrics.hourlyRate,
      practiceType: metrics.practiceType,
      incomeGap: metrics.incomeGap,
      // UTM
      utm: getUtmParams(),
      referrer: document.referrer,
      pageUrl: window.location.href
    })
  }).catch(function() {});
  === */

  // Redirect to report (full version, not preview)
  if (typeof isNavigatingAway !== 'undefined') isNavigatingAway = true;
  window.location.href = 'report.html';
}

function showReportPreview() {
  var answers = getAllAnswers();
  answers.skippedContact = true;
  localStorage.setItem(QUIZ_KEY, JSON.stringify(answers));

  // Yandex.Metrika goal
  if (typeof ym === 'function') {
    ym(61131877, 'reachGoal', 'report_preview_nocontact');
  }

  window.location.href = 'report.html';
}

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
  leadData.utm = getUtmParams();
  leadData.referrer = document.referrer || '';
  leadData.pageUrl = window.location.href;

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

  // Send to server (CSV backup + AmoCRM when configured)
  var apiPath = (window.location.pathname.replace(/[^/]*$/, '')) + 'api/lead.php';
  fetch(apiPath, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(leadData)
  }).catch(function() {});

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

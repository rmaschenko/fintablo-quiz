/* ===== Storage + UTM ===== */

var QUIZ_KEY = 'fintablo_quiz';
var LEADS_KEY = 'fintablo_leads';
var UTM_KEY = 'fintablo_utm';

/* --- Quiz answers --- */
function saveAnswer(field, value) {
  var data = JSON.parse(localStorage.getItem(QUIZ_KEY) || '{}');
  data[field] = value;
  localStorage.setItem(QUIZ_KEY, JSON.stringify(data));
}

function getAllAnswers() {
  return JSON.parse(localStorage.getItem(QUIZ_KEY) || '{}');
}

function clearQuiz() {
  localStorage.removeItem(QUIZ_KEY);
}

/* --- Leads --- */
function saveLead(data) {
  var leads = JSON.parse(localStorage.getItem(LEADS_KEY) || '[]');
  data.timestamp = new Date().toISOString();
  data.utm = getUtmParams();
  data.referrer = document.referrer || '';
  data.pageUrl = window.location.href;
  leads.push(data);
  localStorage.setItem(LEADS_KEY, JSON.stringify(leads));
}

function getLeads() {
  return JSON.parse(localStorage.getItem(LEADS_KEY) || '[]');
}

/* --- UTM --- */
function captureUtm() {
  var params = new URLSearchParams(window.location.search);
  var utmFields = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'];
  var utm = {};
  var hasUtm = false;

  utmFields.forEach(function(key) {
    var val = params.get(key);
    if (val) {
      utm[key] = val;
      hasUtm = true;
    }
  });

  // Store only if we have UTM params (don't overwrite existing)
  if (hasUtm) {
    localStorage.setItem(UTM_KEY, JSON.stringify(utm));
  }
}

function getUtmParams() {
  return JSON.parse(localStorage.getItem(UTM_KEY) || '{}');
}

// Capture UTM on every page load
captureUtm();

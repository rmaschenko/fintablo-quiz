<?php
/**
 * Lead handler for Fintablo Quiz
 * 1. Saves every lead to CSV (backup)
 * 2. Sends to AmoCRM (when configured)
 * 3. Returns JSON response
 */

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Handle preflight
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit;
}

// Read JSON body
$input = file_get_contents('php://input');
$data = json_decode($input, true);

if (!$data || empty($data['phone'])) {
    http_response_code(400);
    echo json_encode(['error' => 'Phone is required']);
    exit;
}

// === 1. SAVE TO CSV (backup) ===
$csvDir = __DIR__ . '/leads';
if (!is_dir($csvDir)) {
    mkdir($csvDir, 0755, true);
}

// Protect leads directory with .htaccess
$htaccess = $csvDir . '/.htaccess';
if (!file_exists($htaccess)) {
    file_put_contents($htaccess, "Deny from all\n");
}

$csvFile = $csvDir . '/leads_' . date('Y-m') . '.csv';
$isNew = !file_exists($csvFile);

$csvFields = [
    'timestamp',
    'name',
    'phone',
    'email',
    'wantExpert',
    // Quiz data
    'experience',
    'workFormat',
    'clients',
    'avgCheckRange',
    'hoursPerClient',
    'manualWorkPct',
    'clientSources',
    'barriers',
    'targetIncome',
    // Computed
    'currentIncome',
    'hourlyRate',
    'practiceType',
    'incomeGap',
    'checkGrowthPct',
    'isZeroClients',
    // UTM
    'utm_source',
    'utm_medium',
    'utm_campaign',
    'utm_content',
    'utm_term',
    // Meta
    'referrer',
    'pageUrl'
];

$fp = fopen($csvFile, 'a');
if ($isNew) {
    // BOM for Excel compatibility
    fwrite($fp, "\xEF\xBB\xBF");
    fputcsv($fp, $csvFields, ';');
}

$row = [];
foreach ($csvFields as $field) {
    if ($field === 'timestamp') {
        $row[] = date('Y-m-d H:i:s');
    } elseif ($field === 'clientSources' || $field === 'barriers') {
        $row[] = is_array($data[$field] ?? null) ? implode(', ', $data[$field]) : ($data[$field] ?? '');
    } elseif (strpos($field, 'utm_') === 0) {
        // UTM from nested object
        $utm = $data['utm'] ?? [];
        $row[] = $utm[$field] ?? '';
    } elseif ($field === 'wantExpert') {
        $row[] = !empty($data[$field]) ? 'ДА' : 'нет';
    } elseif ($field === 'isZeroClients') {
        $row[] = !empty($data[$field]) ? 'ДА' : 'нет';
    } else {
        $row[] = $data[$field] ?? '';
    }
}

fputcsv($fp, $row, ';');
fclose($fp);

// === 2. SEND TO AMOCRM ===
$amoApiDomain = 'tablo2.amocrm.ru';
$amoToken = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsImp0aSI6IjAyOTZiYWFjMTA5ODMxZmQxNTVhMWE4MjE0NjhlY2ZkNTRiZmZhM2Y2OTk4MTVlZDM4MGIxZGRkMTQ0YzIzYTM2NzgzODdmNzlkYTM0MDc5In0.eyJhdWQiOiIwMDdmNjMxZC1hYzNhLTRkNTctYTg1My1iNTJiOGM5MzdmYTYiLCJqdGkiOiIwMjk2YmFhYzEwOTgzMWZkMTU1YTFhODIxNDY4ZWNmZDU0YmZmYTNmNjk5ODE1ZWQzODBiMWRkZDE0NGMyM2EzNjc4Mzg3Zjc5ZGEzNDA3OSIsImlhdCI6MTc3NTAyOTc0MCwibmJmIjoxNzc1MDI5NzQwLCJleHAiOjE3OTg2NzUyMDAsInN1YiI6IjEwNjY1ODUwIiwiZ3JhbnRfdHlwZSI6IiIsImFjY291bnRfaWQiOjI4OTM4MzcwLCJiYXNlX2RvbWFpbiI6ImFtb2NybS5ydSIsInZlcnNpb24iOjIsInNjb3BlcyI6WyJwdXNoX25vdGlmaWNhdGlvbnMiLCJmaWxlcyIsImNybSIsImZpbGVzX2RlbGV0ZSIsIm5vdGlmaWNhdGlvbnMiXSwiaGFzaF91dWlkIjoiNGU5MjY1YzEtZmMwNS00NGJmLWE3YWItMzQxNzY3YjI2OThmIiwiYXBpX2RvbWFpbiI6ImFwaS1iLmFtb2NybS5ydSJ9.GBNlZDHLNSc-F1kTe2RQVUqhJHWyjxcYLgnbeGAztg5hzK8IvS0ufygnu8lpC73aL_cyIB5JcmIM0zAGwq5cGcP2ZhaQnr07JRoYdcUhN61euhgIixbcua-In_FvbhW5cbegyGhKka-3nep7V_yXKmLQ72umODLniibts63CHICwxXAXWdcQzEhqiSz-_ds_LU_AmXfWHNi85tjFKGw9WqOoq7S7nKWzIP6XOkTZll3jxp5XCrlSHpF-WbwImHFdqz0kZpu385KEFyFBhQiMeDuAAxEMyGRkUVsizdJx92GUmuXU3PaGpherxusUPOBVulz6pQojftnDIELWbmLFJw';
$amoPipelineId = 5278171;
$amoStatusId = 47065159;

// Build note with all quiz data + UTM
$utm = $data['utm'] ?? [];
$noteLines = [
    '📊 ДАННЫЕ ИЗ КВИЗА «РОСТ ПРАКТИКИ ФИНАНСИСТА»',
    '',
    'Опыт: ' . ($data['experience'] ?? '—'),
    'Формат работы: ' . ($data['workFormat'] ?? '—'),
    'Клиентов: ' . ($data['clients'] ?? '—'),
    'Средний гонорар: ' . ($data['avgCheckRange'] ?? '—'),
    'Часов на клиента: ' . ($data['hoursPerClient'] ?? '—'),
    'Доля рутины: ' . ($data['manualWorkPct'] ?? '—') . '%',
    'Источники клиентов: ' . (is_array($data['clientSources'] ?? null) ? implode(', ', $data['clientSources']) : ($data['clientSources'] ?? '—')),
    'Барьеры: ' . (is_array($data['barriers'] ?? null) ? implode(', ', $data['barriers']) : ($data['barriers'] ?? '—')),
    'Целевой доход: ' . ($data['targetIncome'] ?? '—') . ' ₽/мес',
    '',
    '📈 РАСЧЁТНЫЕ ПОКАЗАТЕЛИ',
    'Текущий доход: ' . ($data['currentIncome'] ?? '—') . ' ₽/мес',
    'Ставка: ' . ($data['hourlyRate'] ?? '—') . ' ₽/ч',
    'Тип практики: ' . ($data['practiceType'] ?? '—'),
    'Разрыв до цели: ' . ($data['incomeGap'] ?? '—') . ' ₽/мес',
    'Потенциал роста чека: ' . ($data['checkGrowthPct'] ?? '—') . '%',
    'Хочет разбор с экспертом: ' . (!empty($data['wantExpert']) ? 'ДА' : 'нет'),
];

if (!empty($utm)) {
    $noteLines[] = '';
    $noteLines[] = '🔗 UTM-МЕТКИ';
    foreach ($utm as $k => $v) {
        if ($v) $noteLines[] = "$k: $v";
    }
}

$noteLines[] = '';
$noteLines[] = 'Реферер: ' . ($data['referrer'] ?? '—');
$noteLines[] = 'URL: ' . ($data['pageUrl'] ?? '—');
$noteLines[] = 'Время: ' . date('d.m.Y H:i:s');

$noteText = implode("\n", $noteLines);

// UTM field IDs in AmoCRM (tracking_data type)
$utmFieldMap = [
    'utm_source'   => 649363,
    'utm_medium'   => 649365,
    'utm_campaign' => 649367,
    'utm_term'     => 649369,
    'utm_content'  => 649371,
    'utm_referrer' => 649373,
    'referrer'     => 649381,
];

// Text UTM fields (backup)
$utmTextFieldMap = [
    'utm_source'   => 702447,
    'utm_medium'   => 702449,
    'utm_campaign' => 702451,
    'utm_content'  => 702453,
    'utm_term'     => 702455,
];

// Build custom fields for lead
$leadCustomFields = [];
$utm = $data['utm'] ?? [];

// Fill tracking_data UTM fields
foreach ($utmFieldMap as $utmKey => $fieldId) {
    $val = '';
    if ($utmKey === 'referrer' || $utmKey === 'utm_referrer') {
        $val = $data['referrer'] ?? '';
    } else {
        $val = $utm[$utmKey] ?? '';
    }
    if ($val) {
        $leadCustomFields[] = ['field_id' => $fieldId, 'values' => [['value' => $val]]];
    }
}

// Fill text UTM fields (backup)
foreach ($utmTextFieldMap as $utmKey => $fieldId) {
    $val = $utm[$utmKey] ?? '';
    if ($val) {
        $leadCustomFields[] = ['field_id' => $fieldId, 'values' => [['value' => $val]]];
    }
}

// Create lead with embedded contact
$amoLead = [
    'name' => 'Квиз ФД: ' . ($data['name'] ?? 'Без имени') . ' — ' . ($data['practiceType'] ?? ''),
    'pipeline_id' => $amoPipelineId,
    'status_id' => $amoStatusId,
    'custom_fields_values' => $leadCustomFields,
    '_embedded' => [
        'tags' => [
            ['name' => 'micro_service'],
            ['name' => 'growth_cfo']
        ],
        'contacts' => [[
            'first_name' => $data['name'] ?? '',
            'custom_fields_values' => [
                ['field_code' => 'PHONE', 'values' => [['value' => $data['phone'] ?? '', 'enum_code' => 'WORK']]],
            ]
        ]]
    ]
];

// Add email to contact if provided
if (!empty($data['email'])) {
    $amoLead['_embedded']['contacts'][0]['custom_fields_values'][] = [
        'field_code' => 'EMAIL',
        'values' => [['value' => $data['email'], 'enum_code' => 'WORK']]
    ];
}

$ch = curl_init("https://{$amoApiDomain}/api/v4/leads/complex");
curl_setopt_array($ch, [
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_POST => true,
    CURLOPT_HTTPHEADER => [
        'Content-Type: application/json',
        "Authorization: Bearer {$amoToken}"
    ],
    CURLOPT_POSTFIELDS => json_encode([$amoLead])
]);
$amoResponse = curl_exec($ch);
$amoCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

// Add note with all quiz data to the created lead
if ($amoCode >= 200 && $amoCode < 300) {
    $amoResult = json_decode($amoResponse, true);
    $leadId = $amoResult[0]['id'] ?? null;
    if ($leadId) {
        $note = [
            'note_type' => 'common',
            'params' => ['text' => $noteText]
        ];
        $ch2 = curl_init("https://{$amoApiDomain}/api/v4/leads/{$leadId}/notes");
        curl_setopt_array($ch2, [
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_POST => true,
            CURLOPT_HTTPHEADER => [
                'Content-Type: application/json',
                "Authorization: Bearer {$amoToken}"
            ],
            CURLOPT_POSTFIELDS => json_encode([$note])
        ]);
        curl_exec($ch2);
        curl_close($ch2);
    }
}

// === 3. RESPONSE ===
echo json_encode(['success' => true, 'message' => 'Lead saved']);

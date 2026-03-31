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

// === 2. SEND TO AMOCRM (uncomment when ready) ===
/*
$amoSubdomain = 'YOUR_SUBDOMAIN'; // e.g. 'fintablo'
$amoToken = 'YOUR_API_TOKEN';
$amoPipelineId = 0; // pipeline ID
$amoStatusId = 0;   // status/stage ID

$amoLead = [
    'name' => 'Квиз: ' . ($data['name'] ?? 'Без имени') . ' — ' . ($data['practiceType'] ?? ''),
    'pipeline_id' => $amoPipelineId,
    'status_id' => $amoStatusId,
    'custom_fields_values' => [
        // Add your custom field mappings here
        // ['field_id' => 123, 'values' => [['value' => $data['phone']]]],
    ],
    '_embedded' => [
        'contacts' => [[
            'first_name' => $data['name'] ?? '',
            'custom_fields_values' => [
                ['field_code' => 'PHONE', 'values' => [['value' => $data['phone'], 'enum_code' => 'WORK']]],
                ['field_code' => 'EMAIL', 'values' => [['value' => $data['email'] ?? '', 'enum_code' => 'WORK']]],
            ]
        ]]
    ]
];

// Add UTM as note
$utm = $data['utm'] ?? [];
$utmNote = '';
if (!empty($utm)) {
    $utmNote = "UTM:\n";
    foreach ($utm as $k => $v) {
        if ($v) $utmNote .= "$k: $v\n";
    }
}

$ch = curl_init("https://{$amoSubdomain}.amocrm.ru/api/v4/leads/complex");
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

// If lead created and we have UTM, add note
if ($amoCode >= 200 && $amoCode < 300 && $utmNote) {
    $amoResult = json_decode($amoResponse, true);
    $leadId = $amoResult[0]['id'] ?? null;
    if ($leadId) {
        $note = [
            'entity_id' => $leadId,
            'note_type' => 'common',
            'params' => ['text' => $utmNote . "\nРеферер: " . ($data['referrer'] ?? '') . "\nURL: " . ($data['pageUrl'] ?? '')]
        ];
        $ch2 = curl_init("https://{$amoSubdomain}.amocrm.ru/api/v4/leads/notes");
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
*/

// === 3. RESPONSE ===
echo json_encode(['success' => true, 'message' => 'Lead saved']);

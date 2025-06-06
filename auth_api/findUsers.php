<?php
require_once 'db.php';
require_once 'vendor/autoload.php';

use Firebase\JWT\JWT;
use Firebase\JWT\Key;

// Enable error reporting
error_reporting(E_ALL);
ini_set('display_errors', '1');

header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Authorization, Content-Type, X-Requested-With");
header("Access-Control-Allow-Credentials: true");

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

$secretKey = 'sua_chave_secreta_muito_segura';

// Log received headers for debugging
error_log("Received headers: " . print_r(getallheaders(), true));
error_log("Server variables: " . print_r($_SERVER, true));

// Get authorization header from various possible locations
$authHeader = $_SERVER['HTTP_AUTHORIZATION'] ?? 
              $_SERVER['REDIRECT_HTTP_AUTHORIZATION'] ?? 
              (function_exists('apache_request_headers') ? apache_request_headers()['Authorization'] ?? '' : '');

if (empty($authHeader)) {
    error_log("No authorization header found");
    http_response_code(401);
    echo json_encode(['error' => 'Token não fornecido', 'debug' => 'No auth header found']);
    exit;
}

$token = str_replace('Bearer ', '', $authHeader);

try {
    error_log("Attempting to decode token: " . substr($token, 0, 10) . "...");
    $decoded = JWT::decode($token, new Key($secretKey, 'HS256'));
    error_log("Token decoded successfully for user ID: " . $decoded->sub);
    
    $conn = getDbConnection();
    if (!$conn) {
        throw new Exception("Database connection failed");
    }

    $currentUserId = $decoded->sub;
    $stmt = $conn->prepare("SELECT id, name, lastName FROM user WHERE id != ?");
    if (!$stmt) {
        throw new Exception("Prepare failed: " . $conn->error);
    }

    $stmt->bind_param("i", $currentUserId);
    if (!$stmt->execute()) {
        throw new Exception("Execute failed: " . $stmt->error);
    }

    $result = $stmt->get_result();
    $users = [];
    while ($row = $result->fetch_assoc()) {
        $users[] = [
            'id' => $row['id'],
            'name' => $row['name'],
            'lastName' => $row['lastName']
        ];
    }

    $stmt->close();
    $conn->close();

    echo json_encode(['users' => $users]);
    
} catch (Exception $e) {
    error_log("Error in findUsers.php: " . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'error' => 'Erro interno do servidor',
        'debug' => $e->getMessage(),
        'trace' => $e->getTrace()
    ]);
}
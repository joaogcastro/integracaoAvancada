<?php
require_once 'vendor/autoload.php';

use Firebase\JWT\JWT;
use Firebase\JWT\Key;

header("Content-Type: application/json");

// **Coloque aqui exatamente a mesma chave secreta que usou no Node para assinar o token!**
$secretKey = 'sua_chave_secreta_muito_segura';

function getAuthorizationHeader() {
    $headers = null;
    if (isset($_SERVER['HTTP_AUTHORIZATION'])) {
        $headers = trim($_SERVER["HTTP_AUTHORIZATION"]);
    } elseif (function_exists('apache_request_headers')) {
        $requestHeaders = apache_request_headers();
        foreach ($requestHeaders as $key => $value) {
            if (strtolower($key) === 'authorization') {
                $headers = trim($value);
                break;
            }
        }
    }
    return $headers;
}

$authHeader = getAuthorizationHeader();

if (!$authHeader || !preg_match('/Bearer\s(\S+)/', $authHeader, $matches)) {
    http_response_code(401);
    echo json_encode(['error' => 'Token não fornecido']);
    exit;
}

$token = $matches[1];

try {
    $decoded = JWT::decode($token, new Key($secretKey, 'HS256'));
    echo json_encode([
        'valid' => true,
        'userId' => $decoded->sub,
        'name' => $decoded->name,
        'email' => $decoded->email
    ]);
} catch (\Firebase\JWT\ExpiredException $e) {
    http_response_code(401);
    echo json_encode(['valid' => false, 'error' => 'Token expirado']);
} catch (Exception $e) {
    http_response_code(401);
    echo json_encode(['valid' => false, 'error' => $e->getMessage()]);
}

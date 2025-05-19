<?php
require_once 'db.php';
require_once 'vendor/autoload.php';

use Firebase\JWT\JWT;
use Firebase\JWT\Key;
use Predis\Client as RedisClient;

header("Content-Type: application/json");

$secretKey = 'sua_chave_secreta_muito_segura';
$issuer = 'seusistema.com';
$expirationTime = 3600;

$redis = new RedisClient([
    'scheme' => 'tcp',
    'host'   => 'redis',
    'port'   => 6379,
]);

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Método não permitido']);
    exit;
}

$rawInput = file_get_contents('php://input');
$data = json_decode($rawInput, true);

if (!is_array($data)) {
    http_response_code(400);
    echo json_encode(['error' => 'JSON inválido']);
    exit;
}

$email = trim($data['email'] ?? '');
$password = trim($data['password'] ?? '');

if ($email === '' || $password === '') {
    http_response_code(400);
    echo json_encode(['error' => 'Email e senha são obrigatórios']);
    exit;
}

$cacheKey = "user_auth:" . md5($email);
$cachedUserJson = $redis->get($cacheKey);

if ($cachedUserJson) {
    $cachedUser = json_decode($cachedUserJson, true);

    $payload = [
        'iss' => $issuer,
        'iat' => time(),
        'exp' => time() + $expirationTime,
        'sub' => $cachedUser['id'],
        'name' => $cachedUser['name'],
        'email' => $cachedUser['email']
    ];

    $jwt = JWT::encode($payload, $secretKey, 'HS256');

    echo json_encode([
        'token' => $jwt,
        'user' => $cachedUser,
        'cache' => true
    ]);
    exit;
}

$conn = getDbConnection();

$stmt = $conn->prepare("SELECT id, name, lastName, email, password, image_url FROM user WHERE email = ?");
$stmt->bind_param("s", $email);
$stmt->execute();
$result = $stmt->get_result();
$user = $result->fetch_assoc();

if (!$user || !password_verify($password, $user['password'])) {
    http_response_code(401);
    echo json_encode(['error' => 'Credenciais inválidas']);
    exit;
}

unset($user['password']);

$redis->setex($cacheKey, $expirationTime, json_encode($user));

$payload = [
    'iss' => $issuer,
    'iat' => time(),
    'exp' => time() + $expirationTime,
    'sub' => $user['id'],
    'name' => $user['name'],
    'email' => $user['email']
];

$jwt = JWT::encode($payload, $secretKey, 'HS256');

echo json_encode([
    'token' => $jwt,
    'user' => $user
]);

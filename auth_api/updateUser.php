<?php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: PUT");
header("Access-Control-Allow-Headers: Content-Type");

if ($_SERVER['REQUEST_METHOD'] !== 'PUT') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit;
}

$input = json_decode(file_get_contents("php://input"), true);

$id = $input['id'] ?? null;
$name = $input['name'] ?? null;
$lastName = $input['lastName'] ?? null;
$email = $input['email'] ?? null;

if (!$id || !$name || !$lastName || !$email) {
    http_response_code(400);
    echo json_encode(['error' => 'Missing required fields']);
    exit;
}

$host = getenv('MYSQL_HOST') ?: 'mysql';
$user = getenv('MYSQL_USER') ?: 'root';
$pass = getenv('MYSQL_PASSWORD') ?: 'root';
$db   = getenv('MYSQL_DATABASE') ?: 'integracaoaf';
$port = getenv('MYSQL_PORT') ?: 3306;

$conn = new mysqli($host, $user, $pass, $db, $port);
if ($conn->connect_error) {
    http_response_code(500);
    echo json_encode(['error' => 'DB connection failed: ' . $conn->connect_error]);
    exit;
}

$stmt = $conn->prepare("UPDATE user SET name = ?, lastName = ?, email = ? WHERE id = ?");
$stmt->bind_param("sssi", $name, $lastName, $email, $id);

if ($stmt->execute()) {
    echo json_encode(['ok' => true]);
} else {
    http_response_code(500);
    echo json_encode(['error' => $stmt->error]);
}

$stmt->close();
$conn->close();

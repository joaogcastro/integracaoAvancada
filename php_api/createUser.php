<?php
require_once 'db.php';

header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Método não permitido']);
    exit;
}

$data = json_decode(file_get_contents('php://input'), true);

$name = $data['name'] ?? null;
$lastName = $data['lastName'] ?? null;
$email = $data['email'] ?? null;
$password = $data['password'] ?? null;
$imageUrl = $data['image_url'] ?? null;


if (!$name || !$lastName || !$email || !$password || !$imageUrl) {
    http_response_code(400);
    echo json_encode(['error' => 'Campos obrigatórios ausentes']);
    exit;
}

$hashedPassword = password_hash($password, PASSWORD_BCRYPT);

$conn = getDbConnection();

$stmt = $conn->prepare("INSERT INTO user (name, lastName, email, password, image_url) VALUES (?, ?, ?, ?, ?)");
$stmt->bind_param("sssss", $name, $lastName, $email, $hashedPassword, $imageUrl);

if ($stmt->execute()) {
    http_response_code(201);
    echo json_encode(['ok' => true, 'id' => $stmt->insert_id]);
} else {
    http_response_code(500);
    echo json_encode(['error' => 'Erro ao inserir usuário']);
}

$stmt->close();
$conn->close();

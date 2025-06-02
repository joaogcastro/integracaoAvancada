<?php
function getDbConnection() {
    $host = getenv('MYSQL_HOST') ?: 'localhost';
    $user = getenv('MYSQL_USER') ?: 'root';
    $pass = getenv('MYSQL_PASSWORD') ?: '';
    $db = getenv('MYSQL_DATABASE') ?: 'integracaoaf';
    $port = getenv('MYSQL_PORT') ?: 3306;

    $conn = new mysqli($host, $user, $pass, $db, $port);

    if ($conn->connect_error) {
        http_response_code(500);
        echo json_encode(['error' => 'Falha na conexão: ' . $conn->connect_error]);
        exit;
    }

    $createTableQuery = "
        CREATE TABLE IF NOT EXISTS user (
            id INT AUTO_INCREMENT PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            lastName VARCHAR(255) NOT NULL,
            email VARCHAR(255) NOT NULL UNIQUE,
            password VARCHAR(255) NOT NULL,
            image_url VARCHAR(1024) NOT NULL
        );
    ";

    if (!$conn->query($createTableQuery)) {
        http_response_code(500);
        echo json_encode(['error' => 'Erro ao criar tabela: ' . $conn->error]);
        exit;
    }

    return $conn;
}

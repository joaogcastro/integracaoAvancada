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

    return $conn;
}

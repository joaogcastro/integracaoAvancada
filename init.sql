CREATE TABLE IF NOT EXISTS user (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    lastName VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    image_url VARCHAR(1024) NOT NULL
);

CREATE TABLE IF NOT EXISTS messages (
    id INT AUTO_INCREMENT PRIMARY KEY,
    message TEXT NOT NULL,
    userIdSend INT NOT NULL,
    userIdReceive INT NOT NULL,
    FOREIGN KEY (userIdSend) REFERENCES user(id),
    FOREIGN KEY (userIdReceive) REFERENCES user(id)
);

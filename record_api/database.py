import os
import logging
import mysql.connector

logger = logging.getLogger(__name__)

def get_db_connection():
    try:
        db_config = {
            'host': os.getenv('MYSQL_HOST', 'mysql'),
            'user': os.getenv('MYSQL_USER', 'root'),
            'password': os.getenv('MYSQL_PASSWORD', 'root'),
            'database': os.getenv('MYSQL_DATABASE', 'integracaoaf')
        }
        try:
            # Tenta conectar já especificando o banco
            conn = mysql.connector.connect(**db_config)
            return conn
        except mysql.connector.errors.DatabaseError:
            # Se o banco não existir, conecta sem database e cria
            temp_config = db_config.copy()
            temp_config.pop('database')
            conn = mysql.connector.connect(**temp_config)
            cursor = conn.cursor()
            cursor.execute(f"CREATE DATABASE IF NOT EXISTS `{db_config['database']}`")
            cursor.close()
            conn.close()
            # Agora conecta novamente já com o banco criado
            conn = mysql.connector.connect(**db_config)
            return conn
    except Exception as e:
        logger.error("Erro ao conectar/criar o banco de dados: %s", e)
        raise

def create_user_table(conn):
    query = """
        CREATE TABLE IF NOT EXISTS user (
            id INT AUTO_INCREMENT PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            lastName VARCHAR(255) NOT NULL,
            email VARCHAR(255) NOT NULL UNIQUE,
            password VARCHAR(255) NOT NULL,
            image_url VARCHAR(1024) NOT NULL
        );
    """
    cursor = conn.cursor()
    cursor.execute(query)
    conn.commit()
    cursor.close()
    logger.info("Tabela 'user' verificada/criada com sucesso.")

def create_messages_table(conn):
    query = """
        CREATE TABLE IF NOT EXISTS messages (
            id INT AUTO_INCREMENT PRIMARY KEY,
            message TEXT NOT NULL,
            userIdSend INT NOT NULL,
            userIdReceive INT NOT NULL,
            FOREIGN KEY (userIdSend) REFERENCES user(id),
            FOREIGN KEY (userIdReceive) REFERENCES user(id)
        );
    """
    cursor = conn.cursor()
    cursor.execute(query)
    conn.commit()
    cursor.close()
    logger.info("Tabela 'messages' verificada/criada com sucesso.")

def init_db():
    try:
        conn = get_db_connection()
        create_user_table(conn)
        create_messages_table(conn)
        conn.close()
        logger.info("Banco de dados inicializado com sucesso.")
    except Exception as e:
        logger.error("Erro ao inicializar o banco de dados: %s", e)
        raise

import pika
import mysql.connector
import os
import json
import logging
import traceback

# Configura o logger
logging.basicConfig(
    level=logging.INFO,
    format='[%(asctime)s] [%(levelname)s] %(message)s'
)
logger = logging.getLogger(__name__)

def get_db_connection():
    try:
        connection = mysql.connector.connect(
            host=os.getenv('MYSQL_HOST', 'mysql'),
            user=os.getenv('MYSQL_USER', 'root'),
            password=os.getenv('MYSQL_PASSWORD', 'root'),
            database=os.getenv('MYSQL_DATABASE', 'integracaoaf')
        )
        logger.debug("Conexão com o banco de dados estabelecida.")
        return connection
    except Exception as e:
        logger.error("Erro ao conectar no banco de dados: %s", e)
        raise

def callback(ch, method, properties, body):
    try:
        data = json.loads(body)
        logger.info(f"Mensagem recebida da fila: {data}")

        connection = get_db_connection()
        cursor = connection.cursor()

        query = """
        INSERT INTO messages (message, userIdSend, userIdReceive)
        VALUES (%s, %s, %s)
        """
        cursor.execute(query, (data['message'], data['userIdSend'], data['userIdReceive']))
        connection.commit()
        logger.info(f"Mensagem inserida com sucesso no banco de dados para userIdSend={data['userIdSend']}")

        cursor.close()
        connection.close()

        ch.basic_ack(delivery_tag=method.delivery_tag)

    except Exception as e:
        logger.error("Erro ao processar mensagem: %s", e)
        logger.debug(traceback.format_exc())

def main():
    try:
        rabbitmq_url = os.getenv('RABBITMQ_URL', 'amqp://guest:guest@rabbitmq:5672/')
        params = pika.URLParameters(rabbitmq_url)
        connection = pika.BlockingConnection(params)
        channel = connection.channel()
        channel.queue_declare(queue='messagesQueue', durable=True)
        channel.basic_qos(prefetch_count=1)
        channel.basic_consume(queue='messagesQueue', on_message_callback=callback)
        logger.info("Consumidor RabbitMQ rodando. Esperando mensagens...")
        channel.start_consuming()
    except Exception as e:
        logger.critical("Erro ao iniciar o consumidor RabbitMQ: %s", e)
        logger.debug(traceback.format_exc())

if __name__ == '__main__':
    main()

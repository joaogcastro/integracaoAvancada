import os
import json
import logging
import traceback
import pika
import redis
from database import get_db_connection

RABBITMQ_QUEUE = 'messagesQueue'
CACHE_KEY = 'messages_cache'
logger = logging.getLogger(__name__)

redis_client = redis.Redis(
    host=os.getenv('REDIS_HOST', 'redis'),
    port=int(os.getenv('REDIS_PORT', 6379)),
    decode_responses=True
)

def insert_message_to_db(message_data):
    conn = get_db_connection()
    cursor = conn.cursor()

    insert_query = """
        INSERT INTO messages (message, userIdSend, userIdReceive)
        VALUES (%s, %s, %s)
    """
    cursor.execute(insert_query, (
        message_data['message'],
        message_data['userIdSend'],
        message_data['userIdReceive']
    ))
    conn.commit()
    cursor.close()
    conn.close()
    logger.info("Mensagem inserida no banco de dados.")

    redis_client.delete(CACHE_KEY)
    logger.info("Cache Redis limpo com sucesso.")

def process_message(ch, method, properties, body):
    try:
        data = json.loads(body)
        logger.info(f"Mensagem recebida da fila: {data}")
        insert_message_to_db(data)
        ch.basic_ack(delivery_tag=method.delivery_tag)
    except Exception as e:
        logger.error("Erro ao processar mensagem: %s", e)
        logger.debug(traceback.format_exc())

def start_rabbitmq_consumer():
    try:
        rabbitmq_url = os.getenv('RABBITMQ_URL', 'amqp://guest:guest@rabbitmq:5672/')
        params = pika.URLParameters(rabbitmq_url)

        connection = pika.BlockingConnection(params)
        channel = connection.channel()

        channel.queue_declare(queue=RABBITMQ_QUEUE, durable=True)
        channel.basic_qos(prefetch_count=1)
        channel.basic_consume(queue=RABBITMQ_QUEUE, on_message_callback=process_message)

        logger.info("Consumidor RabbitMQ iniciado. Aguardando mensagens...")
        channel.start_consuming()
    except Exception as e:
        logger.critical("Erro ao iniciar o consumidor RabbitMQ: %s", e)
        logger.debug(traceback.format_exc())

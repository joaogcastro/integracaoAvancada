import pika
import mysql.connector
import os
import json

def get_db_connection():
    return mysql.connector.connect(
        host=os.getenv('MYSQL_HOST', 'mysql'),
        user=os.getenv('MYSQL_USER', 'root'),
        password=os.getenv('MYSQL_PASSWORD', 'root'),
        database=os.getenv('MYSQL_DATABASE', 'integracaoaf')
    )

def callback(ch, method, properties, body):
    data = json.loads(body)
    print("Mensagem recebida:", data)
    try:
        connection = get_db_connection()
        cursor = connection.cursor()
        query = """
        INSERT INTO messages (message, userIdSend, userIdReceive)
        VALUES (%s, %s, %s)
        """
        cursor.execute(query, (data['message'], data['userIdSend'], data['userIdReceive']))
        connection.commit()
        cursor.close()
        connection.close()
        ch.basic_ack(delivery_tag=method.delivery_tag)
    except Exception as e:
        print("Erro ao inserir no banco:", e)
        # opcional: ch.basic_nack(delivery_tag=method.delivery_tag, requeue=False)

def main():
    rabbitmq_url = os.getenv('RABBITMQ_URL', 'amqp://guest:guest@rabbitmq:5672/')
    params = pika.URLParameters(rabbitmq_url)
    connection = pika.BlockingConnection(params)
    channel = connection.channel()
    channel.queue_declare(queue='messagesQueue', durable=True)
    channel.basic_qos(prefetch_count=1)
    channel.basic_consume(queue='messagesQueue', on_message_callback=callback)
    print("Consumidor RabbitMQ rodando. Esperando mensagens...")
    channel.start_consuming()

if __name__ == '__main__':
    main()

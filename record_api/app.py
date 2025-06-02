from flask import Flask
from controller.message_controller import message_controller
import threading
from worker import start_rabbitmq_consumer
from database import init_db

app = Flask(__name__)

app.register_blueprint(message_controller, url_prefix='/python_api')

if __name__ == '__main__':
    init_db()
    # Consumidor RabbitMQ rodando em uma thread separada
    consumer_thread = threading.Thread(target=start_rabbitmq_consumer, daemon=True)
    consumer_thread.start()

    app.run(host='0.0.0.0', port=5000, debug=True)

from flask import Blueprint, request, jsonify
import os
import logging
import redis
import json
from database import get_db_connection

message_controller = Blueprint('message_controller', __name__)

logger = logging.getLogger(__name__)

redis_client = redis.Redis(
    host=os.getenv('REDIS_HOST', 'redis'), 
    port=int(os.getenv('REDIS_PORT', 6379)), 
    decode_responses=True 
)

CACHE_KEY = "messages_cache"

@message_controller.route('/messages', methods=['GET'])
def list_messages():
    cached = redis_client.get(CACHE_KEY)
    if cached:
        logger.info("Retornando mensagens do cache")
        messages = json.loads(cached)
        return jsonify({"messages": messages, "cache": True})

    logger.info("Consultando banco de dados")
    connection = get_db_connection()
    cursor = connection.cursor(dictionary=True)
    cursor.execute("SELECT message, userIdSend, userIdReceive FROM messages ORDER BY id ASC")
    messages = cursor.fetchall()
    cursor.close()
    connection.close()

    redis_client.set(CACHE_KEY, json.dumps(messages)) 

    return jsonify({"messages": messages, "cache": False})

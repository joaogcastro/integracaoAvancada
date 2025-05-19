from flask import Blueprint, request, jsonify
import mysql.connector
import os
import logging

message_controller = Blueprint('message_controller', __name__)

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def get_db_connection():
    connection = mysql.connector.connect(
        host=os.getenv('MYSQL_HOST', 'mysql'), 
        user=os.getenv('MYSQL_USER', 'root'),  
        password=os.getenv('MYSQL_PASSWORD', 'root'),  
        database=os.getenv('MYSQL_DATABASE', 'integracaoaf')  
    )
    return connection


@message_controller.route('/messages', methods=['GET'])
def list_messages():
    connection = get_db_connection()
    cursor = connection.cursor(dictionary=True)
    cursor.execute("SELECT message, userIdSend, userIdReceive FROM messages ORDER BY id ASC")
    messages = cursor.fetchall()
    cursor.close()
    connection.close()
    return jsonify(messages)

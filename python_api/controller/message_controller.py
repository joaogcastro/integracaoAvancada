from flask import Blueprint, request, jsonify
import mysql.connector
import os

message_controller = Blueprint('message_controller', __name__)

def get_db_connection():
    connection = mysql.connector.connect(
        host=os.getenv('MYSQL_HOST', 'mysql'), 
        user=os.getenv('MYSQL_USER', 'root'),  
        password=os.getenv('MYSQL_PASSWORD', 'root'),  
        database=os.getenv('MYSQL_DATABASE', 'integracaoaf')  
    )
    return connection

@message_controller.route('/message', methods=['POST'])
def send_message():
    data = request.get_json()
    message = data.get('message')
    user_id_send = data.get('userIdSend')
    user_id_receive = data.get('userIdReceive')

    if not message or not user_id_send or not user_id_receive:
        return jsonify({'error': 'Invalid data'}), 400

    connection = get_db_connection()
    cursor = connection.cursor()

    query = """
    INSERT INTO messages (message, userIdSend, userIdReceive)
    VALUES (%s, %s, %s)
    """
    cursor.execute(query, (message, user_id_send, user_id_receive))
    connection.commit()

    cursor.close()
    connection.close()

    return jsonify({'ok': True}), 200


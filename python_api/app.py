from flask import Flask
from controller import message_controller

app = Flask(__name__)

app.register_blueprint(message_controller, url_prefix='/python_api')


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)

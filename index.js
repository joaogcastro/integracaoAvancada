const express = require('express');
const amqp = require('amqplib');
const mysql = require('mysql2');
const bodyParser = require('body-parser');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
app.use(express.static('public'));
app.use(bodyParser.json());

const server = http.createServer(app);
const io = socketIo(server, {
    cors: {
      origin: '*', // ou defina "http://localhost:3000" se tiver frontend separado
      methods: ['GET', 'POST']
    }
  });
  
const RABBITMQ_URL = process.env.RABBITMQ_URL || "amqp://guest:guest@localhost:5672/";
const MYSQL_HOST = process.env.MYSQL_HOST || "mysql";
const MYSQL_USER = process.env.MYSQL_USER || "root";
const MYSQL_PASSWORD = process.env.MYSQL_PASSWORD || "root";
const MYSQL_DATABASE = process.env.MYSQL_DATABASE || "integracaoaf";

const dbConnection = mysql.createConnection({
  host: MYSQL_HOST,
  user: MYSQL_USER,
  password: MYSQL_PASSWORD,
  database: MYSQL_DATABASE
});

let rabbitChannel;

async function connectToRabbitMQ() {
  try {
    const connection = await amqp.connect(RABBITMQ_URL);
    rabbitChannel = await connection.createChannel();
    await rabbitChannel.assertQueue('messagesQueue', { durable: true });
    console.log('RabbitMQ conectado!');
  } catch (err) {
    console.error('Erro ao conectar no RabbitMQ', err);
  }
}

// Consumindo mensagens da fila do RabbitMQ
async function consumeMessages() {
  try {
    rabbitChannel.consume('messagesQueue', (msg) => {
      if (msg !== null) {
        const messageContent = JSON.parse(msg.content.toString());
        
        // Emitir a mensagem para todos os clientes conectados via WebSocket
        io.emit('new_message', messageContent);

        console.log('Mensagem recebida:', messageContent);
        
        // Após consumir a mensagem, envia um ack
        rabbitChannel.ack(msg);
      }
    });
  } catch (err) {
    console.error('Erro ao consumir mensagens do RabbitMQ', err);
  }
}

// Inicia a conexão com RabbitMQ e consome mensagens
connectToRabbitMQ().then(() => {
  consumeMessages();
});

// Endpoint para enviar mensagens à fila
app.post('/send_message', async (req, res) => {
  const { message, userIdSend, userIdReceive } = req.body;

  if (!message || !userIdSend || !userIdReceive) {
    return res.status(400).json({ error: 'Invalid data' });
  }

  try {
    const messageContent = JSON.stringify({ message, userIdSend, userIdReceive });

    // Envia para a fila RabbitMQ
    rabbitChannel.sendToQueue('messagesQueue', Buffer.from(messageContent), { persistent: true });

    return res.json({ ok: true, message: 'Message added to queue' });
  } catch (err) {
    console.error('Error sending message to queue', err);
    return res.status(500).json({ error: 'Failed to send message' });
  }
});

// Endpoint para obter todas as mensagens (para debug)
app.get('/get_messages', (req, res) => {
  const query = 'SELECT * FROM messages';

  dbConnection.query(query, (err, results) => {
    if (err) {
      console.error('Error fetching messages', err);
      return res.status(500).json({ error: 'Failed to fetch messages' });
    }
    return res.json(results);
  });
});

// Inicializando o servidor na porta 4000
server.listen(4000, () => {
  console.log('Node.js API running on http://localhost:4000');
});

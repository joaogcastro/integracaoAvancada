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
    origin: '*',
    methods: ['GET', 'POST']
  }
});

const RABBITMQ_URL = process.env.RABBITMQ_URL || "amqp://guest:guest@rabbitmq:5672/";
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

async function connectToRabbitMQWithRetry(retries = 5, delay = 3000) {
  while (retries > 0) {
    try {
      const connection = await amqp.connect(RABBITMQ_URL);
      rabbitChannel = await connection.createChannel();
      await rabbitChannel.assertQueue('messagesQueue', { durable: true });
      console.log('RabbitMQ conectado!');
      return;
    } catch (err) {
      console.error('Erro ao conectar no RabbitMQ:', err.message);
      retries--;
      if (retries === 0) {
        throw new Error('Não foi possível conectar ao RabbitMQ após várias tentativas');
      }
      console.log(`Tentando novamente em ${delay / 1000} segundos... (${retries} tentativas restantes)`);
      await new Promise(res => setTimeout(res, delay));
    }
  }
}

// async function consumeMessages() {
//   try {
//     await rabbitChannel.consume('messagesQueue', (msg) => {
//       if (msg !== null) {
//         const messageContent = JSON.parse(msg.content.toString());
//         io.emit('new_message', messageContent);

//         console.log('Mensagem recebida:', messageContent);

//         rabbitChannel.ack(msg);
//       }
//     });
//   } catch (err) {
//     console.error('Erro ao consumir mensagens do RabbitMQ', err);
//   }
// }

(async () => {
  try {
    await connectToRabbitMQWithRetry();
    // await consumeMessages();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
})();

app.post('/send_message', async (req, res) => {
  const { message, userIdSend, userIdReceive } = req.body;

  if (!message || !userIdSend || !userIdReceive) {
    return res.status(400).json({ error: 'Invalid data' });
  }

  try {
    const messageContent = JSON.stringify({ message, userIdSend, userIdReceive });

    rabbitChannel.sendToQueue('messagesQueue', Buffer.from(messageContent), { persistent: true });

    return res.json({ ok: true, message: 'Message added to queue' });
  } catch (err) {
    console.error('Error sending message to queue', err);
    return res.status(500).json({ error: 'Failed to send message' });
  }
});

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

server.listen(4000, () => {
  console.log('Node.js API running on http://localhost:4000');
});

const express = require('express');
const amqp = require('amqplib');
const bodyParser = require('body-parser');
const http = require('http');
const axios = require('axios');
const cors = require('cors');
const { createClient } = require('redis');

const app = express();
app.use(express.static('public'));
app.use(bodyParser.json());
app.use(cors());
const server = http.createServer(app);

const RABBITMQ_URL = process.env.RABBITMQ_URL || "amqp://guest:guest@rabbitmq:5672/";
const PYTHON_API_URL = process.env.PYTHON_API_URL || "http://flask-api:5000/python_api";
const REDIS_URL = process.env.REDIS_URL || "redis://redis:6379";
const PHP_API_URL = process.env.PHP_API_URL || "http://php-api"; 


let rabbitChannel;

const redisClient = createClient({
  url: REDIS_URL,
});

redisClient.on('error', (err) => console.error('Erro Redis:', err));
redisClient.connect().then(() => console.log('Redis conectado!'));

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

(async () => {
  try {
    await connectToRabbitMQWithRetry();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
})();

app.post('/send_message', async (req, res) => {
  const { message, userIdSend, userIdReceive } = req.body;
  console.log('Enviando por node conectado!');
  if (!message || !userIdSend || !userIdReceive) {
    return res.status(400).json({ error: 'Invalid data' });
  }

  try {
    const messageContent = JSON.stringify({ message, userIdSend, userIdReceive });
    rabbitChannel.sendToQueue('messagesQueue', Buffer.from(messageContent), { persistent: true });

    await redisClient.del('cached_messages');

    return res.json({ ok: true, message: 'Message added to queue' });
  } catch (err) {
    console.error('Error sending message to queue', err);
    return res.status(500).json({ error: 'Failed to send message' });
  }
});

app.get('/get_messages', async (req, res) => {
  try {
    const cached = await redisClient.get('cached_messages');
    if (cached) {
      console.log('Respondendo com cache Redis');
      return res.json(JSON.parse(cached));
    }

    const response = await axios.get(`${PYTHON_API_URL}/messages`);
    const messages = response.data;

    await redisClient.setEx('cached_messages', 60, JSON.stringify(messages));

    return res.json(messages);
  } catch (error) {
    console.error('Erro ao buscar mensagens:', error.message);
    return res.status(500).json({ error: 'Erro ao buscar mensagens' });
  }
});


//(API PHP)
app.post('/register', async (req, res) => {
  try {
    const response = await axios.post(`${PHP_API_URL}/createUser.php`, req.body);
    return res.status(response.status).json(response.data);
  } catch (error) {
    console.error('Erro no registro:', error.response?.data || error.message);
    return res.status(error.response?.status || 500).json({ error: error.response?.data || 'Erro no registro' });
  }
});

// (API PHP)
app.post('/login', async (req, res) => {
  const { email } = req.body; // assumindo que o login usa email (ajuste conforme seu caso)

  if (!email) {
    return res.status(400).json({ error: 'Email é obrigatório para login' });
  }

  try {
    // Tenta pegar o cache do Redis (pode ser o token, dados do usuário, etc)
    const cacheKey = `login:${email}`;
    const cachedData = await redisClient.get(cacheKey);

    if (cachedData) {
      console.log('Login com cache Redis');
      // Retorna os dados do cache direto
      return res.json(JSON.parse(cachedData));
    }

    // Se não tem cache, chama o PHP para autenticar
    const response = await axios.post(`${PHP_API_URL}/auth.php`, req.body);

    if (response.status === 200) {
      // Guarda o resultado no Redis com TTL, por exemplo 10 minutos (600 segundos)
      await redisClient.setEx(cacheKey, 600, JSON.stringify(response.data));
    }

    return res.status(response.status).json(response.data);

  } catch (error) {
    console.error('Erro no login:', error.response?.data || error.message);
    return res.status(error.response?.status || 500).json({ error: error.response?.data || 'Erro no login' });
  }
});



server.listen(4000, () => {
  console.log('Node.js API running on http://localhost:4000');
});

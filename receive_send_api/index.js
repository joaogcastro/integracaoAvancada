const express = require("express");
const amqp = require("amqplib");
const bodyParser = require("body-parser");
const axios = require("axios");
const cors = require("cors");
const { createClient } = require("redis");

//////////////////////////////////////////////////////
// Constantes
//////////////////////////////////////////////////////

const RABBITMQ_URL =
  process.env.RABBITMQ_URL || "amqp://guest:guest@rabbitmq:5672/";
const PYTHON_API_URL =
  process.env.PYTHON_API_URL || "http://flask-api:5000/python_api";
const REDIS_URL = process.env.REDIS_URL || "redis://redis:6379";
const PHP_API_URL = process.env.PHP_API_URL || "http://php-api";

//////////////////////////////////////////////////////
// Redis
//////////////////////////////////////////////////////

let redisClient;

async function connectRedis() {
  redisClient = createClient({ url: REDIS_URL });
  redisClient.on("error", (err) => console.error("Erro Redis:", err));
  await redisClient.connect();
  console.log("Redis conectado!");
}

//////////////////////////////////////////////////////
// RabbitMQ
//////////////////////////////////////////////////////

let rabbitChannel;

async function connectToRabbitMQWithRetry(retries = 5, delay = 3000) {
  while (retries > 0) {
    try {
      const connection = await amqp.connect(RABBITMQ_URL);
      rabbitChannel = await connection.createChannel();
      await rabbitChannel.assertQueue("messagesQueue", { durable: true });
      console.log("RabbitMQ conectado!");
      return;
    } catch (err) {
      console.error("Erro ao conectar no RabbitMQ:", err.message);
      retries--;
      if (retries === 0) {
        throw new Error(
          "Não foi possível conectar ao RabbitMQ após várias tentativas"
        );
      }
      console.log(
        `Tentando novamente em ${
          delay / 1000
        } segundos... (${retries} tentativas restantes)`
      );
      await new Promise((res) => setTimeout(res, delay));
    }
  }
}

//////////////////////////////////////////////////////
// Auth functions
//////////////////////////////////////////////////////

async function validateToken(token) {
  try {
    const cacheKey = `token_validation:${token}`;
    const cachedValidation = await redisClient.get(cacheKey);

    if (cachedValidation) {
      return JSON.parse(cachedValidation).valid;
    }

    const response = await axios.get(`${PHP_API_URL}/verify_token.php`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    // Cache por 30 segundos
    await redisClient.setEx(cacheKey, 30, JSON.stringify(response.data));

    return response.data.valid;
  } catch (error) {
    console.error("Erro na validação do token:", error.message);
    return false;
  }
}

//////////////////////////////////////////////////////
// Express
//////////////////////////////////////////////////////

const app = express();
app.use(express.static("public"));
app.use(bodyParser.json());
app.use(cors());

app.post("/send_message", async (req, res) => {
  const authHeader =
    req.headers["authorization"] || req.headers["Authorization"];
  if (!authHeader) {
    return res.status(401).json({ error: "Token não fornecido" });
  }

  const token = authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ error: "Token inválido" });
  }

  const valid = await validateToken(token);
  if (!valid) {
    return res.status(401).json({ error: "Token inválido ou expirado" });
  }

  const { message, userIdSend } = req.body;
  console.log("Enviando por node conectado!");

  if (!message || !userIdSend) {
    return res.status(400).json({ error: "Invalid data" });
  }

  try {
    const messageContent = JSON.stringify({
      message,
      userIdSend,
    });

    rabbitChannel.sendToQueue("messagesQueue", Buffer.from(messageContent), {
      persistent: true,
    });

    await redisClient.del("cached_messages");

    return res.json({ ok: true, message: "Message added to queue" });
  } catch (err) {
    console.error("Error sending message to queue", err);
    return res.status(500).json({ error: "Failed to send message" });
  }
});

app.get("/get_messages", async (req, res) => {
  try {
    const { senderId, receiverId } = req.query;

    if (!senderId || !receiverId) {
      return res.status(400).json({
        error: "Parâmetros 'senderId' e 'receiverId' são obrigatórios",
      });
    }

    // Cria uma chave de cache única para a conversa entre esses usuários
    const cacheKey = `messages_${Math.min(senderId, receiverId)}_${Math.max(
      senderId,
      receiverId
    )}`;

    const cached = await redisClient.get(cacheKey);
    if (cached) {
      console.log(`Respondendo com cache Redis para chave ${cacheKey}`);
      return res.json({ cache: true, messages: JSON.parse(cached) });
    }

    const response = await axios.get(`${PYTHON_API_URL}/messages`, {
      params: {
        senderId,
        receiverId,
      },
    });

    const messages = response.data.messages || response.data;

    // Armazena no Redis por 1 minuto
    await redisClient.setEx(cacheKey, 60, JSON.stringify(messages));

    return res.json({
      cache: false,
      messages,
    });
  } catch (error) {
    console.error("Erro ao buscar mensagens:", error.message);
    return res.status(500).json({ error: "Erro ao buscar mensagens" });
  }
});

//(API PHP)
app.post("/register", async (req, res) => {
  try {
    const response = await axios.post(
      `${PHP_API_URL}/createUser.php`,
      req.body
    );
    return res.status(response.status).json(response.data);
  } catch (error) {
    console.error("Erro no registro:", error.response?.data || error.message);
    return res
      .status(error.response?.status || 500)
      .json({ error: error.response?.data || "Erro no registro" });
  }
});

// (API PHP)
app.post("/login", async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ error: "Email é obrigatório para login" });
  }

  try {
    const cacheKey = `login:${email}`;
    const cachedData = await redisClient.get(cacheKey);

    let data;

    if (cachedData) {
      console.log("Login com cache Redis");
      data = JSON.parse(cachedData);
    } else {
      const response = await axios.post(`${PHP_API_URL}/auth.php`, req.body);

      if (response.status === 200) {
        await redisClient.setEx(cacheKey, 600, JSON.stringify(response.data));
        data = response.data;
      } else {
        return res.status(response.status).json(response.data);
      }
    }

    return res.json(data);
  } catch (error) {
    console.error("Erro no login:", error.response?.data || error.message);
    return res
      .status(error.response?.status || 500)
      .json({ error: error.response?.data || "Erro no login" });
  }
});

// (API PHP) delete
app.delete("/user", async (req, res) => {
  const { id } = req.body;

  if (!id) {
    return res.status(400).json({ error: "ID do usuário é obrigatório" });
  }

  try {
    const response = await axios.delete(`${PHP_API_URL}/deleteUser.php`, {
      data: { id },
      headers: {
        "Content-Type": "application/json",
      },
    });

    return res.status(response.status).json(response.data);
  } catch (error) {
    console.error(
      "Erro ao deletar usuário:",
      error.response?.data || error.message
    );
    return res
      .status(error.response?.status || 500)
      .json({ error: error.response?.data || "Erro ao deletar usuário" });
  }
});

// (API PHP) update
app.put("/user", async (req, res) => {
  const { id, name, lastName, email, image_url } = req.body;
  console.log("Dados recebidos para update:", req.body);

  if (!id || !name || !lastName || !email || !image_url) {
    return res.status(400).json({ error: "Campos obrigatórios ausentes" });
  }

  try {
    const response = await axios.put(
      `${PHP_API_URL}/updateUser.php`,
      { id, name, lastName, email, image_url },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    await redisClient.del(`login:${email}`);

    return res.status(response.status).json(response.data);
  } catch (error) {
    console.error(
      "Erro ao atualizar usuário:",
      error.response?.data || error.message
    );
    return res
      .status(error.response?.status || 500)
      .json({ error: error.response?.data || "Erro ao atualizar usuário" });
  }
});

app.get("/users", async (req, res) => {
  const authHeader =
    req.headers["authorization"] || req.headers["Authorization"];
  if (!authHeader) {
    console.log("No authorization header received from client");
    return res.status(401).json({ error: "Token não fornecido" });
  }

  const token = authHeader.split(" ")[1];
  if (!token) {
    console.log("Malformed authorization header");
    return res.status(401).json({ error: "Token inválido" });
  }

  try {
    const cacheKey = "users_list";
    const cachedUsers = await redisClient.get(cacheKey);

    if (cachedUsers) {
      return res.json({ cache: true, users: JSON.parse(cachedUsers) });
    }

    // Enhanced debug logging
    console.log(`Making request to PHP API at: ${PHP_API_URL}/findUsers.php`);
    console.log(`Using token: ${token.substring(0, 10)}...`);

    const response = await axios
      .get(`${PHP_API_URL}/findUsers.php`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          "X-Requested-With": "XMLHttpRequest",
        },
      })
      .catch((err) => {
        console.error("PHP API request failed:", {
          message: err.message,
          response: err.response?.data,
          status: err.response?.status,
          headers: err.response?.headers,
          config: err.config,
        });
        throw err;
      });

    await redisClient.setEx(cacheKey, 300, JSON.stringify(response.data.users));

    return res.json({ cache: false, users: response.data.users });
  } catch (error) {
    console.error("Full error details:", {
      message: error.message,
      stack: error.stack,
      response: error.response?.data,
      config: error.config,
    });
    return res.status(error.response?.status || 500).json({
      error: error.response?.data?.error || "Erro ao buscar usuários",
      debug: error.message,
    });
  }
});

async function init() {
  try {
    await connectRedis();
    await connectToRabbitMQWithRetry();
    app.listen(4000, () => {
      console.log("Node.js API running on http://localhost:4000");
    });
  } catch (e) {
    console.error("Erro ao iniciar a aplicação:", e);
    process.exit(1);
  }
}

init();

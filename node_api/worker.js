const amqp = require('amqplib');
const mysql = require('mysql2');

const RABBITMQ_URL = process.env.RABBITMQ_URL || "amqp://guest:guest@localhost:5672/";
const MYSQL_HOST = process.env.MYSQL_HOST || "mysql";
const MYSQL_USER = process.env.MYSQL_USER || "root";
const MYSQL_PASSWORD = process.env.MYSQL_PASSWORD || "root";
const MYSQL_DATABASE = process.env.MYSQL_DATABASE || "integracaoaf";

async function connectToRabbitMQ() {
  try {
    const connection = await amqp.connect(RABBITMQ_URL);
    const channel = await connection.createChannel();
    await channel.assertQueue('messagesQueue', { durable: true });
console.log("Worker conectado à fila messagesQueue");
    return { connection, channel };
  } catch (err) {
    console.error('Error connecting to RabbitMQ', err);
    throw err;
  }
}

const dbConnection = mysql.createConnection({
  host: MYSQL_HOST,
  user: MYSQL_USER,
  password: MYSQL_PASSWORD,
  database: MYSQL_DATABASE
});

async function startWorker() {
  try {
    const { channel } = await connectToRabbitMQ();

    channel.consume('messagesQueue', async (msg) => {
      const messageContent = JSON.parse(msg.content.toString());
      const { message, userIdSend, userIdReceive } = messageContent;

      console.log('Processing message:', message);

      const query = `
        INSERT INTO messages (message, userIdSend, userIdReceive)
        VALUES (?, ?, ?)
      `;
      dbConnection.query(query, [message, userIdSend, userIdReceive], (err, results) => {
        if (err) {
          console.error('Error inserting message into database', err);
        } else {
          console.log('Message inserted into database', results);
        }
      });

      channel.ack(msg);
    });
  } catch (err) {
    console.error('Error in worker', err);
  }
}

startWorker();

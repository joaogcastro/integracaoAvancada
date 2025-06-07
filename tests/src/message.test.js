const amqp = require('amqplib');
const request = require('supertest');
const mysql = require('mysql2/promise');

const API_URL = 'http://localhost:5000/python_api';
const RABBITMQ_URL = 'amqp://guest:guest@localhost:5672/';
const QUEUE_NAME = 'messagesQueue';

const DB_CONFIG = {
  host: 'localhost',
  user: 'root',
  password: 'root',
  database: 'integracaoaf',
  port: 7777
};

async function publishMessage(message) {
  const connection = await amqp.connect(RABBITMQ_URL);
  const channel = await connection.createChannel();
  await channel.assertQueue(QUEUE_NAME, { durable: true });
  channel.sendToQueue(QUEUE_NAME, Buffer.from(JSON.stringify(message)), { persistent: true });
  await channel.close();
  await connection.close();
}

jest.setTimeout(20000);

async function waitForMessageToAppear(expectedMessage, maxTries = 10, delay = 1000) {
  for (let i = 0; i < maxTries; i++) {
    const res = await request(API_URL).get('/messages');

    if (res.status === 200 && Array.isArray(res.body.messages)) {
      const exists = res.body.messages.find(
        m =>
          m.message === expectedMessage.message &&
          m.userIdSend === expectedMessage.userIdSend &&
          m.userIdReceive === expectedMessage.userIdReceive
      );

      if (exists) return exists;
    }

    await new Promise(resolve => setTimeout(resolve, delay));
  }

  throw new Error('Mensagem não apareceu na API após aguardar');
}

async function ensureTestUsersExist() {
  const conn = await mysql.createConnection(DB_CONFIG);

  await conn.execute(`
    INSERT IGNORE INTO user (id, name, email, password)
    VALUES (1001, 'User Test 1', 'test1@example.com', 'hashfake1')
  `);

  await conn.execute(`
    INSERT IGNORE INTO user (id, name, email, password)
    VALUES (1002, 'User Test 2', 'test2@example.com', 'hashfake2')
  `);

  await conn.end();
}

describe('Integração RabbitMQ + Flask API', () => {
  beforeAll(async () => {
    await ensureTestUsersExist();
  });

  it('Envia mensagem para fila e verifica persistência na API Flask', async () => {
    const testMessage = {
      message: `Mensagem de teste ${Date.now()}`,
      userIdSend: 1001,
      userIdReceive: 1002,
    };

    await request(API_URL).get('/messages');

    await publishMessage(testMessage);

    const encontrada = await waitForMessageToAppear(testMessage);

    expect(encontrada).toBeDefined();
    expect(encontrada.message).toBe(testMessage.message);
    expect(encontrada.userIdSend).toBe(testMessage.userIdSend);
    expect(encontrada.userIdReceive).toBe(testMessage.userIdReceive);
  });
});

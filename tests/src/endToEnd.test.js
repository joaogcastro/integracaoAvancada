const request = require('supertest');
const Redis = require('ioredis');

const redis = new Redis({host: 'localhost', port: 6666});
const API_NODE_URL = 'http://localhost:4000';

let token;
let userIdSend, userIdReceive;

jest.setTimeout(20000);

const randomString = () => Math.random().toString(36).slice(2);

describe('Integracao completa: Node.js + PHP + RabbitMQ + Redis + Flask', () => {
  beforeAll(async () => {
    const testEmail = `test${randomString()}@example.com`;

    // Registra dois usuarios
    await request(API_NODE_URL)
      .post('/register')
      .send({
        name: 'Usuario 1',
        lastName: 'Da Silva',
        email: testEmail,
        password: 'senha123',
        image_url: 'http://exemplo.com/imagem.jpg'
      })
    .expect((res) => {
      expect(res.status).toBe(201);
      userIdSend = res.body.id;
    });

    await request(API_NODE_URL)
      .post('/register')
      .send({
        name: 'Usuário 2',
        lastName: 'Da Silva',
        email: `destino${randomString()}@test.com`,
        password: 'senha123',
        image_url: 'http://exemplo.com/imagem.jpg'
      })
    .expect((res) => {
      expect(res.status).toBe(201);
      userIdReceive = res.body.id;
    });

    // Login para obter o token
    await request(API_NODE_URL)
      .post('/login')
      .send({ email: testEmail, password: 'senha123' })
    .expect((res) => {
      expect(res.status).toBe(200);
      token = res.body.token;
    });
  });

  beforeEach(async () => {
    await redis.flushall();
  });

  afterAll(async () => {
    await redis.quit();
  });

  it('Envia mensagem autenticada para fila e verifica na /get_messages', async () => {
    const testMessage = {
      message: `Mensagem automatica ${randomString()}`,
      userIdSend,
      userIdReceive,
    };

    await request(API_NODE_URL)
      .post('/send_message')
      .set('Authorization', `Bearer ${token}`)
      .send(testMessage)
      .expect((res) => {
        expect(res.status).toBe(200);
        expect(res.body.ok).toBe(true);
      });

    // Timeout para garantir que a mensagem seja processada
    await new Promise(resolve => setTimeout(resolve, 1000));

    await request(API_NODE_URL)
      .get(`/get_messages?userIdSend=${userIdSend}&userIdReceive=${userIdReceive}`)
      .expect((res) => {
        expect(res.status).toBe(200);
        expect(res.body.messages).toContainEqual(testMessage);
      });
  });

  it('Envia duas mensagens autenticada para fila e verifica na /get_messages', async () => {
    const testMessage1 = {
      message: `Mensagem automatica ${randomString()}`,
      userIdSend,
      userIdReceive,
    };

    const testMessage2 = {
      message: `Mensagem automatica ${randomString()}`,
      userIdSend,
      userIdReceive,
    };

    await request(API_NODE_URL)
      .post('/send_message')
      .set('Authorization', `Bearer ${token}`)
      .send(testMessage1)
      .expect((res) => {
        expect(res.status).toBe(200);
        expect(res.body.ok).toBe(true);
      });

    await request(API_NODE_URL)
      .post('/send_message')
      .set('Authorization', `Bearer ${token}`)
      .send(testMessage2)
      .expect((res) => {
        expect(res.status).toBe(200);
        expect(res.body.ok).toBe(true);
      });

    // Timeout para garantir que a mensagem seja processada
    await new Promise(resolve => setTimeout(resolve, 1000));

    await request(API_NODE_URL)
      .get(`/get_messages?userIdSend=${userIdSend}&userIdReceive=${userIdReceive}`)
      .expect((res) => {
        expect(res.status).toBe(200);
        expect(res.body.messages).toContainEqual(testMessage1);
        expect(res.body.messages).toContainEqual(testMessage2);
      });
  });
});

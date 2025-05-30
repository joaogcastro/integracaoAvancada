const request = require('supertest');
const Redis = require('ioredis');

const API_NODE_URL = 'http://localhost:4000';
const API_FLASK_URL = 'http://localhost:5000/python_api'; // usado para invalidar cache
const TEST_EMAIL = `user${Date.now()}@test.com`;

jest.setTimeout(20000);

let token;
let userIdSend, userIdReceive;
const redis = new Redis({host: 'localhost', port: 6666}); // conecta em localhost:6379 por padrão

describe('Integração completa: Node.js + PHP + RabbitMQ + Redis + Flask', () => {
  beforeAll(async () => {
    // 1. Registra dois usuários
    const res1 = await request(API_NODE_URL)
      .post('/register')
      .send({
        name: 'Usuário 1',
        lastName: 'Da Silva',
        email: TEST_EMAIL,
        password: 'senha123',
        image_url: 'http://exemplo.com/imagem.jpg'
      });

    expect(res1.status).toBe(201);
    userIdSend = res1.body.id;

    const res2 = await request(API_NODE_URL)
      .post('/register')
      .send({
        name: 'Usuário 2',
        lastName: 'Da Silva',
        email: `destino${Date.now()}@test.com`,
        password: 'senha123',
        image_url: 'http://exemplo.com/imagem.jpg'
      });

    expect(res2.status).toBe(201);
    userIdReceive = res2.body.id;

    // 2. Faz login para obter o token
    const loginRes = await request(API_NODE_URL)
      .post('/login')
      .send({ email: TEST_EMAIL, password: 'senha123' });

    expect(loginRes.status).toBe(200);
    token = loginRes.body.token;
  });

  afterAll(async () => {
    await redis.quit(); // encerra conexão com Redis após os testes
  });

  it('Envia mensagem autenticada para fila e verifica na /get_messages com Redis', async () => {
    const testMessage = {
      message: `Mensagem automática ${Date.now()}`,
      userIdSend,
      userIdReceive,
    };

    // Limpa o cache Redis manualmente antes do teste
    await redis.flushall();

    // 3. Envia a mensagem autenticada
    const resSend = await request(API_NODE_URL)
      .post('/send_message')
      .set('Authorization', `Bearer ${token}`)
      .send(testMessage);

    expect(resSend.status).toBe(200);
    expect(resSend.body.ok).toBe(true);
    await new Promise(resolve => setTimeout(resolve, 1000));

    // 4. Aguarda a propagação até que a mensagem apareça via /get_messages
    let found = false;
    for (let i = 0; i < 10; i++) {
      const resGet = await request(API_NODE_URL).get('/get_messages');
      const messages = resGet.body.messages;
      const exists = messages?.some(
        m =>
          m.message === testMessage.message &&
          m.userIdSend === testMessage.userIdSend &&
          m.userIdReceive === testMessage.userIdReceive
      );

      if (exists) {
        found = true;
        break;
      }

      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    expect(found).toBe(true);
  });
});

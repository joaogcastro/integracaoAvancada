const request = require('supertest');

// Substitua pela URL correta do seu servidor PHP
const API_URL = 'http://localhost:8080';

describe('Rota POST - createUser.php', () => {
  it('Cria um novo usuario com dados validos', async () => {
    const res = await request(API_URL)
      .post('/createUser.php')
      .send({
        name: 'Teste',
        lastName: 'Da Silva',
        email: `user${Date.now()}@exemplo.com`,
        password: 'senha123',
        image_url: 'http://exemplo.com/imagem.jpg'
      })
      .set('Accept', 'application/json');

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('ok', true);
    expect(res.body).toHaveProperty('id');
  });

  it('Campos obrigatorios faltando', async () => {
    const res = await request(API_URL)
      .post('/createUser.php') 
      .send({name: 'Altair'})
      .set('Accept', 'application/json');

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error', 'Campos obrigatórios ausentes');
  });

  it('Metodo GET nao permitido', async () => {
    const res = await request(API_URL)
      .get('/createUser.php');

    expect(res.status).toBe(405);
    expect(res.body).toHaveProperty('error', 'Método não permitido');
  });
});

describe('Rota PUT - updateUser.php', () => {
  let createdUserId;

  beforeAll(async () => {
    const res = await request(API_URL)
      .post('/createUser.php')
      .send({
        name: 'Usuario',
        lastName: 'Original',
        email: `original_${Date.now()}@teste.com`,
        password: 'senha123',
        image_url: 'http://imagem.com/original.jpg'
      })
      .set('Accept', 'application/json');

    createdUserId = res.body?.id;
    expect(res.status).toBe(201);
    expect(createdUserId).toBeDefined();
  });

  it('Atualiza o usuario com sucesso', async () => {
    const res = await request(API_URL)
      .put('/updateUser.php')
      .send({
        id: createdUserId,
        name: 'NomeAtualizado',
        lastName: 'SobrenomeAtualizado',
        email: `atualizado_${Date.now()}@teste.com`
      })
      .set('Accept', 'application/json');

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('ok', true);
  });

  it('Campos obrigatorios faltando', async () => {
    const res = await request(API_URL)
      .put('/updateUser.php')
      .send({
        id: createdUserId,
        name: 'NomeSemEmail'
      })
      .set('Accept', 'application/json');

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error', 'Missing required fields');
  });

  it('Metodo GET nao permitido', async () => {
    const res = await request(API_URL)
      .get('/updateUser.php');

    expect(res.status).toBe(405);
    expect(res.body).toHaveProperty('error', 'Method not allowed');
  });
});

describe('Rota DELETE - deleteUser.php', () => {
  let createdUserId;

  beforeAll(async () => {
    const res = await request(API_URL)
      .post('/createUser.php')
      .send({
        name: 'Teste',
        lastName: 'ParaDelete',
        email: `teste_delete_${Date.now()}@exemplo.com`,
        password: '123456',
        image_url: 'http://imagem.com/teste.jpg'
      })
      .set('Accept', 'application/json');

    createdUserId = res.body?.id;
    expect(res.status).toBe(201);
    expect(createdUserId).toBeDefined();
  });

  it('Deleta usuario com sucesso', async () => {
    const res = await request(API_URL)
      .delete('/deleteUser.php')
      .send({ id: createdUserId })
      .set('Accept', 'application/json');

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('ok', true);
  });

  it('Erro ao deletar sem ID', async () => {
    const res = await request(API_URL)
      .delete('/deleteUser.php')
      .send({})
      .set('Accept', 'application/json');

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error', 'Missing user ID');
  });

  it('Metodo GET nao permitido', async () => {
    const res = await request(API_URL)
      .get('/deleteUser.php');

    expect(res.status).toBe(405);
    expect(res.body).toHaveProperty('error', 'Method not allowed');
  });
});

describe('Rota POST - auth.php (autenticação)', () => {
  let email;
  const password = 'senhaSegura123';

  beforeAll(async () => {
    email = `auth_user_${Date.now()}@exemplo.com`;

    const res = await request(API_URL)
      .post('/createUser.php')
      .send({
        name: 'Auth',
        lastName: 'User',
        email,
        password,
        image_url: 'http://imagem.com/auth.jpg'
      })
      .set('Accept', 'application/json');

    expect(res.status).toBe(201);
  });

  it('Autenticado com sucesso', async () => {
    const res = await request(API_URL)
      .post('/auth.php')
      .send({
        email,
        password
      })
      .set('Accept', 'application/json');

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('token');
    expect(res.body).toHaveProperty('user');
    expect(res.body.user).toHaveProperty('email', email);
  });

  it('Credenciais invalidas', async () => {
    const res = await request(API_URL)
      .post('/auth.php')
      .send({
        email,
        password: 'senhaErrada'
      })
      .set('Accept', 'application/json');

    expect(res.status).toBe(401);
    expect(res.body).toHaveProperty('error', 'Credenciais inválidas');
  });

  it('Body invalido', async () => {
    const res = await request(API_URL)
      .post('/auth.php')
      .set('Content-Type', 'application/json')
      .send('email=email_invalido')
      .catch(e => e.response);

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error', 'JSON inválido');
  });

  it('Email e senha faltando', async () => {
    const res = await request(API_URL)
      .post('/auth.php')
      .send({
        email
      })
      .set('Accept', 'application/json');

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error', 'Email e senha são obrigatórios');
  });

  it('Metodo GET nao permitido', async () => {
    const res = await request(API_URL)
      .get('/auth.php');

    expect(res.status).toBe(405);
    expect(res.body).toHaveProperty('error', 'Método não permitido');
  });
});

describe('Rota GET - verify_token.php', () => {
  let validToken;

  beforeAll(async () => {
    const email = `verify_token_user_${Date.now()}@test.com`;
    const password = 'senhaVerificacao123';

    const createRes = await request(API_URL)
      .post('/createUser.php')
      .send({
        name: 'Token',
        lastName: 'Tester',
        email,
        password,
        image_url: 'https://img.com/user.png'
      });

    expect(createRes.status).toBe(201);

    const authRes = await request(API_URL)
      .post('/auth.php')
      .send({ email, password });

    expect(authRes.status).toBe(200);
    expect(authRes.body).toHaveProperty('token');

    validToken = authRes.body.token;
  });

  it('Token valido', async () => {
    const res = await request(API_URL)
      .get('/verify_token.php')
      .set('Authorization', `Bearer ${validToken}`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('valid', true);
    expect(res.body).toHaveProperty('userId');
    expect(res.body).toHaveProperty('email');
  });

  it('Token nao fornecido', async () => {
    const res = await request(API_URL)
      .get('/verify_token.php');

    expect(res.status).toBe(401);
    expect(res.body).toHaveProperty('error', 'Token não fornecido');
  });

  it('Token invalido', async () => {
    const res = await request(API_URL)
      .get('/verify_token.php')
      .set('Authorization', 'Bearer token_invalido_123');

    expect(res.status).toBe(401);
    expect(res.body).toHaveProperty('valid', false);
    expect(res.body).toHaveProperty('error');
  });
});

const request = require('supertest');
const app = require('../index');
const { User } = require('../models');
const bcrypt = require('bcrypt');

describe('Auth Routes', () => {
  let testUser;

  beforeAll(async () => {
    // Criar usuário de teste
    const hashedPassword = await bcrypt.hash('test123', 10);
    testUser = await User.create({
      nome: 'Test User',
      email: 'test@example.com',
      senha: hashedPassword,
      tipo_usuario: 'aluno',
      status: 'gratuito'
    });
  });

  afterAll(async () => {
    // Limpar usuário de teste
    if (testUser) {
      await testUser.destroy();
    }
  });

  describe('POST /api/auth/login', () => {
    it('should login with valid credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          senha: 'test123'
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('token');
      expect(response.body).toHaveProperty('user');
      expect(response.body.user.email).toBe('test@example.com');
    });

    it('should reject invalid credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          senha: 'wrongpassword'
        });

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('error');
    });

    it('should reject missing email', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          senha: 'test123'
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });
  });

  describe('POST /api/auth/register', () => {
    it('should register a new user', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          nome: 'New User',
          email: 'newuser@example.com',
          senha: 'password123'
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('token');
      expect(response.body).toHaveProperty('user');
      expect(response.body.user.email).toBe('newuser@example.com');

      // Limpar usuário criado
      await User.destroy({ where: { email: 'newuser@example.com' } });
    });

    it('should reject duplicate email', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          nome: 'Duplicate User',
          email: 'test@example.com',
          senha: 'password123'
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });
  });
});

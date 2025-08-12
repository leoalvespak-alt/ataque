# API Documentation - Rota de Ataque Questões

## Base URL
```
http://localhost:3001/api
```

## Autenticação
A maioria das rotas requer autenticação via JWT. Inclua o token no header:
```
Authorization: Bearer <seu_token>
```

## Endpoints

### Autenticação

#### POST /auth/login
Fazer login na plataforma.

**Body:**
```json
{
  "email": "usuario@exemplo.com",
  "senha": "senha123"
}
```

**Response:**
```json
{
  "token": "jwt_token_aqui",
  "user": {
    "id": 1,
    "nome": "Nome do Usuário",
    "email": "usuario@exemplo.com",
    "tipo_usuario": "aluno",
    "status": "gratuito"
  }
}
```

#### POST /auth/register
Registrar novo usuário.

**Body:**
```json
{
  "nome": "Nome do Usuário",
  "email": "usuario@exemplo.com",
  "senha": "senha123"
}
```

### Questões

#### GET /questions
Buscar questões com filtros e paginação.

**Query Parameters:**
- `disciplina_id` (opcional): ID da disciplina
- `assunto_id` (opcional): ID do assunto
- `banca_id` (opcional): ID da banca
- `orgao_id` (opcional): ID do órgão
- `ano` (opcional): Ano da questão
- `page` (opcional): Página (padrão: 1)
- `limit` (opcional): Itens por página (padrão: 10, máximo: 100)
- `search` (opcional): Busca por texto no enunciado
- `sort` (opcional): Campo para ordenação (id, ano, created_at)
- `order` (opcional): Ordem (ASC, DESC)

**Response:**
```json
{
  "questoes": [
    {
      "id": 1,
      "enunciado": "Texto do enunciado...",
      "alternativa_a": "Alternativa A",
      "alternativa_b": "Alternativa B",
      "alternativa_c": "Alternativa C",
      "alternativa_d": "Alternativa D",
      "alternativa_e": "Alternativa E",
      "gabarito": "C",
      "ano": 2023,
      "disciplina": { "id": 1, "nome": "Direito Constitucional" },
      "assunto": { "id": 1, "nome": "Direitos Fundamentais" },
      "banca": { "id": 1, "nome": "CESPE" },
      "orgao": { "id": 1, "nome": "Polícia Federal" }
    }
  ],
  "pagination": {
    "total": 100,
    "page": 1,
    "limit": 10,
    "totalPages": 10
  }
}
```

#### POST /questions/:id/responder
Responder uma questão.

**Headers:** `Authorization: Bearer <token>`

**Body:**
```json
{
  "alternativa_marcada": "C",
  "tempo_resposta": 30
}
```

**Response:**
```json
{
  "message": "Parabéns! Você acertou!",
  "acertou": true,
  "gabarito": "C",
  "alternativa_marcada": "C",
  "xpGanho": 20,
  "novoXP": 170,
  "questoes_respondidas": 15
}
```

#### GET /questions/:id/resposta
Verificar se já respondeu uma questão.

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "resposta": {
    "alternativa_marcada": "C",
    "acertou": true,
    "tempo_resposta": 30
  }
}
```

### Categorias

#### GET /categories/disciplinas
Buscar todas as disciplinas.

**Response:**
```json
{
  "disciplinas": [
    { "id": 1, "nome": "Direito Constitucional" },
    { "id": 2, "nome": "Português" }
  ]
}
```

#### GET /categories/assuntos/:disciplina_id
Buscar assuntos por disciplina.

**Response:**
```json
{
  "assuntos": [
    { "id": 1, "nome": "Direitos Fundamentais" },
    { "id": 2, "nome": "Organização do Estado" }
  ]
}
```

#### GET /categories/bancas
Buscar todas as bancas.

#### GET /categories/orgaos
Buscar todos os órgãos.

#### GET /categories/todas
Buscar todas as categorias de uma vez.

### Admin (Requer autenticação de gestor)

#### GET /admin/dashboard
Estatísticas do dashboard.

#### POST /admin/usuarios
Criar novo usuário.

#### PUT /admin/usuarios/:id
Atualizar usuário.

#### POST /admin/questoes
Criar nova questão.

#### PUT /admin/questoes/:id
Atualizar questão.

#### POST /admin/disciplinas
Criar nova disciplina.

#### POST /admin/assuntos
Criar novo assunto.

#### POST /admin/bancas
Criar nova banca.

#### POST /admin/orgaos
Criar novo órgão.

## Códigos de Erro

- `400`: Dados inválidos
- `401`: Não autorizado
- `403`: Acesso negado
- `404`: Recurso não encontrado
- `500`: Erro interno do servidor

## Rate Limiting

- 100 requests por IP a cada 15 minutos
- Aplicado em todas as rotas `/api/`

## Cache

- Categorias são cacheadas por 5 minutos
- Cache é limpo automaticamente quando expira
- Rota `/categories/clear-cache` para limpeza manual

## Logs

- Logs de requisições em `logs/info.log`
- Logs de erro em `logs/error.log`
- Logs de auditoria em `logs/audit.log`
- Logs de performance em `logs/performance.log`
- Logs são mantidos por 30 dias

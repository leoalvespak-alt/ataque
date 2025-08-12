# 🚀 Guia de Instalação - Rota de Ataque Questões

Este guia irá te ajudar a configurar e executar a plataforma Rota de Ataque Questões em seu ambiente local.

## 📋 Pré-requisitos

Antes de começar, certifique-se de ter instalado:

- **Node.js** (versão 16 ou superior)
- **MySQL** (versão 8.0 ou superior)
- **npm** ou **yarn**

### Verificando as instalações:

```bash
node --version
npm --version
mysql --version
```

## 🛠️ Instalação Passo a Passo

### 1. Clone o repositório

```bash
git clone <url-do-repositorio>
cd rota-de-ataque-questoes
```

### 2. Instale as dependências

```bash
# Instalar dependências do projeto principal
npm install

# Instalar dependências do backend
cd server
npm install

# Instalar dependências do frontend
cd ../client
npm install

# Voltar para a raiz do projeto
cd ..
```

### 3. Configure o banco de dados

1. **Crie o banco MySQL:**
   ```sql
   CREATE DATABASE rota_ataque_questoes CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   ```

2. **Configure as variáveis de ambiente:**
   ```bash
   cd server
   cp env.example .env
   ```

3. **Edite o arquivo `.env` com suas configurações:**
   ```env
   # Configurações do Banco de Dados
   DB_HOST=localhost
   DB_PORT=3306
   DB_NAME=rota_ataque_questoes
   DB_USER=seu_usuario_mysql
   DB_PASS=sua_senha_mysql

   # Configurações do JWT
   JWT_SECRET=seu_jwt_secret_super_seguro_aqui
   JWT_EXPIRES_IN=7d

   # Configurações do Asaas (opcional para desenvolvimento)
   ASAAS_API_KEY=SUA_API_KEY_ASAAS
   ASAAS_WALLET_ID=SEU_WALLET_ID_ASAAS
   ASAAS_ENVIRONMENT=sandbox

   # Configurações do Servidor
   PORT=3001
   NODE_ENV=development

   # Configurações de Upload
   UPLOAD_PATH=./uploads
   MAX_FILE_SIZE=5242880
   ```

### 4. Execute o seed do banco de dados

```bash
cd server
npm run seed
```

Isso irá criar:
- Um usuário gestor padrão
- Disciplinas e assuntos iniciais
- Bancas e órgãos comuns
- Planos de assinatura
- Configurações da plataforma

**Credenciais do gestor criado:**
- Email: `admin@rotadeataque.com`
- Senha: `admin123`

### 5. Inicie o servidor

```bash
# Na pasta server
npm run dev
```

O servidor estará rodando em `http://localhost:3001`

### 6. Inicie o frontend

```bash
# Em outro terminal, na pasta client
npm start
```

O frontend estará rodando em `http://localhost:3000`

## 🎯 Verificando a Instalação

### Backend
- Acesse: `http://localhost:3001/api/health`
- Deve retornar: `{"status":"OK","message":"Rota de Ataque Questões API está funcionando!"}`

### Frontend
- Acesse: `http://localhost:3000`
- Deve carregar a página inicial da plataforma

### Banco de Dados
- Verifique se as tabelas foram criadas:
  ```sql
  USE rota_ataque_questoes;
  SHOW TABLES;
  ```

## 🔧 Scripts Disponíveis

### Projeto Principal
```bash
npm run dev          # Executa backend e frontend simultaneamente
npm run server       # Executa apenas o backend
npm run client       # Executa apenas o frontend
npm run build        # Build do frontend para produção
npm run install-all  # Instala todas as dependências
```

### Backend (pasta server)
```bash
npm run dev          # Executa em modo desenvolvimento
npm start            # Executa em modo produção
npm run seed         # Executa o seed do banco
npm test             # Executa os testes
```

### Frontend (pasta client)
```bash
npm start            # Executa em modo desenvolvimento
npm run build        # Build para produção
npm test             # Executa os testes
```

## 🐛 Solução de Problemas

### Erro de conexão com banco de dados
- Verifique se o MySQL está rodando
- Confirme as credenciais no arquivo `.env`
- Teste a conexão: `mysql -u seu_usuario -p`

### Erro de porta em uso
- Verifique se as portas 3000 e 3001 estão livres
- Mate processos se necessário: `npx kill-port 3000 3001`

### Erro de dependências
- Delete as pastas `node_modules` e reinstale:
  ```bash
  rm -rf node_modules
  rm -rf server/node_modules
  rm -rf client/node_modules
  npm run install-all
  ```

### Erro de permissão (Linux/Mac)
```bash
sudo chown -R $USER:$USER .
```

## 📁 Estrutura do Projeto

```
rota-de-ataque-questoes/
├── server/                 # Backend Node.js
│   ├── config/            # Configurações
│   ├── controllers/       # Controladores
│   ├── middleware/        # Middlewares
│   ├── models/           # Modelos do banco
│   ├── routes/           # Rotas da API
│   ├── uploads/          # Arquivos enviados
│   ├── utils/            # Utilitários
│   ├── index.js          # Arquivo principal
│   ├── seed.js           # Seed do banco
│   └── package.json
├── client/                # Frontend React
│   ├── public/           # Arquivos públicos
│   ├── src/              # Código fonte
│   │   ├── components/   # Componentes React
│   │   ├── contexts/     # Contextos
│   │   ├── pages/        # Páginas
│   │   ├── services/     # Serviços da API
│   │   ├── styles/       # Estilos
│   │   ├── types/        # Tipos TypeScript
│   │   └── utils/        # Utilitários
│   └── package.json
├── package.json           # Scripts principais
└── README.md
```

## 🔐 Configuração de Produção

Para configurar em produção:

1. **Configure as variáveis de ambiente:**
   ```env
   NODE_ENV=production
   ASAAS_ENVIRONMENT=production
   # Configure as demais variáveis com valores de produção
   ```

2. **Build do frontend:**
   ```bash
   cd client
   npm run build
   ```

3. **Configure um servidor web (nginx) para servir o frontend**

4. **Use PM2 para gerenciar o processo Node.js:**
   ```bash
   npm install -g pm2
   pm2 start server/index.js --name "rota-ataque-api"
   ```

## 📞 Suporte

Se encontrar problemas durante a instalação:

1. Verifique se todos os pré-requisitos estão instalados
2. Confirme se as configurações do banco estão corretas
3. Verifique os logs de erro no terminal
4. Abra uma issue no GitHub com detalhes do erro

---

**Boa sorte com seus estudos! 🎯**

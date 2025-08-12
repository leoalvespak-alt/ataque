# 📚 Documentação Completa - Rota de Ataque Questões

## 📋 Índice
1. [Visão Geral do Projeto](#visão-geral)
2. [Requisitos Iniciais](#requisitos-iniciais)
3. [Problemas Encontrados e Soluções](#problemas-encontrados)
4. [Configuração do Ambiente](#configuração-ambiente)
5. [Estrutura do Projeto](#estrutura-projeto)
6. [Comandos Executados](#comandos-executados)
7. [Próximos Passos](#próximos-passos)
8. [Referências](#referências)

---

## 🎯 Visão Geral do Projeto

### **Objetivo**
Criar uma plataforma online robusta, intuitiva e escalável para estudo focado em concursos públicos, com o nome "Rota de Ataque Questões".

### **Características Principais**
- **Modelo Freemium**: Acesso gratuito limitado (10 questões) + assinaturas pagas
- **Integração Asaas**: Sistema de pagamentos
- **Gamificação**: Sistema de XP e ranking
- **Painel Admin**: Gestão completa da plataforma
- **Design Responsivo**: Funciona em desktop, tablet e mobile

### **Tecnologias Utilizadas**
- **Backend**: Node.js + Express.js + MySQL + Sequelize
- **Frontend**: React 18 + TypeScript
- **Autenticação**: JWT
- **Pagamentos**: API Asaas
- **Estilização**: Styled Components

---

## 🔧 Requisitos Iniciais

### **Software Necessário**
1. **Node.js** (versão LTS)
   - Download: https://nodejs.org/
   - Instalação padrão com PATH

2. **MySQL** (versão 8.0+)
   - Download: https://dev.mysql.com/downloads/installer/
   - Instalação com senha root configurada

3. **Git** (opcional, para versionamento)

### **Recursos do Sistema**
- **RAM**: Mínimo 4GB (recomendado 8GB+)
- **Espaço**: Mínimo 2GB livres
- **Sistema**: Windows 10/11

---

## ⚠️ Problemas Encontrados e Soluções

### **1. Problema: Permissões de Arquivo**
```
Error: EPERM: operation not permitted, open 'C:\package.json'
```
**Solução**: Criar projeto em pasta do usuário (`C:\Users\Lenovo\rota-de-ataque-questoes`)

### **2. Problema: Comando && no PowerShell**
```
O token '&&' não é um separador de instruções válido nesta versão.
```
**Solução**: Separar comandos em linhas individuais

### **3. Problema: MySQL não encontrado no PATH**
```
mysql : O termo 'mysql' não é reconhecido como nome de cmdlet
```
**Solução**: 
- Usar caminho completo: `"C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe"`
- Adicionar ao PATH: `$env:PATH += ";C:\Program Files\MySQL\MySQL Server 8.0\bin"`

### **4. Problema: Node.js não encontrado no PATH**
```
node : O termo 'node' não é reconhecido como nome de cmdlet
```
**Solução**: 
- Adicionar ao PATH: `$env:PATH += ";C:\Program Files\nodejs"`
- Reiniciar terminal ou computador

### **5. Problema: Package.json inválido**
```
Error: Invalid package config
```
**Solução**: Recriar arquivo package.json usando `npm init -y`

---

## 🛠️ Configuração do Ambiente

### **1. Instalação do Node.js**
```bash
# Verificar instalação
node --version
npm --version

# Adicionar ao PATH (se necessário)
$env:PATH += ";C:\Program Files\nodejs"
```

### **2. Instalação do MySQL**
```bash
# Verificar instalação
mysql --version

# Adicionar ao PATH (se necessário)
$env:PATH += ";C:\Program Files\MySQL\MySQL Server 8.0\bin"

# Criar banco de dados
mysql -u root -p -e "CREATE DATABASE IF NOT EXISTS rota_ataque_questoes;"
```

### **3. Configuração do Projeto**
```bash
# Navegar para pasta do projeto
cd C:\Users\Lenovo\rota-de-ataque-questoes

# Instalar dependências
npm run install-all

# Configurar variáveis de ambiente
cd server
# Criar arquivo .env com configurações do banco
```

---

## 📁 Estrutura do Projeto

```
rota-de-ataque-questoes/
├── package.json                 # Configuração principal
├── doc/                         # Documentação
│   └── DOCUMENTACAO_COMPLETA.md
├── server/                      # Backend
│   ├── package.json            # Dependências do servidor
│   ├── .env                    # Variáveis de ambiente
│   ├── index.js                # Servidor principal
│   ├── config/                 # Configurações
│   ├── models/                 # Modelos Sequelize
│   ├── routes/                 # Rotas da API
│   ├── middleware/             # Middlewares
│   └── seed.js                 # Dados iniciais
├── client/                     # Frontend
│   ├── package.json            # Dependências do cliente
│   ├── public/                 # Arquivos públicos
│   └── src/                    # Código fonte React
├── README.md                   # Documentação principal
├── INSTALACAO.md              # Guia de instalação
└── RESUMO.md                  # Resumo executivo
```

---

## 💻 Comandos Executados

### **Criação da Estrutura**
```bash
# Criar pasta do projeto
mkdir rota-de-ataque-questoes
cd rota-de-ataque-questoes

# Criar pastas principais
mkdir server
mkdir client
mkdir doc
```

### **Configuração do Backend**
```bash
cd server

# Criar package.json
npm init -y

# Instalar dependências
npm install express cors helmet express-rate-limit dotenv mysql2 sequelize bcryptjs jsonwebtoken multer axios express-validator moment uuid

# Criar arquivo .env
echo "DB_HOST=localhost" > .env
echo "DB_PORT=3306" >> .env
echo "DB_NAME=rota_ataque_questoes" >> .env
echo "DB_USER=root" >> .env
echo "DB_PASS=123456" >> .env
echo "JWT_SECRET=rota_ataque_jwt_secret_2024_super_seguro" >> .env
echo "PORT=3001" >> .env
```

### **Configuração do Frontend**
```bash
cd ../client

# Criar aplicação React
npx create-react-app . --template typescript

# Instalar dependências adicionais
npm install react-router-dom @types/react-router-dom styled-components @types/styled-components react-query axios react-hook-form react-hot-toast lucide-react date-fns react-markdown react-syntax-highlighter
```

### **Configuração Principal**
```bash
cd ..

# Criar package.json principal
echo '{
  "name": "rota-de-ataque-questoes",
  "version": "1.0.0",
  "description": "Plataforma de estudo para concursos públicos",
  "main": "server/index.js",
  "scripts": {
    "dev": "concurrently \"npm run server\" \"npm run client\"",
    "server": "cd server && npm run dev",
    "client": "cd client && npm start",
    "build": "cd client && npm run build",
    "install-all": "npm install && cd server && npm install && cd ../client && npm install"
  },
  "keywords": ["concursos", "questões", "estudo", "plataforma"],
  "author": "Rota de Ataque Questões",
  "license": "MIT",
  "devDependencies": {
    "concurrently": "^8.2.2"
  }
}' > package.json

# Instalar concurrently
npm install
```

---

## 🚀 Próximos Passos

### **Após Reiniciar o Computador**

1. **Verificar Instalações**
```bash
node --version
npm --version
mysql --version
```

2. **Navegar para o Projeto**
```bash
cd C:\Users\Lenovo\rota-de-ataque-questoes
```

3. **Instalar Dependências**
```bash
npm run install-all
```

4. **Configurar Banco de Dados**
```bash
cd server
npm run seed
```

5. **Iniciar Aplicação**
```bash
cd ..
npm run dev
```

### **Acessos da Aplicação**
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001
- **Admin Panel**: http://localhost:3000/admin

### **Credenciais Padrão**
- **Email**: admin@rotaataque.com
- **Senha**: admin123
- **Tipo**: Gestor (Admin)

---

## 📊 Status Atual do Projeto

### ✅ **Concluído**
- [x] Estrutura básica do projeto
- [x] Configuração do Node.js
- [x] Configuração do MySQL
- [x] Package.json principal
- [x] Package.json do servidor
- [x] Arquivo .env básico
- [x] Instalação de dependências do servidor
- [x] Documentação completa

### ⏳ **Pendente**
- [ ] Criação dos modelos Sequelize
- [ ] Implementação das rotas da API
- [ ] Configuração do frontend React
- [ ] Implementação do sistema de autenticação
- [ ] Integração com Asaas
- [ ] Sistema de gamificação
- [ ] Painel administrativo
- [ ] Testes da aplicação

---

## 🔗 Referências

### **Documentação Oficial**
- [Node.js](https://nodejs.org/docs/)
- [Express.js](https://expressjs.com/)
- [React](https://reactjs.org/docs/)
- [MySQL](https://dev.mysql.com/doc/)
- [Sequelize](https://sequelize.org/docs/)

### **Tutoriais Úteis**
- [Configuração do PATH no Windows](https://www.windows-commandline.com/set-path-environment-variable/)
- [Instalação do MySQL no Windows](https://dev.mysql.com/doc/refman/8.0/en/windows-installation.html)
- [Criação de aplicação React com TypeScript](https://create-react-app.dev/docs/adding-typescript/)

### **Ferramentas de Desenvolvimento**
- [Visual Studio Code](https://code.visualstudio.com/)
- [MySQL Workbench](https://www.mysql.com/products/workbench/)
- [Postman](https://www.postman.com/) (para testar APIs)

---

## 📝 Notas Importantes

### **Segurança**
- Nunca commitar arquivos `.env` no Git
- Usar variáveis de ambiente para credenciais
- Configurar HTTPS em produção

### **Performance**
- Usar índices no banco de dados
- Implementar cache quando necessário
- Otimizar queries do Sequelize

### **Manutenção**
- Manter dependências atualizadas
- Fazer backup regular do banco
- Monitorar logs de erro

---

## 📞 Suporte

Para dúvidas ou problemas:
1. Verificar esta documentação
2. Consultar logs de erro
3. Verificar configurações do ambiente
4. Reiniciar serviços se necessário

---

**Última atualização**: 12/08/2025  
**Versão**: 1.0.0  
**Autor**: Assistente de Desenvolvimento


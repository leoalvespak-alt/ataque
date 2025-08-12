# Rota de Ataque Questões

Uma plataforma completa de estudo para concursos públicos com modelo freemium, desenvolvida com React, Node.js e MySQL.

## 🎯 Sobre o Projeto

A **Rota de Ataque Questões** é uma plataforma robusta e escalável para estudo focado em concursos públicos, oferecendo:

- **Modelo Freemium**: Acesso gratuito limitado e assinaturas Premium
- **Banco de Questões**: Sistema completo de filtros e resolução
- **Gamificação**: Sistema de XP e ranking
- **Integração de Pagamentos**: Processamento via Asaas
- **Painel Administrativo**: Gestão completa do conteúdo
- **Design Responsivo**: Interface moderna e intuitiva

## 🚀 Tecnologias Utilizadas

### Backend
- **Node.js** com Express
- **MySQL** com Sequelize ORM
- **JWT** para autenticação
- **bcryptjs** para criptografia
- **Multer** para upload de arquivos
- **Axios** para integração com APIs

### Frontend (a ser implementado)
- **React** com TypeScript
- **Styled Components** ou **Tailwind CSS**
- **React Router** para navegação
- **Axios** para requisições HTTP
- **React Hook Form** para formulários

## 📋 Pré-requisitos

- Node.js (versão 16 ou superior)
- MySQL (versão 8.0 ou superior)
- npm ou yarn

## 🛠️ Instalação

### 1. Clone o repositório
```bash
git clone <url-do-repositorio>
cd rota-de-ataque-questoes
```

### 2. Instale as dependências
```bash
npm run install-all
```

### 3. Configure o banco de dados
1. Crie um banco MySQL chamado `rota_ataque_questoes`
2. Copie o arquivo `server/env.example` para `server/.env`
3. Configure as variáveis de ambiente:

```env
# Configurações do Banco de Dados
DB_HOST=localhost
DB_PORT=3306
DB_NAME=rota_ataque_questoes
DB_USER=seu_usuario
DB_PASS=sua_senha

# Configurações do JWT
JWT_SECRET=seu_jwt_secret_super_seguro_aqui
JWT_EXPIRES_IN=7d

# Configurações do Asaas
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

### 4. Execute as migrações
```bash
cd server
npm run dev
```

O servidor irá sincronizar automaticamente o banco de dados na primeira execução.

## 🏃‍♂️ Como Executar

### Desenvolvimento
```bash
# Executar backend e frontend simultaneamente
npm run dev

# Ou executar separadamente
npm run server  # Backend na porta 3001
npm run client  # Frontend na porta 3000
```

### Produção
```bash
# Build do frontend
npm run build

# Executar apenas o servidor
npm run server
```

## 📊 Estrutura do Banco de Dados

### Tabelas Principais

- **usuarios**: Cadastro de alunos e gestores
- **disciplinas**: Categorias de disciplinas
- **assuntos**: Assuntos dentro das disciplinas
- **bancas**: Bancas examinadoras
- **orgaos**: Órgãos que realizam concursos
- **questoes**: Banco de questões
- **respostas_usuarios**: Respostas dos alunos
- **comentarios_alunos**: Comentários nas questões
- **planos_assinatura**: Planos disponíveis
- **assinaturas_usuarios**: Assinaturas ativas
- **configuracoes_plataforma**: Configurações gerais

## 🔐 Autenticação e Autorização

### Tipos de Usuário
- **aluno**: Usuários que estudam na plataforma
- **gestor**: Administradores com acesso ao painel

### Níveis de Acesso
- **gratuito**: Limite de 10 questões
- **premium**: Acesso ilimitado

## 💳 Integração com Pagamentos

### Asaas
- Criação de clientes
- Geração de assinaturas
- Processamento de pagamentos
- Webhooks para atualizações automáticas

### Planos Disponíveis
- **Mensal**: Renovação automática mensal
- **Anual**: Renovação automática anual com desconto

## 🎮 Sistema de Gamificação

### XP (Pontos de Experiência)
- **+20 XP** por questão acertada
- **0 XP** por questão errada
- Ranking baseado no XP acumulado

### Ranking
- **Geral**: Todos os tempos
- **Mensal**: Últimos 30 dias
- **Semanal**: Últimos 7 dias

## 🎨 Identidade Visual

### Paleta de Cores
- **Fundo Principal**: `#1b1b1b` (preto/cinza escuro)
- **Cor de Destaque**: `#c1121f` (vermelho escuro)
- **Texto**: `#f2f2f2` (branco/cinza claro)
- **Sucesso**: `#28a745` (verde)
- **Erro**: `#dc3545` (vermelho)
- **Informativo**: `#007bff` (azul)

## 📱 Funcionalidades Principais

### Área do Aluno
- ✅ Cadastro e login
- ✅ Filtros avançados de questões
- ✅ Resolução de questões
- ✅ Sistema de feedback
- ✅ Comentários em questões
- ✅ Perfil e estatísticas
- ✅ Ranking
- ✅ Gestão de assinatura

### Painel do Gestor
- ✅ Dashboard com estatísticas
- ✅ CRUD de disciplinas e assuntos
- ✅ CRUD de questões
- ✅ Aprovação de comentários
- ✅ Gestão de assinaturas
- ✅ Upload de logo
- ✅ Configurações da plataforma

## 🔧 API Endpoints

### Autenticação
- `POST /api/auth/cadastro` - Cadastro de usuário
- `POST /api/auth/login` - Login
- `GET /api/auth/verificar` - Verificar token

### Questões
- `GET /api/questions` - Listar questões com filtros
- `GET /api/questions/:id` - Buscar questão específica
- `POST /api/questions/:id/responder` - Responder questão
- `GET /api/questions/:id/comentarios` - Comentários da questão
- `POST /api/questions/:id/comentarios` - Adicionar comentário

### Categorias
- `GET /api/categories/disciplinas` - Listar disciplinas
- `GET /api/categories/assuntos/:disciplina_id` - Assuntos por disciplina
- `GET /api/categories/bancas` - Listar bancas
- `GET /api/categories/orgaos` - Listar órgãos

### Usuários
- `GET /api/users/perfil` - Perfil do usuário
- `GET /api/users/estatisticas` - Estatísticas do usuário
- `GET /api/users/ranking` - Ranking de usuários
- `PUT /api/users/perfil` - Atualizar perfil

### Assinaturas
- `GET /api/subscriptions/planos` - Planos disponíveis
- `GET /api/subscriptions/minha-assinatura` - Assinatura ativa
- `POST /api/subscriptions/criar-assinatura` - Criar assinatura
- `POST /api/subscriptions/cancelar-assinatura` - Cancelar assinatura

### Admin (Apenas Gestores)
- `GET /api/admin/dashboard` - Dashboard administrativo
- `GET /api/admin/questoes` - Listar questões (admin)
- `POST /api/admin/questoes` - Criar questão
- `GET /api/admin/comentarios` - Listar comentários
- `PUT /api/admin/comentarios/:id/aprovar` - Aprovar comentário
- `POST /api/admin/upload-logo` - Upload de logo

## 🚀 Deploy

### Variáveis de Ambiente para Produção
```env
NODE_ENV=production
ASAAS_ENVIRONMENT=production
# Configure as demais variáveis com valores de produção
```

### Recomendações
- Use HTTPS em produção
- Configure um proxy reverso (nginx)
- Use PM2 para gerenciar processos Node.js
- Configure backup automático do banco de dados

## 🤝 Contribuição

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## 📞 Suporte

Para suporte, envie um email para suporte@rotadeataque.com ou abra uma issue no GitHub.

## 🗺️ Roadmap

- [ ] Implementação do frontend React
- [ ] Sistema de notificações
- [ ] App mobile (React Native)
- [ ] Sistema de simulados
- [ ] Relatórios avançados
- [ ] Integração com mais gateways de pagamento
- [ ] Sistema de afiliados
- [ ] API pública para terceiros

---

**Rota de Ataque Questões** - Transformando o estudo para concursos públicos! 🎯

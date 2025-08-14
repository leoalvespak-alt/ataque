# Rota de Ataque Questões - Frontend

## 🚀 Configuração Rápida

### 1. Instalar Dependências
```bash
npm install
```

### 2. Configurar Variáveis de Ambiente
Crie um arquivo `.env` na raiz do projeto com:
```env
VITE_SUPABASE_URL=https://cfwyuomeaudpnmjosetq.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNmd3l1b21lYXVkcG5tam9zZXRxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUwNTEyMjYsImV4cCI6MjA3MDYyNzIyNn0.4tE2STnUzVSR1OcsNCxWUEkiPG6Sph4-OUnA9h54gf8
```

### 3. Iniciar o Servidor de Desenvolvimento
```bash
npm run dev
```

O projeto estará disponível em: http://localhost:3000

## 📁 Estrutura do Projeto

```
src/
├── components/          # Componentes reutilizáveis
├── contexts/           # Contextos React (Auth, etc.)
├── lib/               # Configurações (Supabase, etc.)
├── pages/             # Páginas da aplicação
│   ├── admin/         # Páginas de administração
│   └── ...            # Outras páginas
├── services/          # Serviços de API
├── styles/            # Estilos globais
└── types/             # Definições TypeScript
```

## 🔧 Tecnologias Utilizadas

- **React 18** - Framework principal
- **TypeScript** - Tipagem estática
- **Vite** - Build tool e dev server
- **Tailwind CSS** - Framework de estilos
- **React Router** - Roteamento
- **Supabase** - Backend como serviço
- **React Hot Toast** - Notificações

## 🎯 Funcionalidades

### ✅ Implementadas
- ✅ Sistema de autenticação com Supabase
- ✅ Roteamento protegido
- ✅ Páginas de login e cadastro
- ✅ Dashboard básico
- ✅ Painel de administração
- ✅ Design responsivo com Tailwind CSS

### 🚧 Em Desenvolvimento
- 🔄 Página de questões
- 🔄 Sistema de ranking
- 🔄 Gerenciamento de planos
- 🔄 Perfil do usuário
- 🔄 Funcionalidades de administração

## 🔐 Credenciais de Teste

**Admin:**
- Email: admin@rotadeataque.com
- Senha: 123456

**Aluno:**
- Email: joao@teste.com
- Senha: 123456

## 📝 Scripts Disponíveis

- `npm run dev` - Inicia o servidor de desenvolvimento
- `npm run build` - Gera build de produção
- `npm run preview` - Visualiza o build de produção

## 🌐 URLs Importantes

- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:3002
- **Supabase Dashboard:** https://supabase.com/dashboard/project/cfwyuomeaudpnmjosetq

## 🐛 Solução de Problemas

### Erro de Conexão com Supabase
1. Verifique se as variáveis de ambiente estão configuradas
2. Confirme se o projeto Supabase está ativo
3. Verifique se as chaves estão corretas

### Erro de Dependências
1. Delete a pasta `node_modules`
2. Delete o arquivo `package-lock.json`
3. Execute `npm install` novamente

### Erro de Porta em Uso
1. Verifique se a porta 3000 está livre
2. Ou altere a porta no `vite.config.js`

## 📞 Suporte

Para dúvidas ou problemas, consulte a documentação do projeto ou entre em contato com a equipe de desenvolvimento.

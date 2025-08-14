# 🚀 Configuração Completa do Supabase

## 📋 Pré-requisitos

1. **Conta no Supabase**: https://supabase.com
2. **Projeto criado**: `cfwyuomeaudpnmjosetq`

## 🔑 Passo 1: Obter as Chaves de API

### 1.1 Acesse o Painel do Supabase
- Vá para: https://supabase.com/dashboard
- Faça login na sua conta

### 1.2 Selecione o Projeto
- Clique no projeto: `cfwyuomeaudpnmjosetq`
- Ou acesse diretamente: https://supabase.com/dashboard/project/cfwyuomeaudpnmjosetq

### 1.3 Vá para Configurações de API
- No menu lateral, clique em **Settings**
- Clique em **API**
- Ou acesse diretamente: https://supabase.com/dashboard/project/cfwyuomeaudpnmjosetq/settings/api

### 1.4 Copie as Chaves
Você verá duas chaves importantes:

```
📍 Project URL: https://cfwyuomeaudpnmjosetq.supabase.co
🔑 anon/public key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNmd3l1b21lYXVkcG5tam9zZXRxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUwNTEyMjYsImV4cCI6MjA3MDYyNzIyNn0.4tE2STnUzVSR1OcsNCxWUEkiPG6Sph4-OUnA9h54gf8
🔐 service_role key: sbp_749107e23b0c4368bf1d98c4677a3dff34f737d8
```

## 🗄️ Passo 2: Criar o Banco de Dados

### 2.1 Acesse o SQL Editor
- No menu lateral, clique em **SQL Editor**
- Ou acesse: https://supabase.com/dashboard/project/cfwyuomeaudpnmjosetq/sql

### 2.2 Execute o Schema
- Clique em **New Query**
- Cole todo o conteúdo do arquivo `supabase-schema.sql`
- Clique em **Run** para executar

### 2.3 Verifique as Tabelas
- No menu lateral, clique em **Table Editor**
- Verifique se todas as tabelas foram criadas:
  - `disciplinas`
  - `assuntos`
  - `bancas`
  - `anos`
  - `escolaridades`
  - `orgaos`
  - `questoes`
  - `alternativas`
  - `usuarios`
  - `respostas_alunos`
  - `comentarios_questoes`
  - `cadernos`
  - `cadernos_questoes`

## 🔒 Passo 3: Configurar RLS (Row Level Security)

### 3.1 Verificar Políticas
- No **Table Editor**, clique em cada tabela
- Verifique se **RLS** está habilitado
- Verifique se as políticas foram criadas

### 3.2 Políticas Implementadas
O schema já inclui políticas para:
- ✅ Usuários podem ver apenas seus próprios dados
- ✅ Gestores podem ver todos os dados
- ✅ Questões são públicas para leitura
- ✅ Comentários são públicos para leitura

## ⚙️ Passo 4: Atualizar as Chaves no Projeto

### 4.1 Atualizar service_role key
Edite o arquivo `test-supabase-connection.js`:

```javascript
const SUPABASE_SERVICE_KEY = 'SUA_SERVICE_ROLE_KEY_AQUI';
```

### 4.2 Atualizar anon key
Edite o arquivo `client/src/lib/supabase.js`:

```javascript
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || 'SUA_ANON_KEY_AQUI';
```

### 4.3 Criar arquivo .env (opcional)
Crie um arquivo `.env` na raiz do projeto:

```env
VITE_SUPABASE_URL=https://cfwyuomeaudpnmjosetq.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNmd3l1b21lYXVkcG5tam9zZXRxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUwNTEyMjYsImV4cCI6MjA3MDYyNzIyNn0.4tE2STnUzVSR1OcsNCxWUEkiPG6Sph4-OUnA9h54gf8
SUPABASE_SERVICE_KEY=sbp_749107e23b0c4368bf1d98c4677a3dff34f737d8
```

## 🧪 Passo 5: Testar a Configuração

### 5.1 Testar Conexão
Execute o script de teste:

```bash
node test-supabase-connection.js
```

### 5.2 Resultado Esperado
```
🔍 Testando conexão com o Supabase...

1️⃣ Testando conexão básica...
✅ Conexão estabelecida com sucesso!

2️⃣ Verificando tabelas...
✅ Tabela 'disciplinas' encontrada
✅ Tabela 'assuntos' encontrada
✅ Tabela 'bancas' encontrada
...

3️⃣ Verificando dados iniciais...
✅ Dados iniciais encontrados
```

## 🚨 Solução de Problemas

### Problema: "Invalid API key"
**Solução:**
1. Verifique se copiou a chave completa
2. Certifique-se de usar a chave correta (anon vs service_role)
3. Verifique se o projeto está ativo

### Problema: "Connection failed"
**Solução:**
1. Verifique se a URL do projeto está correta
2. Verifique se o projeto não foi pausado
3. Verifique sua conexão com a internet

### Problema: "Table not found"
**Solução:**
1. Execute novamente o script `supabase-schema.sql`
2. Verifique se não houve erros durante a execução
3. Verifique se todas as tabelas foram criadas

## 📞 Suporte

Se ainda tiver problemas:
1. Verifique os logs no painel do Supabase
2. Consulte a documentação: https://supabase.com/docs
3. Entre em contato com o suporte do Supabase

## ✅ Checklist Final

- [ ] Chaves de API obtidas
- [ ] Schema executado com sucesso
- [ ] Tabelas criadas
- [ ] RLS configurado
- [ ] Chaves atualizadas no projeto
- [ ] Teste de conexão passou
- [ ] Dados iniciais carregados

---

**🎉 Parabéns! Seu banco de dados Supabase está configurado e pronto para uso!**

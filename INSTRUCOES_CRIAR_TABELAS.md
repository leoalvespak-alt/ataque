# 🔧 **INSTRUÇÕES PARA CRIAR AS TABELAS NO SUPABASE**

## 🎯 **Problema Identificado**
O erro "Could not find the table 'public.disciplinas' in the schema cache" indica que as tabelas não existem no banco de dados do Supabase.

## 📋 **Solução: Criar as Tabelas**

### **Passo 1: Acesse o Painel do Supabase**
1. Vá para: https://supabase.com/dashboard
2. Faça login na sua conta
3. Selecione o projeto: `cfwyuomeaudpnmjosetq`

### **Passo 2: Acesse o SQL Editor**
1. No menu lateral, clique em **"SQL Editor"**
2. Ou acesse diretamente: https://supabase.com/dashboard/project/cfwyuomeaudpnmjosetq/sql

### **Passo 3: Execute o Script SQL**
1. Clique em **"New query"** (Nova consulta)
2. Copie todo o conteúdo do arquivo `create-tables.sql` que foi criado
3. Cole no editor SQL
4. Clique em **"Run"** (Executar)

### **Passo 4: Verificar a Execução**
Após executar, você deve ver mensagens de sucesso como:
- ✅ Tabelas criadas
- ✅ Índices criados
- ✅ Políticas RLS configuradas
- ✅ Dados iniciais inseridos

## 📋 **Verificar se as Tabelas Foram Criadas**

### **Passo 1: Verificar Tabelas**
1. No menu lateral, clique em **"Table Editor"**
2. Você deve ver as seguintes tabelas:
   - `disciplinas`
   - `assuntos`
   - `bancas`
   - `anos`
   - `escolaridades`
   - `orgaos`
   - `questoes`
   - `usuarios`
   - `respostas_usuarios`
   - `comentarios_alunos`
   - `patentes`
   - `favoritos_questoes`
   - `cadernos`
   - `cadernos_questoes`

### **Passo 2: Verificar Dados Iniciais**
1. Clique na tabela `disciplinas`
2. Você deve ver disciplinas como:
   - Matemática
   - Português
   - História
   - Geografia
   - Ciências
   - etc.

## 📋 **Testar o Sistema**

### **Passo 1: Iniciar o Frontend**
```bash
cd client
npm run dev
```

### **Passo 2: Testar o Login**
1. Acesse: http://localhost:3000
2. Faça login com:
   - Email: `admin@rotadeataque.com`
   - Senha: `123456`

### **Passo 3: Testar as Páginas de Admin**
1. Após fazer login, vá para **"Admin"**
2. Teste **"Gerenciar Categorias"**
3. Teste **"Gerenciar Questões"**

## 🚨 **Se Ainda Houver Problemas**

### **Verificar Políticas RLS**
1. No menu lateral, clique em **"Authentication"** > **"Policies"**
2. Verifique se as políticas foram criadas para todas as tabelas

### **Verificar Configurações de Autenticação**
1. Vá para **"Authentication"** > **"Settings"**
2. Verifique se **"Enable email confirmations"** está **desmarcado**

### **Verificar Site URL**
1. Em **"Authentication"** > **"Settings"**
2. Verifique se **"Site URL"** está configurado como `http://localhost:3000`

## 📞 **Próximos Passos**

1. **Execute o script SQL** no painel do Supabase
2. **Verifique se as tabelas foram criadas**
3. **Teste o sistema** no frontend
4. **Me informe o resultado** - se funcionou ou se ainda há problemas

---

**🎯 Execute o script SQL primeiro e depois teste o sistema!**

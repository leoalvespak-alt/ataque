# 🔧 **INSTRUÇÕES PARA CRIAR TABELA USUARIOS NO SUPABASE**

## 🎯 **Problema Identificado**
- Os usuários foram criados no Supabase Auth, mas a tabela `usuarios` não existe
- O login falha porque não consegue buscar os dados do usuário na tabela

## 📋 **Passo a Passo para Resolver**

### **1. Acesse o Supabase Dashboard**
1. Vá para: https://supabase.com/dashboard
2. Faça login na sua conta
3. Selecione o projeto: `cfwyuomeaudpnmjosetq`

### **2. Abra o SQL Editor**
1. No menu lateral, clique em **"SQL Editor"**
2. Clique em **"New query"** para criar uma nova query

### **3. Execute o SQL**
1. Copie todo o conteúdo do arquivo `create-usuarios-table.sql`
2. Cole no editor SQL
3. Clique em **"Run"** para executar

### **4. Verificar se Funcionou**
Após executar, você deve ver uma mensagem como:
```
Tabela usuarios criada com sucesso! | 2
```

## 🔍 **Verificar Usuários Criados**

### **No Supabase Dashboard:**
1. Vá para **"Authentication"** > **"Users"**
2. Você deve ver os usuários:
   - admin@rotadeataque.com
   - joao@teste.com

### **No SQL Editor:**
Execute esta query para verificar:
```sql
SELECT * FROM usuarios;
```

## 🧪 **Testar o Login**

Após criar a tabela:

1. **Acesse:** http://localhost:3000
2. **Faça login com:**
   - Email: admin@rotadeataque.com
   - Senha: 123456

3. **Verifique o console (F12)** - deve aparecer:
   ```
   Formulário submetido: {email: "admin@rotadeataque.com", senha: "123456"}
   Chamando função login...
   Iniciando login com: admin@rotadeataque.com
   Resposta do Supabase Auth: {authData: {session: {...}, user: {...}}, error: null}
   Sessão criada, buscando dados do usuário...
   Dados do usuário: {userData: {...}, userError: null}
   Login realizado com sucesso!
   Resultado do login: true
   ```

## 🚨 **Se Ainda Não Funcionar**

### **Problema: Email não confirmado**
Se o login falhar com "Invalid login credentials", pode ser que o email não foi confirmado:

1. **No Supabase Dashboard:**
   - Vá para **"Authentication"** > **"Users"**
   - Encontre o usuário
   - Clique nos **3 pontos** > **"Confirm user"**

### **Problema: Tabela não criada**
Se a tabela não foi criada:

1. **Verifique se você tem permissões** no projeto Supabase
2. **Tente executar o SQL novamente**
3. **Verifique se não há erros** no console do SQL Editor

## 📞 **Próximos Passos**

1. **Execute o SQL** conforme as instruções acima
2. **Teste o login** com as credenciais
3. **Me informe o resultado** - se funcionou ou se ainda há problemas

---

**🎯 Execute o SQL e teste o login para resolvermos o problema!**

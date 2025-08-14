# 🔧 **SOLUÇÃO PARA O PROBLEMA "EMAIL NOT CONFIRMED"**

## 🎯 **Problema Identificado**
O Supabase está configurado para exigir confirmação de email, mas os usuários criados não tiveram seus emails confirmados automaticamente.

## 📋 **Solução 1: Desabilitar Email Confirmation (Recomendado)**

### **Passo 1: Acesse o Painel do Supabase**
1. Vá para: https://supabase.com/dashboard
2. Faça login na sua conta
3. Selecione o projeto: `cfwyuomeaudpnmjosetq`

### **Passo 2: Vá para Authentication Settings**
1. No menu lateral, clique em **"Authentication"**
2. Clique em **"Settings"**
3. Ou acesse diretamente: https://supabase.com/dashboard/project/cfwyuomeaudpnmjosetq/auth/settings

### **Passo 3: Desabilitar Email Confirmation**
1. Role para baixo até a seção **"Email Auth"**
2. Encontre a opção **"Enable email confirmations"**
3. **Desmarque** essa opção
4. Clique em **"Save"**

### **Passo 4: Testar o Login**
Após desabilitar, teste o login:
- Email: `admin@rotadeataque.com`
- Senha: `123456`

## 📋 **Solução 2: Confirmar Usuários Manualmente**

### **Passo 1: Acesse Users**
1. No menu lateral, clique em **"Authentication"**
2. Clique em **"Users"**
3. Ou acesse: https://supabase.com/dashboard/project/cfwyuomeaudpnmjosetq/auth/users

### **Passo 2: Confirmar Cada Usuário**
1. Encontre o usuário `admin@rotadeataque.com`
2. Clique nos **3 pontos** ao lado do usuário
3. Clique em **"Confirm user"**
4. Repita o processo para `joao@teste.com`

### **Passo 3: Verificar Status**
Após confirmar, o status deve mudar de:
- ❌ **"Unconfirmed"** → ✅ **"Confirmed"**

## 📋 **Solução 3: Recriar Usuários (Se necessário)**

Se as soluções acima não funcionarem, podemos recriar os usuários:

### **Passo 1: Limpar Usuários Existentes**
1. No painel do Supabase, vá para **"Authentication"** > **"Users"**
2. Delete os usuários existentes:
   - `admin@rotadeataque.com`
   - `joao@teste.com`

### **Passo 2: Limpar Tabela usuarios**
Execute no SQL Editor:
```sql
DELETE FROM usuarios WHERE email IN ('admin@rotadeataque.com', 'joao@teste.com');
```

### **Passo 3: Recriar Usuários**
Execute o script:
```bash
cd server
node create-supabase-users.js
```

## 🧪 **Teste Após a Solução**

### **1. Teste o Login no Site**
1. Acesse: http://localhost:3000
2. Faça login com:
   - Email: `admin@rotadeataque.com`
   - Senha: `123456`

### **2. Verifique o Console (F12)**
Deve aparecer:
```
✅ Login realizado com sucesso!
Resultado do login: true
```

### **3. Verifique se o Usuário foi Carregado**
O usuário deve aparecer logado no sistema.

## 🚨 **Se Ainda Não Funcionar**

### **Verificar Configurações Adicionais**
1. **Site URL**: Verifique se está configurado como `http://localhost:3000`
2. **Redirect URLs**: Adicione `http://localhost:3000/**`
3. **CORS**: Verifique se `localhost:3000` está permitido

### **Verificar Tabela usuarios**
Execute no SQL Editor:
```sql
SELECT * FROM usuarios WHERE email IN ('admin@rotadeataque.com', 'joao@teste.com');
```

## 📞 **Próximos Passos**

1. **Execute a Solução 1** (desabilitar email confirmation)
2. **Teste o login** no site
3. **Me informe o resultado** - se funcionou ou se ainda há problemas

---

**🎯 A Solução 1 (desabilitar email confirmation) é a mais simples e recomendada!**

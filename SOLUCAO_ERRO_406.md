# 🔧 **SOLUÇÃO PARA O ERRO 406 NO LOGIN**

## 🎯 **Problema Identificado**
O login está funcionando (SIGNED_IN), mas há um erro 406 ao buscar os dados do usuário na tabela `usuarios`. Isso indica um problema com as políticas RLS (Row Level Security).

## 📋 **Solução: Corrigir Políticas RLS**

### **Passo 1: Acesse o SQL Editor do Supabase**
1. Vá para: https://supabase.com/dashboard
2. Selecione o projeto: `cfwyuomeaudpnmjosetq`
3. No menu lateral, clique em **"SQL Editor"**
4. Clique em **"New query"**

### **Passo 2: Execute o SQL de Correção**
1. Copie todo o conteúdo do arquivo `fix-rls-usuarios.sql`
2. Cole no editor SQL
3. Clique em **"Run"** para executar

### **Passo 3: Verificar se Funcionou**
Após executar, você deve ver uma tabela com as políticas criadas.

## 📋 **Alternativa: Desabilitar RLS Temporariamente**

Se a solução acima não funcionar, você pode desabilitar o RLS temporariamente:

### **Execute este SQL:**
```sql
-- Desabilitar RLS na tabela usuarios
ALTER TABLE usuarios DISABLE ROW LEVEL SECURITY;
```

## 📋 **Verificar se a Correção Funcionou**

### **1. Teste no Site**
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

**NÃO deve aparecer:**
```
❌ Erro ao buscar dados do usuário: Object
```

## 📋 **Se Ainda Não Funcionar**

### **Verificar Configurações Adicionais**
1. **Site URL**: Verifique se está configurado como `http://localhost:3000`
2. **Redirect URLs**: Adicione `http://localhost:3000/**`
3. **CORS**: Verifique se `localhost:3000` está permitido

### **Verificar Tabela usuarios**
Execute no SQL Editor:
```sql
SELECT * FROM usuarios WHERE email IN ('admin@rotadeataque.com', 'joao@teste.com');
```

## 📋 **Melhorias Implementadas no Código**

### **1. Delay na Busca de Dados**
Adicionei um delay de 500ms para garantir que a sessão esteja estabelecida antes de buscar os dados.

### **2. Busca Alternativa por Email**
Se a busca por ID falhar, o sistema tenta buscar por email como fallback.

### **3. Melhor Tratamento de Erro**
Logs mais detalhados para identificar problemas.

## 📞 **Próximos Passos**

1. **Execute o SQL** conforme as instruções acima
2. **Teste o login** no site
3. **Me informe o resultado** - se funcionou ou se ainda há problemas

---

**🎯 Execute o SQL e teste o login para resolvermos o problema!**

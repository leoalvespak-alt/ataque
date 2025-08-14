# 🎯 **GUIA VISUAL - CRIAR TABELA USUARIOS NO SUPABASE**

## 📋 **Passo a Passo Visual**

### **1. Acessar o Supabase Dashboard**
1. **Abra seu navegador**
2. **Vá para:** https://supabase.com/dashboard
3. **Faça login** na sua conta
4. **Clique no projeto:** `cfwyuomeaudpnmjosetq`

### **2. Encontrar o SQL Editor**
1. **No menu lateral esquerdo**, procure por **"SQL Editor"**
2. **Clique em "SQL Editor"**
3. **Você verá uma tela com um editor de código**

### **3. Criar Nova Query**
1. **Clique no botão "New query"** (geralmente no canto superior direito)
2. **Ou procure por um botão "+" ou "Add"**
3. **Uma nova aba/query será criada**

### **4. Executar o SQL**
1. **Cole este código SQL** no editor:

```sql
-- Criar a tabela usuarios
CREATE TABLE IF NOT EXISTS usuarios (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    tipo_usuario VARCHAR(20) NOT NULL DEFAULT 'aluno',
    status VARCHAR(20) NOT NULL DEFAULT 'gratuito',
    xp INTEGER NOT NULL DEFAULT 0,
    questoes_respondidas INTEGER NOT NULL DEFAULT 0,
    ultimo_login TIMESTAMP,
    profile_picture_url VARCHAR(255),
    ativo BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Habilitar RLS
ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;

-- Políticas de segurança
CREATE POLICY "Usuários podem ver apenas seus próprios dados" 
ON usuarios FOR SELECT 
USING (auth.uid()::text = id::text);

CREATE POLICY "Usuários podem atualizar apenas seus próprios dados" 
ON usuarios FOR UPDATE 
USING (auth.uid()::text = id::text);

CREATE POLICY "Usuários podem inserir seus próprios dados" 
ON usuarios FOR INSERT 
WITH CHECK (auth.uid()::text = id::text);
```

2. **Clique no botão "Run"** (geralmente verde)
3. **Ou pressione Ctrl+Enter**

### **5. Verificar se Funcionou**
1. **Você deve ver uma mensagem de sucesso**
2. **Ou uma tabela com resultados**
3. **Se houver erro, copie e cole aqui**

## 🔍 **Alternativas se Não Encontrar "SQL Editor"**

### **Opção A: Table Editor**
1. **Procure por "Table Editor" ou "Database"**
2. **Clique em "Create table"**
3. **Crie a tabela manualmente com os campos**

### **Opção B: Database**
1. **Procure por "Database" no menu**
2. **Clique em "Tables"**
3. **Procure por "Create table"**

### **Opção C: Schema**
1. **Procure por "Schema" ou "Database Schema"**
2. **Procure por opção de criar tabela**

## 📞 **Se Ainda Não Encontrar**

**Me envie um screenshot** da tela do Supabase Dashboard para que eu possa te ajudar melhor.

## 🧪 **Após Criar a Tabela**

1. **Teste o login** em http://localhost:3000
2. **Use as credenciais:**
   - Email: admin@rotadeataque.com
   - Senha: 123456
3. **Verifique o console (F12)** - deve funcionar!

---

**🎯 Siga o guia visual e me informe se conseguiu criar a tabela!**

# 📋 Guia Visual - Executar Schema SQL no Supabase

## 🎯 **Objetivo**
Criar todas as tabelas e dados iniciais no banco de dados Supabase para resolver o erro 404.

---

## 🚀 **Passo a Passo**

### **1. Acessar o Supabase Dashboard**
1. Vá para: https://supabase.com/dashboard
2. Faça login na sua conta
3. Clique no projeto: **AtaqueCursor** (cfwyuomeaudpnmjosetq)

### **2. Abrir o SQL Editor**
1. No menu lateral esquerdo, clique em **SQL Editor**
2. Clique no botão **New Query**

### **3. Executar o Schema**
1. **Copie todo o conteúdo** do arquivo `supabase-schema.sql`
2. **Cole no SQL Editor** do Supabase
3. **Clique no botão "Run"** (ou pressione Ctrl+Enter)

### **4. Verificar o Resultado**
Após executar, você deve ver:
- ✅ **Success** na mensagem de resultado
- ✅ Todas as tabelas criadas no **Table Editor**

---

## 📊 **Tabelas que Serão Criadas**

### **Tabelas de Referência:**
- ✅ `disciplinas` - Disciplinas (Matemática, Português, etc.)
- ✅ `assuntos` - Assuntos por disciplina
- ✅ `bancas` - Bancas examinadoras (CESPE, FGV, etc.)
- ✅ `anos` - Anos das questões (2015-2024)
- ✅ `escolaridades` - Níveis (Fundamental, Médio, Superior)
- ✅ `orgaos` - Órgãos (Tribunal, Ministério Público, etc.)

### **Tabelas Principais:**
- ✅ `questoes` - Banco de questões
- ✅ `usuarios` - Usuários da plataforma
- ✅ `respostas_alunos` - Respostas dos alunos
- ✅ `comentarios_alunos` - Comentários nas questões
- ✅ `cadernos` - Cadernos personalizados
- ✅ `cadernos_questoes` - Associação N:N

---

## 🧪 **Teste Após Execução**

### **1. Verificar no Table Editor**
1. No menu lateral, clique em **Table Editor**
2. Verifique se todas as tabelas aparecem na lista
3. Clique em cada tabela para ver os dados inseridos

### **2. Testar Conexão**
```bash
node test-supabase-correct-url.js
```

### **3. Testar Frontend**
```bash
cd client
npm run dev
```

---

## 🚨 **Se Houver Erros**

### **Erro: "relation already exists"**
- ✅ **Normal**: Algumas tabelas já existem
- ✅ **Continue**: O script continuará normalmente

### **Erro: "permission denied"**
- ❌ **Problema**: Verifique se está logado no projeto correto
- ❌ **Solução**: Confirme que está no projeto `cfwyuomeaudpnmjosetq`

### **Erro: "syntax error"**
- ❌ **Problema**: Verifique se copiou todo o conteúdo do arquivo
- ❌ **Solução**: Copie novamente o arquivo `supabase-schema.sql`

---

## 🎯 **Resultado Esperado**

Após executar o schema, você deve ver:

### **No SQL Editor:**
```
Success. No rows returned
```

### **No Table Editor:**
- ✅ 13 tabelas criadas
- ✅ Dados iniciais inseridos
- ✅ Relacionamentos configurados

### **No Frontend:**
- ✅ Sem erros 404
- ✅ Dados carregando corretamente
- ✅ Páginas funcionando normalmente

---

## 📞 **Suporte**

Se ainda houver problemas:
1. Verifique se está no projeto correto
2. Confirme que copiou todo o conteúdo do arquivo SQL
3. Tente executar o schema em partes menores
4. Verifique os logs de erro no SQL Editor

# 🔧 Correção do Erro: escolaridade_id nas Questões

## 📋 **Problema Identificado**

**Erro:** `null value in column "escolaridade_id" of relation "questoes" violates not-null constraint`

**Causa:** A tabela `questoes` tem uma coluna `escolaridade_id` que é obrigatória (NOT NULL), mas o código não estava enviando esse valor ao criar questões.

---

## 🚀 **Solução Implementada**

### **1. Script SQL para Corrigir o Banco**

Execute o script `corrigir-escolaridade-questoes.sql` no Supabase:

```sql
-- 1. Verificar se existem escolaridades
SELECT * FROM escolaridades;

-- 2. Se não existirem, inserir as escolaridades padrão
INSERT INTO escolaridades (nivel) VALUES 
('FUNDAMENTAL'),
('MEDIO'),
('SUPERIOR')
ON CONFLICT (nivel) DO NOTHING;

-- 3. Verificar se a coluna escolaridade_id existe
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'questoes' AND column_name = 'escolaridade_id';

-- 4. Se a coluna não existir, adicioná-la
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'questoes' AND column_name = 'escolaridade_id'
    ) THEN
        ALTER TABLE questoes ADD COLUMN escolaridade_id INTEGER REFERENCES escolaridades(id);
    END IF;
END $$;

-- 5. Atualizar questões existentes (padrão: MEDIO)
UPDATE questoes 
SET escolaridade_id = (SELECT id FROM escolaridades WHERE nivel = 'MEDIO' LIMIT 1)
WHERE escolaridade_id IS NULL;

-- 6. Tornar a coluna obrigatória
ALTER TABLE questoes ALTER COLUMN escolaridade_id SET NOT NULL;
```

### **2. Correções no Código TypeScript**

**Arquivo:** `client/src/pages/admin/AdminQuestoes.tsx`

**Mudanças implementadas:**

1. **Função `handleCreateQuestion`:**
   - Adicionada lógica para garantir que `escolaridade_id` sempre tenha um valor
   - Se não for selecionado, usa 'MEDIO' como padrão
   - Adicionado log para debug dos dados sendo enviados

2. **Função `handleSaveQuestion`:**
   - Mesma lógica aplicada para edição de questões
   - Garantia de que `escolaridade_id` seja sempre enviado

3. **Função `openCreateQuestionModal`:**
   - Define valor padrão para `escolaridade_id` ao abrir modal de criação

---

## 🔍 **Como Aplicar as Correções**

### **Passo 1: Executar Script SQL**
1. Acesse o Supabase: https://supabase.com/dashboard/project/cfwyuomeaudpnmjosetq
2. Vá para **SQL Editor**
3. Execute o conteúdo do arquivo `corrigir-escolaridade-questoes.sql`

### **Passo 2: Verificar Código**
O arquivo `AdminQuestoes.tsx` já foi atualizado automaticamente com as correções.

### **Passo 3: Testar Funcionalidade**
1. Acesse: `http://localhost:3000/admin/questoes`
2. Clique em "Nova Questão"
3. Preencha os campos obrigatórios
4. Tente salvar a questão
5. Deve funcionar sem erro de `escolaridade_id`

---

## 📊 **Estrutura da Tabela Escolaridades**

### **Tabela:** `escolaridades`
```sql
CREATE TABLE escolaridades (
    id SERIAL PRIMARY KEY,
    nivel nivel_escolaridade NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
```

### **Valores Padrão:**
- `FUNDAMENTAL` - Ensino Fundamental
- `MEDIO` - Ensino Médio (padrão usado)
- `SUPERIOR` - Ensino Superior

---

## 🔍 **Verificação das Correções**

### **Teste 1: Verificar Tabela Escolaridades**
```sql
SELECT * FROM escolaridades ORDER BY id;
```

### **Teste 2: Verificar Estrutura da Tabela Questões**
```sql
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'questoes' 
ORDER BY ordinal_position;
```

### **Teste 3: Verificar Questões Existentes**
```sql
SELECT id, enunciado, escolaridade_id 
FROM questoes 
LIMIT 5;
```

### **Teste 4: Criar Nova Questão**
1. Acesse a página de admin de questões
2. Clique em "Nova Questão"
3. Preencha os campos obrigatórios
4. Salve a questão
5. Verifique se não há erros no console

---

## 🐛 **Possíveis Problemas e Soluções**

### **Problema 1: "Escolaridade padrão não encontrada"**
**Solução:** Execute o script SQL para criar as escolaridades padrão.

### **Problema 2: "Column escolaridade_id does not exist"**
**Solução:** Execute o script SQL para adicionar a coluna.

### **Problema 3: "Foreign key violation"**
**Solução:** Verifique se as escolaridades foram criadas corretamente.

---

## ✅ **Status da Correção**

| Item | Status | Descrição |
|------|--------|-----------|
| Script SQL | ✅ Criado | `corrigir-escolaridade-questoes.sql` |
| Código TypeScript | ✅ Corrigido | `AdminQuestoes.tsx` |
| Validação | ✅ Implementada | Verificação de escolaridade_id |
| Valor Padrão | ✅ Definido | MEDIO como padrão |

---

## 🎯 **Próximos Passos**

1. **Execute o script SQL** no Supabase
2. **Teste a criação de questões** na interface
3. **Verifique se não há erros** no console do navegador
4. **Confirme que as questões** estão sendo salvas corretamente

---

## 📞 **Suporte**

Se encontrar problemas:
1. Verifique os logs do console do navegador
2. Confirme se o script SQL foi executado corretamente
3. Teste a criação de uma questão simples
4. Entre em contato se necessário: contato@rotadeataque.com

# 🔧 Troubleshooting - Questões não Aparecem

## 📋 **Problema Reportado**
Quando clica em "Filtrar", as questões do Supabase não aparecem na página.

## 🔍 **Passos para Diagnóstico**

### **Passo 1: Verificar Console do Navegador**
1. Abra o DevTools (F12)
2. Vá para a aba "Console"
3. Recarregue a página de questões
4. Procure por mensagens de erro ou logs de debug

**Logs esperados:**
```
Carregando questões do Supabase...
Resposta do Supabase: { questionsData: [...], error: null }
Questões carregadas: 5
Questão processada: { id: 1, ano: 2024, disciplina: "Direito Constitucional" }
Questões processadas e salvas no estado: 5
```

### **Passo 2: Executar Scripts de Verificação**

#### **2.1. Executar `test-questoes-supabase.sql`**
Execute este script no SQL Editor do Supabase para verificar:
- Se existem questões no banco
- Se a estrutura está correta
- Se os relacionamentos funcionam

#### **2.2. Executar `script-inserir-dados-exemplo.sql`**
Execute este script para inserir dados de exemplo se não existirem.

### **Passo 3: Verificar Estrutura da Tabela**

Execute no SQL Editor:
```sql
-- Verificar estrutura da tabela questoes
SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'questoes' 
ORDER BY ordinal_position;

-- Verificar se há questões
SELECT COUNT(*) as total_questoes FROM questoes;
SELECT COUNT(*) as questoes_ativas FROM questoes WHERE ativo = true;
```

## 🛠️ **Possíveis Causas e Soluções**

### **Causa 1: Não há questões no banco**
**Sintomas:** Console mostra "Questões carregadas: 0"
**Solução:** Execute `script-inserir-dados-exemplo.sql`

### **Causa 2: Problema na consulta SQL**
**Sintomas:** Erro no console ou dados vazios
**Solução:** Verificar se todas as tabelas relacionadas existem

### **Causa 3: Problema de autenticação**
**Sintomas:** Erro 401 ou 403
**Solução:** Verificar se o usuário está logado e tem permissões

### **Causa 4: Problema na estrutura da tabela**
**Sintomas:** Erro ao processar dados
**Solução:** Execute `script-verificar-estrutura-questoes.sql`

## 📊 **Verificações Específicas**

### **1. Verificar Dados de Referência**
```sql
-- Verificar se existem dados nas tabelas relacionadas
SELECT 'disciplinas' as tabela, COUNT(*) as total FROM disciplinas
UNION ALL
SELECT 'assuntos', COUNT(*) FROM assuntos
UNION ALL
SELECT 'bancas', COUNT(*) FROM bancas
UNION ALL
SELECT 'orgaos', COUNT(*) FROM orgaos
UNION ALL
SELECT 'anos', COUNT(*) FROM anos;
```

### **2. Verificar Relacionamentos**
```sql
-- Verificar se as questões têm relacionamentos válidos
SELECT COUNT(*) as questoes_validas
FROM questoes q
INNER JOIN disciplinas d ON q.disciplina_id = d.id
INNER JOIN assuntos a ON q.assunto_id = a.id
INNER JOIN bancas b ON q.banca_id = b.id
INNER JOIN orgaos o ON q.orgao_id = o.id
INNER JOIN anos an ON q.ano_id = an.id
WHERE q.ativo = true;
```

### **3. Testar Consulta Completa**
```sql
-- Testar a consulta que o frontend faz
SELECT 
    q.*,
    d.nome as disciplina_nome,
    a.nome as assunto_nome,
    b.nome as banca_nome,
    o.nome as orgao_nome,
    an.ano as ano_valor
FROM questoes q
INNER JOIN disciplinas d ON q.disciplina_id = d.id
INNER JOIN assuntos a ON q.assunto_id = a.id
INNER JOIN bancas b ON q.banca_id = b.id
INNER JOIN orgaos o ON q.orgao_id = o.id
INNER JOIN anos an ON q.ano_id = an.id
WHERE q.ativo = true
ORDER BY q.created_at DESC
LIMIT 5;
```

## 🔧 **Correções Implementadas**

### **1. Logs de Debug Adicionados**
- ✅ Logs detalhados no carregamento de dados
- ✅ Logs na aplicação de filtros
- ✅ Logs de processamento de questões

### **2. Tratamento de Erros Melhorado**
- ✅ Verificação de erros na consulta
- ✅ Logs de erro detalhados
- ✅ Fallback para estrutura de dados

### **3. Scripts de Verificação**
- ✅ `test-questoes-supabase.sql` - Testa consultas
- ✅ `script-inserir-dados-exemplo.sql` - Insere dados de teste
- ✅ `script-verificar-estrutura-questoes.sql` - Verifica estrutura

## 📝 **Checklist de Verificação**

- [ ] Console do navegador não mostra erros
- [ ] Script `test-questoes-supabase.sql` retorna dados
- [ ] Script `script-inserir-dados-exemplo.sql` foi executado
- [ ] Usuário está logado no sistema
- [ ] Políticas RLS estão configuradas corretamente
- [ ] Tabela `questoes` tem dados
- [ ] Tabelas relacionadas têm dados
- [ ] Relacionamentos estão funcionando

## 🚀 **Próximos Passos**

1. **Execute os scripts** na ordem indicada
2. **Verifique o console** do navegador
3. **Teste a funcionalidade** após cada correção
4. **Reporte os resultados** dos logs para análise adicional

## 📞 **Suporte**

Se o problema persistir após seguir todos os passos:
1. Copie os logs do console
2. Execute os scripts de verificação
3. Compartilhe os resultados para análise detalhada

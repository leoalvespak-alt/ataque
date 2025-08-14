# 🔧 Troubleshooting: Tela Preta na Página de Design

## 📋 **Problema Identificado**

**Sintoma:** A página `/admin/design` está aparecendo com tela preta ou não carrega corretamente.

**Possíveis Causas:**
1. Erro no ThemeContext
2. Problema de autenticação/permissões
3. Erro no carregamento dos dados do tema
4. Problema no console do navegador
5. Erro de JavaScript não tratado

---

## 🔍 **Passos para Diagnóstico**

### **Passo 1: Verificar Console do Navegador**

1. Abra a página `/admin/design`
2. Pressione `F12` para abrir as ferramentas do desenvolvedor
3. Vá para a aba **Console**
4. Procure por erros em vermelho
5. Procure por logs de debug (🔍, ⏳, ❌, ✅)

**Logs esperados:**
```
🔍 AdminDesign Debug: {user: {...}, currentTheme: {...}, themes: 1, loading: false, error: null}
✅ AdminDesign: Renderizando página com sucesso
```

### **Passo 2: Verificar Status da Autenticação**

No console, procure por:
```
🚫 Usuário não é gestor: [tipo_usuario]
```

**Se aparecer este log:**
- O usuário não tem permissão de gestor
- Solução: Alterar o tipo de usuário para 'gestor' no banco de dados

### **Passo 3: Verificar Carregamento do Tema**

No console, procure por:
```
⏳ AdminDesign: Loading...
❌ AdminDesign: Error: [mensagem de erro]
⚠️ AdminDesign: Dados insuficientes: {currentTheme: false, editingTheme: false}
```

---

## 🛠️ **Soluções por Tipo de Problema**

### **Problema 1: Usuário não é gestor**

**Sintoma:** Log `🚫 Usuário não é gestor` no console

**Solução:**
1. Acesse o Supabase: https://supabase.com/dashboard/project/cfwyuomeaudpnmjosetq
2. Vá para **Table Editor** → **usuarios**
3. Encontre seu usuário
4. Altere `tipo_usuario` para `gestor`
5. Salve as alterações
6. Recarregue a página

### **Problema 2: Erro no carregamento do tema**

**Sintoma:** Log `❌ AdminDesign: Error` no console

**Solução:**
1. Execute o script `verificar-estrutura-themes.sql` no Supabase
2. Execute o script `corrigir-tabela-themes.sql` no Supabase
3. Verifique se há um tema ativo na tabela `themes`
4. Recarregue a página

### **Problema 3: Dados insuficientes**

**Sintoma:** Log `⚠️ AdminDesign: Dados insuficientes` no console

**Solução:**
1. Verifique se a tabela `themes` tem dados
2. Execute o script `recriar-tabela-themes.sql` se necessário
3. Verifique se o ThemeContext está funcionando

### **Problema 4: Erro de JavaScript**

**Sintoma:** Erro no console relacionado a `Object.entries` ou similar

**Solução:**
1. O ThemeContext já foi corrigido para lidar com valores null/undefined
2. Recarregue a página
3. Se persistir, limpe o cache do navegador (Ctrl+Shift+R)

---

## 🔧 **Scripts de Diagnóstico**

### **1. Verificar Estrutura da Tabela**
```sql
-- Execute no Supabase SQL Editor
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'themes' 
ORDER BY ordinal_position;
```

### **2. Verificar Dados da Tabela**
```sql
-- Execute no Supabase SQL Editor
SELECT id, name, is_active, is_default, 
       CASE WHEN tokens IS NOT NULL THEN 'Sim' ELSE 'Não' END as tem_tokens,
       CASE WHEN semantic IS NOT NULL THEN 'Sim' ELSE 'Não' END as tem_semantic
FROM themes;
```

### **3. Verificar Tema Ativo**
```sql
-- Execute no Supabase SQL Editor
SELECT * FROM themes WHERE is_active = true;
```

---

## 🚀 **Solução Rápida**

Se você não conseguir identificar o problema específico, execute esta sequência:

1. **Limpar cache do navegador:**
   - Pressione `Ctrl+Shift+R` (Windows/Linux) ou `Cmd+Shift+R` (Mac)

2. **Verificar autenticação:**
   - Faça logout e login novamente
   - Verifique se o usuário é gestor

3. **Recriar tabela themes:**
   - Execute `recriar-tabela-themes.sql` no Supabase

4. **Reiniciar aplicação:**
   - Pare o servidor (Ctrl+C)
   - Execute `npm run dev` novamente

---

## 📞 **Logs de Debug Adicionados**

A página agora inclui logs detalhados para facilitar o diagnóstico:

- `🔍 AdminDesign Debug:` - Status geral da página
- `🚫 Usuário não é gestor:` - Problema de permissão
- `⏳ AdminDesign: Loading...` - Estado de carregamento
- `❌ AdminDesign: Error:` - Erro específico
- `⚠️ AdminDesign: Dados insuficientes:` - Dados faltando
- `✅ AdminDesign: Renderizando página com sucesso` - Sucesso

---

## 🎯 **Próximos Passos**

1. **Execute os passos de diagnóstico** acima
2. **Verifique o console do navegador** para logs específicos
3. **Aplique a solução** correspondente ao problema identificado
4. **Teste a página** novamente
5. **Se persistir**, entre em contato com o suporte

---

## 📋 **Checklist de Verificação**

- [ ] Console do navegador não mostra erros
- [ ] Usuário tem tipo_usuario = 'gestor'
- [ ] Tabela themes existe e tem dados
- [ ] Há um tema ativo na tabela
- [ ] ThemeContext carrega sem erros
- [ ] Página renderiza com sucesso

---

## 🔗 **Links Úteis**

- **Supabase Dashboard:** https://supabase.com/dashboard/project/cfwyuomeaudpnmjosetq
- **Página de Design:** http://localhost:3000/admin/design
- **Console do Navegador:** F12 → Console

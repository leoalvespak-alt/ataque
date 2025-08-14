# Guia Completo - Execução dos Scripts SQL

## ⚠️ IMPORTANTE: Erro Comum

**NÃO copie arquivos JavaScript (.js) no SQL Editor do Supabase!**
- Use apenas arquivos `.sql`
- O erro `syntax error at or near "const"` acontece quando você cola código JavaScript

## 📋 Passo a Passo Completo

### PASSO 1: Executar `corrigir-funcoes-simples.sql`

1. **Acesse o Supabase Dashboard**
   - Vá para [supabase.com](https://supabase.com)
   - Faça login e acesse seu projeto

2. **Abra o SQL Editor**
   - No menu lateral esquerdo, clique em "SQL Editor"
   - Clique no botão "New query" (Nova consulta)

3. **Copie o conteúdo SQL correto**
   - Abra o arquivo `corrigir-funcoes-simples.sql` no seu editor
   - **Copie TODO o conteúdo** (começa com `-- Script simples para corrigir...`)
   - Cole no SQL Editor do Supabase

4. **Execute o script**
   - Clique no botão "Run" (▶️) ou pressione `Ctrl+Enter`
   - Aguarde a execução completar

5. **Verifique o resultado**
   - Deve aparecer uma mensagem de sucesso
   - No final, você verá uma lista das funções criadas

### PASSO 2: Executar `criar-tabelas-adicionais.sql`

1. **Crie uma nova query**
   - No SQL Editor, clique em "New query" novamente

2. **Copie o conteúdo SQL correto**
   - Abra o arquivo `criar-tabelas-adicionais.sql`
   - **Copie TODO o conteúdo** (começa com `-- Script para criar tabelas...`)
   - Cole no SQL Editor

3. **Execute o script**
   - Clique em "Run" (▶️)
   - Aguarde a execução completar

4. **Verifique o resultado**
   - Deve mostrar as tabelas criadas no final

### PASSO 2.1: Corrigir colunas "ativo" (se necessário)

**Se você receber erro sobre coluna "ativo" não existir:**

1. **Crie uma nova query**
   - No SQL Editor, clique em "New query"

2. **Execute o script de correção**
   - Abra o arquivo `corrigir-colunas-notificacoes.sql`
   - **Copie TODO o conteúdo**
   - Cole no SQL Editor e execute

3. **Verifique o resultado**
   - Deve mostrar a estrutura das tabelas corrigidas
   - As notificações e dicas de estudo devem ser inseridas

### PASSO 3: Configurar Storage Bucket

1. **Acesse Storage**
   - No menu lateral, clique em "Storage"

2. **Criar bucket "uploads"**
   - Clique em "New bucket"
   - **Nome do bucket**: `uploads`
   - **Public bucket**: Marque esta opção se quiser arquivos públicos
   - Clique em "Create bucket"

3. **Configurar políticas RLS via SQL**
   - Abra o SQL Editor
   - Abra o arquivo `configurar-storage-policies.sql`
   - **Copie TODO o conteúdo**
   - Cole no SQL Editor e execute

4. **Testar configuração**
   ```bash
   node testar-upload-storage.js
   ```

### PASSO 4: Testar Configuração

1. **Execute o script de teste**
   ```bash
   node testar-configuracao-completa.js
   ```

2. **Verifique os resultados**
   - Todas as tabelas devem aparecer como "✅ OK"
   - Todas as funções devem aparecer como "✅ OK"
   - Bucket "uploads" deve ser encontrado

## 🔧 Solução de Problemas

### Erro: "syntax error at or near 'const'"
- **Causa**: Você colou código JavaScript em vez de SQL
- **Solução**: Use apenas arquivos `.sql`, não `.js`

### Erro: "function already exists"
- **Causa**: Função já foi criada anteriormente
- **Solução**: O script já remove funções existentes, então pode executar novamente

### Erro: "table already exists"
- **Causa**: Tabela já foi criada
- **Solução**: O script usa `CREATE TABLE IF NOT EXISTS`, então é seguro executar

### Erro: "permission denied"
- **Causa**: Políticas RLS bloqueando acesso
- **Solução**: Verifique se está usando a service key correta

### Erro: "column 'ativo' of relation 'dicas_estudo' does not exist"
- **Causa**: A tabela dicas_estudo foi criada sem a coluna ativo
- **Solução**: Execute o script `corrigir-colunas-notificacoes.sql` para adicionar a coluna

### Erro: "column 'ativo' does not exist" (notificacoes)
- **Causa**: A tabela notificacoes tem coluna 'ativa' em vez de 'ativo'
- **Solução**: Execute o script `corrigir-colunas-notificacoes.sql` para corrigir

### Erro: "Erro ao fazer upload do arquivo. Verifique se o bucket de storage está configurado"
- **Causa**: Políticas RLS do storage não configuradas
- **Solução**: Execute o script `configurar-storage-policies.sql` para configurar as políticas

## 📊 Verificação Final

Após executar todos os passos, você deve ter:

✅ **Tabelas criadas**:
- `configuracoes_logo`
- `notificacoes`
- `usuarios_notificacoes`
- `dicas_estudo`

✅ **Funções criadas**:
- `get_estatisticas_dashboard()`
- `get_estatisticas_por_disciplina()`
- `get_estatisticas_por_assunto()`
- `get_notificacoes_dashboard()`
- `marcar_notificacao_lida_segura()`

✅ **Storage configurado**:
- Bucket "uploads" criado
- Políticas RLS configuradas

✅ **Dados iniciais**:
- Configurações de logo padrão
- Dicas de estudo iniciais

## 🚀 Próximos Passos

1. **Teste o frontend**:
   - Acesse `http://localhost:3000`
   - Teste login/logout
   - Verifique dashboard e estatísticas

2. **Teste upload de arquivos**:
   - Tente fazer upload de logo/favicon
   - Verifique se aparece no storage

3. **Teste funcionalidades**:
   - Menu lateral com rolagem
   - Cores consistentes
   - Responsividade

## 📞 Suporte

Se encontrar problemas:
1. Execute o script de teste: `node testar-configuracao-completa.js`
2. Verifique os logs de erro
3. Confirme que as variáveis de ambiente estão corretas
4. Verifique se o Supabase está acessível

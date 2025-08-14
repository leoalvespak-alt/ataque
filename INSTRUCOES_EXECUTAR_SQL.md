# Instruções para Executar SQL no Supabase

## Problema
As funções de estatísticas estão retornando erro 404 porque não existem no banco de dados.

## Solução
Execute o arquivo `funcoes-estatisticas.sql` diretamente no painel do Supabase.

### Passos:

1. **Acesse o painel do Supabase:**
   - Vá para: https://supabase.com/dashboard
   - Faça login na sua conta
   - Selecione o projeto: `cfwyuomeaudpnmjosetq`

2. **Abra o SQL Editor:**
   - No menu lateral, clique em "SQL Editor"
   - Clique em "New query"

3. **Execute o SQL:**
   - Copie todo o conteúdo do arquivo `funcoes-estatisticas.sql`
   - Cole no editor SQL
   - Clique em "Run" para executar

4. **Verificar se funcionou:**
   - Vá para "Database" > "Functions" no menu lateral
   - Você deve ver as funções:
     - `get_estatisticas_dashboard`
     - `get_estatisticas_por_disciplina`
     - `get_estatisticas_por_assunto`

5. **Testar as funções:**
   - No SQL Editor, execute:
   ```sql
   SELECT * FROM get_estatisticas_dashboard();
   ```

## Estruturas Criadas

### Funções de Estatísticas:
- `get_estatisticas_dashboard()` - Estatísticas gerais do usuário
- `get_estatisticas_por_disciplina()` - Estatísticas por disciplina
- `get_estatisticas_por_assunto()` - Estatísticas por assunto

### Tabela de Configurações:
- `configuracoes_logo` - Para gerenciar logo e favicon da plataforma

## Após Executar
Depois de executar o SQL, as páginas de estatísticas devem funcionar corretamente e o sistema de configuração de logo/favicon estará disponível na área administrativa.

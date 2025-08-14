# Guia de Correção do Dashboard

## Problema Identificado

O dashboard está apresentando erros 400 e 404 nas seguintes funções RPC:
- `get_estatisticas_detalhadas_usuario` (erro 404)
- `get_topicos_maior_dificuldade` (erro 400)
- `get_percentual_por_disciplina_assunto` (erro 400)
- `get_progresso_ultimos_7_dias` (erro 400)
- `get_notificacoes_dashboard` (erro 400)

## Causas dos Problemas

1. **Ambiguidade de colunas**: Referências ambíguas a colunas como "id" e "questoes_respondidas"
2. **Estrutura de função incorreta**: A função `get_progresso_ultimos_7_dias` tem estrutura que não corresponde ao tipo de retorno
3. **Tabelas ausentes**: Algumas tabelas podem não existir ou não ter as colunas necessárias

## Solução

### Passo 1: Executar o Script de Correção

1. Acesse o [Painel do Supabase](https://supabase.com/dashboard)
2. Selecione seu projeto
3. Vá para **SQL Editor**
4. Cole o conteúdo do arquivo `corrigir-funcoes-dashboard-final.sql`
5. Clique em **Run** para executar

### Passo 2: Verificar as Correções

Após executar o script, execute o comando para testar:

```bash
node testar-correcoes-dashboard.js
```

### Passo 3: Verificar o Dashboard

1. Acesse a aplicação
2. Vá para a página do Dashboard
3. Verifique se os erros foram resolvidos

## Correções Aplicadas

### 1. Função `get_estatisticas_detalhadas_usuario`
- **Problema**: Referência ambígua à coluna "questoes_respondidas"
- **Solução**: Adicionado alias `u.` para especificar a tabela

### 2. Função `get_progresso_ultimos_7_dias`
- **Problema**: Estrutura de query não correspondia ao tipo de retorno
- **Solução**: Reescrita usando `RETURN NEXT` para retornar múltiplas linhas

### 3. Função `get_notificacoes_dashboard`
- **Problema**: Referência ambígua à coluna "id"
- **Solução**: Adicionado alias `n.` para especificar a tabela

### 4. Estrutura de Tabelas
- Verificação e criação da coluna `ativo` na tabela `disciplinas`
- Verificação e criação das colunas `acertou` e `data_resposta` na tabela `respostas_usuarios`
- Criação da tabela `dicas_estudo` se não existir

## Arquivos Criados

1. `corrigir-funcoes-dashboard-final.sql` - Script de correção
2. `testar-correcoes-dashboard.js` - Script de teste
3. `corrigir-dashboard-simples.js` - Script de diagnóstico

## Verificação Final

Após aplicar as correções, o dashboard deve:
- ✅ Carregar estatísticas detalhadas sem erros
- ✅ Exibir tópicos de maior dificuldade
- ✅ Mostrar percentuais por disciplina
- ✅ Apresentar progresso dos últimos 7 dias
- ✅ Exibir dicas de estudo
- ✅ Mostrar notificações
- ✅ Listar disciplinas ativas

## Próximos Passos

Se ainda houver problemas após aplicar as correções:

1. Verifique os logs do console do navegador
2. Execute o script de teste novamente
3. Verifique se todas as tabelas necessárias existem
4. Confirme se as políticas RLS estão configuradas corretamente

## Contato

Se precisar de ajuda adicional, verifique os logs de erro e forneça as mensagens específicas para análise mais detalhada.

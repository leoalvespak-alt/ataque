# Guia para Corrigir Políticas de Segurança das Categorias

## Problema
A página de gerenciar categorias não está sincronizando com o Supabase porque as políticas de segurança (RLS) estão impedindo as operações CRUD.

## Solução

### 1. Acessar o Painel do Supabase
1. Acesse: https://supabase.com/dashboard/project/cfwyuomeaudpnmjosetq/sql
2. Faça login com suas credenciais

### 2. Executar o Script SQL
Copie e cole o seguinte script no SQL Editor do Supabase:

```sql
-- Script para corrigir políticas de segurança das categorias no Supabase
-- Permite que gestores possam gerenciar disciplinas e assuntos

-- 1. Habilitar RLS nas tabelas de categorias
ALTER TABLE disciplinas ENABLE ROW LEVEL SECURITY;
ALTER TABLE assuntos ENABLE ROW LEVEL SECURITY;

-- 2. Políticas para disciplinas
-- Permitir leitura para todos os usuários autenticados
DROP POLICY IF EXISTS "Permitir leitura de disciplinas para usuários autenticados" ON disciplinas;
CREATE POLICY "Permitir leitura de disciplinas para usuários autenticados"
ON disciplinas FOR SELECT
TO authenticated
USING (true);

-- Permitir CRUD completo para gestores
DROP POLICY IF EXISTS "Permitir CRUD de disciplinas para gestores" ON disciplinas;
CREATE POLICY "Permitir CRUD de disciplinas para gestores"
ON disciplinas FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM usuarios 
    WHERE usuarios.id = auth.uid() 
    AND usuarios.tipo_usuario = 'gestor'
  )
);

-- 3. Políticas para assuntos
-- Permitir leitura para todos os usuários autenticados
DROP POLICY IF EXISTS "Permitir leitura de assuntos para usuários autenticados" ON assuntos;
CREATE POLICY "Permitir leitura de assuntos para usuários autenticados"
ON assuntos FOR SELECT
TO authenticated
USING (true);

-- Permitir CRUD completo para gestores
DROP POLICY IF EXISTS "Permitir CRUD de assuntos para gestores" ON assuntos;
CREATE POLICY "Permitir CRUD de assuntos para gestores"
ON assuntos FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM usuarios 
    WHERE usuarios.id = auth.uid() 
    AND usuarios.tipo_usuario = 'gestor'
  )
);

-- 4. Políticas para bancas
-- Permitir leitura para todos os usuários autenticados
DROP POLICY IF EXISTS "Permitir leitura de bancas para usuários autenticados" ON bancas;
CREATE POLICY "Permitir leitura de bancas para usuários autenticados"
ON bancas FOR SELECT
TO authenticated
USING (true);

-- Permitir CRUD completo para gestores
DROP POLICY IF EXISTS "Permitir CRUD de bancas para gestores" ON bancas;
CREATE POLICY "Permitir CRUD de bancas para gestores"
ON bancas FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM usuarios 
    WHERE usuarios.id = auth.uid() 
    AND usuarios.tipo_usuario = 'gestor'
  )
);

-- 5. Políticas para órgãos
-- Permitir leitura para todos os usuários autenticados
DROP POLICY IF EXISTS "Permitir leitura de orgaos para usuários autenticados" ON orgaos;
CREATE POLICY "Permitir leitura de orgaos para usuários autenticados"
ON orgaos FOR SELECT
TO authenticated
USING (true);

-- Permitir CRUD completo para gestores
DROP POLICY IF EXISTS "Permitir CRUD de orgaos para gestores" ON orgaos;
CREATE POLICY "Permitir CRUD de orgaos para gestores"
ON orgaos FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM usuarios 
    WHERE usuarios.id = auth.uid() 
    AND usuarios.tipo_usuario = 'gestor'
  )
);
```

### 3. Verificar se as Políticas Foram Criadas
Execute o seguinte comando para verificar:

```sql
-- Verificar se as políticas foram criadas corretamente
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename IN ('disciplinas', 'assuntos', 'bancas', 'orgaos')
ORDER BY tablename, policyname;
```

### 4. Verificar se RLS Está Habilitado
```sql
-- Verificar se RLS está habilitado
SELECT 
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables 
WHERE tablename IN ('disciplinas', 'assuntos', 'bancas', 'orgaos')
ORDER BY tablename;
```

### 5. Testar as Operações
Após executar o script, teste as operações na página de admin:

1. **Criar Disciplina**: Tente adicionar uma nova disciplina
2. **Editar Disciplina**: Tente editar uma disciplina existente
3. **Excluir Disciplina**: Tente excluir uma disciplina
4. **Criar Assunto**: Tente adicionar um novo assunto
5. **Editar Assunto**: Tente editar um assunto existente
6. **Excluir Assunto**: Tente excluir um assunto

## O que o Script Faz

1. **Habilita RLS**: Ativa Row Level Security nas tabelas de categorias
2. **Cria Políticas de Leitura**: Permite que todos os usuários autenticados possam ler as categorias
3. **Cria Políticas de CRUD**: Permite que apenas gestores possam criar, editar e excluir categorias
4. **Verifica Tipo de Usuário**: Usa a tabela `usuarios` para verificar se o usuário é gestor

## Resultado Esperado

Após executar o script:
- ✅ Gestores podem criar, editar e excluir disciplinas e assuntos
- ✅ Alunos podem apenas visualizar as categorias
- ✅ As operações são refletidas imediatamente no Supabase
- ✅ A página de admin funciona corretamente

## Troubleshooting

Se ainda houver problemas:

1. **Verificar Autenticação**: Certifique-se de que o usuário está logado como gestor
2. **Verificar Tabela Usuários**: Confirme que o usuário tem `tipo_usuario = 'gestor'` na tabela `usuarios`
3. **Verificar Políticas**: Execute os comandos de verificação para confirmar que as políticas foram criadas
4. **Limpar Cache**: Recarregue a página e limpe o cache do navegador

## Próximos Passos

Após corrigir as políticas:
1. Teste todas as operações CRUD na página de admin
2. Verifique se as mudanças aparecem em outras páginas que usam categorias
3. Monitore os logs do Supabase para identificar possíveis problemas

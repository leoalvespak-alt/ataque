# Guia para Configurar Storage do Supabase

## 🎯 **Problema Identificado**

O erro "Erro ao fazer upload do arquivo. Verifique se o bucket de storage está configurado" acontece porque:

1. **Bucket "uploads" não existe**
2. **Políticas RLS não estão configuradas**
3. **Service key não está configurada corretamente**

## 🔧 **Solução Passo a Passo**

### **PASSO 1: Obter as Chaves do Supabase**

1. **Acesse o painel do Supabase:**
   - Vá para [https://supabase.com/dashboard](https://supabase.com/dashboard)
   - Faça login e selecione seu projeto

2. **Vá em Settings > API:**
   - Copie a **Project URL**
   - Copie a **anon public** key
   - Copie a **service_role** key (importante!)

3. **Atualize o arquivo `.env` na raiz do projeto:**
   ```env
   SUPABASE_URL=https://cfwyuomeaudpnmjosetq.supabase.co
   SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNmd3l1b21lYXVkcG5tam9zZXRxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUwNTEyMjYsImV4cCI6MjA3MDYyNzIyNn0.4tE2STnUzVSR1OcsNCxWUEkiPG6Sph4-OUnA9h54gf8
   SUPABASE_SERVICE_KEY=SUA_SERVICE_ROLE_KEY_AQUI
   ```

### **PASSO 2: Criar o Bucket "uploads"**

1. **No painel do Supabase, vá em Storage:**
   - Clique em "Storage" no menu lateral

2. **Criar novo bucket:**
   - Clique em "New bucket"
   - **Nome do bucket:** `uploads`
   - **Public bucket:** ✅ Marque esta opção
   - Clique em "Create bucket"

### **PASSO 3: Configurar Políticas RLS**

1. **Vá em SQL Editor:**
   - Clique em "SQL Editor" no menu lateral
   - Clique em "New query"

2. **Cole e execute este SQL:**
   ```sql
   -- Remover políticas existentes (se houver)
   DROP POLICY IF EXISTS "Public Access" ON storage.objects;
   DROP POLICY IF EXISTS "Authenticated users can upload files" ON storage.objects;
   DROP POLICY IF EXISTS "Anyone can view files" ON storage.objects;
   DROP POLICY IF EXISTS "Users can upload their own files" ON storage.objects;
   DROP POLICY IF EXISTS "Users can update their own files" ON storage.objects;
   DROP POLICY IF EXISTS "Users can delete their own files" ON storage.objects;

   -- Criar política para permitir visualização pública de arquivos
   CREATE POLICY "Anyone can view files" ON storage.objects
       FOR SELECT USING (bucket_id = 'uploads');

   -- Criar política para permitir upload de arquivos autenticados
   CREATE POLICY "Authenticated users can upload files" ON storage.objects
       FOR INSERT WITH CHECK (
           bucket_id = 'uploads' 
           AND auth.role() = 'authenticated'
       );

   -- Criar política para permitir atualização de arquivos pelo proprietário
   CREATE POLICY "Users can update their own files" ON storage.objects
       FOR UPDATE USING (
           bucket_id = 'uploads' 
           AND auth.uid() = owner
       );

   -- Criar política para permitir exclusão de arquivos pelo proprietário
   CREATE POLICY "Users can delete their own files" ON storage.objects
       FOR DELETE USING (
           bucket_id = 'uploads' 
           AND auth.uid() = owner
       );
   ```

3. **Clique em "Run" para executar**

### **PASSO 4: Testar a Configuração**

1. **Execute o script de verificação:**
   ```bash
   node verificar-supabase.js
   ```

2. **Se tudo estiver OK, você verá:**
   ```
   ✅ Bucket "uploads" encontrado
   ✅ Upload funcionando!
   ✅ Supabase configurado corretamente
   ```

### **PASSO 5: Testar no Frontend**

1. **Acesse a página de configurações:**
   - Vá para `http://localhost:3000/admin/configuracoes`

2. **Faça upload de uma logo ou favicon:**
   - Selecione um arquivo
   - Clique em salvar
   - Deve funcionar sem erros

3. **Verifique se as mudanças aparecem:**
   - Faça refresh da página (`Ctrl+F5`)
   - Verifique se o favicon mudou na aba
   - Verifique se a logo aparece na página de login

## 🛠️ **Solução de Problemas**

### **Erro: "signature verification failed"**
- **Causa:** Service key incorreta
- **Solução:** Verifique se copiou a service_role key corretamente

### **Erro: "bucket not found"**
- **Causa:** Bucket não foi criado
- **Solução:** Crie o bucket "uploads" no painel do Supabase

### **Erro: "permission denied"**
- **Causa:** Políticas RLS não configuradas
- **Solução:** Execute o SQL das políticas RLS

### **Erro: "storage.objects does not exist"**
- **Causa:** Storage não está habilitado
- **Solução:** Verifique se o Storage está ativo no seu projeto

## 📋 **Checklist de Verificação**

- [ ] Service key configurada no `.env`
- [ ] Bucket "uploads" criado
- [ ] Bucket marcado como público
- [ ] Políticas RLS executadas
- [ ] Script de verificação passa
- [ ] Upload funciona no frontend
- [ ] Mudanças aparecem na plataforma

## 🎉 **Resultado Esperado**

Após seguir todos os passos:

✅ **Upload funciona** - Sem erros de bucket
✅ **Arquivos são salvos** - No storage do Supabase
✅ **URLs são geradas** - Para acesso público
✅ **Mudanças aparecem** - Logo e favicon atualizados
✅ **Sistema funcional** - Pronto para uso

## 📞 **Suporte**

Se ainda houver problemas:

1. **Verifique os logs** no console do navegador
2. **Execute o script de verificação** novamente
3. **Confirme** que todas as configurações estão corretas
4. **Teste** com um arquivo simples primeiro

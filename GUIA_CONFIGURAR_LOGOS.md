# 🎨 Guia para Configurar as Logos da Plataforma

Este guia explica como configurar as logos da plataforma para carregarem dos arquivos especificados no bucket "uploads" do Supabase Storage.

## 📋 Arquivos Necessários

Você precisa dos seguintes arquivos:
- **ATAQUE.png** - Logo principal da plataforma
- **favicon-1755150122840.ico** - Favicon da plataforma

## 🚀 Passos para Configuração

### 1. Preparar os Arquivos
- Certifique-se de que os arquivos estão com os nomes exatos:
  - `ATAQUE.png` (logo principal)
  - `favicon-1755150122840.ico` (favicon)

### 2. Configurar o Supabase Storage

#### 2.1 Acessar o Dashboard do Supabase
1. Acesse [supabase.com](https://supabase.com)
2. Faça login na sua conta
3. Selecione o projeto `rota-de-ataque-questoes`

#### 2.2 Criar/Verificar o Bucket "uploads"
1. Vá para **Storage** no menu lateral
2. Verifique se existe um bucket chamado `uploads`
3. Se não existir, clique em **"New bucket"** e configure:
   - **Name**: `uploads`
   - **Public bucket**: ✅ Marcar como público
   - **File size limit**: `5MB`
   - **Allowed MIME types**: `image/*`

#### 2.3 Criar a Pasta "logos"
1. Dentro do bucket `uploads`, clique em **"New folder"**
2. Nome da pasta: `logos`
3. Clique em **"Create folder"**

#### 2.4 Fazer Upload dos Arquivos
1. Entre na pasta `logos`
2. Clique em **"Upload file"**
3. Faça upload dos arquivos:
   - `ATAQUE.png`
   - `favicon-1755150122840.ico`

### 3. Executar o Script de Configuração

#### 3.1 Executar o Script JavaScript
```bash
node configurar-logos-supabase.js
```

#### 3.2 Executar o Script SQL
1. No Dashboard do Supabase, vá para **SQL Editor**
2. Copie e cole o conteúdo do arquivo `configurar-logos-sql.sql`
3. Clique em **"Run"**

### 4. Verificar a Configuração

#### 4.1 Testar URLs Públicas
Teste as seguintes URLs no navegador:
- Logo: `https://cfwyuomeaudpnmjosetq.supabase.co/storage/v1/object/public/uploads/logos/ATAQUE.png`
- Favicon: `https://cfwyuomeaudpnmjosetq.supabase.co/storage/v1/object/public/uploads/logos/favicon-1755150122840.ico`

#### 4.2 Verificar no Banco de Dados
Execute no SQL Editor:
```sql
SELECT * FROM configuracoes_logo WHERE ativo = true ORDER BY tipo;
```

## 🔧 Componentes Atualizados

### LogoContext
- Agora carrega as configurações do banco de dados
- Fallback para URLs padrão se a tabela não existir
- Aplica automaticamente o favicon

### Componente Logo
- Novo componente que usa o contexto
- Fallback para logo local se a URL do Supabase falhar
- Loading state enquanto carrega

### Sidebar
- Atualizado para usar o novo componente Logo
- Logo responsiva e com fallback

### index.html
- Favicon atualizado para usar a URL do Supabase Storage

## 🎯 URLs Configuradas

### Logo Principal
```
https://cfwyuomeaudpnmjosetq.supabase.co/storage/v1/object/public/uploads/logos/ATAQUE.png
```

### Favicon
```
https://cfwyuomeaudpnmjosetq.supabase.co/storage/v1/object/public/uploads/logos/favicon-1755150122840.ico
```

## 🔍 Verificação Final

1. **Teste a aplicação** - Verifique se as logos estão carregando corretamente
2. **Verifique o favicon** - Deve aparecer na aba do navegador
3. **Teste o componente Logo** - Deve aparecer no sidebar
4. **Verifique fallbacks** - Se as URLs falharem, deve usar logos locais

## 🛠️ Solução de Problemas

### Problema: Logo não carrega
**Solução:**
1. Verifique se o arquivo foi uploadado corretamente
2. Teste a URL pública no navegador
3. Verifique as configurações no banco de dados

### Problema: Favicon não aparece
**Solução:**
1. Limpe o cache do navegador
2. Verifique se o arquivo .ico foi uploadado
3. Teste a URL do favicon diretamente

### Problema: Erro de permissão
**Solução:**
1. Verifique se o bucket está público
2. Verifique as políticas RLS da tabela
3. Execute o script SQL novamente

## 📝 Notas Importantes

- As URLs são públicas e podem ser acessadas por qualquer pessoa
- O sistema tem fallbacks para logos locais se as URLs falharem
- As configurações são carregadas automaticamente na inicialização
- O favicon é aplicado dinamicamente via JavaScript

## ✅ Checklist de Verificação

- [ ] Arquivos uploadados para `uploads/logos/`
- [ ] Script JavaScript executado
- [ ] Script SQL executado
- [ ] URLs públicas testadas
- [ ] Aplicação testada
- [ ] Favicon funcionando
- [ ] Logo no sidebar funcionando
- [ ] Fallbacks testados

---

**🎉 Configuração concluída!** As logos da plataforma agora carregam do Supabase Storage conforme solicitado.

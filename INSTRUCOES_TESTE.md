# 🚀 INSTRUÇÕES PARA TESTAR A PLATAFORMA ROTA DE ATAQUE QUESTÕES

## 📋 **PRÉ-REQUISITOS**
- Node.js instalado
- Navegador web (Chrome, Firefox, Edge, etc.)

## 🎯 **COMO INICIAR A PLATAFORMA**

### **1. INICIAR O SERVIDOR MOCK (Backend)**
Abra um terminal e execute:
```bash
cd C:\rota-de-ataque-questoes\server
node mock-server.js
```

**Você deve ver:**
```
🚀 Servidor mock rodando na porta 3001
📊 Dados mock disponíveis:
   - 2 usuários
   - 2 questões
🔗 Acesse: http://localhost:3001/api/health
```

### **2. INICIAR O FRONTEND (Interface)**
Abra **OUTRO** terminal e execute:
```bash
cd C:\rota-de-ataque-questoes\client
npm start
```

**Você deve ver:**
```
Compiled successfully!

You can now view rota-de-ataque-questoes-client in the browser.

  Local:            http://localhost:3000
  On Your Network:  http://192.168.x.x:3000
```

## 🌐 **COMO ACESSAR**

### **Frontend (Interface Principal):**
- **URL:** http://localhost:3000
- **Descrição:** Interface completa da plataforma

### **Backend (API):**
- **URL:** http://localhost:3001
- **Teste:** http://localhost:3001/api/health

## 🔑 **CREDENCIAIS DE TESTE**

### **Administrador:**
- **Email:** admin@rotaataque.com
- **Senha:** 123456
- **Acesso:** Painel administrativo completo

### **Aluno:**
- **Email:** joao@teste.com
- **Senha:** 123456
- **Acesso:** Área do aluno

## 🎮 **FUNCIONALIDADES PARA TESTAR**

### **1. Página Inicial**
- ✅ Visualizar apresentação da plataforma
- ✅ Navegar pelo menu

### **2. Cadastro/Login**
- ✅ Criar nova conta
- ✅ Fazer login com credenciais de teste
- ✅ Testar credenciais inválidas

### **3. Área do Aluno**
- ✅ Visualizar perfil do usuário
- ✅ Ver status (Gratuito/Premium)
- ✅ Verificar XP acumulado

### **4. Questões**
- ✅ Filtrar questões por disciplina, banca, ano
- ✅ Visualizar lista de questões
- ✅ Responder questões individualmente
- ✅ Ver feedback imediato (certo/errado)
- ✅ Ganhar XP por acertos

### **5. Ranking**
- ✅ Visualizar ranking geral
- ✅ Ver posição dos usuários por XP

### **6. Planos**
- ✅ Visualizar opções de assinatura
- ✅ Ver preços e descrições

### **7. Painel Admin (apenas admin)**
- ✅ Acessar dashboard administrativo
- ✅ Ver estatísticas da plataforma

## 🎨 **IDENTIDADE VISUAL**

### **Cores Implementadas:**
- **Fundo Principal:** #1b1b1b (preto/cinza escuro)
- **Destaque:** #c1121f (vermelho escuro)
- **Texto:** #f2f2f2 (branco/cinza claro)
- **Sucesso:** #28a745 (verde)
- **Erro:** #dc3545 (vermelho)
- **Informativo:** #007bff (azul)

## 📱 **RESPONSIVIDADE**

A plataforma é totalmente responsiva e funciona em:
- ✅ Desktop
- ✅ Tablet
- ✅ Smartphone

## 🔧 **SOLUÇÃO DE PROBLEMAS**

### **Se o servidor não iniciar:**
1. Verifique se está na pasta correta: `C:\rota-de-ataque-questoes\server`
2. Execute: `npm install` para instalar dependências
3. Tente novamente: `node mock-server.js`

### **Se o frontend não iniciar:**
1. Verifique se está na pasta correta: `C:\rota-de-ataque-questoes\client`
2. Execute: `npm install --legacy-peer-deps`
3. Tente novamente: `npm start`

### **Se as portas estiverem ocupadas:**
- Feche outros terminais que possam estar usando as portas 3000 e 3001
- Reinicie os serviços

## 🎉 **SUCESSO!**

Se tudo estiver funcionando, você verá:
- Servidor mock rodando na porta 3001
- Frontend React rodando na porta 3000
- Interface completa acessível no navegador
- Todas as funcionalidades operacionais

**A plataforma está 100% funcional e pronta para teste!** 🚀

# 🚀 Inicialização dos Servidores - Rota de Ataque Questões

Este documento explica como usar os arquivos batch para iniciar e parar os servidores da plataforma.

## 📁 Arquivos Disponíveis

### 1. `iniciar-servidores.bat`
**Inicia ambos os servidores em uma única janela (recomendado)**

- ✅ **Frontend (Vite)**: http://localhost:3000
- ✅ **Backend (Express)**: http://localhost:3002
- ✅ **Proxy configurado** automaticamente
- ✅ **Logs unificados** em uma única janela
- ✅ **Fácil de parar** com Ctrl+C

### 2. `iniciar-servidores-separados.bat`
**Inicia os servidores em janelas separadas**

- 📱 **Janela 1**: Frontend (Vite) - Porta 3000
- 🔧 **Janela 2**: Backend (Express) - Porta 3002
- ✅ **Controle individual** de cada servidor
- ✅ **Logs separados** para cada servidor
- ⚠️ **Mais janelas** para gerenciar

### 3. `parar-servidores.bat`
**Para todos os servidores em execução**

- 🔍 **Detecta automaticamente** processos nas portas 3000 e 3002
- 🛑 **Para todos os processos** Node.js
- ✅ **Limpeza completa** dos servidores

## 🎯 Como Usar

### Opção 1: Servidores Unificados (Recomendado)
```bash
# Duplo clique no arquivo ou execute no terminal:
iniciar-servidores.bat
```

**Vantagens:**
- Uma única janela para gerenciar
- Logs organizados
- Fácil de parar (Ctrl+C)
- Proxy automático configurado

### Opção 2: Servidores Separados
```bash
# Duplo clique no arquivo ou execute no terminal:
iniciar-servidores-separados.bat
```

**Vantagens:**
- Controle individual de cada servidor
- Logs separados para debugging
- Pode parar um servidor sem afetar o outro

### Parar Servidores
```bash
# Para parar todos os servidores:
parar-servidores.bat
```

## 🔧 Configuração

### Pré-requisitos
- ✅ Node.js instalado
- ✅ npm instalado
- ✅ Dependências instaladas (`npm run install-all`)

### Arquivos de Configuração
Os scripts verificam automaticamente:

1. **server/.env** - Configurações do backend
   ```bash
   # Copie o arquivo de exemplo:
   copy server\env.example server\.env
   ```

2. **client/.env** - Configurações do frontend (se necessário)
   ```bash
   # Copie o arquivo de exemplo:
   copy client\env.example client\.env
   ```

## 🌐 URLs de Acesso

Após iniciar os servidores:

- **📱 Frontend**: http://localhost:3000
- **🔧 API Backend**: http://localhost:3002/api
- **🔍 Health Check**: http://localhost:3002/api/health

## 🛠️ Troubleshooting

### Erro: "Porta já em uso"
```bash
# Execute o script para parar servidores:
parar-servidores.bat

# Ou manualmente:
netstat -ano | findstr :3000
netstat -ano | findstr :3002
taskkill /f /pid <PID>
```

### Erro: "Dependências não encontradas"
```bash
# Instale as dependências:
npm run install-all
```

### Erro: "Arquivo .env não encontrado"
```bash
# Configure os arquivos de ambiente:
copy server\env.example server\.env
copy client\env.example client\.env
```

### Servidor não inicia
1. Verifique se Node.js está instalado: `node --version`
2. Verifique se npm está instalado: `npm --version`
3. Instale as dependências: `npm run install-all`
4. Configure o arquivo `.env` no servidor

## 📊 Logs e Debugging

### Logs do Frontend (Vite)
- Hot Module Replacement (HMR)
- Erros de compilação
- Requisições de proxy

### Logs do Backend (Express)
- Requisições da API
- Erros de banco de dados
- Middleware de autenticação

### Logs Unificados
Quando usando `iniciar-servidores.bat`, todos os logs aparecem em uma única janela com prefixos:
- `[Frontend]` - Logs do Vite
- `[Backend]` - Logs do Express

## 🔄 Reinicialização

Para reinicializar os servidores:

1. **Pare os servidores**: `parar-servidores.bat`
2. **Aguarde 3 segundos**
3. **Inicie novamente**: `iniciar-servidores.bat`

## 📝 Notas Importantes

- ⚠️ **Sempre pare os servidores** antes de fechar o terminal
- 🔄 **Reinicie os servidores** após alterações no `.env`
- 📁 **Mantenha os arquivos batch** na raiz do projeto
- 🚀 **Use o script unificado** para desenvolvimento normal
- 🔧 **Use o script separado** para debugging específico

---

**Rota de Ataque Questões** - Plataforma de estudo para concursos públicos 🎯

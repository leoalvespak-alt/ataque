# 🔧 Guia de Troubleshooting - Rota de Ataque Questões

## 🚨 **Problemas Comuns e Soluções**

### **1. Node.js não encontrado**
```bash
# Erro: node : O termo 'node' não é reconhecido
# Solução:
$env:PATH += ";C:\Program Files\nodejs"
# Ou reiniciar o computador
```

### **2. NPM não encontrado**
```bash
# Erro: npm : O termo 'npm' não é reconhecido
# Solução:
$env:PATH += ";C:\Program Files\nodejs"
# Verificar se Node.js está instalado corretamente
```

### **3. MySQL não encontrado**
```bash
# Erro: mysql : O termo 'mysql' não é reconhecido
# Solução:
$env:PATH += ";C:\Program Files\MySQL\MySQL Server 8.0\bin"
# Ou usar caminho completo:
"C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe"
```

### **4. Erro de permissão**
```bash
# Erro: EPERM: operation not permitted
# Solução: Executar terminal como administrador
# Ou usar pasta do usuário: C:\Users\Lenovo\
```

### **5. Package.json inválido**
```bash
# Erro: Invalid package config
# Solução:
Remove-Item package.json
npm init -y
```

### **6. Porta já em uso**
```bash
# Erro: EADDRINUSE: address already in use
# Solução:
netstat -ano | findstr :3001
taskkill /PID [PID_NUMBER] /F
```

### **7. Banco de dados não conecta**
```bash
# Verificar se MySQL está rodando:
Get-Service -Name "*mysql*"

# Verificar configurações no .env:
Get-Content server\.env

# Testar conexão:
mysql -u root -p -e "SHOW DATABASES;"
```

### **8. Dependências não instalam**
```bash
# Limpar cache do npm:
npm cache clean --force

# Deletar node_modules e reinstalar:
Remove-Item -Recurse -Force node_modules
Remove-Item package-lock.json
npm install
```

## 🔍 **Comandos de Diagnóstico**

### **Verificar Instalações**
```bash
# Node.js
node --version
npm --version

# MySQL
mysql --version
Get-Service -Name "*mysql*"

# Git (opcional)
git --version
```

### **Verificar Estrutura do Projeto**
```bash
# Listar arquivos
ls
ls server
ls client

# Verificar package.json
Get-Content package.json
Get-Content server\package.json
```

### **Verificar Configurações**
```bash
# Variáveis de ambiente
Get-Content server\.env

# PATH do sistema
$env:PATH -split ';'
```

## 🛠️ **Soluções Rápidas**

### **Reiniciar Serviços**
```bash
# MySQL
Restart-Service MySQL80

# Node.js (parar processos)
taskkill /f /im node.exe
```

### **Limpar e Reinstalar**
```bash
# Limpar tudo e reinstalar
Remove-Item -Recurse -Force node_modules
Remove-Item -Recurse -Force server\node_modules
Remove-Item -Recurse -Force client\node_modules
npm run install-all
```

### **Resetar Banco de Dados**
```bash
# Recriar banco
mysql -u root -p -e "DROP DATABASE IF EXISTS rota_ataque_questoes;"
mysql -u root -p -e "CREATE DATABASE rota_ataque_questoes;"
cd server
npm run seed
```

## 📞 **Logs e Debug**

### **Verificar Logs do Servidor**
```bash
# Executar servidor em modo debug
cd server
NODE_ENV=development DEBUG=* node index.js
```

### **Verificar Logs do MySQL**
```bash
# Verificar logs do MySQL
Get-Content "C:\ProgramData\MySQL\MySQL Server 8.0\Data\*.err"
```

## 🆘 **Quando Pedir Ajuda**

Inclua estas informações ao pedir ajuda:

1. **Versões instaladas**:
```bash
node --version
npm --version
mysql --version
```

2. **Erro completo** (copie e cole a mensagem)

3. **Comando que causou o erro**

4. **Sistema operacional**: Windows 10/11

5. **Passos que já tentou**

## 📚 **Recursos Adicionais**

- **Documentação completa**: `doc/DOCUMENTACAO_COMPLETA.md`
- **Resumo executivo**: `doc/RESUMO_EXECUTIVO.md`
- **Node.js docs**: https://nodejs.org/docs/
- **MySQL docs**: https://dev.mysql.com/doc/

---
**Última atualização**: 12/08/2025


# Configuração do Vite - Rota de Ataque Questões

## 📋 **Resumo da Instalação**

O projeto foi migrado para usar o **Vite** como bundler e servidor de desenvolvimento, oferecendo:

- ⚡ **Hot Module Replacement (HMR)** - Atualizações instantâneas
- 🚀 **Build ultra-rápido** - Compilação otimizada
- 📦 **Tree shaking** - Bundle otimizado
- 🔧 **Configuração simples** - Setup minimalista
- 🎯 **Suporte a TypeScript** - Desenvolvimento type-safe

---

## 🛠️ **Dependências Instaladas**

### **Dependências de Produção**
```bash
npm install react react-dom
```

### **Dependências de Desenvolvimento**
```bash
npm install --save-dev vite @vitejs/plugin-react
npm install --save-dev @types/react @types/react-dom typescript
```

---

## 📁 **Estrutura de Arquivos Criada**

```
client/
├── index.html                 # Ponto de entrada HTML
├── vite.config.js            # Configuração do Vite
├── tsconfig.json             # Configuração TypeScript
├── tsconfig.node.json        # Configuração TS para Node
├── src/
│   ├── main.tsx              # Ponto de entrada React
│   ├── App.tsx               # Componente principal
│   └── styles/
│       ├── global.css        # Estilos globais
│       └── App.css           # Estilos do App
└── public/
    └── favicon.svg           # Ícone da aplicação
```

---

## ⚙️ **Configurações**

### **vite.config.js**
```javascript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    host: true,
    proxy: {
      '/api': {
        target: 'http://localhost:3002',
        changeOrigin: true,
        secure: false,
      }
    }
  },
  build: {
    outDir: 'dist',
    sourcemap: true
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  }
})
```

### **tsconfig.json**
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

---

## 🚀 **Scripts Disponíveis**

### **Desenvolvimento**
```bash
# Executar apenas o cliente
cd client && npm run dev

# Executar cliente e servidor simultaneamente
npm run dev
```

### **Build**
```bash
# Build de produção
cd client && npm run build

# Preview do build
cd client && npm run preview
```

---

## 🌐 **Acesso à Aplicação**

- **Desenvolvimento**: http://localhost:3000
- **API Backend**: http://localhost:3002/api
- **Proxy API**: http://localhost:3000/api (redireciona para 3002)

---

## 🔧 **Funcionalidades Configuradas**

### **Proxy de API**
- Todas as requisições para `/api/*` são redirecionadas para o backend
- Configuração automática de CORS
- Suporte a HTTPS em desenvolvimento

### **Hot Module Replacement**
- Atualizações instantâneas sem reload da página
- Preserva o estado da aplicação
- Feedback visual de mudanças

### **TypeScript**
- Compilação type-safe
- IntelliSense completo
- Verificação de tipos em tempo real

### **Aliases de Importação**
- `@/` aponta para `src/`
- Imports mais limpos e organizados
- Resolução automática de caminhos

---

## 📦 **Build de Produção**

### **Comando**
```bash
npm run build
```

### **Saída**
- Arquivos otimizados em `client/dist/`
- Source maps para debugging
- Assets minificados
- Tree shaking aplicado

### **Deploy**
```bash
# Servir arquivos estáticos
npm run preview

# Ou usar servidor web (nginx, Apache, etc.)
```

---

## 🔍 **Debugging**

### **Source Maps**
- Habilitados em desenvolvimento e produção
- Debugging direto no código fonte
- Stack traces precisos

### **DevTools**
- React DevTools funcionam normalmente
- Console do navegador com informações detalhadas
- Network tab mostra requisições proxy

---

## 🚨 **Troubleshooting**

### **Porta 3000 em uso**
```bash
# Verificar processos
netstat -ano | findstr :3000

# Matar processo
taskkill /PID <PID> /F
```

### **Erros de TypeScript**
```bash
# Verificar tipos
cd client && npx tsc --noEmit

# Corrigir problemas de tipos
cd client && npx tsc --noEmit --pretty
```

### **Dependências desatualizadas**
```bash
# Limpar cache
npm cache clean --force

# Reinstalar dependências
rm -rf node_modules package-lock.json
npm install
```

---

## 📈 **Benefícios da Migração**

### **Performance**
- ⚡ Build 10-100x mais rápido que webpack
- 🔄 HMR instantâneo
- 📦 Bundle otimizado

### **Desenvolvimento**
- 🎯 Configuração simples
- 🔧 Zero config para React
- 📝 TypeScript nativo

### **Produção**
- 🚀 Build otimizado
- 📊 Tree shaking automático
- 🔍 Source maps precisos

---

## 🎉 **Status da Migração**

- ✅ **Vite instalado e configurado**
- ✅ **React + TypeScript funcionando**
- ✅ **Proxy de API configurado**
- ✅ **HMR ativo**
- ✅ **Build de produção funcionando**
- ✅ **Scripts atualizados**

---

**Próximos Passos:**
1. Migrar componentes existentes para React
2. Implementar roteamento com React Router
3. Adicionar gerenciamento de estado
4. Implementar autenticação no frontend

---

**Rota de Ataque Questões** - Agora com Vite! 🚀

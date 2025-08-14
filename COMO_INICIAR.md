# 🚀 Como Iniciar a Plataforma Rota de Ataque Questões

## 📋 Pré-requisitos

- Node.js instalado (versão 16 ou superior)
- NPM instalado
- Git instalado

## 🎯 Iniciar a Plataforma

### Opção 1: Arquivo .bat (Recomendado)

1. **Duplo clique** no arquivo `iniciar-plataforma.bat`
2. Aguarde os servidores inicializarem
3. A plataforma abrirá automaticamente no navegador

### Opção 2: Comando manual

```bash
# No terminal, na pasta raiz do projeto:
npm run dev
```

## 🌐 URLs de Acesso

- **Página Inicial**: http://localhost:3000
- **Login**: http://localhost:3000/login
- **Admin**: http://localhost:3000/admin
- **Questões**: http://localhost:3000/questoes-modern
- **Ranking**: http://localhost:3000/ranking-modern
- **Planos**: http://localhost:3000/planos-modern

## 🔑 Credenciais de Teste

- **Admin**: admin@rotadeataque.com / 123456
- **Aluno**: joao@teste.com / 123456

## ⚠️ Importante

- Aguarde alguns segundos para os servidores inicializarem completamente
- Mantenha as janelas dos servidores abertas enquanto usar a plataforma
- Para parar, feche as janelas dos servidores

## 🆘 Solução de Problemas

### Porta em uso
Se aparecer erro de porta em uso:
```bash
# No PowerShell como administrador:
taskkill /f /im node.exe
```

### Dependências não encontradas
O arquivo .bat verifica e instala automaticamente as dependências.

## 📞 Suporte

Em caso de problemas, verifique:
1. Se o Node.js está instalado
2. Se as portas 3000 e 3002 estão livres
3. Se todas as dependências foram instaladas

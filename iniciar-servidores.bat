@echo off
chcp 65001 >nul
title Rota de Ataque Questões - Servidores

echo.
echo ========================================
echo   ROTA DE ATAQUE QUESTÕES v1.2.0
echo ========================================
echo.
echo 🚀 Iniciando servidores...
echo.

echo 📋 Verificando dependências...
if not exist "node_modules" (
    echo ❌ Dependências não encontradas. Instalando...
    call npm run install-all
    if errorlevel 1 (
        echo ❌ Erro ao instalar dependências!
        pause
        exit /b 1
    )
)

echo.
echo ✅ Dependências verificadas!
echo.

echo 🔧 Verificando arquivos de configuração...
if not exist "server\.env" (
    echo ⚠️  Arquivo .env não encontrado no servidor!
    echo    Copie server\env.example para server\.env e configure as variáveis
    echo.
)

if not exist "client\.env" (
    echo ⚠️  Arquivo .env não encontrado no cliente!
    echo    Copie client\env.example para client\.env se necessário
    echo.
)

echo.
echo 🌐 Iniciando servidores em paralelo...
echo.
echo 📱 Frontend (Vite): http://localhost:3000
echo 🔧 Backend (API):   http://localhost:3002
echo.
echo ⏳ Aguarde alguns segundos para os servidores iniciarem...
echo.

:: Iniciar servidores em paralelo usando o script npm
call npm run dev

echo.
echo ✅ Servidores iniciados com sucesso!
echo.
echo 📱 Acesse: http://localhost:3000
echo 🔧 API:    http://localhost:3002/api
echo.
echo 💡 Pressione Ctrl+C para parar os servidores
echo.
pause

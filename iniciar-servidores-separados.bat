@echo off
chcp 65001 >nul
title Rota de Ataque Questões - Servidores Separados

echo.
echo ========================================
echo   ROTA DE ATAQUE QUESTÕES v1.2.0
echo ========================================
echo.
echo 🚀 Iniciando servidores em janelas separadas...
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
echo 🌐 Iniciando servidores...
echo.
echo 📱 Frontend (Vite): http://localhost:3000
echo 🔧 Backend (API):   http://localhost:3002
echo.

:: Iniciar servidor backend em uma nova janela
echo 🔧 Iniciando servidor backend...
start "Backend - Porta 3002" cmd /k "cd server && npm run dev"

:: Aguardar um pouco para o backend inicializar
timeout /t 3 /nobreak >nul

:: Iniciar servidor frontend em uma nova janela
echo 📱 Iniciando servidor frontend...
start "Frontend - Porta 3000" cmd /k "cd client && npm run dev"

echo.
echo ✅ Servidores iniciados em janelas separadas!
echo.
echo 📱 Frontend: http://localhost:3000
echo 🔧 Backend:  http://localhost:3002/api
echo.
echo 💡 Feche as janelas dos servidores para pará-los
echo.
pause

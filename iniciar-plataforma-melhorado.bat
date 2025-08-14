@echo off
title Rota de Ataque Questoes - Iniciando Plataforma (Melhorado)
color 0A

echo.
echo ========================================
echo    🚀 ROTA DE ATAQUE QUESTOES
echo    Versao Melhorada - Porta 3002 Fixa
echo ========================================
echo.

echo [1/4] Verificando e liberando portas...
echo Verificando se a porta 3002 está em uso...
netstat -ano | findstr :3002 > nul
if %errorlevel% equ 0 (
    echo ⚠️  Porta 3002 está em uso. Parando processos...
    for /f "tokens=5" %%a in ('netstat -ano ^| findstr :3002') do (
        echo Parando processo PID: %%a
        taskkill /F /PID %%a >nul 2>&1
    )
    timeout /t 2 /nobreak > nul
    echo ✅ Porta 3002 liberada
) else (
    echo ✅ Porta 3002 livre
)

echo Verificando se a porta 3000 está em uso...
netstat -ano | findstr :3000 > nul
if %errorlevel% equ 0 (
    echo ⚠️  Porta 3000 está em uso. Parando processos...
    for /f "tokens=5" %%a in ('netstat -ano ^| findstr :3000') do (
        echo Parando processo PID: %%a
        taskkill /F /PID %%a >nul 2>&1
    )
    timeout /t 2 /nobreak > nul
    echo ✅ Porta 3000 liberada
) else (
    echo ✅ Porta 3000 livre
)

echo.
echo [2/4] Verificando dependencias...
cd client
if not exist "node_modules" (
    echo ❌ Instalando dependencias do cliente...
    npm install
) else (
    echo ✅ Dependencias do cliente encontradas
)
cd ..

cd server
if not exist "node_modules" (
    echo ❌ Instalando dependencias do servidor...
    npm install
) else (
    echo ✅ Dependencias do servidor encontradas
)
cd ..

echo.
echo [3/4] Iniciando servidor backend (porta 3002)...
start "Backend Server - Porta 3002" cmd /k "cd server && echo Iniciando backend na porta 3002... && node index.js"

echo Aguardando backend inicializar...
timeout /t 5 /nobreak > nul

echo.
echo [4/4] Iniciando servidor frontend Vite (porta 3000)...
start "Frontend Vite Server - Porta 3000" cmd /k "cd client && echo Iniciando frontend na porta 3000... && npm run dev"

echo Aguardando Vite inicializar...
timeout /t 8 /nobreak > nul

echo.
echo ========================================
echo    ✅ PLATAFORMA INICIADA!
echo ========================================
echo.
echo 🌐 URLs de acesso:
echo    Frontend: http://localhost:3000 (React App)
echo    Backend:  http://localhost:3002/api
echo.
echo 📋 Páginas disponíveis:
echo    - Login: http://localhost:3000/login
echo    - Cadastro: http://localhost:3000/cadastro
echo    - Dashboard: http://localhost:3000/dashboard
echo    - Questões: http://localhost:3000/questoes
echo    - Ranking: http://localhost:3000/ranking
echo    - Planos: http://localhost:3000/planos
echo    - Perfil: http://localhost:3000/perfil
echo    - Admin: http://localhost:3000/admin
echo.
echo 🔑 Credenciais de teste:
echo    Admin: admin@rotadeataque.com / 123456
echo    Aluno: joao@teste.com / 123456
echo.
echo 🎯 Como testar:
echo    1. Acesse: http://localhost:3000
echo    2. Faça login com as credenciais
echo    3. Será redirecionado para o dashboard
echo.
echo ⚠️  IMPORTANTE: Aguarde alguns segundos para os servidores
echo    inicializarem completamente antes de acessar as URLs.
echo.
echo Pressione qualquer tecla para abrir a plataforma...
pause > nul

echo.
echo Abrindo plataforma no navegador...
start "" http://localhost:3000

echo.
echo ========================================
echo    🎉 PLATAFORMA PRONTA!
echo ========================================
echo.
echo Os servidores continuarão rodando em janelas separadas.
echo Para parar, feche as janelas dos servidores.
echo.
echo 🔧 Para verificar se está funcionando:
echo    - Backend: http://localhost:3002/api/health
echo    - Frontend: http://localhost:3000
echo.
pause

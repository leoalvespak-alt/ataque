@echo off
title Rota de Ataque Questoes - Iniciando Plataforma
color 0A

echo.
echo ========================================
echo    🚀 ROTA DE ATAQUE QUESTOES
echo ========================================
echo.
echo Iniciando plataforma completa...
echo.

echo [1/3] Verificando dependencias...
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
echo [2/3] Iniciando servidor backend (porta 3002)...
start "Backend Server" cmd /k "cd server && node index.js"

echo Aguardando backend inicializar...
timeout /t 3 /nobreak > nul

echo.
echo [3/3] Iniciando servidor frontend Vite (porta 3000)...
start "Frontend Vite Server" cmd /k "cd client && npm run dev"

echo Aguardando Vite inicializar...
timeout /t 5 /nobreak > nul

echo.
echo ========================================
echo    ✅ PLATAFORMA INICIADA!
echo ========================================
echo.
echo 🌐 URLs de acesso:
echo    Frontend: http://localhost:3000 (React App + Páginas HTML)
echo    Backend:  http://localhost:3002/api
echo.
echo 📋 Páginas disponíveis:
echo    - Página inicial: http://localhost:3000
echo    - Login: http://localhost:3000/login
echo    - Admin: http://localhost:3000/admin
echo    - Questões: http://localhost:3000/questoes-modern
echo    - Ranking: http://localhost:3000/ranking-modern
echo    - Planos: http://localhost:3000/planos-modern
echo.
echo 🔑 Credenciais de teste:
echo    Admin: admin@rotadeataque.com / 123456
echo    Aluno: joao@teste.com / 123456
echo.
echo 🎯 Como testar:
echo    1. Acesse: http://localhost:3000
echo    2. Clique em "Login" ou acesse: http://localhost:3000/login
echo    3. Faça login com as credenciais
echo    4. Será redirecionado para a página apropriada
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
pause

@echo off
echo ========================================
echo    SETUP COMPLETO - ROTA DE ATAQUE
echo ========================================
echo.

echo [1/5] Instalando dependências do projeto principal...
npm install

echo [2/5] Instalando dependências do servidor...
cd server
npm install
cd ..

echo [3/5] Instalando dependências do cliente...
cd client
npm install
cd ..

echo [4/5] Iniciando servidores...
echo.
echo Iniciando backend (porta 3002)...
start "Backend Server" cmd /k "cd server && node index.js"

echo Aguardando backend inicializar...
timeout /t 3 /nobreak > nul

echo Iniciando frontend Vite (porta 3000)...
start "Frontend Vite Server" cmd /k "cd client && npm run dev"

echo Iniciando servidor páginas HTML (porta 3001)...
start "HTML Pages Server" cmd /k "cd client && npm run dev:html"

echo.
echo ========================================
echo    SETUP CONCLUÍDO!
echo ========================================
echo.
echo 🌐 URLs de acesso:
echo    Frontend: http://localhost:3000 (React App)
echo    HTML Pages: http://localhost:3001 (Páginas modernas)
echo    Backend:  http://localhost:3002/api
echo.
echo 👤 Credenciais de teste:
echo    Admin: admin@rotadeataque.com / 123456
echo    Aluno: joao@teste.com / 123456
echo.
echo Pressione qualquer tecla para sair...
pause > nul

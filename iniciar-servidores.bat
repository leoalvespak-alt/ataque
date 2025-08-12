@echo off
echo ========================================
echo    ROTA DE ATAQUE QUESTOES
echo ========================================
echo.
echo Iniciando servidores...
echo.

echo [1/2] Iniciando servidor backend (porta 3001)...
start "Backend Server" cmd /k "cd server && node index.js"

echo [2/2] Iniciando servidor frontend (porta 3000)...
start "Frontend Server" cmd /k "cd client && node server.js"

echo.
echo ========================================
echo Servidores iniciados!
echo.
echo Backend:  http://localhost:3001/api
echo Frontend: http://localhost:3000
echo.
echo Pressione qualquer tecla para sair...
pause > nul

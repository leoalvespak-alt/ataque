@echo off
echo ========================================
echo    INICIANDO SERVIDORES
echo ========================================
echo.

echo [1/2] Iniciando servidor backend...
start "Backend Server" cmd /k "cd server && node index-no-logger.js"

echo Aguardando servidor backend inicializar...
timeout /t 3 /nobreak > nul

echo [2/2] Iniciando servidor frontend...
start "Frontend Server" cmd /k "cd client && node server.js"

echo.
echo ========================================
echo    SERVIDORES INICIADOS!
echo ========================================
echo.
echo 🌐 URLs de acesso:
echo    Frontend: http://localhost:3000
echo    Backend:  http://localhost:3002/api
echo.
echo 👤 Credenciais de teste:
echo    Admin: admin@example.com / admin123
echo    Aluno: joao@example.com / 123456
echo.
echo Pressione qualquer tecla para sair...
pause > nul

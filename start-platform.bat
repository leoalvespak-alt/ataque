@echo off
echo ========================================
echo    Rota de Ataque Questoes
echo ========================================
echo.
echo Iniciando servidor mock...
start "Servidor Mock" cmd /k "cd server && node mock-server.js"
echo.
echo Aguardando servidor iniciar...
timeout /t 3 /nobreak > nul
echo.
echo Iniciando frontend...
start "Frontend React" cmd /k "cd client && npm start"
echo.
echo ========================================
echo    Plataforma iniciada!
echo ========================================
echo.
echo Frontend: http://localhost:3000
echo Backend:  http://localhost:3001
echo.
echo Credenciais de teste:
echo Admin: admin@rotaataque.com / 123456
echo Aluno: joao@teste.com / 123456
echo.
pause

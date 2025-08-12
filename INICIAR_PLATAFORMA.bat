@echo off
echo ========================================
echo    Rota de Ataque Questoes
echo ========================================
echo.
echo Iniciando servidor backend...
start "Servidor Backend" cmd /k "cd /d C:\rota-de-ataque-questoes\server && node mock-server.js"
echo.
echo Aguardando servidor iniciar...
timeout /t 5 /nobreak > nul
echo.
echo Iniciando frontend...
start "Frontend" cmd /k "cd /d C:\rota-de-ataque-questoes\client && node server.js"
echo.
echo ========================================
echo    PLATAFORMA INICIADA!
echo ========================================
echo.
echo Frontend: http://localhost:3000
echo Backend:  http://localhost:3001
echo.
echo Credenciais de teste:
echo Admin: admin@rotaataque.com / 123456
echo Aluno: joao@teste.com / 123456
echo.
echo Aguarde alguns segundos para os serviços iniciarem...
echo.
echo ROTAS DISPONÍVEIS:
echo - / (página inicial)
echo - /login (página de login)
echo - /cadastro (página de cadastro)
echo - /questoes (página de questões)
echo - /ranking (página de ranking)
echo - /planos (página de planos)
echo - /perfil (página de perfil)
echo - /admin (painel administrativo)
echo.
pause

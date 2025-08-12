@echo off
echo ========================================
echo    Rota de Ataque Questoes
echo ========================================
echo.
echo Status dos Servicos:
echo.
echo 1. Servidor Backend (Porta 3001):
netstat -an | findstr ":3001" > nul
if %errorlevel% equ 0 (
    echo    ✅ RODANDO
) else (
    echo    ❌ PARADO
)
echo.
echo 2. Frontend (Porta 3000):
netstat -an | findstr ":3000" > nul
if %errorlevel% equ 0 (
    echo    ✅ RODANDO
) else (
    echo    ❌ PARADO
)
echo.
echo ========================================
echo    INSTRUCOES PARA TESTAR
echo ========================================
echo.
echo 1. Abra um terminal e execute:
echo    cd C:\rota-de-ataque-questoes\server
echo    node mock-server.js
echo.
echo 2. Abra outro terminal e execute:
echo    cd C:\rota-de-ataque-questoes\client
echo    npm start
echo.
echo 3. Acesse no navegador:
echo    http://localhost:3000
echo.
echo 4. Teste a API:
echo    http://localhost:3001/api/health
echo.
echo ========================================
echo    CREDENCIAIS DE TESTE
echo ========================================
echo.
echo Admin: admin@rotaataque.com / 123456
echo Aluno: joao@teste.com / 123456
echo.
pause

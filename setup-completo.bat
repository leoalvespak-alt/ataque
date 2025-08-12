@echo off
echo ========================================
echo    CONFIGURACAO COMPLETA DA PLATAFORMA
echo    ROTA DE ATAQUE QUESTOES
echo ========================================
echo.

echo [1/5] Verificando dependencias...
cd server
call npm install
if %errorlevel% neq 0 (
    echo ❌ Erro ao instalar dependencias do servidor
    pause
    exit /b 1
)

cd ..\client
call npm install
if %errorlevel% neq 0 (
    echo ❌ Erro ao instalar dependencias do cliente
    pause
    exit /b 1
)

echo ✅ Dependencias instaladas com sucesso!
echo.

echo [2/5] Configurando banco de dados...
cd ..\server
call npm run setup-db
if %errorlevel% neq 0 (
    echo ❌ Erro ao configurar banco de dados
    echo.
    echo Verifique se o PostgreSQL esta rodando na porta 5432
    echo e se as credenciais no arquivo .env estao corretas
    pause
    exit /b 1
)

echo ✅ Banco de dados configurado com sucesso!
echo.

echo [3/5] Iniciando servidor backend...
start "Backend Server" cmd /k "cd server && npm start"

echo Aguardando servidor backend inicializar...
timeout /t 5 /nobreak > nul

echo [4/5] Iniciando servidor frontend...
start "Frontend Server" cmd /k "cd client && node server.js"

echo Aguardando servidor frontend inicializar...
timeout /t 3 /nobreak > nul

echo [5/5] Verificando servidores...
echo.
echo ========================================
echo    PLATAFORMA CONFIGURADA COM SUCESSO!
echo ========================================
echo.
echo 🌐 URLs de acesso:
echo    Frontend: http://localhost:3000
echo    Backend:  http://localhost:3001/api
echo.
echo 👤 Credenciais de teste:
echo    Admin: admin@example.com / admin123
echo    Aluno: joao@example.com / 123456
echo    Aluno: maria@example.com / 123456
echo.
echo 📝 Próximos passos:
echo    1. Acesse http://localhost:3000
echo    2. Faça login com uma das credenciais acima
echo    3. Teste as funcionalidades da plataforma
echo.
echo Pressione qualquer tecla para sair...
pause > nul

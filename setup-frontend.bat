@echo off
echo ========================================
echo Configurando Frontend - Rota de Ataque
echo ========================================

echo.
echo 1. Navegando para o diretório do cliente...
cd client

echo.
echo 2. Instalando dependências...
npm install

echo.
echo 3. Criando arquivo .env...
echo VITE_SUPABASE_URL=https://cfwyuomeaudpnmjosetq.supabase.co > .env
echo VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNmd3l1b21lYXVkcG5tam9zZXRxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUwNTEyMjYsImV4cCI6MjA3MDYyNzIyNn0.4tE2STnUzVSR1OcsNCxWUEkiPG6Sph4-OUnA9h54gf8 >> .env

echo.
echo 4. Configuração concluída!
echo.
echo Para iniciar o frontend, execute:
echo cd client
echo npm run dev
echo.
echo O frontend estará disponível em: http://localhost:3000
echo.
echo Credenciais de teste:
echo Admin: admin@rotadeataque.com / 123456
echo Aluno: joao@teste.com / 123456
echo.
pause

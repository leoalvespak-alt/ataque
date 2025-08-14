@echo off
echo Configurando arquivo .env para o cliente...

cd client

echo VITE_SUPABASE_URL=https://cfwyuomeaudpnmjosetq.supabase.co > .env
echo VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNmd3l1b21lYXVkcG5tam9zZXRxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUwNTEyMjYsImV4cCI6MjA3MDYyNzIyNn0.4tE2STnUzVSR1OcsNCxWUEkiPG6Sph4-OUnA9h54gf8 >> .env

echo Arquivo .env criado com sucesso!
echo.
echo Próximos passos:
echo 1. Execute o schema SQL no Supabase
echo 2. Teste a conexão com: node test-supabase-correct-url.js
echo 3. Inicie o frontend com: cd client ^&^& npm run dev

pause

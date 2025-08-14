const fs = require('fs');
const path = require('path');

// Configurações do Supabase (substitua pelos seus valores reais)
const supabaseConfig = {
  SUPABASE_URL: 'https://cfwyuomeaudpnmjosetq.supabase.co',
  SUPABASE_ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNmd3l1b21lYXVkcG5tam9zZXRxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUwNTEyMjYsImV4cCI6MjA3MDYyNzIyNn0.4tE2STnUzVSR1OcsNCxWUEkiPG6Sph4-OUnA9h54gf8',
  SUPABASE_SERVICE_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNmd3l1b21lYXVkcG5tam9zZXRxIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTA1MTIyNiwiZXhwIjoyMDcwNjI3MjI2fQ.Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8' // Substitua pela sua service key
};

// Criar arquivo .env na raiz
const envContent = `# Configurações do Supabase
SUPABASE_URL=${supabaseConfig.SUPABASE_URL}
SUPABASE_ANON_KEY=${supabaseConfig.SUPABASE_ANON_KEY}
SUPABASE_SERVICE_KEY=${supabaseConfig.SUPABASE_SERVICE_KEY}

# Configurações do JWT
JWT_SECRET=seu_jwt_secret_super_seguro_aqui
JWT_EXPIRES_IN=7d

# Configurações do Servidor
PORT=3002
NODE_ENV=development

# Configurações de Upload
UPLOAD_PATH=./uploads
MAX_FILE_SIZE=5242880
`;

// Criar arquivo .env na raiz
fs.writeFileSync('.env', envContent);

// Criar arquivo .env no client
const clientEnvContent = `# Configurações do Supabase
VITE_SUPABASE_URL=${supabaseConfig.SUPABASE_URL}
VITE_SUPABASE_ANON_KEY=${supabaseConfig.SUPABASE_ANON_KEY}
`;

fs.writeFileSync(path.join('client', '.env'), clientEnvContent);

console.log('✅ Arquivos .env criados com sucesso!');
console.log('');
console.log('⚠️  IMPORTANTE:');
console.log('1. Substitua SUPABASE_SERVICE_KEY pela sua chave real');
console.log('2. Para obter a service key:');
console.log('   - Acesse: https://supabase.com/dashboard');
console.log('   - Vá em Settings > API');
console.log('   - Copie a "service_role" key');
console.log('   - Substitua no arquivo .env');
console.log('');
console.log('3. Execute o script de teste:');
console.log('   node testar-upload-storage.js');

const fs = require('fs');

// Configuração do Supabase
const supabaseUrl = 'https://cfwyuomeaudpnmjosetq.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNmd3l1b21lYXVkcG5tam9zZXRxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUwNTEyMjYsImV4cCI6MjA3MDYyNzIyNn0.4tE2STnUzVSR1OcsNCxWUEkiPG6Sph4-OUnA9h54gf8';

async function executarSQL(sql) {
  try {
    const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${supabaseKey}`,
        'apikey': supabaseKey
      },
      body: JSON.stringify({ sql })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return { data, error: null };
  } catch (error) {
    return { data: null, error };
  }
}

async function executarCorrecoes() {
  try {
    console.log('Iniciando execução das correções...');
    
    // Ler o arquivo SQL
    const sql = fs.readFileSync('corrigir-estruturas-faltantes.sql', 'utf8');
    
    // Dividir o SQL em comandos individuais
    const comandos = sql.split(';').filter(cmd => cmd.trim().length > 0);
    
    console.log(`Executando ${comandos.length} comandos SQL...`);
    
    for (let i = 0; i < comandos.length; i++) {
      const comando = comandos[i].trim();
      if (comando.length === 0) continue;
      
      console.log(`Executando comando ${i + 1}/${comandos.length}...`);
      
      try {
        const { data, error } = await executarSQL(comando);
        
        if (error) {
          console.error(`Erro no comando ${i + 1}:`, error);
        } else {
          console.log(`Comando ${i + 1} executado com sucesso`);
        }
      } catch (err) {
        console.error(`Erro ao executar comando ${i + 1}:`, err);
      }
    }
    
    console.log('Execução das correções concluída!');
    
  } catch (error) {
    console.error('Erro geral:', error);
  }
}

executarCorrecoes();

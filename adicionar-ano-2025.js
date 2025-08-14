const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://cfwyuomeaudpnmjosetq.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNmd3l1b21lYXVkcG5tam9zZXRxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUwNTEyMjYsImV4cCI6MjA3MDYyNzIyNn0.4tE2STnUzVSR1OcsNCxWUEkiPG6Sph4-OUnA9h54gf8';

const supabase = createClient(supabaseUrl, supabaseKey);

async function adicionarAno2025() {
  try {
    console.log('Adicionando ano 2025...');
    
    const { data, error } = await supabase
      .from('anos')
      .insert({ ano: 2025 })
      .select();
    
    if (error) {
      console.error('Erro ao adicionar ano 2025:', error);
    } else {
      console.log('Ano 2025 adicionado com sucesso:', data);
    }
  } catch (error) {
    console.error('Erro:', error);
  }
}

adicionarAno2025();

// Script para testar a conexão com o Supabase e a tabela themes
const { createClient } = require('@supabase/supabase-js');

// Configuração do Supabase (substitua pelas suas credenciais)
const supabaseUrl = 'https://cfwyuomeaudpnmjosetq.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNmd3l1b21lYXVkcG5tam9zZXRxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUwNTEyMjYsImV4cCI6MjA3MDYyNzIyNn0.4tE2STnUzVSR1OcsNCxWUEkiPG6Sph4-OUnA9h54gf8';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testThemeConnection() {
  console.log('🔍 Testando conexão com o Supabase...');
  
  try {
    // Teste 1: Verificar se a tabela themes existe
    console.log('\n1. Verificando se a tabela themes existe...');
    const { data: tableExists, error: tableError } = await supabase
      .from('themes')
      .select('count')
      .limit(1);
    
    if (tableError) {
      console.error('❌ Erro ao acessar tabela themes:', tableError);
      return;
    }
    
    console.log('✅ Tabela themes acessível');
    
    // Teste 2: Verificar estrutura da tabela
    console.log('\n2. Verificando estrutura da tabela...');
    const { data: structure, error: structureError } = await supabase
      .rpc('get_table_structure', { table_name: 'themes' });
    
    if (structureError) {
      console.log('⚠️ Não foi possível verificar estrutura via RPC, tentando query direta...');
      const { data: columns, error: columnsError } = await supabase
        .from('information_schema.columns')
        .select('column_name, data_type, is_nullable')
        .eq('table_name', 'themes')
        .eq('table_schema', 'public');
      
      if (columnsError) {
        console.error('❌ Erro ao verificar estrutura:', columnsError);
      } else {
        console.log('✅ Estrutura da tabela:', columns);
      }
    } else {
      console.log('✅ Estrutura da tabela:', structure);
    }
    
    // Teste 3: Verificar se há dados na tabela
    console.log('\n3. Verificando dados na tabela...');
    const { data: themes, error: themesError } = await supabase
      .from('themes')
      .select('*');
    
    if (themesError) {
      console.error('❌ Erro ao carregar temas:', themesError);
      return;
    }
    
    console.log(`✅ Encontrados ${themes.length} temas na tabela`);
    
    if (themes.length > 0) {
      console.log('📋 Temas encontrados:');
      themes.forEach((theme, index) => {
        console.log(`  ${index + 1}. ${theme.name} (ID: ${theme.id})`);
        console.log(`     - Ativo: ${theme.is_active}`);
        console.log(`     - Padrão: ${theme.is_default}`);
        console.log(`     - Tem tokens: ${!!theme.tokens}`);
        console.log(`     - Tem semantic: ${!!theme.semantic}`);
      });
      
      // Teste 4: Verificar tema ativo
      console.log('\n4. Verificando tema ativo...');
      const activeTheme = themes.find(t => t.is_active);
      
      if (activeTheme) {
        console.log('✅ Tema ativo encontrado:', activeTheme.name);
        console.log('   - Tokens válidos:', !!activeTheme.tokens);
        console.log('   - Semantic válido:', !!activeTheme.semantic);
        
        if (activeTheme.tokens) {
          console.log('   - Cores:', Object.keys(activeTheme.tokens.colors || {}).length);
          console.log('   - Espaçamentos:', Object.keys(activeTheme.tokens.spacing || {}).length);
          console.log('   - Tipografia:', Object.keys(activeTheme.tokens.typography || {}).length);
        }
      } else {
        console.log('⚠️ Nenhum tema ativo encontrado');
      }
    } else {
      console.log('⚠️ Nenhum tema encontrado na tabela');
    }
    
    // Teste 5: Testar inserção de tema de teste
    console.log('\n5. Testando inserção de tema de teste...');
    const testTheme = {
      name: 'Tema de Teste',
      description: 'Tema criado para teste de conexão',
      tokens: {
        colors: {
          'primary-500': { hex: '#3b82f6', hsl: { h: 217, s: 91, l: 60 }, variants: ['#3b82f6'] }
        },
        spacing: { 'spacing-1': '4px' },
        typography: { 'font-family-sans': 'Inter, sans-serif' },
        borders: { 'border-radius-base': '4px' },
        shadows: { 'shadow-sm': '0 1px 2px 0 rgba(0, 0, 0, 0.05)' },
        transitions: { 'transition-base': '250ms ease-in-out' }
      },
      semantic: {
        primary: { light: '#3b82f6', base: '#2563eb', dark: '#1d4ed8' },
        secondary: { light: '#6b7280', base: '#4b5563', dark: '#374151' },
        success: { light: '#22c55e', base: '#16a34a', dark: '#15803d' },
        warning: { light: '#f59e0b', base: '#d97706', dark: '#b45309' },
        error: { light: '#ef4444', base: '#dc2626', dark: '#b91c1c' },
        background: { primary: '#ffffff', secondary: '#f9fafb', tertiary: '#f3f4f6' },
        surface: { primary: '#ffffff', secondary: '#f9fafb', tertiary: '#f3f4f6' },
        text: { primary: '#111827', secondary: '#4b5563', tertiary: '#9ca3af', inverse: '#ffffff' }
      },
      is_active: false,
      is_default: false
    };
    
    const { data: insertedTheme, error: insertError } = await supabase
      .from('themes')
      .insert(testTheme)
      .select()
      .single();
    
    if (insertError) {
      console.error('❌ Erro ao inserir tema de teste:', insertError);
    } else {
      console.log('✅ Tema de teste inserido com sucesso:', insertedTheme.id);
      
      // Remover tema de teste
      const { error: deleteError } = await supabase
        .from('themes')
        .delete()
        .eq('id', insertedTheme.id);
      
      if (deleteError) {
        console.error('❌ Erro ao remover tema de teste:', deleteError);
      } else {
        console.log('✅ Tema de teste removido com sucesso');
      }
    }
    
  } catch (error) {
    console.error('❌ Erro geral:', error);
  }
}

// Executar teste
testThemeConnection().then(() => {
  console.log('\n🏁 Teste concluído');
  process.exit(0);
}).catch((error) => {
  console.error('❌ Erro fatal:', error);
  process.exit(1);
});

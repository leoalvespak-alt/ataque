// Script para debugar problemas no frontend relacionados ao tema
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://cfwyuomeaudpnmjosetq.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNmd3l1b21lYXVkcG5tam9zZXRxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUwNTEyMjYsImV4cCI6MjA3MDYyNzIyNn0.4tE2STnUzVSR1OcsNCxWUEkiPG6Sph4-OUnA9h54gf8';

const supabase = createClient(supabaseUrl, supabaseKey);

async function debugThemeFrontend() {
  console.log('🔍 Debugando problemas do frontend com tema...');
  
  try {
    // Simular o que o ThemeContext faz
    console.log('\n1. Simulando carregamento do tema ativo...');
    
    const { data: activeTheme, error: activeError } = await supabase
      .from('themes')
      .select('*')
      .eq('is_active', true)
      .single();
    
    if (activeError) {
      console.error('❌ Erro ao carregar tema ativo:', activeError);
      return;
    }
    
    console.log('✅ Tema ativo carregado:', activeTheme.name);
    console.log('   - ID:', activeTheme.id);
    console.log('   - Tokens:', !!activeTheme.tokens);
    console.log('   - Semantic:', !!activeTheme.semantic);
    
    // Verificar se o tema tem a estrutura correta
    console.log('\n2. Verificando estrutura do tema...');
    
    if (!activeTheme.tokens) {
      console.error('❌ Tema não tem tokens');
      return;
    }
    
    const requiredSections = ['colors', 'spacing', 'typography', 'borders', 'shadows', 'transitions'];
    const missingSections = requiredSections.filter(section => !activeTheme.tokens[section]);
    
    if (missingSections.length > 0) {
      console.error('❌ Seções faltando no tema:', missingSections);
    } else {
      console.log('✅ Todas as seções do tema estão presentes');
    }
    
    // Verificar se o semantic está correto
    if (!activeTheme.semantic) {
      console.error('❌ Tema não tem semantic');
      return;
    }
    
    console.log('✅ Semantic presente');
    
    // Simular geração de CSS variables
    console.log('\n3. Simulando geração de CSS variables...');
    
    const cssVars = generateCSSVariables(activeTheme);
    console.log('✅ CSS variables geradas com sucesso');
    console.log('   - Tamanho:', cssVars.length, 'caracteres');
    console.log('   - Primeiras linhas:');
    console.log(cssVars.split('\n').slice(0, 5).join('\n'));
    
    // Verificar se há problemas com Object.entries
    console.log('\n4. Verificando se há problemas com Object.entries...');
    
    try {
      Object.entries(activeTheme.tokens.colors || {});
      console.log('✅ Object.entries funciona com colors');
    } catch (error) {
      console.error('❌ Erro com Object.entries em colors:', error);
    }
    
    try {
      Object.entries(activeTheme.tokens.spacing || {});
      console.log('✅ Object.entries funciona com spacing');
    } catch (error) {
      console.error('❌ Erro com Object.entries em spacing:', error);
    }
    
    try {
      Object.entries(activeTheme.tokens.typography || {});
      console.log('✅ Object.entries funciona com typography');
    } catch (error) {
      console.error('❌ Erro com Object.entries em typography:', error);
    }
    
    // Verificar se há valores null/undefined
    console.log('\n5. Verificando valores null/undefined...');
    
    let hasNullValues = false;
    
    Object.entries(activeTheme.tokens).forEach(([section, values]) => {
      if (values && typeof values === 'object') {
        Object.entries(values).forEach(([key, value]) => {
          if (value === null || value === undefined) {
            console.error(`❌ Valor null/undefined encontrado: ${section}.${key}`);
            hasNullValues = true;
          }
        });
      }
    });
    
    if (!hasNullValues) {
      console.log('✅ Nenhum valor null/undefined encontrado');
    }
    
    // Verificar se o tema pode ser aplicado
    console.log('\n6. Verificando se o tema pode ser aplicado...');
    
    const validatedTheme = {
      id: activeTheme.id || 'default',
      name: activeTheme.name || 'Tema Padrão',
      description: activeTheme.description || '',
      tokens: {
        colors: activeTheme.tokens?.colors || {},
        spacing: activeTheme.tokens?.spacing || {},
        typography: activeTheme.tokens?.typography || {},
        borders: activeTheme.tokens?.borders || {},
        shadows: activeTheme.tokens?.shadows || {},
        transitions: activeTheme.tokens?.transitions || {},
      },
      semantic: activeTheme.semantic || {},
      is_active: activeTheme.is_active || false,
      is_default: activeTheme.is_default || false,
      created_at: activeTheme.created_at || new Date().toISOString(),
      updated_at: activeTheme.updated_at || new Date().toISOString(),
    };
    
    console.log('✅ Tema validado com sucesso');
    console.log('   - Cores:', Object.keys(validatedTheme.tokens.colors).length);
    console.log('   - Espaçamentos:', Object.keys(validatedTheme.tokens.spacing).length);
    console.log('   - Tipografia:', Object.keys(validatedTheme.tokens.typography).length);
    
  } catch (error) {
    console.error('❌ Erro geral:', error);
  }
}

// Função para gerar CSS variables (simulando o ThemeContext)
function generateCSSVariables(theme) {
  const cssVars = [];
  
  if (!theme || !theme.tokens) {
    console.warn('Tema inválido fornecido para generateCSSVariables:', theme);
    return ':root {}';
  }
  
  // Cores
  if (theme.tokens.colors && typeof theme.tokens.colors === 'object') {
    Object.entries(theme.tokens.colors).forEach(([key, value]) => {
      if (value && typeof value === 'object' && 'hex' in value) {
        cssVars.push(`--color-${key}: ${value.hex};`);
      }
    });
  }
  
  // Espaçamentos
  if (theme.tokens.spacing && typeof theme.tokens.spacing === 'object') {
    Object.entries(theme.tokens.spacing).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        cssVars.push(`--spacing-${key}: ${value};`);
      }
    });
  }
  
  // Tipografia
  if (theme.tokens.typography && typeof theme.tokens.typography === 'object') {
    Object.entries(theme.tokens.typography).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        cssVars.push(`--font-${key}: ${value};`);
      }
    });
  }
  
  // Bordas
  if (theme.tokens.borders && typeof theme.tokens.borders === 'object') {
    Object.entries(theme.tokens.borders).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        cssVars.push(`--border-${key}: ${value};`);
      }
    });
  }
  
  // Sombras
  if (theme.tokens.shadows && typeof theme.tokens.shadows === 'object') {
    Object.entries(theme.tokens.shadows).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        cssVars.push(`--shadow-${key}: ${value};`);
      }
    });
  }
  
  // Transições
  if (theme.tokens.transitions && typeof theme.tokens.transitions === 'object') {
    Object.entries(theme.tokens.transitions).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        cssVars.push(`--transition-${key}: ${value};`);
      }
    });
  }
  
  // Tokens semânticos
  if (theme.semantic && typeof theme.semantic === 'object') {
    Object.entries(theme.semantic).forEach(([category, values]) => {
      if (typeof values === 'object' && values !== null) {
        Object.entries(values).forEach(([variant, value]) => {
          if (value !== undefined && value !== null) {
            cssVars.push(`--${category}-${variant}: ${value};`);
          }
        });
      }
    });
  }
  
  return `:root {\n  ${cssVars.join('\n  ')}\n}`;
}

// Executar debug
debugThemeFrontend().then(() => {
  console.log('\n🏁 Debug concluído');
  process.exit(0);
}).catch((error) => {
  console.error('❌ Erro fatal:', error);
  process.exit(1);
});

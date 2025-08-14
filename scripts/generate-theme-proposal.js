const fs = require('fs');
const { hexToHsl, hslToHex } = require('./theme-audit');

// Função para agrupar cores similares
function groupSimilarColors(colors, threshold = 0.1) {
  const groups = [];
  const used = new Set();
  
  colors.forEach(color => {
    if (used.has(color)) return;
    
    const group = [color];
    used.add(color);
    
    colors.forEach(otherColor => {
      if (used.has(otherColor)) return;
      
      // Calcular similaridade baseada em HSL
      const hsl1 = hexToHsl(color);
      const hsl2 = hexToHsl(otherColor);
      
      const hDiff = Math.abs(hsl1.h - hsl2.h);
      const sDiff = Math.abs(hsl1.s - hsl2.s);
      const lDiff = Math.abs(hsl1.l - hsl2.l);
      
      // Normalizar diferenças
      const normalizedDiff = (hDiff / 360 + sDiff / 100 + lDiff / 100) / 3;
      
      if (normalizedDiff < threshold) {
        group.push(otherColor);
        used.add(otherColor);
      }
    });
    
    if (group.length > 0) {
      groups.push(group);
    }
  });
  
  return groups;
}

// Função para encontrar a cor representativa de um grupo
function findRepresentativeColor(colorGroup) {
  // Ordenar por luminosidade e pegar a do meio
  const sorted = colorGroup.sort((a, b) => {
    const hslA = hexToHsl(a);
    const hslB = hexToHsl(b);
    return hslA.l - hslB.l;
  });
  
  return sorted[Math.floor(sorted.length / 2)];
}

// Função para gerar tokens de cores
function generateColorTokens(colors) {
  const colorGroups = groupSimilarColors(colors);
  const tokens = {};
  
  colorGroups.forEach((group, index) => {
    const representative = findRepresentativeColor(group);
    const hsl = hexToHsl(representative);
    
    // Determinar o tipo de cor baseado no HSL
    let colorType = 'neutral';
    let colorName = `color-${index + 1}`;
    
    if (hsl.s > 20) {
      if (hsl.h >= 0 && hsl.h < 30) colorType = 'red';
      else if (hsl.h >= 30 && hsl.h < 60) colorType = 'orange';
      else if (hsl.h >= 60 && hsl.h < 90) colorType = 'yellow';
      else if (hsl.h >= 90 && hsl.h < 150) colorType = 'green';
      else if (hsl.h >= 150 && hsl.h < 210) colorType = 'teal';
      else if (hsl.h >= 210 && hsl.h < 270) colorType = 'blue';
      else if (hsl.h >= 270 && hsl.h < 330) colorType = 'purple';
      else colorType = 'pink';
      
      colorName = `${colorType}-${Math.round(hsl.l / 10) * 10}`;
    } else {
      // Cores neutras
      if (hsl.l < 20) colorName = 'black';
      else if (hsl.l > 80) colorName = 'white';
      else colorName = `gray-${Math.round(hsl.l / 10) * 10}`;
    }
    
    tokens[colorName] = {
      hex: representative,
      hsl: hsl,
      variants: group
    };
  });
  
  return tokens;
}

// Função para gerar tokens de espaçamento
function generateSpacingTokens() {
  const tokens = {};
  const baseSpacing = 4; // 4px base
  
  for (let i = 0; i <= 20; i++) {
    const value = i * baseSpacing;
    tokens[`spacing-${i}`] = `${value}px`;
  }
  
  // Espaçamentos especiais
  tokens['spacing-xs'] = '2px';
  tokens['spacing-sm'] = '8px';
  tokens['spacing-md'] = '16px';
  tokens['spacing-lg'] = '24px';
  tokens['spacing-xl'] = '32px';
  tokens['spacing-2xl'] = '48px';
  tokens['spacing-3xl'] = '64px';
  
  return tokens;
}

// Função para gerar tokens de tipografia
function generateTypographyTokens() {
  return {
    'font-family-sans': 'Inter, system-ui, -apple-system, sans-serif',
    'font-family-mono': 'JetBrains Mono, Consolas, monospace',
    'font-size-xs': '12px',
    'font-size-sm': '14px',
    'font-size-base': '16px',
    'font-size-lg': '18px',
    'font-size-xl': '20px',
    'font-size-2xl': '24px',
    'font-size-3xl': '30px',
    'font-size-4xl': '36px',
    'font-size-5xl': '48px',
    'font-weight-light': '300',
    'font-weight-normal': '400',
    'font-weight-medium': '500',
    'font-weight-semibold': '600',
    'font-weight-bold': '700',
    'line-height-tight': '1.25',
    'line-height-normal': '1.5',
    'line-height-relaxed': '1.75'
  };
}

// Função para gerar tokens de bordas
function generateBorderTokens() {
  return {
    'border-radius-none': '0',
    'border-radius-sm': '2px',
    'border-radius-base': '4px',
    'border-radius-md': '6px',
    'border-radius-lg': '8px',
    'border-radius-xl': '12px',
    'border-radius-2xl': '16px',
    'border-radius-full': '9999px',
    'border-width-none': '0',
    'border-width-sm': '1px',
    'border-width-base': '2px',
    'border-width-lg': '4px'
  };
}

// Função para gerar tokens de sombras
function generateShadowTokens() {
  return {
    'shadow-sm': '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    'shadow-base': '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
    'shadow-md': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    'shadow-lg': '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    'shadow-xl': '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
    'shadow-2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
  };
}

// Função para gerar tokens de transições
function generateTransitionTokens() {
  return {
    'transition-fast': '150ms ease-in-out',
    'transition-base': '250ms ease-in-out',
    'transition-slow': '350ms ease-in-out',
    'ease-in-out': 'cubic-bezier(0.4, 0, 0.2, 1)',
    'ease-in': 'cubic-bezier(0.4, 0, 1, 1)',
    'ease-out': 'cubic-bezier(0, 0, 0.2, 1)'
  };
}

// Função para gerar proposta completa
function generateThemeProposal() {
  console.log('🎨 Gerando proposta de tema...');
  
  // Carregar auditoria
  const audit = JSON.parse(fs.readFileSync('theme-audit.json', 'utf8'));
  
  // Extrair cores únicas
  const allColors = [
    ...audit.colors.hex,
    ...audit.colors.rgba.map(rgba => {
      // Converter rgba para hex aproximado
      const match = rgba.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
      if (match) {
        const r = parseInt(match[1]);
        const g = parseInt(match[2]);
        const b = parseInt(match[3]);
        return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
      }
      return null;
    }).filter(Boolean)
  ];
  
  // Gerar tokens
  const proposal = {
    metadata: {
      generatedAt: new Date().toISOString(),
      source: 'theme-audit.json',
      version: '1.0.0'
    },
    tokens: {
      colors: generateColorTokens(allColors),
      spacing: generateSpacingTokens(),
      typography: generateTypographyTokens(),
      borders: generateBorderTokens(),
      shadows: generateShadowTokens(),
      transitions: generateTransitionTokens()
    },
    semantic: {
      // Tokens semânticos baseados nas cores detectadas
      primary: {
        light: '#3b82f6', // blue-500
        base: '#2563eb',  // blue-600
        dark: '#1d4ed8'   // blue-700
      },
      secondary: {
        light: '#6b7280', // gray-500
        base: '#4b5563',  // gray-600
        dark: '#374151'   // gray-700
      },
      success: {
        light: '#22c55e', // green-500
        base: '#16a34a',  // green-600
        dark: '#15803d'   // green-700
      },
      warning: {
        light: '#f59e0b', // amber-500
        base: '#d97706',  // amber-600
        dark: '#b45309'   // amber-700
      },
      error: {
        light: '#ef4444', // red-500
        base: '#dc2626',  // red-600
        dark: '#b91c1c'   // red-700
      },
      background: {
        primary: '#ffffff',
        secondary: '#f9fafb',
        tertiary: '#f3f4f6'
      },
      surface: {
        primary: '#ffffff',
        secondary: '#f9fafb',
        tertiary: '#f3f4f6'
      },
      text: {
        primary: '#111827',
        secondary: '#4b5563',
        tertiary: '#9ca3af',
        inverse: '#ffffff'
      }
    },
    recommendations: {
      // Recomendações baseadas na auditoria
      colorUsage: {
        mostUsed: Object.keys(audit.tailwindMap).slice(0, 10),
        suggestedPalette: ['primary', 'secondary', 'success', 'warning', 'error'],
        accessibility: 'Considerar contraste WCAG 2.1 AA para todas as combinações de cores'
      },
      refactoring: {
        priority: 'Alto - Muitas cores hardcoded detectadas',
        approach: 'Migrar gradualmente para tokens CSS custom properties',
        estimatedEffort: '2-3 dias de desenvolvimento'
      }
    }
  };
  
  // Salvar proposta
  fs.writeFileSync('theme-proposal.json', JSON.stringify(proposal, null, 2));
  console.log('✅ Proposta de tema gerada! Salva em theme-proposal.json');
  
  return proposal;
}

// Executar geração
if (require.main === module) {
  generateThemeProposal();
}

module.exports = { generateThemeProposal };

const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Mapeamento de cores hardcoded para tokens CSS
const COLOR_MAPPING = {
  // Cores hex
  '#1b1b1b': 'var(--color-gray-900)',
  '#f2f2f2': 'var(--color-gray-100)',
  '#c1121f': 'var(--color-error-500)',
  '#28a745': 'var(--color-success-500)',
  '#dc3545': 'var(--color-error-500)',
  '#242424': 'var(--color-gray-800)',
  '#333333': 'var(--color-gray-700)',
  '#8b0000': 'var(--color-error-700)',
  '#6b0000': 'var(--color-error-800)',
  '#444444': 'var(--color-gray-600)',
  '#0066cc': 'var(--color-primary-600)',
  '#0052a3': 'var(--color-primary-700)',
  '#6b7280': 'var(--color-gray-500)',
  '#ffab00': 'var(--color-warning-500)',
  '#00c853': 'var(--color-success-500)',
  '#00a844': 'var(--color-success-600)',
  '#f44336': 'var(--color-error-500)',
  '#2196f3': 'var(--color-primary-500)',
  '#9c27b0': 'var(--color-purple-500)',
  '#e91e63': 'var(--color-pink-500)',
  '#4caf50': 'var(--color-success-500)',
  '#2a2a2a': 'var(--color-gray-800)',
  '#4CAF50': 'var(--color-success-500)',
  '#2196F3': 'var(--color-primary-500)',
  '#FF9800': 'var(--color-warning-500)',
  '#9C27B0': 'var(--color-purple-500)',
  '#ff9800': 'var(--color-warning-500)',
  '#9e9e9e': 'var(--color-gray-400)',
  '#00a843': 'var(--color-success-600)',
  '#607D8B': 'var(--color-gray-500)',
  '#9E9E9E': 'var(--color-gray-400)',
  '#666666': 'var(--color-gray-500)',
  '#a00000': 'var(--color-error-700)',
  '#f1f1f1': 'var(--color-gray-100)',
  '#c1c1c1': 'var(--color-gray-300)',
  '#a8a8a8': 'var(--color-gray-400)',
  '#3b82f6': 'var(--color-primary-500)',
  '#cccccc': 'var(--color-gray-300)',
  '#333': 'var(--color-gray-700)',
  '#ff4444': 'var(--color-error-500)',
  '#888': 'var(--color-gray-400)',
  '#ff6666': 'var(--color-error-400)',
  '#8BC34A': 'var(--color-success-400)',
  '#b00000': 'var(--color-error-700)',
  '#2d2d2d': 'var(--color-gray-800)',
  '#3d3d3d': 'var(--color-gray-700)',
  '#4d4d4d': 'var(--color-gray-600)',
  
  // Cores rgba
  'rgba(139,0,0,0.2)': 'var(--color-error-500-20)',
  'rgba(139, 0, 0, 0.3)': 'var(--color-error-500-30)',
  'rgba(255, 68, 68, 0.3)': 'var(--color-error-500-30)',
  'rgba(255, 68, 68, 0.1)': 'var(--color-error-500-10)',
  'rgba(0, 0, 0, 0.3)': 'var(--color-black-30)',
  'rgba(242, 242, 242, 0.2)': 'var(--color-gray-100-20)',
  'rgba(242, 242, 242, 0.4)': 'var(--color-gray-100-40)'
};

// Mapeamento de classes Tailwind para tokens CSS
const TAILWIND_MAPPING = {
  // Background colors
  'bg-gray-500': 'bg-[var(--color-gray-500)]',
  'bg-green-500': 'bg-[var(--color-success-500)]',
  'bg-red-500': 'bg-[var(--color-error-500)]',
  'bg-green-900': 'bg-[var(--color-success-700)]',
  'bg-red-900': 'bg-[var(--color-error-700)]',
  'bg-yellow-900': 'bg-[var(--color-warning-700)]',
  'bg-blue-900': 'bg-[var(--color-primary-700)]',
  'bg-gray-900': 'bg-[var(--color-gray-800)]',
  'bg-orange-600': 'bg-[var(--color-warning-600)]',
  'bg-orange-700': 'bg-[var(--color-warning-700)]',
  'bg-green-600': 'bg-[var(--color-success-600)]',
  'bg-green-700': 'bg-[var(--color-success-700)]',
  'bg-red-600': 'bg-[var(--color-error-600)]',
  'bg-red-700': 'bg-[var(--color-error-700)]',
  'bg-blue-500': 'bg-[var(--color-primary-500)]',
  'bg-yellow-500': 'bg-[var(--color-warning-500)]',
  'bg-purple-500': 'bg-[var(--color-purple-500)]',
  'bg-orange-500': 'bg-[var(--color-warning-500)]',
  'bg-white': 'bg-[var(--color-white)]',
  'bg-blue-600': 'bg-[var(--color-primary-600)]',
  'bg-blue-700': 'bg-[var(--color-primary-700)]',
  'bg-gray-600': 'bg-[var(--color-gray-600)]',
  'bg-gray-700': 'bg-[var(--color-gray-700)]',
  'bg-gray-50': 'bg-[var(--color-gray-50)]',
  'bg-black': 'bg-[var(--color-black)]',
  
  // Text colors
  'text-white': 'text-[var(--color-white)]',
  'text-gray-300': 'text-[var(--color-gray-300)]',
  'text-gray-400': 'text-[var(--color-gray-400)]',
  'text-gray-500': 'text-[var(--color-gray-500)]',
  'text-green-400': 'text-[var(--color-success-400)]',
  'text-red-400': 'text-[var(--color-error-400)]',
  'text-yellow-400': 'text-[var(--color-warning-400)]',
  'text-blue-400': 'text-[var(--color-primary-400)]',
  'text-orange-400': 'text-[var(--color-warning-400)]',
  'text-purple-400': 'text-[var(--color-purple-400)]',
  'text-green-500': 'text-[var(--color-success-500)]',
  'text-red-500': 'text-[var(--color-error-500)]',
  'text-blue-600': 'text-[var(--color-primary-600)]',
  'text-gray-600': 'text-[var(--color-gray-600)]',
  'text-gray-700': 'text-[var(--color-gray-700)]',
  
  // Border colors
  'border-green-500': 'border-[var(--color-success-500)]',
  'border-red-500': 'border-[var(--color-error-500)]',
  'border-white': 'border-[var(--color-white)]',
  'border-gray-300': 'border-[var(--color-gray-300)]',
  'border-gray-200': 'border-[var(--color-gray-200)]',
  'ring-blue-500': 'ring-[var(--color-primary-500)]',
  'ring-gray-500': 'ring-[var(--color-gray-500)]',
  'ring-green-500': 'ring-[var(--color-success-500)]',
  'ring-red-500': 'ring-[var(--color-error-500)]'
};

// Função para aplicar substituições em um arquivo
function applyReplacements(content, filePath) {
  let modifiedContent = content;
  const replacements = [];
  
  // Substituir cores hex
  Object.entries(COLOR_MAPPING).forEach(([oldColor, newToken]) => {
    const regex = new RegExp(`"${oldColor}"|'${oldColor}'`, 'g');
    const matches = content.match(regex);
    if (matches) {
      modifiedContent = modifiedContent.replace(regex, `"${newToken}"`);
      replacements.push({
        type: 'hex_color',
        old: oldColor,
        new: newToken,
        count: matches.length
      });
    }
  });
  
  // Substituir classes Tailwind
  Object.entries(TAILWIND_MAPPING).forEach(([oldClass, newClass]) => {
    const regex = new RegExp(`\\b${oldClass}\\b`, 'g');
    const matches = content.match(regex);
    if (matches) {
      modifiedContent = modifiedContent.replace(regex, newClass);
      replacements.push({
        type: 'tailwind_class',
        old: oldClass,
        new: newClass,
        count: matches.length
      });
    }
  });
  
  return { modifiedContent, replacements };
}

// Função para executar o codemod
function runCodemod(dryRun = true) {
  console.log(`🔧 Executando codemod de tema... ${dryRun ? '(DRY RUN)' : '(APLICANDO)'}`);
  
  // Encontrar todos os arquivos TSX/JSX
  const tsxFiles = glob.sync('client/src/**/*.{tsx,jsx}');
  const cssFiles = glob.sync('client/src/**/*.{css,scss}');
  const allFiles = [...tsxFiles, ...cssFiles];
  
  console.log(`📁 Encontrados ${allFiles.length} arquivos para processar`);
  
  const report = {
    totalFiles: allFiles.length,
    modifiedFiles: 0,
    totalReplacements: 0,
    replacements: [],
    errors: []
  };
  
  allFiles.forEach(filePath => {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const { modifiedContent, replacements } = applyReplacements(content, filePath);
      
      if (replacements.length > 0) {
        report.modifiedFiles++;
        report.totalReplacements += replacements.reduce((sum, r) => sum + r.count, 0);
        report.replacements.push({
          file: filePath,
          replacements
        });
        
        if (!dryRun) {
          fs.writeFileSync(filePath, modifiedContent, 'utf8');
          console.log(`✅ Modificado: ${filePath} (${replacements.length} substituições)`);
        } else {
          console.log(`📝 Simulado: ${filePath} (${replacements.length} substituições)`);
        }
      }
    } catch (error) {
      console.error(`❌ Erro ao processar ${filePath}:`, error);
      report.errors.push({
        file: filePath,
        error: error.message
      });
    }
  });
  
  // Salvar relatório
  const reportPath = 'design/refactor-report.md';
  const reportContent = generateReport(report, dryRun);
  
  if (!dryRun) {
    // Criar diretório se não existir
    if (!fs.existsSync('design')) {
      fs.mkdirSync('design');
    }
    fs.writeFileSync(reportPath, reportContent, 'utf8');
  }
  
  console.log('\n📊 Resumo:');
  console.log(`- Arquivos processados: ${report.totalFiles}`);
  console.log(`- Arquivos modificados: ${report.modifiedFiles}`);
  console.log(`- Total de substituições: ${report.totalReplacements}`);
  console.log(`- Erros: ${report.errors.length}`);
  
  if (dryRun) {
    console.log('\n💡 Para aplicar as mudanças, execute: node scripts/theme-codemod.js --apply');
  } else {
    console.log(`\n📄 Relatório salvo em: ${reportPath}`);
  }
  
  return report;
}

// Função para gerar relatório
function generateReport(report, dryRun) {
  const timestamp = new Date().toISOString();
  const status = dryRun ? 'DRY RUN' : 'APLICADO';
  
  let content = `# Relatório de Refatoração de Tema\n\n`;
  content += `**Data:** ${timestamp}\n`;
  content += `**Status:** ${status}\n`;
  content += `**Total de arquivos:** ${report.totalFiles}\n`;
  content += `**Arquivos modificados:** ${report.modifiedFiles}\n`;
  content += `**Total de substituições:** ${report.totalReplacements}\n\n`;
  
  if (report.errors.length > 0) {
    content += `## Erros\n\n`;
    report.errors.forEach(error => {
      content += `- **${error.file}:** ${error.error}\n`;
    });
    content += '\n';
  }
  
  if (report.replacements.length > 0) {
    content += `## Substituições por Arquivo\n\n`;
    report.replacements.forEach(fileReport => {
      content += `### ${fileReport.file}\n\n`;
      
      const byType = {};
      fileReport.replacements.forEach(rep => {
        if (!byType[rep.type]) byType[rep.type] = [];
        byType[rep.type].push(rep);
      });
      
      Object.entries(byType).forEach(([type, reps]) => {
        content += `#### ${type === 'hex_color' ? 'Cores Hex' : 'Classes Tailwind'}\n\n`;
        reps.forEach(rep => {
          content += `- \`${rep.old}\` → \`${rep.new}\` (${rep.count}x)\n`;
        });
        content += '\n';
      });
    });
  }
  
  return content;
}

// Executar codemod
if (require.main === module) {
  const args = process.argv.slice(2);
  const dryRun = !args.includes('--apply');
  
  runCodemod(dryRun);
}

module.exports = { runCodemod, applyReplacements };

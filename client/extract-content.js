const fs = require('fs');
const path = require('path');

// Function to extract content between specific tags
function extractContent(html, startTag, endTag) {
    const startIndex = html.indexOf(startTag);
    if (startIndex === -1) return '';
    
    const endIndex = html.indexOf(endTag, startIndex);
    if (endIndex === -1) return '';
    
    return html.substring(startIndex + startTag.length, endIndex).trim();
}

// Function to extract scripts
function extractScripts(html) {
    const scriptRegex = /<script[^>]*>([\s\S]*?)<\/script>/g;
    let scripts = '';
    let match;
    
    while ((match = scriptRegex.exec(html)) !== null) {
        scripts += match[1] + '\n';
    }
    
    return scripts;
}

// Function to extract styles
function extractStyles(html) {
    const styleRegex = /<style[^>]*>([\s\S]*?)<\/style>/g;
    let styles = '';
    let match;
    
    while ((match = styleRegex.exec(html)) !== null) {
        styles += match[1] + '\n';
    }
    
    return styles;
}

// Function to extract main content (between header and footer)
function extractMainContent(html) {
    // Remove DOCTYPE, html, head, and body tags
    let content = html.replace(/<!DOCTYPE[^>]*>/i, '');
    content = content.replace(/<html[^>]*>/i, '');
    content = content.replace(/<\/html>/i, '');
    content = content.replace(/<head>[\s\S]*?<\/head>/i, '');
    content = content.replace(/<body[^>]*>/i, '');
    content = content.replace(/<\/body>/i, '');
    
    // Remove header and footer sections
    content = content.replace(/<header[\s\S]*?<\/header>/i, '');
    content = content.replace(/<footer[\s\S]*?<\/footer>/i, '');
    
    // Remove script and style tags
    content = content.replace(/<script[\s\S]*?<\/script>/gi, '');
    content = content.replace(/<style[\s\S]*?<\/style>/gi, '');
    
    return content.trim();
}

// List of pages to process
const pages = [
    'index',
    'questoes', 
    'ranking',
    'planos',
    'perfil',
    'admin'
];

pages.forEach(pageName => {
    const htmlPath = path.join(__dirname, 'public', `${pageName}.html`);
    
    if (fs.existsSync(htmlPath)) {
        const html = fs.readFileSync(htmlPath, 'utf8');
        
        // Extract main content
        const mainContent = extractMainContent(html);
        fs.writeFileSync(path.join(__dirname, 'public', `${pageName}-content.html`), mainContent);
        
        // Extract scripts
        const scripts = extractScripts(html);
        fs.writeFileSync(path.join(__dirname, 'public', `${pageName}-scripts.html`), `<script>${scripts}</script>`);
        
        console.log(`✅ Processed ${pageName}.html`);
    } else {
        console.log(`❌ File not found: ${pageName}.html`);
    }
});

console.log('\n🎉 Content extraction completed!');

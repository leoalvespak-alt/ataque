const fs = require('fs');
const path = require('path');

// Configurações de log
const LOG_DIR = path.join(__dirname, '../logs');
const LOG_LEVELS = {
  ERROR: 0,
  WARN: 1,
  INFO: 2,
  DEBUG: 3
};

// Criar diretório de logs se não existir
if (!fs.existsSync(LOG_DIR)) {
  fs.mkdirSync(LOG_DIR, { recursive: true });
}

// Função para formatar data
function formatDate(date) {
  return date.toISOString().replace('T', ' ').substr(0, 19);
}

// Função para escrever log
function writeLog(level, message, data = null) {
  const timestamp = formatDate(new Date());
  const logEntry = {
    timestamp,
    level,
    message,
    data
  };

  const logLine = JSON.stringify(logEntry) + '\n';
  const logFile = path.join(LOG_DIR, `${level.toLowerCase()}.log`);

  fs.appendFileSync(logFile, logLine);
}

// Função para log de auditoria
function auditLog(action, userId, resource, details = {}) {
  const auditEntry = {
    timestamp: formatDate(new Date()),
    action,
    userId,
    resource,
    details,
    ip: details.ip || 'unknown',
    userAgent: details.userAgent || 'unknown'
  };

  const auditFile = path.join(LOG_DIR, 'audit.log');
  const logLine = JSON.stringify(auditEntry) + '\n';

  fs.appendFileSync(auditFile, logLine);
}

// Função para log de performance
function performanceLog(operation, duration, details = {}) {
  const perfEntry = {
    timestamp: formatDate(new Date()),
    operation,
    duration,
    details
  };

  const perfFile = path.join(LOG_DIR, 'performance.log');
  const logLine = JSON.stringify(perfEntry) + '\n';

  fs.appendFileSync(perfFile, logLine);
}

// Middleware para logging de requisições
function requestLogger(req, res, next) {
  const start = Date.now();
  
  // Log da requisição
  writeLog('INFO', 'Request received', {
    method: req.method,
    url: req.url,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    userId: req.user?.id || 'anonymous'
  });

  // Interceptar resposta
  const originalSend = res.send;
  res.send = function(data) {
    const duration = Date.now() - start;
    
    // Log da resposta
    writeLog('INFO', 'Request completed', {
      method: req.method,
      url: req.url,
      statusCode: res.statusCode,
      duration,
      userId: req.user?.id || 'anonymous'
    });

    // Log de performance se demorou mais de 1 segundo
    if (duration > 1000) {
      performanceLog('request', duration, {
        method: req.method,
        url: req.url,
        statusCode: res.statusCode
      });
    }

    originalSend.call(this, data);
  };

  next();
}

// Função para limpar logs antigos (manter apenas 30 dias)
function cleanupOldLogs() {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const logFiles = ['error.log', 'warn.log', 'info.log', 'debug.log', 'audit.log', 'performance.log'];
  
  logFiles.forEach(filename => {
    const filePath = path.join(LOG_DIR, filename);
    if (fs.existsSync(filePath)) {
      const stats = fs.statSync(filePath);
      if (stats.mtime < thirtyDaysAgo) {
        fs.unlinkSync(filePath);
        writeLog('INFO', `Old log file deleted: ${filename}`);
      }
    }
  });
}

// Executar limpeza diariamente
setInterval(cleanupOldLogs, 24 * 60 * 60 * 1000);

module.exports = {
  writeLog,
  auditLog,
  performanceLog,
  requestLogger,
  cleanupOldLogs
};

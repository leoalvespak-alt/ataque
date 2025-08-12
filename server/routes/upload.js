const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { authenticateToken } = require('../middleware/auth');
const { User } = require('../models');
const { auditLog } = require('../utils/logger');

const router = express.Router();

// Configurar storage do Multer
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, '../uploads/profiles');
    
    // Criar diretório se não existir
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    // Gerar nome único para o arquivo
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, `profile-${req.user.id}-${uniqueSuffix}${ext}`);
  }
});

// Filtro para validar tipos de arquivo
const fileFilter = (req, file, cb) => {
  // Permitir apenas imagens
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Apenas arquivos de imagem são permitidos'), false);
  }
};

// Configurar upload
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB máximo
    files: 1 // Apenas 1 arquivo por vez
  }
});

// Rota para upload de foto de perfil
router.post('/profile-picture', authenticateToken, upload.single('profile_picture'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        error: 'Nenhum arquivo enviado',
        message: 'Por favor, selecione uma imagem para upload'
      });
    }

    const userId = req.user.id;
    const user = await User.findByPk(userId);
    
    if (!user) {
      return res.status(404).json({
        error: 'Usuário não encontrado',
        message: 'Usuário não encontrado'
      });
    }

    // Remover foto anterior se existir
    if (user.profile_picture_url) {
      const oldFilePath = path.join(__dirname, '..', user.profile_picture_url);
      if (fs.existsSync(oldFilePath)) {
        fs.unlinkSync(oldFilePath);
      }
    }

    // Construir URL da nova foto
    const relativePath = path.relative(path.join(__dirname, '..'), req.file.path);
    const profilePictureUrl = '/' + relativePath.replace(/\\/g, '/');

    // Atualizar usuário
    await user.update({
      profile_picture_url: profilePictureUrl
    });

    // Log de auditoria
    auditLog('UPLOAD_PROFILE_PICTURE', userId, 'User', {
      fileSize: req.file.size,
      fileType: req.file.mimetype,
      fileName: req.file.filename,
      ip: req.ip,
      userAgent: req.get('User-Agent')
    });

    res.json({
      message: 'Foto de perfil atualizada com sucesso!',
      profile_picture_url: profilePictureUrl
    });

  } catch (error) {
    console.error('Erro ao fazer upload da foto:', error);
    
    // Remover arquivo se foi criado mas houve erro
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    
    res.status(500).json({
      error: 'Erro interno do servidor',
      message: 'Erro ao fazer upload da foto de perfil'
    });
  }
});

// Rota para remover foto de perfil
router.delete('/profile-picture', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findByPk(userId);
    
    if (!user) {
      return res.status(404).json({
        error: 'Usuário não encontrado',
        message: 'Usuário não encontrado'
      });
    }

    // Remover arquivo se existir
    if (user.profile_picture_url) {
      const filePath = path.join(__dirname, '..', user.profile_picture_url);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    // Atualizar usuário
    await user.update({
      profile_picture_url: null
    });

    // Log de auditoria
    auditLog('REMOVE_PROFILE_PICTURE', userId, 'User', {
      ip: req.ip,
      userAgent: req.get('User-Agent')
    });

    res.json({
      message: 'Foto de perfil removida com sucesso!'
    });

  } catch (error) {
    console.error('Erro ao remover foto de perfil:', error);
    res.status(500).json({
      error: 'Erro interno do servidor',
      message: 'Erro ao remover foto de perfil'
    });
  }
});

// Middleware para tratamento de erros do Multer
router.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        error: 'Arquivo muito grande',
        message: 'O arquivo deve ter no máximo 5MB'
      });
    }
    if (error.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({
        error: 'Muitos arquivos',
        message: 'Apenas um arquivo por vez é permitido'
      });
    }
  }
  
  if (error.message === 'Apenas arquivos de imagem são permitidos') {
    return res.status(400).json({
      error: 'Tipo de arquivo inválido',
      message: error.message
    });
  }
  
  next(error);
});

module.exports = router;

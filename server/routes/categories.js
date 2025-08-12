const express = require('express');
const { Disciplina, Assunto, Banca, Orgao } = require('../models');

const router = express.Router();

// Cache simples em memória para categorias
const categoryCache = new Map();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutos

// Função para verificar se cache é válido
function isCacheValid(cacheKey) {
    const cached = categoryCache.get(cacheKey);
    if (!cached) return false;
    return Date.now() - cached.timestamp < CACHE_DURATION;
}

// Função para limpar cache expirado
function cleanExpiredCache() {
    const now = Date.now();
    for (const [key, value] of categoryCache.entries()) {
        if (now - value.timestamp > CACHE_DURATION) {
            categoryCache.delete(key);
        }
    }
}

// Limpar cache expirado a cada 10 minutos
setInterval(cleanExpiredCache, 10 * 60 * 1000);

// Buscar todas as disciplinas
router.get('/disciplinas', async (req, res) => {
    try {
        const cacheKey = 'disciplinas';
        
        // Verificar cache
        if (isCacheValid(cacheKey)) {
            const cached = categoryCache.get(cacheKey);
            return res.json({ disciplinas: cached.data });
        }

        const disciplinas = await Disciplina.findAll({
            where: { ativo: true },
            order: [['nome', 'ASC']],
            attributes: ['id', 'nome']
        });

        // Salvar no cache
        categoryCache.set(cacheKey, {
            data: disciplinas,
            timestamp: Date.now()
        });

        res.json({ disciplinas });

    } catch (error) {
        console.error('Erro ao buscar disciplinas:', error);
        res.status(500).json({
            error: 'Erro interno do servidor',
            message: 'Erro ao buscar disciplinas'
        });
    }
});

// Buscar assuntos por disciplina
router.get('/assuntos/:disciplina_id', async (req, res) => {
    try {
        const { disciplina_id } = req.params;
        const cacheKey = `assuntos_${disciplina_id}`;
        
        // Verificar cache
        if (isCacheValid(cacheKey)) {
            const cached = categoryCache.get(cacheKey);
            return res.json({ assuntos: cached.data });
        }

        const assuntos = await Assunto.findAll({
            where: { 
                disciplina_id,
                ativo: true 
            },
            order: [['nome', 'ASC']],
            attributes: ['id', 'nome']
        });

        // Salvar no cache
        categoryCache.set(cacheKey, {
            data: assuntos,
            timestamp: Date.now()
        });

        res.json({ assuntos });

    } catch (error) {
        console.error('Erro ao buscar assuntos:', error);
        res.status(500).json({
            error: 'Erro interno do servidor',
            message: 'Erro ao buscar assuntos'
        });
    }
});

// Buscar todas as bancas
router.get('/bancas', async (req, res) => {
    try {
        const cacheKey = 'bancas';
        
        // Verificar cache
        if (isCacheValid(cacheKey)) {
            const cached = categoryCache.get(cacheKey);
            return res.json({ bancas: cached.data });
        }

        const bancas = await Banca.findAll({
            where: { ativo: true },
            order: [['nome', 'ASC']],
            attributes: ['id', 'nome']
        });

        // Salvar no cache
        categoryCache.set(cacheKey, {
            data: bancas,
            timestamp: Date.now()
        });

        res.json({ bancas });

    } catch (error) {
        console.error('Erro ao buscar bancas:', error);
        res.status(500).json({
            error: 'Erro interno do servidor',
            message: 'Erro ao buscar bancas'
        });
    }
});

// Buscar todos os órgãos
router.get('/orgaos', async (req, res) => {
    try {
        const cacheKey = 'orgaos';
        
        // Verificar cache
        if (isCacheValid(cacheKey)) {
            const cached = categoryCache.get(cacheKey);
            return res.json({ orgaos: cached.data });
        }

        const orgaos = await Orgao.findAll({
            where: { ativo: true },
            order: [['nome', 'ASC']],
            attributes: ['id', 'nome']
        });

        // Salvar no cache
        categoryCache.set(cacheKey, {
            data: orgaos,
            timestamp: Date.now()
        });

        res.json({ orgaos });

    } catch (error) {
        console.error('Erro ao buscar órgãos:', error);
        res.status(500).json({
            error: 'Erro interno do servidor',
            message: 'Erro ao buscar órgãos'
        });
    }
});

// Buscar todas as categorias de uma vez
router.get('/todas', async (req, res) => {
    try {
        const cacheKey = 'todas_categorias';
        
        // Verificar cache
        if (isCacheValid(cacheKey)) {
            const cached = categoryCache.get(cacheKey);
            return res.json(cached.data);
        }

        const [disciplinas, bancas, orgaos] = await Promise.all([
            Disciplina.findAll({
                where: { ativo: true },
                order: [['nome', 'ASC']],
                attributes: ['id', 'nome']
            }),
            Banca.findAll({
                where: { ativo: true },
                order: [['nome', 'ASC']],
                attributes: ['id', 'nome']
            }),
            Orgao.findAll({
                where: { ativo: true },
                order: [['nome', 'ASC']],
                attributes: ['id', 'nome']
            })
        ]);

        const result = { disciplinas, bancas, orgaos };

        // Salvar no cache
        categoryCache.set(cacheKey, {
            data: result,
            timestamp: Date.now()
        });

        res.json(result);

    } catch (error) {
        console.error('Erro ao buscar categorias:', error);
        res.status(500).json({
            error: 'Erro interno do servidor',
            message: 'Erro ao buscar categorias'
        });
    }
});

// Rota para limpar cache (útil para admin)
router.post('/clear-cache', async (req, res) => {
    try {
        categoryCache.clear();
        res.json({ message: 'Cache limpo com sucesso' });
    } catch (error) {
        console.error('Erro ao limpar cache:', error);
        res.status(500).json({
            error: 'Erro interno do servidor',
            message: 'Erro ao limpar cache'
        });
    }
});

module.exports = router;

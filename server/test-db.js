require('dotenv').config();
const { sequelize } = require('./config/database');
const { Disciplina, Assunto, Banca, Orgao } = require('./models');

async function testDatabase() {
  try {
    console.log('🔍 Testando conexão com banco de dados...');
    
    // Testar conexão
    await sequelize.authenticate();
    console.log('✅ Conexão com banco de dados OK');
    
    // Testar busca de disciplinas
    console.log('🔍 Buscando disciplinas...');
    const disciplinas = await Disciplina.findAll({
      where: { ativo: true },
      limit: 5
    });
    console.log(`✅ Encontradas ${disciplinas.length} disciplinas:`, disciplinas.map(d => d.nome));
    
    // Testar busca de assuntos
    console.log('🔍 Buscando assuntos...');
    const assuntos = await Assunto.findAll({
      where: { ativo: true },
      limit: 5
    });
    console.log(`✅ Encontrados ${assuntos.length} assuntos:`, assuntos.map(a => a.nome));
    
    // Testar busca de bancas
    console.log('🔍 Buscando bancas...');
    const bancas = await Banca.findAll({
      where: { ativo: true },
      limit: 5
    });
    console.log(`✅ Encontradas ${bancas.length} bancas:`, bancas.map(b => b.nome));
    
    // Testar busca de órgãos
    console.log('🔍 Buscando órgãos...');
    const orgaos = await Orgao.findAll({
      where: { ativo: true },
      limit: 5
    });
    console.log(`✅ Encontrados ${orgaos.length} órgãos:`, orgaos.map(o => o.nome));
    
  } catch (error) {
    console.error('❌ Erro no teste do banco:', error);
  } finally {
    await sequelize.close();
  }
}

testDatabase();
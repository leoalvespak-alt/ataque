const User = require('./User');
const Disciplina = require('./Disciplina');
const Assunto = require('./Assunto');
const Banca = require('./Banca');
const Orgao = require('./Orgao');
const Questao = require('./Questao');
const RespostaUsuario = require('./RespostaUsuario');
const ComentarioAluno = require('./ComentarioAluno');
const AvaliacaoQuestao = require('./AvaliacaoQuestao');
const PlanoAssinatura = require('./PlanoAssinatura');
const AssinaturaUsuario = require('./AssinaturaUsuario');
const ConfiguracaoPlataforma = require('./ConfiguracaoPlataforma');
const Patente = require('./Patente');
const FavoritoQuestao = require('./FavoritoQuestao');

// Associações Disciplina - Assunto
Disciplina.hasMany(Assunto, { foreignKey: 'disciplina_id', as: 'assuntos' });
Assunto.belongsTo(Disciplina, { foreignKey: 'disciplina_id', as: 'disciplina' });

// Associações Questão
Questao.belongsTo(Disciplina, { foreignKey: 'disciplina_id', as: 'disciplina' });
Questao.belongsTo(Assunto, { foreignKey: 'assunto_id', as: 'assunto' });
Questao.belongsTo(Banca, { foreignKey: 'banca_id', as: 'banca' });
Questao.belongsTo(Orgao, { foreignKey: 'orgao_id', as: 'orgao' });

Disciplina.hasMany(Questao, { foreignKey: 'disciplina_id', as: 'questoes' });
Assunto.hasMany(Questao, { foreignKey: 'assunto_id', as: 'questoes' });
Banca.hasMany(Questao, { foreignKey: 'banca_id', as: 'questoes' });
Orgao.hasMany(Questao, { foreignKey: 'orgao_id', as: 'questoes' });

// Associações RespostaUsuario
RespostaUsuario.belongsTo(User, { foreignKey: 'usuario_id', as: 'usuario' });
RespostaUsuario.belongsTo(Questao, { foreignKey: 'questao_id', as: 'questao' });

User.hasMany(RespostaUsuario, { foreignKey: 'usuario_id', as: 'respostas' });
Questao.hasMany(RespostaUsuario, { foreignKey: 'questao_id', as: 'respostas' });

// Associações ComentarioAluno
ComentarioAluno.belongsTo(User, { foreignKey: 'usuario_id', as: 'usuario' });
ComentarioAluno.belongsTo(Questao, { foreignKey: 'questao_id', as: 'questao' });

User.hasMany(ComentarioAluno, { foreignKey: 'usuario_id', as: 'comentarios' });
Questao.hasMany(ComentarioAluno, { foreignKey: 'questao_id', as: 'comentarios' });

// Associações AvaliacaoQuestao
AvaliacaoQuestao.belongsTo(User, { foreignKey: 'usuario_id', as: 'usuario' });
AvaliacaoQuestao.belongsTo(Questao, { foreignKey: 'questao_id', as: 'questao' });

User.hasMany(AvaliacaoQuestao, { foreignKey: 'usuario_id', as: 'avaliacoes' });
Questao.hasMany(AvaliacaoQuestao, { foreignKey: 'questao_id', as: 'avaliacoes' });

// Associações AssinaturaUsuario
AssinaturaUsuario.belongsTo(User, { foreignKey: 'usuario_id', as: 'usuario' });
AssinaturaUsuario.belongsTo(PlanoAssinatura, { foreignKey: 'plano_id', as: 'plano' });

User.hasMany(AssinaturaUsuario, { foreignKey: 'usuario_id', as: 'assinaturas' });
PlanoAssinatura.hasMany(AssinaturaUsuario, { foreignKey: 'plano_id', as: 'assinaturas' });

// Associações Patente
User.belongsTo(Patente, { foreignKey: 'patente_id', as: 'patente' });
Patente.hasMany(User, { foreignKey: 'patente_id', as: 'usuarios' });

// Favoritos
FavoritoQuestao.belongsTo(User, { foreignKey: 'usuario_id', as: 'usuario' });
FavoritoQuestao.belongsTo(Questao, { foreignKey: 'questao_id', as: 'questao' });
User.belongsToMany(Questao, { through: FavoritoQuestao, foreignKey: 'usuario_id', otherKey: 'questao_id', as: 'favoritos' });
Questao.belongsToMany(User, { through: FavoritoQuestao, foreignKey: 'questao_id', otherKey: 'usuario_id', as: 'usuariosQueFavoritaram' });

module.exports = {
  User,
  Disciplina,
  Assunto,
  Banca,
  Orgao,
  Questao,
  RespostaUsuario,
  ComentarioAluno,
  AvaliacaoQuestao,
  PlanoAssinatura,
  AssinaturaUsuario,
  ConfiguracaoPlataforma,
  Patente
  , FavoritoQuestao
};

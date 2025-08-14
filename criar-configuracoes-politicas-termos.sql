-- Criar configurações iniciais para políticas de privacidade e termos de uso
INSERT INTO configuracoes_plataforma (chave, valor, descricao) VALUES 
('politicas_privacidade', 'nada', 'Políticas de Privacidade da Plataforma'),
('termos_uso', 'nada', 'Termos de Uso da Plataforma')
ON CONFLICT (chave) DO NOTHING;

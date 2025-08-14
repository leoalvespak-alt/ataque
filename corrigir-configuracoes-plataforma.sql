-- Script para corrigir a tabela configuracoes_plataforma
-- Execute este script no SQL Editor do Supabase

-- 1. Criar tabela configuracoes_plataforma se não existir
CREATE TABLE IF NOT EXISTS configuracoes_plataforma (
    id SERIAL PRIMARY KEY,
    chave VARCHAR(255) NOT NULL UNIQUE,
    valor TEXT NOT NULL,
    descricao TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- 2. Inserir configurações iniciais (apenas se não existirem)
INSERT INTO configuracoes_plataforma (chave, valor, descricao) VALUES 
('politicas_privacidade', 'Políticas de Privacidade da Plataforma Rota de Ataque Questões

1. COLETA DE INFORMAÇÕES
Coletamos informações que você nos fornece diretamente, como quando cria uma conta, responde questões ou entra em contato conosco.

2. USO DAS INFORMAÇÕES
Utilizamos suas informações para:
- Fornecer e melhorar nossos serviços
- Personalizar sua experiência
- Enviar notificações importantes
- Analisar o uso da plataforma

3. COMPARTILHAMENTO
Não vendemos, alugamos ou compartilhamos suas informações pessoais com terceiros, exceto quando:
- Você nos autoriza
- É necessário para fornecer nossos serviços
- Exigido por lei

4. SEGURANÇA
Implementamos medidas de segurança para proteger suas informações contra acesso não autorizado.

5. SEUS DIREITOS
Você tem o direito de:
- Acessar suas informações pessoais
- Corrigir informações incorretas
- Solicitar a exclusão de seus dados
- Revogar consentimentos

6. CONTATO
Para dúvidas sobre esta política, entre em contato: contato@rotadeataque.com', 'Políticas de Privacidade da Plataforma'),
('termos_uso', 'Termos de Uso da Plataforma Rota de Ataque Questões

1. ACEITAÇÃO DOS TERMOS
Ao usar nossa plataforma, você concorda com estes termos de uso.

2. USO DA PLATAFORMA
Você pode usar nossa plataforma para:
- Estudar questões de concursos
- Acompanhar seu progresso
- Interagir com outros usuários
- Acessar recursos educacionais

3. CONTA DO USUÁRIO
Você é responsável por:
- Manter suas credenciais seguras
- Informações precisas em seu perfil
- Atividade em sua conta

4. CONTEÚDO
Você pode:
- Comentar em questões
- Criar cadernos de estudo
- Compartilhar experiências

5. PROIBIÇÕES
É proibido:
- Usar a plataforma para fins ilegais
- Violar direitos de terceiros
- Interferir no funcionamento
- Criar múltiplas contas

6. PROPRIEDADE INTELECTUAL
O conteúdo da plataforma é protegido por direitos autorais.

7. LIMITAÇÃO DE RESPONSABILIDADE
Não nos responsabilizamos por danos indiretos ou consequenciais.

8. MODIFICAÇÕES
Podemos modificar estes termos a qualquer momento.

9. RESCISÃO
Podemos suspender ou encerrar sua conta por violação dos termos.

10. CONTATO
Dúvidas: contato@rotadeataque.com', 'Termos de Uso da Plataforma')
ON CONFLICT (chave) DO NOTHING;

-- 3. Verificar se os registros foram criados
SELECT chave, LEFT(valor, 100) as preview FROM configuracoes_plataforma ORDER BY chave;

# Guia de Configuração do Supabase - Plataforma de Questões

## 📋 **Resumo**

Este guia irá ajudá-lo a configurar o banco de dados PostgreSQL no Supabase para a plataforma de questões, incluindo todas as tabelas, enums, índices, políticas de segurança e dados iniciais.

---

## 🚀 **Passo 1: Acessar o Supabase**

1. **Acesse o projeto Supabase:**
   - URL: https://tczaawnqqkqfeohomnpl.supabase.co
   - Faça login com suas credenciais

2. **Navegue para o SQL Editor:**
   - No painel lateral esquerdo, clique em "SQL Editor"
   - Clique em "New query" para criar uma nova consulta

---

## 📝 **Passo 2: Executar o Esquema SQL**

1. **Copie o conteúdo do arquivo `supabase-schema.sql`**
2. **Cole no SQL Editor do Supabase**
3. **Execute a consulta**

O arquivo `supabase-schema.sql` contém:
- ✅ **4 Enums** (tipo_questao, nivel_escolaridade, tipo_usuario, tipo_plano)
- ✅ **13 Tabelas** (disciplinas, assuntos, bancas, anos, escolaridades, orgaos, questoes, alternativas, usuarios, respostas_alunos, comentarios_questoes, cadernos, cadernos_questoes)
- ✅ **Índices otimizados** para performance
- ✅ **Row Level Security (RLS)** habilitado
- ✅ **Políticas de segurança** configuradas
- ✅ **Triggers** para atualização automática de timestamps
- ✅ **Dados iniciais** (disciplinas, bancas, anos, etc.)

---

## 🔐 **Passo 3: Verificar as Políticas de Segurança**

### **Políticas Implementadas:**

#### **Tabelas de Referência (Leitura Pública)**
- `disciplinas` - Visível para todos
- `assuntos` - Visível para todos
- `bancas` - Visível para todos
- `anos` - Visível para todos
- `escolaridades` - Visível para todos
- `orgaos` - Visível para todos

#### **Questões e Alternativas (Leitura Pública)**
- `questoes` - Visível para todos
- `alternativas` - Visível para todos

#### **Dados de Usuários (Protegidos)**
- `usuarios` - Cada usuário vê apenas seus próprios dados
- `respostas_alunos` - Cada aluno vê apenas suas próprias respostas
- `comentarios_questoes` - Todos podem ver, apenas o autor pode modificar
- `cadernos` - Cada aluno vê apenas seus próprios cadernos
- `cadernos_questoes` - Cada aluno gerencia apenas suas associações

---

## 📊 **Passo 4: Estrutura do Banco de Dados**

### **Enums Criados:**
```sql
tipo_questao: MULTIPLA_ESCOLHA, CERTO_OU_ERRADO
nivel_escolaridade: FUNDAMENTAL, MEDIO, SUPERIOR
tipo_usuario: ALUNO, GESTOR
tipo_plano: GRATUITO, PREMIUM
```

### **Tabelas Principais:**

#### **1. disciplinas**
- `id` (SERIAL PRIMARY KEY)
- `nome` (VARCHAR(255) UNIQUE)
- `created_at`, `updated_at`

#### **2. assuntos**
- `id` (SERIAL PRIMARY KEY)
- `nome` (VARCHAR(255) UNIQUE)
- `disciplina_id` (FOREIGN KEY)
- `created_at`, `updated_at`

#### **3. bancas**
- `id` (SERIAL PRIMARY KEY)
- `nome` (VARCHAR(255) UNIQUE)
- `created_at`, `updated_at`

#### **4. anos**
- `id` (SERIAL PRIMARY KEY)
- `ano` (INTEGER UNIQUE)
- `created_at`, `updated_at`

#### **5. escolaridades**
- `id` (SERIAL PRIMARY KEY)
- `nivel` (nivel_escolaridade UNIQUE)
- `created_at`, `updated_at`

#### **6. orgaos**
- `id` (SERIAL PRIMARY KEY)
- `nome` (VARCHAR(255) UNIQUE)
- `created_at`, `updated_at`

#### **7. questoes**
- `id` (VARCHAR(6) PRIMARY KEY)
- `enunciado` (TEXT)
- `texto_questao` (TEXT)
- `gabarito` (TEXT)
- `comentario_gabarito_professor` (TEXT)
- `tipo_questao` (tipo_questao)
- `disciplina_id`, `assunto_id`, `banca_id`, `ano_id`, `escolaridade_id`, `orgao_id` (FOREIGN KEYS)
- `created_at`, `updated_at`

#### **8. alternativas**
- `id` (SERIAL PRIMARY KEY)
- `questao_id` (FOREIGN KEY)
- `letra` (VARCHAR(1))
- `texto` (TEXT)
- `created_at`, `updated_at`
- UNIQUE(questao_id, letra)

#### **9. usuarios**
- `id` (SERIAL PRIMARY KEY)
- `nome` (VARCHAR(255))
- `email` (VARCHAR(255) UNIQUE)
- `numero_celular` (VARCHAR(20))
- `senha` (VARCHAR(255))
- `tipo_usuario` (tipo_usuario)
- `tipo_plano` (tipo_plano DEFAULT 'GRATUITO')
- `created_at`, `updated_at`

#### **10. respostas_alunos**
- `id` (SERIAL PRIMARY KEY)
- `aluno_id` (FOREIGN KEY)
- `questao_id` (FOREIGN KEY)
- `resposta_selecionada` (TEXT)
- `correta` (BOOLEAN)
- `created_at`, `updated_at`

#### **11. comentarios_questoes**
- `id` (SERIAL PRIMARY KEY)
- `questao_id` (FOREIGN KEY)
- `aluno_id` (FOREIGN KEY)
- `texto_comentario` (TEXT)
- `created_at`, `updated_at`

#### **12. cadernos**
- `id` (SERIAL PRIMARY KEY)
- `aluno_id` (FOREIGN KEY)
- `nome` (VARCHAR(255))
- `created_at`, `updated_at`

#### **13. cadernos_questoes**
- `caderno_id` (FOREIGN KEY)
- `questao_id` (FOREIGN KEY)
- `created_at`, `updated_at`
- PRIMARY KEY (caderno_id, questao_id)

---

## 🔍 **Passo 5: Verificar a Configuração**

### **Teste 1: Verificar Tabelas**
```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;
```

### **Teste 2: Verificar Enums**
```sql
SELECT typname, enumlabel 
FROM pg_enum e 
JOIN pg_type t ON e.enumtypid = t.oid 
ORDER BY typname, enumsortorder;
```

### **Teste 3: Verificar Políticas RLS**
```sql
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE schemaname = 'public' 
ORDER BY tablename, policyname;
```

### **Teste 4: Verificar Dados Iniciais**
```sql
-- Verificar disciplinas
SELECT COUNT(*) as total_disciplinas FROM disciplinas;

-- Verificar bancas
SELECT COUNT(*) as total_bancas FROM bancas;

-- Verificar anos
SELECT COUNT(*) as total_anos FROM anos;

-- Verificar assuntos
SELECT d.nome as disciplina, COUNT(a.id) as total_assuntos
FROM disciplinas d
LEFT JOIN assuntos a ON d.id = a.disciplina_id
GROUP BY d.id, d.nome
ORDER BY d.nome;
```

---

## 🛠️ **Passo 6: Configurar Variáveis de Ambiente**

Após configurar o banco, você precisará das seguintes variáveis:

```env
# Supabase Configuration
SUPABASE_URL=https://tczaawnqqkqfeohomnpl.supabase.co
SUPABASE_ANON_KEY=sua_chave_anonima_aqui
SUPABASE_SERVICE_KEY=sua_chave_service_aqui
```

### **Como obter as chaves:**
1. No painel do Supabase, vá para "Settings" > "API"
2. Copie a "Project URL" e "anon public" key
3. Para a service key, use a "service_role" key (mantenha segura)

---

## 📈 **Passo 7: Funcionalidades Implementadas**

### **✅ Recursos de Segurança:**
- Row Level Security (RLS) habilitado em todas as tabelas
- Políticas granulares por tipo de usuário
- Proteção de dados pessoais
- Controle de acesso baseado em autenticação

### **✅ Performance:**
- Índices otimizados para consultas frequentes
- Chaves estrangeiras com CASCADE DELETE
- Triggers para atualização automática de timestamps

### **✅ Dados Iniciais:**
- 15 disciplinas (incluindo Direito)
- 10 bancas examinadoras principais
- 10 anos (2015-2024)
- 3 níveis de escolaridade
- 12 órgãos principais
- 30+ assuntos organizados por disciplina

### **✅ Funcionalidades:**
- Sistema de questões com múltipla escolha e certo/errado
- Sistema de respostas e correção automática
- Sistema de comentários em questões
- Sistema de cadernos personalizados
- Sistema de usuários com planos (gratuito/premium)
- Categorização completa (disciplina, assunto, banca, ano, escolaridade, órgão)

---

## 🚨 **Troubleshooting**

### **Erro: "Invalid API key"**
- Verifique se está usando a chave correta
- Use a "anon public" key para operações do cliente
- Use a "service_role" key apenas para operações administrativas

### **Erro: "Table does not exist"**
- Execute o script SQL completo
- Verifique se não há erros de sintaxe
- Confirme que todas as tabelas foram criadas

### **Erro: "Policy violation"**
- Verifique se o usuário está autenticado
- Confirme que as políticas RLS estão corretas
- Teste com um usuário autenticado

### **Erro: "Foreign key constraint"**
- Verifique se os dados de referência existem
- Execute os INSERTs na ordem correta
- Use ON CONFLICT DO NOTHING para evitar duplicatas

---

## 📞 **Suporte**

Se encontrar problemas:
1. Verifique os logs do Supabase
2. Teste as consultas individualmente
3. Verifique a documentação oficial do Supabase
4. Consulte o arquivo `supabase-schema.sql` para referência

---

## 🎉 **Conclusão**

Após seguir este guia, você terá:
- ✅ Banco de dados PostgreSQL configurado
- ✅ Estrutura completa para a plataforma de questões
- ✅ Segurança implementada com RLS
- ✅ Dados iniciais carregados
- ✅ Performance otimizada

O banco está pronto para ser usado pela aplicação! 🚀

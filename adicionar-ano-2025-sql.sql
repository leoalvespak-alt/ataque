-- Adicionar ano 2025
INSERT INTO anos (ano) VALUES (2025) ON CONFLICT (ano) DO NOTHING;

const express = require("express");
const cors = require("cors");
const app = express();
const PORT = 3002;

app.use(cors());
app.use(express.json());

const mockUsers = [
  { id: 1, nome: "Admin", email: "admin@rotaataque.com", tipo_usuario: "gestor", status: "premium", xp: 1000 },
  { id: 2, nome: "João Silva", email: "joao@teste.com", tipo_usuario: "aluno", status: "gratuito", xp: 150 }
];

const mockQuestoes = [
  {
    id: 1,
    enunciado: "Qual é a capital do Brasil?",
    alternativa_a: "São Paulo",
    alternativa_b: "Rio de Janeiro", 
    alternativa_c: "Brasília",
    alternativa_d: "Salvador",
    alternativa_e: "Belo Horizonte",
    gabarito: "C",
    disciplina: "Geografia",
    banca: "CESPE",
    ano: 2023,
    comentario_professor: "Brasília foi fundada em 1960."
  }
];

app.post("/api/auth/login", (req, res) => {
  const { email, senha } = req.body;
  const user = mockUsers.find(u => u.email === email);
  if (user && senha === "123456") {
    res.json({ success: true, token: "mock-token", user });
  } else {
    res.status(401).json({ success: false, message: "Credenciais inválidas" });
  }
});

app.get("/api/questoes", (req, res) => {
  res.json({ success: true, questoes: mockQuestoes });
});

app.get("/api/ranking", (req, res) => {
  res.json({ success: true, ranking: mockUsers.filter(u => u.tipo_usuario === "aluno") });
});

app.get("/api/planos", (req, res) => {
  res.json({ success: true, planos: [
    { id: 1, nome: "Plano Mensal", preco: 29.90 },
    { id: 2, nome: "Plano Anual", preco: 299.90 }
  ]});
});

app.get("/api/health", (req, res) => {
  res.json({ success: true, message: "Servidor funcionando!" });
});

app.listen(PORT, () => {
  console.log("🚀 Servidor mock rodando na porta 3002");
});

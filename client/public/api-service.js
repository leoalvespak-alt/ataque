// API Service para integração com dados reais
class ApiService {
    constructor() {
        this.baseURL = 'http://localhost:3002/api';
        this.token = localStorage.getItem('token');
    }

    // Método para atualizar token
    updateToken() {
        this.token = localStorage.getItem('token');
    }

    // Método genérico para fazer requisições
    async request(endpoint, options = {}) {
        this.updateToken();
        
        const config = {
            headers: {
                'Content-Type': 'application/json',
                ...(this.token && { 'Authorization': `Bearer ${this.token}` }),
                ...options.headers
            },
            ...options
        };

        try {
            const response = await fetch(`${this.baseURL}${endpoint}`, config);
            
            if (response.status === 401) {
                // Token expirado ou inválido
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                window.location.href = '/login';
                return null;
            }

            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.message || 'Erro na requisição');
            }

            return data;
        } catch (error) {
            console.error('Erro na API:', error);
            throw error;
        }
    }

    // Autenticação
    async login(email, password) {
        return this.request('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, password })
        });
    }

    async register(userData) {
        return this.request('/auth/register', {
            method: 'POST',
            body: JSON.stringify(userData)
        });
    }

    async verifyToken() {
        return this.request('/auth/verify');
    }

    async logout() {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
    }

    // Dashboard e estatísticas
    async getDashboardData() {
        try {
            const data = await this.request('/stats/dashboard');
            return data;
        } catch (error) {
            console.error('Erro ao carregar dados do dashboard:', error);
            // Retornar dados mock em caso de erro
            return this.getMockDashboardData();
        }
    }

    // Questões
    async getQuestions(filters = {}) {
        try {
            const queryParams = new URLSearchParams(filters).toString();
            const data = await this.request(`/questions?${queryParams}`);
            return data;
        } catch (error) {
            console.error('Erro ao carregar questões:', error);
            return this.getMockQuestions();
        }
    }

    async answerQuestion(questionId, answer) {
        try {
            const data = await this.request(`/questions/${questionId}/responder`, {
                method: 'POST',
                body: JSON.stringify({ alternativa_marcada: answer })
            });
            return data;
        } catch (error) {
            console.error('Erro ao responder questão:', error);
            throw error;
        }
    }

    async bookmarkQuestion(questionId) {
        try {
            const data = await this.request(`/questions/${questionId}/bookmark`, {
                method: 'POST',
                body: JSON.stringify({})
            });
            return data;
        } catch (error) {
            console.error('Erro ao favoritar questão:', error);
            throw error;
        }
    }

    // Ranking
    async getRanking(filters = {}) {
        try {
            const queryParams = new URLSearchParams(filters).toString();
            const data = await this.request(`/ranking?${queryParams}`);
            return data;
        } catch (error) {
            console.error('Erro ao carregar ranking:', error);
            return this.getMockRanking();
        }
    }

    // Planos
    async getPlans() {
        try {
            const data = await this.request('/planos');
            return data;
        } catch (error) {
            console.error('Erro ao carregar planos:', error);
            return this.getMockPlans();
        }
    }

    async subscribeToPlan(planId) {
        try {
            const data = await this.request('/planos/subscribe', {
                method: 'POST',
                body: JSON.stringify({ planId })
            });
            return data;
        } catch (error) {
            console.error('Erro ao assinar plano:', error);
            throw error;
        }
    }

    // Perfil
    async getUserProfile() {
        try {
            const data = await this.request('/users/profile');
            return data;
        } catch (error) {
            console.error('Erro ao carregar perfil:', error);
            return this.getMockUserProfile();
        }
    }

    async updateProfile(profileData) {
        try {
            const data = await this.request('/users/profile', {
                method: 'PUT',
                body: JSON.stringify(profileData)
            });
            return data;
        } catch (error) {
            console.error('Erro ao atualizar perfil:', error);
            throw error;
        }
    }

    // Dados Mock para fallback
    getMockDashboardData() {
        return {
            user: {
                nome: 'João Silva',
                email: 'joao@teste.com',
                xp: 1250,
                ranking: 12,
                accuracy: 85,
                questionsAnswered: 156,
                streak: 7
            },
            notifications: [
                {
                    id: 1,
                    title: 'Parabéns! Você completou 50 questões',
                    message: 'Continue assim! Seu progresso está incrível.',
                    category: 'Motivacional',
                    color: '#00c853',
                    date: 'Hoje'
                },
                {
                    id: 2,
                    title: 'Novo BIZU disponível',
                    message: 'Confira as dicas de Direito Constitucional',
                    category: 'BIZU',
                    color: '#ffab00',
                    date: 'Ontem'
                },
                {
                    id: 3,
                    title: 'Você subiu no ranking!',
                    message: 'Agora você está na posição #12',
                    category: 'Ranking',
                    color: '#8b0000',
                    date: '2 dias atrás'
                }
            ],
            recentActivities: [
                {
                    id: 1,
                    type: 'question',
                    message: 'Resolveu 5 questões de Direito Constitucional',
                    date: 'Há 2 horas'
                },
                {
                    id: 2,
                    type: 'xp',
                    message: 'Ganhou 50 XP por acertar 4 questões seguidas',
                    date: 'Há 4 horas'
                },
                {
                    id: 3,
                    type: 'ranking',
                    message: 'Subiu 3 posições no ranking geral',
                    date: 'Ontem'
                }
            ]
        };
    }

    getMockQuestions() {
        return {
            questions: [
                {
                    id: 1,
                    enunciado: "Em relação aos direitos e garantias fundamentais, assinale a alternativa correta:",
                    disciplina: "Direito Constitucional",
                    assunto: "Direitos Fundamentais",
                    banca: "CESPE/CEBRASPE",
                    ano: "2023",
                    alternativa_a: "Os direitos fundamentais são absolutos e não podem ser limitados.",
                    alternativa_b: "A dignidade da pessoa humana é fundamento da República Federativa do Brasil.",
                    alternativa_c: "Os tratados internacionais de direitos humanos têm hierarquia constitucional.",
                    alternativa_d: "O direito à vida é o único direito fundamental que não admite restrições.",
                    alternativa_e: "Os direitos sociais são de aplicação imediata e não dependem de regulamentação."
                },
                {
                    id: 2,
                    enunciado: "Sobre o princípio da legalidade na Administração Pública, é correto afirmar que:",
                    disciplina: "Direito Administrativo",
                    assunto: "Princípios da Administração",
                    banca: "FGV",
                    ano: "2022",
                    alternativa_a: "A Administração pode agir livremente, desde que não viole direitos individuais.",
                    alternativa_b: "A Administração só pode fazer o que a lei expressamente autorizar.",
                    alternativa_c: "A Administração pode agir discricionariamente em todas as situações.",
                    alternativa_d: "A Administração está vinculada apenas aos princípios constitucionais.",
                    alternativa_e: "A Administração pode criar direitos e obrigações sem base legal."
                },
                {
                    id: 3,
                    enunciado: "No que se refere ao processo civil, o princípio da publicidade:",
                    disciplina: "Direito Processual Civil",
                    assunto: "Princípios Processuais",
                    banca: "VUNESP",
                    ano: "2021",
                    alternativa_a: "Permite que qualquer pessoa tenha acesso aos autos do processo.",
                    alternativa_b: "Garante que as partes tenham conhecimento de todos os atos processuais.",
                    alternativa_c: "Obriga a publicação de todos os atos processuais no Diário Oficial.",
                    alternativa_d: "Permite que o juiz decida sem fundamentar suas decisões.",
                    alternativa_e: "Dispensa a citação das partes para início do processo."
                }
            ],
            total: 3,
            page: 1,
            limit: 10
        };
    }

    getMockRanking() {
        return {
            myPosition: {
                position: 12,
                xp: 1250,
                accuracy: 85,
                questionsAnswered: 156,
                streak: 7
            },
            ranking: [
                { position: 1, name: "João Silva", xp: 2500, accuracy: 92, questions: 300, streak: 15, avatar: "JS" },
                { position: 2, name: "Maria Santos", xp: 2300, accuracy: 89, questions: 280, streak: 12, avatar: "MS" },
                { position: 3, name: "Pedro Costa", xp: 2100, accuracy: 87, questions: 250, streak: 10, avatar: "PC" },
                { position: 4, name: "Ana Oliveira", xp: 2000, accuracy: 85, questions: 240, streak: 8, avatar: "AO" },
                { position: 5, name: "Carlos Lima", xp: 1900, accuracy: 83, questions: 220, streak: 9, avatar: "CL" },
                { position: 6, name: "Lucia Ferreira", xp: 1800, accuracy: 81, questions: 200, streak: 7, avatar: "LF" },
                { position: 7, name: "Roberto Alves", xp: 1700, accuracy: 79, questions: 190, streak: 6, avatar: "RA" },
                { position: 8, name: "Fernanda Rocha", xp: 1600, accuracy: 77, questions: 180, streak: 5, avatar: "FR" },
                { position: 9, name: "Marcos Souza", xp: 1500, accuracy: 75, questions: 170, streak: 4, avatar: "MS" },
                { position: 10, name: "Juliana Lima", xp: 1400, accuracy: 73, questions: 160, streak: 3, avatar: "JL" },
                { position: 11, name: "Ricardo Santos", xp: 1300, accuracy: 71, questions: 150, streak: 2, avatar: "RS" },
                { position: 12, name: "Você", xp: 1250, accuracy: 85, questions: 156, streak: 7, avatar: "V", isCurrentUser: true },
                { position: 13, name: "Patricia Costa", xp: 1200, accuracy: 69, questions: 140, streak: 1, avatar: "PC" },
                { position: 14, name: "Andre Silva", xp: 1100, accuracy: 67, questions: 130, streak: 1, avatar: "AS" },
                { position: 15, name: "Camila Santos", xp: 1000, accuracy: 65, questions: 120, streak: 1, avatar: "CS" }
            ]
        };
    }

    getMockPlans() {
        return {
            plans: [
                {
                    id: 1,
                    name: "Básico",
                    price: 29,
                    description: "Perfeito para começar sua preparação",
                    features: [
                        "Acesso a 5.000 questões",
                        "Filtros básicos",
                        "Estatísticas simples",
                        "Suporte por email"
                    ],
                    icon: "fas fa-user"
                },
                {
                    id: 2,
                    name: "Premium",
                    price: 59,
                    description: "O mais escolhido pelos aprovados",
                    features: [
                        "Acesso ilimitado a questões",
                        "Filtros avançados",
                        "Estatísticas detalhadas",
                        "Comentários dos professores",
                        "Simulados personalizados",
                        "Suporte prioritário"
                    ],
                    icon: "fas fa-crown",
                    featured: true
                },
                {
                    id: 3,
                    name: "Pro",
                    price: 99,
                    description: "Para quem quer ir além",
                    features: [
                        "Tudo do Premium",
                        "Mentoria individual",
                        "Plano de estudos personalizado",
                        "Acesso antecipado a novos recursos",
                        "Suporte 24/7"
                    ],
                    icon: "fas fa-rocket"
                }
            ]
        };
    }

    getMockUserProfile() {
        return {
            user: {
                nome: 'João Silva',
                email: 'joao@teste.com',
                telefone: '(11) 99999-9999',
                cidade: 'São Paulo',
                estado: 'SP'
            },
            stats: {
                xp: 1250,
                accuracy: 85,
                questionsAnswered: 156,
                streak: 7,
                ranking: 12
            },
            activities: [
                {
                    id: 1,
                    type: 'question',
                    message: 'Resolveu 5 questões de Direito Constitucional',
                    date: 'Há 2 horas'
                },
                {
                    id: 2,
                    type: 'xp',
                    message: 'Ganhou 50 XP por acertar 4 questões seguidas',
                    date: 'Há 4 horas'
                },
                {
                    id: 3,
                    type: 'ranking',
                    message: 'Subiu 3 posições no ranking geral',
                    date: 'Ontem'
                },
                {
                    id: 4,
                    type: 'bookmark',
                    message: 'Favoritou 3 questões para revisão',
                    date: '2 dias atrás'
                },
                {
                    id: 5,
                    type: 'streak',
                    message: 'Completou 7 dias consecutivos de estudo',
                    date: '3 dias atrás'
                }
            ]
        };
    }
}

// Instância global do ApiService
window.apiService = new ApiService();

// Funções globais para uso nas páginas
window.loadDashboardData = async function() {
    try {
        const data = await window.apiService.getDashboardData();
        updateDashboardUI(data);
    } catch (error) {
        console.error('Erro ao carregar dashboard:', error);
        showErrorMessage('Erro ao carregar dados. Tente novamente.');
    }
};

window.loadQuestionsData = async function(filters = {}) {
    try {
        const data = await window.apiService.getQuestions(filters);
        updateQuestionsUI(data);
    } catch (error) {
        console.error('Erro ao carregar questões:', error);
        showErrorMessage('Erro ao carregar questões. Tente novamente.');
    }
};

window.loadRankingData = async function(filters = {}) {
    try {
        const data = await window.apiService.getRanking(filters);
        updateRankingUI(data);
    } catch (error) {
        console.error('Erro ao carregar ranking:', error);
        showErrorMessage('Erro ao carregar ranking. Tente novamente.');
    }
};

window.loadPlansData = async function() {
    try {
        const data = await window.apiService.getPlans();
        updatePlansUI(data);
    } catch (error) {
        console.error('Erro ao carregar planos:', error);
        showErrorMessage('Erro ao carregar planos. Tente novamente.');
    }
};

window.loadProfileData = async function() {
    try {
        const data = await window.apiService.getUserProfile();
        updateProfileUI(data);
    } catch (error) {
        console.error('Erro ao carregar perfil:', error);
        showErrorMessage('Erro ao carregar perfil. Tente novamente.');
    }
};

// Funções de atualização da UI
function updateDashboardUI(data) {
    // Atualizar XP
    const xpElement = document.querySelector('.xp-text');
    if (xpElement) {
        xpElement.textContent = `${data.user.xp.toLocaleString()} XP`;
    }

    const xpProgress = document.querySelector('.xp-progress');
    if (xpProgress) {
        const percentage = (data.user.xp % 5000) / 50; // 5000 XP por nível
        xpProgress.style.width = `${percentage}%`;
    }

    // Atualizar estatísticas
    const statsElements = document.querySelectorAll('.stat-number');
    if (statsElements.length >= 4) {
        statsElements[0].textContent = `#${data.user.ranking}`;
        statsElements[1].textContent = `${data.user.accuracy}%`;
        statsElements[2].textContent = data.user.questionsAnswered;
        statsElements[3].textContent = data.user.streak;
    }

    // Atualizar notificações
    const notificationsContainer = document.querySelector('.notifications-container');
    if (notificationsContainer && data.notifications) {
        notificationsContainer.innerHTML = data.notifications.map(notification => `
            <div class="notification-card" style="border-left-color: ${notification.color};">
                <div class="notification-header">
                    <h4>${notification.title}</h4>
                    <span class="notification-category">${notification.category}</span>
                </div>
                <p>${notification.message}</p>
                <small>${notification.date}</small>
            </div>
        `).join('');
    }

    // Atualizar atividades
    const activitiesList = document.querySelector('.activities-list');
    if (activitiesList && data.recentActivities) {
        activitiesList.innerHTML = data.recentActivities.map(activity => `
            <div class="activity-item">
                <i class="fas fa-${getActivityIcon(activity.type)}"></i>
                <div class="activity-content">
                    <p>${activity.message}</p>
                    <small>${activity.date}</small>
                </div>
            </div>
        `).join('');
    }
}

function updateQuestionsUI(data) {
    const questionsList = document.getElementById('questionsList');
    if (!questionsList) return;

    // Verificar se data.questoes existe (estrutura da API)
    const questions = data.questoes || data.questions || [];
    
    if (questions.length === 0) {
        questionsList.innerHTML = `
            <div class="no-questions">
                <i class="fas fa-search"></i>
                <h3>Nenhuma questão encontrada</h3>
                <p>Tente ajustar os filtros ou verifique se há questões cadastradas.</p>
            </div>
        `;
        return;
    }

    questionsList.innerHTML = questions.map(question => `
        <div class="question-card">
            <div class="question-header">
                <h4 class="question-title">Questão #${question.id}</h4>
                <div class="question-tags">
                    <span class="tag">${question.disciplina?.nome || question.disciplina || 'N/A'}</span>
                    <span class="tag">${question.assunto?.nome || question.assunto || 'N/A'}</span>
                    <span class="tag">${question.banca?.nome || question.banca || 'N/A'}</span>
                    <span class="tag">${question.ano || 'N/A'}</span>
                </div>
            </div>
            <div class="question-content">
                <p class="question-text">${question.enunciado}</p>
            </div>
            <div class="question-options">
                <div class="option" data-option="A">
                    <span class="option-letter">A</span>
                    <span class="option-text">${question.alternativa_a}</span>
                </div>
                <div class="option" data-option="B">
                    <span class="option-letter">B</span>
                    <span class="option-text">${question.alternativa_b}</span>
                </div>
                <div class="option" data-option="C">
                    <span class="option-letter">C</span>
                    <span class="option-text">${question.alternativa_c}</span>
                </div>
                <div class="option" data-option="D">
                    <span class="option-letter">D</span>
                    <span class="option-text">${question.alternativa_d}</span>
                </div>
                ${question.alternativa_e ? `
                <div class="option" data-option="E">
                    <span class="option-letter">E</span>
                    <span class="option-text">${question.alternativa_e}</span>
                </div>
                ` : ''}
            </div>
            <div class="question-actions">
                <button class="btn-bookmark" onclick="toggleBookmark(${question.id})">
                    <i class="fas fa-bookmark"></i>
                </button>
                <button class="btn" onclick="responderQuestao(${question.id})">
                    <i class="fas fa-check"></i>
                    Responder
                </button>
            </div>
        </div>
    `).join('');

    // Adicionar event listeners para as opções
    document.querySelectorAll('.option').forEach(option => {
        option.addEventListener('click', function() {
            // Remover seleção de todas as opções do mesmo card
            const questionCard = this.closest('.question-card');
            questionCard.querySelectorAll('.option').forEach(opt => {
                opt.classList.remove('selected');
            });
            // Selecionar a opção clicada
            this.classList.add('selected');
        });
    });
}

function updateRankingUI(data) {
    // Atualizar minha posição
    const myPositionCard = document.querySelector('.my-position-card');
    if (myPositionCard && data.myPosition) {
        const positionElement = myPositionCard.querySelector('.my-position-info h3');
        if (positionElement) {
            positionElement.textContent = `Sua Posição: #${data.myPosition.position}`;
        }

        const statsElements = myPositionCard.querySelectorAll('.my-position-stat-number');
        if (statsElements.length >= 4) {
            statsElements[0].textContent = data.myPosition.xp.toLocaleString();
            statsElements[1].textContent = `${data.myPosition.accuracy}%`;
            statsElements[2].textContent = data.myPosition.questionsAnswered;
            statsElements[3].textContent = data.myPosition.streak;
        }
    }

    // Atualizar lista de ranking
    const rankingItems = document.getElementById('rankingItems');
    if (rankingItems && data.ranking) {
        rankingItems.innerHTML = data.ranking.map(user => `
            <div class="ranking-item ${user.isCurrentUser ? 'current-user' : ''}" style="${user.isCurrentUser ? 'background-color: rgba(139, 0, 0, 0.2); border-left: 4px solid var(--highlight);' : ''}">
                <div class="ranking-position ${user.position <= 3 ? 'top-3' : ''} ${user.position === 1 ? 'top-1' : ''}">
                    #${user.position}
                </div>
                <div class="ranking-avatar">
                    ${user.avatar}
                </div>
                <div class="ranking-info">
                    <div class="ranking-name">${user.name}</div>
                    <div class="ranking-details">${user.questions} questões respondidas</div>
                </div>
                <div class="ranking-stats">
                    <div class="ranking-stat">
                        <div class="ranking-stat-number">${user.xp}</div>
                        <div class="ranking-stat-label">XP</div>
                    </div>
                    <div class="ranking-stat">
                        <div class="ranking-stat-number">${user.accuracy}%</div>
                        <div class="ranking-stat-label">Acerto</div>
                    </div>
                    <div class="ranking-stat">
                        <div class="ranking-stat-number">${user.streak}</div>
                        <div class="ranking-stat-label">Dias</div>
                    </div>
                </div>
            </div>
        `).join('');
    }
}

function updatePlansUI(data) {
    const plansGrid = document.querySelector('.plans-grid');
    if (!plansGrid || !data.plans) return;

    plansGrid.innerHTML = data.plans.map(plan => `
        <div class="plan-card ${plan.featured ? 'featured' : ''}">
            <div class="plan-icon">
                <i class="${plan.icon}"></i>
            </div>
            <h3 class="plan-name">${plan.name}</h3>
            <div class="plan-price">
                <span class="currency">R$</span>${plan.price}<span class="period">/mês</span>
            </div>
            <p class="plan-description">${plan.description}</p>
            <ul class="plan-features">
                ${plan.features.map(feature => `<li><i class="fas fa-check"></i> ${feature}</li>`).join('')}
            </ul>
            <button class="plan-button ${plan.featured ? '' : 'secondary'}" onclick="subscribeToPlan(${plan.id})">
                Escolher Plano
            </button>
        </div>
    `).join('');
}

function updateProfileUI(data) {
    // Atualizar informações do perfil
    const profileInfo = document.querySelector('.profile-info');
    if (profileInfo && data.user) {
        const nameElement = profileInfo.querySelector('h1');
        if (nameElement) {
            nameElement.textContent = data.user.nome;
        }

        const emailElement = profileInfo.querySelector('p');
        if (emailElement) {
            emailElement.textContent = data.user.email;
        }
    }

    // Atualizar estatísticas
    const statsElements = document.querySelectorAll('.stat-card-number');
    if (statsElements.length >= 4 && data.stats) {
        statsElements[0].textContent = `${data.stats.accuracy}%`;
        statsElements[1].textContent = data.stats.streak;
        statsElements[2].textContent = data.stats.questionsAnswered;
        statsElements[3].textContent = data.stats.ranking;
    }

    // Atualizar atividades
    const activitiesList = document.querySelector('.activities-list');
    if (activitiesList && data.activities) {
        activitiesList.innerHTML = data.activities.map(activity => `
            <div class="activity-item">
                <i class="fas fa-${getActivityIcon(activity.type)}"></i>
                <div class="activity-content">
                    <p>${activity.message}</p>
                    <small>${activity.date}</small>
                </div>
            </div>
        `).join('');
    }
}

// Funções auxiliares
function getActivityIcon(type) {
    const icons = {
        'question': 'question-circle',
        'xp': 'star',
        'ranking': 'trophy',
        'bookmark': 'bookmark',
        'streak': 'calendar'
    };
    return icons[type] || 'info-circle';
}

function showErrorMessage(message) {
    const messageElement = document.getElementById('message');
    if (messageElement) {
        messageElement.textContent = message;
        messageElement.className = 'message error';
        messageElement.style.display = 'block';
    }
}

// Funções globais para interação
window.responderQuestao = async function(questionId) {
    // Encontrar o card da questão pelo ID
    const questionCards = document.querySelectorAll('.question-card');
    let questionCard = null;
    
    for (const card of questionCards) {
        const titleElement = card.querySelector('.question-title');
        if (titleElement && titleElement.textContent.includes(`#${questionId}`)) {
            questionCard = card;
            break;
        }
    }
    
    if (!questionCard) {
        alert('Questão não encontrada.');
        return;
    }
    
    const selectedOption = questionCard.querySelector('.option.selected');
    
    if (!selectedOption) {
        alert('Selecione uma alternativa antes de responder.');
        return;
    }

    const optionLetter = selectedOption.dataset.option;
    
    try {
        await window.apiService.answerQuestion(questionId, optionLetter);
        alert(`Questão ${questionId} respondida com alternativa ${optionLetter}`);
        // Recarregar questões para atualizar estatísticas
        window.loadQuestionsData();
    } catch (error) {
        alert('Erro ao responder questão. Tente novamente.');
    }
};

window.toggleBookmark = async function(questionId) {
    try {
        await window.apiService.bookmarkQuestion(questionId);
        console.log('Questão favoritada:', questionId);
    } catch (error) {
        alert('Erro ao favoritar questão. Tente novamente.');
    }
};

window.subscribeToPlan = async function(planId) {
    try {
        const result = await window.apiService.subscribeToPlan(planId);
        if (result.paymentUrl) {
            window.open(result.paymentUrl, '_blank');
        } else {
            alert('Plano assinado com sucesso!');
        }
    } catch (error) {
        alert('Erro ao assinar plano. Tente novamente.');
    }
};

window.logout = function() {
    window.apiService.logout();
};

# Guia Técnico - Refatoração e Estruturação

## 🏗️ Estrutura de Diretórios Recomendada

### Fase 1: Organização Atual (Mínima)
```
App-cha-fralda/
├── public/               # Arquivos estáticos servidos pelo Express
│   ├── index.html
│   ├── presenca.html
│   ├── presentes.html
│   ├── admin.html
│   ├── css/
│   │   └── styles.css
│   └── js/
│       ├── main.js       # Lógica principal (refatorada do app.js)
│       ├── modules/
│       │   ├── guests.js
│       │   ├── gifts.js
│       │   └── storage.js
│       └── utils/
│           └── validators.js
├── server.js
├── package.json
└── docs/
    ├── ANALISE_PROJETO.md
    ├── MELHORIAS_VISUAL.md
    └── GUIA_TECNICO.md (este arquivo)
```

### Fase 2: Refatoração Completa
```
App-cha-fralda/
├── frontend/
│   ├── public/
│   │   ├── index.html
│   │   ├── pages/
│   │   │   ├── presenca.html
│   │   │   ├── presentes.html
│   │   │   └── admin.html
│   │   ├── assets/
│   │   │   ├── styles/
│   │   │   │   ├── main.css
│   │   │   │   ├── components.css
│   │   │   │   └── admin.css
│   │   │   ├── icons/
│   │   │   │   └── logo.svg
│   │   │   └── images/
│   │   └── js/
│   │       ├── app.js (entrada)
│   │       ├── modules/
│   │       │   ├── guests.js
│   │       │   ├── gifts.js
│   │       │   ├── auth.js (novo)
│   │       │   └── api.js (novo)
│   │       └── utils/
│   │           ├── validators.js
│   │           ├── dom.js
│   │           └── helpers.js
│   └── package.json
│
├── backend/
│   ├── src/
│   │   ├── server.js
│   │   ├── config/
│   │   │   └── config.js
│   │   ├── routes/
│   │   │   ├── guests.js
│   │   │   ├── gifts.js
│   │   │   └── auth.js
│   │   ├── controllers/
│   │   │   ├── guestsController.js
│   │   │   ├── giftsController.js
│   │   │   └── authController.js
│   │   ├── models/
│   │   │   ├── Guest.js
│   │   │   └── Gift.js
│   │   ├── middleware/
│   │   │   ├── auth.js (validar JWT)
│   │   │   ├── errorHandler.js
│   │   │   └── validation.js
│   │   └── database/
│   │       ├── db.js
│   │       └── migrations/
│   │           └── 001_init.sql
│   └── package.json
│
├── docs/
│   ├── ANALISE_PROJETO.md
│   ├── MELHORIAS_VISUAL.md
│   ├── GUIA_TECNICO.md
│   ├── API.md
│   └── DEPLOYMENT.md
│
├── .env.example
├── .gitignore
├── package.json (root)
└── README.md
```

---

## 📦 Separação de Responsabilidades

### Antes (Monolítico - app.js)
```javascript
// app.js - 700+ linhas
// - Lógica de convidados
// - Lógica de presentes
// - Renderização de DOM
// - Comunicação com servidor
// - Persistência em localStorage
// - Validação
// - Formatação de dados
```

### Depois (Modular)

**guests.js** - Lógica de convidados
```javascript
export const guestsModule = {
  state: [],
  
  add(name, city, rsvp) { /* ... */ },
  update(id, updates) { /* ... */ },
  remove(id) { /* ... */ },
  getAll() { return [...this.state]; },
  getById(id) { /* ... */ }
};
```

**gifts.js** - Lógica de presentes
```javascript
export const giftsModule = {
  state: [],
  
  add(gift) { /* ... */ },
  update(id, updates) { /* ... */ },
  remove(id) { /* ... */ },
  reserve(giftId, guestId, quantity, size) { /* ... */ },
  cancelReservation(giftId, guestId, size) { /* ... */ },
  getAll() { return [...this.state]; }
};
```

**api.js** - Comunicação com servidor
```javascript
export const api = {
  async getGuests() { /* fetch */ },
  async saveGuest(guest) { /* fetch POST */ },
  async updateGuest(id, updates) { /* fetch PUT */ },
  async deleteGuest(id) { /* fetch DELETE */ },
  
  async getGifts() { /* fetch */ },
  async saveGift(gift) { /* fetch POST */ },
  async updateGift(id, updates) { /* fetch PUT */ },
  async deleteGift(id) { /* fetch DELETE */ },
  
  async login(email, password) { /* auth */ },
  async logout() { /* auth */ }
};
```

**storage.js** - Persistência local
```javascript
export const storage = {
  get(key) { return JSON.parse(localStorage.getItem(key)); },
  set(key, value) { localStorage.setItem(key, JSON.stringify(value)); },
  remove(key) { localStorage.removeItem(key); },
  
  // Métodos de conveniência
  getGuests() { return this.get('cha_guests_v1') || []; },
  saveGuests(guests) { this.set('cha_guests_v1', guests); },
  // ... similar para gifts
};
```

**validators.js** - Validação
```javascript
export const validators = {
  isValidName(name) { return name && name.trim().length >= 2; },
  isValidEmail(email) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email); },
  isValidUrl(url) { try { new URL(url); return true; } catch { return false; } },
  isValidQuantity(qty) { return Number(qty) > 0 && Number(qty) <= 999; }
};
```

**dom.js** - Renderização (novo)
```javascript
export const dom = {
  renderGuestList(guests) { /* ... */ },
  renderGiftList(gifts) { /* ... */ },
  showModal(content, buttons) { /* ... */ },
  showToast(message, type = 'info') { /* ... */ },
  showError(message) { /* ... */ }
};
```

---

## 🔐 Autenticação - Implementação Segura

### Backend (server.js)

```javascript
const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const cors = require('cors');

const app = express();
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-prod';

app.use(express.json());
app.use(cors());

// Credenciais armazenadas no banco (simulado)
const admins = [
  {
    id: 1,
    email: 'admin@example.com',
    passwordHash: bcrypt.hashSync('senha-segura', 10),
    role: 'admin'
  }
];

// Middleware de autenticação
const authenticateToken = (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Acesso negado' });
  
  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Token inválido' });
    req.user = user;
    next();
  });
};

// Rota de login
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  
  // Validar entrada
  if (!email || !password) {
    return res.status(400).json({ error: 'Email e senha são obrigatórios' });
  }
  
  // Buscar admin no banco
  const admin = admins.find(a => a.email === email);
  if (!admin) {
    return res.status(401).json({ error: 'Credenciais inválidas' });
  }
  
  // Comparar senha
  const isValid = bcrypt.compareSync(password, admin.passwordHash);
  if (!isValid) {
    return res.status(401).json({ error: 'Credenciais inválidas' });
  }
  
  // Gerar JWT
  const token = jwt.sign(
    { id: admin.id, email: admin.email, role: admin.role },
    JWT_SECRET,
    { expiresIn: '24h' }
  );
  
  res.json({ token, expiresIn: 86400 });
});

// Rota de logout (frontend remove token)
app.post('/api/auth/logout', (req, res) => {
  res.json({ message: 'Logout realizado' });
});

// Rotas protegidas
app.get('/api/guests', authenticateToken, (req, res) => {
  // Apenas admin pode acessar
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Acesso negado' });
  }
  res.json({ guests: [] });
});
```

### Frontend (auth.js)

```javascript
export const auth = {
  token: null,
  currentUser: null,
  
  async login(email, password) {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Erro ao fazer login');
      }
      
      const data = await response.json();
      this.token = data.token;
      
      // Decodificar JWT (usar jwt_decode library em produção)
      const payload = JSON.parse(atob(data.token.split('.')[1]));
      this.currentUser = payload;
      
      // Guardar token em memória (NOT localStorage por segurança)
      sessionStorage.setItem('auth_token', data.token);
      
      return true;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  },
  
  logout() {
    this.token = null;
    this.currentUser = null;
    sessionStorage.removeItem('auth_token');
  },
  
  isAuthenticated() {
    return this.token !== null;
  },
  
  getToken() {
    return this.token || sessionStorage.getItem('auth_token');
  }
};
```

### API com Autenticação

```javascript
export const api = {
  async request(endpoint, options = {}) {
    const token = auth.getToken();
    const headers = {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
      ...options.headers
    };
    
    const response = await fetch(endpoint, {
      ...options,
      headers
    });
    
    if (response.status === 401) {
      // Token expirado, logout
      auth.logout();
      window.location.href = '/admin.html';
      throw new Error('Sessão expirada');
    }
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Erro na requisição');
    }
    
    return response.json();
  },
  
  // Exemplos de uso
  async getGuests() {
    return this.request('/api/guests');
  },
  
  async addGuest(guest) {
    return this.request('/api/guests', {
      method: 'POST',
      body: JSON.stringify(guest)
    });
  }
};
```

---

## 📊 Validação e Tratamento de Erros

### Validadores

```javascript
// validators.js
export const validators = {
  guestName(name) {
    if (!name || name.trim().length < 2) {
      return 'Nome deve ter pelo menos 2 caracteres';
    }
    if (name.trim().length > 100) {
      return 'Nome muito longo';
    }
    return null; // válido
  },
  
  guestEmail(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!regex.test(email)) {
      return 'Email inválido';
    }
    return null;
  },
  
  giftName(name) {
    if (!name || name.trim().length < 2) {
      return 'Nome do presente obrigatório';
    }
    return null;
  },
  
  quantity(qty) {
    const num = Number(qty);
    if (!num || num < 1) {
      return 'Quantidade deve ser pelo menos 1';
    }
    if (num > 999) {
      return 'Quantidade muito grande';
    }
    return null;
  },
  
  validate(data, rules) {
    const errors = {};
    for (const [field, rule] of Object.entries(rules)) {
      const error = rule(data[field]);
      if (error) errors[field] = error;
    }
    return Object.keys(errors).length ? errors : null;
  }
};
```

### Tratamento de Erros

```javascript
// main.js
function handleError(error, context = '') {
  console.error(`[${context}]`, error);
  
  // Mostrar mensagem amigável
  const message = error.message || 'Algo deu errado. Tente novamente.';
  dom.showError(message);
  
  // Log em servidor (optional)
  if (window.DEBUG) {
    console.log('Error logged:', { error, context, timestamp: new Date() });
  }
}

// Em cada operação
async function addGuestUI() {
  try {
    const name = document.getElementById('guest-name').value;
    const city = document.getElementById('guest-city').value;
    
    // Validar
    const errors = validators.validate({ name, city }, {
      name: validators.guestName,
      city: v => !v ? 'Cidade obrigatória' : null
    });
    
    if (errors) {
      Object.entries(errors).forEach(([field, msg]) => {
        dom.showFieldError(field, msg);
      });
      return;
    }
    
    // Enviar
    dom.showLoading();
    const guest = await api.addGuest({ name, city, rsvp: 'confirmado' });
    
    guestsModule.add(guest);
    dom.showSuccess('Presença confirmada!');
    dom.showModal('Escolher presente?', [
      { text: 'Agora', click: () => window.location.href = 'presentes.html' },
      { text: 'Depois', click: () => dom.closeModal() }
    ]);
    
  } catch (error) {
    handleError(error, 'addGuestUI');
  }
}
```

---

## 🧪 Testes Básicos

### Estrutura de Testes

```javascript
// tests/validators.test.js
import { validators } from '../frontend/public/js/utils/validators.js';

describe('Validators', () => {
  describe('guestName', () => {
    it('deve rejeitar nomes vazios', () => {
      const error = validators.guestName('');
      expect(error).toBeTruthy();
    });
    
    it('deve rejeitar nomes com 1 caractere', () => {
      const error = validators.guestName('A');
      expect(error).toBeTruthy();
    });
    
    it('deve aceitar nomes válidos', () => {
      const error = validators.guestName('João Silva');
      expect(error).toBeNull();
    });
  });
  
  describe('quantity', () => {
    it('deve rejeitar quantidade 0', () => {
      const error = validators.quantity(0);
      expect(error).toBeTruthy();
    });
    
    it('deve aceitar quantidade > 0', () => {
      const error = validators.quantity(5);
      expect(error).toBeNull();
    });
  });
});
```

---

## 🚀 Roteiro de Implementação

### Sprint 1 (2-3 dias)
- [ ] Criar estrutura de diretórios (Fase 1)
- [ ] Refatorar app.js em módulos
- [ ] Implementar auth.js com login real
- [ ] Adicionar validação básica
- [ ] Testes unitários simples

### Sprint 2 (3-4 dias)
- [ ] Melhorar modal de reserva
- [ ] Adicionar cancelamento de reservas
- [ ] Unificar fluxo de convidados
- [ ] Dashboard de admin
- [ ] Exportar/importar dados

### Sprint 3+ (Futuro)
- [ ] Refatorar para Fase 2 (estrutura completa)
- [ ] Migrar para framework (React/Vue)
- [ ] Notificações por email
- [ ] App mobile nativa

---

## 📋 Checklist de Qualidade

### Código
- [ ] Usar `const`/`let` (não `var`)
- [ ] Nomes descritivos de funções/variáveis
- [ ] Funções pequenas (<30 linhas)
- [ ] DRY (Don't Repeat Yourself)
- [ ] Sem console.log em produção
- [ ] Comentários apenas para "por quê", não "o quê"

### Segurança
- [ ] Sem senhas no frontend
- [ ] Validação no backend
- [ ] JWT com expiração
- [ ] HTTPS em produção
- [ ] CORS configurado
- [ ] SQL injection prevention (use prepared statements)

### Performance
- [ ] Lazy loading de recursos
- [ ] Cache de API
- [ ] Minificação em produção
- [ ] Bundle size < 500KB
- [ ] Lighthouse > 90

### Acessibilidade
- [ ] Labels em inputs
- [ ] Aria attributes
- [ ] Navegação por teclado
- [ ] Contrast ratio WCAG AA
- [ ] Mobile accessible

### Documentação
- [ ] README.md atualizado
- [ ] API.md com endpoints
- [ ] DEPLOYMENT.md para produção
- [ ] Comentários no código complexo
- [ ] Exemplos de uso

---

## 🔧 Stack Recomendado (Futuro)

Se decidir evoluir o projeto:

**Frontend**
- React/Vue.js (componentes reutilizáveis)
- Vite (build tool rápido)
- TailwindCSS (estilos)
- Zustand/Pinia (state management)
- React Query (data fetching)
- Jest (testes)

**Backend**
- Node.js + Express (já tem)
- TypeScript (type safety)
- Prisma (ORM)
- Jest (testes)
- Docker (containerização)

**Infra**
- GitHub Actions (CI/CD)
- PostgreSQL (em vez de SQLite)
- Redis (cache)
- AWS/Heroku (hosting)

---

## 📚 Referências

- [JavaScript Modules](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules)
- [JWT.io](https://jwt.io/)
- [Express.js Docs](https://expressjs.com/)
- [Web Security](https://owasp.org/www-project-top-ten/)
- [WCAG Accessibility](https://www.w3.org/WAI/WCAG21/quickref/)


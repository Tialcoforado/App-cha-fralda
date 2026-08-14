# 📋 Plano de Ação - Próximos Passos

## 🎯 Resumo Executivo

**Estado Atual:** Projeto com funcionalidades básicas funcionais, mas com fluxo confuso, problemas de segurança e UX ruim.

**Recomendação:** Fazer 4-5 melhorias críticas **AGORA** antes de adicionar novas funcionalidades.

---

## 🔴 Crítico (FAZER ESTA SEMANA)

### 1. Unificar Fluxo de Convidados
**Problema:** Usuário deve ir a `presenca.html` para ser registrado, depois pode ir a `presentes.html`
**Impacto:** Fluxo confuso, alta taxa de abandono

**Solução Rápida:**
- [ ] Adicionar modal/prompt "Qual é seu nome?" em `presentes.html`
- [ ] Guardar nome em `sessionStorage` compartilhado
- [ ] Ou fazer login/registro direto em `presentes.html`

**Tempo:** 2-3 horas
**Arquivo:** Modificar `presentes.html` e `app.js`

---

### 2. Remover Senha do Frontend
**Problema:** Senha hardcoded em `index.html` (`al.coforado`)
**Impacto:** Segurança (pode ser vista em dev tools)

**Solução:**
- [ ] Criar endpoint `/api/auth/login` no backend
- [ ] Validar credenciais no backend
- [ ] Retornar JWT token
- [ ] Usar token em requisições admin

**Tempo:** 3-4 horas
**Arquivo:** `server.js`, `index.html`, novo `auth.js`

---

### 3. Adicionar Validação e Feedback
**Problema:** Sem mensagens de erro, dados inválidos são aceitos silenciosamente
**Impacto:** Usuários confusos, dados ruins no banco

**Solução:**
- [ ] Validar nome (mínimo 2 caracteres)
- [ ] Validar quantidade (1-999)
- [ ] Mostrar mensagem de sucesso/erro com toast
- [ ] Evitar duplicatas de convidados

**Tempo:** 2-3 horas
**Arquivo:** Novo `validators.js`, modificar `app.js`

---

### 4. Corrigir Placeholder de Vídeo
**Problema:** Iframe com `VIDEO_ID` não mostra vídeo
**Impacto:** Página quebrada visualmente

**Solução:**
- [ ] Remover seção de vídeo OU
- [ ] Adicionar campo em admin para inserir ID do YouTube
- [ ] Validar formato

**Tempo:** 30 minutos
**Arquivo:** `index.html`, opcionalmente `admin.html`

---

## 🟠 Importante (PRÓXIMAS 2-3 SEMANAS)

### 5. Melhorar Modal de Reserva
**Problema:** Select + input + botão confusos, especialmente mobile
**Impacto:** UX ruim, usuários desistem de reservar

**Solução:**
- [ ] Criar modal dedicado para reserva
- [ ] Pré-preencher nome do usuário
- [ ] Usar buttons/spinners em vez de inputs numéricos
- [ ] Confirmation visual

**Tempo:** 4-5 horas

---

### 6. Adicionar Cancelamento de Reservas
**Problema:** Usuário não pode desfazer reserva
**Impacto:** Presentes "presos" com doador errado

**Solução:**
- [ ] Adicionar botão "Cancelar" em cada reserva
- [ ] Pedir confirmação antes
- [ ] Atualizar contador em tempo real

**Tempo:** 3-4 horas

---

### 7. Dashboard de Admin
**Problema:** Admin não tem visão geral (stats, relatórios)
**Impacto:** Difícil gerenciar evento

**Solução:**
- [ ] Total de convidados por status
- [ ] Presentes reservados vs não reservados
- [ ] Taxa de conclusão (%)
- [ ] Lista com search/filtro

**Tempo:** 5-6 horas

---

## 🟡 Médio Prazo (PRÓXIMO MÊS)

### 8. Exportar/Importar Dados
**Problema:** Impossível fazer backup ou compartilhar
**Solução:** Botão JSON/CSV
**Tempo:** 3-4 horas

### 9. Refatorar Código em Módulos
**Problema:** `app.js` tem 700+ linhas, difícil de manter
**Solução:** Separar em `guests.js`, `gifts.js`, `api.js`, etc.
**Tempo:** 8-10 horas

### 10. Notificações por Email
**Problema:** Admin não sabe quando convidado confirma
**Solução:** Usar Nodemailer ou SendGrid
**Tempo:** 6-8 horas

---

## 📋 Quick Checklist

### Esta Semana
```
[ ] 1. Unificar fluxo (sessionStorage nome)
[ ] 2. Login seguro (JWT)
[ ] 3. Validação + feedback (toast)
[ ] 4. Corrigir vídeo (remover ou funcionar)
```

### Próximas 2 Semanas
```
[ ] 5. Modal de reserva melhorado
[ ] 6. Cancelar reserva
[ ] 7. Dashboard admin com stats
```

### Próximo Mês
```
[ ] 8. Exportar/importar dados
[ ] 9. Refatorar app.js em módulos
[ ] 10. Notificações por email
```

---

## 💻 Exemplos de Código Rápido

### 1. Unificar Fluxo (sessionStorage)
```javascript
// app.js - novo
const currentUser = {
  get name() { return sessionStorage.getItem('user_name'); },
  set name(val) { sessionStorage.setItem('user_name', val); },
  
  get isRegistered() { return !!this.name; }
};

// presentes.html - verificar se registrado
if (!currentUser.isRegistered) {
  const name = prompt('Qual é seu nome?');
  if (name) currentUser.name = name;
  else return; // abort
}

// Usar em todo lugar
console.log(`Bem-vindo, ${currentUser.name}`);
```

### 2. Toast de Sucesso/Erro
```javascript
// utils/ui.js - novo
function showToast(message, type = 'info') {
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.textContent = message;
  document.body.appendChild(toast);
  
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 3000);
  setTimeout(() => toast.remove(), 3500);
}

// Uso
showToast('Confirmação enviada!', 'success');
showToast('Erro ao enviar', 'error');
```

### 3. Validação Simples
```javascript
// validators.js - novo
const validators = {
  name(v) { return v?.trim()?.length < 2 ? 'Nome muito curto' : null; },
  quantity(v) { return Number(v) < 1 ? 'Mínimo 1' : null; },
  email(v) { return /\S+@\S+\.\S+/.test(v) ? null : 'Email inválido'; }
};

// Uso
const error = validators.name(inputValue);
if (error) showToast(error, 'error');
```

### 4. Login Seguro
```javascript
// Backend - server.js
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  
  // Verificar credenciais (usar bcrypt em produção!)
  if (email !== process.env.ADMIN_EMAIL || 
      password !== process.env.ADMIN_PASSWORD) {
    return res.status(401).json({ error: 'Inválido' });
  }
  
  const token = jwt.sign({ email }, process.env.JWT_SECRET);
  res.json({ token });
});

// Frontend - index.html
const loginBtn = document.querySelector('.admin-link');
loginBtn.onclick = async (e) => {
  e.preventDefault();
  
  const email = prompt('Email:');
  const password = prompt('Senha:');
  
  const res = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  
  if (res.ok) {
    const data = await res.json();
    sessionStorage.setItem('admin_token', data.token);
    window.location.href = 'admin.html';
  } else {
    alert('Credenciais inválidas');
  }
};
```

---

## 🎓 Recursos de Aprendizado

Se alguém da equipe precisar estudar:

- **Validação:** [MDN - Form Validation](https://developer.mozilla.org/en-US/docs/Learn/Forms/Form_validation)
- **JWT:** [JWT.io Introduction](https://jwt.io/introduction)
- **Módulos JS:** [MDN - JavaScript Modules](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules)
- **Async/Await:** [MDN - Async/Await](https://developer.mozilla.org/en-US/docs/Learn/JavaScript/Asynchronous/Promises)
- **localStorage:** [MDN - Web Storage](https://developer.mozilla.org/en-US/docs/Web/API/Web_Storage_API)

---

## 📞 Decisões Necessárias

Antes de começar, responda:

1. **Autenticação:** Login com senha simples ou email/senha?
2. **Notificações:** Quer email quando convidado confirma?
3. **Banco:** Continua com SQLite ou migra para PostgreSQL?
4. **Hosting:** Onde vai fazer deploy? (Vercel, Heroku, AWS?)
5. **Framework:** Quer refatorar para React/Vue futuro ou manter vanilla JS?

---

## 🎯 Objetivo Final

Ao final dessas melhorias:

✅ Usuário consegue completar fluxo sem confusão  
✅ Dados são validados e seguros  
✅ Admin tem visão clara do evento  
✅ Código é mais organizado e fácil de manter  
✅ App pronto para produção  

**Tempo Total:** ~2-3 semanas para o ciclo completo

---

## 📞 Próximo Passo

**Escolher:** Começar por qual crítico?

1. Unificar fluxo (mais rápido, maior impacto)
2. Login seguro (mais importante, mais complexo)
3. Validação (mais rápido)
4. Vídeo (mais trivial)

Recomendação: **Começar por ordem acima** (1 → 2 → 3 → 4)


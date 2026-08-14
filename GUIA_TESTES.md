# 🧪 Guia de Testes - Melhorias Implementadas

## 🚀 Como Rodar o Servidor

```bash
cd /workspaces/App-cha-fralda
npm install  # Se não tiver feito
npm start
```

**Acesso:** http://localhost:3000

---

## ✅ Testes Passo a Passo

### Teste 1: Validação no Formulário de Presença

1. Acesse http://localhost:3000/presenca.html
2. **Teste 1a - Campo vazio:**
   - Deixe "Nome" vazio
   - Clique "Enviar confirmação"
   - ✅ **Esperado:** Toast vermelho com "Nome é obrigatório"

3. **Teste 1b - Nome muito curto:**
   - Digite apenas "J" no campo Nome
   - Clique "Enviar"
   - ✅ **Esperado:** Toast com "Nome deve ter pelo menos 2 caracteres"

4. **Teste 1c - Cidade vazia:**
   - Digite "João Silva" em Nome
   - Deixe Cidade vazia
   - Clique "Enviar"
   - ✅ **Esperado:** Toast com "Cidade é obrigatória"

5. **Teste 1d - Sucesso:**
   - Nome: "João Silva"
   - Cidade: "São Paulo"
   - Clique "Enviar confirmação"
   - ✅ **Esperado:** 
     - Toast verde: "Bem-vindo, João Silva! Sua presença foi confirmada."
     - Mensagem de sucesso apareça
     - Botão "Escolher presente" apareça

---

### Teste 2: Fluxo Unificado (sessionStorage)

1. **Teste 2a - Acessar presentes.html direto:**
   - Abra uma aba nova
   - Acesse http://localhost:3000/presentes.html
   - ✅ **Esperado:** 
     - Prompt pedindo "Qual é seu nome?"
     - Após responder, apareça "👤 Seu Nome" no header

2. **Teste 2b - Após presença.html:**
   - Acesse presença.html
   - Confirme presença (ex: "Maria Santos")
   - Clique "Escolher presente"
   - ✅ **Esperado:** Header mostra "👤 Maria Santos" automaticamente

3. **Teste 2c - Verificar persistência:**
   - Vá para presença.html novamente
   - ✅ **Esperado:** Nome ainda está salvo (sessionStorage)

---

### Teste 3: Validação e Feedback ao Reservar

1. Acesse http://localhost:3000/presentes.html
2. Digite seu nome (ex: "Carlos")
3. **Teste 3a - Quantidade inválida:**
   - Escolha "Fraldas descartáveis"
   - Select: "Carlos"
   - Quantidade: "0"
   - Clique "Reservar"
   - ✅ **Esperado:** Toast vermelho "Quantidade deve ser pelo menos 1"

4. **Teste 3b - Sem selecionar nome:**
   - Deixe o select no "-- escolher --"
   - Quantidade: "5"
   - Clique "Reservar"
   - ✅ **Esperado:** Toast amarelo "Selecione seu nome"

5. **Teste 3c - Reserva com sucesso:**
   - Select: "Carlos"
   - Tamanho: "RN" (Fraldas)
   - Quantidade: "12"
   - Clique "Reservar"
   - ✅ **Esperado:** 
     - Toast verde: "Fralda tamanho RN reservada para Carlos!"
     - Contador atualiza
     - Campos limpam

6. **Teste 3d - Verificar tooltip:**
   - Clique no botão "?" para ver quem reservou
   - ✅ **Esperado:** Mostra "Carlos: 12"

---

### Teste 4: Validação em Admin (Presentes)

1. Acesse http://localhost:3000/admin.html
   - ⚠️ Nota: Ainda pede senha (al.coforado) - vamos corrigir isso depois

2. **Teste 4a - Presente sem nome:**
   - Deixe "Nome do produto" vazio
   - Preencha outros campos
   - Clique "Adicionar presente"
   - ✅ **Esperado:** Toast de erro "Nome do presente é obrigatório"

3. **Teste 4b - URL inválida:**
   - Nome: "Chupeta"
   - Imagem: "isso-nao-e-url"
   - Clique "Adicionar presente"
   - ✅ **Esperado:** Toast de erro "URL inválida"

4. **Teste 4c - Adicionar válido:**
   - Nome: "Chupeta"
   - Descrição: "Chupeta de silicone"
   - Quantidade: "5"
   - Deixe imagem em branco (é opcional)
   - Clique "Adicionar presente"
   - ✅ **Esperado:** 
     - Toast verde: "Presente 'Chupeta' adicionado com sucesso!"
     - Presente aparece na lista
     - Formulário limpa

---

### Teste 5: Vídeo em index.html

1. Acesse http://localhost:3000
2. Scroll down até "Vídeo de apresentação"
3. ✅ **Esperado:**
   - Não quebra (sem erro de iframe)
   - Mostra emoji 🎬
   - Mostra texto "Vídeo será ativado em breve"
   - Design com gradiente verde/azul

---

## 🎯 Teste de Regressão

**Verifique que funcionalidades antigas ainda funcionam:**

- [ ] Adicionar convidado via admin
- [ ] Remover convidado
- [ ] Mudar status (pendente/confirmado/cancelado)
- [ ] Listar presentes
- [ ] Marcar presente como "Comprado"
- [ ] Tooltip de reservas (botão "?")
- [ ] Responsividade mobile (F12 → Responsive Design Mode)

---

## 🐛 Possíveis Problemas e Soluções

### Problema 1: Toast não aparece
**Solução:**
- Verifique console (F12) para erros
- Revise se ui.js está sendo importado
- Refresque a página (Ctrl+Shift+R)

### Problema 2: sessionStorage não funciona
**Solução:**
- Verifique se está em localhost (não arquivo://)
- Limpe cookies/storage: DevTools → Application → Clear site data
- Refresque a página

### Problema 3: Validação não funciona
**Solução:**
- Verifique console para erros de import
- Certifique-se que type="module" está no script
- Verifique se validators.js existe na raiz

### Problema 4: Admin pede senha
**Solução:** Isso é esperado por enquanto. Próxima fase implementará login seguro.
- Senha: `al.coforado` (sim, está insegura por enquanto)

---

## 📱 Teste Mobile

1. Abra DevTools (F12)
2. Clique no ícone "Toggle device toolbar" (celular)
3. Escolha um dispositivo (ex: iPhone 12)
4. Teste a navegação e os toasts

✅ **Esperado:**
- Layout se adapta bem
- Toasts aparecem no rodapé (não topo)
- Inputs são acessíveis
- Sem scroll horizontal

---

## 🔍 Teste de Performance

No DevTools → Network:
1. Carregue presentes.html
2. Veja tempo de carregamento
3. ✅ **Esperado:** < 1 segundo

No DevTools → Console:
1. Procure por erros em vermelho
2. ✅ **Esperado:** Sem erros de import ou sintaxe

---

## 📊 Resumo de Teste

Preencha este checklist após testar:

```
Validação:
[ ] Nomes vazios são rejeitados
[ ] Nomes curtos são rejeitados
[ ] Cidades vazias são rejeitadas
[ ] Presentes sem nome são rejeitados
[ ] URLs inválidas são rejeitadas
[ ] Quantidades inválidas são rejeitadas

Feedback:
[ ] Toast de erro aparece (vermelho)
[ ] Toast de sucesso aparece (verde)
[ ] Toast de aviso aparece (amarelo)
[ ] Campos com erro ganham borda vermelha
[ ] Mensagens são claras

Fluxo:
[ ] Presença → Presentes (com nome)
[ ] Presentes direto (com prompt)
[ ] sessionStorage persiste nome
[ ] Reserva mostra no contador

Admin:
[ ] Validação funciona
[ ] Feedback funciona
[ ] Presentes são adicionados

Vídeo:
[ ] Seção de vídeo não quebra
[ ] Design está bonito

Mobile:
[ ] Layout se adapta
[ ] Toasts aparecem bem
[ ] Inputs são acessíveis
```

---

## 💬 Próximas Perguntas?

Se algo não funcionar:
1. Veja console (F12) para erros
2. Verifique se server está rodando (`npm start`)
3. Tente limpar cache (Ctrl+Shift+Del)
4. Refresque página (Ctrl+F5)

Se quiser testar a próxima fase (Login seguro com JWT):
→ Leia `PLANO_ACAO.md`

---

**Versão:** 1.0  
**Data:** 14 de Agosto de 2026  
**Status:** ✅ Pronto para teste


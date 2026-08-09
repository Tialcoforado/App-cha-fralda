const GUESTS_KEY = 'cha_guests_v1';
const GIFTS_KEY = 'cha_gifts_v1';

const DEFAULT_GIFTS_RAW = [
  // 🍼 Essenciais de higiene
  { nome: "Fraldas descartáveis", descricao: "Tamanhos RN, P, M e G", link: "#", comprado: false, sizesSupported: true },
  { nome: "Fralda de pano", descricao: "Para limpar e proteger roupas", link: "#", comprado: false },
  { nome: "Toalhas com capuz", descricao: "Para sair do banho quentinho", link: "#", comprado: false },
  { nome: "Cueiros", descricao: "Leves, para embrulhar o bebê", link: "#", comprado: false },

  // 👕 Roupinhas confortáveis
  { nome: "Bodies", descricao: "Manga curta e longa", link: "#", comprado: false },
  { nome: "Macacões", descricao: "Práticos para dormir e passear", link: "#", comprado: false },
  { nome: "Mijões", descricao: "Calças confortáveis com pé", link: "#", comprado: false },
  { nome: "Meias", descricao: "Para manter os pés aquecidos", link: "#", comprado: false },

  // 🧴 Cuidados extras
  { nome: "Mantinhas", descricao: "Leves e quentinhas", link: "#", comprado: false },
  { nome: "Babadores", descricao: "Evita sujeira nas roupas", link: "#", comprado: false },
  { nome: "Lenços umedecidos", descricao: "Sempre úteis fora de casa", link: "#", comprado: false }
];

function makeGiftFromRaw(raw){
  return {
    id: Date.now().toString(36) + Math.random().toString(36).slice(2,8),
    name: raw.nome || raw.name || 'Presente',
    description: raw.descricao || raw.description || '',
    link: raw.link || raw.url || '',
    reservedById: raw.reservedById || '',
    purchased: !!raw.comprado || !!raw.purchased || false,
    sizesSupported: !!raw.sizesSupported,
    reservations: raw.reservations || []
  };
}

let guests = [];
let gifts = [];

function loadLocalState(){
  guests = JSON.parse(localStorage.getItem(GUESTS_KEY)) || [];
  gifts = JSON.parse(localStorage.getItem(GIFTS_KEY)) || DEFAULT_GIFTS_RAW.map(makeGiftFromRaw);
}

function saveLocalState(){
  localStorage.setItem(GUESTS_KEY, JSON.stringify(guests));
  localStorage.setItem(GIFTS_KEY, JSON.stringify(gifts));
}

async function fetchState(){
  try {
    const response = await fetch('/api/state');
    if (!response.ok) throw new Error('Falha ao carregar estado do servidor');
    const data = await response.json();
    guests = data.guests || [];
    gifts = (data.gifts || []).map(g => ({
      ...g,
      reservations: g.reservations || []
    }));
    return true;
  } catch (error) {
    console.warn('Não foi possível carregar estado do servidor, usando localStorage:', error.message);
    return false;
  }
}

async function persistState(){
  saveLocalState();
  try {
    const response = await fetch('/api/state', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ guests, gifts })
    });
    if (!response.ok) {
      const payload = await response.json().catch(() => null);
      throw new Error(payload?.error || 'Falha ao salvar no servidor');
    }
  } catch (error) {
    console.warn('Não foi possível salvar no servidor, continuando com localStorage:', error.message);
  }
}

const guestForm = document.getElementById('guest-form');
const guestNameInput = document.getElementById('guest-name');
const guestRsvpSelect = document.getElementById('guest-rsvp');
const guestList = document.getElementById('guest-list');

const giftForm = document.getElementById('gift-form');
const giftNameInput = document.getElementById('gift-name');
const giftList = document.getElementById('gift-list');

const hasGuestSection = !!guestList;
const hasGiftSection = !!giftList;

function saveState(){
  persistState();
}

function renderGuests(){
  if(!hasGuestSection) return;
  guestList.innerHTML = '';
  guests.forEach(guest => {
    const li = document.createElement('li');
    const left = document.createElement('div');
    left.className = 'item-left';
    const name = document.createElement('div');
    name.textContent = guest.name;
    const status = document.createElement('div');
    status.className = 'muted';
    status.textContent = guest.rsvp || 'pendente';
    left.appendChild(name);
    left.appendChild(status);

    const actions = document.createElement('div');
    actions.className = 'actions';

    const rsvpSelect = document.createElement('select');
    ['pendente','confirmado','cancelado'].forEach(optionValue => {
      const opt = document.createElement('option');
      opt.value = optionValue;
      opt.textContent = optionValue;
      if(optionValue === guest.rsvp) opt.selected = true;
      rsvpSelect.appendChild(opt);
    });
    rsvpSelect.addEventListener('change', () => {
      updateGuestRsvp(guest.id, rsvpSelect.value);
    });

    const removeBtn = document.createElement('button');
    removeBtn.textContent = 'Remover';
    removeBtn.addEventListener('click', () => removeGuest(guest.id));

    actions.appendChild(rsvpSelect);
    actions.appendChild(removeBtn);

    li.appendChild(left);
    li.appendChild(actions);
    guestList.appendChild(li);
  });
}

function addGuest(name, rsvp){
  const newGuest = {id: Date.now().toString(), name: name.trim(), rsvp: rsvp || 'pendente'};
  guests.push(newGuest);
  saveState();
  renderGuests();
}

function updateGuestRsvp(id, newRsvp){
  const index = guests.findIndex(g => g.id === id);
  if(index === -1) return;
  guests[index].rsvp = newRsvp;
  saveState();
  renderGuests();
}

function removeGuest(id){
  guests = guests.filter(g => g.id !== id);
  saveState();
  renderGuests();
}

function renderGifts(){
  if(!hasGiftSection) return;
  giftList.innerHTML = '';
  gifts.forEach(gift => {
    const li = document.createElement('li');
    const left = document.createElement('div');
    left.className = 'item-left';

    const title = document.createElement('div');
    title.textContent = gift.name;
    if(gift.purchased){
      const badge = document.createElement('span');
      badge.className = 'badge';
      badge.textContent = 'Comprado';
      title.appendChild(badge);
    }

    const desc = document.createElement('div');
    desc.className = 'muted';
    desc.textContent = gift.description || '';

    const linkWrap = document.createElement('div');
    if(gift.link){
      const a = document.createElement('a');
      a.href = gift.link;
      a.textContent = 'Ver produto';
      a.target = '_blank';
      linkWrap.appendChild(a);
    }

    const reserved = document.createElement('div');
    reserved.className = 'muted';
    const reserverName = gift.reservedById ? (guests.find(g => g.id === gift.reservedById) || {}).name : '';
    reserved.textContent = reserverName ? `Reservado por: ${reserverName}` : '';

    left.appendChild(title);
    left.appendChild(desc);
    left.appendChild(linkWrap);
    left.appendChild(reserved);

    // If gift supports sizes (ex: fraldas), show aggregate counters and tooltip list
    if(gift.sizesSupported){
      const sizesWrap = document.createElement('div');
      sizesWrap.className = 'sizes-wrap muted';
      const sizeKeys = ['RN','P','M','G'];
      const totals = sizeKeys.reduce((acc,k)=>{acc[k]=0;return acc;},{RN:0,P:0,M:0,G:0});
      (gift.reservations || []).forEach(r => {
        if(!r.sizes) return;
        sizeKeys.forEach(k => { totals[k] += Number(r.sizes[k] || 0); });
      });
      sizeKeys.forEach(k => {
        const span = document.createElement('span');
        span.className = 'size-count';
        span.textContent = `${k}: ${totals[k]}`;

        const helpBtn = document.createElement('button');
        helpBtn.className = 'help-btn';
        helpBtn.textContent = '?';

        const tooltip = document.createElement('div');
        tooltip.className = 'help-tooltip';
        tooltip.style.display = 'none';
        const list = document.createElement('ul');
        list.className = 'tooltip-list';
        (gift.reservations || []).forEach(r => {
          const qty = Number(r.sizes && r.sizes[k] || 0);
          if(qty > 0){
            const li2 = document.createElement('li');
            const guestName = (guests.find(g => g.id === r.guestId) || {}).name || 'Anônimo';
            li2.textContent = `${guestName}: ${qty}`;
            list.appendChild(li2);
          }
        });
        if(!list.children.length){
          const none = document.createElement('li'); none.textContent = '— nenhum —'; list.appendChild(none);
        }
        tooltip.appendChild(list);
        helpBtn.addEventListener('click', (e)=>{
          e.stopPropagation();
          tooltip.style.display = tooltip.style.display === 'none' ? 'block' : 'none';
        });

        span.appendChild(helpBtn);
        span.appendChild(tooltip);
        sizesWrap.appendChild(span);
      });
      left.appendChild(sizesWrap);
    }

    const actions = document.createElement('div');
    actions.className = 'actions';

    // Reserve select (inline)
    const reserveSelect = document.createElement('select');
    const emptyOpt = document.createElement('option');
    emptyOpt.value = '';
    emptyOpt.textContent = guests.length ? '-- Reservar como --' : '-- Sem convidados --';
    if(!guests.length) emptyOpt.disabled = true;
    reserveSelect.appendChild(emptyOpt);
    guests.forEach(g => {
      const opt = document.createElement('option');
      opt.value = g.id;
      opt.textContent = g.name;
      if(g.id === gift.reservedById) opt.selected = true;
      reserveSelect.appendChild(opt);
    });
    reserveSelect.addEventListener('change', () => setGiftReservation(gift.id, reserveSelect.value));

    actions.appendChild(reserveSelect);

    // If gift supports sizes, add inline size inputs when a guest is selected
    if(gift.sizesSupported){
      const sizeForm = document.createElement('div');
      sizeForm.className = 'size-form';
      sizeForm.style.display = 'none';
      const sizeKeys = ['RN','P','M','G'];
      sizeKeys.forEach(k => {
        const inp = document.createElement('input');
        inp.type = 'number'; inp.min = '0'; inp.value = '0'; inp.placeholder = k; inp.className = 'size-input';
        inp.dataset.size = k;
        sizeForm.appendChild(inp);
      });
      const sendUnitsBtn = document.createElement('button');
      sendUnitsBtn.textContent = 'Enviar presente';
      sendUnitsBtn.addEventListener('click', (ev)=>{
        ev.preventDefault();
        const guestId = reserveSelect.value;
        if(!guestId) return alert('Escolha um convidado para enviar a confirmação do presente.');
        const sizes = {};
        Array.from(sizeForm.querySelectorAll('.size-input')).forEach(i=>{ sizes[i.dataset.size]= Number(i.value) || 0; });
        addOrUpdateSizeReservation(gift.id, guestId, sizes);
        alert('Confirmação do presente enviada. Obrigado!');
      });
      sizeForm.appendChild(sendUnitsBtn);
      actions.appendChild(sizeForm);
      reserveSelect.addEventListener('change', ()=>{
        sizeForm.style.display = reserveSelect.value ? 'flex' : 'none';
      });
    } else {
      // For non-size gifts: explicit send button
      const sendGiftBtn = document.createElement('button');
      sendGiftBtn.textContent = 'Enviar presente';
      sendGiftBtn.addEventListener('click', (ev)=>{
        ev.preventDefault();
        const guestId = reserveSelect.value;
        if(!guestId) return alert('Escolha um convidado para enviar a confirmação do presente.');
        setGiftReservation(gift.id, guestId);
        alert('Confirmação do presente enviada. Obrigado!');
      });
      actions.appendChild(sendGiftBtn);
    }

    const purchasedBtn = document.createElement('button');
    purchasedBtn.textContent = gift.purchased ? 'Desmarcar comprado' : 'Marcar comprado';
    purchasedBtn.addEventListener('click', () => togglePurchased(gift.id));

    const removeBtn = document.createElement('button');
    removeBtn.textContent = 'Remover';
    removeBtn.addEventListener('click', () => removeGift(gift.id));

    actions.appendChild(purchasedBtn);
    actions.appendChild(removeBtn);

    li.appendChild(left);
    li.appendChild(actions);
    giftList.appendChild(li);
  });
}

function addGift(name){
  const newGift = {id: Date.now().toString(), name: name.trim(), reservedById: '', purchased: false, sizesSupported: false, reservations: []};
  gifts.push(newGift);
  saveState();
  renderGifts();
}

function addOrUpdateSizeReservation(giftId, guestId, sizes){
  const gIndex = gifts.findIndex(g => g.id === giftId);
  if(gIndex === -1) return;
  const gift = gifts[gIndex];
  gift.reservations = gift.reservations || [];
  const rIndex = gift.reservations.findIndex(r => r.guestId === guestId);
  if(rIndex === -1){
    gift.reservations.push({guestId, sizes});
  } else {
    gift.reservations[rIndex].sizes = sizes;
  }
  saveState();
  renderGifts();
}

function setGiftReservation(id, guestId){
  const index = gifts.findIndex(g => g.id === id);
  if(index === -1) return;
  if(!guestId){
    gifts[index].reservedById = '';
  } else {
    const guestExists = guests.some(g => g.id === guestId);
    if(!guestExists) return;
    gifts[index].reservedById = guestId;
  }
  saveState();
  renderGifts();
}

function togglePurchased(id){
  const index = gifts.findIndex(g => g.id === id);
  if(index === -1) return;
  gifts[index].purchased = !gifts[index].purchased;
  saveState();
  renderGifts();
}

function removeGift(id){
  gifts = gifts.filter(g => g.id !== id);
  saveState();
  renderGifts();
}

// Guest form submit
if(guestForm){
  guestForm.addEventListener('submit', event => {
    event.preventDefault();
    const name = guestNameInput.value;
    const rsvp = guestRsvpSelect.value;
    if(!name.trim()) return;
    addGuest(name, rsvp);
    guestForm.reset();
  });
}

// Guest send confirmation button (explicit)
if(guestForm){
  const guestSendBtn = document.createElement('button');
  guestSendBtn.type = 'button';
  guestSendBtn.id = 'guest-send-btn';
  guestSendBtn.className = 'btn btn-primary';
  guestSendBtn.textContent = 'Enviar confirmação';
  guestSendBtn.addEventListener('click', () => {
    const name = guestNameInput.value && guestNameInput.value.trim();
    if(!name){
      alert('Por favor, digite seu nome para confirmar presença.');
      return;
    }
    const existing = guests.find(g => g.name.toLowerCase() === name.toLowerCase());
    if(existing){
      updateGuestRsvp(existing.id, 'confirmado');
    } else {
      addGuest(name, 'confirmado');
    }
    alert('Obrigado! Sua confirmação de presença foi registrada.');
    guestForm.reset();
  });
  const guestFormSubmit = guestForm.querySelector('button[type="submit"]');
  if(guestFormSubmit && guestFormSubmit.parentNode){
    guestFormSubmit.parentNode.appendChild(guestSendBtn);
  }
}

// Gift form submit
if(giftForm){
  giftForm.addEventListener('submit', event => {
    event.preventDefault();
    const name = giftNameInput.value;
    if(!name.trim()) return;
    addGift(name);
    giftForm.reset();
  });
}

// Inicializa render
(async function init(){
  const serverLoaded = await fetchState();
  if (!serverLoaded) {
    loadLocalState();
  }
  renderGuests();
  renderGifts();
})();

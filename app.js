const GUESTS_KEY = 'cha_guests_v1';
const GIFTS_KEY = 'cha_gifts_v1';

const DEFAULT_GIFTS_RAW = [
  // 🍼 Essenciais de higiene
  { nome: "Fraldas descartáveis", descricao: "Tamanhos RN, P e M", link: "#", comprado: false },
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
    purchased: !!raw.comprado || !!raw.purchased
  };
}

let guests = JSON.parse(localStorage.getItem(GUESTS_KEY)) || [];
let gifts = JSON.parse(localStorage.getItem(GIFTS_KEY)) || DEFAULT_GIFTS_RAW.map(makeGiftFromRaw);

const guestForm = document.getElementById('guest-form');
const guestNameInput = document.getElementById('guest-name');
const guestRsvpSelect = document.getElementById('guest-rsvp');
const guestList = document.getElementById('guest-list');

const giftForm = document.getElementById('gift-form');
const giftNameInput = document.getElementById('gift-name');
const giftList = document.getElementById('gift-list');

function saveState(){
  localStorage.setItem(GUESTS_KEY, JSON.stringify(guests));
  localStorage.setItem(GIFTS_KEY, JSON.stringify(gifts));
}

function renderGuests(){
  guestList.innerHTML = '';
  guests.forEach(guest => {
    const li = document.createElement('li');
    const left = document.createElement('div');
    left.className = 'item-left';
    const name = document.createElement('div');
    name.textContent = guest.name;
    const status = document.createElement('div');
    status.className = 'muted';
    status.textContent = guest.rsvp;
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
  const newGuest = {id: Date.now().toString(), name: name.trim(), rsvp};
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
    const link = document.createElement('div');
    if(gift.link){
      const a = document.createElement('a');
      a.href = gift.link;
      a.textContent = 'Ver produto';
      a.target = '_blank';
      link.appendChild(a);
    }
    const reserved = document.createElement('div');
    reserved.className = 'muted';
    const reserverName = gift.reservedById ? (guests.find(g => g.id === gift.reservedById) || {}).name : '';
    reserved.textContent = reserverName ? `Reservado por: ${reserverName}` : '';
    left.appendChild(title);
    left.appendChild(desc);
    left.appendChild(link);
    left.appendChild(reserved);

    const actions = document.createElement('div');
    actions.className = 'actions';

    // Reserve select (inline) — melhora UX: escolha um convidado para reservar
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

    const purchasedBtn = document.createElement('button');
    purchasedBtn.textContent = gift.purchased ? 'Desmarcar comprado' : 'Marcar comprado';
    purchasedBtn.addEventListener('click', () => togglePurchased(gift.id));

    const removeBtn = document.createElement('button');
    removeBtn.textContent = 'Remover';
    removeBtn.addEventListener('click', () => removeGift(gift.id));

    actions.appendChild(reserveSelect);
    actions.appendChild(purchasedBtn);
    actions.appendChild(removeBtn);

    li.appendChild(left);
    li.appendChild(actions);
    giftList.appendChild(li);
  });
}

function addGift(name){
  const newGift = {id: Date.now().toString(), name: name.trim(), reservedById: '', purchased: false};
  gifts.push(newGift);
  saveState();
  renderGifts();
}

function setGiftReservation(id, guestId){
  const index = gifts.findIndex(g => g.id === id);
  if(index === -1) return;
  if(!guestId){
    gifts[index].reservedById = '';
  } else {
    // ensure guest exists (defensive)
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

guestForm.addEventListener('submit', event => {
  event.preventDefault();
  const name = guestNameInput.value;
  const rsvp = guestRsvpSelect.value;
  if(!name.trim()) return;
  addGuest(name, rsvp);
  guestForm.reset();
});

giftForm.addEventListener('submit', event => {
  event.preventDefault();
  const name = giftNameInput.value;
  if(!name.trim()) return;
  addGift(name);
  giftForm.reset();
});

// Inicializa render
renderGuests();
renderGifts();

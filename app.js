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
  const links = Array.isArray(raw.links)
    ? raw.links
    : typeof raw.links === 'string'
      ? raw.links.split('\n').map(link => link.trim()).filter(Boolean)
      : raw.link
        ? [raw.link]
        : [];

  return {
    id: Date.now().toString(36) + Math.random().toString(36).slice(2,8),
    name: raw.nome || raw.name || 'Presente',
    description: raw.descricao || raw.description || '',
    imageUrl: raw.imageUrl || raw.imagem || raw.foto || '',
    sizeLabel: raw.sizeLabel || raw.tamanho || '',
    quantityDesired: Number(raw.quantityDesired || raw.quantidade || raw.quantity || 1) || 1,
    links,
    link: raw.link || raw.url || '',
    reservedById: raw.reservedById || '',
    purchased: !!raw.comprado || !!raw.purchased || false,
    sizesSupported: !!raw.sizesSupported,
    reservations: raw.reservations || []
  };
}

let guests = [];
let gifts = [];

function getGuestNameById(guestId) {
  if (!guestId) return 'Convidado';
  return (guests.find(g => g.id === guestId) || {}).name || 'Convidado';
}

function getGiftReservations(gift) {
  return Array.isArray(gift.reservations) ? gift.reservations : [];
}

function getReservationsForSize(gift, sizeKey) {
  return getGiftReservations(gift)
    .filter(entry => Number(entry?.sizes?.[sizeKey] || 0) > 0)
    .map(entry => ({
      guestId: entry.guestId,
      name: getGuestNameById(entry.guestId),
      quantity: Number(entry.sizes?.[sizeKey] || 0)
    }));
}

function getReservationsForGift(gift) {
  return getGiftReservations(gift)
    .filter(entry => Number(entry?.quantity || 0) > 0)
    .map(entry => ({
      guestId: entry.guestId,
      name: getGuestNameById(entry.guestId),
      quantity: Number(entry.quantity || 0)
    }));
}

function addReservationForGift(giftId, guestId, quantity, sizeKey = null) {
  const giftIndex = gifts.findIndex(g => g.id === giftId);
  if (giftIndex === -1 || !guestId) return;

  const gift = gifts[giftIndex];
  const parsedQuantity = Number(quantity || 0);
  if (parsedQuantity <= 0) return;

  gift.reservations = Array.isArray(gift.reservations) ? gift.reservations : [];
  const existing = gift.reservations.find(entry => entry.guestId === guestId);

  if (sizeKey) {
    if (existing) {
      const sizes = { ...(existing.sizes || {}) };
      sizes[sizeKey] = (Number(sizes[sizeKey] || 0) + parsedQuantity);
      existing.sizes = sizes;
    } else {
      gift.reservations.push({ guestId, sizes: { [sizeKey]: parsedQuantity } });
    }
  } else {
    if (existing) {
      existing.quantity = (Number(existing.quantity || 0) + parsedQuantity);
    } else {
      gift.reservations.push({ guestId, quantity: parsedQuantity });
    }
  }

  saveState();
  renderGifts();
}

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
const guestCityInput = document.getElementById('guest-city');
const guestList = document.getElementById('guest-list');
const guestConfirmationMessage = document.getElementById('guest-confirmation-message');
const presentesButtonContainer = document.getElementById('presentes-button-container');

const giftForm = document.getElementById('gift-form');
const giftNameInput = document.getElementById('gift-name');
const giftDescriptionInput = document.getElementById('gift-description');
const giftSizeRadios = document.querySelectorAll('input[name="gift-size"]');
const giftQuantityInput = document.getElementById('gift-quantity');
const giftImageInput = document.getElementById('gift-image');
const giftLinksInput = document.getElementById('gift-links');
const giftList = document.getElementById('gift-list');

const hasGuestSection = !!guestList;
const hasGiftSection = !!giftList;

function saveState(){
  persistState();
}

function renderGuests(){
  if(!hasGuestSection) return;

  const isAdminSection = guestList.dataset.role === 'admin';
  if(isAdminSection){
    guestList.innerHTML = '';
    if(!guests.length){
      const empty = document.createElement('li');
      empty.textContent = 'Nenhum convidado cadastrado.';
      guestList.appendChild(empty);
      return;
    }
    guests.forEach(guest => {
      const li = document.createElement('li');
      li.textContent = guest.name;
      guestList.appendChild(li);
    });
    return;
  }

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

function showGuestConfirmationMessage(){
  if(guestConfirmationMessage){
    guestConfirmationMessage.textContent = 'Ótimo, contamos com você!';
    guestConfirmationMessage.style.display = 'block';
  }
  if(presentesButtonContainer){
    presentesButtonContainer.style.display = 'block';
  }
}

function addGuest(name, city, rsvp){
  const newGuest = {
    id: Date.now().toString(),
    name: name.trim(),
    city: city.trim(),
    rsvp: rsvp || 'pendente'
  };
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
    li.className = 'gift-item';

    const card = document.createElement('div');
    card.className = 'gift-card';

    const header = document.createElement('div');
    header.className = 'gift-header';

    const info = document.createElement('div');
    info.className = 'gift-info';

    const titleRow = document.createElement('div');
    titleRow.className = 'gift-title-row';
    const title = document.createElement('div');
    title.className = 'gift-title';
    title.textContent = gift.name;
    if(gift.purchased){
      const badge = document.createElement('span');
      badge.className = 'gift-badge';
      badge.textContent = 'Comprado';
      titleRow.appendChild(title);
      titleRow.appendChild(badge);
    } else {
      titleRow.appendChild(title);
    }

    const desc = document.createElement('div');
    desc.className = 'gift-meta';
    desc.textContent = gift.description || '';

    const linkWrap = document.createElement('div');
    linkWrap.className = 'gift-meta';
    if((gift.links && gift.links.length) || gift.link){
      const title = document.createElement('div');
      title.textContent = 'Links de compra:';
      title.style.fontWeight = '600';
      title.style.marginBottom = '6px';
      linkWrap.appendChild(title);

      const linkList = document.createElement('ul');
      linkList.className = 'gift-links';
      const links = gift.links && gift.links.length ? gift.links : gift.link ? [gift.link] : [];
      links.forEach(url => {
        const item = document.createElement('li');
        const a = document.createElement('a');
        a.href = url;
        a.textContent = url.replace(/^https?:\/\//, '');
        a.target = '_blank';
        item.appendChild(a);
        linkList.appendChild(item);
      });
      linkWrap.appendChild(linkList);
    }

    if(gift.imageUrl){
      const image = document.createElement('img');
      image.src = gift.imageUrl;
      image.alt = `Imagem do presente ${gift.name}`;
      image.className = 'gift-image';
      card.appendChild(image);
    }

    info.appendChild(titleRow);
    info.appendChild(desc);
    if(gift.sizeLabel){
      const sizeMeta = document.createElement('div');
      sizeMeta.className = 'gift-meta';
      sizeMeta.textContent = `Tamanho: ${gift.sizeLabel}`;
      info.appendChild(sizeMeta);
    }
    const quantityMeta = document.createElement('div');
    quantityMeta.className = 'gift-meta';
    quantityMeta.textContent = `Quantidade desejada: ${gift.quantityDesired || 1}`;
    info.appendChild(quantityMeta);
    info.appendChild(linkWrap);

    const actions = document.createElement('div');
    actions.className = 'gift-actions';

    const purchasedBtn = document.createElement('button');
    purchasedBtn.className = 'btn btn-secondary';
    purchasedBtn.textContent = gift.purchased ? 'Desmarcar comprado' : 'Marcar comprado';
    purchasedBtn.addEventListener('click', () => togglePurchased(gift.id));

    const removeBtn = document.createElement('button');
    removeBtn.className = 'btn';
    removeBtn.textContent = 'Remover';
    removeBtn.addEventListener('click', () => removeGift(gift.id));

    actions.appendChild(purchasedBtn);
    actions.appendChild(removeBtn);

    header.appendChild(info);
    header.appendChild(actions);

    card.appendChild(header);

    if(gift.sizesSupported){
      const rows = document.createElement('ul');
      rows.className = 'gift-rows';

      ['RN','P','M','G'].forEach(sizeKey => {
        const row = document.createElement('li');
        row.className = 'gift-row';

        const label = document.createElement('div');
        label.className = 'gift-row-label';
        label.textContent = `Fralda ${sizeKey}`;

        const entries = getReservationsForSize(gift, sizeKey);
        const totalQty = entries.reduce((sum, entry) => sum + entry.quantity, 0);
        const summary = document.createElement('div');
        summary.className = 'gift-row-meta';
        summary.textContent = entries.length
          ? `${entries.length} pessoa${entries.length === 1 ? '' : 's'} • ${totalQty} unidade${totalQty === 1 ? '' : 's'}`
          : 'Sem reservas';

        const helper = document.createElement('div');
        helper.className = 'help-wrap';
        const helpBtn = document.createElement('button');
        helpBtn.className = 'help-btn';
        helpBtn.type = 'button';
        helpBtn.textContent = '?';

        const tooltip = document.createElement('div');
        tooltip.className = 'help-tooltip';
        tooltip.style.display = 'none';
        const list = document.createElement('ul');
        list.className = 'tooltip-list';
        if(entries.length){
          entries.forEach(entry => {
            const li2 = document.createElement('li');
            li2.textContent = `${entry.name}: ${entry.quantity}`;
            list.appendChild(li2);
          });
        } else {
          const none = document.createElement('li');
          none.textContent = '— nenhuma reserva —';
          list.appendChild(none);
        }
        tooltip.appendChild(list);
        helpBtn.addEventListener('click', (event) => {
          event.stopPropagation();
          tooltip.style.display = tooltip.style.display === 'none' ? 'block' : 'none';
        });
        helper.appendChild(helpBtn);
        helper.appendChild(tooltip);

        const controls = document.createElement('div');
        controls.className = 'gift-row-controls';

        const guestSelect = document.createElement('select');
        const placeholderOpt = document.createElement('option');
        placeholderOpt.value = '';
        placeholderOpt.textContent = guests.length ? '-- escolher --' : '-- sem convidados --';
        guestSelect.appendChild(placeholderOpt);
        guests.forEach(guest => {
          const option = document.createElement('option');
          option.value = guest.id;
          option.textContent = guest.name;
          guestSelect.appendChild(option);
        });
        if(!guests.length){
          guestSelect.disabled = true;
        }

        const qtyInput = document.createElement('input');
        qtyInput.type = 'number';
        qtyInput.min = '1';
        qtyInput.value = '1';
        qtyInput.className = 'size-input';
        qtyInput.placeholder = 'Qtd';

        const reserveBtn = document.createElement('button');
        reserveBtn.className = 'btn btn-small';
        reserveBtn.type = 'button';
        reserveBtn.textContent = 'Reservar';
        reserveBtn.addEventListener('click', () => {
          const guestId = guestSelect.value;
          if(!guestId) return;
          addReservationForGift(gift.id, guestId, qtyInput.value, sizeKey);
        });

        controls.appendChild(guestSelect);
        controls.appendChild(qtyInput);
        controls.appendChild(reserveBtn);

        row.appendChild(label);
        row.appendChild(summary);
        row.appendChild(helper);
        row.appendChild(controls);
        rows.appendChild(row);
      });

      card.appendChild(rows);
    } else {
      const row = document.createElement('div');
      row.className = 'gift-row';

      const entries = getReservationsForGift(gift);
      const totalQty = entries.reduce((sum, entry) => sum + entry.quantity, 0);
      const summary = document.createElement('div');
      summary.className = 'gift-row-meta';
      summary.textContent = entries.length
        ? `${entries.length} pessoa${entries.length === 1 ? '' : 's'} • ${totalQty} unidade${totalQty === 1 ? '' : 's'}`
        : 'Sem reservas';

      const helper = document.createElement('div');
      helper.className = 'help-wrap';
      const helpBtn = document.createElement('button');
      helpBtn.className = 'help-btn';
      helpBtn.type = 'button';
      helpBtn.textContent = '?';
      const tooltip = document.createElement('div');
      tooltip.className = 'help-tooltip';
      tooltip.style.display = 'none';
      const list = document.createElement('ul');
      list.className = 'tooltip-list';
      if(entries.length){
        entries.forEach(entry => {
          const li2 = document.createElement('li');
          li2.textContent = `${entry.name}: ${entry.quantity}`;
          list.appendChild(li2);
        });
      } else {
        const none = document.createElement('li');
        none.textContent = '— nenhuma reserva —';
        list.appendChild(none);
      }
      tooltip.appendChild(list);
      helpBtn.addEventListener('click', (event) => {
        event.stopPropagation();
        tooltip.style.display = tooltip.style.display === 'none' ? 'block' : 'none';
      });
      helper.appendChild(helpBtn);
      helper.appendChild(tooltip);

      const controls = document.createElement('div');
      controls.className = 'gift-row-controls';
      const guestSelect = document.createElement('select');
      const placeholderOpt = document.createElement('option');
      placeholderOpt.value = '';
      placeholderOpt.textContent = guests.length ? '-- escolher --' : '-- sem convidados --';
      guestSelect.appendChild(placeholderOpt);
      guests.forEach(guest => {
        const option = document.createElement('option');
        option.value = guest.id;
        option.textContent = guest.name;
        guestSelect.appendChild(option);
      });
      if(!guests.length){
        guestSelect.disabled = true;
      }

      const qtyInput = document.createElement('input');
      qtyInput.type = 'number';
      qtyInput.min = '1';
      qtyInput.value = '1';
      qtyInput.className = 'size-input';
      qtyInput.placeholder = 'Qtd';

      const reserveBtn = document.createElement('button');
      reserveBtn.className = 'btn btn-small';
      reserveBtn.type = 'button';
      reserveBtn.textContent = 'Reservar';
      reserveBtn.addEventListener('click', () => {
        const guestId = guestSelect.value;
        if(!guestId) return;
        addReservationForGift(gift.id, guestId, qtyInput.value);
      });

      controls.appendChild(guestSelect);
      controls.appendChild(qtyInput);
      controls.appendChild(reserveBtn);

      row.appendChild(summary);
      row.appendChild(helper);
      row.appendChild(controls);
      card.appendChild(row);
    }

    li.appendChild(card);
    giftList.appendChild(li);
  });
}

function addGift({ name, description = '', imageUrl = '', sizeLabel = '', quantityDesired = 1, links = [], sizesSupported = false }){
  const newGift = {
    id: Date.now().toString(),
    name: name.trim(),
    description: description.trim(),
    imageUrl: imageUrl.trim(),
    sizeLabel: sizeLabel.trim(),
    quantityDesired: Number(quantityDesired) || 1,
    links: Array.isArray(links) ? links.filter(Boolean) : [],
    link: links && links.length ? links[0] : '',
    reservedById: '',
    purchased: false,
    sizesSupported,
    reservations: []
  };
  gifts.push(newGift);
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
    const city = guestCityInput.value;
    if(!name.trim() || !city.trim()) return;
    addGuest(name, city, 'confirmado');
    showGuestConfirmationMessage();
    guestForm.reset();
  });
}

// Gift form submit
if(giftForm){
  giftForm.addEventListener('submit', event => {
    event.preventDefault();
    const name = giftNameInput.value;
    if(!name.trim()) return;

    const description = giftDescriptionInput.value;
    const sizeLabel = Array.from(giftSizeRadios).find(radio => radio.checked)?.value || '';
    const quantityDesired = giftQuantityInput.value;
    const imageUrl = giftImageInput.value;
    const links = (giftLinksInput.value || '')
      .split('\n')
      .map(line => line.trim())
      .filter(Boolean);

    addGift({
      name,
      description,
      sizeLabel,
      quantityDesired,
      imageUrl,
      links
    });

    giftForm.reset();
    giftQuantityInput.value = '1';
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

const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;
const dbPath = path.join(__dirname, 'data.sqlite');
const db = new sqlite3.Database(dbPath);

const DEFAULT_GIFTS_RAW = [
  { nome: 'Fraldas descartáveis', descricao: 'Tamanhos RN, P, M e G', link: '#', comprado: false, sizesSupported: true },
  { nome: 'Fralda de pano', descricao: 'Para limpar e proteger roupas', link: '#', comprado: false },
  { nome: 'Toalhas com capuz', descricao: 'Para sair do banho quentinho', link: '#', comprado: false },
  { nome: 'Cueiros', descricao: 'Leves, para embrulhar o bebê', link: '#', comprado: false },
  { nome: 'Bodies', descricao: 'Manga curta e longa', link: '#', comprado: false },
  { nome: 'Macacões', descricao: 'Práticos para dormir e passear', link: '#', comprado: false },
  { nome: 'Mijões', descricao: 'Calças confortáveis com pé', link: '#', comprado: false },
  { nome: 'Meias', descricao: 'Para manter os pés aquecidos', link: '#', comprado: false },
  { nome: 'Mantinhas', descricao: 'Leves e quentinhas', link: '#', comprado: false },
  { nome: 'Babadores', descricao: 'Evita sujeira nas roupas', link: '#', comprado: false },
  { nome: 'Lenços umedecidos', descricao: 'Sempre úteis fora de casa', link: '#', comprado: false }
];

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname)));

function runAsync(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) return reject(err);
      resolve(this);
    });
  });
}

function allAsync(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) return reject(err);
      resolve(rows);
    });
  });
}

async function initDatabase() {
  await runAsync(`CREATE TABLE IF NOT EXISTS guests (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    rsvp TEXT NOT NULL
  )`);

  await runAsync(`CREATE TABLE IF NOT EXISTS gifts (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    link TEXT,
    reservedById TEXT,
    purchased INTEGER NOT NULL DEFAULT 0,
    sizesSupported INTEGER NOT NULL DEFAULT 0,
    reservations TEXT
  )`);

  const rows = await allAsync('SELECT COUNT(*) AS count FROM gifts');
  if (rows[0].count === 0) {
    const stmt = db.prepare(`INSERT INTO gifts (id, name, description, link, reservedById, purchased, sizesSupported, reservations) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`);
    DEFAULT_GIFTS_RAW.forEach(raw => {
      const id = Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
      stmt.run(
        id,
        raw.nome,
        raw.descricao || '',
        raw.link || '',
        '',
        raw.comprado ? 1 : 0,
        raw.sizesSupported ? 1 : 0,
        JSON.stringify([])
      );
    });
    stmt.finalize();
  }
}

function normalizeGiftRow(row) {
  return {
    id: row.id,
    name: row.name,
    description: row.description || '',
    link: row.link || '',
    reservedById: row.reservedById || '',
    purchased: !!row.purchased,
    sizesSupported: !!row.sizesSupported,
    reservations: row.reservations ? JSON.parse(row.reservations) : []
  };
}

app.get('/api/state', async (req, res) => {
  try {
    const guests = await allAsync('SELECT * FROM guests ORDER BY rowid');
    const giftRows = await allAsync('SELECT * FROM gifts ORDER BY rowid');
    res.json({
      guests,
      gifts: giftRows.map(normalizeGiftRow)
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/state', async (req, res) => {
  const { guests, gifts } = req.body;
  if (!Array.isArray(guests) || !Array.isArray(gifts)) {
    return res.status(400).json({ error: 'Payload deve conter arrays de guests e gifts' });
  }

  try {
    await runAsync('BEGIN TRANSACTION');
    await runAsync('DELETE FROM guests');
    await runAsync('DELETE FROM gifts');

    const guestStmt = db.prepare('INSERT INTO guests (id, name, rsvp) VALUES (?, ?, ?)');
    guests.forEach(guest => {
      guestStmt.run(guest.id, guest.name, guest.rsvp || 'pendente');
    });
    guestStmt.finalize();

    const giftStmt = db.prepare(`INSERT INTO gifts (id, name, description, link, reservedById, purchased, sizesSupported, reservations) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`);
    gifts.forEach(gift => {
      giftStmt.run(
        gift.id,
        gift.name,
        gift.description || '',
        gift.link || '',
        gift.reservedById || '',
        gift.purchased ? 1 : 0,
        gift.sizesSupported ? 1 : 0,
        JSON.stringify(Array.isArray(gift.reservations) ? gift.reservations : [])
      );
    });
    giftStmt.finalize();

    await runAsync('COMMIT');
    res.json({ saved: true });
  } catch (error) {
    await runAsync('ROLLBACK');
    res.status(500).json({ error: error.message });
  }
});

app.get('*', (req, res) => {
  if (req.path.startsWith('/api')) {
    return res.status(404).json({ error: 'Endpoint não encontrado' });
  }
  res.sendFile(path.join(__dirname, 'index.html'));
});

initDatabase()
  .then(() => {
    app.listen(port, () => {
      console.log(`Servidor iniciado em http://localhost:${port}`);
    });
  })
  .catch(error => {
    console.error('Erro ao iniciar o banco de dados:', error);
    process.exit(1);
  });

// ISLAMCRAFT v1.1 — serveur web avec salles (rooms)
// Version lisible du serveur d'origine + salles + prêt pour l'hébergement.
const express = require('express');
const http = require('http');
const path = require('path');
const { Server } = require('socket.io');

const PORT = process.env.PORT || 3000;
const MAX_PLAYERS = 2;        // joueurs par salle
const TREASURE_COUNT = 12;
const WIN_SCORE = 6;
const MAX_ROOMS = 500;        // protection de la mémoire
const MIN_MOVE_INTERVAL = 15; // ms : évite la vitesse dépendante du taux de rafraîchissement
const ROOM_RE = /^[A-Z0-9]{3,8}$/;

const QUESTIONS = [
  { q: "Combien y a-t-il de piliers de l'islam ?", a: ['4', '5', '6'], c: 1 },
  { q: "Premier pilier de l'islam ?", a: ['Salat', 'Chahada', 'Siyam'], c: 1 },
  { q: 'Livre sacré ?', a: ['Torah', 'Évangile', 'Coran'], c: 2 },
  { q: 'Dernier prophète ?', a: ['Moussa', 'Issa', 'Muhammad'], c: 2 },
  { q: 'Prières obligatoires ?', a: ['3', '5', '7'], c: 1 },
  { q: 'Ange de la révélation ?', a: ['Jibril', 'Mikail', 'Israfil'], c: 0 },
  { q: 'Qibla ?', a: ['Médine', 'Jérusalem', 'La Mecque'], c: 2 },
  { q: 'Mois de jeûne ?', a: ['Chaabane', 'Ramadan', 'Chawwal'], c: 1 },
  { q: 'Aumône obligatoire ?', a: ['Zakat', 'Sadaqa', 'Hajj'], c: 0 },
  { q: 'Piliers de la foi ?', a: ['5', '6', '7'], c: 1 },
  { q: 'Grand pèlerinage ?', a: ['Omra', 'Hajj', 'Ziyara'], c: 1 },
  { q: 'Langue du Coran ?', a: ['Persan', 'Araméen', 'Arabe'], c: 2 },
  { q: 'Jour prière congrégation ?', a: ['Vendredi', 'Samedi', 'Dimanche'], c: 0 },
  { q: 'Paroles du Prophète ?', a: ['Hadiths', 'Tafsirs', 'Fatwas'], c: 0 },
  { q: 'Première sourate ?', a: ['Al-Baqarah', 'Al-Ikhlas', 'Al-Fatiha'], c: 2 },
  { q: 'Ville naissance Prophète ?', a: ['La Mecque', 'Médine', 'Taïf'], c: 0 },
  { q: 'Purification avant prière ?', a: ['Invocation', 'Woudou', 'Boire eau'], c: 1 },
  { q: 'Compagnons ?', a: ['Sahabas', "Tabi'in", 'Ansars'], c: 0 },
  { q: 'Nuit révélation ?', a: ['Miraj', 'Laylat al-Qadr', 'Achoura'], c: 1 },
  { q: 'Premier muezzin ?', a: ['Abou Bakr', 'Ali', 'Bilal'], c: 2 },
];

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });

app.get('/health', (_req, res) => res.send('ok'));
app.use(express.static(path.join(__dirname, '../client')));

const rand = (min, max) => Math.random() * (max - min) + min;

// ---------- Salles ----------
const rooms = new Map();

function createRoom(code) {
  const room = {
    code,
    players: {},
    scores: {},
    treasures: [],
    activeQuestions: {},
    lastMove: {},
    lastCheck: {},
    gameStarted: false,
    gameEnded: false,
    resetTimer: null,
    tick: null,
  };
  // le client attend la position de tous les joueurs ~20 fois par seconde
  room.tick = setInterval(() => io.to(code).emit('players', room.players), 50);
  rooms.set(code, room);
  return room;
}

function destroyRoom(room) {
  clearInterval(room.tick);
  clearTimeout(room.resetTimer);
  rooms.delete(room.code);
}

function generateTreasures(room) {
  room.treasures = [];
  for (let i = 0; i < TREASURE_COUNT; i++) {
    room.treasures.push({ id: i, x: rand(-30, 30), z: rand(-30, 30), taken: false });
  }
}

function resetGame(room) {
  if (!rooms.has(room.code)) return;
  room.gameStarted = false;
  generateTreasures(room);
  room.scores = {};
  for (const id in room.players) room.scores[id] = 0;
  room.activeQuestions = {};
  room.gameEnded = false;
  io.to(room.code).emit('scores', { scores: room.scores, players: room.players });
  io.to(room.code).emit('treasures', room.treasures);
  io.to(room.code).emit('players', room.players);
  io.to(room.code).emit('reset');
}

function checkTreasure(room, id) {
  const p = room.players[id];
  if (!p || room.activeQuestions[id]) return;
  for (const t of room.treasures) {
    if (t.taken) continue;
    if (Math.hypot(p.x - t.x, p.z - t.z) < 1.5) {
      const question = QUESTIONS[Math.floor(Math.random() * QUESTIONS.length)];
      room.activeQuestions[id] = { treasureId: t.id, question };
      io.to(id).emit('question', { treasureId: t.id, question });
      break;
    }
  }
}

function handleMove(room, id, data) {
  const p = room.players[id];
  if (!p || room.gameEnded || !data) return;
  const now = Date.now();
  if (room.lastMove[id] && now - room.lastMove[id] < MIN_MOVE_INTERVAL) return;
  room.lastMove[id] = now;

  const dx = Math.max(-1, Math.min(1, Number(data.dx) || 0));
  const dz = Math.max(-1, Math.min(1, Number(data.dz) || 0));
  p.x += dx * 0.2;
  p.z += dz * 0.2;
  p.rot = Number(data.rot) || 0;
  p.moving = !!data.moving;

  if (!room.lastCheck[id] || now - room.lastCheck[id] > 100) {
    room.lastCheck[id] = now;
    checkTreasure(room, id);
  }
}

function handleAnswer(room, id, data) {
  const active = room.activeQuestions[id];
  if (!active || room.gameEnded) return;
  delete room.activeQuestions[id];
  const t = room.treasures.find((x) => x.id === active.treasureId);
  if (!t || t.taken) return;
  const ans = data && data.answer;
  if (typeof ans === 'number' && ans >= 0 && ans < active.question.a.length && ans === active.question.c) {
    t.taken = true;
    room.scores[id] = (room.scores[id] || 0) + 1;
    io.to(room.code).emit('treasureTaken', t.id);
    io.to(room.code).emit('scores', { scores: room.scores, players: room.players });
    checkVictory(room);
  }
}

function checkVictory(room) {
  if (room.gameEnded) return;
  for (const id in room.scores) {
    if (room.scores[id] >= WIN_SCORE) {
      room.gameEnded = true;
      room.gameStarted = false;
      io.to(room.code).emit('victory', { id, name: (room.players[id] && room.players[id].name) || 'Player' });
      room.resetTimer = setTimeout(() => resetGame(room), 5000);
      break;
    }
  }
}

// ---------- Connexions ----------
io.on('connection', (socket) => {
  const code = String(socket.handshake.query.room || '').toUpperCase();
  if (!ROOM_RE.test(code)) return socket.disconnect();

  let room = rooms.get(code);
  if (!room) {
    if (rooms.size >= MAX_ROOMS) return socket.disconnect();
    room = createRoom(code);
  }
  if (Object.keys(room.players).length >= MAX_PLAYERS) {
    socket.emit('roomFull');
    return socket.disconnect();
  }

  socket.join(code);
  const id = socket.id;
  room.players[id] = { x: 0, z: 0, rot: 0, moving: false, name: null };
  room.scores[id] = 0;
  room.gameEnded = false;

  socket.emit('init', { id });
  socket.emit('treasures', []);
  socket.emit('reset');
  io.to(code).emit('scores', { scores: room.scores, players: room.players });
  io.to(code).emit('players', room.players);

  socket.on('join', (name) => {
    name = String(name || '').trim().slice(0, 20) || 'Player';
    if (room.players[id]) room.players[id].name = name;
    io.to(code).emit('players', room.players);
    const named = Object.values(room.players).filter((p) => p.name).length;
    if (named === MAX_PLAYERS) {
      room.gameStarted = true;
      room.gameEnded = false;
      generateTreasures(room);
      io.to(code).emit('treasures', room.treasures);
      io.to(code).emit('startGame');
    }
  });

  socket.on('move', (d) => handleMove(room, id, d));
  socket.on('answer', (d) => handleAnswer(room, id, d));

  socket.on('disconnect', () => {
    delete room.players[id];
    delete room.scores[id];
    delete room.activeQuestions[id];
    delete room.lastMove[id];
    delete room.lastCheck[id];
    if (Object.keys(room.players).length === 0) return destroyRoom(room);
    io.to(code).emit('players', room.players);
    io.to(code).emit('scores', { scores: room.scores, players: room.players });
    room.gameEnded = false;
    io.to(code).emit('reset');
  });
});

server.listen(PORT, '0.0.0.0', () => {
  console.log('IslamCraft v1.1 running on port ' + PORT);
});

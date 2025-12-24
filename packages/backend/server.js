const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const axios = require('axios');
const qrcode = require('qrcode');
const { v4: uuidv4 } = require('uuid');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "http://localhost:3000", // React dev server
    methods: ["GET", "POST"]
  }
});

app.use(cors());
app.use(express.json());

// In-memory storage for games
const games = {};

io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  // Host creates a game
  socket.on('createGame', (gameSettings) => {
    const gameId = uuidv4();
    games[gameId] = {
      ...gameSettings,
      host: socket.id,
      players: [],
      questions: [],
      currentQuestionIndex: 0,
      scores: {},
      status: 'waiting',
      answers: {} // to store answers for current question
    };
    socket.join(gameId);
    socket.emit('gameCreated', { gameId });
  });

  // Player joins a game
  socket.on('joinGame', ({ gameId, playerName }) => {
    if (games[gameId]) {
      const player = { id: socket.id, name: playerName, score: 0 };
      games[gameId].players.push(player);
      games[gameId].scores[socket.id] = 0;
      socket.join(gameId);
      socket.emit('joinedGame', { gameId });
      io.to(gameId).emit('playerJoined', games[gameId].players);
    } else {
      socket.emit('error', 'Game not found');
    }
  });

  // Host starts the game
  socket.on('startGame', (gameId) => {
    if (games[gameId] && games[gameId].host === socket.id) {
      games[gameId].status = 'active';
      fetchQuestions(gameId).then(() => {
        sendNextQuestion(gameId);
      });
    }
  });

  // Player submits answer
  socket.on('submitAnswer', ({ gameId, answer }) => {
    const game = games[gameId];
    if (game && game.status === 'active') {
      game.answers[socket.id] = answer;
      // Check if all players have answered
      if (Object.keys(game.answers).length === game.players.length) {
        processAnswers(gameId);
      }
    }
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
    // Remove player from games
    for (const gameId in games) {
      games[gameId].players = games[gameId].players.filter(p => p.id !== socket.id);
      delete games[gameId].scores[socket.id];
      io.to(gameId).emit('playerLeft', games[gameId].players);
    }
  });
});

async function fetchQuestions(gameId) {
  const game = games[gameId];
  if (!game) return;
  try {
    const response = await axios.get(`https://opentdb.com/api.php?amount=${game.numQuestions}&category=${game.category}&difficulty=${game.difficulty}&type=multiple`);
    game.questions = response.data.results;
  } catch (error) {
    console.error('Error fetching questions:', error);
  }
}

function sendNextQuestion(gameId) {
  const game = games[gameId];
  if (!game || game.currentQuestionIndex >= game.questions.length) {
    // Game over
    io.to(gameId).emit('gameOver', game.scores);
    return;
  }
  const question = game.questions[game.currentQuestionIndex];
  game.answers = {}; // reset answers
  io.to(gameId).emit('nextQuestion', question);
}

function processAnswers(gameId) {
  const game = games[gameId];
  const question = game.questions[game.currentQuestionIndex];
  const correctAnswer = question.correct_answer;

  // Update scores
  for (const playerId in game.answers) {
    if (game.answers[playerId] === correctAnswer) {
      game.scores[playerId] += 1;
    }
  }

  // Emit scores update to host
  io.to(gameId).emit('scoresUpdate', game.scores);

  // Move to next question
  game.currentQuestionIndex += 1;
  setTimeout(() => sendNextQuestion(gameId), 3000); // 3 second delay
}

app.get('/qr/:gameId', async (req, res) => {
  const gameId = req.params.gameId;
  const joinUrl = `http://localhost:3000/join/${gameId}`;
  try {
    const qrCodeDataURL = await qrcode.toDataURL(joinUrl);
    res.json({ qrCode: qrCodeDataURL });
  } catch (error) {
    res.status(500).json({ error: 'Failed to generate QR code' });
  }
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
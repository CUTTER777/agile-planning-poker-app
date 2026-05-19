const express = require('express');
const { createServer } = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');
const QRCode = require('qrcode');
const path = require('path');

const app = express();
const server = createServer(app);

const PORT = process.env.PORT || 3000;

// Build allowed origins from environment variable or fall back to localhost defaults
const defaultOrigins = [
  `http://localhost:8080`,
  `http://localhost:3000`,
  `http://localhost:${PORT}`
];
const extraOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',').map(o => o.trim()).filter(Boolean)
  : [];
const allowedOrigins = [...defaultOrigins, ...extraOrigins];

const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type"],
    credentials: true
  },
  allowEIO3: true,
  transports: ['polling', 'websocket'],
  pingTimeout: 60000,
  pingInterval: 25000,
  path: '/socket.io/'
});

// Middleware
app.use(cors({
  origin: allowedOrigins,
  credentials: true
}));
app.use(express.json());

// Serve static files from Angular build (for Docker deployment)
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, 'public/browser')));
}

// Health check endpoint for Docker
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() });
});

// In-memory storage for games (in production, use a database)
const games = new Map();
const players = new Map();

// Game model
class Game {
  constructor(config) {
    this.id = uuidv4();
    this.name = config.name;
    this.votingSystem = config.votingSystem;
    this.whoCanReveal = config.whoCanReveal;
    this.whoCanManage = config.whoCanManage;
    this.autoReveal = config.autoReveal;
    this.enableFunFeatures = config.enableFunFeatures;
    this.showAverage = config.showAverage;
    this.showCountdown = config.showCountdown;
    this.players = [];
    this.votes = new Map();
    this.isRevealed = false;
    this.currentIssue = null;
    this.issues = [];
    this.createdAt = new Date();
    this.isModeratorGone = false;
  }

  addPlayer(player) {
    // Check if player with same name already exists
    const existingPlayer = this.players.find(p => p.name.toLowerCase() === player.name.toLowerCase());
    if (existingPlayer) {
      // Update existing player's socket ID
      existingPlayer.socketId = player.socketId;
      return existingPlayer;
    } else {
      // Add new player
      this.players.push(player);
      return player;
    }
  }

  removePlayer(playerId) {
    this.players = this.players.filter(p => p.id !== playerId);
    this.votes.delete(playerId);
  }

  castVote(playerId, vote) {
    this.votes.set(playerId, vote);
    
    // Auto-reveal if enabled and all non-spectator players have voted
    const nonSpectatorPlayers = this.players.filter(p => !p.isSpectator);
    if (this.autoReveal && this.votes.size === nonSpectatorPlayers.length) {
      this.revealVotes();
    }
  }

  revealVotes() {
    this.isRevealed = true;
  }

  resetVotes() {
    this.votes.clear();
    this.isRevealed = false;
  }

  getResults() {
    const votes = Array.from(this.votes.values()).filter(vote => vote !== '?' && vote !== '☕');
    const numericVotes = votes.map(v => parseFloat(v)).filter(v => !isNaN(v));
    
    // Calculate card counts
    const cardCountMap = new Map();
    Array.from(this.votes.values()).forEach(vote => {
      if (vote !== '?' && vote !== '☕') {
        cardCountMap.set(vote, (cardCountMap.get(vote) || 0) + 1);
      }
    });
    
    // Convert to array and sort by count (highest first)
    const cardCounts = Array.from(cardCountMap.entries())
      .map(([card, count]) => ({ card, count }))
      .sort((a, b) => b.count - a.count);
    
    // Find the maximum count for highlighting
    const maxCount = cardCounts.length > 0 ? Math.max(...cardCounts.map(c => c.count)) : 0;
    
    const results = {
      votes: Object.fromEntries(this.votes),
      totalVotes: this.votes.size,
      totalPlayers: this.players.length,
      average: numericVotes.length > 0 ? 
        (numericVotes.reduce((a, b) => a + b, 0) / numericVotes.length).toFixed(1) : null,
      cardCounts: cardCounts,
      maxCount: maxCount
    };

    return results;
  }
}

// Player model
class Player {
  constructor(name, gameId, socketId, isSpectator = false) {
    this.id = uuidv4();
    this.name = name;
    this.gameId = gameId;
    this.socketId = socketId;
    this.isSpectator = isSpectator;
    this.joinedAt = new Date();
  }
}

// Voting systems
const votingSystems = {
  fibonacci: ['0', '1', '2', '3', '5', '8', '13', '21', '34', '55', '89', '?', '☕'],
  tShirt: ['XS', 'S', 'M', 'L', 'XL', 'XXL', '?', '☕'],
  powers: ['0', '1', '2', '4', '8', '16', '32', '64', '?', '☕'],
  sequential: ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '?', '☕']
};

// REST API endpoints
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.post('/api/games', async (req, res) => {
  try {
    const gameConfig = req.body;
    const game = new Game(gameConfig);
    games.set(game.id, game);

    // Generate QR code for the game URL
    const gameUrl = `http://localhost:8080/game/${game.id}`;
    const qrCode = await QRCode.toDataURL(gameUrl);

    res.json({
      gameId: game.id,
      gameUrl: gameUrl,
      qrCode: qrCode
    });
  } catch (error) {
    console.error('Error creating game:', error);
    res.status(500).json({ error: 'Failed to create game' });
  }
});

app.get('/api/games/:gameId', (req, res) => {
  const game = games.get(req.params.gameId);
  if (!game) {
    return res.status(404).json({ error: 'Game not found' });
  }

  res.json({
    id: game.id,
    name: game.name,
    votingSystem: game.votingSystem,
    players: game.players.map(p => ({ id: p.id, name: p.name, isSpectator: p.isSpectator })),
    isRevealed: game.isRevealed,
    currentIssue: game.currentIssue,
    cards: votingSystems[game.votingSystem] || votingSystems.fibonacci
  });
});

app.get('/api/voting-systems', (req, res) => {
  res.json(votingSystems);
});

// Socket.io event handlers
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('join-game', (data) => {
    const { gameId, playerName, isSpectator = false } = data;
    console.log(`Join game request: ${playerName} -> ${gameId} (spectator: ${isSpectator})`);
    
    const game = games.get(gameId);

    if (!game) {
      console.log(`Game ${gameId} not found`);
      socket.emit('error', { message: 'Game not found' });
      return;
    }

    // Check if player with this name already exists in the game
    let existingPlayer = game.players.find(p => p.name.toLowerCase() === playerName.toLowerCase());
    
    if (existingPlayer) {
      // Update existing player's socket connection and spectator status
      existingPlayer.socketId = socket.id;
      const spectatorStatusChanged = existingPlayer.isSpectator !== isSpectator;
      existingPlayer.isSpectator = isSpectator;
      players.set(socket.id, existingPlayer);
      
      socket.join(gameId);
      
      // Send game state to the reconnected player
      socket.emit('game-joined', {
        playerId: existingPlayer.id,
        game: {
          id: game.id,
          name: game.name,
          votingSystem: game.votingSystem,
          players: game.players.map(p => ({ id: p.id, name: p.name, isSpectator: p.isSpectator })),
          isRevealed: game.isRevealed,
          currentIssue: game.currentIssue,
          cards: votingSystems[game.votingSystem] || votingSystems.fibonacci,
          hasVoted: game.votes.has(existingPlayer.id),
          whoCanManage: game.whoCanManage
        }
      });

      // If spectator status changed, broadcast updated player list to all players
      if (spectatorStatusChanged) {
        socket.to(gameId).emit('player-update', {
          players: game.players.map(p => ({ id: p.id, name: p.name, isSpectator: p.isSpectator }))
        });
        console.log(`Player ${playerName} changed spectator status to: ${isSpectator}`);
      }

      // Also send current vote results if votes are revealed
      if (game.isRevealed) {
        const results = game.getResults();
        socket.emit('votes-revealed', results);
      }

      console.log(`Player ${playerName} reconnected to game ${gameId}`);
    } else {
      // Create new player
      const player = new Player(playerName, gameId, socket.id, isSpectator);
      const addedPlayer = game.addPlayer(player);
      players.set(socket.id, addedPlayer);

      socket.join(gameId);
      
      // Send game state to the new player
      socket.emit('game-joined', {
        playerId: addedPlayer.id,
        game: {
          id: game.id,
          name: game.name,
          votingSystem: game.votingSystem,
          players: game.players.map(p => ({ id: p.id, name: p.name, isSpectator: p.isSpectator })),
          isRevealed: game.isRevealed,
          currentIssue: game.currentIssue,
          cards: votingSystems[game.votingSystem] || votingSystems.fibonacci,
          hasVoted: game.votes.has(addedPlayer.id),
          whoCanManage: game.whoCanManage
        }
      });

      // Send current vote results if votes are revealed
      if (game.isRevealed) {
        const results = game.getResults();
        socket.emit('votes-revealed', results);
      }

      // Notify ALL players in the room (including the new player) about updated player list
      io.to(gameId).emit('players-updated', {
        players: game.players.map(p => ({ id: p.id, name: p.name, isSpectator: p.isSpectator }))
      });

      console.log(`Player ${playerName} joined game ${gameId}. Total players: ${game.players.length}`);
    }
  });

  socket.on('cast-vote', (data) => {
    const player = players.get(socket.id);
    if (!player) return;

    // Prevent spectators from voting
    if (player.isSpectator) {
      console.log(`Spectator ${player.name} attempted to vote - blocked`);
      return;
    }

    const game = games.get(player.gameId);
    if (!game) return;

    game.castVote(player.id, data.vote);

    // Notify all players about the vote (without revealing the actual vote)
    const nonSpectatorPlayers = game.players.filter(p => !p.isSpectator);
    io.to(player.gameId).emit('vote-cast', {
      playerId: player.id,
      hasVoted: true,
      allVoted: game.votes.size === nonSpectatorPlayers.length,
      isRevealed: game.isRevealed
    });

    // If auto-reveal is enabled and all voted, send results
    if (game.isRevealed) {
      const results = game.getResults();
      io.to(player.gameId).emit('votes-revealed', results);
    }

    console.log(`Player ${player.name} voted in game ${player.gameId}`);
  });

  socket.on('start-reveal-countdown', () => {
    const player = players.get(socket.id);
    if (!player) return;

    const game = games.get(player.gameId);
    if (!game) return;

    // Check if player has permission to reveal votes
    if (game.whoCanReveal === 'moderator' && player.id !== game.players[0]?.id) {
      socket.emit('error', { message: 'Only moderator can reveal votes' });
      return;
    }

    // Emit countdown event to all players in the game
    io.to(player.gameId).emit('reveal-countdown', { duration: 3000 });
    console.log(`Countdown started for game ${player.gameId}`);
    
    // After 3 seconds, reveal the votes
    setTimeout(() => {
      game.revealVotes();
      const results = game.getResults();
      io.to(player.gameId).emit('votes-revealed', results);
      console.log(`Votes revealed in game ${player.gameId} after countdown`);
    }, 3000);
  });

  socket.on('reveal-votes', () => {
    const player = players.get(socket.id);
    if (!player) return;

    const game = games.get(player.gameId);
    if (!game) return;

    // Check if player has permission to reveal votes
    if (game.whoCanReveal === 'moderator' && player.id !== game.players[0]?.id) {
      socket.emit('error', { message: 'Only moderator can reveal votes' });
      return;
    }

    game.revealVotes();
    const results = game.getResults();

    io.to(player.gameId).emit('votes-revealed', results);
    console.log(`Votes revealed in game ${player.gameId}`);
  });

  socket.on('reset-votes', () => {
    const player = players.get(socket.id);
    if (!player) return;

    const game = games.get(player.gameId);
    if (!game) return;

    // Check if player has permission to reset votes
    if (game.whoCanManage === 'moderator' && player.id !== game.players[0]?.id) {
      socket.emit('error', { message: 'Only moderator can reset votes' });
      return;
    }

    game.resetVotes();

    io.to(player.gameId).emit('votes-reset');
    console.log(`Votes reset in game ${player.gameId}`);
  });

  socket.on('update-game-settings', (settings) => {
    const player = players.get(socket.id);
    if (!player) return;

    const game = games.get(player.gameId);
    if (!game) return;

    // Check if player has permission to update game settings (only moderator)
    if (player.id !== game.players[0]?.id) {
      socket.emit('error', { message: 'Only moderator can update game settings' });
      return;
    }

    // Update game settings
    if (settings.name) game.name = settings.name;
    if (settings.votingSystem) game.votingSystem = settings.votingSystem;
    if (settings.whoCanReveal) game.whoCanReveal = settings.whoCanReveal;
    if (settings.whoCanManage) game.whoCanManage = settings.whoCanManage;

    // Broadcast the updated settings to all players in the game
    io.to(player.gameId).emit('game-settings-updated', {
      name: game.name,
      votingSystem: game.votingSystem,
      whoCanReveal: game.whoCanReveal,
      whoCanManage: game.whoCanManage,
      cards: settings.cards
    });

    console.log(`Game settings updated for game ${player.gameId}:`, settings);
  });

  socket.on('disconnect', () => {
    const player = players.get(socket.id);
    if (player) {
      const game = games.get(player.gameId);
      if (game) {
        const wasModerator = game.whoCanManage === 'moderator' && player.id === game.players[0]?.id;
        
        game.removePlayer(player.id);
        
        // If the moderator left and there are still players, mark game as concluded
        if (wasModerator && game.players.length > 0) {
          game.isModeratorGone = true;
          
          // Notify remaining players that the moderator has left
          socket.to(player.gameId).emit('moderator-left', {
            message: 'The moderator has left the game. The voting has concluded.'
          });
          
          console.log(`Moderator ${player.name} left game ${player.gameId}, marking as concluded`);
        } else {
          // Normal player left, just notify others
          socket.to(player.gameId).emit('player-left', {
            playerId: player.id
          });
        }

        // Clean up empty games
        if (game.players.length === 0) {
          games.delete(player.gameId);
          console.log(`Game ${player.gameId} removed - no players left`);
        }
      }
      
      players.delete(socket.id);
      console.log(`Player ${player.name} disconnected`);
    }
  });
});

// Catch-all handler: send back Angular index.html file (for Docker deployment)
if (process.env.NODE_ENV === 'production') {
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/browser', 'index.html'));
  });
}

server.listen(PORT, () => {
  console.log(`Planning Poker server running on port ${PORT}`);
});
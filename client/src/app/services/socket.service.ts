import { Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { Observable, BehaviorSubject } from 'rxjs';
import { environment } from '../../environments/environment';

export interface GameConfig {
  name: string;
  votingSystem: string;
  whoCanReveal: string;
  whoCanManage: string;
  autoReveal: boolean;
  enableFunFeatures: boolean;
  showAverage: boolean;
  showCountdown: boolean;
}

export interface Player {
  id: string;
  name: string;
  isSpectator: boolean;
}

export interface GameState {
  id: string;
  name: string;
  votingSystem: string;
  players: Player[];
  isRevealed: boolean;
  currentIssue: string | null;
  cards: string[];
  hasVoted: boolean;
  whoCanManage: string;
  isModeratorGone?: boolean;
}

export interface VoteResults {
  votes: { [playerId: string]: string };
  totalVotes: number;
  totalPlayers: number;
  average: number | null;
  cardCounts: { card: string; count: number }[];
  maxCount: number;
}

@Injectable({
  providedIn: 'root'
})
export class SocketService {
  private socket?: Socket;
  private readonly SERVER_URL = environment.serverUrl;

  private gameStateSubject = new BehaviorSubject<GameState | null>(null);
  public gameState$ = this.gameStateSubject.asObservable();

  private playersSubject = new BehaviorSubject<Player[]>([]);
  public players$ = this.playersSubject.asObservable();

  private voteResultsSubject = new BehaviorSubject<VoteResults | null>(null);
  public voteResults$ = this.voteResultsSubject.asObservable();

  private playerVotesSubject = new BehaviorSubject<Set<string>>(new Set());
  public playerVotes$ = this.playerVotesSubject.asObservable();
  
  private countdownSubject = new BehaviorSubject<any>(null);
  public countdown$ = this.countdownSubject.asObservable();

  constructor() {
    // Don't auto-connect - wait for explicit connect() call
  }
  
  connect(): void {
    if (this.socket && this.socket.connected) {
      return; // Already connected
    }
    
    this.socket = io(this.SERVER_URL, {
      autoConnect: false,
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 20000,
      forceNew: true,
      transports: ['polling', 'websocket']
    });
    this.setupEventListeners();
    this.socket.connect();
  }

  private setupEventListeners(): void {
    this.socket!.on('game-joined', (data) => {
      this.gameStateSubject.next(data.game);
      this.playersSubject.next(data.game.players);
    });

    this.socket!.on('player-joined', (data) => {
      const currentPlayers = this.playersSubject.value;
      this.playersSubject.next([...currentPlayers, data.player]);
    });

    this.socket!.on('players-updated', (data) => {
      this.playersSubject.next(data.players);
    });

    this.socket!.on('player-update', (data) => {
      this.playersSubject.next(data.players);
    });

    this.socket!.on('player-left', (data) => {
      const currentPlayers = this.playersSubject.value;
      this.playersSubject.next(currentPlayers.filter(p => p.id !== data.playerId));
    });

    this.socket!.on('moderator-left', (data) => {
      // Update game state to indicate moderator has left
      const currentGame = this.gameStateSubject.value;
      if (currentGame) {
        this.gameStateSubject.next({
          ...currentGame,
          isModeratorGone: true
        });
      }
    });

    this.socket!.on('vote-cast', (data) => {
      // Track which players have voted
      const currentVotes = this.playerVotesSubject.value;
      currentVotes.add(data.playerId);
      this.playerVotesSubject.next(new Set(currentVotes));
      
      const currentGame = this.gameStateSubject.value;
      if (currentGame) {
        this.gameStateSubject.next({
          ...currentGame,
          hasVoted: data.playerId === this.getPlayerId() || currentGame.hasVoted,
          isRevealed: data.isRevealed
        });
      }
    });

    this.socket!.on('votes-revealed', (data) => {
      this.voteResultsSubject.next(data);
      const currentGame = this.gameStateSubject.value;
      if (currentGame) {
        this.gameStateSubject.next({
          ...currentGame,
          isRevealed: true
        });
      }
    });

    this.socket!.on('votes-reset', () => {
      this.voteResultsSubject.next(null);
      this.playerVotesSubject.next(new Set()); // Clear votes tracking
      const currentGame = this.gameStateSubject.value;
      if (currentGame) {
        this.gameStateSubject.next({
          ...currentGame,
          isRevealed: false,
          hasVoted: false
        });
      }
    });

    this.socket!.on('game-settings-updated', (data) => {
      const currentGame = this.gameStateSubject.value;
      if (currentGame) {
        this.gameStateSubject.next({
          ...currentGame,
          name: data.name || currentGame.name,
          votingSystem: data.votingSystem || currentGame.votingSystem,
          cards: data.cards || currentGame.cards,
          whoCanManage: data.whoCanManage || currentGame.whoCanManage
        });
      }
    });
    
    this.socket!.on('reveal-countdown', (data) => {
      this.countdownSubject.next(data);
    });

    this.socket!.on('error', (data) => {
      console.error('Socket error:', data.message);
    });
  }

  joinGame(gameId: string, playerName: string, isSpectator: boolean = false): void {
    if (!this.socket) return;
    this.socket.emit('join-game', { gameId, playerName, isSpectator });
  }

  castVote(vote: string): void {
    if (!this.socket) return;
    this.socket.emit('cast-vote', { vote });
  }

  startRevealCountdown(): void {
    if (!this.socket) return;
    this.socket.emit('start-reveal-countdown');
  }
  
  revealVotes(): void {
    if (!this.socket) return;
    this.socket.emit('reveal-votes');
  }

  resetVotes(): void {
    if (!this.socket) return;
    this.socket.emit('reset-votes');
  }

  updateGameSettings(settings: any): void {
    if (!this.socket) return;
    this.socket.emit('update-game-settings', settings);
  }

  resetState(): void {
    // Reset all BehaviorSubject state
    this.gameStateSubject.next(null);
    this.playersSubject.next([]);
    this.voteResultsSubject.next(null);
    this.playerVotesSubject.next(new Set());
    this.countdownSubject.next(null);
  }

  reconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
    }
    this.connect();
  }

  disconnect(): void {
    // Reset all state when disconnecting
    this.resetState();
    
    if (this.socket) {
      this.socket.disconnect();
    }
  }

  private getPlayerId(): string {
    // This would typically be stored when joining the game
    return localStorage.getItem('playerId') || '';
  }

  setPlayerId(id: string): void {
    localStorage.setItem('playerId', id);
  }
}
import { Component, OnInit, OnDestroy, ViewChild, ElementRef, AfterViewInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { SocketService, GameState, Player, VoteResults } from '../../services/socket.service';
import { GameService } from '../../services/game.service';

@Component({
  selector: 'app-game-session',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './game-session.component.html',
  styleUrl: './game-session.component.scss'
})
export class GameSessionComponent implements OnInit, OnDestroy {
  gameState: GameState | null = null;
  players: Player[] = [];
  voteResults: VoteResults | null = null;
  playerVotes: Set<string> = new Set();
  revealingPlayerIds: Set<string> = new Set();

  gameId: string = '';
  playerId: string = '';
  nameForm: FormGroup;
  editGameForm: FormGroup;
  
  selectedCard: string = '';
  showInviteModal = false;
  showWelcomeModal = true;
  showEditGameModal = false;
  gameUrl = '';
  qrCodeData = '';
  showQrCode = false;
  isSpectator = false;
  showUserMenu = false;
  isDarkMode = false;
  
  isSaving = false;
  
  // Custom cursor properties
  cursorX = 0;
  cursorY = 0;
  showCustomCursor = false;
  
  // Countdown properties
  showCountdown = false;
  countdownValue = 3;
  private countdownInterval?: number;

  private subscriptions: Subscription[] = [];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private socketService: SocketService,
    private gameService: GameService,
    private fb: FormBuilder
  ) {
    // Force welcome modal to show
    this.showWelcomeModal = true;
    
    this.nameForm = this.fb.group({
      playerName: ['', [Validators.required, Validators.minLength(1)]],
      isSpectator: [false]
    });
    
    this.editGameForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(1)]],
      votingSystem: ['fibonacci'],
      whoCanReveal: ['moderator']
    });
  }

  ngOnInit(): void {
    this.gameId = this.route.snapshot.paramMap.get('id') || '';
    
    if (!this.gameId) {
      this.router.navigate(['/']);
      return;
    }

    // Reset socket state to ensure clean start
    this.socketService.resetState();
    
    // Ensure socket is connected for new game
    this.socketService.reconnect();
    
    // Force welcome modal to show - multiple assignments to be sure
    this.showWelcomeModal = true;
    
    // Clear ALL localStorage data to start fresh
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
      if (key.startsWith('player_') || key.startsWith('playerId_')) {
        localStorage.removeItem(key);
      }
    });
    
    // Force welcome modal again
    this.showWelcomeModal = true;

    // Load dark mode preference
    const savedDarkMode = localStorage.getItem('darkMode');
    if (savedDarkMode === 'true') {
      this.isDarkMode = true;
      document.body.classList.add('dark-mode');
    }

    this.gameUrl = `${window.location.origin}/game/${this.gameId}`;
    
    // Always show welcome modal for new games - multiple forced assignments
    this.showWelcomeModal = true;
    
    // Pre-populate name input with cookie value if available
    const cookieName = this.getCookie('playerName');
    if (cookieName) {
      this.nameForm.patchValue({ playerName: cookieName });
    }
    
    // Subscribe to socket events
    this.subscriptions.push(
      this.socketService.gameState$.subscribe(gameState => {
        if (gameState) {
          this.gameState = gameState;
          // Only hide welcome modal if we have both gameState and playerId (successful connection)
          if (this.playerId) {
            this.showWelcomeModal = false;
          }
        }
        // Don't change showWelcomeModal when gameState is null - let it stay true
      })
    );

    this.subscriptions.push(
      this.socketService.players$.subscribe(players => {
        this.players = players;
      })
    );

    this.subscriptions.push(
      this.socketService.voteResults$.subscribe(results => {
        const wasRevealed = this.voteResults !== null;
        this.voteResults = results;
        if (results !== null && !wasRevealed) {
          this.triggerRevealAnimation();
        }
        if (results === null) {
          this.selectedCard = '';
          this.revealingPlayerIds.clear();
        }
      })
    );

    this.subscriptions.push(
      this.socketService.playerVotes$.subscribe(votes => {
        this.playerVotes = votes;
      })
    );
    
    // Listen for countdown events
    this.subscriptions.push(
      this.socketService.countdown$.subscribe(countdownData => {
        if (countdownData) {
          this.startCountdown();
        }
      })
    );
  }  
  @HostListener('mousemove', ['$event'])
  onMouseMove(event: MouseEvent): void {
    this.cursorX = event.clientX;
    this.cursorY = event.clientY;
  }
  
  onCardHover(isHovering: boolean): void {
    this.showCustomCursor = isHovering;
  }
  private triggerRevealAnimation(): void {
    this.revealingPlayerIds.clear();
    this.players.forEach((player, i) => {
      setTimeout(() => {
        this.revealingPlayerIds.add(player.id);
      }, i * 120);
    });
  }

  private startCountdown(): void {
    this.showCountdown = true;
    this.countdownValue = 3;
    
    this.countdownInterval = window.setInterval(() => {
      this.countdownValue--;
      
      if (this.countdownValue <= 0) {
        this.hideCountdown();
      }
    }, 1000);
  }
  
  private hideCountdown(): void {
    this.showCountdown = false;
    if (this.countdownInterval) {
      clearInterval(this.countdownInterval);
      this.countdownInterval = undefined;
    }
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
    this.hideCountdown();
    this.socketService.resetState();
    this.socketService.disconnect();
  }

  joinGame(): void {
    if (this.nameForm.invalid) return;

    const playerName = this.nameForm.get('playerName')?.value;
    const isSpectator = this.nameForm.get('isSpectator')?.value || false;
    
    if (!playerName?.trim()) return;

    // Save player name in cookie for future use
    this.setCookie('playerName', playerName.trim(), 365);
    
    // Set spectator mode
    this.isSpectator = isSpectator;

    // Check if this player name is already in the game
    const existingPlayer = this.players.find(p => p.name.toLowerCase() === playerName.toLowerCase());
    if (existingPlayer) {
      // Use existing player session
      this.playerId = existingPlayer.id;
      localStorage.setItem(`player_${this.gameId}`, playerName);
      localStorage.setItem(`playerId_${this.gameId}`, existingPlayer.id);
      this.showWelcomeModal = false;
      return;
    }

    // Create new player session
    localStorage.setItem(`player_${this.gameId}`, playerName);
    this.socketService.joinGame(this.gameId, playerName, isSpectator);
    this.showWelcomeModal = false;

    // Listen for successful join to store player ID
    const joinSub = this.socketService.gameState$.subscribe(gameState => {
      if (gameState && !this.playerId) {
        // Find this player in the players list to get their ID
        const currentPlayer = this.players.find(p => p.name === playerName);
        if (currentPlayer) {
          this.playerId = currentPlayer.id;
          localStorage.setItem(`playerId_${this.gameId}`, currentPlayer.id);
          joinSub.unsubscribe();
        }
      }
    });
  }

  joinExistingSession(playerName: string): void {
    // Rejoin existing session without creating a new player
    this.socketService.joinGame(this.gameId, playerName);
  }

  get playerName(): string {
    return this.nameForm.get('playerName')?.value || '';
  }

  selectCard(card: string): void {
    if (this.gameState?.isRevealed) return;
    
    this.selectedCard = card;
    this.socketService.castVote(card);
  }

  revealVotes(): void {
    this.socketService.startRevealCountdown();
  }

  resetVotes(): void {
    this.socketService.resetVotes();
    this.selectedCard = '';
    this.voteResults = null;
  }

  toggleUserMenu(): void {
    this.showUserMenu = !this.showUserMenu;
  }

  closeUserMenu(): void {
    this.showUserMenu = false;
  }

  changeName(): void {
    this.showUserMenu = false;
    this.showWelcomeModal = true;
    this.nameForm.patchValue({ 
      playerName: this.playerName,
      isSpectator: this.isSpectator 
    });
  }

  toggleSpectatorMode(): void {
    this.showUserMenu = false;
    this.isSpectator = !this.isSpectator;
    // Rejoin game with new spectator status
    this.socketService.joinGame(this.gameId, this.playerName, this.isSpectator);
  }

  toggleAppearance(): void {
    this.isDarkMode = !this.isDarkMode;
    document.body.classList.toggle('dark-mode', this.isDarkMode);
    localStorage.setItem('darkMode', this.isDarkMode.toString());
  }

  signOut(): void {
    this.showUserMenu = false;
    // Clean up countdown state and disconnect
    this.hideCountdown();
    this.socketService.resetState();
    this.socketService.disconnect();
    // Clear cookies and localStorage
    this.deleteCookie('playerName');
    localStorage.removeItem(`player_${this.gameId}`);
    localStorage.removeItem(`playerId_${this.gameId}`);
    // Navigate to home
    this.router.navigate(['/']);
  }

  exitToMain(): void {
    // Clean up countdown state and disconnect
    this.hideCountdown();
    this.socketService.resetState();
    this.socketService.disconnect();
    // Navigate back to main page when moderator has left
    this.router.navigate(['/']);
  }

  private deleteCookie(name: string): void {
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
  }

  toggleInviteModal(): void {
    this.showInviteModal = !this.showInviteModal;
  }

  copyInvitationLink(): void {
    navigator.clipboard.writeText(this.gameUrl).then(() => {
      // Could add a toast notification here
      console.log('Link copied to clipboard');
      // Close the modal after copying
      this.showInviteModal = false;
    });
  }

  toggleQrCode(): void {
    this.showQrCode = !this.showQrCode;
    if (this.showQrCode && !this.qrCodeData) {
      this.generateQrCode();
    }
  }

  generateQrCode(): void {
    // Using qr-server.com API - more reliable alternative
    const size = '200x200';
    const data = encodeURIComponent(this.gameUrl);
    this.qrCodeData = `https://api.qrserver.com/v1/create-qr-code/?size=${size}&data=${data}`;
  }

  get nonSpectatorPlayerCount(): number {
    return this.players.filter(player => !player.isSpectator).length;
  }

  get nonSpectatorVoteCount(): number {
    const nonSpectatorPlayerIds = this.players
      .filter(player => !player.isSpectator)
      .map(player => player.id);
    
    return Array.from(this.playerVotes).filter(playerId => 
      nonSpectatorPlayerIds.includes(playerId)
    ).length;
  }

  skipWelcome(): void {
    this.showWelcomeModal = false;
  }

  getPlayerVoteStatus(player: Player): 'voted' | 'not-voted' | 'revealed' {
    if (this.gameState?.isRevealed && this.voteResults) {
      return 'revealed';
    }
    
    // Check if this player has voted using the playerVotes set
    if (this.playerVotes.has(player.id)) {
      return 'voted';
    }
    
    return 'not-voted';
  }

  getPlayerVote(player: Player): string {
    if (this.gameState?.isRevealed && this.voteResults) {
      return this.voteResults.votes[player.id] || '?';
    }
    return '';
  }

  get allPlayersVoted(): boolean {
    return this.voteResults?.totalVotes === this.players.length && this.players.length > 0;
  }

  get isGameModerator(): boolean {
    // Check if this player is the game moderator
    if (!this.playerId && this.playerName) {
      // If playerId isn't set yet, try to match by name
      const currentPlayer = this.players.find(p => p.name === this.playerName);
      return currentPlayer ? this.players[0]?.id === currentPlayer.id : false;
    }
    
    // Original approach with playerId
    return this.players.length > 0 && this.players[0]?.id === this.playerId;
  }

  get canStartNewVoting(): boolean {
    if (!this.gameState) return false;
    
    // If whoCanManage is 'all', everyone can start new voting
    if (this.gameState.whoCanManage === 'all') {
      return true;
    }
    
    // If whoCanManage is 'moderator', only the game moderator can start new voting
    if (this.gameState.whoCanManage === 'moderator') {
      return this.isGameModerator;
    }
    
    // Default to allowing everyone (fallback for older games or missing field)
    return true;
  }

  get canRevealVotes(): boolean {
    return !this.gameState?.isRevealed && this.isGameModerator;
  }

  get hasVotesToReveal(): boolean {
    // Simply check if any players have voted
    return this.playerVotes.size > 0;
  }

  openEditGameModal(): void {
    if (!this.isGameModerator || !this.gameState) return;
    
    // Pre-populate the form with current game settings
    this.editGameForm.patchValue({
      name: this.gameState.name,
      votingSystem: this.gameState.votingSystem || 'fibonacci',
      whoCanReveal: 'moderator' // This would come from game state in a real implementation
    });
    
    this.showEditGameModal = true;
  }

  closeEditGameModal(): void {
    this.showEditGameModal = false;
    this.isSaving = false;
  }

  saveGameChanges(): void {
    if (!this.isGameModerator || !this.gameState || this.editGameForm.invalid) return;
    
    this.isSaving = true;
    const formValue = this.editGameForm.value;
    
    // Update local game state immediately for responsiveness
    this.gameState.name = formValue.name;
    this.gameState.votingSystem = formValue.votingSystem;
    
    // Update the cards based on the new voting system
    this.updateCardsForVotingSystem(formValue.votingSystem);
    
    // Emit socket event to update the game for all players
    const updateData = {
      name: formValue.name,
      votingSystem: formValue.votingSystem,
      whoCanReveal: formValue.whoCanReveal,
      cards: this.gameState.cards
    };
    this.socketService.updateGameSettings(updateData);
    
    console.log('Game updated and broadcast:', formValue);
    
    // Close modal after a brief delay to show saving state
    setTimeout(() => {
      this.closeEditGameModal();
    }, 500);
  }

  private updateCardsForVotingSystem(votingSystem: string): void {
    if (!this.gameState) return;
    
    const cardSystems: { [key: string]: string[] } = {
      fibonacci: ['0', '1', '2', '3', '5', '8', '13', '21', '34', '55', '89', '?', '☕'],
      tShirt: ['XS', 'S', 'M', 'L', 'XL', 'XXL', '?', '☕'],
      powers: ['0', '1', '2', '4', '8', '16', '32', '64', '?', '☕'],
      sequential: ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '?', '☕']
    };
    
    this.gameState.cards = cardSystems[votingSystem] || cardSystems['fibonacci'];
  }

  // Cookie utility methods
  private setCookie(name: string, value: string, days: number): void {
    const expires = new Date();
    expires.setTime(expires.getTime() + (days * 24 * 60 * 60 * 1000));
    document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/`;
  }

  private getCookie(name: string): string | null {
    const nameEQ = name + "=";
    const ca = document.cookie.split(';');
    for (let i = 0; i < ca.length; i++) {
      let c = ca[i];
      while (c.charAt(0) === ' ') c = c.substring(1, c.length);
      if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
    }
    return null;
  }

  // Calculate responsive translate distance for player positioning
  getPlayerTranslateDistance(): number {
    const playerCount = this.players.length;
    let baseDistance: number;
    
    if (window.innerWidth <= 768) {
      baseDistance = 180; // Mobile: increased from 140px to add more center padding
    } else if (window.innerWidth <= 1024) {
      baseDistance = 200; // Tablet: increased from 155px to add more center padding
    } else {
      baseDistance = 220; // Desktop: increased from 170px to add more center padding
    }
    
    // Increase distance for more players to prevent cramping
    if (playerCount > 6) {
      baseDistance += 25;
    } else if (playerCount > 4) {
      baseDistance += 15;
    }
    
    // Ensure minimum distance to prevent center overlap
    return Math.max(baseDistance, 220);
  }

  // Calculate player card scale based on number of players
  getPlayerScale(): number {
    const playerCount = this.players.length;
    
    if (playerCount > 8) {
      return 0.75; // 25% smaller for 9+ players
    } else if (playerCount > 6) {
      return 0.85; // 15% smaller for 7-8 players
    } else if (playerCount > 4) {
      return 0.90; // 10% smaller for 5-6 players
    }
    
    return 1.0; // Normal size for 4 or fewer players
  }

  // Test method to add one player at a time (for development/testing)
  addTestPlayer(): void {
    const testNames = ['Alice', 'Bob', 'Charlie', 'Diana', 'Eve', 'Frank', 'Grace', 'Henry', 'Ivy', 'Jack', 'Kate', 'Liam', 'Maya', 'Noah', 'Olivia'];
    const testPlayerCount = this.players.filter(p => p.id.startsWith('test_')).length;
    
    if (testPlayerCount < testNames.length) {
      const newPlayer: Player = {
        id: `test_${testPlayerCount}`,
        name: testNames[testPlayerCount],
        isSpectator: testPlayerCount === 9 // Make 10th player a spectator for testing
      };
      
      this.players.push(newPlayer);
      console.log(`Added test player: ${newPlayer.name}. Total players: ${this.players.length}`);
    } else {
      console.log('Maximum test players reached (15)');
    }
  }

  // Remove all test players
  removeTestPlayers(): void {
    const originalCount = this.players.length;
    this.players = this.players.filter(p => !p.id.startsWith('test_'));
    const removedCount = originalCount - this.players.length;
    console.log(`Removed ${removedCount} test players. Remaining players: ${this.players.length}`);
  }

  // Check if there are any test players
  hasTestPlayers(): boolean {
    return this.players.some(p => p.id.startsWith('test_'));
  }

  getParticipantPosition(i: number): { left: string; top: string } {
    const n = this.players.length;
    if (n === 0) return { left: '50%', top: '50%' };
    const theta = (2 * Math.PI * i / n) - Math.PI / 2;
    const left = 50 + 54.5 * Math.cos(theta);
    const top = 50 + 60 * Math.sin(theta);
    return { left: `${left.toFixed(2)}%`, top: `${top.toFixed(2)}%` };
  }

  getParticipantCardClass(player: Player): string[] {
    const classes: string[] = [];
    const isRevealing = this.revealingPlayerIds.has(player.id);

    if (this.gameState?.isRevealed && this.voteResults) {
      if (isRevealing) {
        classes.push('revealed', 'revealing');
      } else if (this.players.some(p => this.revealingPlayerIds.has(p.id))) {
        // Stagger still in progress — keep voted appearance until this card's turn
        classes.push('voted');
        return classes;
      } else {
        classes.push('revealed');
      }
      const vote = this.voteResults.votes[player.id];
      const numVote = parseFloat(vote);
      if (!isNaN(numVote)) {
        const allNums = Object.values(this.voteResults.votes).map(v => parseFloat(v)).filter(v => !isNaN(v));
        if (allNums.length > 1) {
          if (numVote === Math.max(...allNums) && numVote !== Math.min(...allNums)) classes.push('high');
          if (numVote === Math.min(...allNums) && numVote !== Math.max(...allNums)) classes.push('low');
        }
      }
    } else {
      const status = this.getPlayerVoteStatus(player);
      if (status === 'voted') classes.push('voted');
    }
    return classes;
  }

  getAvatarColorClass(i: number): string {
    const colors = ['av-blue', 'av-green', 'av-amber', 'av-purple', 'av-teal', 'av-pink'];
    return colors[i % colors.length];
  }

  get voteMode(): string {
    if (!this.voteResults || !this.voteResults.cardCounts.length) return '-';
    return this.voteResults.cardCounts.reduce((a, b) => b.count > a.count ? b : a).card;
  }

  get voteAverage(): string {
    if (!this.voteResults) return '-';
    const avg = this.voteResults.average;
    if (avg == null || isNaN(Number(avg))) return '-';
    return Number(avg).toFixed(1);
  }

  get voteRange(): string {
    if (!this.voteResults) return '-';
    const nums = Object.values(this.voteResults.votes).map(v => parseFloat(v)).filter(v => !isNaN(v));
    if (!nums.length) return '-';
    return `${Math.min(...nums)}–${Math.max(...nums)}`;
  }

  getBarHeight(count: number): number {
    if (!this.voteResults) return 4;
    return Math.max(4, Math.round((count / this.voteResults.maxCount) * 48));
  }
}

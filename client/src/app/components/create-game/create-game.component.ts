import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { GameService } from '../../services/game.service';
import { GameConfig, SocketService } from '../../services/socket.service';

@Component({
  selector: 'app-create-game',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './create-game.component.html',
  styleUrl: './create-game.component.scss'
})
export class CreateGameComponent implements OnInit {
  gameForm: FormGroup;
  
  votingSystems = [
    { value: 'fibonacci', label: 'Fibonacci (0, 1, 2, 3, 5, 8, 13, 21, 34, 55, 89, ?, ☕)' },
    { value: 'tShirt', label: 'T-Shirt Sizes (XS, S, M, L, XL, XXL, ?, ☕)' },
    { value: 'powers', label: 'Powers of 2 (0, 1, 2, 4, 8, 16, 32, 64, ?, ☕)' },
    { value: 'sequential', label: 'Sequential (0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, ?, ☕)' }
  ];

  permissionOptions = [
    { value: 'all', label: 'All players' },
    { value: 'moderator', label: 'Moderator only' }
  ];

  isCreating = false;
  showForm = false;
  showAdvancedSettings = false;

  constructor(
    private fb: FormBuilder,
    private gameService: GameService,
    private router: Router,
    private socketService: SocketService
  ) {
    // Set default game name with current date
    const date = new Date();
    const defaultName = `Planning Session - ${date.toLocaleDateString()}`;
    
    this.gameForm = this.fb.group({
      name: [defaultName, [Validators.required, Validators.minLength(1)]],
      votingSystem: ['fibonacci'],
      whoCanReveal: ['moderator'],
      whoCanManage: ['moderator'],
      autoReveal: [false],
      enableFunFeatures: [true],
      showAverage: [true],
      showCountdown: [true]
    });
  }

  ngOnInit(): void {
    // Reset socket service state to prevent countdown bubble from previous sessions
    this.socketService.resetState();
    
    // Clear any residual localStorage data from previous sessions
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
      if (key.startsWith('player_') || key.startsWith('playerId_')) {
        localStorage.removeItem(key);
      }
    });
  }

  showGameForm(): void {
    this.showForm = true;
  }

  toggleAdvancedSettings(): void {
    this.showAdvancedSettings = !this.showAdvancedSettings;
  }

  createGame(): void {
    if (this.gameForm.invalid) {
      return;
    }

    this.isCreating = true;
    
    // Connect socket when creating game
    this.socketService.connect();
    
    const gameConfig: GameConfig = this.gameForm.value;

    this.gameService.createGame(gameConfig).subscribe({
      next: (response) => {
        // Navigate to the game session
        this.router.navigate(['/game', response.gameId]);
      },
      error: (error) => {
        console.error('Error creating game:', error);
        this.isCreating = false;
      }
    });
  }

  trackByValue(index: number, item: any): any {
    return item.value;
  }
}

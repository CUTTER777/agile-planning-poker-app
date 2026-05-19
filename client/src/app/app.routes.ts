import { Routes } from '@angular/router';
import { CreateGameComponent } from './components/create-game/create-game.component';
import { GameSessionComponent } from './components/game-session/game-session.component';

export const routes: Routes = [
  { path: '', component: CreateGameComponent },
  { path: 'game/:id', component: GameSessionComponent },
  { path: '**', redirectTo: '' }
];

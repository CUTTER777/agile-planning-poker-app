import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { GameConfig } from './socket.service';
import { environment } from '../../environments/environment';

export interface CreateGameResponse {
  gameId: string;
  gameUrl: string;
  qrCode: string;
}

@Injectable({
  providedIn: 'root'
})
export class GameService {
  private readonly API_URL = environment.apiUrl;

  constructor(private http: HttpClient) {}

  createGame(config: GameConfig): Observable<CreateGameResponse> {
    return this.http.post<CreateGameResponse>(`${this.API_URL}/games`, config);
  }

  getGame(gameId: string): Observable<any> {
    return this.http.get(`${this.API_URL}/games/${gameId}`);
  }

  getVotingSystems(): Observable<any> {
    return this.http.get(`${this.API_URL}/voting-systems`);
  }
}
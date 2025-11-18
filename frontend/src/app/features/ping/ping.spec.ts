import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface PingResponse {
  status: string;
  serverTime: string;
  latencyMs: number;
}

@Injectable({
  providedIn: 'root'
})
export class PingService {
  constructor(private http: HttpClient) {}

  ping(): Observable<PingResponse> {
    return this.http.get<PingResponse>('/ping');
  }
}
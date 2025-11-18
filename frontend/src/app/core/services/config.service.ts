import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ConfigService {
  getRestBaseUrl(): string {
    return localStorage.getItem('restBaseUrl') || 'http://localhost:8000/api';
  }

  getWsBaseUrl(): string {
    return localStorage.getItem('wsBaseUrl') || 'ws://localhost:8000/ws';
  }

  setRestBaseUrl(url: string): void {
    localStorage.setItem('restBaseUrl', url);
  }

  setWsBaseUrl(url: string): void {
    localStorage.setItem('wsBaseUrl', url);
  }
}
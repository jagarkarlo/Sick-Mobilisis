import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { ConfigService } from '../../core/services/config.service';

export interface MemoryMessage {
  type: 'welcome' | 'data' | 'error';
  usagePercent?: number;
  usedMB?: number;
  totalMB?: number;
  capturedAt?: string;
  serverTime?: string;
  message?: string;
}

export interface ConnectionStatus {
  state: 'disconnected' | 'connecting' | 'connected' | 'error';
  reconnectAttempt?: number;
}

@Injectable({
  providedIn: 'root'
})
export class MemoryService {
  private ws: WebSocket | null = null;
  private messageSubject = new Subject<MemoryMessage>();
  private statusSubject = new Subject<ConnectionStatus>();
  
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private baseDelay = 1000;
  private reconnectTimer: any = null;
  private manualDisconnect = false;

  constructor(private configService: ConfigService) {}

  connect(): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) return;

    this.manualDisconnect = false;
    this.statusSubject.next({ state: 'connecting', reconnectAttempt: this.reconnectAttempts });

    const wsUrl = `${this.configService.getWsBaseUrl()}/memory`;

    try {
      this.ws = new WebSocket(wsUrl);

      this.ws.onopen = () => {
        this.reconnectAttempts = 0;
        this.statusSubject.next({ state: 'connected' });
      };

      this.ws.onmessage = (event) => {
        try {
          const message: MemoryMessage = JSON.parse(event.data);
          this.messageSubject.next(message);
        } catch (error) {
          console.error('Parse error:', error);
          this.messageSubject.next({
            type: 'error',
            message: 'Failed to parse message'
          });
        }
      };

      this.ws.onerror = (event) => {
        console.error('WebSocket error:', event);
        this.statusSubject.next({ state: 'error', reconnectAttempt: this.reconnectAttempts });
      };

      this.ws.onclose = (event) => {
        this.statusSubject.next({ state: 'disconnected' });
        
        if (!this.manualDisconnect && event.code !== 1000) {
          this.attemptReconnect();
        }
      };

    } catch (error) {
      console.error('Connection error:', error);
      this.statusSubject.next({ state: 'error' });
    }
  }

  disconnect(): void {
    this.manualDisconnect = true;
    this.reconnectAttempts = 0;
    this.clearReconnectTimer();
    
    if (this.ws) {
      this.ws.close(1000);
      this.ws = null;
    }
    
    this.statusSubject.next({ state: 'disconnected' });
  }

  private attemptReconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      this.statusSubject.next({ state: 'error', reconnectAttempt: this.reconnectAttempts });
      return;
    }

    this.reconnectAttempts++;
  
    const delay = Math.min(this.baseDelay * Math.pow(2, this.reconnectAttempts - 1), 16000);
    
    this.statusSubject.next({ state: 'connecting', reconnectAttempt: this.reconnectAttempts });

    this.reconnectTimer = setTimeout(() => {
      this.connect();
    }, delay);
  }

  private clearReconnectTimer(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
  }

  getMessages(): Observable<MemoryMessage> {
    return this.messageSubject.asObservable();
  }

  getStatus(): Observable<ConnectionStatus> {
    return this.statusSubject.asObservable();
  }

  cleanup(): void {
    this.disconnect();
    this.messageSubject.complete();
    this.statusSubject.complete();
  }
}
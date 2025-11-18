import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { MemoryService, MemoryMessage, ConnectionStatus } from './memory.spec';
import { ToastService } from '../../core/services/toast.service';

interface MemoryRecord {
  usagePercent: number;
  usedMB: number;
  totalMB: number;
  capturedAt: string; 
  timestamp: number;
}

@Component({
  selector: 'app-memory',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './memory.html',
  styleUrls: ['./memory.css'],
})
export class MemoryComponent {
  memoryHistory: MemoryRecord[] = [];
  connectionState: string = 'disconnected';
  reconnectAttempt: number = 0;
  isPaused: boolean = false;
  showSmoothing: boolean = false;
  
  sortField: 'timestamp' | 'usagePercent' = 'timestamp';
  sortDirection: 'asc' | 'desc' = 'desc';
  
  private messageSubscription?: Subscription;
  private statusSubscription?: Subscription;
  private rollingWindow: number[] = [];
  private readonly ROLLING_WINDOW_SIZE = 5;

  constructor(
    private memoryService: MemoryService,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    this.statusSubscription = this.memoryService.getStatus().subscribe({
      next: (status: ConnectionStatus) => {
        this.connectionState = status.state;
        this.reconnectAttempt = status.reconnectAttempt || 0;
        
        if (status.state === 'connected') {
          this.toastService.success('WebSocket connected');
        } else if (status.state === 'error') {
          this.toastService.error('Connection failed');
        } else if (status.state === 'connecting' && status.reconnectAttempt) {
          this.toastService.warning(`Reconnecting (attempt ${status.reconnectAttempt})`);
        }
      }
    });

    this.messageSubscription = this.memoryService.getMessages().subscribe({
      next: (message: MemoryMessage) => {
        if (message.type === 'data' && !this.isPaused) {
          this.handleDataMessage(message);
        } else if (message.type === 'error') {
          this.toastService.error(message.message || 'WebSocket error');
        }
      }
    });

    this.connect();
  }

  ngOnDestroy(): void {
    this.messageSubscription?.unsubscribe();
    this.statusSubscription?.unsubscribe();
    this.memoryService.cleanup();
  }

  connect(): void {
    this.memoryService.connect();
  }

  disconnect(): void {
    this.memoryService.disconnect();
    this.toastService.info('Disconnected');
  }

  togglePause(): void {
    this.isPaused = !this.isPaused;
    this.toastService.info(this.isPaused ? 'Paused' : 'Resumed');
  }

  toggleSmoothing(): void {
    this.showSmoothing = !this.showSmoothing;
  }

  private handleDataMessage(message: MemoryMessage): void {
    const usagePercent = message.usagePercent || 0;
    
    this.rollingWindow.push(usagePercent);
    if (this.rollingWindow.length > this.ROLLING_WINDOW_SIZE) {
      this.rollingWindow.shift();
    }

    const record: MemoryRecord = {
      usagePercent,
      usedMB: message.usedMB || 0,
      totalMB: message.totalMB || 0,
      capturedAt: message.capturedAt || new Date().toISOString(),
      timestamp: Date.now()
    };

    this.memoryHistory.unshift(record);
    if (this.memoryHistory.length > 20) this.memoryHistory.pop();
    this.applySorting();
  }

  getRollingAverage(): number {
    if (this.rollingWindow.length === 0) return 0;
    return this.rollingWindow.reduce((a, b) => a + b, 0) / this.rollingWindow.length;
  }

  sortBy(field: 'timestamp' | 'usagePercent'): void {
    if (this.sortField === field) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortField = field;
      this.sortDirection = 'desc';
    }
    this.applySorting();
  }

  applySorting(): void {
    this.memoryHistory.sort((a, b) => {
      const cmp = this.sortField === 'timestamp' ? a.timestamp - b.timestamp : a.usagePercent - b.usagePercent;
      return this.sortDirection === 'asc' ? cmp : -cmp;
    });
  }

  getSortIcon(field: string): string {
    if (this.sortField !== field) return '⇅';
    return this.sortDirection === 'asc' ? '↑' : '↓';
  }

  formatTime(timestamp: number): string {
    return new Date(timestamp).toLocaleTimeString();
  }

  getStatusClass(): string {
    return this.connectionState;
  }

  getUsageClass(usage: number): string {
    if (usage < 60) return 'normal';
    if (usage < 85) return 'warning';
    return 'critical';
  }
}
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { PingService, PingResponse } from './ping.spec';
import { ToastService } from '../../core/services/toast.service';

interface PingRecord extends PingResponse {
  timestamp: number;
}

@Component({
  selector: 'app-ping',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './ping.html',
  styleUrls: ['./ping.css'],
})
export class PingComponent {
  pollingForm: FormGroup;
  filterForm: FormGroup;
  
  currentStatus: string = 'Not started';
  lastSuccessfulPing: string = 'N/A';
  lastLatency: number = 0;
  isLoading: boolean = false;
  isPaused: boolean = false;
  
  pingHistory: PingRecord[] = [];
  filteredHistory: PingRecord[] = [];
  sortField: 'timestamp' | 'status' | 'latencyMs' = 'timestamp';
  sortDirection: 'asc' | 'desc' = 'desc';
  
  private intervalId: any = null;
  private pollingInterval: number = 5;

  constructor(
    private fb: FormBuilder,
    private pingService: PingService,
    private toastService: ToastService
  ) {
    this.pollingForm = this.fb.group({
      interval: [5, [Validators.required, Validators.min(1), Validators.max(60)]]
    });

    this.filterForm = this.fb.group({
      statusFilter: ['all']
    });
  }

  ngOnInit(): void {
    this.startPolling();
    this.filterForm.valueChanges.subscribe(() => this.applyFilter());
  }

  ngOnDestroy(): void {
    this.stopPolling();
  }

  onIntervalChange(): void {
    if (this.pollingForm.valid) {
      const newInterval = this.pollingForm.value.interval;
      if (newInterval !== this.pollingInterval) {
        this.pollingInterval = newInterval;
        if (!this.isPaused) {
          this.stopPolling();
          this.startPolling();
          this.toastService.info(`Interval changed to ${newInterval}s`);
        }
      }
    }
  }

  togglePause(): void {
    this.isPaused = !this.isPaused;
    if (this.isPaused) {
      this.stopPolling();
      this.toastService.info('Polling paused');
    } else {
      this.startPolling();
      this.toastService.info('Polling resumed');
    }
  }

  startPolling(): void {
    this.fetchPing();
    this.intervalId = setInterval(() => this.fetchPing(), this.pollingInterval * 1000);
  }

  stopPolling(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  fetchPing(): void {
    this.isLoading = true;
    const requestStart = performance.now();

    this.pingService.ping().subscribe({
      next: (response: PingResponse) => {
        const latency = Math.round(performance.now() - requestStart);
        
        const calculatedStatus = latency > 200 ? 'WARN' : 'OK';
        
        const record: PingRecord = {
          ...response,
          status: calculatedStatus,
          latencyMs: latency,
          timestamp: Date.now(),
        };

        this.currentStatus = calculatedStatus;
        this.lastSuccessfulPing = new Date(response.serverTime).toLocaleString();
        this.lastLatency = latency;
        this.isLoading = false;

        this.pingHistory.unshift(record);
        if (this.pingHistory.length > 10) this.pingHistory.pop();
        this.applyFilter();
      },
      error: (error: any) => {
        const latency = Math.round(performance.now() - requestStart);
        
        const errorRecord: PingRecord = {
          status: 'ERROR',
          serverTime: new Date().toISOString(),
          latencyMs: latency,
          timestamp: Date.now(),
        };

        this.currentStatus = 'ERROR';
        this.isLoading = false;
        
        this.pingHistory.unshift(errorRecord);
        if (this.pingHistory.length > 10) this.pingHistory.pop();
        this.applyFilter();
        
        this.toastService.error(error.error?.detail?.message || 'Ping failed');
      }
    });
  }

  sortBy(field: 'timestamp' | 'status' | 'latencyMs'): void {
    if (this.sortField === field) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortField = field;
      this.sortDirection = 'desc';
    }
    this.applyFilter();
  }

  applyFilter(): void {
    const statusFilter = this.filterForm.value.statusFilter;
    let filtered = statusFilter === 'all' 
      ? [...this.pingHistory] 
      : this.pingHistory.filter(p => p.status === statusFilter);
    
    filtered.sort((a, b) => {
      let cmp = 0;
      if (this.sortField === 'timestamp') cmp = a.timestamp - b.timestamp;
      else if (this.sortField === 'status') cmp = a.status.localeCompare(b.status);
      else if (this.sortField === 'latencyMs') cmp = a.latencyMs - b.latencyMs;
      return this.sortDirection === 'asc' ? cmp : -cmp;
    });
    
    this.filteredHistory = filtered;
  }

  getSortIcon(field: string): string {
    if (this.sortField !== field) return '⇅';
    return this.sortDirection === 'asc' ? '↑' : '↓';
  }

  formatTime(timestamp: number): string {
    return new Date(timestamp).toLocaleTimeString();
  }
}
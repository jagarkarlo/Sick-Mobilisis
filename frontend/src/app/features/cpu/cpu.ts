import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CpuService, CpuResponse } from './cpu.spec';
import { ToastService } from '../../core/services/toast.service';

interface CpuRecord extends CpuResponse {
  timestamp: number;
}

@Component({
  selector: 'app-cpu',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './cpu.html',
  styleUrls: ['./cpu.css'],
})
export class CpuComponent {
  cpuHistory: CpuRecord[] = [];
  isLoading: boolean = false;
  hasData: boolean = false;
  lastRefresh: string = 'Never';
  sortField: 'timestamp' | 'usagePercent' = 'timestamp';
  sortDirection: 'asc' | 'desc' = 'desc';

  private lastClickTime: number = 0;
  private readonly DEBOUNCE_MS = 1000;

  constructor(
    private cpuService: CpuService,
    private toastService: ToastService
  ) {}

  async refresh(): Promise<void> {
    const now = Date.now();

    if (now - this.lastClickTime < this.DEBOUNCE_MS) {
      this.toastService.warning('Please wait before refreshing');
      return;
    }
    this.lastClickTime = now;

    this.isLoading = true;

    try {
      const response = await this.cpuService.fetchCpuUsage();

      const record: CpuRecord = {
        ...response,
        timestamp: Date.now(),
      };

      this.cpuHistory.unshift(record);
      if (this.cpuHistory.length > 10) {
        this.cpuHistory.pop();
      }

      this.lastRefresh = new Date().toLocaleString();
      this.hasData = true;
      this.isLoading = false;

      this.applySorting();
    } catch (error: any) {
      this.isLoading = false;
      this.toastService.error(
        error?.error?.detail?.message || 'Failed to fetch CPU'
      );
    }
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
    this.cpuHistory.sort((a, b) => {
      const cmp =
        this.sortField === 'timestamp'
          ? a.timestamp - b.timestamp
          : a.usagePercent - b.usagePercent;

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

  getUsageClass(usage: number): string {
    if (usage < 50) return 'badge-normal';
    if (usage < 80) return 'badge-high';
    return 'badge-critical';
  }
}

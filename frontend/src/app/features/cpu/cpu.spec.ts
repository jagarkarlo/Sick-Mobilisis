import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

export interface CpuResponse {
  usagePercent: number;
  capturedAt: string;
}

@Injectable({
  providedIn: 'root'
})
export class CpuService {
  constructor(private http: HttpClient) {}

  // Promise-based
  async fetchCpuUsage(): Promise<CpuResponse> {
    return firstValueFrom(this.http.get<CpuResponse>('/cpu'));
  }
}
import { Injectable } from '@angular/core';
import { ToastrService } from 'ngx-toastr';

@Injectable({
  providedIn: 'root'
})
export class ToastService {
  constructor(private toastr: ToastrService) {}

  success(message: string, title?: string): void {
    this.toastr.success(message, title);
  }

  error(message: string, title?: string): void {
    this.toastr.error(message, title || 'Error');
  }

  warning(message: string, title?: string): void {
    this.toastr.warning(message, title);
  }

  info(message: string, title?: string): void {
    this.toastr.info(message, title);
  }
}
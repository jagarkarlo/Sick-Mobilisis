import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { ConfigService } from '../services/config.service';

export const baseUrlInterceptor: HttpInterceptorFn = (req, next) => {
  const configService = inject(ConfigService);

  if (!req.url.startsWith('http')) {
    const baseUrl = configService.getRestBaseUrl();
    const modifiedReq = req.clone({
      url: `${baseUrl}${req.url}`
    });
    return next(modifiedReq);
  }

  return next(req);
};
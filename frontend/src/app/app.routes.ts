import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/welcome/welcome').then(m => m.Welcome)
  },
  {
    path: 'ping',
    loadComponent: () => import('./features/ping/ping').then(m => m.PingComponent)
  },
  {
    path: 'cpu',
    loadComponent: () => import('./features/cpu/cpu').then(m => m.CpuComponent)
  },
  {
    path: 'memory',
    loadComponent: () => import('./features/memory/memory').then(m => m.MemoryComponent)
  },
  {
    path: '404',
    loadComponent: () => import('./pages/not-found/not-found.component').then(m => m.NotFoundComponent)
  },
  {
    path: '**',
    redirectTo: '/404'
  }
];
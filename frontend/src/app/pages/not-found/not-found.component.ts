import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-not-found',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="not-found">
      <h1>404</h1>
      <h2>Page Not Found</h2>
      <p>The page you're looking for doesn't exist.</p>
      <a routerLink="/" class="btn">← Go Home</a>
    </div>
  `,
  styles: [`
    .not-found { max-width: 600px; margin: 100px auto; text-align: center; padding: 40px; }
    h1 { font-size: 6em; color: #e74c3c; margin: 0; }
    h2 { font-size: 2em; color: #2c3e50; margin: 20px 0; }
    p { color: #7f8c8d; font-size: 1.1em; margin-bottom: 30px; }
    .btn { display: inline-block; padding: 12px 30px; background: #3498db; color: white; text-decoration: none; border-radius: 4px; font-weight: 600; transition: 0.2s; }
    .btn:hover { background: #2980b9; }
  `]
})
export class NotFoundComponent {}
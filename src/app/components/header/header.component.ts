import { Component, output, ChangeDetectionStrategy } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-header',
  template: `
    <button mat-fab extended (click)="menuToggled.emit()" class="menu-float" aria-label="Toggle menu">
      <mat-icon>menu</mat-icon>
      <span>Velopitt</span>
    </button>
  `,
  styles: [`
    .menu-float {
      position: fixed;
      top: 16px;
      left: 16px;
      z-index: 1000;
      background: var(--glass-bg);
      backdrop-filter: var(--glass-blur);
      border: var(--glass-border);
      color: var(--sys-primary);
    }
    .menu-float:hover {
      background: var(--sys-surface);
    }
  `],
  imports: [MatIconModule, MatButtonModule],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HeaderComponent {
  menuToggled = output<void>();
}

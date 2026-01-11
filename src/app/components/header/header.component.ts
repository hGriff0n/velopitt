import { Component, output, ChangeDetectionStrategy } from '@angular/core';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-header',
  template: `
    <mat-toolbar style="background: var(--glass-bg); backdrop-filter: var(--glass-blur); border-bottom: var(--glass-border); color: var(--sys-primary);">
      <button mat-icon-button (click)="menuToggled.emit()" style="color: var(--sys-on-surface);">
        <mat-icon>menu</mat-icon>
      </button>
      <span>Velopitt</span>
    </mat-toolbar>
  `,
  styles: [],
  standalone: true,
  imports: [MatToolbarModule, MatIconModule, MatButtonModule],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HeaderComponent {
  menuToggled = output<void>();
}

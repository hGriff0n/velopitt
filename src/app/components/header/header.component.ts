import { Component, output, ChangeDetectionStrategy } from '@angular/core';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

@Component({
    selector: 'app-header',
    template: `
    <mat-toolbar style="background-color: black; color: white;">
      <button mat-icon-button (click)="menuToggled.emit()">
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

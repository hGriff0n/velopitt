import { Component, input, output, ChangeDetectionStrategy } from '@angular/core';
import { MatListModule } from '@angular/material/list';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-sidebar',
  template: `
    <mat-action-list>
      <button mat-list-item [class.active-button]="regionShowing()" (click)="toggleRegion.emit()">Toggle region layer</button>
      <button mat-list-item [class.active-button]="segmentShowing()" (click)="toggleSegment.emit()">Toggle segment layer</button>
      <button mat-list-item [class.active-button]="bikemapShowing()" (click)="toggleBikeMap.emit()">Toggle Bike Map layer</button>
      <button mat-list-item [class.active-button]="bikemapPlusShowing()" (click)="toggleBikePlus.emit()">Toggle Bike Plus layer</button>
      <mat-divider></mat-divider>
      <button routerLink="/" mat-list-item>Group Rides + Events</button>
      <button routerLink="/" mat-list-item>Community Resources</button>
      <button routerLink="/" mat-list-item>Route Builder</button>
      <button routerLink="/" mat-list-item>Etiquette and Safety</button>
      <button routerLink="/" mat-list-item>Racing</button>
    </mat-action-list>
  `,
  styles: [`
    :host {
      display: block;
      height: 100%;
      background: var(--glass-bg);
      backdrop-filter: var(--glass-blur);
      border-right: var(--glass-border);
      color: var(--sys-on-surface);
    }
    .active-button {
      background-color: var(--sys-primary) !important;
      color: var(--sys-on-primary) !important;
    }
    button {
      color: var(--sys-on-surface);
    }
    mat-divider {
      border-top-color: var(--glass-border);
    }
  `],
  standalone: true,
  imports: [MatListModule, MatButtonModule, MatDividerModule, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SidebarComponent {
  regionShowing = input(false);
  segmentShowing = input(false);
  bikemapShowing = input(true);
  bikemapPlusShowing = input(false);

  toggleRegion = output<void>();
  toggleSegment = output<void>();
  toggleBikeMap = output<void>();
  toggleBikePlus = output<void>();
}

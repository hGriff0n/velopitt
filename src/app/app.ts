import { Component, signal } from '@angular/core';

import { ConfigService } from './services/config-service';

@Component({
  selector: 'app-root',
  templateUrl: './app.html',
  standalone: false,
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('velopitt');

  strava: any = { };

  constructor(private config: ConfigService) {
    this.strava = this.config.stravaClient
  }
}

// Getting weird type error: `TypeError: t2 is not iterable`
@Component({
  selector: 'dm',
  standalone: false,
  template: `<mgl-map [style]="style" [zoom]="9" [center]="[-74.5, 40]" />`,
  styles: [
    `
      mgl-map {
        height: 100%;
        width: 100%;
      }
    `,
  ],
})
export class DisplayMapComponent {
  style = "mapbox://styles/hgriff0n/cmds2q1t100u101s2063wbeh6"
} 
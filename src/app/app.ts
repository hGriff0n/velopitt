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

@Component({
  selector: 'showcase-demo',
  template: `
    <mgl-map
      [style]="'mapbox://styles/mapbox/outdoors-v9'"
      [zoom]="[13]"
      [center]="[11.255, 43.77]"
    >
      <mgl-control mglFullscreen />
    </mgl-map>
  `,
  styleUrl: "./app.css",
  standalone: false
})
export class FullscreenComponent {}
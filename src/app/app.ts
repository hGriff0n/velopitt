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
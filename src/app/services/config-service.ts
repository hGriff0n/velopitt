import { Injectable } from '@angular/core';

import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ConfigService {

  constructor() { }

  // This is an example property ... you can make it however you want.
  get stravaClient() {
    return {
        "id": environment.STRAVA_ID,
        "secret": environment.STRAVA_SECRET,
        "refresh": environment.STRAVA_TOKEN
    }
  }
}
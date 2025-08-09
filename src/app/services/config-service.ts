import { Injectable } from '@angular/core';
import { Base64 } from 'js-base64';

import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ConfigService {

  constructor() { }

  // This is an example property ... you can make it however you want.
  get stravaClient() {
    return {
        "id": Base64.decode(environment.STRAVA_ID),
        "secret": Base64.decode(environment.STRAVA_SECRET),
        "token": Base64.decode(environment.STRAVA_TOKEN)
    }
  }

  get mapbox() {
    return {
      "api_key": Base64.decode(environment.MAPBOX_API_KEY),
    }
  }
}
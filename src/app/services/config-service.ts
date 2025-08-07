import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ConfigService {

  private appConfig: any;

  constructor(private http: HttpClient) { }

  loadAppConfig() {
    return this.http.get('/assets/config.json')
      .toPromise()
      .then(data => {
        this.appConfig = data;
      });
  }

  // This is an example property ... you can make it however you want.
  get stravaClient() {
    if (!this.appConfig) {
      throw Error('Config file not loaded!');
    }

    return {
        "id": this.appConfig.strava_id,
        "secret": this.appConfig.client_secret,
        "refresh": this.appConfig.refresh_token
    }
  }
}
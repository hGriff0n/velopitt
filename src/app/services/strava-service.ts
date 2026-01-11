import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

import { ConfigService } from './config-service';

// TODO: me - Turn this into a local script
@Injectable({ providedIn: 'root' })
export class StravaService {
    private http = inject(HttpClient);
    private apiURL = "https://www.strava.com/api/v3";
    private config = inject(ConfigService).stravaClient;

    getSegment(id: number): Observable<object> {
        const url = `${this.apiURL}/segments/${id}`;
        const headers = new HttpHeaders({
            "Content-Type": "application/json",
            Authorization: `Bearer ${this.config.token}`
        });

        return this.http.get(url, { headers });
    }
}
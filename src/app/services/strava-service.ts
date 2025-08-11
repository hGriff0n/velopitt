import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

import { ConfigService } from './config-service';

@Injectable({ providedIn: 'root' })
export class StravaService {
    private apiURL = "https://www.strava.com/api/v3/";
    private config = inject(ConfigService).stravaClient;

    constructor(private http: HttpClient) { }

    getSegment(id: number): Observable<Object> {
        let url = `${this.apiURL}/segments/${id}`;
        const headers = new HttpHeaders({
            "Content-Type": "application/json",
            Authorization: `Bearer ${this.config.token}`
        });

        return this.http.get(url, { headers });
    }
}
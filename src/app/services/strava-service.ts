import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

import { ConfigService } from './config-service';

// TODO: me - Turn this into a local script
@Injectable({ providedIn: 'root' })
export class StravaService {
    private apiURL = "https://www.strava.com/api/v3/";
    private config = inject(ConfigService).stravaClient;

    constructor(private http: HttpClient) { }

    ngOnInit() {
        // This is currently the only way I have to refresh segment data
        // Importantly, this gets the data in the right format for me to
        // copy-paste it to segment.json
        const segmentsToRefresh: number[] = [];
        segmentsToRefresh.map(segment => {
            this.getSegment(segment).subscribe((data: any) => {
                console.log(JSON.stringify(data));
            });
        })
    }

    getSegment(id: number): Observable<Object> {
        let url = `${this.apiURL}/segments/${id}`;
        const headers = new HttpHeaders({
            "Content-Type": "application/json",
            Authorization: `Bearer ${this.config.token}`
        });

        return this.http.get(url, { headers });
    }
}
import { Injectable, inject } from '@angular/core';
import { Strava, SummarySegment, DetailedSegment } from 'strava';

import { ConfigService } from './config-service';

@Injectable({ providedIn: 'root' })
export class StravaService {
    private strava_client: Strava;

    constructor() {
        var config = inject(ConfigService).stravaClient;

        this.strava_client = new Strava({
            client_id: config.id,
            client_secret: config.secret,
            refresh_token: config.token
        });
    }

    async getSegment(id: number): Promise<DetailedSegment> {
        return this.strava_client.segments.getSegmentById({ id: id });
    }
}
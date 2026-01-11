import { TestBed } from '@angular/core/testing';
import { ConfigService } from './config-service';
import { environment } from '../../environments/environment';
import { Base64 } from 'js-base64';

describe('ConfigService', () => {
    let service: ConfigService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(ConfigService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should decode Strava configuration', () => {
        // Expected decoded values based on the current environment.ts
        // ID: Njk4NDc= -> 69847
        expect(service.stravaClient.id).toBe('69847');

        // We can also verify it matches the direct decoding of the env var
        // to ensure logic consistency if the env var changes (though the hardcoded check above is safer for regression)
        expect(service.stravaClient.id).toBe(Base64.decode(environment.STRAVA_ID));
        expect(service.stravaClient.secret).toBe(Base64.decode(environment.STRAVA_SECRET));
        expect(service.stravaClient.token).toBe(Base64.decode(environment.STRAVA_TOKEN));
    });

    it('should decode Mapbox configuration', () => {
        expect(service.mapbox.api_key).toBe(Base64.decode(environment.MAPBOX_API_KEY));
        // Verify it's a non-empty string
        expect(service.mapbox.api_key.length).toBeGreaterThan(0);
    });
});

import { TestBed } from '@angular/core/testing';
import { StravaService } from './strava-service';
import { HttpClient } from '@angular/common/http';
import { ConfigService } from './config-service';
import { of } from 'rxjs';

describe('StravaService', () => {
    let service: StravaService;
    let httpClientSpy: jasmine.SpyObj<HttpClient>;
    let configServiceSpy: jasmine.SpyObj<ConfigService>;

    beforeEach(() => {
        httpClientSpy = jasmine.createSpyObj('HttpClient', ['get']);
        configServiceSpy = jasmine.createSpyObj('ConfigService', [], {
            stravaClient: { id: '123', secret: 'secret', token: 'mock-token' }
        });

        TestBed.configureTestingModule({
            providers: [
                StravaService,
                { provide: HttpClient, useValue: httpClientSpy },
                { provide: ConfigService, useValue: configServiceSpy }
            ]
        });
        service = TestBed.inject(StravaService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should get segment data', (done) => {
        const mockData = { id: 123, name: 'Test Segment' };
        httpClientSpy.get.and.returnValue(of(mockData));

        service.getSegment(123).subscribe((data) => {
            expect(data).toEqual(mockData);
            expect(httpClientSpy.get).toHaveBeenCalledWith(
                'https://www.strava.com/api/v3/segments/123',
                jasmine.objectContaining({
                    headers: jasmine.any(Object)
                })
            );
            // Better verification of headers:
            const callArgs = httpClientSpy.get.calls.mostRecent().args;
            const headers = (callArgs[1] as any).headers;
            expect(headers.get('Authorization')).toBe('Bearer mock-token');
            done();
        });
    });
});

import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { EventService, GroupData } from './event.service';

interface TestGroupData {
    group: any;
    rides: any[];
}

describe('EventService', () => {
    let service: EventService;
    let httpMock: HttpTestingController;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            providers: [EventService]
        });
        service = TestBed.inject(EventService);
        httpMock = TestBed.inject(HttpTestingController);
    });

    afterEach(() => {
        httpMock.verify();
    });

    it('should load groups and rides', fakeAsync(() => {
        const mockManifest = ['test-group.json'];
        const mockGroupData: TestGroupData = {
            group: { id: 'g1', name: 'Test Group' },
            rides: [{
                id: 'r1',
                groupId: 'g1',
                name: 'Test Ride',
                startTime: '10:00',
                durationMinutes: 60,
                recurrence: 'Weekly',
                dayOfWeek: 1, // Monday
                startLocation: { type: 'Point', coordinates: [0, 0] },
                startLocationLabel: 'Test Loc'
            }]
        };

        service.loadAllGroups();

        const freq = httpMock.expectOne('assets/data/groups-manifest.json');
        freq.flush(mockManifest);

        tick(); // Wait for manifest promise to resolve and trigger next requests

        const greq = httpMock.expectOne('assets/data/groups/test-group.json');
        greq.flush(mockGroupData);

        tick(); // Wait for group promise to resolve

        expect(service.groups().length).toBe(1);
        expect(service.groups()[0].name).toBe('Test Group');
        expect(service.rides().length).toBe(1);
    }));

    it('should generate weekly events', fakeAsync(() => {
        service.loadAllGroups();

        httpMock.expectOne('assets/data/groups-manifest.json').flush(['g.json']);

        tick();

        httpMock.expectOne('assets/data/groups/g.json').flush({
            group: { id: 'g1', name: 'G1' },
            rides: [{
                id: 'r1', groupId: 'g1', name: 'R1',
                startTime: '18:00', durationMinutes: 60,
                recurrence: 'Weekly', dayOfWeek: 1 // Monday
            }]
        });

        tick();

        // Generate for a specific week: MONDAY Jan 1 2024 to SUNDAY Jan 7 2024
        // Jan 1 2024 is a Monday.
        const start = new Date('2024-01-01T00:00:00');
        const end = new Date('2024-01-07T23:59:59');

        const events = service.generateEvents(start, end);

        expect(events.length).toBe(1);
        expect(events[0].title).toBe('R1');
        expect(events[0].start.getHours()).toBe(18);
        expect(events[0].start.getDate()).toBe(1);

        // Test that it doesn't generate for wrong day
        const events2 = service.generateEvents(
            new Date('2024-01-02T00:00:00'), // Tuesday
            new Date('2024-01-02T23:59:59')
        );
        expect(events2.length).toBe(0);
    }));

    it('should handle load error', fakeAsync(() => {
        spyOn(console, 'error');
        service.loadAllGroups();
        httpMock.expectOne('assets/data/groups-manifest.json').flush(null, { status: 500, statusText: 'Server Error' });
        tick();
        expect(service.loading()).toBe(false);
        expect(console.error).toHaveBeenCalled();
    }));

    it('should respect active months and ignore unknown recurrence', fakeAsync(() => {
        service.loadAllGroups();
        httpMock.expectOne('assets/data/groups-manifest.json').flush(['g.json']);
        tick();

        httpMock.expectOne('assets/data/groups/g.json').flush({
            group: { id: 'g1', name: 'G1' },
            rides: [
                {
                    id: 'winter', groupId: 'g1', name: 'Winter Ride',
                    startTime: '10:00', durationMinutes: 60, recurrence: 'Weekly', dayOfWeek: 0, // Sunday
                    activeMonths: [0, 1], // Jan, Feb
                    startLocation: { type: 'Point', coordinates: [0, 0] }, startLocationLabel: 'Loc'
                },
                {
                    id: 'summer', groupId: 'g1', name: 'Summer Ride',
                    startTime: '10:00', durationMinutes: 60, recurrence: 'Weekly', dayOfWeek: 0, // Sunday
                    activeMonths: [5, 6], // Jun, Jul
                    startLocation: { type: 'Point', coordinates: [0, 0] }, startLocationLabel: 'Loc'
                },
                {
                    id: 'unknown', groupId: 'g1', name: 'Unknown Type',
                    startTime: '10:00', durationMinutes: 60, recurrence: 'flargnarg' as any,
                    startLocation: { type: 'Point', coordinates: [0, 0] }, startLocationLabel: 'Loc'
                }
            ]
        });
        tick();

        // Check January 2024 (Winter)
        // Jan 7 2024 is Sunday.
        const janEvents = service.generateEvents(new Date('2024-01-01'), new Date('2024-01-31'));
        const hasWinter = janEvents.some(e => e.title === 'Winter Ride');
        const hasSummer = janEvents.some(e => e.title === 'Summer Ride');
        const hasUnknown = janEvents.some(e => e.title === 'Unknown Type');

        expect(hasWinter).toBeTrue();
        expect(hasSummer).toBeFalse();
        expect(hasUnknown).toBeFalse();
    }));

    it('should generate Once event', fakeAsync(() => {
        service.loadAllGroups();
        httpMock.expectOne('assets/data/groups-manifest.json').flush(['g.json']);
        tick();

        httpMock.expectOne('assets/data/groups/g.json').flush({
            group: { id: 'g1', name: 'G1' },
            rides: [
                {
                    id: 'once', groupId: 'g1', name: 'One Time',
                    startTime: '10:00', durationMinutes: 60, recurrence: 'Once',
                    startDate: '2024-01-15',
                    startLocation: { type: 'Point', coordinates: [0, 0] }, startLocationLabel: 'Loc'
                }
            ]
        });
        tick();

        // Check coverage for Once event
        const events = service.generateEvents(new Date('2024-01-01'), new Date('2024-01-31'));
        expect(events.length).toBe(1);
        expect(events[0].title).toBe('One Time');
        expect(events[0].start.getDate()).toBe(15);
    }));
});

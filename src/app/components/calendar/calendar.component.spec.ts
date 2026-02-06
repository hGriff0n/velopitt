import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CalendarComponent } from './calendar.component';
import { EventService } from '../../services/event.service';
import { signal } from '@angular/core';
import { FullCalendarModule } from '@fullcalendar/angular';

class MockEventService {
    rides = signal([]);
    groups = signal([]);
    generateEvents = jasmine.createSpy('generateEvents').and.returnValue([]);
}

describe('CalendarComponent', () => {
    let component: CalendarComponent;
    let fixture: ComponentFixture<CalendarComponent>;
    let eventService: MockEventService;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [CalendarComponent, FullCalendarModule],
            providers: [
                { provide: EventService, useClass: MockEventService }
            ]
        }).compileComponents();

        fixture = TestBed.createComponent(CalendarComponent);
        component = fixture.componentInstance;
        eventService = TestBed.inject(EventService) as unknown as MockEventService;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should have initial calendar options', () => {
        const options = component.calendarOptions();
        expect(options.initialView).toBe('dayGridMonth');
        expect(options.plugins?.length).toBeGreaterThan(0);
    });
});

import { Component, ChangeDetectionStrategy, inject, signal, ViewChild, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FullCalendarModule, FullCalendarComponent } from '@fullcalendar/angular';
import { CalendarOptions } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import listPlugin from '@fullcalendar/list';
import interactionPlugin from '@fullcalendar/interaction';
import { EventService } from '../../services/event.service';
import { Router } from '@angular/router';

@Component({
    selector: 'app-calendar',
    standalone: true,
    imports: [CommonModule, FullCalendarModule],
    templateUrl: './calendar.component.html',
    styleUrl: './calendar.component.css',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class CalendarComponent {
    private eventService = inject(EventService);
    private router = inject(Router);

    @ViewChild('calendar') calendarComponent: FullCalendarComponent | undefined;

    calendarOptions = signal<CalendarOptions>({
        plugins: [dayGridPlugin, listPlugin, interactionPlugin],
        initialView: 'dayGridMonth',
        headerToolbar: {
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,listWeek'
        },
        height: 'auto',
        events: (info, success, failure) => {
            const events = this.eventService.generateEvents(info.start, info.end);
            success(events);
        },
        eventClick: (info) => {
            console.log('Event clicked', info.event);
        }
    });

    constructor() {
        // If rides data updates (e.g. finishes loading), refetch events
        effect(() => {
            this.eventService.rides(); // dependency
            this.eventService.groups(); // dependency

            // Trigger refetch if calendar exists
            if (this.calendarComponent) {
                this.calendarComponent.getApi().refetchEvents();
            }
        });
    }
}

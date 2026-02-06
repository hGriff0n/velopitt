import { Component, ChangeDetectionStrategy, inject, signal, ViewChild, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FullCalendarModule, FullCalendarComponent } from '@fullcalendar/angular';
import { CalendarOptions } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import listPlugin from '@fullcalendar/list';
import interactionPlugin from '@fullcalendar/interaction';
import { EventService } from '../../services/event.service';
import { Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';

@Component({
    selector: 'app-calendar',
    standalone: true,
    imports: [CommonModule, FullCalendarModule, MatButtonModule],
    templateUrl: './calendar.component.html',
    styleUrl: './calendar.component.css',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class CalendarComponent {
    private eventService = inject(EventService);
    private router = inject(Router);

    @ViewChild('calendar') calendarComponent: FullCalendarComponent | undefined;

    hoveredEvent = signal<{ title: string; html: string; x: number; y: number } | null>(null);

    calendarOptions = signal<CalendarOptions>({
        plugins: [dayGridPlugin, listPlugin, interactionPlugin],
        initialView: 'dayGridMonth',
        headerToolbar: {
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,listYear'
        },
        height: '100%', // Adjust height to fill container
        events: (info, success, failure) => {
            const events = this.eventService.generateEvents(info.start, info.end);
            success(events);
        },
        eventClick: (info) => {
            console.log('Event clicked', info.event);
        },
        eventMouseEnter: (info) => {
            const groupName = info.event.extendedProps['groupName'] || '';
            const location = info.event.extendedProps['locationLabel'] || '';
            const desc = info.event.extendedProps['description'] || '';

            const start = info.event.start;
            let timeString = '';
            if (start) {
                timeString = start.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
            }

            this.hoveredEvent.set({
                title: info.event.title,
                html: `<strong>${timeString}</strong> - <strong>${groupName}</strong><br>${location}<br><br>${desc}`,
                x: info.jsEvent.clientX + 15,
                y: info.jsEvent.clientY + 15
            });
        },
        eventMouseLeave: () => {
            this.hoveredEvent.set(null);
        },
        eventContent: (arg) => {
            // Custom rendering: Title + Group Name
            const groupName = arg.event.extendedProps['groupName'] || '';
            // Basic HTML structure
            return {
                html: `<div class="fc-content">
                        <div class="fc-title" style="font-weight: bold;">${arg.event.title}</div>
                        <div class="fc-group" style="font-size: 0.85em; opacity: 0.8;">${groupName}</div>
                      </div>`
            };
        }
    });

    close() {
        this.router.navigate(['/']);
    }

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

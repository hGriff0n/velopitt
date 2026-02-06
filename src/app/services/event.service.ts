import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { CyclingGroup, RideDefinition, CalendarEvent } from '../models/event-schema';

export interface GroupData {
    group: CyclingGroup;
    rides: RideDefinition[];
}

@Injectable({
    providedIn: 'root'
})
export class EventService {
    readonly groups = signal<CyclingGroup[]>([]);
    readonly rides = signal<RideDefinition[]>([]);
    readonly loading = signal<boolean>(true);

    constructor(private http: HttpClient) { }

    async loadAllGroups(): Promise<void> {
        this.loading.set(true);
        try {
            // 1. Load manifest
            const files = await firstValueFrom(this.http.get<string[]>('assets/data/groups-manifest.json'));

            const loadedGroups: CyclingGroup[] = [];
            const loadedRides: RideDefinition[] = [];

            // 2. Load each group file
            const promises = files.map(file =>
                firstValueFrom(this.http.get<GroupData>(`assets/data/groups/${file}`))
            );

            const results = await Promise.all(promises);

            results.forEach(data => {
                loadedGroups.push(data.group);
                loadedRides.push(...data.rides);
            });

            this.groups.set(loadedGroups);
            this.rides.set(loadedRides);

        } catch (err) {
            console.error('Failed to load groups', err);
        } finally {
            this.loading.set(false);
        }
    }

    generateEvents(start: Date, end: Date): CalendarEvent[] {
        const events: CalendarEvent[] = [];
        const rides = this.rides();
        const groups = this.groups();

        // Helper to find group
        const getGroup = (id: string) => groups.find(g => g.id === id);

        for (const ride of rides) {
            if (ride.recurrence === 'Weekly' && ride.dayOfWeek !== undefined) {
                let current = new Date(start);
                // Reset to start of day needed? Depends on implementation.
                // Let's just iterate days for simplicity or jump to first occurrence.

                while (current <= end) {
                    if (current.getDay() === ride.dayOfWeek) {
                        // Check active months if defined
                        if (!ride.activeMonths || ride.activeMonths.includes(current.getMonth())) {

                            // Construct event dates
                            const [hours, minutes] = ride.startTime.split(':').map(Number);

                            const eventStart = new Date(current);
                            eventStart.setHours(hours, minutes, 0, 0);

                            const eventEnd = new Date(eventStart);
                            eventEnd.setMinutes(eventEnd.getMinutes() + ride.durationMinutes);

                            const group = getGroup(ride.groupId);

                            events.push({
                                id: `${ride.id}-${current.toISOString().split('T')[0]}`,
                                title: ride.name,
                                start: eventStart,
                                end: eventEnd,
                                rideDefId: ride.id,
                                groupId: ride.groupId,
                                extendedProps: {
                                    description: ride.description,
                                    locationLabel: ride.startLocationLabel,
                                    groupName: group ? group.name : 'Unknown Group',
                                }
                            });
                        }
                    }
                    current.setDate(current.getDate() + 1);
                }
            } else if (ride.recurrence === 'Once' && ride.startDate) {
                // Handle One-Time events
                const eventDate = new Date(ride.startDate + 'T' + ride.startTime);

                if (eventDate >= start && eventDate <= end) {
                    const eventEnd = new Date(eventDate);
                    eventEnd.setMinutes(eventEnd.getMinutes() + ride.durationMinutes);

                    const group = getGroup(ride.groupId);

                    events.push({
                        id: ride.id,
                        title: ride.name,
                        start: eventDate,
                        end: eventEnd,
                        rideDefId: ride.id,
                        groupId: ride.groupId,
                        extendedProps: {
                            description: ride.description,
                            locationLabel: ride.startLocationLabel,
                            groupName: group ? group.name : 'Unknown Group',
                        }
                    });
                }
            }
            // TODO: Handle other recurrences
        }

        return events;
    }
}

import { Point } from 'geojson';

export type RecurrenceType = 'Weekly' | 'BiWeekly' | 'Monthly' | 'Once';

export interface SocialLink {
    type: 'instagram' | 'strava' | 'website' | 'facebook';
    url: string;
}

export interface CyclingGroup {
    id: string;
    name: string;
    description?: string;
    logoUrl?: string;
    website?: string;
    socials?: SocialLink[];
}

export interface RideDefinition {
    id: string;
    groupId: string;
    name: string;
    description?: string;
    startTime: string; // HH:MM format, e.g., "18:00"
    durationMinutes: number;
    startLocation: Point; // GeoJSON Point
    startLocationLabel: string; // "Market Square", etc.
    recurrence: RecurrenceType;
    dayOfWeek?: number; // 0=Sunday, 1=Monday... for Weekly
    activeMonths?: number[]; // [0, 1...11] - for seasonality
}

export interface CalendarEvent {
    id: string;
    title: string;
    start: Date;
    end: Date;
    rideDefId: string;
    groupId: string;
    extendedProps: {
        description?: string;
        locationLabel?: string;
        groupName: string;
        intensity?: string; // e.g. "Drop", "No-Drop"
    };
}

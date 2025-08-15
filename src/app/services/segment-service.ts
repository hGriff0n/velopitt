import { Injectable } from '@angular/core';

import * as jsonData from './assets/segment.json';

@Injectable({ providedIn: 'root' })
export class SegmentService {
    private segmentList: Segment[] = [];

    constructor() {
        this.segmentList = Array.from((jsonData as any).default);
    }

    getAllSegments(): Segment[] {
        return this.segmentList;
    }

    getSegmentByDomId(id: number): Segment | undefined {
        return this.segmentList.at(id);
    }

    directionVector(segment: Segment): Vector2D {
        const start_latlng = segment.start_latlng;
        const end_latlng = segment.end_latlng;
        return [
            end_latlng[0] - start_latlng[0], // latitude difference
            end_latlng[1] - start_latlng[1]  // longitude difference
        ];
    }
}

type Vector2D = [number, number];

type AthleteStats = {
    pr_elapsed_time: number;
    pr_date: string;
    pr_visibility: string;
    pr_activity_id: number;
    pr_activity_visibility: string;
    effort_count: number;
};

type KomInformation = {
    kom: string;
    qom: string;
    overall: string;
    destination: {
        href: string;
        type: string;
        name: string;
    };
};

type LocalLegendStats = {
    athlete_id: number;
    title: string;
    profile: string;
    effort_description: string;
    effort_count: string;
    effort_counts: {
        overall: string;
        female: string;
    };
    destination: string;
};

export type Segment = {
    id: number;
    resource_state: number;
    name: string;
    activity_type: string;
    distance: number;
    average_grade: number;
    maximum_grade: number;
    elevation_high: number;
    elevation_low: number;
    start_latlng: Vector2D;
    end_latlng: Vector2D;
    elevation_profile: string;
    elevation_profiles: {
        light_url: string;
        dark_url: string;
    };
    climb_category: number;
    city: string;
    state: string;
    country: string;
    // Can you skip fields when casting from json?
    private: boolean;
    hazardous: boolean;
    starred: boolean;
    created_at: string;
    updated_at: string;
    total_elevation_gain: number;
    map: {
        id: string;
        polyline: string;
        resource_state: number;
    };
    effort_count: number;
    athlete_count: number;
    star_count: number;
    athlete_segment_stats: AthleteStats;
    xoms: KomInformation;
    local_legend: LocalLegendStats;
};
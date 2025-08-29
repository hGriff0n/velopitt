import { Injectable } from '@angular/core';

import * as jsonData from './assets/segment.json';

@Injectable({ providedIn: 'root' })
export class SegmentService {
    private segmentList: Segment[] = [];

    constructor() {
        this.segmentList = Array.from((jsonData as any).default).map(segment => {
            const s = <Segment>segment;
            s.start_latlng.reverse();
            s.end_latlng.reverse();
            return s;
        });
    }

    getAllSegments(): Segment[] {
        return this.segmentList;
    }

    getSegmentByDomId(id: number): Segment | undefined {
        return this.segmentList.at(id);
    }

    // TODO: me - these should probably be methods on the segment
    directionVector(segment: Segment): Vector2D {
        const start_latlng = segment.start_latlng;
        const end_latlng = segment.end_latlng;
        return [
            end_latlng[0] - start_latlng[0], // latitude difference
            end_latlng[1] - start_latlng[1]  // longitude difference
        ];
    }

    midpoint(segment: Segment): Vector2D {
        const start_latlng = segment.start_latlng;
        const end_latlng = segment.end_latlng;
        return [
            (start_latlng[0] + end_latlng[0]) / 2,
            (start_latlng[1] + end_latlng[1]) / 2
        ];
    }

    vectorToBearing(vector: [number, number]): number {
        const [dx, dy] = vector;
        let angle = Math.atan2(dx, dy) * (180 / Math.PI); // Note: dx, dy order swapped
        if (angle < 0) angle += 360;
        return angle;
    }
}

type Vector2D = [number, number];

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

type SegmentRef = {
    id: number;
    name: string;
    desc: string;
};

type CameraLocation = {
    location: Vector2D;
    bearing: number;
    zoom: number;
    height: number;
};

export type Segment = {
    id: number;
    name: string;
    activity_type: string;
    distance: number;
    average_grade: number;
    maximum_grade: number;
    elevation_high: number;
    elevation_low: number;
    start_latlng: Vector2D;
    end_latlng: Vector2D;
    climb_category: number;
    city: string;
    state: string;
    country: string;
    created_at: string;
    updated_at: string;
    total_elevation_gain: number;
    map: {
        id: string;
        polyline: string;
    };
    xoms: KomInformation;
    pacing_notes: string;
    summary: string;
    related_segments: SegmentRef[];
    camera: CameraLocation | undefined;
};
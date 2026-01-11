import { Injectable } from '@angular/core';
import { InteractionEvent, Map, MapEvent, Popup, Marker } from 'mapbox-gl';

import * as jsonData from './assets/segment.json';
import * as turf from '@turf/turf';
import * as polyline from '@mapbox/polyline';

@Injectable({ providedIn: 'root' })
export class SegmentService {
    private segmentList: Segment[] = [];
    static MAX_SEGMENTS = 10;

    constructor() {
        this.segmentList = Array.from((jsonData as any).default).map(segment => {
            const s = segment as Segment;
            s.start_latlng.reverse();
            s.end_latlng.reverse();

            s.map.geojson = polyline.toGeoJSON(s.map.polyline as string);
            s.map.segment_distance = s.distance / SegmentService.MAX_SEGMENTS;
            return s;
        });
    }

    // This has to be in a separate function because the map is not guaranteed to be available
    // when the service is initially loaded
    updateSegmentMapData(id: number, map: Map): void {
        const segment = this.segmentList.find(s => s.id === id);
        if (segment == null) {
            throw new Error(`Segment with id ${id} not found`);
        }

        const chunks = turf.lineChunk(segment.map.geojson, segment.map.segment_distance, { units: 'meters' }).features;
        segment.map.elevation_data = [
            ...chunks.map((feature) => {
                return map.queryTerrainElevation([
                    feature.geometry.coordinates[0][0],
                    feature.geometry.coordinates[0][1]
                ]);
            }),
            // do not forget the last coordinate
            map.queryTerrainElevation(
                [chunks[chunks.length - 1].geometry.coordinates[1][0],
                chunks[chunks.length - 1].geometry.coordinates[1][1]]
            )
        ] as number[];
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

interface KomInformation {
    kom: string;
    qom: string;
    overall: string;
    destination: {
        href: string;
        type: string;
        name: string;
    };
}

interface SegmentRef {
    id: number;
    name: string;
    desc: string;
}

interface CameraLocation {
    location: Vector2D;
    bearing: number;
    zoom: number;
    height: number;
}

export interface Segment {
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
        geojson: GeoJSON.LineString;
        elevation_data: number[];
        segment_distance: number;
    };
    xoms: KomInformation;
    pacing_notes: string;
    summary: string;
    related_segments: SegmentRef[];
    camera: CameraLocation | undefined;
}

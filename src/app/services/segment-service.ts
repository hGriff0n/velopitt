import { Injectable } from '@angular/core';

import * as jsonData from './assets/segment.json';

@Injectable({ providedIn: 'root' })
export class SegmentService {
    private segments = new Map<number, {[key: string]: any}>();

    constructor() {
        (jsonData as any).default.forEach((segment: any) => {
            let s = segment as {[key: string]: any};
            this.segments.set(s['id'], s);
        });
    }

    getSegment(id: number): {[key: string]: any} | null {
        return this.segments.get(id) || null;
    }
}
import { Injectable } from '@angular/core';
import { Map } from 'mapbox-gl';

import * as jsonData from './assets/mapgeo.json';

@Injectable({ providedIn: 'root' })
export class OverlayService {
    private layer: GeoJson[] = [];
    private hoveredRegions = new Set<number>();

    constructor() {
        console.log(jsonData);
        this.layer = Array.from((jsonData as any).default).map(segment => {
            const s = <GeoJson>segment;
            s.features.forEach(feature => {
                feature.geometry.coordinates.forEach(coord => coord.reverse());
            });
            return s;
        });
    }

    getRegionLayer(): GeoJson[] {
        return this.layer;
    }

    registerWithMap(map: Map) {
        console.log(this.layer[0]);
        map.addSource('regions', {
            type: 'geojson',
            generateId: true,
            data: this.layer[0]
        });
        // TODO: me - Add a hover effect (https://docs.mapbox.com/mapbox-gl-js/example/hover-styles/)
        // Probably also want to make the colors slightly different
        map.addLayer({
            id: 'regions',
            type: 'fill',
            source: 'regions',
            layout: {},
            paint: {
                'fill-color': [
                    'case',
                    ['boolean', ['feature-state', 'hover'], false],
                    '#3A3939',
                    '#888'
                ],
                'fill-opacity': 0.5
            }
        });
        map.addLayer({
            id: 'region-borders',
            type: 'line',
            source: 'regions',
            layout: {},
            paint: {
                'line-color': '#627BC1',
                'line-width': 2
            }
        });

        map.addInteraction('region-enter', {
            type: 'mouseenter',
            target: { layerId: 'regions' },
            handler: (e) => {
                var regionid = e.feature?.id as number;
                if (!this.hoveredRegions.has(regionid)) {
                    this.hoveredRegions.add(regionid);
                    map.setFeatureState({ source: 'regions', id: regionid }, { hover: true });
                }
            }
        });
        map.addInteraction('region-exit', {
            type: 'mouseleave',
            target: { layerId: 'regions' },
            handler: (e) => {
                var regionid = e.feature?.id as number;
                if (this.hoveredRegions.has(regionid)) {
                    this.hoveredRegions.delete(regionid);
                    map.setFeatureState({ source: 'regions', id: regionid }, { hover: false });
                }
            }
        });
    }
}

export type GeoJson = {
    type: "FeatureCollection";
    features: Feature[];
};

type Feature = {
    type: "Feature";
    properties: {
        name?: string;
        [key: string]: any;
    };
    geometry: {
        type: "Polygon";
        coordinates: number[][][];
    };
    id?: number;
};
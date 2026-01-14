import { Injectable, signal, inject } from '@angular/core';
import { ThemeService } from './theme-service';
import { Map } from 'mapbox-gl';

import * as jsonData from './assets/mapgeo.json';
import * as bikePlus from './assets/bikeplus.json';

@Injectable({ providedIn: 'root' })
export class LayerService {
    private layer: GeoJson[] = [];
    private bikePlusLayer: GeoJson[] = [];
    private readonly bikePlusVisible = signal(false);
    private hoveredRegions = new Set<number>();
    private themeService = inject(ThemeService);

    constructor() {
        this.layer = Array.from((jsonData as any).default).map(segment => {
            return segment as GeoJson;
        });
        this.bikePlusLayer = Array.from((bikePlus as any).default).map(segment => {
            return segment as GeoJson;
        });
    }

    getRegionLayer(): GeoJson[] {
        return this.layer;
    }

    registerWithMap(map: Map, isVisible: boolean) {
        map.addSource('bikeplus', {
            type: 'geojson',
            generateId: true,
            data: this.bikePlusLayer[0]
        });
        map.addLayer({
            id: 'bikeplus',
            type: 'line',
            source: 'bikeplus',
            paint: {
                'line-color': this.themeService.getThemeColor('--sys-layer-bikeplus'),
                'line-width': 5,
                'line-opacity': 0
            }
        });

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
                    this.themeService.getThemeColor('--sys-primary'),
                    this.themeService.getThemeColor('--sys-secondary')
                ],
                'fill-opacity': 0
            }
        });
        map.addLayer({
            id: 'region-borders',
            type: 'line',
            source: 'regions',
            layout: {},
            paint: {
                'line-color': this.themeService.getThemeColor('--sys-secondary'),
                'line-width': 2,
                'line-opacity': 0,
            }
        });

        map.addInteraction('region-enter', {
            type: 'mouseenter',
            target: { layerId: 'regions' },
            handler: (e) => {
                const regionid = e.feature?.id as number;
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
                const regionid = e.feature?.id as number;
                if (this.hoveredRegions.has(regionid)) {
                    this.hoveredRegions.delete(regionid);
                    map.setFeatureState({ source: 'regions', id: regionid }, { hover: false });
                }
            }
        });

        if (isVisible) {
            this.setRegionVisibility(map, true);
        }
    }

    public setRegionVisibility(map: Map, isVisible: boolean) {
        map.setPaintProperty('regions', 'fill-opacity', isVisible ? 0.2 : 0);
        map.setPaintProperty('region-borders', 'line-opacity', isVisible ? 1 : 0);
    }

    public toggleBikePlus(map: Map) {
        this.bikePlusVisible.update(v => !v);
        map.setPaintProperty('bikeplus', 'line-opacity', this.bikePlusVisible() ? 0.9 : 0);
    }

    // TODO: me - these should probably be managed with "toggles" similar to bike plus
    public setBikeNetworkVisibility(map: Map, isVisible: boolean) {
        ["bike-network-sharrow", "bike-network-lane", "bike-network-protected", "bike-network-trails", "bike-network-sidewalks"].forEach(layerId => {
            if (map.getLayer(layerId)) {
                map.setLayoutProperty(layerId, "visibility", isVisible ? "visible" : "none");
            }
        });
    }
}

export interface GeoJson {
    type: "FeatureCollection";
    features: Feature[];
}

interface Feature {
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
}

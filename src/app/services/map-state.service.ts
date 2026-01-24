import { Injectable, signal, inject } from '@angular/core';
import { Map, Marker, LngLatLike } from 'mapbox-gl';
import { SegmentService } from './segment-service';
import { ThemeService } from './theme-service';

@Injectable({ providedIn: 'root' })
export class MapStateService {
    private map = signal<Map | undefined>(undefined);
    private segmentService = inject(SegmentService);
    private themeService = inject(ThemeService);

    public readonly zoom = signal(15);
    public readonly center = signal<[number, number]>([-79.997, 40.44]);
    public readonly pitch = signal(70);
    public readonly bearing = signal(90);

    // Track focused segments
    private focusedSegment = new Set<number>();
    private segmentMarkers: Marker[] = [];

    setMap(map: Map) {
        this.map.set(map);

        // Sync initial state
        this.updateState(map);

        map.on('move', () => this.updateState(map));
        map.on('zoom', () => this.updateState(map));
        map.on('rotate', () => this.updateState(map));
        map.on('pitch', () => this.updateState(map));
    }

    private updateState(map: Map) {
        const center = map.getCenter();
        this.center.set([center.lng, center.lat]);
        this.zoom.set(map.getZoom());
        this.pitch.set(map.getPitch());
        this.bearing.set(map.getBearing());
    }

    getMap() {
        return this.map();
    }

    flyTo(options: any) {
        this.map()?.flyTo(options);
    }

    // --- Moved Logic from MapComponent ---

    addAllSegments(map: Map, isVisible: boolean) {
        // Initial colors from theme service
        const unselectedColor = this.themeService.getThemeColor('--sys-segment-unselected');
        const selectedColor = this.themeService.getThemeColor('--sys-segment-selected');

        map.addSource("segments", {
            type: 'geojson',
            generateId: true,
            data: {
                type: 'FeatureCollection',
                features: this.segmentService.getAllSegments().map(segment => {
                    this.segmentService.updateSegmentMapData(segment.id, map);
                    return {
                        type: 'Feature',
                        properties: {},
                        geometry: segment.map.geojson
                    };
                })
            }
        });

        map.addLayer({
            id: "segments-layer",
            type: 'line',
            source: "segments",
            layout: { 'line-join': 'round', 'line-cap': 'round' },
            paint: {
                'line-emissive-strength': 1,
                'line-color': [
                    'case',
                    ['boolean', ['feature-state', 'selected'], false],
                    selectedColor,
                    unselectedColor
                ],
                'line-width': [
                    'interpolate',
                    ['exponential', 2],
                    ['zoom'],
                    0, ["*", 12, ["^", 2, -6]],
                    24, ["*", 12, ["^", 2, 8]]
                ],
                'line-opacity': 0,
            }
        });

        this.segmentMarkers = this.segmentService.getAllSegments().map(segment => {
            const markerColor = this.themeService.getThemeColor('--sys-marker');
            return this.createMarker(segment.start_latlng as LngLatLike, markerColor);
        });

        this.toggleSegmentLayer(map, isVisible);
    }

    addInteractions(map: Map, callbacks: {
        onClick: (id: number, lngLat: any) => void,
        onHover: (id: number) => void,
        onLeave: (id: number) => void
    }) {
        map.addInteraction('segment-clicks', {
            type: 'click',
            target: { layerId: "segments-layer" },
            handler: (e: any) => callbacks.onClick(e.feature?.id as number, e.lngLat)
        });

        map.addInteraction('segments-hover', {
            type: 'mouseenter',
            target: { layerId: "segments-layer" },
            handler: (e: any) => {
                map.getCanvas().style.cursor = 'pointer';
                callbacks.onHover(e.feature?.id as number);
            }
        });

        map.addInteraction('segments-leave', {
            type: 'mouseleave',
            target: { layerId: "segments-layer" },
            handler: (e: any) => {
                callbacks.onLeave(e.feature?.id as number);
                map.getCanvas().style.cursor = 'default';
            }
        });

        // Also attach click handlers to markers
        this.segmentMarkers.forEach((marker, index) => {
            const segment = this.segmentService.getAllSegments()[index];
            marker.on('click', () => {
                callbacks.onClick(segment.id, segment.start_latlng);
            });
        });
    }


    toggleSegmentLayer(map: Map, isVisible: boolean) {
        if (isVisible) {
            this.segmentMarkers.forEach(marker => marker.addTo(map));
        } else {
            this.segmentMarkers.forEach(marker => marker.remove());
        }
        if (map.getLayer("segments-layer")) {
            map.setPaintProperty("segments-layer", "line-opacity", isVisible ? 1 : 0);
        }
    }

    updateMapTheme(map: Map) {
        const unselectedColor = this.themeService.getThemeColor('--sys-segment-unselected');
        const selectedColor = this.themeService.getThemeColor('--sys-segment-selected');

        if (map.getLayer('segments-layer')) {
            map.setPaintProperty('segments-layer', 'line-color', [
                'case',
                ['boolean', ['feature-state', 'selected'], false],
                selectedColor,
                unselectedColor
            ]);
        }
    }

    highlightSegment(map: Map, segmentId: number, isSelected: boolean) {
        map.setFeatureState({
            source: "segments",
            id: segmentId
        }, { selected: isSelected });

        if (isSelected) {
            this.focusedSegment.add(segmentId);
        } else {
            this.focusedSegment.delete(segmentId);
        }
    }

    clearHighlights(map: Map, exceptId?: number) {
        this.focusedSegment.forEach(id => {
            if (id !== exceptId) this.highlightSegment(map, id, false);
        });
        if (exceptId === undefined) {
            this.focusedSegment.clear();
        }
    }

    protected createMarker(lngLat: LngLatLike, color: string): Marker {
        return new Marker({ color })
            .setLngLat(lngLat);
    }
}

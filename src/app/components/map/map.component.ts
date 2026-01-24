import { Component, ChangeDetectionStrategy, inject, effect, input, output, ViewChild, ElementRef, AfterViewInit, OnDestroy, signal } from '@angular/core';
import { Map, MapEvent, MapMouseEvent, NavigationControl, ScaleControl, GeolocateControl, Popup, Marker, LngLatLike } from 'mapbox-gl';
import { ConfigService } from '../../services/config-service';
import { SegmentService, Segment } from '../../services/segment-service';
import { LayerService } from '../../services/layer-service';
import { ThemeService } from '../../services/theme-service';
import { MapStateService } from '../../services/map-state.service';

@Component({
    selector: 'app-map',
    template: '<div id="map" #mapContainer></div>',
    styles: [`
    #map {
      width: 100%;
      height: 100%;
      position: absolute;
      top: 0;
      bottom: 0;
      left: 0;
      right: 0;
    }
  `],
    standalone: true,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppMapComponent implements AfterViewInit, OnDestroy {
    private config = inject(ConfigService);
    private segmentService = inject(SegmentService);
    private layerService = inject(LayerService);
    private themeService = inject(ThemeService);
    private mapStateService = inject(MapStateService);

    // Inputs for layer visibility
    regionShowing = input(false);
    segmentShowing = input(false);
    bikemapShowing = input(true);
    bikemapPlusShowing = input(false);
    selectedSegmentId = input<number>(0);

    // Outputs
    segmentSelected = output<number>();
    mapLoaded = output<Map>();

    @ViewChild('mapContainer', { static: true }) mapContainer!: ElementRef;
    private mapSignal = signal<Map | undefined>(undefined);
    private mapInstance: Map | undefined;
    private segmentMarkers: Marker[] = [];
    private focusedSegment = new Set<number>();

    constructor() {
        // Effect to handle layer visibility changes and theme updates
        effect(() => {
            const map = this.mapSignal();
            const themeChange = this.themeService.themeChanged(); // dependency on theme change
            if (!map) return;

            this.layerService.setRegionVisibility(map, this.regionShowing());
            this.layerService.setBikeNetworkVisibility(map, this.bikemapShowing());
            this.toggleSegmentLayer(this.segmentShowing());

            // Update theme colors`
            this.updateMapTheme(map);

            // Handle selection changes from parent (e.g. overlay close)
            const currentSelected = this.selectedSegmentId();
            if (currentSelected <= 0 && this.focusedSegment.size > 0) {
                this.focusedSegment.forEach(id => this.highlightSegment(id, false));
                this.focusedSegment.clear();
            }
        });
    }

    ngAfterViewInit() {
        this.mapInstance = new Map({
            container: this.mapContainer.nativeElement,
            style: 'mapbox://styles/hgriff0n/cmds2q1t100u101s2063wbeh6',
            center: [-79.997, 40.44],
            zoom: 15,
            bearing: 90,
            pitch: 70,
            accessToken: this.config.mapbox.api_key
        });

        this.mapInstance.on('load', (e) => this.onLoad(e));
        this.mapInstance.on('click', (e) => this.onMapClick(e));
    }

    ngOnDestroy() {
        this.mapInstance?.remove();
    }

    private onLoad(event: MapEvent) {
        this.mapInstance = event.target;
        this.mapInstance.resize();
        this.mapInstance.getCanvas().style.cursor = 'default';

        // Register layers
        this.layerService.registerWithMap(this.mapInstance, this.regionShowing());
        this.addAllSegments();

        // Register with state service
        this.mapStateService.setMap(this.mapInstance);

        // Update mapSignal to trigger effect
        this.mapSignal.set(this.mapInstance);
        this.mapLoaded.emit(this.mapInstance);
    }

    private updateMapTheme(map: Map) {
        // Read current theme colors from CSS variables
        const unselectedColor = this.themeService.getThemeColor('--sys-segment-unselected');
        const selectedColor = this.themeService.getThemeColor('--sys-segment-selected');

        // Update Segment Layer Colors
        if (map.getLayer('segments-layer')) {
            map.setPaintProperty('segments-layer', 'line-color', [
                'case',
                ['boolean', ['feature-state', 'selected'], false],
                selectedColor,
                unselectedColor
            ]);
        }

        // Update Markers (Standard markers, not the overlay)
        this.segmentMarkers.forEach(marker => {
            // Note: Mapbox GL JS Markers created with default DOM element don't have easy API to change color after creation
            // if we are using the default SVG. 
            // We might need to recreate them or use a custom element that inherits color?
            // For now, let's assume valid 'color' option only works on creation.
            // If we want dynamic updates, we'd need custom elements or remove/add.
            // Skipping complex marker updates for now as user prioritized site/layer colors.
        });
    }

    private addAllSegments() {
        if (!this.mapInstance) return;

        // Initial colors from theme service
        const unselectedColor = this.themeService.getThemeColor('--sys-segment-unselected');
        const selectedColor = this.themeService.getThemeColor('--sys-segment-selected');

        this.mapInstance.addSource("segments", {
            type: 'geojson',
            generateId: true,
            data: {
                type: 'FeatureCollection',
                features: this.segmentService.getAllSegments().map(segment => {
                    this.segmentService.updateSegmentMapData(segment.id, this.mapInstance as Map);
                    return {
                        type: 'Feature',
                        properties: {},
                        geometry: segment.map.geojson
                    };
                })
            }
        });

        this.mapInstance.addLayer({
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

        this.mapInstance.addInteraction('segment-clicks', {
            type: 'click',
            target: { layerId: "segments-layer" },
            handler: (e: any) => this.handleSegmentClickEvent(e.feature?.id as number, e.lngLat)
        });

        this.mapInstance.addInteraction('segments-hover', {
            type: 'mouseenter',
            target: { layerId: "segments-layer" },
            handler: (e: any) => {
                if (!this.mapInstance) return;
                this.mapInstance.getCanvas().style.cursor = 'pointer';
                this.highlightSegment(e.feature?.id as number, true);
            }
        });

        this.mapInstance.addInteraction('segments-leave', {
            type: 'mouseleave',
            target: { layerId: "segments-layer" },
            handler: (e: any) => {
                if (!this.mapInstance) return;
                if (!this.focusedSegment.has(e.feature?.id as number)) {
                    this.highlightSegment(e.feature?.id as number, false);
                }
                this.mapInstance.getCanvas().style.cursor = 'default';
            }
        });

        this.segmentMarkers = this.segmentService.getAllSegments().map(segment => {
            const markerColor = this.themeService.getThemeColor('--sys-marker');
            return new Marker({ color: markerColor })
                .setLngLat(segment.start_latlng as LngLatLike)
                .on('click', () => {
                    this.handleSegmentClickEvent(segment.id, segment.start_latlng);
                });
        });

        this.toggleSegmentLayer(this.segmentShowing());
    }

    private toggleSegmentLayer(isVisible: boolean) {
        if (!this.mapInstance) return;

        if (isVisible) {
            this.segmentMarkers.forEach(marker => marker.addTo(this.mapInstance!));
        } else {
            this.segmentMarkers.forEach(marker => marker.remove());
        }
        if (this.mapInstance.getLayer("segments-layer")) {
            this.mapInstance.setPaintProperty("segments-layer", "line-opacity", isVisible ? 1 : 0);
        }
    }

    private highlightSegment(segmentId: number, isSelected: boolean) {
        this.mapInstance?.setFeatureState({
            source: "segments",
            id: segmentId
        }, { selected: isSelected });
    }

    private handleSegmentClickEvent(segmentId: number, lnglat: any) {
        this.segmentSelected.emit(segmentId);

        const segment = this.segmentService.getSegmentByDomId(segmentId) as Segment;
        if (!segment) return;

        this.mapStateService.flyTo({
            center: segment.start_latlng as [number, number],
            bearing: this.segmentService.vectorToBearing(
                this.segmentService.directionVector(segment)),
            zoom: 16,
            speed: 0.8
        });

        // Clear previous highlights if any (single select mode)
        this.focusedSegment.forEach(id => {
            if (id !== segmentId) this.highlightSegment(id, false);
        });
        this.focusedSegment.clear();
        this.focusedSegment.add(segmentId);
        this.highlightSegment(segmentId, true);
    }

    private onMapClick(e: MapMouseEvent) {
        if (!this.mapInstance) return;

        // Check if we clicked on a segment
        const features = this.mapInstance.queryRenderedFeatures(e.point, { layers: ['segments-layer'] });

        // If we didn't click a segment, and we have a segment selected, deselect it
        if (features.length === 0 && this.selectedSegmentId() > 0) {
            this.segmentSelected.emit(-1);
        }
    }
}

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

    constructor() {
        // Effect to handle layer visibility changes and theme updates
        effect(() => {
            const map = this.mapSignal();
            const themeChange = this.themeService.themeChanged(); // dependency on theme change
            if (!map) return;

            this.layerService.setRegionVisibility(map, this.regionShowing());
            this.layerService.setBikeNetworkVisibility(map, this.bikemapShowing());

            this.mapStateService.toggleSegmentLayer(map, this.segmentShowing());
            this.mapStateService.updateMapTheme(map);

            // Handle selection changes from parent (e.g. overlay close)
            const currentSelected = this.selectedSegmentId();

            // If nothing is selected, clear highlights
            if (currentSelected <= 0) {
                this.mapStateService.clearHighlights(map);
            } else {
                // If something IS selected, ensure it's highlighted and map handles it?
                // Actually the service handles the highlight state if we tell it.
                // But typically the click handler does it.
                // If the selection comes from OUTSIDE (e.g. valid ID passed in), we should highlight it.
                this.mapStateService.highlightSegment(map, currentSelected, true);
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

        // Delegate to Service
        this.mapStateService.setMap(this.mapInstance);
        this.mapStateService.addAllSegments(this.mapInstance, this.segmentShowing());

        this.mapStateService.addInteractions(this.mapInstance, {
            onClick: (id, lngLat) => this.handleSegmentClickEvent(id, lngLat),
            onHover: (id) => this.mapStateService.highlightSegment(this.mapInstance!, id, true),
            onLeave: (id) => {
                // Only unhighlight if it's NOT the selected one
                if (id !== this.selectedSegmentId()) {
                    this.mapStateService.highlightSegment(this.mapInstance!, id, false);
                }
            }
        });

        // Update mapSignal to trigger effect
        this.mapSignal.set(this.mapInstance);
        this.mapLoaded.emit(this.mapInstance);
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

        // Update Service State
        this.mapStateService.clearHighlights(this.mapInstance!, segmentId);
        this.mapStateService.highlightSegment(this.mapInstance!, segmentId, true);
    }

    private onMapClick(e: MapMouseEvent) {
        if (!this.mapInstance) return;

        // Check if we clicked on a segment
        const features = this.mapInstance.queryRenderedFeatures(e.point, { layers: ['segments-layer'] });

        // If we didn't click a segment, and we have a segment selected, deselect it
        if (features.length === 0 && this.selectedSegmentId() > 0) {
            this.segmentSelected.emit(-1);
            this.mapStateService.clearHighlights(this.mapInstance);
        }
    }
}

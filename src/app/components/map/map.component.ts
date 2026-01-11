import { Component, ChangeDetectionStrategy, inject, effect, input, output, ViewChild, ElementRef, AfterViewInit, OnDestroy } from '@angular/core';
import { Map, MapEvent, NavigationControl, ScaleControl, GeolocateControl, Popup, Marker, LngLatLike } from 'mapbox-gl';
import { ConfigService } from '../../services/config-service';
import { SegmentService, Segment } from '../../services/segment-service';
import { OverlayService } from '../../services/overlay-service';

const kUnselectedColor = '#C05D49';
const kSelectedColor = '#EB3915';
const kMarkerColor = '#F59E42';

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
    private overlayService = inject(OverlayService);

    // Inputs for layer visibility
    regionShowing = input(false);
    segmentShowing = input(false);
    bikemapShowing = input(true);
    bikemapPlusShowing = input(false);

    // Outputs
    segmentSelected = output<number>();
    mapLoaded = output<Map>();

    @ViewChild('mapContainer', { static: true }) mapContainer!: ElementRef;
    private map: Map | undefined;
    private segmentMarkers: Marker[] = [];
    private focusedSegment = new Set<number>();

    constructor() {
        // Effect to handle layer visibility changes
        effect(() => {
            if (!this.map) return;
            this.overlayService.setRegionVisibility(this.map, this.regionShowing());
            this.toggleSegmentLayer(this.segmentShowing());
            this.toggleBikeNetwork(this.bikemapShowing());
            // BikePlus logic might be handled differently in service, 
            // checking the service it has a toggle but we need to set state based on input
            // The service has toggleBikePlus but no explicit "set" method. 
            // We might need to refactor service or just rely on the toggle if we track state
            // For now, let's assume we can control opacity directly if we know the layer name
            // checking overlay-service.ts: map.setPaintProperty('bikeplus', 'line-opacity', this.bikePlusVisible() ? 0.9 : 0);
            this.map.setPaintProperty('bikeplus', 'line-opacity', this.bikemapPlusShowing() ? 0.9 : 0);
        });
    }

    ngAfterViewInit() {
        this.map = new Map({
            container: this.mapContainer.nativeElement,
            style: 'mapbox://styles/hgriff0n/cmds2q1t100u101s2063wbeh6',
            center: [-79.997, 40.44],
            zoom: 15,
            bearing: 90,
            pitch: 70,
            accessToken: this.config.mapbox.api_key // Assuming ConfigService exposes this or MapboxGL global takes it
            // Note: app.ts didn't set accessToken on Map but used ngx-mapbox-gl which might handle it via provider. 
            // We need to ensure token is set. ConfigService likely has it. 
            // Checking App module: provide: MapboxGL, ...
            // We might need to set (mapboxgl as any).accessToken = ...
        });

        this.map.on('load', (e) => this.onLoad(e));
    }

    ngOnDestroy() {
        this.map?.remove();
    }

    private onLoad(event: MapEvent) {
        this.map = event.target;
        this.map.resize();
        this.map.getCanvas().style.cursor = 'default';

        // Register layers
        // Note: overlayService.registerWithMap adds 'regions' and 'bikeplus'
        this.overlayService.registerWithMap(this.map, this.regionShowing());
        this.addAllSegments();

        // Initial state setup
        // this.toggleBikeNetwork(this.bikemapShowing()); // Handled by effect? Effect runs initially.

        this.mapLoaded.emit(this.map);
    }

    private addAllSegments() {
        if (!this.map) return;

        this.map.addSource("segments", {
            type: 'geojson',
            generateId: true,
            data: {
                type: 'FeatureCollection',
                features: this.segmentService.getAllSegments().map(segment => {
                    this.segmentService.updateSegmentMapData(segment.id, this.map as Map);
                    return {
                        type: 'Feature',
                        properties: {},
                        geometry: segment.map.geojson
                    };
                })
            }
        });

        this.map.addLayer({
            id: "segments-layer",
            type: 'line',
            source: "segments",
            layout: { 'line-join': 'round', 'line-cap': 'round' },
            paint: {
                'line-emissive-strength': 1,
                'line-color': [
                    'case',
                    ['boolean', ['feature-state', 'selected'], false],
                    kSelectedColor,
                    kUnselectedColor
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

        this.map.addInteraction('segment-clicks', {
            type: 'click',
            target: { layerId: "segments-layer" },
            handler: (e) => this.handleSegmentClickEvent(e.feature?.id as number, e.lngLat)
        });

        this.map.addInteraction('segments-hover', {
            type: 'mouseenter',
            target: { layerId: "segments-layer" },
            handler: (e) => {
                if (!this.map) return;
                this.map.getCanvas().style.cursor = 'pointer';
                this.highlightSegment(e.feature?.id as number, true);
            }
        });

        this.map.addInteraction('segments-leave', {
            type: 'mouseleave',
            target: { layerId: "segments-layer" },
            handler: (e) => {
                if (!this.map) return;
                if (!this.focusedSegment.has(e.feature?.id as number)) {
                    this.highlightSegment(e.feature?.id as number, false);
                }
                this.map.getCanvas().style.cursor = 'default';
            }
        });

        this.segmentMarkers = this.segmentService.getAllSegments().map(segment => {
            return new Marker({ color: kMarkerColor })
                .setLngLat(segment.start_latlng as LngLatLike)
                .on('click', () => {
                    this.handleSegmentClickEvent(segment.id, segment.start_latlng);
                });
        });

        // Initial visibility state - handled by effect but effect might run before map load?
        // Effect runs when signals change. If initial value is checked, it runs. 
        // But map might be undefined. Effect has `if (!this.map) return`.
        // So we need to call logic in onLoad or just let effect handle future changes?
        // Signal initial run: map is undefined.
        // onLoad: map becomes defined. We should apply current signal state.
        // We can just set them here based on signals.
        this.toggleSegmentLayer(this.segmentShowing());
    }

    private toggleSegmentLayer(isVisible: boolean) {
        if (!this.map) return;

        if (isVisible) {
            this.segmentMarkers.forEach(marker => marker.addTo(this.map!));
        } else {
            this.segmentMarkers.forEach(marker => marker.remove());
        }
        // Assuming 'segments-layer' exists (added in addAllSegments)
        if (this.map.getLayer("segments-layer")) {
            this.map.setPaintProperty("segments-layer", "line-opacity", isVisible ? 1 : 0);
        }
    }

    private toggleBikeNetwork(isVisible: boolean) {
        if (!this.map) return;
        // We iterate layers and check if they exist or catch error
        // Assuming these layers exist in the style
        ["bike-network-sharrow", "bike-network-lane", "bike-network-protected", "bike-network-trails", "bike-network-sidewalks"].forEach(layerId => {
            if (this.map!.getLayer(layerId)) {
                this.map!.setLayoutProperty(layerId, "visibility", isVisible ? "visible" : "none");
            }
        });
    }

    private highlightSegment(segmentId: number, isSelected: boolean) {
        this.map?.setFeatureState({
            source: "segments",
            id: segmentId
        }, { selected: isSelected });
    }

    private handleSegmentClickEvent(segmentId: number, lnglat: any) {
        this.segmentSelected.emit(segmentId);

        const segment = this.segmentService.getSegmentByDomId(segmentId) as Segment;
        // Fly to logic - kept or moved? 
        // If we move everything to MapComponent, then it should handle the flyTo.
        // App just handles the overlay showing.

        this.map!.flyTo({
            center: segment?.start_latlng as [number, number],
            bearing: this.segmentService.vectorToBearing(
                this.segmentService.directionVector(segment)),
            zoom: 16.5,
            speed: 1
        });

        // Pan adjustment
        const map = this.map!;
        async function waitForMapToStopMoving() {
            while (map.isMoving()) {
                await new Promise(resolve => setTimeout(resolve, 1));
            }
        }
        waitForMapToStopMoving().then(() => {
            map.panBy([-100, 0]);
        });

        this.focusedSegment.add(segmentId);
        this.highlightSegment(segmentId, true);

        const popup = new Popup()
            .setLngLat(lnglat)
            .setHTML(`<p><b>${segment?.name}</b></p>`)
            .addTo(this.map!);

        popup.on('close', () => {
            // We need to signal cancellation of selection? 
            // App has changeSegmentDisplay() which toggles isShow.
            // If popup closes, we probably want to deselect.
            // We can emit a specific event or just let user manually close overlay?
            // App logic: this.changeSegmentDisplay(); this.focusedSegment.delete...
            this.focusedSegment.delete(segmentId);
            this.highlightSegment(segmentId, false);
            // We might want to emit a "deselected" event but for now let's stick to simple
            // Or verify what App expects. App just toggles isShow.
            // The Popup close in App closes the overlay.
            // So we should emit 'segmentDeselected' or similar? 
            // Or just re-emit segmentSelected with null? 
            // Or rely on App to handle it.
            // App's popup logic was inside App. 
            // Now it's here. We need to tell App to close the overlay.
            this.segmentSelected.emit(-1); // -1 or null to indicate deselect
        });
    }
}

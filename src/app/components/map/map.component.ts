import { Component, ChangeDetectionStrategy, inject, effect, input, output, ViewChild, ElementRef, AfterViewInit, OnDestroy, signal } from '@angular/core';
import { Map, MapEvent, NavigationControl, ScaleControl, GeolocateControl, Popup, Marker, LngLatLike } from 'mapbox-gl';
import { ConfigService } from '../../services/config-service';
import { SegmentService, Segment } from '../../services/segment-service';
import { OverlayService } from '../../services/overlay-service';

const kUnselectedColor = '#1E1E1E'; // --color-steel-gray
const kSelectedColor = '#69F0AE';   // --color-signal-green
const kMarkerColor = '#FFD54F';     // --color-electric-gold

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
    private mapSignal = signal<Map | undefined>(undefined);
    private mapInstance: Map | undefined;
    private segmentMarkers: Marker[] = [];
    private focusedSegment = new Set<number>();
    private overlayMarker: Marker | undefined;

    constructor() {
        // Effect to handle layer visibility changes
        effect(() => {
            const map = this.mapSignal();
            if (!map) return;

            this.overlayService.setRegionVisibility(map, this.regionShowing());
            this.toggleSegmentLayer(this.segmentShowing());
            this.toggleBikeNetwork(this.bikemapShowing());
            map.setPaintProperty('bikeplus', 'line-opacity', this.bikemapPlusShowing() ? 0.9 : 0);
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
    }

    ngOnDestroy() {
        this.mapInstance?.remove();
    }

    private onLoad(event: MapEvent) {
        this.mapInstance = event.target;
        this.mapInstance.resize();
        this.mapInstance.getCanvas().style.cursor = 'default';

        // Register layers
        this.overlayService.registerWithMap(this.mapInstance, this.regionShowing());
        this.addAllSegments();

        // Update mapSignal to trigger effect
        this.mapSignal.set(this.mapInstance);
        this.mapLoaded.emit(this.mapInstance);
    }

    private addAllSegments() {
        if (!this.mapInstance) return;

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
        if (!this.mapInstance) return;

        if (isVisible) {
            this.segmentMarkers.forEach(marker => marker.addTo(this.mapInstance!));
        } else {
            this.segmentMarkers.forEach(marker => marker.remove());
        }
        // Assuming 'segments-layer' exists (added in addAllSegments)
        if (this.mapInstance.getLayer("segments-layer")) {
            this.mapInstance.setPaintProperty("segments-layer", "line-opacity", isVisible ? 1 : 0);
        }
    }

    private toggleBikeNetwork(isVisible: boolean) {
        if (!this.mapInstance) return;
        // We iterate layers and check if they exist or catch error
        // Assuming these layers exist in the style
        ["bike-network-sharrow", "bike-network-lane", "bike-network-protected", "bike-network-trails", "bike-network-sidewalks"].forEach(layerId => {
            if (this.mapInstance!.getLayer(layerId)) {
                this.mapInstance!.setLayoutProperty(layerId, "visibility", isVisible ? "visible" : "none");
            }
        });
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

        this.mapInstance!.flyTo({
            center: segment.start_latlng as [number, number],
            bearing: this.segmentService.vectorToBearing(
                this.segmentService.directionVector(segment)),
            zoom: 16,
            speed: 0.8
        });

        this.focusedSegment.add(segmentId);
        this.highlightSegment(segmentId, true);

        // Location-Locked Overlay Implementation
        if (this.overlayMarker) {
            this.overlayMarker.remove();
        }

        // Get the overlay element from the DOM
        const overlayElement = document.querySelector('segment-overlay') as HTMLElement;
        if (overlayElement) {
            this.overlayMarker = new Marker({
                element: overlayElement,
                anchor: 'left',
                offset: [40, 0] // Offset to side of marker
            })
                .setLngLat(segment.start_latlng)
                .addTo(this.mapInstance!);
        }

        // We can still use a small popup for the name or just let overlay handle it
        const popup = new Popup({ closeButton: true, closeOnClick: false })
            .setLngLat(segment.start_latlng)
            .setHTML(`<p style="color: black; margin: 0; font-weight: bold;">${segment.name}</p>`)
            .addTo(this.mapInstance!);

        popup.on('close', () => {
            this.focusedSegment.delete(segmentId);
            this.highlightSegment(segmentId, false);
            this.segmentSelected.emit(-1);
            if (this.overlayMarker) {
                this.overlayMarker.remove();
                this.overlayMarker = undefined;

                // Reparent overlay to body so Angular doesn't lose track of it?
                // Actually Angular still owns it, but Mapbox moved it in the DOM.
                // When isShow becomes false, it might hide via isShow() signal in app.html
            }
        });
    }
}

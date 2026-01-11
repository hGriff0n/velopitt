import { Component, signal, inject, ChangeDetectorRef } from '@angular/core';
import { InteractionEvent, Map, MapEvent, Popup, Marker } from 'mapbox-gl';
import * as polyline from '@mapbox/polyline';

import { ConfigService } from './services/config-service';
import { SegmentService, Segment } from './services/segment-service';
import { OverlayService } from './services/overlay-service';

// Oddly, these have to be in all caps
const kUnselectedColor = '#C05D49';
const kSelectedColor = '#EB3915';
const kMarkerColor = '#F59E42';

@Component({
  selector: 'app-root',
  templateUrl: './app.html',
  // eslint-disable-next-line no-restricted-syntax
  standalone: false,
  styleUrl: './app.css'
})
export class App {
  private config = inject(ConfigService);

  protected readonly title = signal('velopitt');
  isShow = false;
  regionShowing = false;
  segmentShowing = false;
  bikemapShowing = true;
  bikemapPlusShowing = false;

  private map: Map | undefined;
  public segment: SegmentService;
  private segmentMarkers: Marker[] = [];
  private overlays: OverlayService;
  private detector: ChangeDetectorRef;
  private focusedSegment = new Set<number>();
  selectedSegment = 0;

  constructor() {
    this.segment = inject(SegmentService);
    this.overlays = inject(OverlayService);
    this.detector = inject(ChangeDetectorRef);
  }

  onLoad(event: MapEvent) {
    this.map = event.target;
    this.map.resize();
    this.map.getCanvas().style.cursor = 'default';

    // The ordering of the layers seems to stop hover events from going to the next layer
    this.overlays.registerWithMap(this.map, this.regionShowing);
    this.addAllSegments();
  }

  // It might make sense later on to split this up again based on
  // what filtering we want to support
  private addAllSegments() {
    if (this.map == null) {
      throw new Error("Map is not loaded");
    }

    this.map.addSource("segments", {
      type: 'geojson',
      generateId: true,
      data: {
        type: 'FeatureCollection',
        features: this.segment.getAllSegments().map(segment => {
          this.segment.updateSegmentMapData(segment.id, this.map as Map);
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

    const map = this.map;
    map.addInteraction(`segment-clicks`, {
      type: 'click',
      target: { layerId: "segments-layer" },
      handler: this.getSegmentEventHandler(),
    });

    map.addInteraction(`segments-hover`, {
      type: 'mouseenter',
      target: { layerId: "segments-layer" },
      handler: (e) => {
        map.getCanvas().style.cursor = 'pointer';
        this.highlightSegment(e.feature?.id as number, true);
      }
    });

    map.addInteraction(`segments-leave`, {
      type: 'mouseleave',
      target: { layerId: "segments-layer" },
      handler: (e) => {
        if (!this.focusedSegment.has(e.feature?.id as number)) {
          this.highlightSegment(e.feature?.id as number, false);
        }
        map.getCanvas().style.cursor = 'default';
      }
    });

    // The "broken" marker seems to be some interaction with moving the mouse, there are times where nothing is showing
    // Might even be something about go beyond a certain zoom level
    // TODO: me - Markers should also have the same mouse behavior
    // This seems to be because the markers aren't part of the layer but there isn't a way to add them directly
    // the preferred approach seems to be using a "symbol layer"
    // Despite the event handler, clicking also doesn't seem to work
    this.segmentMarkers = this.segment.getAllSegments().map(segment => {
      // var popup = new Popup().setText(segment.name).addTo(map);
      // new Marker({color: kMarkerColor}).setLngLat(segment.start_latlng).setPopup(popup);
      return new Marker({ color: kMarkerColor }).setLngLat(segment.start_latlng).on('click', () => {
        const segmentIndex = this.segment.getAllSegments().findIndex(segment => segment.id === segment.id);
        this.handleSegmentClickEvent(segmentIndex, segment.start_latlng);
      });
    });
    this.toggleSegmentLayer();
  }

  private highlightSegment(segmentId: number, isSelected: boolean) {
    this.map?.setFeatureState({
      source: "segments",
      id: segmentId
    }, { selected: isSelected });
  }

  private changeSegmentDisplay() {
    this.isShow = !this.isShow;
    this.detector.detectChanges();
  }

  toggleRegionLayer() {
    this.regionShowing = !this.regionShowing;
    this.overlays.setRegionVisibility(this.map!, this.regionShowing);
  }

  toggleSegmentLayer() {
    this.segmentShowing = !this.segmentShowing;

    // Hide the markers
    // I'd use `toggleClass('hidden')` but that doesn't seem to work
    if (this.segmentShowing) {
      this.segmentMarkers.forEach(marker => marker.addTo(this.map!));
    } else {
      this.segmentMarkers.forEach(marker => marker.remove());
    }

    this.map?.setPaintProperty("segments-layer", "line-opacity", 1 - (this.map?.getPaintProperty("segments-layer", "line-opacity") as number));
  }

  toggleBikeNetwork() {
    console.log(this.map?.getStyle().layers);
    this.bikemapShowing = !this.bikemapShowing;
    for (const layerId of ["bike-network-sharrow", "bike-network-lane", "bike-network-protected", "bike-network-trails", "bike-network-sidewalks"]) {
      this.map?.setLayoutProperty(layerId, "visibility", this.bikemapShowing ? "visible" : "none");
    }
  }

  toggleBikePlus() {
    this.bikemapPlusShowing = !this.bikemapPlusShowing;
    this.overlays.toggleBikePlus(this.map!);
  }

  // TODO: me - This should be moved into the segment-overlay
  // The popup should become the title centered in the screen
  private getSegmentEventHandler() {
    return (e: InteractionEvent) => {
      if (this.map == null) {
        return;
      }
      return this.handleSegmentClickEvent(e.feature?.id as number, e.lngLat);
    }
  }

  private handleSegmentClickEvent(segmentId: number, lnglat: any) {
    const segment = this.segment.getSegmentByDomId(segmentId) as Segment;
    this.selectedSegment = segmentId;
    this.changeSegmentDisplay();

    // TODO: me - This might benefit from bounding box
    // Though the mapbox bounding box isn't fully correct
    this.map!.flyTo({
      center: segment?.start_latlng as [number, number],
      bearing: this.segment.vectorToBearing(
        this.segment.directionVector(segment)),
      // NOTE: I think this gets truncated to 15
      // Either way, it may be a good idea to add a small zoom out when unclicking?
      zoom: 16.5,
      speed: 1
    });

    // TODO: me - Fix this hack to actually center the segment on the screen
    // The current algorithm just takes the vector from the start to the end but that doesn't
    // fully account for how the segment actually curves. This is also a bit because I ended up
    // placing the "large" segment boxes on the left side of the screen.
    const map = this.map!;
    async function waitForMapToStopMoving() {
      while (map.isMoving()) {
        // Wait until the map stops moving and then adjust the camera a little to the side
        await new Promise(resolve => setTimeout(resolve, 1));
      }
    }
    waitForMapToStopMoving().then(() => {
      map.panBy([-100, 0]); // Pan right by 100 pixels
    });

    this.focusedSegment.add(this.selectedSegment);
    this.highlightSegment(this.selectedSegment, true);
    this.detector.detectChanges();

    const popup = new Popup()
      .setLngLat(lnglat)
      .setHTML(`<p><b>${segment?.name}</b></p>`)
      .addTo(this.map!);

    popup.on('close', () => {
      console.log("Popup closed for segment=" + segment?.name);
      this.changeSegmentDisplay();
      this.focusedSegment.delete(this.selectedSegment);
      this.highlightSegment(this.selectedSegment, false);
    });
  };
}

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
  standalone: false,
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('velopitt');
  isExpanded = false;
  isShow = false;

  private map: Map | undefined;
  private segment: SegmentService;
  private overlays: OverlayService;
  private detector: ChangeDetectorRef;
  private focusedSegment = new Set<number>();

  constructor(private config: ConfigService) {
    this.segment = inject(SegmentService);
    this.overlays = inject(OverlayService);
    this.detector = inject(ChangeDetectorRef);
  }

  onLoad(event: MapEvent) {
    this.map = event.target;
    this.map.resize();
    this.map.getCanvas().style.cursor = 'default';

    this.overlays.registerWithMap(this.map);
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
          return {
            type: 'Feature',
            properties: {},
            geometry: polyline.toGeoJSON(segment.map.polyline)
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
      }
    });

    const map = this.map;
    map.addInteraction(`segment-clicks`, {
      type: 'click',
      target: { layerId: "segments-layer" },
      handler: this.handleSegmentClickEvent(),
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
    this.segment.getAllSegments().map(segment => {
      // var popup = new Popup().setText(segment.name).addTo(map);
      // new Marker({color: kMarkerColor}).setLngLat(segment.start_latlng).addTo(map).setPopup(popup);
      new Marker({ color: kMarkerColor }).setLngLat(segment.start_latlng).addTo(map);
    });
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

  private handleSegmentClickEvent() {
    return (e: InteractionEvent) => {
      if (this.map == null) {
        return;
      }

      const featureId = e.feature?.id as number;
      const segment = this.segment.getSegmentByDomId(featureId) as Segment;
      this.changeSegmentDisplay();

      // TODO: me - This might benefit from bounding box
      // Though the mapbox bounding box isn't fully correct
      this.map.flyTo({
        center: segment?.start_latlng as [number, number],
        bearing: this.segment.vectorToBearing(
          this.segment.directionVector(segment)),
        // NOTE: I think this gets truncated to 15
        // Either way, it may be a good idea to add a small zoom out when unclicking?
        zoom: 16.5,
        speed: 1
      });

      this.focusedSegment.add(featureId);
      this.highlightSegment(featureId, true);
      this.detector.detectChanges();

      var popup = new Popup()
        .setLngLat(e.lngLat)
        .setHTML(`<p><b>${segment?.name}</b></p>`)
        .addTo(this.map);

      popup.on('close', () => {
        console.log("Popup closed for segment=" + segment?.name);
        this.changeSegmentDisplay();
        this.focusedSegment.delete(featureId);
        this.highlightSegment(featureId, false);
      });
    };
  }
}
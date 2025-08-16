import { Component, signal, inject } from '@angular/core';
import { InteractionEvent, Map, MapEvent, Popup } from 'mapbox-gl';
import * as polyline from '@mapbox/polyline';

import { ConfigService } from './services/config-service';
// import { StravaService } from './services/strava-service';
import { SegmentService, Segment } from './services/segment-service';
import { StravaService } from './services/strava-service';

// Oddly, these have to be in all caps
const kUnselectedColor = '#B64129';
const kSelectedColor = '#EE4B2B';

@Component({
  selector: 'app-root',
  templateUrl: './app.html',
  standalone: false,
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('velopitt');

  private map: Map | undefined;
  private segment: SegmentService;
  private strava: StravaService;

  constructor(private config: ConfigService) {
    this.segment = inject(SegmentService);
    this.strava = inject(StravaService);
  }

  onLoad(event: MapEvent) {
    this.map = event.target;
    this.map.resize();
    this.map.getCanvas().style.cursor = 'default';

    this.addAllSegments();
  }

  // It might make sense later on to split this up again based on
  // what filtering we want to support
  private addAllSegments() {
    if (this.map == null) {
      throw new Error("Map is not loaded");
    }

    this.map.addSource("segments", {
      type: 'geojson', generateId: true,
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
        this.highlightSegment(e.feature?.id as number, false);
        map.getCanvas().style.cursor = 'default';
      }
    });
  }

  private highlightSegment(segmentId: number, isSelected: boolean) {
    this.map?.setFeatureState({
      source: "segments",
      id: segmentId
    }, { selected: isSelected });
  }

  private handleSegmentClickEvent() {
    return (e: InteractionEvent) => {
      if (this.map == null) {
        return;
      }

      const featureId = e.feature?.id as number;
      const segment = this.segment.getSegmentByDomId(featureId) as Segment;
      this.map.flyTo({
        center: segment?.start_latlng as [number, number],
        bearing: this.segment.vectorToBearing(
          this.segment.directionVector(segment)),
        // NOTE: I think this gets truncated to 15
        // Either way, it may be a good idea to add a small zoom out when unclicking?
        zoom: 16.5,
        speed: 1
      });

      // TODO: me - There needs to be a way to unset the segment
      this.highlightSegment(featureId, true);

      new Popup()
        .setLngLat(e.lngLat)
        .setHTML(`<p><b>${segment?.name}</b></p>`)
        .addTo(this.map);
    };
  }
}
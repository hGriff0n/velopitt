import { Component, signal, inject } from '@angular/core';
import { InteractionEvent, Map, MapEvent, Popup } from 'mapbox-gl';
import * as polyline from '@mapbox/polyline';

import { ConfigService } from './services/config-service';
// import { StravaService } from './services/strava-service';
import { SegmentService, Segment } from './services/segment-service';

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
  private loadedSegments: Segment[] = [];

  constructor(private config: ConfigService) {
    this.segment = inject(SegmentService);
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
        'line-color': '#EE4B2B', 'line-width': [
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
      }
    });

    map.addInteraction(`segments-leave`, {
      type: 'mouseleave',
      target: { layerId: "segments-layer" },
      handler: (e) => {
        map.getCanvas().style.cursor = 'default';
      }
    });
  }

  private handleSegmentClickEvent() {
    return (e: InteractionEvent) => {
      if (this.map == null) {
        return;
      }

      const segment = this.segment.getSegmentByDomId(e.feature?.id as number);
      new Popup()
        .setLngLat(e.lngLat)
        .setHTML(`<p><b>${segment?.name}</b></p>`)
        .addTo(this.map);
    };
  }
}
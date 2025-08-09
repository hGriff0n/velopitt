import { Component, signal, inject } from '@angular/core';
import { Map, MapEvent, Popup } from 'mapbox-gl';
import { Strava, SummarySegment, DetailedSegment } from 'strava';
import * as polyline from '@mapbox/polyline';

import { ConfigService } from './services/config-service';
import { StravaService } from './services/strava-service';

@Component({
  selector: 'app-root',
  templateUrl: './app.html',
  standalone: false,
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('velopitt');

  private strava: StravaService;
  private map: Map | undefined;

  constructor(private config: ConfigService) {
    this.strava = inject(StravaService);
  }

  onLoad(event: MapEvent) {
    this.map = event.target;
    this.map.resize();
    this.map.getCanvas().style.cursor = '';

    this.addSegmentToMap(696322);
    this.addSegmentToMap(815373);
  }

  private addSegmentToMap(id: number) {
    this.strava.getSegment(id).then(
      (segment: DetailedSegment) => {
        const id = "" + segment.id;
        const line = polyline.toGeoJSON(segment.map.polyline);
        this.map?.addSource(id, { type: 'geojson', data: { type: 'Feature', properties: {}, geometry: line } });
        this.map?.addLayer({
          id: id,
          type: 'line',
          source: id,
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
      }
    );
  }
}
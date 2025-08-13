import { Component, signal, inject } from '@angular/core';
import { InteractionEvent, Map, MapEvent, Popup } from 'mapbox-gl';
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
    this.map.getCanvas().style.cursor = 'default';

    this.addSegmentToMap(696322);
    this.addSegmentToMap(815373);
  }

  private addSegmentToMap(id: number) {
    this.strava.getSegment(id).subscribe(segment => {
      if (this.map == null) {
        return;
      }

      const map = this.map;
      const s = Object.fromEntries(Object.entries(segment));
      const id = "" + s['id'];
      const line = polyline.toGeoJSON(s['map']['polyline']);

      // TODO: How would I make a source layer into something that could be dynamically added and removed?
      // ie. How could I make it reactive (or rxjs)
      map.addSource(id, {
        type: 'geojson',
        data: {
          type: 'Feature',
          properties: {},
          geometry: line
        },
        generateId: true,
      });

      map.addLayer({
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

      map.addInteraction(`segment-click-${id}`, {
        type: 'click',
        target: { layerId: id },
        handler: this.handleSegmentClickEvent(s)
      });

      map.addInteraction(`segment-hover-${id}`, {
        type: 'mouseenter',
        target: { layerId: id },
        handler: (e) => {
          map.getCanvas().style.cursor = 'pointer';
        }
      });

      map.addInteraction(`segment-leave-${id}`, {
        type: 'mouseleave',
        target: { layerId: id },
        handler: (e) => {
          map.getCanvas().style.cursor = 'default';
        }
      });
    });
  }

  // TODO: me - It would probably be a better idea to make the segment information referencable from the event itself
  private handleSegmentClickEvent(segment: { [k: string]: any; }) {
    const name = segment['name'];
    return (e: InteractionEvent) => {
      if (this.map == null) {
        return;
      }

      new Popup()
        .setLngLat(e.lngLat)
        .setHTML(`<p><b>${name}</b></p>`)
        .addTo(this.map);
    };
  }
}
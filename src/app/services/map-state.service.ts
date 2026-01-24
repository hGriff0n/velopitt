import { Injectable, signal } from '@angular/core';
import { Map } from 'mapbox-gl';

@Injectable({ providedIn: 'root' })
export class MapStateService {
    private map = signal<Map | undefined>(undefined);

    public readonly zoom = signal(15);
    public readonly center = signal<[number, number]>([-79.997, 40.44]);
    public readonly pitch = signal(70);
    public readonly bearing = signal(90);

    setMap(map: Map) {
        this.map.set(map);

        // Sync initial state
        this.updateState(map);

        map.on('move', () => this.updateState(map));
        map.on('zoom', () => this.updateState(map));
        map.on('rotate', () => this.updateState(map));
        map.on('pitch', () => this.updateState(map));
    }

    private updateState(map: Map) {
        const center = map.getCenter();
        this.center.set([center.lng, center.lat]);
        this.zoom.set(map.getZoom());
        this.pitch.set(map.getPitch());
        this.bearing.set(map.getBearing());
    }

    getMap() {
        return this.map();
    }

    flyTo(options: any) {
        this.map()?.flyTo(options);
    }
}

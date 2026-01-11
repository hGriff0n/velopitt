import { Component, signal, inject, ChangeDetectorRef } from '@angular/core';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { RouterOutlet, RouterLink } from '@angular/router';
import { Map as MapboxMap } from 'mapbox-gl'; // Aliased to avoid collision with global Map

import { AppMapComponent } from './components/map/map.component';
import { SegmentOverlayComponent } from './components/segment/segment-overlay.component';
import { ConfigService } from './services/config-service';
import { SegmentService } from './services/segment-service';

@Component({
  selector: 'app-root',
  templateUrl: './app.html',
  standalone: true,
  imports: [
    MatSidenavModule,
    MatToolbarModule,
    MatIconModule,
    MatListModule,
    RouterOutlet,
    RouterLink,
    AppMapComponent,
    SegmentOverlayComponent
  ],
  styleUrl: './app.css'
})
export class App {
  private config = inject(ConfigService);
  public segment = inject(SegmentService); // Public for template access? Or should be private if not used in template directly?
  // Template likely uses segment.getSegmentByDomId(selectedSegment). Checked app.html: yes.

  protected readonly title = signal('velopitt');
  isShow = false;
  regionShowing = false;
  segmentShowing = false;
  bikemapShowing = true;
  bikemapPlusShowing = false;

  selectedSegment = 0;
  private detector = inject(ChangeDetectorRef);

  constructor() {
    // Services injected via inject()
  }

  onMapLoaded(map: MapboxMap) {
    console.log("Map loaded");
  }

  onSegmentSelected(segmentId: number) {
    if (segmentId === -1) {
      // Deselect
      this.changeSegmentDisplay(false);
      this.selectedSegment = 0;
      return;
    }
    this.selectedSegment = segmentId;
    this.changeSegmentDisplay(true);
    this.detector.detectChanges();
  }

  private changeSegmentDisplay(show: boolean) {
    this.isShow = show;
    this.detector.detectChanges();
  }

  toggleRegionLayer() {
    this.regionShowing = !this.regionShowing;
  }

  toggleSegmentLayer() {
    this.segmentShowing = !this.segmentShowing;
  }

  toggleBikeNetwork() {
    this.bikemapShowing = !this.bikemapShowing;
  }

  toggleBikePlus() {
    this.bikemapPlusShowing = !this.bikemapPlusShowing;
  }
}

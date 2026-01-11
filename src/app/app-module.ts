import { NgModule, provideBrowserGlobalErrorListeners, inject } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatCardModule } from '@angular/material/card';
import { provideMapboxGL } from 'ngx-mapbox-gl';
import { Base64 } from 'js-base64';
import { MatToolbarModule } from '@angular/material/toolbar';

import { ConfigService } from './services/config-service';
import { AppRoutingModule } from './app-routing-module';
import { App } from './app';

// TODO: me - Not sure how to get this from `ConfigService` if it's injected later
import { environment } from '../environments/environment';
import {
  MapComponent,
  ControlComponent,
  FullscreenControlDirective,
} from 'ngx-mapbox-gl';
import { SegmentOverlayComponent } from './components/segment/segment-overlay.component';
import { AppMapComponent } from './components/map/map.component';
import { provideCharts, withDefaultRegisterables } from 'ng2-charts';


@NgModule({
  declarations: [
    App
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule, // NEW: import HttpClientModule!
    // MapComponent, // Removing ngx-mapbox-gl MapComponent from imports as we use AppMapComponent
    AppMapComponent,
    MatCardModule,
    ControlComponent,
    FullscreenControlDirective,
    MatListModule,
    MatSidenavModule,
    MatIconModule,
    MatToolbarModule,
    SegmentOverlayComponent
  ],
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideMapboxGL({ accessToken: Base64.decode(environment.MAPBOX_API_KEY) }),
    provideCharts(withDefaultRegisterables()),
  ],
  bootstrap: [App]
})
export class AppModule {
  private readonly config = inject(ConfigService);
}
import { NgModule, provideBrowserGlobalErrorListeners, inject  } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { provideMapboxGL } from 'ngx-mapbox-gl';
import { MapComponent } from 'ngx-mapbox-gl';

import { ConfigService } from './services/config-service';
import { AppRoutingModule } from './app-routing-module';
import { App, DisplayMapComponent } from './app';

// TODO: me - Not sure how to get this from `ConfigService` if it's injected later
import { environment } from '../environments/environment';

@NgModule({
  declarations: [
    App,
    DisplayMapComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    MapComponent,
    HttpClientModule // NEW: import HttpClientModule!
  ],
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideMapboxGL({accessToken: environment.MAPBOX_API_KEY}),
  ],
  bootstrap: [App]
})
export class AppModule {
  private readonly config = inject(ConfigService);
}